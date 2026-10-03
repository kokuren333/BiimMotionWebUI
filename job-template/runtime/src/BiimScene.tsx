import type { ReactNode } from "react";
import { BiimOverlay } from "../../motion-kit/BiimOverlay";
import project from "../../project.json";

// BiimSlideMakerの3つのテキスト領域を、自由なRemotion映像につなぐ。
export interface BiimSceneData {
  id: string;
  script: string;
  note_top: string;
  note_bottom: string;
  duration_sec: number;
  summary?: string;
}
export const BiimScene = ({
  scene,
  children,
  character,
  enabled = project.direction.biim_usage !== "never",
}: {
  scene: BiimSceneData;
  children: ReactNode;
  character?: ReactNode;
  enabled?: boolean;
}) => (
  <BiimOverlay
    enabled={enabled}
    noteTop={scene.note_top}
    noteBottom={scene.note_bottom}
    character={character}
  >
    {children}
  </BiimOverlay>
);
