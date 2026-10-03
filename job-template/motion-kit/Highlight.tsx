import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
export const Highlight = ({
  children,
  delay = 0,
  color = "#ddeb9a",
}: {
  children: ReactNode;
  delay?: number;
  color?: string;
}) => {
  const p = interpolate(useCurrentFrame() - delay, [0, 15], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: `${p}%`,
          height: "30%",
          background: color,
          opacity: 0.55,
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};
