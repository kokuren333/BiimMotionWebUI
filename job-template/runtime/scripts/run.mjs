import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { prepare, root, runtime } from "./lib.mjs";

const require = createRequire(import.meta.url);
const mode = process.argv[2];
const modes = {
  studio: ["studio", "src/index.ts"],
  preview: [
    "render",
    "src/index.ts",
    "MainVideo",
    "../output/preview.mp4",
    "--scale=0.5",
    "--codec=h264",
    "--audio-codec=aac",
    "--pixel-format=yuv420p",
  ],
  build: [
    "render",
    "src/index.ts",
    "MainVideo",
    "../output/final.mp4",
    "--codec=h264",
    "--audio-codec=aac",
    "--pixel-format=yuv420p",
  ],
  still: ["still", "src/index.ts", "MainVideo", "../output/preview.png"],
};
if (!modes[mode]) {
  console.error("Use studio / preview / still / build");
  process.exitCode = 1;
} else {
  try {
    await prepare();
    await fs.mkdir(path.join(root, "output"), { recursive: true });
    const cliPackage = require.resolve("@remotion/cli/package.json");
    const cliMeta = JSON.parse(await fs.readFile(cliPackage, "utf8"));
    const executable = path.resolve(
      path.dirname(cliPackage),
      typeof cliMeta.bin === "string" ? cliMeta.bin : cliMeta.bin.remotion,
    );
    const child = spawn(
      process.execPath,
      [executable, ...modes[mode], ...process.argv.slice(3)],
      { cwd: runtime, stdio: "inherit" },
    );
    child.on("error", (error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
    child.on("exit", (code) => {
      process.exitCode = code ?? 1;
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
