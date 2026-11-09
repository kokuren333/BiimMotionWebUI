import type { CSSProperties } from "react";

/**
 * Compositing-layer separation for text and overlay layers.
 *
 * Why: in final renders, text elements removed from the DOM can flash back
 * for a single frame — a stale compositing layer survives inside a
 * headless-Chrome render tab and resurfaces on that tab's frames (with the
 * render-concurrency period). It does not reproduce in stills or fresh
 * single-frame renders, and a flicker metric over the finished video does
 * not reliably catch it. The countermeasure that worked: never let the
 * lyric/text layer share a compositing layer with the scenery — give each
 * text, window and overlay layer its own layer via will-change: transform,
 * and isolate the stage root's stacking context.
 *
 * These are defaults, not restrictions. Spread them first, then override or
 * extend freely; scenes with a different layering design can ignore them.
 * Verify with the double-render comparison in scripts/ghost-check.mjs.
 */

/** Text that appears/disappears on cue (lyrics, captions, kinetic words). */
export const textLayerStyle: CSSProperties = {
  willChange: "transform",
};

/** Same default under the name scenes use when composing a lyric layer. */
export const lyricLayerStyle: CSSProperties = textLayerStyle;

/** Decorative window/frame layers placed in front of or behind the stage. */
export const windowLayerStyle: CSSProperties = {
  isolation: "isolate",
  willChange: "transform",
};

/** Stage root: its own stacking context, so child layers stay separable. */
export const stageRootStyle: CSSProperties = {
  isolation: "isolate",
};
