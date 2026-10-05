import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import {
  createProject,
  createBrief,
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

test("solo and duo profiles preserve names, roles, custom colors and independent voices", () => {
  const defaultDuo = createProject({ ...form, characterMode: "duo" }, empty);
  assert.deepEqual(
    defaultDuo.characters.map((character) => [
      character.voice.style_id,
      character.voice.speed,
      character.subtitle_color,
      character.subtitle_outline,
    ]),
    [
      [1069147200, 1, "#0000ff", "#ffffff"],
      [1566366592, 1, "#ff0000", "#ffffff"],
    ],
  );
  const solo = createProject({ ...form, subtitleColor: "#12ab34" }, empty);
  assert.equal(solo.characters.length, 1);
  assert.equal(solo.characters[0].subtitle_color, "#12ab34");
  assert.equal(solo.characters[0].subtitle_outline, "#ffffff");
  const duoForm = {
    ...form,
    characterMode: "duo" as const,
    characterName: "茜",
    characterReading: "あかね",
    secondCharacter: {
      ...form.secondCharacter,
      name: "葵",
      reading: "あおい",
      role: "質問役",
      styleId: 42,
      voiceSpeed: 1.25,
    },
  };
  const duo = createProject(duoForm, empty);
  assert.deepEqual(
    duo.characters.map((c) => [c.id, c.name, c.reading, c.subtitle_color]),
    [
      ["character1", "茜", "あかね", "#0000ff"],
      ["character2", "葵", "あおい", "#ff0000"],
    ],
  );
  assert.equal(duo.characters[1].voice.style_id, 42);
  assert.equal(duo.characters[1].voice.speed, 1.25);
  const brief = createBrief(duoForm, empty);
  assert.match(brief, /2人の掛け合い/);
  assert.match(brief, /葵.*あおい/);
  assert.match(brief, /質問役/);
  assert.ok(
    validateForm({
      ...duoForm,
      secondCharacter: { ...duoForm.secondCharacter, subtitleColor: "red" },
    }).length,
  );
  assert.ok(
    validateForm({
      ...duoForm,
      secondCharacter: { ...duoForm.secondCharacter, styleId: -1 },
    }).length,
  );
  assert.ok(
    validateForm({
      ...duoForm,
      secondCharacter: { ...duoForm.secondCharacter, voiceSpeed: NaN },
    }).length,
  );
  assert.equal(
    validateForm({
      ...form,
      secondCharacter: { ...form.secondCharacter, styleId: -1 },
    }).length,
    0,
  );
});

test("fullscreen and portrait enforce no Biim frame and keep both characters outside captions", () => {
  for (const dimensions of [
    [1920, 1080],
    [1280, 720],
    [3840, 2160],
    [1080, 1920],
    [720, 1280],
    [2160, 3840],
  ]) {
    const [width, height] = dimensions;
    const current = {
      ...form,
      width,
      height,
      fullScreen: width > height,
      characterMode: "duo" as const,
      biimUsage: "mostly" as const,
    };
    const project = createProject(current, empty);
    assert.equal(project.layout.mode, "fullscreen");
    assert.equal(project.layout.frame, null);
    assert.equal(project.direction.biim_usage, "never");
    assert.deepEqual(project.layout.regions.main, [
      0,
      0,
      project.layout.base_width,
      project.layout.base_height,
    ]);
    for (const name of ["character", "character_second", "subtitle"] as const) {
      const [x, y, w, h] = project.layout.regions[name];
      assert.ok(
        x >= 0 &&
          y >= 0 &&
          x + w <= project.layout.base_width &&
          y + h <= project.layout.base_height,
      );
    }
    const [cx, cy, cw, ch] = project.layout.regions.character;
    const [sx, sy, sw, sh] = project.layout.regions.subtitle;
    assert.ok(cx + cw <= sx || sx + sw <= cx || cy + ch <= sy || sy + sh <= cy);
    const [, secondY, , secondH] = project.layout.regions.character_second;
    assert.ok(secondY + secondH <= sy);
    assert.match(createBrief(current, empty), /Biim枠・固定ノート欄を使わず/);
  }
  assert.equal(
    createProject({ ...form, biimUsage: "never" }, empty).layout.mode,
    "fullscreen",
  );
});

test("Biim subtitles and their SVG border move with character positions", async () => {
  const templates = await loadTemplates();
  for (const [first, second] of [
    ["left", "right"],
    ["right", "left"],
    ["left", "left"],
    ["right", "right"],
  ] as const) {
    const current = {
      ...form,
      characterMode: "duo" as const,
      characterPosition: first,
      secondCharacter: { ...form.secondCharacter, position: second },
    };
    const project = createProject(current, empty);
    const [x, y, width, height] = project.layout.regions.subtitle;
    for (const key of ["character", "character_second"] as const) {
      const [cx, cy, cw, ch] = project.layout.regions[key];
      assert.ok(
        cx + cw <= x || x + width <= cx || cy + ch <= y || y + height <= cy,
      );
    }
    if (first !== second) assert.equal(x + width / 2, 960);
    const [fx, fy, fw, fh] = project.layout.subtitle_frame;
    assert.ok(
      fx <= x && fx + fw >= x + width && fy <= y && fy + fh >= y + height,
    );
    const zip = await JSZip.loadAsync(
      (await generateJob(current, empty, templates)).data,
    );
    assert.ok(
      (
        await zip.file(form.title + "/assets/biim-frame.svg")!.async("string")
      ).includes(`x="${fx}" y="${fy}" width="${fw}" height="${fh}"`),
    );
  }
  const noCharacters = createProject(
    { ...form, characterMode: "duo", characterUsage: "none" },
    empty,
  );
  assert.ok(noCharacters.layout.regions.subtitle[2] > 1800);
});

test("duo ZIP packages two separate GLBs; solo omits the inactive second model and its limits", async () => {
  const model = {
    name: "same.glb",
    data: new Uint8Array([1, 2]),
    size: 2,
    type: "",
  };
  const second = { ...model, data: new Uint8Array([3, 4]) };
  const assets = { sources: [], character: model, secondCharacter: second };
  const templates = await loadTemplates();
  const duo = await generateJob(
    { ...form, characterMode: "duo", width: 1080, height: 1920 },
    assets,
    templates,
  );
  const zip = await JSZip.loadAsync(duo.data);
  const prefix = form.title + "/";
  assert.deepEqual(
    await zip.file(prefix + "assets/character.glb")!.async("uint8array"),
    model.data,
  );
  assert.deepEqual(
    await zip.file(prefix + "assets/character2.glb")!.async("uint8array"),
    second.data,
  );
  const project = JSON.parse(
    await zip.file(prefix + "project.json")!.async("string"),
  );
  assert.equal(project.characters[1].model, "assets/character2.glb");
  assert.equal(project.layout.frame, null);
  const brief = await zip.file(prefix + "brief.md")!.async("string");
  assert.match(brief, /speaker_id/);
  assert.match(brief, /全画面の演出/);
  const solo = await generateJob(form, assets, templates);
  assert.equal(
    (await JSZip.loadAsync(solo.data)).file(prefix + "assets/character2.glb"),
    null,
  );
  const invalid = {
    ...assets,
    secondCharacter: { ...second, name: "bad.gltf", size: 501 * 1024 * 1024 },
  };
  assert.equal(validateForm(form, invalid).length, 0);
  assert.ok(
    validateForm({ ...form, characterMode: "duo" }, invalid).length >= 2,
  );
});
