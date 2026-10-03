import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
export const SpeedLines = ({
  color = "#ddeb9a",
  opacity = 0.25,
}: {
  color?: string;
  opacity?: number;
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const offset = interpolate(frame % 20, [0, 20], [0, 60]);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity,
      }}
    >
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const x = Math.cos(angle),
          y = Math.sin(angle);
        return (
          <line
            key={i}
            x1={width / 2 + x * (height * 0.32 + offset)}
            y1={height / 2 + y * (height * 0.32 + offset)}
            x2={width / 2 + x * width}
            y2={height / 2 + y * width}
            stroke={color}
            strokeWidth={3}
          />
        );
      })}
    </svg>
  );
};
