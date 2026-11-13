import assert from "node:assert/strict";
import { before, test } from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createServer } from "vite";
import JSZip from "jszip";
import fontAssets from "../src/font-assets.json" with { type: "json" };
import {
  defaults, generateJob, safeName,
  type CharacterForm, type JobAssets, type MotionForm, type TemplateFiles,
} from "../src/job.ts";

const repository = fileURLToPath(new URL("../", import.meta.url));
const cli = path.join(repository, "tools/generate-job.ts");
type PartialForm = Omit<Partial<MotionForm>, "secondCharacter"> & { secondCharacter?: Partial<CharacterForm> };
let webTemplates: TemplateFiles;

before(async () => {
  // Execute the actual browser template module through Vite, including its
  // glob expansion and loadTemplates font hashes. Only font HTTP is supplied
  // locally; the CLI loader is deliberately not reused as the ZIP oracle.
  const server = await createServer({
    root: repository, configFile: false,
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  const originalFetch = globalThis.fetch;
  try {
    const browser = await server.ssrLoadModule("/src/templates.ts");
    globalThis.fetch = async (input) => {
      const name = String(input).replace(/^\/job-assets\/fonts\//, "");
      assert.ok(fontAssets.some((font) => font.name === name), `unexpected font request: ${input}`);
      return new Response(await fs.readFile(path.join(repository, "public/job-assets/fonts", name)));
    };
    webTemplates = await browser.loadTemplates();
  } finally {
    globalThis.fetch = originalFetch;
    await server.close();
  }
});

async function runCLI(args: string[], cwd: string) {
  return await new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(process.execPath, ["--experimental-strip-types", cli, ...args], { cwd, windowsHide: true });
    let stdout = "", stderr = "";
    child.stdout.setEncoding("utf8").on("data", (data) => { stdout += data; });
    child.stderr.setEncoding("utf8").on("data", (data) => { stderr += data; });
    child.once("error", reject);
    child.once("close", (code) => resolve({ code, stdout, stderr }));
  });
}

async function folderFiles(directory: string, prefix = ""): Promise<Record<string, Uint8Array>> {
  const files: Record<string, Uint8Array> = {};
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) Object.assign(files, await folderFiles(filename, relative + "/"));
    else files[relative] = new Uint8Array(await fs.readFile(filename));
  }
  return files;
}

const minimal = { title: "虹: CLI?", description: "光の分散を説明する", audience: "中高生" };
for (const mode of ["biim", "anime", "motion", "mixed", "mv"] as const) {
  test(`generate-job CLI matches the WebUI ZIP file paths and bytes for ${mode}`, async (t) => {
    const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "biim-job-entry-"));
    t.after(() => fs.rm(temporary, { recursive: true, force: true }));
    const inputDirectory = path.join(temporary, "input");
    await fs.mkdir(path.join(inputDirectory, "sources"), { recursive: true });
    await fs.mkdir(path.join(inputDirectory, "more"));
    const pdf = new Uint8Array([37, 80, 68, 70, 0, 255, 13, 10]);
    const text = new TextEncoder().encode("資料の原文\r\n2行目\n");
    const unknown = new Uint8Array([255, 0, 128, 1]);
    const model = new Uint8Array([103, 108, 84, 70, 0, 1]);
    const music = new Uint8Array([82, 73, 70, 70, 255, 0]);
    const files = [
      { path: "sources/資料.PDF", name: "資料.PDF", data: pdf, type: "application/pdf" },
      { path: "more/資料.PDF", name: "資料.PDF", data: text, type: "application/pdf" },
      { path: "sources/notes.txt", name: "notes.txt", data: text, type: "text/plain" },
      { path: "sources/raw.unknown", name: "raw.unknown", data: unknown, type: "application/octet-stream" },
    ];
    for (const file of files) await fs.writeFile(path.join(inputDirectory, file.path), file.data);
    await fs.writeFile(path.join(inputDirectory, "first.glb"), model);
    await fs.writeFile(path.join(inputDirectory, "second.glb"), unknown);
    await fs.writeFile(path.join(inputDirectory, "audio.WAV"), music);
    const partial: PartialForm = {
      ...minimal, title: `prefix/虹: CLI? ${mode} `,
      videoMode: mode === "mv" ? "mv" : "explanation",
      ...(mode === "mv" ? { musicDurationSec: 6.25, musicLyrics: "夜の街へ\n\n[サビ]\n光の向こうへ" }
        : { styleMode: mode, characterMode: "duo", secondCharacter: { name: "聞き手" },
          outline: "# 導入\n問いを提示する。\r\n# 結論\n理解を確かめる。" }),
    };
    const form: MotionForm = {
      ...defaults, ...partial,
      secondCharacter: { ...defaults.secondCharacter, ...partial.secondCharacter },
    };
    const assetPaths = {
      sources: files.map((file, i) => i === 2 ? path.join(inputDirectory, file.path) : file.path),
      character: mode === "mv" ? null : "first.glb",
      secondCharacter: mode === "mv" ? null : "second.glb",
      bgm: mode === "mv" ? null : "audio.WAV",
      music: mode === "mv" ? "audio.WAV" : null,
    };
    const assets: JobAssets = {
      sources: files.map(({ name, data, type }) => ({ name, data, type, size: data.byteLength })),
      ...(mode === "mv" ? { music: { name: "audio.WAV", data: music, size: music.byteLength, type: "audio/wav" } }
        : { character: { name: "first.glb", data: model, size: model.byteLength, type: "model/gltf-binary" },
          secondCharacter: { name: "second.glb", data: unknown, size: unknown.byteLength, type: "model/gltf-binary" },
          bgm: { name: "audio.WAV", data: music, size: music.byteLength, type: "audio/wav" } }),
    };
    await fs.writeFile(path.join(inputDirectory, "form.json"),
      (mode === "biim" ? "\uFEFF" : "") + JSON.stringify({ form: partial, assets: assetPaths }));
    const result = await runCLI(["input/form.json", "--out=generated"], temporary);
    assert.equal(result.code, 0, result.stderr);
    const actual = await folderFiles(path.join(temporary, "generated"));
    const webJob = await generateJob(form, assets, webTemplates);
    const webZip = await JSZip.loadAsync(webJob.data);
    const expectedFiles = Object.entries(webZip.files).filter(([, entry]) => !entry.dir);
    assert.deepEqual(Object.keys(actual).sort(), expectedFiles.map(([name]) => name).sort());
    for (const [name, entry] of expectedFiles)
      assert.deepEqual(actual[name], await entry.async("uint8array"), `bytes differ: ${name}`);
    const prefix = safeName(form.title.trim()) + "/";
    assert.ok(Object.keys(actual).every((name) => name.startsWith(prefix)));
    for (const font of fontAssets)
      assert.deepEqual(actual[prefix + "assets/fonts/" + font.name],
        new Uint8Array(await fs.readFile(path.join(repository, "public/job-assets/fonts", font.name))));

    // Refusing a rerun must preserve every original byte, including user edits.
    await fs.writeFile(path.join(temporary, "generated", prefix, "brief.md"), "user edit");
    const before = await folderFiles(path.join(temporary, "generated"));
    const rerun = await runCLI(["--out=generated", "input/form.json"], temporary);
    assert.equal(rerun.code, 1);
    assert.match(rerun.stderr, /already exists/);
    assert.deepEqual(await folderFiles(path.join(temporary, "generated")), before);
  });
}

test("generate-job accepts a minimal form and omitted assets using defaults", async (t) => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "biim-job-defaults-"));
  t.after(() => fs.rm(temporary, { recursive: true, force: true }));
  await fs.writeFile(path.join(temporary, "input.json"), JSON.stringify({ form: minimal }));
  const result = await runCLI(["input.json", "--out=output"], temporary);
  assert.equal(result.code, 0, result.stderr);
  const zip = await JSZip.loadAsync((await generateJob({ ...defaults, ...minimal }, { sources: [] }, webTemplates)).data);
  const actual = await folderFiles(path.join(temporary, "output"));
  const expected = Object.entries(zip.files).filter(([, entry]) => !entry.dir);
  assert.deepEqual(Object.keys(actual).sort(), expected.map(([name]) => name).sort());
  for (const [name, entry] of expected) assert.deepEqual(actual[name], await entry.async("uint8array"), name);
});

test("generate-job rejects invalid JSON, unknown keys, invalid types and validation errors before writing", async (t) => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "biim-job-invalid-"));
  t.after(() => fs.rm(temporary, { recursive: true, force: true }));
  const cases: [unknown, RegExp][] = [
    [null, /Input must be an object/],
    [[], /Input must be an object/],
    [{}, /form must be an object/],
    [{ form: { ...minimal, style_mode: "anime" } }, /Unknown key: form.style_mode/],
    [{ form: { ...minimal, secondCharacter: { style_id: 123 } } }, /Unknown key: form.secondCharacter.style_id/],
    [JSON.parse('{"form":{"__proto__":{}}}'), /Unknown key: form.__proto__/],
    [{ form: { ...minimal, title: 42, secondCharacter: null } }, /form.title must be string\nform.secondCharacter must be an object/],
    [{ form: { ...minimal, musicDurationSec: "30" } }, /form.musicDurationSec must be a number or null/],
    [{ form: { ...minimal, styleMode: "mixed", fullScreen: true } }, /様式「混在」/],
    [{ form: {} }, /動画タイトル[\s\S]*何を説明する動画[\s\S]*対象視聴者/],
    [{ form: { ...minimal, videoMode: "mv" } }, /完成音源をアップロード/],
    [{ form: minimal, assets: { sources: [null] } }, /assets.sources must be an array/],
    [{ form: minimal, assets: { music: false } }, /assets.music must be a nonempty file path or null/],
    [{ form: minimal, assets: { source: [] } }, /Unknown key: assets.source/],
    [{ form: minimal, assets: { sources: ["missing.pdf"] } }, /ENOENT/],
    [{ form: minimal, extra: {} }, /Unknown key: input.extra/],
  ];
  for (const [input, message] of cases) {
    await fs.writeFile(path.join(temporary, "input.json"), JSON.stringify(input));
    const result = await runCLI(["input.json", "--out=output"], temporary);
    assert.equal(result.code, 1, JSON.stringify(input));
    assert.match(result.stderr, message);
    await assert.rejects(fs.stat(path.join(temporary, "output")), { code: "ENOENT" });
  }
  await fs.writeFile(path.join(temporary, "input.json"), "{broken json");
  assert.equal((await runCLI(["input.json", "--out=output"], temporary)).code, 1);
  await assert.rejects(fs.stat(path.join(temporary, "output")), { code: "ENOENT" });
});

test("generate-job rejects existing empty directories and files without changing siblings", async (t) => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "biim-job-existing-"));
  t.after(() => fs.rm(temporary, { recursive: true, force: true }));
  await fs.writeFile(path.join(temporary, "input.json"), JSON.stringify({ form: minimal }));
  const destination = path.join(temporary, "output", safeName(minimal.title));
  await fs.mkdir(destination, { recursive: true });
  await fs.writeFile(path.join(temporary, "output", "sibling.txt"), "preserve");
  let result = await runCLI(["input.json", "--out=output"], temporary);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /already exists/);
  assert.deepEqual(await fs.readdir(destination), []);
  await fs.rmdir(destination);
  await fs.writeFile(destination, "existing file");
  result = await runCLI(["input.json", "--out=output"], temporary);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /already exists/);
  assert.equal(await fs.readFile(destination, "utf8"), "existing file");
  assert.equal(await fs.readFile(path.join(temporary, "output", "sibling.txt"), "utf8"), "preserve");
});

test("generate-job reports usage and exits 1 for missing, duplicate or unsupported arguments", async () => {
  for (const args of [[], ["input.json"], ["input.json", "--out="], ["input.json", "--unknown=x"],
    ["input.json", "--out=one", "--out=two"], ["one.json", "two.json", "--out=output"]]) {
    const result = await runCLI(args, repository);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /Usage:/);
  }
  const help = await runCLI(["--help"], repository);
  assert.equal(help.code, 0);
  assert.match(help.stdout, /Usage:/);
});
