import { interpolate, useCurrentFrame } from "remotion";
export const DrawArrow = ({
  width = 200,
  height = 60,
  delay = 0,
  color = "#ddeb9a",
}: {
  width?: number;
  height?: number;
  delay?: number;
  color?: string;
}) => {
  const p = interpolate(useCurrentFrame() - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <svg width={width} height={height} viewBox="0 0 200 60">
      <path
        d="M5 30H185M165 10l20 20-20 20"
        fill="none"
        stroke={color}
        strokeWidth="4"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
    </svg>
  );
};
