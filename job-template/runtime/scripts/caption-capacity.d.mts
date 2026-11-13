export type StyleMode = "biim" | "anime" | "motion" | "mixed";
export type SceneStyle = "biim" | "anime" | "motion";
export interface CaptionScene { id?: string; biim?: boolean; style?: string }
export interface CaptionProject {
  mode?: string;
  video: { width: number; height: number };
  layout: {
    mode: string; base_width: number; base_height: number;
    regions: Record<string, number[]>; fullscreen_regions: Record<string, number[]>;
    fonts: { subtitle: { size: number } };
  };
  direction: { biim_usage: string; character_usage: string; style_mode?: string };
  scenes?: CaptionScene[];
}
export interface CaptionBox {
  kind: "biim-frame" | "fullscreen";
  width: number; height: number; fontSize: number;
  charsPerLine: number; lines: number; capacity: number;
}
export interface CaptionFit { width: number; lines: number; fits: boolean }
export const CAPTION_RULE_VERSION: string;
export const CAPTION_PADDING: Readonly<{ x: number; y: number }>;
export const CAPTION_LINE_HEIGHT: number;
export const FULLSCREEN_CAPTION_FONT: Readonly<{ landscape: number; portrait: number }>;
export const BIIM_NO_CHARACTER_WIDTH_RATIO: number;
export const SPEECH_CHARS_PER_SEC: number;
export function effectiveStyleMode(project: CaptionProject): StyleMode;
export function effectiveSceneStyle(project: CaptionProject, scene?: { style?: string }): SceneStyle | undefined;
export function sceneUsesBiimFrame(project: CaptionProject, scene?: { biim?: boolean }): boolean;
export function styleErrors(project: CaptionProject): string[];
export function captionBox(project: CaptionProject, biimFrame: boolean): CaptionBox;
export function candidateCaptionBoxes(project: CaptionProject): CaptionBox[];
export function charWidth(ch: string): number;
export function textWidth(text: string): number;
export function fitCaption(text: string, box: CaptionBox): CaptionFit;
export function splitCaptionUnits(text: string): string[];
export function estimateSpeechSeconds(text: string, speed?: number): number;
