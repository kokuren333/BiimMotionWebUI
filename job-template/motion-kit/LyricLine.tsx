import type { CSSProperties } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { fitFontSize } from "./lyric-fit";
import { lyricLayerStyle } from "./layers";

/**
 * One lyric line (or a designed multi-line phrase) timed in seconds relative to
 * the current Sequence. It stays fully visible until endSec and exits after it,
 * so the end of a sung phrase is never cut by an early transition.
 * Use "\n" in text for intentional line breaks; the size shrinks to fit maxWidth.
 */
export const LyricLine = ({
  text,
  startSec,
  endSec,
  enter = "rise",
  exit = "fade",
  revealSec,
  exitSec = 0.2,
  fontSize = 72,
  maxWidth,
  align = "center",
  style,
}: {
  text: string;
  startSec: number;
  endSec: number;
  enter?: "rise" | "wipe" | "type" | "none";
  exit?: "fade" | "drop" | "cut";
  /** Seconds for the entrance; defaults to 30% of the line (max 0.6s). */
  revealSec?: number;
  exitSec?: number;
  fontSize?: number;
  /** Pixel width the longest line must fit; defaults to 86% of the frame. */
  maxWidth?: number;
  align?: "left" | "center" | "right";
  style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const reveal = Math.max(
    1 / fps,
    revealSec ?? Math.min(0.6, (endSec - startSec) * 0.3),
  );
  if (t < startSec || t > endSec + (exit === "cut" ? 0 : exitSec)) return null;
  const size = fitFontSize(text, maxWidth ?? width * 0.86, fontSize);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const inP = interpolate(t, [startSec, startSec + reveal], [0, 1], clamp);
  const eased = 1 - (1 - inP) ** 3;
  const outP =
    exit === "cut" ? 0 : interpolate(t, [endSec, endSec + exitSec], [0, 1], clamp);
  const chars = Array.from(text);
  const shown = enter === "type" ? Math.ceil(chars.length * inP) : chars.length;
  return (
    <div
      aria-label={text}
      style={{
        // Own compositing layer: a removed line must not ghost back from a
        // stale shared layer in the render tab (see layers.ts).
        ...lyricLayerStyle,
        fontSize: size,
        lineHeight: 1.25,
        whiteSpace: "pre",
        textAlign: align,
        opacity: (enter === "rise" ? eased : 1) * (exit === "fade" ? 1 - outP : 1),
        transform: `translateY(${
          (enter === "rise" ? (1 - eased) * size * 0.45 : 0) +
          (exit === "drop" ? outP * size * 0.8 : 0)
        }px)`,
        clipPath:
          enter === "wipe"
            ? `inset(0 ${(1 - eased) * 100}% 0 0)`
            : exit === "drop"
              ? `inset(0 0 ${outP * 100}% 0)`
              : undefined,
        ...style,
      }}
    >
      {enter === "type"
        ? chars.map((char, i) => (
            <span key={i} style={{ opacity: i < shown ? 1 : 0 }}>
              {char}
            </span>
          ))
        : text}
    </div>
  );
};
