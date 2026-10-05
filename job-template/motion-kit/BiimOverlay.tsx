import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import project from "../project.json";
import { biimEnabled, regionsFor } from "../runtime/src/Presentation";

export const BiimOverlay = ({
  children,
  noteTop,
  noteBottom,
  character,
  secondCharacter,
  enabled = true,
}: {
  children: ReactNode;
  noteTop?: ReactNode;
  noteBottom?: ReactNode;
  character?: ReactNode;
  secondCharacter?: ReactNode;
  enabled?: boolean;
}) => {
  const { width } = useVideoConfig();
  const layout = project.layout;
  enabled = enabled && biimEnabled();
  const regions = regionsFor(enabled);
  const region = (values: number[]): CSSProperties => ({
    position: "absolute",
    left: `${(values[0] / layout.base_width) * 100}%`,
    top: `${(values[1] / layout.base_height) * 100}%`,
    width: `${(values[2] / layout.base_width) * 100}%`,
    height: `${(values[3] / layout.base_height) * 100}%`,
  });
  const noteStyle = (role: "note_top" | "note_bottom"): CSSProperties => ({
    ...region(layout.regions[role]),
    overflow: "hidden",
    whiteSpace: "pre-line",
    color: layout.colors.note,
    fontFamily: layout.fonts[role].family,
    fontWeight: layout.fonts[role].weight,
    fontSize: (layout.fonts[role].size * width) / 1920,
    lineHeight: 1.55,
  });
  return (
    <AbsoluteFill
      style={{
        containerType: "inline-size",
        background: layout.colors.background,
        fontFamily: layout.fonts.body.family,
      }}
    >
      <div
        style={
          enabled
            ? { ...region(regions.main), overflow: "hidden" }
            : { position: "absolute", inset: 0 }
        }
      >
        {children}
      </div>
      {enabled && layout.frame && (
        <>
          <Img
            src={staticFile(layout.frame)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />
          <div style={noteStyle("note_top")}>{noteTop}</div>
          <div style={noteStyle("note_bottom")}>{noteBottom}</div>
        </>
      )}
      {project.direction.character_usage !== "none" && character && (
        <div style={{ ...region(regions.character), zIndex: 2 }}>
          {character}
        </div>
      )}
      {project.direction.character_usage !== "none" &&
        project.character_mode === "duo" &&
        secondCharacter && (
          <div style={{ ...region(regions.character_second), zIndex: 2 }}>
            {secondCharacter}
          </div>
        )}
    </AbsoluteFill>
  );
};
