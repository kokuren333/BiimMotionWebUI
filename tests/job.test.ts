import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import {
  createProject,
  defaults,
  generateJob,
  safeName,
  uniqueNames,
  validateForm,
  type MotionForm,
  type TemplateFiles,
} from "../src/job.ts";
import { synthesizeCue } from "../job-template/runtime/scripts/sound-design.mjs";
import { wavDuration } from "../job-template/runtime/scripts/lib.mjs";

const form: MotionForm = {
  ...defaults,
  title: "虹はどうしてできる？",
  description: "光の分散を説明する",
  audience: "中高生",
  durationSec: 30,
};
const empty = { sources: [] };
async function loadTemplates(): Promise<TemplateFiles> {
  const result: TemplateFiles = {};
  async function walk(directory: string) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else
        result[path.relative("job-template", file).replaceAll("\\", "/")] =
          await fs.readFile(file, "utf8");
    }
  }
  await walk("job-template");
  for (const name of [
    "NotoSansJP-Variable.ttf",
    "MPLUSRounded1c-ExtraBold.ttf",
  ])
    result[`assets/fonts/${name}`] = new Uint8Array(
      await fs.readFile(`public/job-assets/fonts/${name}`),
    );
  return result;
}

test("project is a creative brief with empty scenes and audio creation policy", () => {
  const project = createProject(
    { ...form, instructions: "章ごとのスライドにしない\n図の変化で説明する" },
    empty,
  );
  assert.deepEqual(project.scenes, []);
  assert.equal(
    project.direction.instructions,
    "章ごとのスライドにしない\n図の変化で説明する",
  );
  assert.equal(project.audio.generate_bgm_se, true);
  assert.match(project.audio.instructions, /BGMとSE/);
  assert.equal(
    createProject(
      { ...form, generateAudio: false, allowWebResearch: false },
      empty,
    ).audio.generate_bgm_se,
    false,
  );
  assert.equal(project.character.model, null);
  assert.deepEqual(project.layout.regions.subtitle, [350, 870, 1528, 178]);
  assert.equal(project.layout.fonts.subtitle.family, "M PLUS Rounded 1c");
});

test("required values, unsafe URLs, invalid numeric values and asset limits are rejected", () => {
  assert.equal(validateForm(form).length, 0);
  assert.equal(validateForm(defaults).length, 3);
  for (const invalid of [
    { durationSec: NaN },
    { width: 1921 },
    { fps: 27 },
    { voiceSpeed: 0 },
    { styleId: -1 },
    { urls: "javascript:alert(1)" },
    { engineUrl: "file:///tmp" },
    { tempo: "wrong" },
  ]) {
    assert.ok(validateForm({ ...form, ...invalid } as MotionForm).length > 0);
  }
  assert.ok(
    validateForm(form, {
      sources: [
        {
          name: "large.pdf",
          size: 501 * 1024 * 1024,
          type: "",
          data: new Uint8Array(1),
        },
      ],
    }).length > 0,
  );
  assert.ok(
    validateForm(form, {
      sources: [],
      character: {
        name: "model.gltf",
        size: 1,
        type: "",
        data: new Uint8Array(1),
      },
    }).length > 0,
  );
  assert.equal(
    validateForm({ ...form, voiceEngine: "none", engineUrl: "", styleId: -1 })
      .length,
    0,
  );
});

test("filenames remain portable, traversal-free and unique even with normalized names", () => {
  assert.equal(safeName("../../CON.pdf"), "_CON.pdf");
  assert.equal(safeName("C:\\secret\\report.pdf"), "report.pdf");
  assert.equal(safeName("..."), "file");
  assert.deepEqual(
    uniqueNames([
      { name: "data.pdf" },
      { name: "DATA.pdf" },
      { name: "data-2.pdf" },
      { name: "../data.pdf" },
    ]),
    ["data.pdf", "DATA-2.pdf", "data-2-2.pdf", "data-3.pdf"],
  );
  assert.deepEqual(uniqueNames([{ name: "e\u0301.txt" }, { name: "é.txt" }]), [
    "é.txt",
    "é-2.txt",
  ]);
});

test("ZIP includes the runtime, exact attachment bytes, Japanese brief, and audio instructions", async () => {
  const assets = {
    sources: [
      {
        name: "../data.pdf",
        size: 3,
        type: "application/pdf",
        data: new Uint8Array([1, 2, 3]),
      },
      {
        name: "DATA.pdf",
        size: 2,
        type: "",
        data: new Blob([new Uint8Array([4, 5])]),
      },
    ],
    character: {
      name: "avatar.glb",
      size: 4,
      type: "",
      data: new Uint8Array([8, 9, 10, 11]),
    },
    bgm: {
      name: "My Music.MP3",
      size: 2,
      type: "",
      data: new Uint8Array([6, 7]),
    },
  };
  const fullForm = {
    ...form,
    urls: "https://example.com\nhttps://example.com",
    instructions: "原文\nそのまま",
    audioNotes: "図の登場にチャイム",
  };
  const updates: number[] = [];
  const result = await generateJob(
    fullForm,
    assets,
    await loadTemplates(),
    (n) => updates.push(n),
  );
  assert.match(result.filename, /-motion-job\.zip$/);
  assert.equal(updates.at(-1), 100);
  const zip = await JSZip.loadAsync(result.data);
  const prefix = form.title + "/";
  const json = JSON.parse(
    await zip.file(prefix + "project.json")!.async("string"),
  );
  assert.equal(json.sources.length, 3);
  assert.equal(json.sources[2].path, "sources/DATA-2.pdf");
  assert.equal(json.audio.bgm, "assets/bgm.mp3");
  assert.deepEqual(json.scenes, []);
  assert.deepEqual(
    await zip.file(prefix + "sources/data.pdf")!.async("uint8array"),
    assets.sources[0].data,
  );
  assert.deepEqual(
    await zip.file(prefix + "sources/DATA-2.pdf")!.async("uint8array"),
    new Uint8Array([4, 5]),
  );
  assert.deepEqual(
    await zip.file(prefix + "assets/character.glb")!.async("uint8array"),
    assets.character.data,
  );
  const brief = await zip.file(prefix + "brief.md")!.async("string");
  assert.match(brief, /原文\nそのまま/);
  assert.match(brief, /図の登場にチャイム/);
  assert.match(
    await zip.file(prefix + "AGENTS.md")!.async("string"),
    /場面に合う簡単なBGMとSE/,
  );
  for (const file of [
    "package.json",
    "runtime/package.json",
    "runtime/src/MainVideo.tsx",
    "runtime/scripts/aivis.mjs",
    "runtime/scripts/sound-design.mjs",
    "runtime/scripts/validate.mjs",
    "scenes/index.tsx",
    "motion-kit/Character3D.tsx",
    "assets/biim-frame.svg",
    "assets/fonts/OFL.txt",
    "assets/fonts/MPLUSRounded1c-OFL.txt",
    "runtime/src/Fonts.tsx",
  ])
    assert.ok(zip.file(prefix + file), file);
  assert.deepEqual(
    await zip
      .file(prefix + "assets/fonts/NotoSansJP-Variable.ttf")!
      .async("uint8array"),
    new Uint8Array(
      await fs.readFile("public/job-assets/fonts/NotoSansJP-Variable.ttf"),
    ),
  );
  assert.equal(
    Object.keys(zip.files).filter(
      (file) =>
        file.startsWith(prefix + "motion-kit/") && file.endsWith(".tsx"),
    ).length,
    10,
  );
});

test("generation enforces validation and rejects unsafe template paths", async () => {
  const templates = await loadTemplates();
  await assert.rejects(generateJob(defaults, empty, templates), /タイトル/);
  await assert.rejects(
    generateJob(form, empty, { ...templates, "../evil": "bad" }),
    /テンプレートパス/,
  );
  await assert.rejects(generateJob(form, empty, {}), /テンプレートが不足/);
});

test("procedural BGM and SE are deterministic, finite WAVs with bounded peaks", () => {
  for (const kind of ["bgm", "chime", "whoosh", "impact"]) {
    const cue = { id: "test", kind, duration_sec: 0.2 };
    const wav = synthesizeCue(cue);
    assert.equal(wavDuration(wav), 0.2);
    assert.deepEqual(wav, synthesizeCue(cue));
    let max = 0;
    for (let i = 44; i < wav.length; i += 2)
      max = Math.max(max, Math.abs(wav.readInt16LE(i)));
    assert.ok(max > 0 && max < 32767, `peak: ${kind}`);
  }
  assert.throws(
    () => synthesizeCue({ id: "bad", kind: "bgm", duration_sec: Infinity }),
    /duration_sec/,
  );
  assert.throws(
    () => synthesizeCue({ id: "bad", kind: "bgm", duration_sec: 1, notes: [] }),
    /notes/,
  );
  assert.throws(() => wavDuration(Buffer.from("not wav")), /RIFF/);
});
