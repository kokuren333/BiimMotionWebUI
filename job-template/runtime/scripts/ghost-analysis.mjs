// Pure frame-tile analysis for render-ghost detection.
//
// No I/O lives here: callers decode a video into per-frame tile signatures
// (mean brightness per tile, see tileSignatures) and pass the signatures in.
// That keeps the detection logic unit-testable without ffmpeg or Chrome.
//
// Background: in final renders, text elements that were removed from the DOM
// can flash back for a single frame because a stale compositing layer
// survives inside a headless-Chrome render tab (the ghost reappears on the
// frames that tab owns, i.e. with the render-concurrency period). A plain
// flicker metric does not catch this — the frame is locally wrong, not
// globally unstable. The two detectors below are the ones that did catch it:
//   * compareFrameSequences — the same code rendered twice must agree frame
//     by frame; a frame that differs between the two renders holds a ghost
//     in one of them.
//   * detectSingleFrameEvents — content present for exactly one frame is the
//     ghost's signature, and also flags intentional elements (kinetic words)
//     shown too briefly to read.

/** Mean-abs per-tile brightness difference (0-255 scale) counted as "changed". */
export const DEFAULT_TILE_THRESHOLD = 12;

/**
 * Per-tile mean brightness of one grayscale frame.
 * frame: Uint8Array of width*height bytes, row-major. Returns cols*rows means.
 */
export function tileSignatures(frame, width, height, cols = 10, rows = 6) {
  if (frame.length < width * height)
    throw new Error("frame buffer is smaller than width*height");
  const out = new Float64Array(cols * rows);
  for (let ty = 0; ty < rows; ty++) {
    const y0 = Math.floor((ty * height) / rows);
    const y1 = Math.floor(((ty + 1) * height) / rows);
    for (let tx = 0; tx < cols; tx++) {
      const x0 = Math.floor((tx * width) / cols);
      const x1 = Math.floor(((tx + 1) * width) / cols);
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        const base = y * width;
        for (let x = x0; x < x1; x++) {
          sum += frame[base + x];
          count++;
        }
      }
      out[ty * cols + tx] = count ? sum / count : 0;
    }
  }
  return out;
}

/** Per-tile absolute differences between two signatures of the same shape. */
export function tileDiffs(a, b) {
  if (a.length !== b.length) throw new Error("signature length mismatch");
  const out = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = Math.abs(a[i] - b[i]);
  return out;
}

const hotTiles = (diffs, threshold) => {
  let count = 0;
  for (const diff of diffs) if (diff > threshold) count++;
  return count;
};

/**
 * Frame-by-frame comparison of two renders of the same timeline.
 * Returns [{frame, tiles}] for every frame where at least minTiles tiles
 * differ by more than tileThreshold — ghost candidates, since deterministic
 * renders of identical code should produce identical frames.
 */
export function compareFrameSequences(
  signaturesA,
  signaturesB,
  { tileThreshold = DEFAULT_TILE_THRESHOLD, minTiles = 1 } = {},
) {
  const frames = Math.min(signaturesA.length, signaturesB.length);
  const mismatches = [];
  for (let frame = 0; frame < frames; frame++) {
    const tiles = hotTiles(
      tileDiffs(signaturesA[frame], signaturesB[frame]),
      tileThreshold,
    );
    if (tiles >= minTiles) mismatches.push({ frame, tiles });
  }
  return mismatches;
}

/**
 * Detect content that exists for exactly one frame: tile t at frame f counts
 * when it changes f-1 -> f and f -> f+1, while f-1 and f+1 agree with each
 * other. Cuts and sustained changes do not match (their f-1 -> f+1 diff stays
 * large), nor do elements held for 2+ frames.
 * Returns [{frame, tiles: [tileIndex, ...]}].
 */
export function detectSingleFrameEvents(
  signatures,
  { tileThreshold = DEFAULT_TILE_THRESHOLD } = {},
) {
  const events = [];
  for (let frame = 1; frame + 1 < signatures.length; frame++) {
    const inDiff = tileDiffs(signatures[frame - 1], signatures[frame]);
    const outDiff = tileDiffs(signatures[frame], signatures[frame + 1]);
    const skipDiff = tileDiffs(signatures[frame - 1], signatures[frame + 1]);
    const tiles = [];
    for (let t = 0; t < inDiff.length; t++) {
      if (
        inDiff[t] > tileThreshold &&
        outDiff[t] > tileThreshold &&
        skipDiff[t] <= tileThreshold
      )
        tiles.push(t);
    }
    if (tiles.length) events.push({ frame, tiles });
  }
  return events;
}

const tileCount = (event) =>
  Array.isArray(event.tiles) ? event.tiles.length : (event.tiles ?? 0);

/**
 * Classify single-frame events into isolated flashes and clustered runs.
 *
 * Field experience (043 preview, 4,991 frames): the raw detector also fires
 * all over fast camera work and scene transitions, and those hits arrive in
 * consecutive-frame runs (e.g. frames 350-360, 2880-2885, 4392-4398). A true
 * render ghost — a stale layer flashing for exactly one frame — is isolated:
 * no other event on the neighbouring frames. So reports split the hits:
 *   - isolated: a run of exactly one event frame. Ghost suspects; each one
 *     needs a still-image check.
 *   - clustered: a run of 2+ event frames whose frames are at most
 *     clusterGap apart (default 1, i.e. strictly consecutive). Most likely
 *     an intentional transition/strobe or dense motion; check a
 *     representative frame instead of every frame.
 * Events may carry tiles as an index list or as a count. Returns
 * { isolated, clustered: [{startFrame, endFrame, frames, maxTiles}],
 *   isolatedCount, clusteredRunCount, clusteredEventCount }.
 * Input order does not matter; runs come back in frame order.
 */
export function classifyFlashEvents(events, { clusterGap = 1 } = {}) {
  const sorted = [...events].sort((a, b) => a.frame - b.frame);
  const isolated = [];
  const clustered = [];
  let run = [];
  const flush = () => {
    if (!run.length) return;
    if (run.length === 1) isolated.push(run[0]);
    else
      clustered.push({
        startFrame: run[0].frame,
        endFrame: run[run.length - 1].frame,
        frames: run.map((event) => event.frame),
        maxTiles: Math.max(...run.map(tileCount)),
      });
    run = [];
  };
  for (const event of sorted) {
    if (run.length && event.frame - run[run.length - 1].frame > clusterGap)
      flush();
    run.push(event);
  }
  flush();
  return {
    isolated,
    clustered,
    isolatedCount: isolated.length,
    clusteredRunCount: clustered.length,
    clusteredEventCount: clustered.reduce(
      (sum, entry) => sum + entry.frames.length,
      0,
    ),
  };
}

/** Format seconds as m:ss.cc for reports. */
export function formatTime(sec) {
  const minutes = Math.floor(sec / 60);
  const seconds = sec - minutes * 60;
  return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
}

/** Attach sec / time fields to frame-indexed results. */
export function withTimes(items, fps) {
  return items.map((item) => ({
    ...item,
    sec: item.frame / fps,
    time: formatTime(item.frame / fps),
  }));
}
