import {
  AbsoluteFill,
  Audio,
  Loop,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import project from "../../project.json";
import narration from "../data/narration.json";
import sound from "../data/sound-design.json";
import { SceneTimeline } from "../../scenes";
import { Captions } from "./Captions";
import { sceneUsesBiim } from "./Presentation";

type Clip = {
  id: string;
  path: string;
  start_sec: number;
  duration_sec: number;
  text?: string;
  speaker_id?: string;
  scene_id?: string;
  volume?: number;
  loop?: boolean;
  play_duration_sec?: number;
};

export const MainVideo = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const voiceClips = narration.clips as Clip[];
  const soundClips = sound.clips as Clip[];
  return (
    <AbsoluteFill
      style={{
        containerType: "inline-size",
        backgroundColor: project.layout.colors.background,
        fontFamily: project.layout.fonts.body.family,
      }}
    >
      <SceneTimeline />
      {project.voice.engine !== "none" &&
        voiceClips.map((clip) => (
          <Sequence
            key={clip.id}
            from={Math.round(clip.start_sec * fps)}
            durationInFrames={Math.ceil(clip.duration_sec * fps)}
          >
            <Audio src={staticFile(clip.path)} />
            <Captions
              text={clip.text ?? ""}
              speakerId={clip.speaker_id}
              enabled={sceneUsesBiim(clip.scene_id)}
              reserveCharacterSpace={
                project.direction.character_usage !== "none"
              }
            />
          </Sequence>
        ))}
      {project.audio.bgm && (
        <Audio
          src={staticFile(project.audio.bgm)}
          loop
          volume={project.audio.bgm_volume}
        />
      )}
      {soundClips.map((clip) => (
        <Sequence
          key={clip.id}
          from={Math.round(clip.start_sec * fps)}
          durationInFrames={Math.min(
            durationInFrames - Math.round(clip.start_sec * fps),
            Math.ceil((clip.play_duration_sec ?? clip.duration_sec) * fps),
          )}
        >
          {clip.loop ? (
            <Loop
              durationInFrames={Math.max(1, Math.ceil(clip.duration_sec * fps))}
            >
              <Audio src={staticFile(clip.path)} volume={clip.volume ?? 0.15} />
            </Loop>
          ) : (
            <Audio src={staticFile(clip.path)} volume={clip.volume ?? 0.15} />
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
