import fs from "node:fs/promises";
import path from "node:path";
import {
  finite,
  localPath,
  narrationSpeaker,
  projectCharacters,
  prepare,
  readJSON,
  root,
  validId,
  validateCharacters,
  wavDuration,
  writeJSON,
} from "./lib.mjs";

export function sceneSegments(project) {
  return (project.scenes ?? []).flatMap((scene) => {
    validId(scene.id);
    if (
      scene.dialogue !== undefined &&
      (!Array.isArray(scene.dialogue) || !scene.dialogue.length)
    )
      throw new Error("Scene dialogue must be a non-empty array: " + scene.id);
    if (
      project.character_mode === "duo" &&
      !scene.dialogue &&
      !scene.speaker_id
    )
      throw new Error(
        "Duo scenes require dialogue with speaker_id: " + scene.id,
      );
    const turns = scene.dialogue ?? [
      { text: scene.script, speaker_id: scene.speaker_id },
    ];
    return turns.flatMap((turn, turnIndex) => {
      if (typeof turn.text !== "string" || !turn.text.trim())
        throw new Error("Scene narration text is empty: " + scene.id);
      const texts =
        turn.spoken_text !== undefined
          ? [turn.text]
          : (turn.text.match(/[^。！？!?]+[。！？!?]?/g) ?? []);
      return texts
        .map((text, i) => ({
          id: scene.dialogue
            ? `${scene.id}-${turnIndex + 1}-${i + 1}`
            : `${scene.id}-${i + 1}`,
          scene_id: scene.id,
          text: text.trim(),
          ...(turn.speaker_id ? { speaker_id: turn.speaker_id } : {}),
          ...(turn.spoken_text !== undefined
            ? { spoken_text: turn.spoken_text }
            : {}),
        }))
        .filter((segment) => segment.text);
    });
  });
}

export function spokenText(project, segment) {
  if (segment.spoken_text !== undefined) return segment.spoken_text;
  const names = projectCharacters(project)
    .filter((character) => character.name && character.reading)
    .sort((a, b) => b.name.length - a.name.length);
  if (!names.length) return segment.text;
  const escaped = names.map((character) =>
    character.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  return segment.text.replace(
    new RegExp(escaped.join("|"), "g"),
    (name) => names.find((character) => character.name === name).reading,
  );
}

export async function synthesizeNarration() {
  const project = await readJSON("project.json");
  if (project.voice.engine === "none") {
    console.log("Voice synthesis disabled by project settings.");
    return;
  }
  if (project.voice.engine !== "aivis")
    throw new Error("Unsupported voice engine");
  const engine = new URL(project.voice.engine_url);
  if (!["http:", "https:"].includes(engine.protocol))
    throw new Error("Aivis requires HTTP(S)");
  const style = project.voice.style_id;
  if (!Number.isSafeInteger(style) || style < 0)
    throw new Error("Invalid Aivis Style ID");
  finite(project.voice.speed, 0.5, 2, "voice.speed");
  validateCharacters(project);
  const plan = await readJSON("plan/narration.json");
  let segments = plan.segments;
  if (!Array.isArray(segments))
    throw new Error("plan/narration.json segments must be an array");
  if (!segments.length) {
    segments = sceneSegments(project);
  }
  if (!segments.length)
    throw new Error(
      "Write project.json scenes[].script or plan/narration.json segments before synthesizing.",
    );
  const ids = new Set();
  for (const segment of segments) {
    validId(segment.id);
    if (ids.has(segment.id)) throw new Error("Duplicate narration id");
    ids.add(segment.id);
    if (typeof segment.text !== "string" || !segment.text.trim())
      throw new Error("Narration text is empty");
    if (
      segment.spoken_text !== undefined &&
      (typeof segment.spoken_text !== "string" || !segment.spoken_text.trim())
    )
      throw new Error("spoken_text must be a non-empty string");
    narrationSpeaker(project, segment);
    if (segment.start_sec !== undefined)
      finite(segment.start_sec, 0, 7200, "start_sec");
  }
  const request = async (endpoint, query, body) => {
    const url = new URL(engine.href.replace(/\/$/, "") + "/" + endpoint);
    for (const [key, value] of Object.entries(query))
      url.searchParams.set(key, String(value));
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        ...(body
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }
          : {}),
        signal: AbortSignal.timeout(120000),
      });
    } catch (error) {
      throw new Error(
        `Aivis ${endpoint}: start the engine at ${engine.origin}. ${error.message}`,
      );
    }
    if (!response.ok)
      throw new Error(
        `Aivis ${endpoint}: HTTP ${response.status} ${await response.text()}`,
      );
    return response;
  };
  await fs.mkdir(path.join(root, "assets", "audio"), { recursive: true });
  const clips = [];
  const pending = [];
  let end = 0;
  for (const segment of segments) {
    const speaker = narrationSpeaker(project, segment);
    const style = speaker.voice.style_id;
    const start = segment.start_sec ?? end;
    if (start < end - 0.001)
      throw new Error(
        `Narration ${segment.id} overlaps the previous segment. Adjust start_sec using measured audio duration.`,
      );
    const query = await (
      await request("audio_query", {
        text: spokenText(project, segment),
        speaker: style,
      })
    ).json();
    query.speedScale = speaker.voice.speed;
    const audio = Buffer.from(
      await (
        await request(
          "synthesis",
          { speaker: style, enable_interrogative_upspeak: true },
          query,
        )
      ).arrayBuffer(),
    );
    const duration = wavDuration(audio);
    const relative = `assets/audio/voice-${segment.id}.wav`;
    pending.push({ relative, audio });
    clips.push({
      id: segment.id,
      speaker_id: speaker.id,
      ...(segment.scene_id ? { scene_id: segment.scene_id } : {}),
      path: relative,
      text: segment.text,
      start_sec: start,
      duration_sec: duration,
    });
    end = start + duration;
    console.log(
      `${segment.id}: ${duration.toFixed(3)} sec at ${start.toFixed(3)}`,
    );
  }
  for (const item of pending)
    await fs.writeFile(localPath(item.relative), item.audio);
  await writeJSON("assets/audio/narration.json", { clips });
  const stamp = (value) => {
    const ms = Math.round(value * 1000);
    return `${String(Math.floor(ms / 3600000)).padStart(2, "0")}:${String(Math.floor(ms / 60000) % 60).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
  };
  await fs.writeFile(
    path.join(root, "assets", "audio", "narration.srt"),
    clips
      .map(
        (clip, i) =>
          `${i + 1}\n${stamp(clip.start_sec)} --> ${stamp(clip.start_sec + clip.duration_sec)}\n${clip.text}\n`,
      )
      .join("\n"),
  );
  await prepare();
  console.log(
    "Narration and segment-level captions saved. Update the scene timing to measured durations.",
  );
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.join(root, "runtime", "scripts", "aivis.mjs")
) {
  synthesizeNarration().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
