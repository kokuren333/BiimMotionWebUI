import type { ReactNode } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
export const CameraPunch = ({
  children,
  at = 0,
  strength = 0.12,
}: {
  children: ReactNode;
  at?: number;
  strength?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p =
    frame < at
      ? 0
      : 1 -
        spring({
          frame: frame - at,
          fps,
          config: { damping: 12, stiffness: 220 },
        });
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform: `scale(${1 + p * strength})`,
      }}
    >
      {children}
    </div>
  );
};
