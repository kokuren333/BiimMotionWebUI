import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs/promises";
import {
  classifyFlashEvents,
  compareFrameSequences,
  detectSingleFrameEvents,
  tileSignatures,
  withTimes,
} from "../job-template/runtime/scripts/ghost-analysis.mjs";
import {
  ghostMachineSummary,
  ghostReportStem,
  selectStillFrames,
} from "../job-template/runtime/scripts/ghost-check.mjs";
import {
  ghostCheckVerdict,
  parseGhostCheckReport,
} from "../src/job.ts";

const sig = (values: number[]) => Float64Array.from(values);
const frames = (count: number, tiles = 4) =>
  Array.from({ length: count }, () => sig(new Array(tiles).fill(0)));

test("tile signatures average each tile region", () => {
  // 4x2 frame, left half dark, right half bright -> 2x1 tiles [0, 100].
  const frame = new Uint8Array([
    0, 0, 100, 100,
    0, 0, 100, 100,
  ]);
  assert.deepEqual([...tileSignatures(frame, 4, 2, 2, 1)], [0, 100]);
  assert.throws(() => tileSignatures(new Uint8Array(3), 4, 2), /smaller/);
});

test("double-render comparison flags only the frames that differ", () => {
  const a = frames(4);
  const b = frames(4);
  b[2][1] = 80; // one tile flashes in render B only
  assert.deepEqual(compareFrameSequences(a, b), [{ frame: 2, tiles: 1 }]);
  assert.deepEqual(compareFrameSequences(a, a), []);
  // A global brightness shift below the tile threshold is ignored.
  const c = frames(4).map((frame) => frame.map((v) => v + 5));
  assert.deepEqual(compareFrameSequences(a, c), []);
});

test("single-frame detection catches a one-frame appearance", () => {
  const seq = frames(6);
  seq[3][2] = 200; // tile 2 exists only in frame 3
  const events = detectSingleFrameEvents(seq);
  assert.equal(events.length, 1);
  assert.equal(events[0].frame, 3);
  assert.deepEqual(events[0].tiles, [2]);
});

test("single-frame detection ignores cuts, sustained and held content", () => {
  const cut = frames(6);
  for (let f = 3; f < 6; f++) cut[f][0] = 200; // hard cut: stays changed
  assert.deepEqual(detectSingleFrameEvents(cut), []);
  const held = frames(7);
  for (let f = 2; f <= 4; f++) held[f][1] = 200; // held for 3 frames
  assert.deepEqual(detectSingleFrameEvents(held), []);
  const twoFrames = frames(6);
  twoFrames[2][3] = 200;
  twoFrames[3][3] = 200; // held for 2 frames
  assert.deepEqual(detectSingleFrameEvents(twoFrames), []);
});

test("templates keep text layers on their own compositing layer by default", async () => {
  const read = (relative: string) =>
    fs.readFile("job-template/" + relative, "utf8");
  const layers = await read("motion-kit/layers.ts");
  assert.match(layers, /willChange: "transform"/);
  assert.match(layers, /isolation: "isolate"/);
  for (const file of [
    "motion-kit/LyricLine.tsx",
    "motion-kit/LyricPunch.tsx",
    "motion-kit/KineticText.tsx",
    "motion-kit/BiimOverlay.tsx",
    "runtime/src/Captions.tsx",
    "runtime/src/MainVideo.tsx",
  ])
    assert.match(await read(file), /layers/, file);
});

test("validate wires the ghost scan as an advisory, not a failure", async () => {
  const validate = await fs.readFile(
    "job-template/runtime/scripts/validate.mjs",
    "utf8",
  );
  assert.match(validate, /analyzeGhosts/);
  assert.match(validate, /advise\("ghost scan \(advisory\)"/);
  const ghostCheck = await fs.readFile(
    "job-template/runtime/scripts/ghost-check.mjs",
    "utf8",
  );
  assert.match(ghostCheck, /ghostReportStem/);
  assert.match(ghostCheck, /reports", `\$\{stem\}\.md`/);
  assert.match(ghostCheck, /doubleRender/);
});

test("flash classification separates isolated ghosts from clustered runs", () => {
  const events = withTimes(
    [
      { frame: 350, tiles: [0, 1] },
      { frame: 351, tiles: [0] },
      { frame: 352, tiles: [2, 3, 4] },
      { frame: 900, tiles: [5] }, // isolated: the ghost signature
      { frame: 2880, tiles: [1] },
      { frame: 2881, tiles: [1, 2] },
      { frame: 500, tiles: 7 }, // tiles as a count also works; isolated
    ],
    30,
  );
  const result = classifyFlashEvents(events);
  assert.equal(result.isolatedCount, 2);
  assert.deepEqual(
    result.isolated.map((event) => event.frame),
    [500, 900],
  );
  assert.equal(result.clusteredRunCount, 2);
  assert.equal(result.clusteredEventCount, 5);
  assert.deepEqual(
    result.clustered.map((run) => [run.startFrame, run.endFrame, run.maxTiles]),
    [
      [350, 352, 3],
      [2880, 2881, 2],
    ],
  );
  // A one-frame hole still joins a run when clusterGap allows it.
  const gapped = classifyFlashEvents(
    [
      { frame: 10, tiles: [0] },
      { frame: 12, tiles: [0] },
    ],
    { clusterGap: 2 },
  );
  assert.equal(gapped.clusteredRunCount, 1);
  assert.equal(gapped.isolatedCount, 0);
});

test("ghost report stems keep the historic final name and suffix others", () => {
  assert.equal(ghostReportStem("output/final.mp4"), "ghost-check");
  assert.equal(ghostReportStem("output/preview.mp4"), "ghost-check-preview");
  assert.equal(ghostReportStem("output/check.mp4"), "ghost-check-check");
});

test("machine summary and still selection prioritise isolated flashes", () => {
  const singleFrameEvents = withTimes(
    [
      { frame: 10, tiles: [0, 1, 2, 3] }, // isolated, strongest
      { frame: 100, tiles: [0] },
      { frame: 101, tiles: [0, 1] },
      { frame: 102, tiles: [0] },
      { frame: 200, tiles: [4, 5] }, // isolated
    ],
    30,
  );
  const result = {
    video: "output/preview.mp4",
    fps: 30,
    frames: 300,
    singleFrameEvents,
    classification: classifyFlashEvents(singleFrameEvents),
  };
  const summary = ghostMachineSummary(result as never);
  assert.equal(summary.counts.singleFrameEvents, 5);
  assert.equal(summary.counts.isolated, 2);
  assert.equal(summary.counts.clusteredRuns, 1);
  assert.equal(summary.counts.clusteredEvents, 3);
  assert.equal(summary.worst[0].frame, 10);
  const stills = selectStillFrames(result as never, 3);
  assert.deepEqual(
    stills.map((still) => [still.frame, still.kind]),
    [
      [10, "isolated"],
      [101, "cluster"],
      [200, "isolated"],
    ],
  );
});

test("WebUI parses ghost-check JSON and rejects other files", () => {
  const summary = {
    kind: "biim-ghost-check",
    version: 1,
    video: "output/preview.mp4",
    fps: 30,
    frames: 4991,
    duration: "2:46.37",
    counts: {
      singleFrameEvents: 1135,
      isolated: 12,
      clusteredRuns: 40,
      clusteredEvents: 1123,
    },
    isolated: [{ frame: 900, time: "0:30.00", tiles: 3, tileIndices: [1, 2, 3] }],
    clustered: [
      {
        startFrame: 350,
        endFrame: 360,
        startTime: "0:11.67",
        endTime: "0:12.00",
        events: 11,
        maxTiles: 40,
      },
    ],
    worst: [{ frame: 350, time: "0:11.67", tiles: 40 }],
    stills: [
      {
        frame: 900,
        time: "0:30.00",
        kind: "isolated",
        files: ["ghost-stills/preview-f900.png"],
      },
    ],
  };
  const parsed = parseGhostCheckReport(JSON.stringify(summary));
  assert.ok(parsed);
  assert.equal(parsed.frames, 4991);
  assert.equal(parsed.isolated, 12);
  assert.equal(parsed.clustered[0].maxTiles, 40);
  assert.equal(parsed.stills[0].files[0], "ghost-stills/preview-f900.png");
  assert.match(ghostCheckVerdict(parsed), /要注意/);
  assert.equal(parseGhostCheckReport("not json"), null);
  assert.equal(parseGhostCheckReport(JSON.stringify({ kind: "other" })), null);
});
