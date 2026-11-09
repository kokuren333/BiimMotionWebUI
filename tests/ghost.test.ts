import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs/promises";
import {
  compareFrameSequences,
  detectSingleFrameEvents,
  tileSignatures,
} from "../job-template/runtime/scripts/ghost-analysis.mjs";

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
  assert.match(ghostCheck, /reports", "ghost-check\.md"/);
  assert.match(ghostCheck, /doubleRender/);
});
