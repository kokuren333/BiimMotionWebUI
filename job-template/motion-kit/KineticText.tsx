import type { CSSProperties } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
export const KineticText = ({
  text,
  delay = 0,
  stagger = 2,
  style,
}: {
  text: string;
  delay?: number;
  stagger?: number;
  style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={style} aria-label={text}>
      {Array.from(text).map((letter, i) => {
        const local = frame - delay - i * stagger;
        const p = spring({ frame: local, fps, config: { damping: 15 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              opacity: local < 0 ? 0 : 1,
              transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
            }}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
};
