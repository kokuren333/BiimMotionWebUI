import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { root, validId } from "./lib.mjs";
import { sceneSegments } from "./aivis.mjs";
import { CAPTION_RULE_VERSION, captionBox, fitCaption, effectiveStyleMode,
  effectiveSceneStyle, sceneUsesBiimFrame, styleErrors, estimateSpeechSeconds } from "./caption-capacity.mjs";

// CONTRACT §5.3: only the invariant Biim fields (not configurable caption colors/positions).
export const BIIM_STANDARD = {
  preset: "biim-standard-v1", frame: "assets/biim-frame.svg",
  colors: { background: "#1e1e1e", border: "#cccccc", note: "#f4f4f4" },
  fonts: {
    note_top: { family: "Noto Sans JP", weight: 800, size: 44 },
    note_bottom: { family: "Noto Sans JP", weight: 600, size: 34 },
    subtitle: { family: "M PLUS Rounded 1c", weight: 800, size: 64 },
  },
  regions: { main: [16, 16, 1440, 810], note_top: [1498, 34, 388, 182], note_bottom: [1498, 274, 388, 532] },
};
const preFiles = ["project.json", "plan/explanation-map.md", "plan/direction.md", "plan/evidence.json",
  "plan/storyboard.md", "plan/script.md", "plan/narration.json", "reports/qc-review.md"];
const postFiles = ["assets/audio/narration.json", "reports/visual-qa.md", "reports/delivery.md",
  "reports/ghost-check-preview.json", "reports/ghost-check.json", "output/final.mp4"];
const clean = (text) => text.replace(/<!--[\s\S]*?-->/g, "");
const nonempty = (value) => typeof value === "string" && value.trim().length > 0;
const requireThat = (condition, detail) => { if (!condition) throw new Error(detail); };
const blocks = (text, level = 2) => {
  const lines = clean(text).split(/\r?\n/);
  return lines.flatMap((line, i) => {
    const match = line.match(/^(#{1,6}) (.*)$/);
    if (!match || match[1].length !== level) return [];
    let end = i + 1;
    while (end < lines.length && !(new RegExp(`^#{1,${level}} `)).test(lines[end])) end++;
    return [{ title: match[2].trim(), body: lines.slice(i + 1, end).join("\n") }];
  });
};
const section = (text, name) => blocks(text).find((block) =>
  block.title === name || block.title.startsWith(name + "（") || block.title.startsWith(name + "("));
function headings(text, names) {
  for (const name of names) requireThat(nonempty(section(text, name)?.body), `Missing or empty heading: ${name}`);
}
const enumValue = (value, values, label) => requireThat(values.includes(value), `Invalid ${label}: ${value}`);
const stringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === "string");

export async function runQC({ jobRoot = root, stage, project: suppliedProject } = {}) {
  const inputs = {};
  const filePath = (relative) => {
    const resolved = path.resolve(jobRoot, relative);
    requireThat(resolved.startsWith(path.resolve(jobRoot) + path.sep), "Path escapes job");
    return resolved;
  };
  const hash = async (relative) => {
    try {
      const digest = createHash("sha256");
      for await (const chunk of createReadStream(filePath(relative))) digest.update(chunk);
      inputs[relative] = digest.digest("hex");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      inputs[relative] = null;
    }
  };
  const read = async (relative) => {
    if (!(relative in inputs)) await hash(relative);
    return fs.readFile(filePath(relative), "utf8");
  };
  const json = async (relative) => JSON.parse(await read(relative));
  const project = suppliedProject ?? await json("project.json");
  if (project.mode === "mv") return null;
  requireThat(["pre", "post"].includes(stage), "Use --stage=pre|post");
  for (const file of [...preFiles, ...(stage === "post" ? postFiles : [])]) await hash(file);
  const advisories = [];
  const advise = (id, detail, scene_ids) => advisories.push({ id, scope: "all", detail, ...(scene_ids ? { scene_ids } : {}) });
  const optional = async (relative) => { try { return await read(relative); } catch (e) { if (e.code === "ENOENT") return ""; throw e; } };
  const review = clean(await optional("reports/qc-review.md"));
  const reviewMode = review.match(/^review_mode:(?:\s*)(independent|self)\s*$/m)?.[1] ?? "self";
  if (!/^review_mode:(?:\s*)(independent|self)\s*$/m.test(review)) advise("ADV-REVIEW-1", "review_mode missing; recorded as self");
  const waiverLines = section(review, "免除（オーナー記入）")?.body ?? "";
  const waiversById = new Map([...waiverLines.matchAll(/^- WAIVE ((?:PRE|POST)-[0-9]+R?)[:：][ \t]*(\S.*)$/gm)].map((m) => [m[1], m[2]]));
  const waivers = [];
  const gate = async (id, title, fn, kind = "machine", scope = "all") => {
    let result;
    try {
      const value = await fn();
      result = { id, title, kind, scope, status: "pass", detail: "Checks passed", ...value };
    } catch (error) {
      result = { id, title, kind, scope, status: "fail", detail: error.message,
        ...(error.scene_ids ? { scene_ids: error.scene_ids } : {}) };
    }
    if (result.status === "fail" && waiversById.has(id)) {
      result.status = "waived";
      waivers.push({ gate_id: id, reason: waiversById.get(id) });
    }
    return result;
  };
  const reviewGate = (id, title, extra = () => {}) => gate(id, title, () => {
    requireThat([...review.matchAll(/^- \[([ xX])\] ((?:PRE|POST)-[0-9]+R?)[:：][ \t]*(\S.*)$/gm)]
      .some((m) => m[2] === id && /[xX]/.test(m[1])), `Missing checked review line: ${id}`);
    return extra();
  }, "review");
  let evidence;
  let units = [];
  let storyboard = [];
  const scenes = Array.isArray(project.scenes) ? project.scenes : [];
  const captionCheck = (segments) => {
    requireThat(Array.isArray(segments) && segments.length > 0, "Write scenes[].script / dialogue or narration segments before QC");
    const failures = [];
    for (const unit of segments) {
      requireThat(nonempty(unit.text), "Caption text is missing");
      const scene = scenes.find((s) => s.id === unit.scene_id);
      const box = captionBox(project, sceneUsesBiimFrame(project, scene));
      if (!fitCaption(unit.text, box).fits) failures.push({ id: unit.id, scene_id: unit.scene_id, capacity: box.capacity });
    }
    if (failures.length) {
      const error = new Error("Split oversized captions: " + failures.map((item) => `${item.id} (${item.capacity})`).join(", "));
      error.scene_ids = [...new Set(failures.map((item) => item.scene_id).filter(Boolean))];
      throw error;
    }
    return { detail: `${segments.length} caption units fit (provisional rule ${CAPTION_RULE_VERSION})` };
  };
  const pre = [];
  pre.push(await gate("PRE-1", "理解設計の記録", async () => headings(await read("plan/explanation-map.md"),
    ["理解ゴール", "前提知識", "想定される誤解", "主張の一覧", "山場", "扱わない範囲"])));
  pre.push(await gate("PRE-2", "方向性の記録", async () => {
    const text = await read("plan/direction.md");
    headings(text, ["方向性の3案", "採用と理由", "スタイル定義"]);
    const candidates = blocks(section(text, "方向性の3案").body, 3).filter((block) => block.title.startsWith("案"));
    requireThat(candidates.length >= 3 && candidates.every((block) => nonempty(block.body)), "Write three nonempty direction candidates");
  }));
  pre.push(await gate("PRE-3", "根拠台帳の構造", async () => {
    evidence = await json("plan/evidence.json");
    requireThat(evidence.schema_version === "1" && Array.isArray(evidence.sources) && Array.isArray(evidence.claims), "Invalid evidence schema");
    const ids = (items) => {
      const seen = new Set();
      for (const item of items) { validId(item.id); requireThat(!seen.has(item.id) && !item.id.startsWith("EXAMPLE"), "Duplicate or example evidence id"); seen.add(item.id); }
    };
    ids(evidence.sources); ids(evidence.claims);
    for (const source of evidence.sources) {
      enumValue(source.kind, ["file", "url", "web", "common"], "source kind");
      for (const key of ["ref", "title", "accessed", "note"]) requireThat(typeof source[key] === "string", `Source ${source.id}: missing ${key}`);
      requireThat((!source.accessed && ["file", "common"].includes(source.kind)) || /^\d{4}-\d{2}-\d{2}$/.test(source.accessed), "Invalid accessed date");
      if (source.kind === "file") {
        requireThat(source.ref.startsWith("sources/") && !source.ref.includes("\\") && !source.ref.split("/").some((p) => !p || p === "." || p === "..") && !source.ref.includes(":"), "Invalid evidence file ref");
        await read(source.ref);
      }
      if (["url", "web"].includes(source.kind)) requireThat(["http:", "https:"].includes(new URL(source.ref).protocol), "Invalid evidence URL");
      if (source.kind === "web") requireThat(project.research?.allow_web_research !== false, "Additional web research is forbidden");
      if (project.research?.evidence_policy === "supplied-only") {
        requireThat(source.kind !== "web", "supplied-only forbids web sources");
        if (source.kind !== "common") requireThat(project.sources?.some((s) => s.kind === source.kind && (s.path ?? s.url) === source.ref), "Evidence source is not supplied: " + source.id);
      }
    }
    for (const claim of evidence.claims) {
      requireThat(nonempty(claim.text), "Claim text missing");
      enumValue(claim.kind, ["fact", "number", "formula", "definition", "quote", "chart"], "claim kind");
      enumValue(claim.status, ["verified", "hedged"], "claim status");
      requireThat(stringArray(claim.scene_ids) && stringArray(claim.source_ids), "Claim IDs must be string arrays");
      for (const key of ["locator", "note", "check"]) requireThat(typeof claim[key] === "string", `Claim ${claim.id}: missing ${key}`);
      const sources = claim.source_ids.map((id) => evidence.sources.find((s) => s.id === id));
      if (claim.status === "verified") requireThat(sources.length > 0 && sources.every(Boolean), "Verified claim needs resolvable source_ids: " + claim.id);
      if (["number", "formula", "chart", "quote"].includes(claim.kind)) requireThat(sources.some((s) => s && s.kind !== "common") && nonempty(claim.check), "Numeric/formula/chart/quote claim needs a non-common source and check: " + claim.id);
      const unknown = claim.scene_ids.filter((id) => !scenes.some((s) => s.id === id));
      if (unknown.length) advise("ADV-PRE-4", `${claim.id}: unknown scenes ${unknown.join(", ")}`, unknown);
    }
  }));
  if (stage === "pre") {
    pre.push(await reviewGate("PRE-4", "台本と根拠の整合"));
    pre.push(await reviewGate("PRE-5", "数式・数値・図解の正確さ"));
  }
  const noVoice = project.voice?.engine === "none";
  const notApplicable = { status: "not-applicable", detail: "No applicable scenes or voice" };
  pre.push(await gate("PRE-6", "字幕帯域", async () => {
    if (noVoice) return notApplicable;
    const narration = await optional("plan/narration.json");
    const planned = narration ? JSON.parse(narration).segments : [];
    requireThat(Array.isArray(planned), "narration segments must be an array");
    units = planned.length ? planned : sceneSegments(project);
    return captionCheck(units);
  }));
  pre.push(await gate("PRE-7", "ストーリーボードの様式", async () => {
    const errors = styleErrors(project);
    requireThat(!errors.length, errors.join("; "));
    storyboard = blocks(await read("plan/storyboard.md")).filter((block) => block.title.startsWith("場面 "));
    const ids = storyboard.map((block) => block.title.slice(3).trim());
    requireThat(ids.length > 0 && new Set(ids).size === ids.length && new Set(scenes.map((s) => s.id)).size === scenes.length &&
      ids.length === scenes.length && ids.every((id) => scenes.some((s) => s.id === id)), "Storyboard scene IDs must match project.scenes exactly");
    const types = ["因果", "手順", "比較対照", "分類・階層", "定義", "量・規模", "時系列・変遷", "論証", "抽象→具体", "数式", "誤解の訂正"];
    for (const block of storyboard) {
      const id = block.title.slice(3).trim(); validId(id);
      requireThat(!id.startsWith("EXAMPLE"), "Example storyboard scene remains");
      const fields = Object.fromEntries([...block.body.matchAll(/^- (.+?)[:：][ \t]*(.*)$/gm)].map((m) => [m[1].replace(/\s/g, ""), m[2].trim()]));
      block.fields = fields;
      requireThat(nonempty(fields["説明目的"]), `${id}: missing 説明目的`);
      requireThat(nonempty(fields["構造型"]) && fields["構造型"].split(/[、,]/).every((type) => types.includes(type.trim()) || /^その他[:：]\s*\S/.test(type.trim())), `${id}: invalid 構造型`);
      requireThat(nonempty(fields["根拠ID"]) && (fields["根拠ID"] === "なし" || fields["根拠ID"].split(/[、,]/).every((claim) => evidence?.claims?.some((c) => c.id === claim.trim()))), `${id}: unknown 根拠ID`);
      const scene = scenes.find((s) => s.id === id);
      requireThat(fields["様式"] === effectiveSceneStyle(project, scene), `${id}: storyboard style mismatch`);
      requireThat(["Biim枠", "全画面"].includes(fields["レイアウト"]) && (fields["レイアウト"] !== "Biim枠" || sceneUsesBiimFrame(project, scene)), `${id}: invalid レイアウト`);
      if (Number(fields["新規概念の数"]) >= 2) advise("ADV-PRE-2", `${id}: two or more new concepts`, [id]);
      const missing = ["時刻の目安", "画面状態", "ナレーション要旨", "新規概念の数", "キャラの演技", "密度と変化率", "BGM・SE", "必要素材"].filter((key) => !nonempty(fields[key]));
      if (missing.length) advise("ADV-PRE-5", `${id}: missing advisory fields ${missing.join(", ")}`, [id]);
    }
    if (new Set(storyboard.map((b) => b.fields["構造型"])).size === 1) advise("ADV-PRE-3", "All scenes use the same structure; check visual development");
  }));
  pre.push(await gate("PRE-8", "Biim 場面の標準", () => {
    const framed = scenes.filter((s) => effectiveSceneStyle(project, s) === "biim" && sceneUsesBiimFrame(project, s));
    if (!framed.length) return notApplicable;
    const compare = (expected, actual, prefix) => {
      for (const [key, value] of Object.entries(expected)) {
        if (value && typeof value === "object" && !Array.isArray(value)) compare(value, actual?.[key], prefix + key + ".");
        else requireThat(JSON.stringify(actual?.[key]) === JSON.stringify(value), "Restore Biim standard: " + prefix + key);
      }
    };
    compare(BIIM_STANDARD, project.layout, "layout.");
    return { scene_ids: framed.map((s) => s.id) };
  }, "machine", "biim-scenes"));
  if (units.length) {
    const seconds = estimateSpeechSeconds(units.map((u) => u.text).join(""), project.voice?.speed ?? 1);
    if (Math.abs(seconds - project.video.target_duration_sec) >= project.video.target_duration_sec * 0.3)
      advise("ADV-PRE-1", `Estimated speech ${seconds.toFixed(1)}s (目安) differs from target by at least 30%`);
  }
  if (!section(await optional("plan/script.md"), "読み")) advise("ADV-PRE-6", "No pronunciation heading in plan/script.md");
  let gates = pre;
  if (stage === "post") {
    gates = [];
    gates.push(await gate("POST-1", "構造", () => {
      const result = spawnSync(process.execPath, [path.join(jobRoot, "runtime/scripts/validate.mjs"), "--final"], { cwd: path.join(jobRoot, "runtime"), encoding: "utf8" });
      requireThat(!result.error && result.status === 0, "validate --final failed: " + (result.error?.message ?? result.stdout + result.stderr));
    }));
    // validate's advisory scan may refresh the final ghost report. Record the bytes actually inspected below.
    await hash("reports/ghost-check.json");
    gates.push(await gate("POST-2", "事前項目の再検査", () => ({
      status: pre.some((item) => item.status === "fail") ? "fail" : "pass",
      detail: pre.filter((item) => item.status === "fail").map((item) => `${item.id}: ${item.detail}`).join("; ") || "Preflight machine checks passed",
      items: pre.map(({ id, status, detail }) => ({ id, status, detail })),
    })));
    let narration;
    gates.push(await gate("POST-3", "ナレーション同期", async () => {
      if (noVoice) return notApplicable;
      narration = await json("assets/audio/narration.json");
      requireThat(Array.isArray(narration.clips), "Narration clips must be an array");
      let end = 0;
      const total = scenes.reduce((sum, scene) => sum + scene.duration_sec, 0);
      requireThat(Number.isFinite(total), "Invalid scene durations");
      for (const clip of narration.clips) {
        requireThat(Number.isFinite(clip.start_sec) && clip.start_sec >= 0 && Number.isFinite(clip.duration_sec) && clip.duration_sec > 0, "Invalid narration timing");
        requireThat(clip.start_sec >= end - 0.001, "Overlapping narration: " + clip.id);
        end = clip.start_sec + clip.duration_sec;
        requireThat(end <= total, "Narration ends after video: " + clip.id);
      }
      for (const scene of scenes) {
        const clips = narration.clips.filter((clip) => clip.scene_id === scene.id);
        if (nonempty(scene.script) || scene.dialogue?.length) requireThat(clips.length > 0, "Missing scene narration: " + scene.id);
        requireThat(clips.reduce((sum, clip) => sum + clip.duration_sec, 0) <= scene.duration_sec + 0.1, "Narration exceeds scene duration: " + scene.id);
      }
    }));
    gates.push(await gate("POST-4", "字幕の実表示（機械）", async () => noVoice ? notApplicable : captionCheck((narration ?? await json("assets/audio/narration.json")).clips)));
    gates.push(await reviewGate("POST-4R", "字幕の実表示（レビュー）"));
    const qa = await optional("reports/visual-qa.md");
    gates.push(await gate("POST-5", "ゴースト走査の実施と照合（機械）", async () => {
      const finalStat = await fs.stat(filePath("output/final.mp4"));
      for (const target of ["preview", "final"]) {
        const name = `reports/ghost-check${target === "preview" ? "-preview" : ""}.json`;
        const report = await json(name);
        requireThat(report.kind === "biim-ghost-check" && Array.isArray(report.isolated), "Missing or invalid ghost scan: " + target);
        if (target === "final") requireThat((await fs.stat(filePath(name))).mtimeMs >= finalStat.mtimeMs, "Final ghost scan is older than final.mp4");
        const records = [...clean(qa).matchAll(/^- GHOST (final|preview) f?([0-9]+)[:：][ \t]*(ゴースト|意図した表示|誤検出)([ \t].*)?\r?$/gm)];
        for (const event of report.isolated) {
          requireThat(Number.isSafeInteger(event.frame) && event.frame >= 0, "Invalid isolated frame");
          requireThat(records.some((m) => m[1] === target && Number(m[2]) === event.frame), `Record isolated flash: ${target} f${event.frame}`);
        }
        requireThat(!records.some((m) => m[3] === "ゴースト"), "Unresolved ghost remains in visual QA");
        advise("ADV-POST-1", `${target}: isolated ${report.isolated.length}, clustered runs ${report.clustered?.length ?? 0}`);
      }
    }));
    gates.push(await reviewGate("POST-5R", "ゴースト走査の照合（レビュー）"));
    gates.push(await reviewGate("POST-6", "通し視聴", () => {
      requireThat(nonempty(qa) && !qa.includes("未確認"), "visual-qa.md missing or contains 未確認");
    }));
    gates.push(await reviewGate("POST-7", "図と読み上げの一致"));
    gates.push(await gate("POST-8", "納品記録", async () => {
      const text = await read("reports/delivery.md");
      headings(text, ["実際の尺", "出典リスト", "チャプター", "未生成素材"]);
      if (!section(text, "チャプター").body.trim().startsWith("0:00")) advise("ADV-POST-3", "First chapter should start at 0:00");
    }));
    const volume = spawnSync("ffmpeg", ["-hide_banner", "-i", filePath("output/final.mp4"), "-af", "volumedetect", "-vn", "-sn", "-dn", "-f", "null", "-"], { encoding: "utf8", timeout: 30000 });
    const measurements = volume.stderr?.match(/(?:mean|max)_volume: [^\r\n]+/g);
    advise("ADV-POST-2", measurements?.join(", ") ?? "音量は測定できず");
  }
  const report = { schema_version: "1", kind: "biim-explainer-qc", stage, mode: "explanation",
    style_mode: effectiveStyleMode(project), verdict: gates.some((g) => g.status === "fail") ? "fail" : "pass",
    gates, advisories, review_mode: reviewMode, waivers, inputs,
    rule_versions: { caption_capacity: CAPTION_RULE_VERSION }, generated_at: new Date().toISOString() };
  await fs.mkdir(filePath("reports"), { recursive: true });
  await fs.writeFile(filePath(`reports/qc-${stage}.json`), JSON.stringify(report, null, 2) + "\n");
  const cell = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", "<br>");
  const markdown = [`# QC ${stage}`, `判定: ${report.verdict}`, "", `review_mode: ${reviewMode}`, "",
    "| ID | 名称 | 種別 | 適用範囲 | 状態 | 説明 |", "| --- | --- | --- | --- | --- | --- |",
    ...gates.map((g) => `| ${[g.id, g.title, g.kind, g.scope, g.status, g.detail].map(cell).join(" | ")} |`),
    "", "## 助言", ...advisories.map((a) => `- ${a.id}: ${a.detail}`), "", "## 免除", ...waivers.map((w) => `- ${w.gate_id}: ${w.reason}`), ""];
  await fs.writeFile(filePath(`reports/qc-${stage}.md`), markdown.join("\n"));
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const project = JSON.parse(await fs.readFile(path.join(root, "project.json"), "utf8"));
    if (project.mode === "mv") console.log("この版に MV の規則は無い。MV は AGENTS.md の MV 制作工程に従う");
    else {
      const stage = process.argv.find((arg) => arg.startsWith("--stage="))?.slice(8);
      if (!["pre", "post"].includes(stage)) throw new Error("Use --stage=pre|post");
      const report = await runQC({ stage });
      console.log(`QC ${stage}: ${report.verdict} — reports/qc-${stage}.json`);
      process.exitCode = report.verdict === "pass" ? 0 : 1;
    }
  } catch (error) {
    console.error("Usage: npm run qc -- --stage=pre|post\n" + error.message);
    process.exitCode = 2;
  }
}
