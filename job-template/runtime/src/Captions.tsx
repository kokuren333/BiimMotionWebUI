import type { CSSProperties } from "react";
import { useVideoConfig } from "remotion";
import project from "../../project.json";
import { biimEnabled, regionsFor, speakerFor } from "./Presentation";
export const Captions = ({
  text,
  speakerId,
  enabled = biimEnabled(),
  reserveCharacterSpace = true,
  style,
}: {
  text: string;
  speakerId?: string;
  enabled?: boolean;
  reserveCharacterSpace?: boolean;
  style?: CSSProperties;
}) => {
  const { width } = useVideoConfig();
  const font = project.layout.fonts.subtitle;
  enabled = enabled && biimEnabled();
  const [x, y, w, h] = regionsFor(enabled).subtitle;
  const unit = width / project.layout.base_width;
  const keepBiimRegion = !enabled || reserveCharacterSpace;
  const speaker = speakerFor(speakerId);
  return (
    <div
      data-speaker-id={speaker.id}
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
        padding: `${4 * unit}px ${12 * unit}px`,
        boxSizing: "border-box",
        color: speaker.subtitle_color,
        fontFamily: font.family,
        fontSize:
          (enabled
            ? font.size
            : project.video.height > project.video.width
              ? 54
              : 52) * unit,
        lineHeight: 1.2,
        fontWeight: font.weight,
        textAlign: "center",
        overflowWrap: "anywhere",
        whiteSpace: "pre-line",
        display: "grid",
        placeItems: "center",
        zIndex: 10,
        ...style,
      }}
    >
      {[9, 0].map((stroke) => (
        <span
          key={stroke}
          aria-hidden={stroke > 0}
          style={{
            gridArea: "1 / 1",
            WebkitTextStroke: stroke
              ? `${stroke * unit}px ${speaker.subtitle_outline}`
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
