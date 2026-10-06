import { Composition } from "remotion";
import project from "../../project.json";
import { MainVideo } from "./MainVideo";
import { videoDurationInFrames } from "../../scenes";
import { Fonts } from "./Fonts";
import { getMusicDuration, musicVideo } from "./Music";

export const Root = () => (
  <Fonts>
    <Composition
      id="MainVideo"
      component={MainVideo}
      width={project.video.width}
      height={project.video.height}
      fps={project.video.fps}
      durationInFrames={videoDurationInFrames}
      calculateMetadata={
        musicVideo
          ? async () => ({
              durationInFrames: Math.max(
                1,
                Math.ceil((await getMusicDuration()) * project.video.fps),
              ),
            })
          : undefined
      }
    />
  </Fonts>
);
