// Codex CLI + imagegen skill wrapper for generating still assets.
// When Codex is unavailable or fails, this exits successfully without an image,
// records the reason, and lets production continue without the asset.
import fs from "node:fs/promises";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { localPath, root as jobRoot, validId } from "./lib.mjs";

export const kinds = {
  background: "背景画像。歌詞・文字を重ねる余白を意識し、画像内に文字を描かない。",
  transparent:
    "透過PNGの切り抜き素材。背景は完全な透明（アルファ）にし、色の縁残りやチェッカー柄を入れない。",
  "character-sheet":
    "キャラクターシート。同一人物の正面・側面・背面と主要な表情を1枚に並べ、配色・衣装・装飾・頭身を固定する。背景は無地。",
  motion:
    "キャラクターのモーション素材。参照画像と同じキャラ・同じ縮尺で、指定された動作の連続ポーズを透過背景で描く。",
  texture: "質感素材（紙・粒子・ノイズ・パターン等）。継ぎ目が目立たず、主題を持たない。",
  prop: "小物・モチーフの単体素材。透過背景で輪郭をはっきりさせる。",
};

const usage = `Usage: npm run imagegen -- --name <id> --prompt "<内容>" [options]
  --name <id>          出力名（英数字・-・_）。assets/generated/<id>.png に保存
  --prompt <text>      生成内容。--prompt-file plan/xxx.md でも指定可
  --kind <kind>        ${Object.keys(kinds).join(" | ")}（既定 background）
  --ref <path>         参照画像（assets/ または sources/ 内）。複数指定可
  --style <path>       スタイル定義（既定: plan/style-sheet.md があれば使用）
  --size <WxH>         目安サイズ（既定: project.video）
  --timeout <sec>      Codexの待ち時間（既定 900）
  --force              既存ファイルを上書き（既定は -v2 などの別名で保存）
  --dry-run            Codexを起動せず、コマンドとプロンプトを表示
  --strict             失敗時に終了コード1を返す（既定は0で素材なしのまま続行）
Codexの実行ファイルは環境変数 CODEX_BIN で変更できます。`;

export function parseArgs(argv) {
  const options = { refs: [], kind: "background", timeout: 900 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const next = argv[++i];
      if (next === undefined) throw new Error(`${arg} requires a value`);
      return next;
    };
    if (arg === "--name") options.name = value();
    else if (arg === "--prompt") options.prompt = value();
    else if (arg === "--prompt-file") options.promptFile = value();
    else if (arg === "--kind") options.kind = value();
    else if (arg === "--ref") options.refs.push(value());
    else if (arg === "--style") options.style = value();
    else if (arg === "--size") options.size = value();
    else if (arg === "--timeout") options.timeout = Number(value());
    else if (arg === "--force") options.force = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--strict") options.strict = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error("Unknown option: " + arg);
  }
  return options;
}

const inside = (root, relative, prefixes) => {
  const prefix = prefixes.find((p) => relative?.startsWith(p));
  if (!prefix) throw new Error(`Path must be under ${prefixes.join(" or ")}: ${relative}`);
  const resolved = localPath(relative, prefix);
  // localPath resolves against the bundled job root; re-anchor for custom roots.
  return path.resolve(root, path.relative(jobRoot, resolved));
};

export function buildPrompt({ kind, prompt, style, size, output, refs }) {
  return [
    "Use the imagegen skill (built-in image_gen tool) to create exactly one image for a music video / motion job.",
    "Follow the imagegen skill's rules. Do not switch to its CLI fallback unless it is already configured; if image generation is unavailable, stop and say so.",
    `Save the final selected image as a PNG at this path relative to the working directory: ${output}`,
    "Do not create, edit or delete any other project files. Reply briefly with the saved path.",
    "",
    `OUTPUT_PATH: ${output}`,
    `ASSET_KIND: ${kind} — ${kinds[kind]}`,
    size ? `TARGET_SIZE: about ${size}px (keep this aspect ratio)` : "",
    refs.length
      ? `REFERENCE_IMAGES: ${refs.join(", ")} — keep the character / style consistent with these references.`
      : "",
    "",
    "Quality bar: a coherent, specific art direction for this piece. Avoid generic, characterless 'AI slop' imagery, default glossy 3D-mascot looks and stock-photo clichés unless the style below asks for them.",
    "Do not render lyrics, captions, logos or watermarks inside the image unless the request explicitly asks for lettering; typography is animated in code.",
    style ? `\nSTYLE SHEET (follow it):\n${style.trim()}` : "",
    `\nREQUEST:\n${prompt.trim()}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

const isPng = (data) =>
  data.length > 64 &&
  data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

function codexCommand(env) {
  const bin = env.CODEX_BIN || "codex";
  if (/\.(mjs|cjs|js)$/i.test(bin)) return { file: process.execPath, pre: [bin], shell: false };
  return { file: bin, pre: [], shell: process.platform === "win32" };
}
const quote = (arg) => (/[\s"&|<>^]/.test(arg) ? `"${arg.replaceAll('"', '\\"')}"` : arg);

export function codexAvailable(env = process.env) {
  const command = codexCommand(env);
  const args = [...command.pre, "--version"];
  const result = spawnSync(command.file, command.shell ? args.map(quote) : args, {
    shell: command.shell,
    encoding: "utf8",
    timeout: 20000,
    env,
  });
  return !result.error && result.status === 0;
}

async function record(root, entry) {
  const file = path.join(root, "assets/generated/manifest.json");
  let manifest = { assets: [] };
  try {
    manifest = JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  manifest.assets = [...(manifest.assets ?? []), entry];
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(manifest, null, 2) + "\n");
}

function runCodex(command, args, prompt, { cwd, timeout, env }) {
  return new Promise((resolve) => {
    const child = spawn(command.file, command.shell ? args.map(quote) : args, {
      cwd,
      env,
      shell: command.shell,
      stdio: ["pipe", "inherit", "inherit"],
    });
    const timer = setTimeout(() => {
      // A Windows shell wrapper must be stopped together with its child process.
      if (process.platform === "win32" && child.pid)
        spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
      else child.kill();
      resolve({ ok: false, reason: `Codex timed out after ${timeout}s` });
    }, timeout * 1000);
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ ok: false, reason: error.message });
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      resolve(code === 0 ? { ok: true } : { ok: false, reason: `Codex exited with ${code}` });
    });
    child.stdin.on("error", () => {});
    child.stdin.end(prompt);
  });
}

export async function generateImage(options, { root = jobRoot, env = process.env, log = console.log } = {}) {
  validId(options.name);
  if (!kinds[options.kind]) throw new Error("Unknown --kind: " + options.kind);
  if (!Number.isFinite(options.timeout) || options.timeout <= 0) throw new Error("--timeout must be positive");
  let prompt = options.prompt ?? "";
  if (options.promptFile)
    prompt = await fs.readFile(inside(root, options.promptFile, ["plan/", "sources/"]), "utf8");
  if (!prompt.trim()) throw new Error("--prompt or --prompt-file is required");
  const refs = options.refs.map((ref) => {
    inside(root, ref, ["assets/", "sources/"]);
    return ref;
  });
  for (const ref of refs)
    if (!(await exists(path.join(root, ref)))) throw new Error("Reference image not found: " + ref);
  const stylePath = options.style ?? "plan/style-sheet.md";
  const styleFile = inside(root, stylePath, ["plan/", "sources/"]);
  const style = (await exists(styleFile)) ? await fs.readFile(styleFile, "utf8") : "";
  if (options.style && !style) throw new Error("Style file not found: " + options.style);
  let size = options.size;
  if (!size) {
    try {
      const project = JSON.parse(await fs.readFile(path.join(root, "project.json"), "utf8"));
      size = `${project.video.width}x${project.video.height}`;
    } catch {}
  }
  let output = `assets/generated/${options.name}.png`;
  for (let v = 2; !options.force && (await exists(path.join(root, output))); v++)
    output = `assets/generated/${options.name}-v${v}.png`;
  const fullPrompt = buildPrompt({ kind: options.kind, prompt, style, size, output, refs });
  const command = codexCommand(env);
  const args = [
    ...command.pre,
    "exec",
    "--skip-git-repo-check",
    "--sandbox",
    "workspace-write",
    "--color",
    "never",
    "-C",
    root,
    ...refs.flatMap((ref) => ["-i", path.join(root, ref)]),
    "-",
  ];
  if (options.dryRun) {
    log([command.file, ...args].join(" "));
    log(fullPrompt);
    return { status: "dry-run", path: output };
  }
  const entry = {
    name: options.name,
    kind: options.kind,
    path: output,
    prompt: prompt.trim(),
    refs,
    style: style ? stylePath : null,
    tool: "codex exec + imagegen skill",
    created_at: new Date().toISOString(),
  };
  const fail = async (reason) => {
    await record(root, { ...entry, path: null, status: "skipped", reason });
    log(
      `SKIPPED ${options.name}: ${reason}\n素材なしで制作を続行できます。代替（コード描画・提供素材）を使い、reports/delivery.mdに未生成の素材と理由を記録してください。`,
    );
    return { status: "skipped", reason };
  };
  if (!codexAvailable(env))
    return fail("Codex CLI was not found (install it or set CODEX_BIN)");
  await fs.mkdir(path.join(root, "assets/generated"), { recursive: true });
  log(`Generating ${output} with Codex (${options.kind})…`);
  const result = await runCodex(command, args, fullPrompt, { cwd: root, timeout: options.timeout, env });
  if (!result.ok) return fail(result.reason);
  let data;
  try {
    data = await fs.readFile(path.join(root, output));
  } catch {
    return fail("Codex finished but did not save " + output);
  }
  if (!isPng(data)) return fail(output + " is not a PNG image");
  await record(root, { ...entry, status: "ok", bytes: data.length });
  log(`OK ${output} — use staticFile("${output}") in scenes.`);
  return { status: "ok", path: output };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
    if (options.help) console.log(usage);
    else {
      const result = await generateImage(options);
      if (result.status === "skipped" && options.strict) process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message + "\n\n" + usage);
    process.exitCode = 1;
  }
}

