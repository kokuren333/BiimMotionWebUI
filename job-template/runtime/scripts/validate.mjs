import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import {
  finite,
  localPath,
  narrationSpeaker,
  projectCharacters,
  prepare,
  readJSON,
  root,
  runtime,
  validId,
  validateCharacters,
  wavDuration,
} from "./lib.mjs";
import { sceneSegments } from "./aivis.mjs";

const require = createRequire(import.meta.url);
const errors = [];
const check = async (label, fn) => {
  try {
    await fn();
    console.log("OK " + label);
  } catch (error) {
    errors.push(label + ": " + error.message);
  }
};
let project;
await check("project.json", async () => {
  project = await readJSON("project.json");
  if (!project.title?.trim()) throw new Error("Title is missing");
  for (const field of ["width", "height"]) {
    const value = finite(project.video[field], 240, 7680, field);
    if (!Number.isInteger(value) || value % 2)
      throw new Error(field + " must be an even integer");
  }
  if (![24, 25, 30, 60].includes(project.video.fps))
    throw new Error("Unsupported fps");
  finite(project.video.target_duration_sec, 5, 7200, "target_duration_sec");
  if (
    project.video.height > project.video.width &&
    (project.direction.biim_usage !== "never" ||
      project.layout.frame ||
      project.layout.mode !== "fullscreen")
  )
    throw new Error("Portrait video must use fullscreen without a Biim frame");
  if (
    project.layout.mode === "fullscreen" &&
    (project.direction.biim_usage !== "never" || project.layout.frame)
  )
    throw new Error("Fullscreen video must disable Biim");
  validateCharacters(project);
  if (!["aivis", "none"].includes(project.voice.engine))
    throw new Error("Unsupported voice engine");
  if (project.voice.engine === "aivis") {
    if (
      !["http:", "https:"].includes(new URL(project.voice.engine_url).protocol)
    )
      throw new Error("Invalid engine URL");
    if (
      !Number.isSafeInteger(project.voice.style_id) ||
      project.voice.style_id < 0
    )
      throw new Error("Invalid style_id");
    finite(project.voice.speed, 0.5, 2, "voice.speed");
  }
});
if (project) {
  await check("sources and assets", async () => {
    for (const source of project.sources) {
      if (source.kind === "file")
        await fs.access(localPath(source.path, "sources/"));
      else if (
        source.kind === "url" &&
        !["http:", "https:"].includes(new URL(source.url).protocol)
      )
        throw new Error("Invalid source URL");
    }
    for (const asset of [
      project.layout.frame,
      ...Object.values(project.layout.fonts).map((font) => font.path),
      ...projectCharacters(project).map((character) => character.model),
      project.audio.bgm,
    ].filter(Boolean))
      await fs.access(localPath(asset));
  });
  await check("audio manifests", async () => {
    for (const name of ["narration", "sound-design"]) {
      let manifest;
      try {
        manifest = await readJSON(`assets/audio/${name}.json`);
      } catch (error) {
        if (error.code === "ENOENT") continue;
        throw error;
      }
      if (!Array.isArray(manifest.clips))
        throw new Error("clips must be an array");
      const ids = new Set();
      let voiceEnd = 0;
      for (const clip of manifest.clips) {
        validId(clip.id);
        if (ids.has(clip.id)) throw new Error("Duplicate clip id");
        ids.add(clip.id);
        finite(clip.start_sec, 0, 7200, "start_sec");
        finite(clip.duration_sec, 0.001, 7200, "duration_sec");
        if (clip.play_duration_sec !== undefined)
          finite(
            clip.play_duration_sec,
            clip.duration_sec,
            7200,
            "play_duration_sec",
          );
        if (clip.volume !== undefined) finite(clip.volume, 0, 1, "volume");
        const data = await fs.readFile(localPath(clip.path));
        if (Math.abs(wavDuration(data) - clip.duration_sec) > 0.02)
          throw new Error("Duration does not match WAV: " + clip.id);
        if (name === "narration") {
          narrationSpeaker(project, clip);
          if (clip.start_sec < voiceEnd - 0.001)
            throw new Error("Overlapping narration: " + clip.id);
          voiceEnd = clip.start_sec + clip.duration_sec;
          if (!clip.text?.trim())
            throw new Error("Missing caption: " + clip.id);
        }
      }
    }
  });
}
await check("sync public assets", prepare);
await check("TypeScript", async () => {
  const tsc = require.resolve("typescript/bin/tsc");
  const result = spawnSync(
    process.execPath,
    [tsc, "--noEmit", "-p", "tsconfig.json"],
    { cwd: runtime, encoding: "utf8" },
  );
  if (result.error || result.status !== 0)
    throw new Error(result.error?.message ?? result.stdout + result.stderr);
});
if (process.argv.includes("--final")) {
  await check("completion records", async () => {
    if (!project?.scenes?.length)
      throw new Error(
        "Replace the starter scene and record the actual scene inventory in project.json",
      );
    for (const scene of project.scenes) {
      validId(scene.id);
      if (!scene.script?.trim() && !scene.dialogue?.length)
        throw new Error("Scene script / dialogue missing");
      if (scene.biim === true && project.layout.mode === "fullscreen")
        throw new Error("Biim scene forbidden in fullscreen mode");
      if (
        typeof scene.note_top !== "string" ||
        typeof scene.note_bottom !== "string"
      )
        throw new Error("Scene note_top / note_bottom must be strings");
      finite(scene.duration_sec, 0.001, 7200, "scene duration");
    }
    for (const segment of sceneSegments(project))
      narrationSpeaker(project, segment);
    for (const file of [
      "plan/script.md",
      "plan/storyboard.md",
      "plan/sources.md",
      "reports/visual-qa.md",
      "reports/delivery.md",
    ]) {
      const text = await fs.readFile(path.join(root, file), "utf8");
      if (text.trim().length < 40)
        throw new Error("Missing or empty completion record: " + file);
    }
    if (
      project.voice.engine === "aivis" &&
      !(await readJSON("assets/audio/narration.json")).clips.length
    )
      throw new Error("Aivis narration is not generated");
  });
  await check("preview and final MP4", async () => {
    for (const name of ["preview", "final"]) {
      const handle = await fs.open(path.join(root, `output/${name}.mp4`));
      try {
        const stat = await handle.stat();
        const header = Buffer.alloc(32);
        await handle.read(header, 0, 32, 0);
        if (stat.size < 1024 || !header.includes(Buffer.from("ftyp")))
          throw new Error(name + ".mp4 is not a valid MP4 container");
      } finally {
        await handle.close();
      }
    }
  });
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "Structural checks passed. Visual and audio QA still requires watching and listening.",
  );
