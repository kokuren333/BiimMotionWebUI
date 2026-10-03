import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import project from "../project.json";
import { BiimScene, type BiimSceneData } from "../runtime/src/BiimScene";
import { KineticText } from "../motion-kit/KineticText";
import { Character3D } from "../motion-kit/Character3D";
import { DrawArrow } from "../motion-kit/DrawArrow";
import { Pop } from "../motion-kit/Pop";

export const Scene001 = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const scene = (project.scenes as BiimSceneData[])[0] ?? {
    id: "scene001",
    script: "",
    note_top: "START HERE",
    note_bottom:
      "動作確認用のシーンです。台本と構成を作り、自由に映像を実装してください。",
    duration_sec: 6,
  };
  return (
    <BiimScene
      scene={scene}
      character={
        project.direction.character_usage !== "none" ? (
          <Character3D
            model={project.character.model}
            width={Math.round((width * 330) / 1920)}
            height={Math.round((height * 332) / 1080)}
          />
        ) : undefined
      }
    >
      <AbsoluteFill
        style={{
          containerType: "inline-size",
          padding: "6%",
          background: "#304b3a",
          color: "#f5f8e9",
        }}
      >
        <div style={{ fontSize: "1.4cqw", letterSpacing: 4, color: "#c2d594" }}>
          MOTION JOB · STARTER SCENE
        </div>
        <KineticText
          text={project.title}
          style={{
            fontSize: "5cqw",
            fontWeight: 800,
            lineHeight: 1.5,
            marginTop: "5%",
          }}
        />
        <div
          style={{
            display: "flex",
            gap: "7%",
            marginTop: "8%",
            alignItems: "center",
          }}
        >
          <Pop>
            <div
              style={{
                width: "14cqw",
                height: "14cqw",
                borderRadius: "50%",
                background: "#ddeb9a",
                transform: `scale(${1 + Math.sin((frame / fps) * 2) * 0.03})`,
                display: "grid",
                placeItems: "center",
                color: "#304b3a",
                fontSize: "2.5cqw",
              }}
            >
              IDEA
            </div>
          </Pop>
          <DrawArrow width={150} height={60} delay={20} />
          <Pop delay={30}>
            <div style={{ fontSize: "4cqw", fontWeight: 600 }}>MOTION</div>
          </Pop>
        </div>
      </AbsoluteFill>
    </BiimScene>
  );
};
