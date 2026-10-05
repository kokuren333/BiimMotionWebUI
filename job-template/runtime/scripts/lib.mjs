import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const runtime = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const root = path.resolve(runtime, "..");
export const readJSON = async (relative) =>
  JSON.parse(await fs.readFile(path.join(root, relative), "utf8"));
export async function writeJSON(relative, value) {
  const target = path.join(root, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(value, null, 2) + "\n");
}
export function localPath(relative, prefix = "assets/") {
  if (
    typeof relative !== "string" ||
    !relative.startsWith(prefix) ||
    relative.includes("\\") ||
    relative
      .split("/")
      .some((part) => part === ".." || part === "." || !part) ||
    relative.includes(":")
  )
    throw new Error("Invalid project path: " + relative);
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep))
    throw new Error("Path escaped the job");
  return target;
}
export function validId(id) {
  if (typeof id !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(id))
    throw new Error(
      "id must be 1–80 ASCII letters, digits, underscores or hyphens",
    );
  return id;
}
export function finite(value, min, max, label) {
  if (!Number.isFinite(value) || value < min || value > max)
    throw new Error(`${label}: expected ${min}–${max}`);
  return value;
}
// Legacy solo jobs keep their original model and global voice settings.
export function projectCharacters(project) {
  return (
    project.characters ?? [
      {
        ...project.character,
        id: "character1",
        voice: project.voice,
        subtitle_color: project.layout?.colors?.subtitle ?? "#ff0000",
        subtitle_outline: "#ffffff",
      },
    ]
  );
}

export function narrationSpeaker(project, segment) {
  const characters = projectCharacters(project);
  if (characters.length > 1 && !segment.speaker_id)
    throw new Error("Duo narration requires speaker_id: " + segment.id);
  const speaker = segment.speaker_id
    ? characters.find((character) => character.id === segment.speaker_id)
    : characters[0];
  if (!speaker) throw new Error("Unknown speaker_id: " + segment.speaker_id);
  return speaker;
}

export function validateCharacters(project) {
  const characters = projectCharacters(project);
  if (
    project.characters &&
    (characters.length !== (project.character_mode === "duo" ? 2 : 1) ||
      !["solo", "duo"].includes(project.character_mode))
  )
    throw new Error("Invalid character_mode / characters count");
  const ids = new Set();
  for (const character of characters) {
    validId(character.id);
    if (ids.has(character.id)) throw new Error("Duplicate character id");
    ids.add(character.id);
    if (character.model && !/\.glb$/i.test(character.model))
      throw new Error("Character model must be GLB");
    if (
      !/^#[0-9a-f]{6}$/i.test(character.subtitle_color) ||
      !/^#[0-9a-f]{6}$/i.test(character.subtitle_outline)
    )
      throw new Error("Invalid character subtitle color");
    if (project.voice.engine === "aivis") {
      if (
        !Number.isSafeInteger(character.voice?.style_id) ||
        character.voice.style_id < 0
      )
        throw new Error("Invalid character Style ID: " + character.id);
      finite(character.voice.speed, 0.5, 2, character.id + ".voice.speed");
    }
  }
  return characters;
}
export async function prepare() {
  const project = await readJSON("project.json");
  for (const file of [
    project.layout.frame,
    ...Object.values(project.layout.fonts).map((font) => font.path),
    ...projectCharacters(project).map((character) => character.model),
    project.audio.bgm,
  ].filter(Boolean))
    await fs.access(localPath(file));
  await fs.mkdir(path.join(runtime, "public"), { recursive: true });
  await fs.mkdir(path.join(root, "assets"), { recursive: true });
  const publicAssets = path.resolve(runtime, "public", "assets");
  if (!publicAssets.startsWith(path.resolve(runtime, "public") + path.sep))
    throw new Error("Unsafe generated asset directory");
  // This directory contains only generated copies. Remove stale copies before sync.
  await fs.rm(publicAssets, { recursive: true, force: true });
  await fs.cp(path.join(root, "assets"), publicAssets, { recursive: true });
  for (const name of ["narration", "sound-design"]) {
    let manifest = { clips: [] };
    try {
      manifest = await readJSON(`assets/audio/${name}.json`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    await writeJSON(`runtime/data/${name}.json`, manifest);
  }
}
export function wavBuffer(samples, sampleRate = 48000) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((value, i) =>
    buffer.writeInt16LE(
      Math.round(Math.max(-1, Math.min(1, value)) * 32767),
      44 + i * 2,
    ),
  );
  return buffer;
}
export function wavDuration(buffer) {
  if (
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WAVE"
  )
    throw new Error("Engine response is not RIFF/WAVE");
  let byteRate = 0,
    dataBytes = 0;
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const name = buffer.toString("ascii", offset, offset + 4);
    const length = buffer.readUInt32LE(offset + 4);
    if (offset + 8 + length > buffer.length) throw new Error("Truncated WAV");
    if (name === "fmt " && length >= 16)
      byteRate = buffer.readUInt32LE(offset + 16);
    if (name === "data") dataBytes += length;
    offset += 8 + length + (length % 2);
  }
  if (!byteRate || !dataBytes) throw new Error("WAV has no audio data");
  return dataBytes / byteRate;
}
