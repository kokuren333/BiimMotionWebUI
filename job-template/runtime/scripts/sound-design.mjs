import fs from "node:fs/promises";
import path from "node:path";
import {
  finite,
  localPath,
  prepare,
  readJSON,
  root,
  validId,
  wavBuffer,
  writeJSON,
} from "./lib.mjs";

export function synthesizeCue(cue, sampleRate = 48000) {
  finite(cue.duration_sec, 0.05, 60, "duration_sec");
  if (!["bgm", "chime", "whoosh", "impact"].includes(cue.kind))
    throw new Error("kind must be bgm / chime / whoosh / impact");
  const frequency = finite(
    cue.frequency ?? (cue.kind === "impact" ? 90 : 660),
    30,
    4000,
    "frequency",
  );
  const bpm = finite(cue.bpm ?? 100, 40, 240, "bpm");
  const notes = cue.notes ?? [261.63, 329.63, 392, 329.63];
  if (!Array.isArray(notes) || !notes.length || notes.length > 64)
    throw new Error("notes must be an array of 1–64 frequencies in Hz");
  notes.forEach((note) => finite(note, 30, 4000, "note"));
  const samples = new Float32Array(Math.round(cue.duration_sec * sampleRate));
  let seed = 123456789;
  for (const char of cue.id) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  const noise = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return (seed / 4294967296) * 2 - 1;
  };
  let lastNoise = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate,
      p = t / cue.duration_sec;
    const fade = Math.min(1, t / 0.01, (cue.duration_sec - t) / 0.04);
    let value;
    if (cue.kind === "chime")
      value =
        (Math.sin(2 * Math.PI * frequency * t) * 0.6 +
          Math.sin(2 * Math.PI * frequency * 1.5 * t) * 0.25) *
        Math.exp(-p * 7);
    else if (cue.kind === "impact")
      value =
        Math.sin(2 * Math.PI * frequency * 0.09 * (1 - Math.exp(-t / 0.09))) *
          Math.exp(-p * 8) *
          0.8 +
        noise() * 0.1 * Math.exp(-p * 16);
    else if (cue.kind === "whoosh") {
      lastNoise = 0.7 * lastNoise + 0.3 * noise();
      value = lastNoise * Math.sin(Math.PI * p) * 0.9;
    } else {
      const beat = 60 / bpm,
        step = Math.floor(t / beat),
        local = t % beat,
        note = notes[step % notes.length];
      value =
        (Math.sin(2 * Math.PI * note * local) * 0.45 +
          Math.sin(((2 * Math.PI * note) / 2) * local) * 0.22) *
        Math.exp((-local / beat) * 4) *
        Math.min(1, local / 0.012);
    }
    samples[i] = value * Math.max(0, fade);
  }
  return wavBuffer(samples, sampleRate);
}

export async function createSoundDesign() {
  const project = await readJSON("project.json");
  if (!project.audio.generate_bgm_se) {
    console.log("BGM/SE generation disabled by project settings.");
    return;
  }
  const { cues } = await readJSON("plan/sound-design.json");
  if (!Array.isArray(cues) || !cues.length || cues.length > 100)
    throw new Error("Write 1–100 cues to plan/sound-design.json first.");
  const ids = new Set();
  for (const cue of cues) {
    validId(cue.id);
    if (ids.has(cue.id)) throw new Error("Duplicate sound id");
    ids.add(cue.id);
    finite(cue.start_sec, 0, 7200, "start_sec");
    finite(cue.volume ?? 0.15, 0, 1, "volume");
    if (cue.loop !== undefined && typeof cue.loop !== "boolean")
      throw new Error("loop must be boolean");
    if (cue.play_duration_sec !== undefined)
      finite(
        cue.play_duration_sec,
        cue.duration_sec,
        7200,
        "play_duration_sec",
      );
    // Validate the cue before writing any files.
    finite(cue.duration_sec, 0.05, 60, "duration_sec");
    if (!["bgm", "chime", "whoosh", "impact"].includes(cue.kind))
      throw new Error("Unknown sound kind");
    finite(cue.frequency ?? 660, 30, 4000, "frequency");
    finite(cue.bpm ?? 100, 40, 240, "bpm");
    if (cue.notes !== undefined) {
      if (
        !Array.isArray(cue.notes) ||
        !cue.notes.length ||
        cue.notes.length > 64
      )
        throw new Error("Invalid notes");
      cue.notes.forEach((note) => finite(note, 30, 4000, "note"));
    }
  }
  await fs.mkdir(path.join(root, "assets", "audio"), { recursive: true });
  const clips = [];
  for (const cue of cues) {
    const relative = `assets/audio/sound-${cue.id}.wav`;
    const data = synthesizeCue(cue);
    await fs.writeFile(localPath(relative), data);
    clips.push({
      id: cue.id,
      kind: cue.kind,
      path: relative,
      start_sec: cue.start_sec,
      duration_sec: cue.duration_sec,
      volume: cue.volume ?? 0.15,
      loop: cue.loop ?? false,
      play_duration_sec: cue.play_duration_sec ?? cue.duration_sec,
    });
    console.log(`${cue.id}: ${cue.kind}, ${cue.duration_sec} sec`);
  }
  await writeJSON("assets/audio/sound-design.json", {
    clips,
    method: "deterministic procedural synthesis / 48 kHz mono PCM16",
  });
  await prepare();
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.join(root, "runtime", "scripts", "sound-design.mjs")
) {
  createSoundDesign().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
