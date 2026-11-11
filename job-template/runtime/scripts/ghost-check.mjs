// Render-ghost check for a rendered video (see ghost-analysis.mjs for why).
//
//   node scripts/ghost-check.mjs [--target=preview|final]
//                                [--video=output/final.mp4]
//                                [--double-render] [--keep]
//                                [--tile-threshold=12] [--min-tiles=1]
//                                [--stills|--no-stills] [--max-stills=12]
//
// Always on: decode the video at 480x270 grayscale and report elements that
// exist for exactly one frame (ghost signature / too-brief text). Runs on
// the preview render too (--target=preview), so problems surface before the
// expensive final render.
//
// The hits are classified (ghost-analysis.mjs classifyFlashEvents):
// isolated single-frame flashes are the ghost suspects, while hits packed
// into consecutive-frame runs usually belong to transitions, strobes or
// dense camera work. Unless --no-stills, the worst frames are also exported
// as PNG stills (frame-1 / frame / frame+1) under reports/ghost-stills/ so
// the visual check can happen without scrubbing the video by hand.
//
// Outputs (for final: ghost-check.*, for other videos: ghost-check-<name>.*):
//   reports/ghost-check.md    human report
//   reports/ghost-check.json  machine-readable summary (WebUI reads this)
// --double-render (final only): render the same code a second time into
// output/final.ghostcheck.mp4 and report every frame where the two renders
// disagree. The second render is deleted afterwards unless --keep.
//
// Findings are a report, never a verdict: intentional strobes and 1-frame
// accents exist. validate.mjs imports analyzeGhosts() from here for its
// advisory --final scan; running this file directly is the explicit,
// louder variant (stills + JSON included).
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { prepare, readJSON, root, runtime } from "./lib.mjs";
import {
  classifyFlashEvents,
  compareFrameSequences,
  detectSingleFrameEvents,
  formatTime,
  tileSignatures,
  withTimes,
} from "./ghost-analysis.mjs";

const require = createRequire(import.meta.url);
const SCAN_WIDTH = 480;
const SCAN_HEIGHT = 270;
const TILE_COLS = 10;
const TILE_ROWS = 6;

const TARGET_VIDEOS = {
  final: "output/final.mp4",
  preview: "output/preview.mp4",
};

/** Report file stem: final keeps the historic ghost-check.* names. */
export function ghostReportStem(video) {
  const base = path.basename(video).replace(/\.[^.]+$/, "");
  return base === "final" ? "ghost-check" : `ghost-check-${base}`;
}

/** Locate an ffmpeg binary: env override, PATH, then Remotion's compositor. */
export async function findFfmpeg() {
  const candidates = [];
  if (process.env.FFMPEG_PATH) candidates.push(process.env.FFMPEG_PATH);
  candidates.push("ffmpeg");
  const compositorPackages = [
    `@remotion/compositor-${process.platform}-${process.arch}${
      process.platform === "win32" ? "-msvc" : process.platform === "linux" ? "-gnu" : ""
    }`,
    `@remotion/compositor-${process.platform}-${process.arch}`,
  ];
  for (const pkg of compositorPackages) {
    try {
      const meta = require.resolve(`${pkg}/package.json`);
      candidates.push(
        path.join(
          path.dirname(meta),
          process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg",
        ),
      );
    } catch {
      // compositor package not installed for this platform; ignore.
    }
  }
  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ["-version"], { encoding: "utf8" });
    if (!probe.error && probe.status === 0) return candidate;
  }
  return null;
}

/**
 * Decode a video to per-frame tile signatures at 480x270 grayscale.
 * Streams ffmpeg output, so memory stays at one signature per frame.
 */
export async function decodeTileSignatures(ffmpeg, videoPath) {
  const frameBytes = SCAN_WIDTH * SCAN_HEIGHT;
  const child = spawn(
    ffmpeg,
    [
      "-nostdin",
      "-v",
      "error",
      "-i",
      videoPath,
      "-vf",
      `scale=${SCAN_WIDTH}:${SCAN_HEIGHT},format=gray`,
      "-an",
      "-f",
      "rawvideo",
      "-",
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr = (stderr + chunk).slice(-2000);
  });
  const signatures = [];
  let pending = Buffer.alloc(0);
  for await (const chunk of child.stdout) {
    pending = pending.length ? Buffer.concat([pending, chunk]) : chunk;
    while (pending.length >= frameBytes) {
      signatures.push(
        tileSignatures(
          pending.subarray(0, frameBytes),
          SCAN_WIDTH,
          SCAN_HEIGHT,
          TILE_COLS,
          TILE_ROWS,
        ),
      );
      pending = pending.subarray(frameBytes);
    }
  }
  const code = await new Promise((resolve) => child.on("close", resolve));
  if (code !== 0)
    throw new Error(`ffmpeg failed to decode ${videoPath}: ${stderr.trim()}`);
  return signatures;
}

/** Render final a second time (same invocation as run.mjs build). */
async function renderSecondCopy(outputName) {
  await prepare();
  const cliPackage = require.resolve("@remotion/cli/package.json");
  const cliMeta = JSON.parse(await fs.readFile(cliPackage, "utf8"));
  const executable = path.resolve(
    path.dirname(cliPackage),
    typeof cliMeta.bin === "string" ? cliMeta.bin : cliMeta.bin.remotion,
  );
  const code = await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        executable,
        "render",
        "src/index.ts",
        "MainVideo",
        `../output/${outputName}`,
        "--codec=h264",
        "--audio-codec=aac",
        "--pixel-format=yuv420p",
        // Same GPU (NVENC) settings as run.mjs build; see run.mjs for why
        // the explicit bitrate is required alongside hardware acceleration.
        "--hardware-acceleration",
        "if-possible",
        "--video-bitrate",
        "16M",
      ],
      { cwd: runtime, stdio: "inherit" },
    );
    child.on("error", reject);
    child.on("exit", resolve);
  });
  if (code !== 0) throw new Error("second render failed with code " + code);
}

const tileCount = (event) =>
  Array.isArray(event.tiles) ? event.tiles.length : (event.tiles ?? 0);

/**
 * Pick the frames that deserve a still: the strongest isolated flashes
 * first (ghost suspects), then the representative frame (largest tile
 * count) of the strongest clustered runs.
 */
export function selectStillFrames(result, maxStills = 12) {
  const picked = [];
  const byTiles = (a, b) => tileCount(b) - tileCount(a);
  const isolated = [...result.classification.isolated].sort(byTiles);
  const isolatedSlots = Math.min(isolated.length, Math.ceil(maxStills * 2 / 3));
  for (const event of isolated.slice(0, isolatedSlots))
    picked.push({ frame: event.frame, kind: "isolated" });
  const eventByFrame = new Map(
    result.singleFrameEvents.map((event) => [event.frame, event]),
  );
  const runs = [...result.classification.clustered].sort(
    (a, b) => b.maxTiles - a.maxTiles,
  );
  for (const run of runs) {
    if (picked.length >= maxStills) break;
    let representative = run.frames[0];
    for (const frame of run.frames)
      if (tileCount(eventByFrame.get(frame) ?? {}) > tileCount(eventByFrame.get(representative) ?? {}))
        representative = frame;
    picked.push({ frame: representative, kind: "cluster" });
  }
  for (const event of isolated.slice(isolatedSlots)) {
    if (picked.length >= maxStills) break;
    picked.push({ frame: event.frame, kind: "isolated" });
  }
  return picked.sort((a, b) => a.frame - b.frame);
}

/** Extract frame-1 / frame / frame+1 PNGs for each picked frame. */
async function extractStills(ffmpeg, videoPath, result, picked) {
  const base = path.basename(result.video).replace(/\.[^.]+$/, "");
  const stillsDir = path.join(root, "reports", "ghost-stills");
  await fs.mkdir(stillsDir, { recursive: true });
  const stills = [];
  for (const pick of picked) {
    const files = [];
    for (const [suffix, offset] of [["prev", -1], ["", 0], ["next", 1]]) {
      const frame = pick.frame + offset;
      if (frame < 0 || frame >= result.frames) continue;
      const name = `${base}-f${pick.frame}${suffix ? "-" + suffix : ""}.png`;
      const out = path.join(stillsDir, name);
      const code = await new Promise((resolve, reject) => {
        const child = spawn(
          ffmpeg,
          [
            "-nostdin",
            "-v",
            "error",
            "-ss",
            String(frame / result.fps),
            "-i",
            videoPath,
            "-frames:v",
            "1",
            "-vf",
            "scale='min(1280,iw)':-2",
            "-y",
            out,
          ],
          { stdio: ["ignore", "ignore", "pipe"] },
        );
        child.on("error", reject);
        child.on("exit", resolve);
      });
      if (code === 0) files.push(`ghost-stills/${name}`);
    }
    if (files.length)
      stills.push({
        frame: pick.frame,
        time: formatTime(pick.frame / result.fps),
        kind: pick.kind,
        files,
      });
  }
  return { stills };
}

/** Machine-readable summary (reports/<stem>.json), read by the WebUI. */
export function ghostMachineSummary(result) {
  const summary = {
    kind: "biim-ghost-check",
    version: 1,
    video: result.video,
    fps: result.fps,
    frames: result.frames,
    duration: formatTime(result.frames / result.fps),
    counts: {
      singleFrameEvents: result.singleFrameEvents.length,
      isolated: result.classification.isolatedCount,
      clusteredRuns: result.classification.clusteredRunCount,
      clusteredEvents: result.classification.clusteredEventCount,
    },
    isolated: result.classification.isolated.map((event) => ({
      frame: event.frame,
      time: event.time,
      tiles: tileCount(event),
      tileIndices: Array.isArray(event.tiles) ? event.tiles : undefined,
    })),
    clustered: result.classification.clustered.map((run) => ({
      startFrame: run.startFrame,
      endFrame: run.endFrame,
      startTime: formatTime(run.startFrame / result.fps),
      endTime: formatTime(run.endFrame / result.fps),
      events: run.frames.length,
      maxTiles: run.maxTiles,
    })),
    worst: [...result.singleFrameEvents]
      .sort((a, b) => tileCount(b) - tileCount(a))
      .slice(0, 10)
      .map((event) => ({
        frame: event.frame,
        time: event.time,
        tiles: tileCount(event),
      })),
    stills: result.stills ?? [],
  };
  if (result.doubleRender)
    summary.doubleRender = {
      comparedFrames: result.doubleRender.comparedFrames,
      mismatchCount: result.doubleRender.mismatches.length,
      mismatches: result.doubleRender.mismatches.slice(0, 200),
    };
  if (result.doubleRenderSkipped)
    summary.doubleRenderSkipped = result.doubleRenderSkipped;
  return summary;
}

/**
 * Full advisory analysis. Never throws for "findings"; throws only for
 * broken inputs (missing video, undecodable video). Returns
 * { skipped: reason } when ffmpeg is unavailable.
 * stills defaults to false so validate.mjs's advisory scan stays light;
 * the CLI turns it on.
 */
export async function analyzeGhosts({
  video,
  target,
  doubleRender = false,
  keep = false,
  tileThreshold,
  minTiles,
  stills = false,
  maxStills = 12,
} = {}) {
  const resolvedVideo =
    video ?? TARGET_VIDEOS[target ?? "final"] ?? TARGET_VIDEOS.final;
  const ffmpeg = await findFfmpeg();
  if (!ffmpeg) return { skipped: "ffmpeg not found on PATH or in Remotion" };
  const videoPath = path.join(root, resolvedVideo);
  await fs.access(videoPath);
  let fps = 30;
  try {
    fps = (await readJSON("project.json")).video.fps ?? 30;
  } catch {
    // project.json unreadable here; validate reports that separately.
  }
  const options = { tileThreshold, minTiles };
  const signatures = await decodeTileSignatures(ffmpeg, videoPath);
  const singleFrameEvents = withTimes(
    detectSingleFrameEvents(signatures, options),
    fps,
  );
  const classification = classifyFlashEvents(singleFrameEvents);
  classification.clustered = classification.clustered.map((run) => ({
    ...run,
    startTime: formatTime(run.startFrame / fps),
    endTime: formatTime(run.endFrame / fps),
  }));
  const result = {
    video: resolvedVideo,
    fps,
    frames: signatures.length,
    singleFrameEvents,
    classification,
  };
  const base = path.basename(resolvedVideo).replace(/\.[^.]+$/, "");
  if (doubleRender && base !== "final") {
    // A build-quality re-render compared against a preview proves nothing
    // (different scale/codec), so double render is final-only.
    result.doubleRenderSkipped =
      "double-render comparison is only supported for output/final.mp4";
  } else if (doubleRender) {
    const copyName = `${base}.ghostcheck.mp4`;
    const copyPath = path.join(root, "output", copyName);
    try {
      await renderSecondCopy(copyName);
      const copySignatures = await decodeTileSignatures(ffmpeg, copyPath);
      result.doubleRender = {
        comparedFrames: Math.min(signatures.length, copySignatures.length),
        frameCounts: [signatures.length, copySignatures.length],
        mismatches: withTimes(
          compareFrameSequences(signatures, copySignatures, options),
          fps,
        ),
      };
    } finally {
      if (!keep) await fs.rm(copyPath, { force: true });
    }
  }
  if (stills) {
    const picked = selectStillFrames(result, maxStills);
    result.stills = picked.length
      ? (await extractStills(ffmpeg, videoPath, result, picked)).stills
      : [];
  }
  const stem = ghostReportStem(resolvedVideo);
  result.report = formatGhostReport(result);
  const reportPath = path.join(root, "reports", `${stem}.md`);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, result.report);
  result.reportPath = `reports/${stem}.md`;
  const jsonPath = path.join(root, "reports", `${stem}.json`);
  await fs.writeFile(
    jsonPath,
    JSON.stringify(ghostMachineSummary(result), null, 2) + "\n",
  );
  result.jsonPath = `reports/${stem}.json`;
  return result;
}

/** Markdown report for reports/<stem>.md. */
export function formatGhostReport(result) {
  const { classification } = result;
  const lines = [
    "# レンダーゴースト検査",
    "",
    `- 対象: ${result.video}（${result.frames} フレーム, ${result.fps} fps, 480x270 / 10x6タイルで走査）`,
    "- 検出は助言であり合否ではない。意図したストロボや1フレームのアクセントもここに並ぶ。",
    "",
    `## 分類サマリ: 全 ${result.singleFrameEvents.length} 件 = 孤立 ${classification.isolatedCount} 件 / 連続クラスタ ${classification.clusteredRunCount} ラン（${classification.clusteredEventCount} 件）`,
    "",
    "- **孤立フラッシュ**（前後のフレームに仲間がいない単独の1フレーム）: 消えたはずの文字の再出現（ゴースト）の型そのもの。全部を静止画で正解と照合する。",
    "- **連続クラスタ**（複数フレームに連続する検出）: 場面転換・ストロボ・高速なカメラワークで発火しやすい。代表フレームだけ照合すれば足りることが多い。",
    "",
    `### 孤立フラッシュ: ${classification.isolatedCount} 件`,
    "",
  ];
  for (const event of classification.isolated.slice(0, 200))
    lines.push(
      `- frame ${event.frame}（${event.time}）: ${tileCount(event)} タイル`,
    );
  if (classification.isolatedCount > 200)
    lines.push(`- …他 ${classification.isolatedCount - 200} 件`);
  lines.push("", `### 連続クラスタ: ${classification.clusteredRunCount} ラン`, "");
  for (const run of classification.clustered.slice(0, 100))
    lines.push(
      `- frames ${run.startFrame}-${run.endFrame}（${run.startTime}-${run.endTime}）: ${run.frames.length} 件, 最大 ${run.maxTiles} タイル`,
    );
  if (classification.clusteredRunCount > 100)
    lines.push(`- …他 ${classification.clusteredRunCount - 100} ラン`);
  if (result.stills?.length) {
    lines.push(
      "",
      "## 静止画（目視確認用）",
      "",
      "各フレームの前後（prev / 本体 / next）を並べ、本体にだけ写る要素がないか見る。",
      "",
    );
    for (const still of result.stills)
      lines.push(
        `- frame ${still.frame}（${still.time}, ${still.kind === "isolated" ? "孤立" : "クラスタ代表"}）: ` +
          still.files.map((file) => `[${path.basename(file)}](${file})`).join(" / "),
      );
  }
  if (result.doubleRender) {
    lines.push(
      "",
      `## 二重レンダー照合: 不一致 ${result.doubleRender.mismatches.length} フレーム / ${result.doubleRender.comparedFrames} フレーム`,
      "",
      "同じコードの2本のレンダーが食い違うフレームは、どちらかにゴーストがいる。多数決で消し切る保証はないため、不一致フレームは静止画で正解を確認する。",
      "",
    );
    for (const mismatch of result.doubleRender.mismatches.slice(0, 200))
      lines.push(
        `- frame ${mismatch.frame}（${mismatch.time}）: ${mismatch.tiles} タイル不一致`,
      );
    if (result.doubleRender.mismatches.length > 200)
      lines.push(`- …他 ${result.doubleRender.mismatches.length - 200} 件`);
  }
  if (result.doubleRenderSkipped)
    lines.push("", `（二重レンダー照合はスキップ: ${result.doubleRenderSkipped}）`);
  lines.push("");
  return lines.join("\n");
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  const args = Object.fromEntries(
    process.argv
      .slice(2)
      .map((arg) => {
        const [key, value] = arg.replace(/^--/, "").split("=");
        return [key, value ?? true];
      }),
  );
  try {
    const result = await analyzeGhosts({
      video: typeof args.video === "string" ? args.video : undefined,
      target: typeof args.target === "string" ? args.target : undefined,
      doubleRender: Boolean(args["double-render"]),
      keep: Boolean(args.keep),
      stills: !args["no-stills"],
      maxStills:
        typeof args["max-stills"] === "string"
          ? Number(args["max-stills"])
          : undefined,
      tileThreshold:
        typeof args["tile-threshold"] === "string"
          ? Number(args["tile-threshold"])
          : undefined,
      minTiles:
        typeof args["min-tiles"] === "string"
          ? Number(args["min-tiles"])
          : undefined,
    });
    if (result.skipped) {
      console.error("Ghost check skipped: " + result.skipped);
      process.exitCode = 1;
    } else {
      console.log(
        `Scanned ${result.frames} frames of ${result.video} at ${formatTime(result.frames / result.fps)} total.`,
      );
      console.log(
        `Single-frame events: ${result.singleFrameEvents.length}` +
          ` (isolated ${result.classification.isolatedCount}, clustered ${result.classification.clusteredEventCount} in ${result.classification.clusteredRunCount} runs)`,
      );
      if (result.doubleRender)
        console.log(
          `Double-render mismatches: ${result.doubleRender.mismatches.length} frames`,
        );
      if (result.doubleRenderSkipped)
        console.log("Double-render skipped: " + result.doubleRenderSkipped);
      if (result.stills?.length)
        console.log(
          `Stills written to reports/ghost-stills/ (${result.stills.length} frames x prev/current/next)`,
        );
      console.log(
        `Report written to ${result.reportPath} and ${result.jsonPath}`,
      );
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
