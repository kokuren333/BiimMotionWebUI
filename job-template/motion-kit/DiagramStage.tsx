import type { ReactNode } from "react";
import project from "../project.json";
import { stageRootStyle, textLayerStyle } from "./layers";

type Rect = { x: number; y: number; width: number; height: number };
const area = (rect: Rect) => rect.width * rect.height;

/** Keep the largest rectangular space clear of the reserved overlay regions. */
export const DiagramStage = ({
  children,
  reserveCaption = true,
  reserveCharacters = project.direction.character_usage !== "none",
  padding = 48,
}: {
  children: ReactNode;
  reserveCaption?: boolean;
  reserveCharacters?: boolean;
  padding?: number;
}) => {
  const layout = project.layout;
  const regions = layout.fullscreen_regions;
  const reserved = [
    ...(reserveCaption ? [regions.subtitle] : []),
    ...(reserveCharacters ? [regions.character] : []),
    ...(reserveCharacters && project.character_mode === "duo"
      ? [regions.character_second] : []),
  ];
  let spaces: Rect[] = [{ x: 0, y: 0, width: layout.base_width, height: layout.base_height }];
  for (const [x, y, width, height] of reserved) {
    spaces = spaces.flatMap((space) => {
      const right = space.x + space.width;
      const bottom = space.y + space.height;
      if (x >= right || x + width <= space.x || y >= bottom || y + height <= space.y)
        return [space];
      // Overlapping candidates are intentional: the largest remaining rectangle
      // may run above, below or beside an actor, including portrait layouts.
      return [
        { ...space, height: Math.max(0, y - space.y) },
        { ...space, y: y + height, height: Math.max(0, bottom - y - height) },
        { ...space, width: Math.max(0, x - space.x) },
        { ...space, x: x + width, width: Math.max(0, right - x - width) },
      ].filter((rect) => rect.width > 0 && rect.height > 0);
    });
  }
  // Apply base-coordinate padding to each candidate before comparing its area.
  const inset = Math.max(0, Number.isFinite(padding) ? padding : 48);
  const space = spaces.map((rect) => {
    const px = Math.min(inset, rect.width / 2);
    const py = Math.min(inset, rect.height / 2);
    return { x: rect.x + px, y: rect.y + py, width: rect.width - 2 * px, height: rect.height - 2 * py };
  }).sort((a, b) => area(b) - area(a))[0];
  // A completely reserved canvas has no drawable area.
  if (!space) return null;
  return (
    <div style={{
      ...stageRootStyle,
      ...textLayerStyle,
      position: "absolute",
      left: `${(space.x / layout.base_width) * 100}%`,
      top: `${(space.y / layout.base_height) * 100}%`,
      width: `${(space.width / layout.base_width) * 100}%`,
      height: `${(space.height / layout.base_height) * 100}%`,
      containerType: "inline-size",
    }}>
      {children}
    </div>
  );
};
