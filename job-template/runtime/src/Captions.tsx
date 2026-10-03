import { useVideoConfig } from "remotion";
import project from "../../project.json";
export const Captions = ({
  text,
  reserveCharacterSpace = true,
}: {
  text: string;
  reserveCharacterSpace?: boolean;
}) => {
  const { width } = useVideoConfig();
  const font = project.layout.fonts.subtitle;
  const [x, y, w, h] = project.layout.regions.subtitle;
  const unit = width / project.layout.base_width;
  const keepBiimRegion =
    project.direction.biim_usage !== "never" || reserveCharacterSpace;
  return (
    <div
      style={{
        position: "absolute",
        left: keepBiimRegion
          ? `${(x / project.layout.base_width) * 100}%`
          : "3%",
        top: `${(y / project.layout.base_height) * 100}%`,
        width: keepBiimRegion
          ? `${(w / project.layout.base_width) * 100}%`
          : "94%",
        height: `${(h / project.layout.base_height) * 100}%`,
        padding: `${8 * unit}px ${16 * unit}px`,
        color: project.layout.colors.subtitle,
        fontFamily: font.family,
        fontSize: font.size * unit,
        lineHeight: 1.2,
        fontWeight: font.weight,
        textAlign: "center",
        overflowWrap: "anywhere",
        whiteSpace: "pre-line",
        display: "grid",
        placeItems: "center",
      }}
    >
      {[9, 4, 0].map((stroke, i) => (
        <span
          key={stroke}
          aria-hidden={i < 2}
          style={{
            gridArea: "1 / 1",
            WebkitTextStroke: stroke
              ? `${stroke * unit}px ${i === 0 ? "#fff" : "#000"}`
              : undefined,
            paintOrder: "stroke fill",
          }}
        >
          {text}
        </span>
      ))}
    </div>
  );
};
