import type { ReactNode } from "react";
import { BiimOverlay } from "../../motion-kit/BiimOverlay";
import { biimEnabled } from "./Presentation";

// BiimSlideMakerの3つのテキスト領域を、自由なRemotion映像につなぐ。
export interface BiimSceneData {
  id: string;
  script: string;
  note_top: string;
  note_bottom: string;
  duration_sec: number;
  summary?: string;
  biim?: boolean;
  dialogue?: { speaker_id: string; text: string; spoken_text?: string }[];
}
export const BiimScene = ({
  scene,
  children,
  character,
  secondCharacter,
  enabled = biimEnabled(scene),
}: {
  scene: BiimSceneData;
  children: ReactNode;
  character?: ReactNode;
  secondCharacter?: ReactNode;
  enabled?: boolean;
}) => (
  <BiimOverlay
    enabled={enabled}
    noteTop={scene.note_top}
    noteBottom={scene.note_bottom}
    character={character}
    secondCharacter={secondCharacter}
  >
    {children}
  </BiimOverlay>
);
