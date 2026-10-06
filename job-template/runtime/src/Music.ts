import { staticFile } from "remotion";
import project from "../../project.json";

export const musicVideo = project.mode === "mv";

// Read the actual uploaded file in the render browser, independently of UI metadata.
export const getMusicDuration = (): Promise<number> =>
  new Promise((resolve, reject) => {
    if (!project.audio.music) {
      reject(new Error("MV music file is missing"));
      return;
    }
    const audio = new Audio();
    const cleanup = () => {
      clearTimeout(timeout);
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.removeAttribute("src");
      audio.load();
    };
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("MV music metadata timed out"));
    }, 25000);
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const duration = audio.duration;
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0 || duration > 7200)
        reject(new Error("Invalid MV music duration"));
      else resolve(duration);
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error("Unable to load MV music"));
    };
    audio.src = staticFile(project.audio.music);
  });
