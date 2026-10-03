import { Sequence } from "remotion";
import project from "../project.json";
import { Scene001 } from "./Scene001";

// 動作確認用6秒。Agentが実際の構成と音声の実測尺に合わせて編集する。
export const videoDurationInFrames = Math.round(project.video.fps * 6);
export const SceneTimeline = () => (
  <Sequence durationInFrames={videoDurationInFrames}>
    <Scene001 />
  </Sequence>
);
