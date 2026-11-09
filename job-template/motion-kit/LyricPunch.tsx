import type { CSSProperties } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fitFontSize } from "./lyric-fit";
import { lyricLayerStyle } from "./layers";

export type LyricHit = {
  text: string;
  /** Seconds (relative to the current Sequence) when the word is sung / hit. */
  atSec: number;
  /** Use the accent color for this word. */
  accent?: boolean;
};

/**
 * Giant lyric typography placed inside a composition region, with each word
 * punched in on its own timestamp (from music analysis, not a fixed stagger).
 * "replace" shows one huge word at a time; "stack" accumulates words as lines.
 * region is [x, y, width, height] as fractions of the frame, e.g. the left half
 * [0.05, 0.1, 0.5, 0.8] when a character occupies the right side.
 */
export const LyricPunch = ({
  words,
  untilSec,
  mode = "replace",
  region = [0.06, 0.1, 0.88, 0.8],
  fontSize,
  align = "left",
  color = "#ffffff",
  accentColor = "#ff3b5c",
  shake = 0,
  style,
}: {
  words: LyricHit[];
  untilSec: number;
  mode?: "replace" | "stack";
  region?: [number, number, number, number];
  /** Maximum size in px; defaults to the region height (replace) or a share of it (stack). */
  fontSize?: number;
  align?: "left" | "center" | "right";
  color?: string;
  accentColor?: string;
  /** Pixel amplitude of a short impact shake on each hit (0 = none). */
  shake?: number;
  style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const started = words.filter((word) => word.atSec <= t);
  if (!started.length || t > untilSec + 0.15) return null;
  const [rx, ry, rw, rh] = region;
  const box = { left: rx * width, top: ry * height, width: rw * width, height: rh * height };
  const exitP = interpolate(t, [untilSec, untilSec + 0.15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const visible = mode === "replace" ? started.slice(-1) : started;
  const base =
    fontSize ??
    (mode === "replace" ? box.height * 0.8 : box.height / Math.max(3, words.length) / 1.1);
  const latest = started[started.length - 1];
  const hitAge = (t - latest.atSec) * fps;
  const jolt = shake ? Math.sin(hitAge * 2.6) * shake * Math.max(0, 1 - hitAge / 6) : 0;
  return (
    <div
      style={{
        // Own compositing layer so replaced words cannot ghost back from a
        // stale shared layer in the render tab (see layers.ts).
        ...lyricLayerStyle,
        position: "absolute",
        ...box,
        display: "flex",
        flexDirection: "column",
        justifyContent: mode === "replace" ? "center" : "flex-start",
        alignItems: { left: "flex-start", center: "center", right: "flex-end" }[align],
        overflow: "visible",
        transform: `translate(${jolt}px, ${-jolt * 0.5}px)`,
        clipPath: exitP ? `inset(${exitP * 100}% 0 0 0)` : undefined,
        ...style,
      }}
    >
      {visible.map((word) => {
        const local = (t - word.atSec) * fps;
        const p = spring({ frame: local, fps, config: { damping: 13, stiffness: 320, mass: 0.6 } });
        const size = fitFontSize(word.text, box.width, base);
        return (
          <div
            key={`${word.atSec}-${word.text}`}
            style={{
              fontSize: size,
              lineHeight: 1.02,
              fontWeight: 900,
              whiteSpace: "pre",
              color: word.accent ? accentColor : color,
              transformOrigin: align === "right" ? "right center" : align === "center" ? "center" : "left center",
              transform: `scale(${interpolate(p, [0, 1], [1.4, 1])}) skewX(${interpolate(p, [0, 1], [-10, 0])}deg)`,
              opacity: interpolate(p, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            {word.text}
          </div>
        );
      })}
    </div>
  );
};
