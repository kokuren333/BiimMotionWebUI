import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  buildPrompt,
  generateImage,
  parseArgs,
} from "../job-template/runtime/scripts/imagegen.mjs";

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(120, 1),
]);

async function jobDir() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "imagegen-"));
  await fs.mkdir(path.join(root, "plan"));
  await fs.writeFile(
    path.join(root, "project.json"),
    JSON.stringify({ video: { width: 1920, height: 1080 } }),
  );
  return root;
}

// A stand-in for `codex` that follows the wrapper's contract: read the prompt
// from stdin and save a PNG at OUTPUT_PATH inside the -C directory.
async function fakeCodex(dir: string, behaviour: "save" | "fail" | "nothing") {
  const file = path.join(dir, "fake-codex.mjs");
  await fs.writeFile(
    file,
    `import fs from "node:fs";
import path from "node:path";
const args = process.argv.slice(2);
if (args[0] === "--version") { console.log("codex-fake"); process.exit(0); }
const cwd = args[args.indexOf("-C") + 1];
const prompt = fs.readFileSync(0, "utf8");
fs.writeFileSync(path.join(cwd, "last-prompt.txt"), prompt);
fs.writeFileSync(path.join(cwd, "last-args.json"), JSON.stringify(args));
if (${JSON.stringify(behaviour)} === "fail") process.exit(3);
if (${JSON.stringify(behaviour)} === "save") {
  const output = prompt.match(/^OUTPUT_PATH: (.+)$/m)[1].trim();
  fs.writeFileSync(path.join(cwd, output), Buffer.from(${JSON.stringify([...png])}));
}
`,
  );
  return file;
}

const quiet = () => {};

test("imagegen parses options and builds a style-aware prompt without lyrics in images", () => {
  const options = parseArgs([
    "--name", "bg-a", "--kind", "transparent", "--ref", "assets/a.png",
    "--ref", "assets/b.png", "--prompt", "星", "--force", "--strict",
  ]);
  assert.equal(options.name, "bg-a");
  assert.deepEqual(options.refs, ["assets/a.png", "assets/b.png"]);
  assert.ok(options.force && options.strict);
  assert.throws(() => parseArgs(["--bogus"]), /Unknown option/);
  const prompt = buildPrompt({
    kind: "character-sheet", prompt: "主人公", style: "palette: #112233",
    size: "1920x1080", output: "assets/generated/x.png", refs: [],
  });
  assert.match(prompt, /imagegen skill/);
  assert.match(prompt, /OUTPUT_PATH: assets\/generated\/x\.png/);
  assert.match(prompt, /正面・側面・背面/);
  assert.match(prompt, /palette: #112233/);
  assert.match(prompt, /AI slop/);
  assert.match(prompt, /Do not render lyrics/);
});

test("imagegen saves a PNG through Codex, versions names and records the manifest", async () => {
  const root = await jobDir();
  await fs.writeFile(path.join(root, "plan/style-sheet.md"), "STYLE-MARK 紙の質感");
  const env = { ...process.env, CODEX_BIN: await fakeCodex(root, "save") };
  const first = await generateImage(
    parseArgs(["--name", "hero", "--kind", "character-sheet", "--prompt", "主人公"]),
    { root, env, log: quiet },
  );
  assert.equal(first.status, "ok");
  assert.deepEqual(await fs.readFile(path.join(root, "assets/generated/hero.png")), png);
  const prompt = await fs.readFile(path.join(root, "last-prompt.txt"), "utf8");
  assert.match(prompt, /STYLE-MARK/);
  assert.match(prompt, /1920x1080/);
  const args = JSON.parse(await fs.readFile(path.join(root, "last-args.json"), "utf8"));
  assert.ok(args.includes("exec") && args.includes("--skip-git-repo-check"));
  assert.equal(args.at(-1), "-");

  const second = await generateImage(
    parseArgs(["--name", "hero", "--kind", "motion", "--ref", "assets/generated/hero.png", "--prompt", "ジャンプ"]),
    { root, env, log: quiet },
  );
  assert.equal(second.path, "assets/generated/hero-v2.png");
  const refArgs = JSON.parse(await fs.readFile(path.join(root, "last-args.json"), "utf8"));
  assert.equal(refArgs[refArgs.indexOf("-i") + 1], path.join(root, "assets/generated/hero.png"));
  const manifest = JSON.parse(
    await fs.readFile(path.join(root, "assets/generated/manifest.json"), "utf8"),
  );
  assert.deepEqual(manifest.assets.map((a: { status: string }) => a.status), ["ok", "ok"]);
  assert.equal(manifest.assets[0].style, "plan/style-sheet.md");
});

test("imagegen continues without an asset when Codex is missing or fails", async () => {
  const root = await jobDir();
  const missing = await generateImage(
    parseArgs(["--name", "bg", "--prompt", "背景"]),
    { root, env: { ...process.env, CODEX_BIN: path.join(root, "no-such-codex.mjs") }, log: quiet },
  );
  assert.equal(missing.status, "skipped");
  assert.match(missing.reason, /not found/);
  const failing = await generateImage(
    parseArgs(["--name", "bg", "--prompt", "背景"]),
    { root, env: { ...process.env, CODEX_BIN: await fakeCodex(root, "fail") }, log: quiet },
  );
  assert.equal(failing.status, "skipped");
  const silent = await generateImage(
    parseArgs(["--name", "bg", "--prompt", "背景"]),
    { root, env: { ...process.env, CODEX_BIN: await fakeCodex(root, "nothing") }, log: quiet },
  );
  assert.match(silent.reason, /did not save/);
  await assert.rejects(fs.access(path.join(root, "assets/generated/bg.png")));
  const manifest = JSON.parse(
    await fs.readFile(path.join(root, "assets/generated/manifest.json"), "utf8"),
  );
  assert.deepEqual(
    manifest.assets.map((a: { status: string }) => a.status),
    ["skipped", "skipped", "skipped"],
  );
  await assert.rejects(
    generateImage(parseArgs(["--name", "../x", "--prompt", "p"]), { root, log: quiet }),
    /id must be/,
  );
  await assert.rejects(
    generateImage(parseArgs(["--name", "x", "--prompt", "p", "--ref", "../secret.png"]), { root, log: quiet }),
    /Path must be under|Invalid project path/,
  );
  const dry = await generateImage(
    parseArgs(["--name", "x", "--prompt", "p", "--dry-run"]),
    { root, log: quiet },
  );
  assert.equal(dry.status, "dry-run");
});
