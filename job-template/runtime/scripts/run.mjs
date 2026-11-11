import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { prepare, root, runtime } from "./lib.mjs";

const require = createRequire(import.meta.url);
const mode = process.argv[2];
// GPU encoding (NVENC): --hardware-acceleration if-possible makes Remotion
// use h264_nvenc on Windows/Linux machines with an NVIDIA GPU and falls
// back to libx264 where NVENC is unavailable. NVENC ignores CRF (Remotion's
// libx264 default is CRF 18), and a bare NVENC encode defaults to ~2 Mbps,
// so an explicit video bitrate is required to keep quality equivalent:
// 16M for final (measured libx264 CRF18 finals: 8-14 Mbps at 1080p30) and
// 8M for the half-scale preview. To revert to CPU encoding, remove the
// --hardware-acceleration and --video-bitrate flags below (and the matching
// pair in ghost-check.mjs renderSecondCopy).
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
    "--hardware-acceleration",
    "if-possible",
    "--video-bitrate",
    "8M",
  ],
  build: [
    "render",
    "src/index.ts",
    "MainVideo",
    "../output/final.mp4",
    "--codec=h264",
    "--audio-codec=aac",
    "--pixel-format=yuv420p",
    "--hardware-acceleration",
    "if-possible",
    "--video-bitrate",
    "16M",
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
