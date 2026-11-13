// EX-17 / CONTRACT §6. Provisional coefficients; calibrate with stills in T11/G4-α.
export const CAPTION_RULE_VERSION = "1";
export const CAPTION_PADDING = Object.freeze({ x: 12, y: 4 });
export const CAPTION_LINE_HEIGHT = 1.2;
export const FULLSCREEN_CAPTION_FONT = Object.freeze({ landscape: 52, portrait: 54 });
export const BIIM_NO_CHARACTER_WIDTH_RATIO = 0.94;
export const SPEECH_CHARS_PER_SEC = 6.0;

export function effectiveStyleMode(project) {
  return project.direction.style_mode === undefined ? "biim" : project.direction.style_mode;
}
export function effectiveSceneStyle(project, scene) {
  return scene?.style !== undefined ? scene.style : (effectiveStyleMode(project) === "mixed" ? undefined : effectiveStyleMode(project));
}
export function sceneUsesBiimFrame(project, scene) {
  return project.layout.mode !== "fullscreen" && project.video.width >= project.video.height &&
    project.direction.biim_usage !== "never" && scene?.biim !== false;
}
// Returns violations of CONTRACT R1–R7 without changing legacy/MV rendering.
export function styleErrors(project) {
  const errors = [];
  const mode = effectiveStyleMode(project);
  if (!["biim", "anime", "motion", "mixed"].includes(mode)) errors.push("Invalid style_mode");
  if (["anime", "motion"].includes(mode) &&
      (project.layout.mode !== "fullscreen" || project.direction.biim_usage !== "never"))
    errors.push("Non-Biim styles require fullscreen and biim_usage never");
  if (mode === "mixed" && (project.layout.mode !== "biim" ||
      project.video.height > project.video.width || project.direction.biim_usage === "never"))
    errors.push("Mixed style requires landscape Biim layout");
  for (const scene of project.scenes ?? []) {
    const style = effectiveSceneStyle(project, scene);
    if (!["biim", "anime", "motion"].includes(style) ||
        (mode === "biim" && style !== "biim") ||
        (["anime", "motion"].includes(mode) && style === "biim"))
      errors.push(`${scene.id}: invalid or missing scene style`);
    if (["anime", "motion"].includes(style) && scene.biim !== false)
      errors.push(`${scene.id}: non-Biim scene must specify biim: false`);
    if (scene.biim === true && project.layout.mode === "fullscreen")
      errors.push(`${scene.id}: Biim scene forbidden in fullscreen mode`);
  }
  return errors;
}
export function captionBox(project, biimFrame) {
  const region = (biimFrame ? project.layout.regions : project.layout.fullscreen_regions).subtitle;
  const width = biimFrame && project.direction.character_usage === "none"
    ? BIIM_NO_CHARACTER_WIDTH_RATIO * project.layout.base_width : region[2];
  const height = region[3];
  const fontSize = biimFrame ? project.layout.fonts.subtitle.size :
    FULLSCREEN_CAPTION_FONT[project.video.height > project.video.width ? "portrait" : "landscape"];
  if (![width, height, fontSize].every((value) => Number.isFinite(value) && value > 0))
    throw new Error("Invalid caption geometry");
  const charsPerLine = Math.max(0, Math.floor((width - 2 * CAPTION_PADDING.x) / fontSize));
  const lines = Math.max(0, Math.floor((height - 2 * CAPTION_PADDING.y) / (fontSize * CAPTION_LINE_HEIGHT)));
  return { kind: biimFrame ? "biim-frame" : "fullscreen", width, height, fontSize,
    charsPerLine, lines, capacity: charsPerLine * lines };
}
export function candidateCaptionBoxes(project) {
  return project.layout.mode === "biim" ? [captionBox(project, true), captionBox(project, false)] : [captionBox(project, false)];
}
export function charWidth(ch) {
  return /[\u0020-\u007e\uff61-\uff9f]/u.test(ch) ? 0.5 : 1;
}
export function textWidth(text) {
  return Array.from(text).reduce((sum, ch) => sum + charWidth(ch), 0);
}
export function fitCaption(text, box) {
  const rows = text.split("\n").map((row) => row.trim().replace(/\s+/g, " "));
  const widths = rows.map(textWidth);
  const lines = box.charsPerLine > 0 ? widths.reduce((sum, width) => sum + Math.max(1, Math.ceil(width / box.charsPerLine)), 0) : Infinity;
  return { width: widths.reduce((sum, width) => sum + width, 0), lines, fits: lines <= box.lines };
}
export function splitCaptionUnits(text) {
  return (text.match(/[^。！？!?]+[。！？!?]?/g) ?? []).map((unit) => unit.trim()).filter(Boolean);
}
export function estimateSpeechSeconds(text, speed = 1) {
  if (!Number.isFinite(speed) || speed <= 0) throw new Error("Invalid speech speed");
  return Array.from(text.replace(/\s/g, "")).length / (SPEECH_CHARS_PER_SEC * speed);
}
