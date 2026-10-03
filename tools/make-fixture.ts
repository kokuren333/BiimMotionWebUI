import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { defaults, generateJob, type TemplateFiles } from "../src/job.ts";

const templates: TemplateFiles = {};
async function walk(directory: string) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else
      templates[path.relative("job-template", file).replaceAll("\\", "/")] =
        await fs.readFile(file, "utf8");
  }
}
await walk("job-template");
for (const name of ["NotoSansJP-Variable.ttf", "MPLUSRounded1c-ExtraBold.ttf"])
  templates[`assets/fonts/${name}`] = new Uint8Array(
    await fs.readFile(`public/job-assets/fonts/${name}`),
  );
const job = await generateJob(
  {
    ...defaults,
    title: "smoke-video",
    description: "Runtime smoke test",
    audience: "developers",
    durationSec: 30,
    width: 640,
    height: 360,
  },
  { sources: [] },
  templates,
);
await fs.mkdir(".verification", { recursive: true });
await fs.writeFile(".verification/smoke-motion-job.zip", job.data);
const zip = await JSZip.loadAsync(job.data);
for (const [file, entry] of Object.entries(zip.files)) {
  const target = path.resolve(".verification", file);
  if (!target.startsWith(path.resolve(".verification") + path.sep))
    throw new Error("Unsafe fixture path");
  if (entry.dir) await fs.mkdir(target, { recursive: true });
  else {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, await entry.async("uint8array"));
  }
}
console.log("Created and extracted .verification/smoke-motion-job.zip");
