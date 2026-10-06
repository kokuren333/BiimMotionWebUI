import { Sequence, useVideoConfig } from "remotion";
import project from "../project.json";
import { Scene001 } from "./Scene001";

// 動作確認用6秒。Agentが実際の構成と音声の実測尺に合わせて編集する。
export const videoDurationInFrames =
  project.mode === "mv"
    ? Math.max(
        1,
        Math.ceil(
          project.video.fps *
            (project.audio.music_duration_sec ??
              project.video.target_duration_sec),
        ),
      )
    : Math.round(project.video.fps * 6);
export const SceneTimeline = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <Sequence
      durationInFrames={
        project.mode === "mv" ? durationInFrames : videoDurationInFrames
      }
    >
      <Scene001 />
    </Sequence>
  );
};
