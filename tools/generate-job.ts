import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import fontAssets from "../src/font-assets.json" with { type: "json" };
import {
  defaults, generateJob, safeName, validateForm,
  type Attachment, type JobAssets, type MotionForm, type TemplateFiles,
} from "../src/job.ts";

// Run from any working directory:
// node --experimental-strip-types tools/generate-job.ts input.json --out=jobs
const repository = fileURLToPath(new URL("../", import.meta.url));
const usage = "Usage: node --experimental-strip-types tools/generate-job.ts <input.json> --out=<dir>";
const mimeTypes: Record<string, string> = {
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".csv": "text/csv",
  ".tsv": "text/tab-separated-values",
  ".json": "application/json",
  ".html": "text/html",
  ".htm": "text/html",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".glb": "model/gltf-binary",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function rejectUnknown(value: Record<string, unknown>, keys: object, label: string, errors: string[]) {
  for (const key of Object.keys(value))
    if (!Object.hasOwn(keys, key)) errors.push(`Unknown key: ${label}.${key}`);
}

// defaults carries every MotionForm key; use it as the runtime key/type schema.
// Semantic choices and ranges remain the responsibility of validateForm.
function checkFields(value: Record<string, unknown>, schema: object, label: string, errors: string[]) {
  rejectUnknown(value, schema, label, errors);
  for (const [key, expected] of Object.entries(schema)) {
    if (!Object.hasOwn(value, key)) continue;
    const actual = value[key];
    if (isObject(expected)) {
      if (!isObject(actual)) errors.push(`${label}.${key} must be an object`);
      else checkFields(actual, expected, `${label}.${key}`, errors);
    } else if (expected === null) {
      if (actual !== null && (typeof actual !== "number" || !Number.isFinite(actual)))
        errors.push(`${label}.${key} must be a number or null`);
    } else if (typeof actual !== typeof expected || (typeof actual === "number" && !Number.isFinite(actual))) {
      errors.push(`${label}.${key} must be ${typeof expected}`);
    }
  }
}

async function readInput(filename: string): Promise<{ form: MotionForm; assets: JobAssets }> {
  // Accept UTF-8 JSON with or without the BOM commonly written by Windows tools.
  const input: unknown = JSON.parse((await fs.readFile(filename, "utf8")).replace(/^\uFEFF/, ""));
  if (!isObject(input)) throw new Error("Input must be an object with form and optional assets");
  const errors: string[] = [];
  rejectUnknown(input, { form: true, assets: true }, "input", errors);
  if (!isObject(input.form)) errors.push("form must be an object");
  else checkFields(input.form, defaults, "form", errors);
  const assets = input.assets === undefined ? {} : input.assets;
  if (!isObject(assets)) errors.push("assets must be an object");
  else {
    rejectUnknown(assets, { sources: true, character: true, secondCharacter: true, bgm: true, music: true }, "assets", errors);
    if (assets.sources !== undefined && (!Array.isArray(assets.sources) ||
      assets.sources.some((item) => typeof item !== "string" || !item.trim())))
      errors.push("assets.sources must be an array of nonempty file paths");
    for (const key of ["character", "secondCharacter", "bgm", "music"])
      if (assets[key] !== undefined && assets[key] !== null &&
        (typeof assets[key] !== "string" || !(assets[key] as string).trim()))
        errors.push(`assets.${key} must be a nonempty file path or null`);
  }
  if (errors.length) throw new Error(errors.join("\n"));
  const partial = input.form as Partial<MotionForm>;
  const form: MotionForm = {
    ...defaults, ...partial,
    secondCharacter: { ...defaults.secondCharacter, ...partial.secondCharacter },
  };
  const paths = assets as Record<string, unknown>;
  const readAttachment = async (name: string): Promise<Attachment> => {
    const resolved = path.resolve(path.dirname(filename), name);
    const data = new Uint8Array(await fs.readFile(resolved));
    return {
      name: path.basename(resolved), size: data.byteLength, data,
      type: mimeTypes[path.extname(resolved).toLowerCase()] ?? "application/octet-stream",
    };
  };
  const attachments: JobAssets = { sources: [] };
  for (const source of (paths.sources ?? []) as string[])
    attachments.sources.push(await readAttachment(source));
  for (const key of ["character", "secondCharacter", "bgm", "music"] as const)
    if (typeof paths[key] === "string") attachments[key] = await readAttachment(paths[key]);
  const validationErrors = validateForm(form, attachments);
  if (validationErrors.length) throw new Error(validationErrors.join("\n"));
  return { form, assets: attachments };
}

async function loadTemplates(): Promise<TemplateFiles> {
  const templates: TemplateFiles = {};
  const root = path.join(repository, "job-template");
  async function walk(directory: string) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      // Vite's import.meta.glob("../job-template/**/*") excludes dot entries
      // and node_modules. Raw imports decode template files as UTF-8.
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(filename);
      else templates[path.relative(root, filename).replaceAll("\\", "/")] = await fs.readFile(filename, "utf8");
    }
  }
  await walk(root);
  for (const asset of fontAssets) {
    const data = new Uint8Array(await fs.readFile(path.join(repository, "public/job-assets/fonts", asset.name)));
    if (createHash("sha256").update(data).digest("hex") !== asset.sha256)
      throw new Error(`標準フォントの整合性を確認できません: ${asset.name}`);
    templates[`assets/fonts/${asset.name}`] = data;
  }
  return templates;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    console.log(usage);
    return;
  }
  const inputs = args.filter((arg) => !arg.startsWith("-"));
  const outputs = args.filter((arg) => arg.startsWith("--out="));
  if (args.length !== 2 || inputs.length !== 1 || outputs.length !== 1 || !outputs[0].slice(6).trim())
    throw new Error(usage);
  const { form, assets } = await readInput(path.resolve(inputs[0]));
  const output = path.resolve(outputs[0].slice(6));
  const rootName = safeName(form.title.trim());
  const destination = path.join(output, rootName);
  try {
    await fs.lstat(destination);
    throw new Error(`Output already exists: ${destination}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const job = await generateJob(form, assets, await loadTemplates());
  const zip = await JSZip.loadAsync(job.data);
  // Check the complete ZIP before creating anything under --out.
  const files = Object.entries(zip.files).filter(([, entry]) => !entry.dir).map(([name, entry]) => {
    const target = path.resolve(output, name);
    if (!name.startsWith(`${rootName}/`) || !target.startsWith(destination + path.sep))
      throw new Error(`Unsafe job path: ${name}`);
    return { target, entry };
  });
  await fs.mkdir(output, { recursive: true });
  // Exclusive reservation also rejects a folder created after the lstat check.
  await fs.mkdir(destination);
  for (const { target, entry } of files) {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, await entry.async("uint8array"), { flag: "wx" });
  }
  console.log(`Created ${destination}`);
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
