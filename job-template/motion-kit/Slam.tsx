import type { ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
export const Slam = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => {
  const frame = useCurrentFrame() - delay;
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 14, stiffness: 240 } });
  return (
    <div
      style={{
        opacity: frame < 0 ? 0 : 1,
        transform: `scale(${interpolate(p, [0, 1], [3, 1])}) rotate(${interpolate(p, [0, 1], [-8, 0])}deg)`,
      }}
    >
      {children}
    </div>
  );
};
