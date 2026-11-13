import type { CSSProperties } from "react";
import { Captions } from "../runtime/src/Captions";
import { textLayerStyle } from "./layers";

/**
 * Manual text for silent jobs or other explicit captions. MainVideo already
 * draws captions for audio clips: do not add this for the same spoken text.
 * Reuse the fullscreen caption renderer, including speaker colors and outline.
 */
export const StandardCaption = ({
  text,
  speakerId,
  style,
}: {
  text: string;
  speakerId?: string;
  style?: CSSProperties;
}) => (
  <Captions
    text={text}
    speakerId={speakerId}
    enabled={false}
    style={{ ...textLayerStyle, ...style }}
  />
);
