import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { defaults, generateJob, type TemplateFiles } from "../src/job.ts";
import { switchVideoMode } from "../src/job.ts";
import { wavBuffer } from "../job-template/runtime/scripts/lib.mjs";

const templates: TemplateFiles = {};
async function walk(directory: string) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else
      templates[path.relative("job-template", file).replaceAll("\\", "/")] =
        await fs.readFile(file, "utf8");
  }
}
await walk("job-template");
for (const name of ["NotoSansJP-Variable.ttf", "MPLUSRounded1c-ExtraBold.ttf"])
  templates[`assets/fonts/${name}`] = new Uint8Array(
    await fs.readFile(`public/job-assets/fonts/${name}`),
  );
const mv = process.argv.includes("--mv");
const option = (name: string) => process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const styleOption = option("style");
const style = styleOption ?? "biim";
const qc = option("qc");
const out = option("out") ?? ".verification";
if (!["biim", "anime", "motion", "mixed"].includes(style)) throw new Error("Use --style=biim|anime|motion|mixed");
if (qc !== undefined && !["pass", "fail-evidence", "fail-caption", "fail-review"].includes(qc)) throw new Error("Use --qc=pass|fail-evidence|fail-caption|fail-review");
if (!out.trim()) throw new Error("--out must name a directory");
if (mv && (qc !== undefined || styleOption !== undefined)) throw new Error("--style and --qc apply only to explainer fixtures");
if (style === "mixed" && ["--portrait", "--fullscreen"].some((arg) => process.argv.includes(arg))) throw new Error("Mixed fixtures require landscape Biim layout");
const fixtureMusicDuration = 6.25;
const music = wavBuffer(
  Float32Array.from(
    { length: 48000 * fixtureMusicDuration },
    (_, i) => 0.15 * Math.sin((2 * Math.PI * 440 * i) / 48000),
  ),
);
const baseForm = {
  ...defaults,
  title: "smoke-video",
  description: "Runtime smoke test",
  audience: "developers",
  durationSec: 30,
  width: process.argv.includes("--portrait") ? 360 : 640,
  height: process.argv.includes("--portrait") ? 640 : 360,
  characterMode: process.argv.includes("--duo")
    ? ("duo" as const)
    : ("solo" as const),
  fullScreen: process.argv.includes("--fullscreen") || ["anime", "motion"].includes(style),
};
const job = await generateJob(
  mv
    ? {
        ...switchVideoMode(baseForm, "mv"),
        musicMood: "静かな夜、サビで広がるモーショングラフィックス",
        musicLyrics: "夜の街へ\n\n[サビ]\n光の向こうへ",
        musicDurationSec: fixtureMusicDuration,
      }
    : baseForm,
  {
    sources: [],
    ...(mv
      ? {
          music: {
            name: "smoke-music.wav",
            size: music.length,
            data: new Uint8Array(music),
            type: "audio/wav",
          },
        }
      : {}),
  },
  templates,
);
const zip = await JSZip.loadAsync(job.data);
const jobPrefix = "smoke-video/";
if (!mv && (styleOption !== undefined || qc !== undefined)) {
  const project = JSON.parse(await zip.file(jobPrefix + "project.json")!.async("string"));
  project.direction.style_mode = style;
  if (qc !== undefined) {
    // Synthetic review records make deterministic fixtures; they do not attest to a real video review.
    project.scenes = (style === "mixed" ? ["biim", "motion"] : [style]).map((sceneStyle, index) => {
      const text = qc === "fail-caption" ? "長".repeat(100) + "。" : "図の変化で説明します。";
      const scene = { id: `s0${index + 1}`, style: sceneStyle, biim: sceneStyle === "biim" && project.layout.mode === "biim",
        duration_sec: 4, ...(project.character_mode === "duo"
          ? { dialogue: [{ text, speaker_id: project.characters[0].id }] }
          : { script: text }),
        ...(sceneStyle === "biim" ? { note_top: "説明の要点", note_bottom: "図の変化を観察" } : {}) };
      return scene;
    });
    const put = (name: string, text: string) => zip.file(jobPrefix + name, text);
    put("plan/explanation-map.md", ["理解ゴール", "前提知識", "想定される誤解", "主張の一覧", "山場", "扱わない範囲"].map((name) => `## ${name}\n図の変化を説明する検証専用の設計記録。\n`).join("\n"));
    put("plan/direction.md", "## 方向性の3案\n### 案1 因果\n原因から結果へ図を変える。\n### 案2 手順\n動作を順に実演する。\n### 案3 比較\n二つの状態を対照する。\n## 採用と理由\n最小の因果関係を図示する案1を採用。\n## スタイル定義\n様式は " + style + "。混在では最初の場面をBiim、次をモーションにする。\n");
    put("plan/evidence.json", JSON.stringify({ schema_version: "1", sources: [{ id: "S01", kind: "common", ref: "", title: "検証用の一般知識", accessed: "", note: "" }],
      claims: [{ id: "C01", text: "図の変化を使って説明できる", kind: "fact", scene_ids: project.scenes.map((scene) => scene.id),
        source_ids: qc === "fail-evidence" ? [] : ["S01"], locator: "", status: "verified", check: "", note: "検証用の合成データ" }] }, null, 2) + "\n");
    put("plan/storyboard.md", project.scenes.map((scene) => `## 場面 ${scene.id}\n- 時刻の目安: ${scene.id === "s01" ? "0:00–0:04" : "0:04–0:08"}\n- 説明目的: 図の変化が説明に使えると分かる\n- 構造型: 因果\n- 画面状態: 図の前 → 変化 → 図の後\n- ナレーション要旨: 図の変化で説明します\n- 新規概念の数: 1\n- キャラの演技: 図を指す\n- 様式: ${scene.style}\n- レイアウト: ${scene.biim ? "Biim枠" : "全画面"}\n- 密度と変化率: 低密度・緩やか\n- BGM・SE: なし\n- 必要素材: なし\n- 根拠ID: C01\n`).join("\n"));
    put("plan/script.md", project.scenes.map((scene) => `## 場面 ${scene.id}\n${scene.script ?? scene.dialogue.map((turn) => turn.text).join("\n")} [C01]\n`).join("\n") + "\n## 読み\n読み替えは不要。検証専用の台本記録です。\n");
    put("plan/sources.md", "# 出典リスト\n\nS01: 図の変化を説明に利用できるという一般知識。検証専用の合成データで、実際の動画制作の根拠照合を代替しません。\n");
    put("reports/qc-review.md", "# QC 検証専用の合成記録\n\nreview_mode: self\nreviewer: fixture generator (synthetic test data)\n\n実動画のレビュー完了を表明する記録ではありません。\n" +
      (qc === "fail-review" ? "" : "- [x] PRE-4: 合成データの台本・根拠一致を再現するテスト行\n") + "- [x] PRE-5: 数値や数式を用いない検証データ\n");
  }
  zip.file(jobPrefix + "project.json", JSON.stringify(project, null, 2) + "\n");
}
await fs.mkdir(out, { recursive: true });
await fs.writeFile(path.join(out, "smoke-motion-job.zip"), await zip.generateAsync({ type: "uint8array" }));
for (const [file, entry] of Object.entries(zip.files)) {
  const target = path.resolve(out, file);
  if (!target.startsWith(path.resolve(out) + path.sep))
    throw new Error("Unsafe fixture path");
  if (entry.dir) await fs.mkdir(target, { recursive: true });
  else {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, await entry.async("uint8array"));
  }
}
console.log("Created and extracted " + path.join(out, "smoke-motion-job.zip"));
