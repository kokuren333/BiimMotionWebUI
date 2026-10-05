import project from "../../project.json";

export const biimEnabled = (scene?: { biim?: boolean }) =>
  project.layout.mode !== "fullscreen" &&
  project.video.width >= project.video.height &&
  project.direction.biim_usage !== "never" &&
  scene?.biim !== false;

export const sceneUsesBiim = (sceneId?: string) => {
  const scenes = project.scenes as { id: string; biim?: boolean }[];
  return biimEnabled(scenes.find((scene) => scene.id === sceneId));
};

export const regionsFor = (enabled: boolean) =>
  enabled ? project.layout.regions : project.layout.fullscreen_regions;

export const speakerFor = (speakerId?: string) => {
  const speaker = speakerId
    ? project.characters.find((character) => character.id === speakerId)
    : project.characters[0];
  if (!speaker) throw new Error("Unknown speaker_id: " + speakerId);
  return speaker;
};
