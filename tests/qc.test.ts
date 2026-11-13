import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { runQC, BIIM_STANDARD } from "../job-template/runtime/scripts/qc.mjs";
import { createProject, defaults, switchVideoMode } from "../src/job.ts";
import { wavBuffer } from "../job-template/runtime/scripts/lib.mjs";
import { captionBox, candidateCaptionBoxes, fitCaption, textWidth, splitCaptionUnits,
  estimateSpeechSeconds, effectiveStyleMode, effectiveSceneStyle, sceneUsesBiimFrame,
  styleErrors } from "../job-template/runtime/scripts/caption-capacity.mjs";

const projectFor = (changes = {}) => createProject({ ...defaults, title: "QC fixture",
  description: "説明", audience: "開発者", ...changes }, { sources: [] });

test("caption rule uses provisional geometry for solo, duo, fullscreen and portrait", () => {
  const solo = projectFor();
  assert.equal(captionBox(solo, true).capacity, 46);
  assert.equal(captionBox(projectFor({ characterMode: "duo" }), true).capacity, 38);
  assert.equal(captionBox(projectFor({ characterPosition: "right" }), true).capacity, 48);
  assert.equal(captionBox(projectFor({ characterUsage: "none" }), true).capacity, 54);
  assert.equal(captionBox(solo, false).capacity, 32);
  assert.equal(captionBox(projectFor({ width: 1080, height: 1920 }), false).capacity, 34);
  assert.equal(candidateCaptionBoxes(solo).length, 2);
});

// These small jobs isolate QC records from rendering and external synthesis.
async function qcJob(t, style = "biim", voice = true) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "biim-qc-test-"));
  t.after(async () => {
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep));
    await fs.rm(directory, { recursive: true, force: true });
  });
  const project = projectFor({ fullScreen: ["anime", "motion"].includes(style) });
  project.direction.style_mode = style;
  if (!voice) project.voice.engine = "none";
  project.scenes = [{ id: "s1", style: style === "mixed" ? "biim" : style,
    biim: ["biim", "mixed"].includes(style), duration_sec: 3, script: "短い説明です。", note_top: "要点", note_bottom: "補足" }];
  if (style === "mixed") project.scenes.push({ id: "s2", style: "motion", biim: false, duration_sec: 3, script: "図が変わります。" });
  const write = async (file, value) => {
    await fs.mkdir(path.dirname(path.join(directory, file)), { recursive: true });
    await fs.writeFile(path.join(directory, file), typeof value === "string" || Buffer.isBuffer(value) ? value : JSON.stringify(value));
  };
  const evidence = { schema_version: "1", sources: [{ id: "S1", kind: "common", ref: "", title: "共有知識", accessed: "", note: "" }],
    claims: [{ id: "C1", kind: "fact", text: "図で説明する", status: "verified", source_ids: ["S1"], scene_ids: ["s1"], locator: "", check: "", note: "" }] };
  const review = "review_mode: independent\nreviewer: test fixture\n- [x] PRE-4: fixture review\n- [x] PRE-5: fixture accuracy\n";
  await write("project.json", project);
  await write("plan/explanation-map.md", ["理解ゴール", "前提知識", "想定される誤解", "主張の一覧", "山場", "扱わない範囲"].map((h) => `## ${h}\n説明本文\n`).join("\n"));
  await write("plan/direction.md", "## 方向性の3案\n### 案1 図解\n因果を描く\n### 案2 実演\n手順を描く\n### 案3 対話\n比較する\n## 採用と理由\n因果が適切\n## スタイル定義\n様式と文字階層を固定\n");
  await write("plan/evidence.json", evidence);
  await write("plan/storyboard.md", project.scenes.map((s) => `## 場面 ${s.id}\n- 説明目的: 図の変化を理解する\n- 構造型: 因果\n- 根拠 ID： C1\n- 様式: ${s.style}\n- レイアウト: ${s.biim ? "Biim枠" : "全画面"}\n`).join("\n"));
  await write("plan/script.md", "台本を別コンテキストで確認するテスト用記録です。\n## 読み\nなし\n");
  await write("reports/qc-review.md", review);
  const run = (stage = "pre") => runQC({ jobRoot: directory, stage });
  const save = () => write("project.json", project);
  return { directory, project, evidence, review, write, run, save };
}
const status = (report, id) => report.gates.find((gate) => gate.id === id)?.status;

test("QC pre writes the contract, hashes inspected inputs and never rewrites reviews", async (t) => {
  const job = await qcJob(t);
  const result = await job.run();
  assert.equal(result.verdict, "pass");
  assert.equal(result.schema_version, "1");
  assert.equal(result.kind, "biim-explainer-qc");
  assert.equal(result.review_mode, "independent");
  assert.equal(result.style_mode, "biim");
  assert.equal(result.rule_versions.caption_capacity, "1");
  assert.equal(result.inputs["plan/narration.json"], null);
  assert.equal(result.inputs["project.json"], createHash("sha256").update(await fs.readFile(path.join(job.directory, "project.json"))).digest("hex"));
  assert.equal(await fs.readFile(path.join(job.directory, "reports/qc-review.md"), "utf8"), job.review);
  assert.match(await fs.readFile(path.join(job.directory, "reports/qc-pre.md"), "utf8"), /^# QC pre\n判定: pass/);
  assert.ok(result.gates.every((gate) => ["machine", "review"].includes(gate.kind) && ["all", "biim-scenes"].includes(gate.scope) && gate.detail));
  assert.equal(status(result, "PRE-8"), "pass");
  assert.ok(result.advisories.length > 0); // advisory omissions do not block a pass
});

test("QC evidence rejects unresolved claims, common numeric claims even hedged, and forbidden web sources", async (t) => {
  const job = await qcJob(t);
  const claim = job.evidence.claims[0];
  claim.source_ids = [];
  await job.write("plan/evidence.json", job.evidence);
  assert.equal(status(await job.run(), "PRE-3"), "fail");
  claim.source_ids = ["S1"]; claim.status = "hedged"; claim.kind = "number";
  await job.write("plan/evidence.json", job.evidence);
  assert.equal(status(await job.run(), "PRE-3"), "fail");
  claim.kind = "fact"; claim.status = "verified";
  job.evidence.sources[0] = { id: "S1", kind: "web", ref: "https://example.org/source", title: "資料", accessed: "2026-11-13", note: "" };
  job.project.research.evidence_policy = "supplied-only";
  await job.save(); await job.write("plan/evidence.json", job.evidence);
  assert.equal(status(await job.run(), "PRE-3"), "fail");
  job.project.research.evidence_policy = "web-primary";
  job.project.research.allow_web_research = false;
  await job.save();
  assert.equal(status(await job.run(), "PRE-3"), "fail");
});

test("QC requires checked review lines and accepts waiver lines only in the owner's section", async (t) => {
  const job = await qcJob(t);
  const missing = job.review.replace("- [x] PRE-4: fixture review\n", "");
  await job.write("reports/qc-review.md", missing + "\n## エージェント\n- WAIVE PRE-4: unavailable\n");
  let result = await job.run();
  assert.equal(result.verdict, "fail"); assert.equal(status(result, "PRE-4"), "fail"); assert.deepEqual(result.waivers, []);
  await job.write("reports/qc-review.md", missing + "\n## 免除（オーナー記入）\n- WAIVE PRE-4: fixture owner authorization\n- WAIVE PRE-5: unnecessary\n");
  result = await job.run();
  assert.equal(result.verdict, "pass"); assert.equal(status(result, "PRE-4"), "waived");
  assert.deepEqual(result.waivers, [{ gate_id: "PRE-4", reason: "fixture owner authorization" }]);
  await job.write("reports/qc-review.md", job.review.replace("review_mode: independent\n", "").replace("[x] PRE-5", "[ ] PRE-5"));
  result = await job.run();
  assert.equal(result.review_mode, "self"); assert.equal(status(result, "PRE-5"), "fail");
  assert.ok(result.advisories.some((a) => a.id === "ADV-REVIEW-1"));
});

for (const style of ["biim", "anime", "motion", "mixed"]) {
  test(`QC ${style} scopes Biim checks and enforces caption capacity`, async (t) => {
    const job = await qcJob(t, style);
    if (["anime", "motion"].includes(style)) {
      job.project.layout.preset = "custom";
      job.project.layout.fonts.subtitle.size = 100;
      delete job.project.scenes[0].note_top;
    }
    await job.save();
    let result = await job.run();
    assert.equal(result.verdict, "pass");
    assert.equal(status(result, "PRE-8"), ["anime", "motion"].includes(style) ? "not-applicable" : "pass");
    job.project.scenes.at(-1).script = "長".repeat(100) + "。";
    await job.save();
    result = await job.run();
    assert.equal(result.verdict, "fail"); assert.equal(status(result, "PRE-6"), "fail");
    assert.equal(result.gates.find((g) => g.id === "PRE-6").scope, "all");
    if (style === "mixed") {
      job.project.scenes[0].biim = false; // all frames disabled -> PRE-8 must become inapplicable
      job.project.layout.preset = "custom";
      await job.save();
      assert.equal(status(await job.run(), "PRE-8"), "not-applicable");
      job.project.scenes[0].biim = true;
      await job.save();
      result = await job.run();
      assert.equal(status(result, "PRE-8"), "fail");
    }
  });
}

test("QC uses narration overrides, ignores comment-only headings and rejects inconsistent storyboard styles", async (t) => {
  const job = await qcJob(t, "mixed");
  await job.write("plan/narration.json", { segments: [{ id: "n1", scene_id: "s2", text: "あ".repeat(33) }] });
  assert.equal(status(await job.run(), "PRE-6"), "fail"); // fullscreen 32, Biim 46
  await job.write("plan/explanation-map.md", "## 理解ゴール\n<!-- not filled -->\n");
  assert.equal(status(await job.run(), "PRE-1"), "fail");
  job.project.scenes[1].biim = true;
  await job.save();
  assert.equal(status(await job.run(), "PRE-7"), "fail");
});

test("QC Biim standard constants match the repository standard", async () => {
  const standard = JSON.parse(await fs.readFile("src/biim-standard.json", "utf8"));
  const subset = (expected, actual) => {
    for (const [key, value] of Object.entries(expected)) {
      if (value && typeof value === "object" && !Array.isArray(value)) subset(value, actual[key]);
      else assert.deepEqual(actual[key], value);
    }
  };
  subset(BIIM_STANDARD, standard);
});

async function postJob(t, voice = true) {
  const job = await qcJob(t, "mixed", voice);
  await job.write("assets/audio/narration.json", { clips: job.project.scenes.map((s, i) => ({ id: s.id, scene_id: s.id, text: s.script, start_sec: i * 3, duration_sec: 2 })) });
  await job.write("output/final.mp4", "unit test container");
  const report = { kind: "biim-ghost-check", isolated: [{ frame: 10 }], clustered: [] };
  await job.write("reports/ghost-check-preview.json", report);
  await job.write("reports/ghost-check.json", report);
  await job.write("reports/visual-qa.md", "音とともに最後まで確認した。\n- GHOST final f10: 意図した表示\n- GHOST preview f10: 誤検出\n");
  await job.write("reports/delivery.md", ["実際の尺", "出典リスト", "チャプター", "未生成素材"].map((h) => `## ${h}\n${h === "チャプター" ? "0:00 説明" : "記録あり"}\n`).join("\n"));
  await job.write("reports/qc-review.md", job.review + ["POST-4R", "POST-5R", "POST-6", "POST-7"].map((id) => `- [x] ${id}: fixture review`).join("\n"));
  // Isolate child-process orchestration; real validate behavior is tested below separately.
  await job.write("runtime/scripts/validate.mjs", "if (!process.argv.includes('--final')) process.exit(9);\n");
  return job;
}

test("QC post rechecks preflight, validates narration, still reviews, ghost reconciliation and delivery", async (t) => {
  const job = await postJob(t);
  let result = await job.run("post");
  assert.equal(result.verdict, "pass", JSON.stringify(result.gates.filter((g) => g.status === "fail")));
  assert.equal(result.gates.length, 10);
  assert.equal(result.gates.find((g) => g.id === "POST-2").items.length, 6);
  await job.write("reports/visual-qa.md", "- GHOST final f10: 意図した表示\n");
  result = await job.run("post");
  assert.equal(status(result, "POST-5"), "fail"); // preview reconciliation is blocking
  await job.write("reports/visual-qa.md", "未確認\n- GHOST preview f10: ゴースト\n- GHOST final f10: 誤検出\n");
  result = await job.run("post");
  assert.equal(status(result, "POST-5"), "fail"); assert.equal(status(result, "POST-6"), "fail");
  await job.write("runtime/scripts/validate.mjs", "process.exit(1);\n");
  assert.equal(status(await job.run("post"), "POST-1"), "fail");
});

test("QC post rejects missing scene speech, overlapping/cut speech and oversized rendered captions", async (t) => {
  const job = await postJob(t);
  await job.write("assets/audio/narration.json", { clips: [{ id: "a", scene_id: "s1", start_sec: 0, duration_sec: 2, text: "短い" }] });
  assert.equal(status(await job.run("post"), "POST-3"), "fail");
  await job.write("assets/audio/narration.json", { clips: [
    { id: "a", scene_id: "s1", start_sec: 0, duration_sec: 3.2, text: "短い" },
    { id: "b", scene_id: "s2", start_sec: 3, duration_sec: 4, text: "長".repeat(100) },
  ] });
  const result = await job.run("post");
  assert.equal(status(result, "POST-3"), "fail"); assert.equal(status(result, "POST-4"), "fail");
  job.project.scenes[0].script = "長".repeat(100);
  await job.save();
  assert.equal(status(await job.run("post"), "POST-2"), "fail");
});

test("QC no-voice jobs mark automatic caption/sync gates inapplicable", async (t) => {
  const job = await postJob(t, false);
  const pre = await job.run();
  assert.equal(status(pre, "PRE-6"), "not-applicable");
  const post = await job.run("post");
  assert.equal(status(post, "POST-3"), "not-applicable");
  assert.equal(status(post, "POST-4"), "not-applicable");
});

test("QC post requires a current final scan, all review rows and delivery headings", async (t) => {
  const job = await postJob(t);
  const stale = new Date(Date.now() - 60000);
  await fs.utimes(path.join(job.directory, "reports/ghost-check.json"), stale, stale);
  let result = await job.run("post");
  assert.equal(status(result, "POST-5"), "fail");
  assert.match(result.gates.find((g) => g.id === "POST-5").detail, /older/);
  await job.write("reports/qc-review.md", job.review);
  await job.write("reports/delivery.md", "## 実際の尺\n6秒\n");
  result = await job.run("post");
  for (const id of ["POST-4R", "POST-5R", "POST-6", "POST-7", "POST-8"]) assert.equal(status(result, id), "fail");
});

test("QC post enforces scene tolerance and total duration independently of overlap", async (t) => {
  const job = await postJob(t);
  const clips = [
    { id: "a", scene_id: "s1", start_sec: 0, duration_sec: 3.11, text: "短い" },
    { id: "b", scene_id: "s2", start_sec: 3.2, duration_sec: 1, text: "短い" },
  ];
  await job.write("assets/audio/narration.json", { clips });
  let result = await job.run("post");
  assert.match(result.gates.find((g) => g.id === "POST-3").detail, /scene duration/);
  clips[0].duration_sec = 3.1;
  await job.write("assets/audio/narration.json", { clips });
  assert.equal(status(await job.run("post"), "POST-3"), "pass");
  clips[1].start_sec = 6;
  await job.write("assets/audio/narration.json", { clips });
  result = await job.run("post");
  assert.match(result.gates.find((g) => g.id === "POST-3").detail, /ends after video/);
});

test("QC CLI exits 1 on a failed gate, 2 on usage errors, and MV exits 0 without reports", async (t) => {
  const job = await qcJob(t);
  await fs.cp("job-template/runtime/scripts", path.join(job.directory, "runtime/scripts"), { recursive: true });
  const cli = (...args) => spawnSync(process.execPath, [path.join(job.directory, "runtime/scripts/qc.mjs"), ...args], { encoding: "utf8" });
  assert.equal(cli().status, 2);
  assert.equal(cli("--stage=bad").status, 2);
  assert.equal(cli("--stage=pre").status, 0);
  await job.write("reports/qc-review.md", "");
  assert.equal(cli("--stage=pre").status, 1);
  await fs.rm(path.join(job.directory, "reports/qc-pre.json"));
  await fs.rm(path.join(job.directory, "reports/qc-pre.md"));
  job.project.mode = "mv"; await job.save();
  for (const args of [[], ["--stage=post"]]) {
    const result = cli(...args);
    assert.equal(result.status, 0); assert.match(result.stdout, /この版に MV の規則は無い/);
  }
  await assert.rejects(fs.access(path.join(job.directory, "reports/qc-pre.json")));
  await assert.rejects(fs.access(path.join(job.directory, "reports/qc-post.json")));
});

async function validationJob(t, style = "biim") {
  const job = await qcJob(t, style, false);
  await fs.cp("job-template/runtime/scripts", path.join(job.directory, "runtime/scripts"), { recursive: true });
  // Execute the installed compiler on a minimal program to isolate record validation.
  // The complete generated runtime is typechecked by the fixture verification commands.
  await fs.symlink(path.resolve("node_modules"), path.join(job.directory, "node_modules"), "junction");
  await job.write("runtime/tsconfig.json", { compilerOptions: { types: [], skipLibCheck: true }, files: ["check.ts"] });
  await job.write("runtime/check.ts", "export const structuralFixture: number = 1;\n");
  for (const file of [job.project.layout.frame, ...Object.values(job.project.layout.fonts).map((f) => f.path)].filter(Boolean)) await job.write(file, "fixture asset");
  for (const file of ["plan/script.md", "plan/storyboard.md", "plan/sources.md", "reports/visual-qa.md", "reports/delivery.md"]) await job.write(file, "Completion record for structural testing. ".repeat(3));
  const mp4 = Buffer.alloc(2048); mp4.write("ftyp", 4);
  await job.write("output/preview.mp4", mp4); await job.write("output/final.mp4", mp4);
  const validate = () => spawnSync(process.execPath, [path.join(job.directory, "runtime/scripts/validate.mjs"), "--final"], { cwd: path.join(job.directory, "runtime"), encoding: "utf8" });
  return { ...job, validate };
}

for (const style of ["biim", "anime", "motion", "mixed"]) {
  test(`validate final ${style} requires explainer design records and scopes note fields`, async (t) => {
    const job = await validationJob(t, style);
    if (["anime", "motion"].includes(style)) {
      delete job.project.scenes[0].note_top; delete job.project.scenes[0].note_bottom;
    }
    await job.save();
    let result = job.validate();
    assert.equal(result.status, 0, result.stdout + result.stderr);
    if (["biim", "mixed"].includes(style)) {
      delete job.project.scenes[0].note_top; await job.save();
      result = job.validate(); assert.equal(result.status, 1); assert.match(result.stderr, /note_top/);
      job.project.scenes[0].note_top = "要点"; await job.save();
    }
    if (style === "biim") {
      for (const file of ["plan/explanation-map.md", "plan/direction.md", "plan/evidence.json"]) {
        const content = await fs.readFile(path.join(job.directory, file));
        await fs.rm(path.join(job.directory, file));
        result = job.validate(); assert.equal(result.status, 1); assert.ok(result.stderr.replaceAll("\\", "/").includes(file), result.stderr);
        await job.write(file, content);
      }
      await job.write("plan/evidence.json", { sources: null, claims: [], note: "invalid evidence array test" });
      result = job.validate(); assert.equal(result.status, 1); assert.match(result.stderr, /must be arrays/);
    }
    if (style === "mixed") {
      delete job.project.scenes[1].style; await job.save();
      result = job.validate(); assert.equal(result.status, 1); assert.match(result.stderr, /scene style/);
    }
  });
}

test("validate final MV retains its original records and does not require explainer records", async (t) => {
  const job = await validationJob(t);
  const mv = createProject({ ...switchVideoMode({ ...defaults, title: "MV structural fixture", description: "mv", audience: "developers" }, "mv"), musicDurationSec: 6.25 }, { sources: [], music: { name: "music.wav", size: 600044, data: new Uint8Array(0), type: "audio/wav" } });
  mv.audio.music = "assets/audio/music.wav";
  mv.scenes = [{ id: "s1", duration_sec: 6.25 }];
  await job.write("project.json", mv);
  await job.write("assets/audio/music.wav", wavBuffer(new Float32Array(48000)));
  for (const file of ["plan/explanation-map.md", "plan/evidence.json", "plan/script.md"]) await fs.rm(path.join(job.directory, file));
  await job.write("plan/music-analysis.md", "Music structure analysis for an MV structural fixture. ".repeat(3));
  let result = job.validate(); assert.equal(result.status, 0, result.stdout + result.stderr);
  await fs.rm(path.join(job.directory, "plan/music-analysis.md"));
  result = job.validate(); assert.equal(result.status, 1); assert.match(result.stderr, /music-analysis/);
});
test("caption fit counts halfwidth, explicit lines and speech units", () => {
  const box = captionBox(projectFor(), true);
  assert.equal(textWidth("あAｱ"), 2);
  assert.equal(fitCaption("あ".repeat(46), box).fits, true);
  assert.equal(fitCaption("あ".repeat(47), box).fits, false);
  assert.equal(fitCaption("あ\nい\nう", box).fits, false);
  assert.equal(fitCaption(" A   B ", box).width, 1.5);
  assert.deepEqual(splitCaptionUnits("一。二！三?"), ["一。", "二！", "三?"]);
  assert.equal(estimateSpeechSeconds("あいうえおか", 2), 0.5);
});
test("style helpers preserve old jobs and require explicit mixed scene assignments", async () => {
  const project = projectFor();
  assert.equal(effectiveStyleMode(project), "biim");
  assert.equal(effectiveSceneStyle(project), "biim");
  assert.equal(sceneUsesBiimFrame(project), true);
  project.direction.style_mode = "mixed";
  project.scenes = [{ id: "s1", script: "説明", duration_sec: 1 }];
  assert.equal(effectiveSceneStyle(project, project.scenes[0]), undefined);
  assert.ok(styleErrors(project).length);
  project.scenes[0].style = "motion";
  project.scenes[0].biim = false;
  assert.deepEqual(styleErrors(project), []);
  assert.equal(sceneUsesBiimFrame(project, project.scenes[0]), false);
  assert.doesNotMatch(await fs.readFile("job-template/runtime/scripts/caption-capacity.mjs", "utf8"), /^import\s/m);
});

