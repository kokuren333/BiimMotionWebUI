// Render-ghost check for output/final.mp4 (see ghost-analysis.mjs for why).
//
//   node scripts/ghost-check.mjs [--video=output/final.mp4]
//                                [--double-render] [--keep]
//                                [--tile-threshold=12] [--min-tiles=1]
//
// Always on: decode the video at 480x270 grayscale and report elements that
// exist for exactly one frame (ghost signature / too-brief text).
// --double-render: render the same code a second time into
// output/final.ghostcheck.mp4 and report every frame where the two renders
// disagree. The second render is deleted afterwards unless --keep.
//
// Findings are a report, never a verdict: intentional strobes and 1-frame
// accents exist. The markdown report lands in reports/ghost-check.md.
// validate.mjs imports analyzeGhosts() from here for its advisory --final
// scan; running this file directly is the explicit, louder variant.
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { prepare, readJSON, root, runtime } from "./lib.mjs";
import {
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
      ],
      { cwd: runtime, stdio: "inherit" },
    );
    child.on("error", reject);
    child.on("exit", resolve);
  });
  if (code !== 0) throw new Error("second render failed with code " + code);
}

/**
 * Full advisory analysis. Never throws for "findings"; throws only for
 * broken inputs (missing video, undecodable video). Returns
 * { skipped: reason } when ffmpeg is unavailable.
 */
export async function analyzeGhosts({
  video = "output/final.mp4",
  doubleRender = false,
  keep = false,
  tileThreshold,
  minTiles,
} = {}) {
  const ffmpeg = await findFfmpeg();
  if (!ffmpeg) return { skipped: "ffmpeg not found on PATH or in Remotion" };
  const videoPath = path.join(root, video);
  await fs.access(videoPath);
  let fps = 30;
  try {
    fps = (await readJSON("project.json")).video.fps ?? 30;
  } catch {
    // project.json unreadable here; validate reports that separately.
  }
  const options = { tileThreshold, minTiles };
  const signatures = await decodeTileSignatures(ffmpeg, videoPath);
  const result = {
    video,
    fps,
    frames: signatures.length,
    singleFrameEvents: withTimes(
      detectSingleFrameEvents(signatures, options),
      fps,
    ),
  };
  if (doubleRender) {
    const copyName = "final.ghostcheck.mp4";
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
  result.report = formatGhostReport(result);
  const reportPath = path.join(root, "reports", "ghost-check.md");
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, result.report);
  return result;
}

/** Markdown report for reports/ghost-check.md. */
export function formatGhostReport(result) {
  const lines = [
    "# レンダーゴースト検査",
    "",
    `- 対象: ${result.video}（${result.frames} フレーム, ${result.fps} fps, 480x270 / 10x6タイルで走査）`,
    "- 検出は助言であり合否ではない。意図したストロボや1フレームのアクセントもここに並ぶ。",
    "",
    `## 1フレームだけ存在する要素: ${result.singleFrameEvents.length} 件`,
    "",
    "消えたはずの文字の再出現（ゴースト）と、読むには短すぎる表示（目安は最低3フレーム保持）の両方がこの形になる。",
    "",
  ];
  for (const event of result.singleFrameEvents.slice(0, 200))
    lines.push(
      `- frame ${event.frame}（${event.time}）: ${event.tiles.length} タイル`,
    );
  if (result.singleFrameEvents.length > 200)
    lines.push(`- …他 ${result.singleFrameEvents.length - 200} 件`);
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
      doubleRender: Boolean(args["double-render"]),
      keep: Boolean(args.keep),
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
          (result.singleFrameEvents.length
            ? " — " +
              result.singleFrameEvents
                .slice(0, 20)
                .map((event) => event.time)
                .join(", ")
            : ""),
      );
      if (result.doubleRender)
        console.log(
          `Double-render mismatches: ${result.doubleRender.mismatches.length} frames`,
        );
      console.log("Report written to reports/ghost-check.md");
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
