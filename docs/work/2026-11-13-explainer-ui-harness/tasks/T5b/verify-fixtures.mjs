import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

// Run after make-fixture.ts has generated motion and anime under the given
// temporary directory. This changes only those generated demo scenes.
const root = process.argv[2];
assert.ok(root, "Pass the temporary fixture directory");
const demo = `import { interpolate, useCurrentFrame } from "remotion";
import project from "../project.json";
import { FullscreenStage } from "../motion-kit/FullscreenStage";
import { StandardCaption } from "../motion-kit/StandardCaption";
import { DiagramStage } from "../motion-kit/DiagramStage";

export const Scene001 = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: "clamp" });
  const actor = <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="#f2c75c" /></svg>;
  return (
    <FullscreenStage background="#152433" character={actor} secondCharacter={actor}
      characterStyle={{ transform: "translateY(" + (-20 * progress) + "px)" }}
      secondCharacterStyle={{ transform: "scale(" + (1 + 0.1 * progress) + ")" }}>
      <DiagramStage>
        <div style={{ color: "white", fontSize: "5cqw" }}>原因 → 結果</div>
        <svg viewBox="0 0 1000 300" style={{ width: "100%", height: "60%" }}>
          <circle cx="130" cy="150" r="70" fill="#61c9bd" />
          <path d="M230 150 H750" stroke="#f2c75c" strokeWidth="18"
            strokeDasharray="520" strokeDashoffset={520 * (1 - progress)} />
          <rect x="800" y="80" width="140" height="140" fill="#61c9bd" />
        </svg>
      </DiagramStage>
      {/* MainVideo draws spoken captions. Manual captions are for silent jobs. */}
      {project.voice.engine === "none" && <StandardCaption text="図の変化で説明します。" />}
    </FullscreenStage>
  );
};
`;

for (const style of ["motion", "anime"]) {
  const job = path.resolve(root, style, "smoke-video");
  const project = JSON.parse(await fs.readFile(path.join(job, "project.json"), "utf8"));
  assert.equal(project.direction.style_mode, style);
  assert.equal(project.layout.mode, "fullscreen");
  assert.ok(project.scenes.length > 0 && project.scenes.every((scene) => scene.biim === false));
  await fs.writeFile(path.join(job, "scenes", "Scene001.tsx"), demo);
  for (const file of await fs.readdir(path.join(job, "scenes"))) {
    const source = await fs.readFile(path.join(job, "scenes", file), "utf8");
    assert.doesNotMatch(source, /BiimScene|BiimOverlay/);
  }
  console.log("[" + style + "] scene uses FullscreenStage / StandardCaption / DiagramStage; Biim parts: 0");
  for (const command of ["npm install", "npm run validate", "npm run qc -- --stage=pre"]) {
    const result = spawnSync(command, { cwd: job, shell: true, encoding: "utf8" });
    console.log("[" + style + "] " + command + " exit=" + result.status);
    console.log(result.stdout);
    if (result.stderr) console.log(result.stderr);
    assert.equal(result.status, 0, command + " failed");
  }
}
