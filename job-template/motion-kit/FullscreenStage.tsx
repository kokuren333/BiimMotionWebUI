import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import project from "../project.json";
import { stageRootStyle, textLayerStyle } from "./layers";

/** Full-canvas content and independently movable actors, without a frame. */
export const FullscreenStage = ({
  children,
  character,
  secondCharacter,
  characterStyle,
  secondCharacterStyle,
  background = project.layout.colors.background,
}: {
  children: ReactNode;
  character?: ReactNode;
  secondCharacter?: ReactNode;
  characterStyle?: CSSProperties;
  secondCharacterStyle?: CSSProperties;
  background?: string;
}) => {
  const layout = project.layout;
  const region = (values: number[]): CSSProperties => ({
    ...textLayerStyle,
    position: "absolute",
    left: `${(values[0] / layout.base_width) * 100}%`,
    top: `${(values[1] / layout.base_height) * 100}%`,
    width: `${(values[2] / layout.base_width) * 100}%`,
    height: `${(values[3] / layout.base_height) * 100}%`,
    overflow: "visible",
    zIndex: 2,
  });
  return (
    <AbsoluteFill
      style={{
        ...stageRootStyle,
        containerType: "inline-size",
        background,
        fontFamily: layout.fonts.body.family,
        overflow: "visible",
      }}
    >
      <AbsoluteFill style={{ ...stageRootStyle, ...textLayerStyle }}>
        {children}
      </AbsoluteFill>
      {project.direction.character_usage !== "none" && character && (
        <div style={{ ...region(layout.fullscreen_regions.character), ...characterStyle }}>
          {character}
        </div>
      )}
      {project.direction.character_usage !== "none" &&
        project.character_mode === "duo" && secondCharacter && (
          <div style={{ ...region(layout.fullscreen_regions.character_second), ...secondCharacterStyle }}>
            {secondCharacter}
          </div>
        )}
    </AbsoluteFill>
  );
};
