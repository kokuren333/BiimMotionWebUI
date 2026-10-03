import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { wavBuffer } from "../job-template/runtime/scripts/lib.mjs";

const run = (file: string) =>
  new Promise<{ code: number | null; output: string }>((resolve, reject) => {
    const child = spawn(process.execPath, [file], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (data) => {
      output += data;
    });
    child.stderr.on("data", (data) => {
      output += data;
    });
    child.on("error", reject);
    child.on("exit", (code) => resolve({ code, output }));
  });

test("Aivis pipeline reads scene scripts, splits captions, measures WAVs and rejects overlaps without replacing the previous manifest", async () => {
  const temp = await fs.mkdtemp(
    path.join(os.tmpdir(), "biimmaker-voice-test-"),
  );
  const requests: {
    endpoint: string;
    speaker: string | null;
    speed?: number;
  }[] = [];
  const server = createServer(async (request, response) => {
    const url = new URL(request.url!, "http://localhost");
    let body = "";
    for await (const chunk of request) body += chunk;
    requests.push({
      endpoint: url.pathname,
      speaker: url.searchParams.get("speaker"),
      ...(body ? { speed: JSON.parse(body).speedScale } : {}),
    });
    if (url.pathname === "/audio_query") {
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ speedScale: 1 }));
    } else if (url.pathname === "/synthesis") {
      response.setHeader("Content-Type", "audio/wav");
      response.end(wavBuffer(new Float32Array(4800).fill(0.01)));
    } else {
      response.statusCode = 404;
      response.end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  try {
    await fs.mkdir(path.join(temp, "runtime/scripts"), { recursive: true });
    await fs.mkdir(path.join(temp, "plan"));
    for (const file of ["aivis.mjs", "lib.mjs"])
      await fs.copyFile(
        `job-template/runtime/scripts/${file}`,
        path.join(temp, "runtime/scripts", file),
      );
    const project = {
      voice: {
        engine: "aivis",
        engine_url: `http://127.0.0.1:${address.port}`,
        style_id: 1069147200,
        speed: 1.1,
      },
      scenes: [
        {
          id: "scene001",
          script: "一つ目です。次です！",
          note_top: "要点",
          note_bottom: "補足",
        },
      ],
    };
    const withAssets = {
      ...project,
      layout: { frame: "assets/frame.svg", fonts: {} },
      character: { model: null },
      audio: { bgm: null },
    };
    await fs.mkdir(path.join(temp, "assets"));
    await fs.writeFile(path.join(temp, "assets/frame.svg"), "<svg/>");
    await fs.writeFile(
      path.join(temp, "project.json"),
      JSON.stringify(withAssets),
    );
    await fs.writeFile(
      path.join(temp, "plan/narration.json"),
      JSON.stringify({ segments: [] }),
    );
    const script = path.join(temp, "runtime/scripts/aivis.mjs");
    const result = await run(script);
    assert.equal(result.code, 0, result.output);
    assert.equal(requests.length, 4);
    assert.equal(requests[1].speaker, "1069147200");
    assert.equal(requests[1].speed, 1.1);
    const manifestPath = path.join(temp, "assets/audio/narration.json");
    const original = await fs.readFile(manifestPath, "utf8");
    const manifest = JSON.parse(original);
    assert.equal(manifest.clips[0].scene_id, "scene001");
    assert.equal(manifest.clips[0].text, "一つ目です。");
    assert.equal(manifest.clips[1].text, "次です！");
    assert.equal(manifest.clips[0].duration_sec, 0.1);
    assert.equal(manifest.clips[1].start_sec, 0.1);
    assert.match(
      await fs.readFile(path.join(temp, "assets/audio/narration.srt"), "utf8"),
      /00:00:00,100 --> 00:00:00,200/,
    );
    await fs.writeFile(
      path.join(temp, "plan/narration.json"),
      JSON.stringify({
        segments: [
          { id: "first", text: "first", start_sec: 0 },
          { id: "second", text: "second", start_sec: 0 },
        ],
      }),
    );
    const failed = await run(script);
    assert.equal(failed.code, 1);
    assert.match(failed.output, /overlaps/);
    assert.equal(await fs.readFile(manifestPath, "utf8"), original);
    assert.equal(
      await fs.access(path.join(temp, "assets/audio/voice-first.wav")).then(
        () => true,
        () => false,
      ),
      false,
    );
    withAssets.voice.engine = "none";
    await fs.writeFile(
      path.join(temp, "project.json"),
      JSON.stringify(withAssets),
    );
    const before = requests.length;
    assert.equal((await run(script)).code, 0);
    assert.equal(requests.length, before);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    assert.ok(
      path.resolve(temp).startsWith(path.resolve(os.tmpdir()) + path.sep),
    );
    assert.ok(path.basename(temp).startsWith("biimmaker-voice-test-"));
    await fs.rm(temp, { recursive: true, force: true });
  }
});
