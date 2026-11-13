import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs/promises";
import { createProject, defaults } from "../src/job.ts";
import { captionBox, candidateCaptionBoxes, fitCaption, textWidth, splitCaptionUnits,
  estimateSpeechSeconds, effectiveStyleMode, effectiveSceneStyle, sceneUsesBiimFrame,
  styleErrors } from "../job-template/runtime/scripts/caption-capacity.mjs";

const projectFor = (changes = {}) => createProject({ ...defaults, title: "QC fixture",
  description: "説明", audience: "開発者", ...changes }, { sources: [] });

test("caption rule uses provisional geometry for solo, duo, fullscreen and portrait", () => {
  const solo = projectFor();
  assert.equal(captionBox(solo, true).capacity, 46);
  assert.equal(captionBox(projectFor({ characterMode: "duo" }), true).capacity, 38);
  assert.equal(captionBox(projectFor({ characterPosition: "right" }), true).capacity, 48);
  assert.equal(captionBox(projectFor({ characterUsage: "none" }), true).capacity, 54);
  assert.equal(captionBox(solo, false).capacity, 32);
  assert.equal(captionBox(projectFor({ width: 1080, height: 1920 }), false).capacity, 34);
  assert.equal(candidateCaptionBoxes(solo).length, 2);
});
test("caption fit counts halfwidth, explicit lines and speech units", () => {
  const box = captionBox(projectFor(), true);
  assert.equal(textWidth("あAｱ"), 2);
  assert.equal(fitCaption("あ".repeat(46), box).fits, true);
  assert.equal(fitCaption("あ".repeat(47), box).fits, false);
  assert.equal(fitCaption("あ\nい\nう", box).fits, false);
  assert.equal(fitCaption(" A   B ", box).width, 1.5);
  assert.deepEqual(splitCaptionUnits("一。二！三?"), ["一。", "二！", "三?"]);
  assert.equal(estimateSpeechSeconds("あいうえおか", 2), 0.5);
});
test("style helpers preserve old jobs and require explicit mixed scene assignments", async () => {
  const project = projectFor();
  assert.equal(effectiveStyleMode(project), "biim");
  assert.equal(effectiveSceneStyle(project), "biim");
  assert.equal(sceneUsesBiimFrame(project), true);
  project.direction.style_mode = "mixed";
  project.scenes = [{ id: "s1", script: "説明", duration_sec: 1 }];
  assert.equal(effectiveSceneStyle(project, project.scenes[0]), undefined);
  assert.ok(styleErrors(project).length);
  project.scenes[0].style = "motion";
  project.scenes[0].biim = false;
  assert.deepEqual(styleErrors(project), []);
  assert.equal(sceneUsesBiimFrame(project, project.scenes[0]), false);
  assert.doesNotMatch(await fs.readFile("job-template/runtime/scripts/caption-capacity.mjs", "utf8"), /^import\s/m);
});

