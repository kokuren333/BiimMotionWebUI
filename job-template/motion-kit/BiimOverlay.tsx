import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import project from "../project.json";

export const BiimOverlay = ({
  children,
  noteTop,
  noteBottom,
  character,
  enabled = true,
}: {
  children: ReactNode;
  noteTop?: ReactNode;
  noteBottom?: ReactNode;
  character?: ReactNode;
  enabled?: boolean;
}) => {
  const { width } = useVideoConfig();
  const layout = project.layout;
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
            ? { ...region(layout.regions.main), overflow: "hidden" }
            : { position: "absolute", inset: 0 }
        }
      >
        {children}
      </div>
      {enabled && (
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
      {character && (
        <div style={{ ...region(layout.regions.character), zIndex: 2 }}>
          {character}
        </div>
      )}
    </AbsoluteFill>
  );
};
