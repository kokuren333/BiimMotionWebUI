import fs from "node:fs/promises";
import path from "node:path";
import {
  finite,
  localPath,
  prepare,
  readJSON,
  root,
  validId,
  wavDuration,
  writeJSON,
} from "./lib.mjs";

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
  const plan = await readJSON("plan/narration.json");
  let segments = plan.segments;
  if (!Array.isArray(segments))
    throw new Error("plan/narration.json segments must be an array");
  if (!segments.length) {
    // BiimSlideMakerと同様、scriptを句点・疑問符・感嘆符で発話単位に分割。
    segments = (project.scenes ?? []).flatMap((scene) => {
      validId(scene.id);
      if (typeof scene.script !== "string")
        throw new Error("Scene script must be a string: " + scene.id);
      return (scene.script.match(/[^。！？!?]+[。！？!?]?/g) ?? [])
        .map((text, i) => ({
          id: `${scene.id}-${i + 1}`,
          scene_id: scene.id,
          text: text.trim(),
        }))
        .filter((segment) => segment.text);
    });
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
    const start = segment.start_sec ?? end;
    if (start < end - 0.001)
      throw new Error(
        `Narration ${segment.id} overlaps the previous segment. Adjust start_sec using measured audio duration.`,
      );
    const query = await (
      await request("audio_query", { text: segment.text, speaker: style })
    ).json();
    query.speedScale = project.voice.speed;
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
