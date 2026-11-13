import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { test } from "node:test";
import {
  explainerAxes,
  explainerAxesForContext,
  explainerCandidates,
  explainerQualityChecklist,
  explainerStyles,
  formatExplainerCandidate,
  scriptStats,
  type ExplainerContext,
} from "../src/explainer-assist.ts";
import { createProject, defaults } from "../src/job.ts";

test("explainer directions have six varied axes and deterministic candidates differing on every active axis", () => {
  assert.equal(explainerAxes.length, 6);
  for (const axis of explainerAxes) assert.ok(axis.options.length >= 6);
  for (const style of Object.values(explainerStyles)) assert.ok(style.options.length >= 6);
  for (const context of [
    {}, { characterMode: "duo" }, { characterUsage: "none" },
    { width: 1080, height: 1920 },
  ] satisfies ExplainerContext[]) {
    for (let seed = 0; seed < 60; seed++) {
      const candidates = explainerCandidates(seed, 3, context);
      assert.deepEqual(candidates, explainerCandidates(seed, 3, context));
      assert.notDeepEqual(candidates, explainerCandidates(seed + 1, 3, context));
      for (const axis of explainerAxesForContext(context)) {
        assert.equal(new Set(candidates.map((candidate) => candidate[axis.key])).size, 3, `${seed}: ${axis.key}`);
      }
    }
  }
  assert.match(formatExplainerCandidate(explainerCandidates(7)[0]), /固定の正解ではなく、取捨選択/);
});

test("character roles switch with solo, duo and no-character contexts; portrait excludes biim and mixed", () => {
  const solo = explainerAxesForContext().find((axis) => axis.key === "character")!;
  const duo = explainerAxesForContext({ characterMode: "duo" }).find((axis) => axis.key === "character")!;
  assert.notDeepEqual(solo.options, duo.options);
  for (const candidate of explainerCandidates(4, 3, { characterMode: "duo" })) assert.ok(duo.options.includes(candidate.character));
  for (const candidate of explainerCandidates(4)) assert.ok(solo.options.includes(candidate.character));
  assert.equal(explainerAxesForContext({ characterUsage: "none" }).length, 5);
  for (const candidate of explainerCandidates(4, 3, { characterUsage: "none" })) assert.equal(candidate.character, undefined);
  for (let seed = 0; seed < 400; seed++) {
    assert.ok(explainerCandidates(seed, 3, { width: 1080, height: 1920 }).every((candidate) => ["anime", "motion"].includes(candidate.styleMode)));
  }
});

test("400 seeds give each style mode at least 15 percent of all candidates", () => {
  const counts = { biim: 0, anime: 0, motion: 0, mixed: 0 };
  const first = { ...counts };
  for (let seed = 0; seed < 400; seed++) {
    const candidates = explainerCandidates(seed);
    first[candidates[0].styleMode]++;
    for (const candidate of candidates) counts[candidate.styleMode]++;
  }
  for (const mode of Object.keys(counts) as (keyof typeof counts)[]) {
    assert.ok(counts[mode] >= 1200 * 0.15, JSON.stringify(counts));
    assert.ok(first[mode] >= 400 * 0.15, JSON.stringify(first));
  }
  console.log("400 seed style distribution:", JSON.stringify(counts), "first candidates:", JSON.stringify(first));
});

test("script stats count characters, speech estimate, headings, blocks, sentences and evidence hints", () => {
  const project = createProject(defaults, { sources: [] });
  const stats = scriptStats("## 導入\n\n雨は2倍。短い！\n\nx = 3", { project });
  assert.equal(stats.characters, 15);
  assert.equal(stats.estimatedSeconds, 2.5);
  assert.equal(stats.headings, 1);
  assert.equal(stats.blocks, 3);
  assert.equal(stats.longestSentence, 5);
  assert.equal(stats.overCapacitySentences, 0);
  assert.equal(stats.numericLines, 2);
  assert.equal(scriptStats("あ".repeat(60), { project, speed: 2 }).estimatedSeconds, 5);
  assert.deepEqual(scriptStats("", { project }), {
    characters: 0, estimatedSeconds: 0, headings: 0, blocks: 0,
    longestSentence: 0, overCapacitySentences: 0, numericLines: 0,
    captionBoxes: stats.captionBoxes,
  });
});

test("script stats share caption geometry, halfwidth handling and explicit line fit with the runtime", () => {
  const project = createProject(defaults, { sources: [] });
  assert.deepEqual(scriptStats("", { project }).captionBoxes.map((box) => box.capacity), [46, 32]);
  assert.equal(scriptStats("あ".repeat(33) + "。", { project }).overCapacitySentences, 1);
  assert.equal(scriptStats("A".repeat(64), { project }).overCapacitySentences, 0);
  assert.equal(scriptStats("A".repeat(65), { project }).overCapacitySentences, 1);
  assert.equal(scriptStats("あ\nい", { project }).overCapacitySentences, 1);
  const portrait = createProject({ ...defaults, width: 1080, height: 1920 }, { sources: [] });
  assert.deepEqual(scriptStats("", { project: portrait }).captionBoxes.map((box) => box.capacity), [34]);
  assert.equal(scriptStats("あ".repeat(34), { project: portrait }).overCapacitySentences, 0);
});

test("all 23 shared failure descriptions also exist in the imported T3 agent harness", async () => {
  const agents = await fs.readFile("job-template/AGENTS.md", "utf8");
  assert.equal(explainerQualityChecklist.length, 23);
  for (const item of explainerQualityChecklist) assert.ok(agents.includes(item), item);
});
