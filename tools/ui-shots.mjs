#!/usr/bin/env node
// UI screenshot script (no dependencies).
//
// Serves the Pages build (dist/) locally under the Pages base path, drives a
// headless Chrome through the DevTools Protocol using Node's built-in
// WebSocket, and captures the S1-S8 shots defined in
// docs/requirements/2026-11-13-explainer-ui-harness.md §3.4.
//
// Usage:
//   npm run build -- --base=/BiimMotionWebUI/
//   node tools/ui-shots.mjs --out=docs/work/2026-11-13-explainer-ui-harness/screenshots/before
//
// Options:
//   --out=DIR       output folder (default: screenshots/before of the work id;
//                   the redesigned UI is recorded in screenshots/after)
//   --dist=DIR      built site (default: dist)
//   --base=PATH     base path the build was made with (default: /BiimMotionWebUI/)
//   --chrome=PATH   Chrome / Chromium / Edge executable (or env CHROME_PATH)
//   --only=S1,S5    capture only these shots (S1-scrolled is its own id)
//
// Selectors target the redesigned four-region DOM (T7: main region, right-top
// and right-bottom notes, fixed subtitle band). S2 fills the T5 explainer
// inputs when available. S1-scrolled is S1 scrolled to the page end; it shows
// that the ZIP button, the status line and the right-top note stay in view
// (UI-13).

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve, sep } from "node:path";
import { crc32, deflateSync } from "node:zlib";

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    return [key, rest.length ? rest.join("=") : "true"];
  }),
);
const OUT = resolve(args.out ?? "docs/work/2026-11-13-explainer-ui-harness/screenshots/before");
const DIST = resolve(args.dist ?? "dist");
const BASE = (args.base ?? "/BiimMotionWebUI/").replace(/\/?$/, "/");
const ONLY = args.only ? new Set(args.only.split(",")) : null;

if (typeof WebSocket !== "function") {
  console.error(`Node ${process.version} has no built-in WebSocket. Use Node 22 or later.`);
  process.exit(2);
}
if (!existsSync(join(DIST, "index.html"))) {
  console.error(`${DIST}/index.html not found. Run: npm run build -- --base=${BASE}`);
  process.exit(2);
}
// Git Bash (MSYS) rewrites "--base=/BiimMotionWebUI/" into a Windows path
// unless MSYS_NO_PATHCONV=1 is set; such a build cannot load its assets.
if (!readFileSync(join(DIST, "index.html"), "utf8").includes(`"${BASE}assets/`)) {
  console.error(
    `${DIST}/index.html does not load assets from ${BASE}. Rebuild with: npm run build -- --base=${BASE}` +
      " (in Git Bash prefix MSYS_NO_PATHCONV=1)",
  );
  process.exit(2);
}

function findChrome() {
  const candidates = [
    args.chrome,
    process.env.CHROME_PATH,
    process.platform === "win32" && `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
    process.platform === "win32" && `${process.env["PROGRAMFILES(X86)"]}\\Google\\Chrome\\Application\\chrome.exe`,
    process.platform === "win32" && `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    process.platform === "win32" && `${process.env["PROGRAMFILES(X86)"]}\\Microsoft\\Edge\\Application\\msedge.exe`,
    process.platform === "darwin" && "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  const found = candidates.find((path) => existsSync(path));
  if (!found) {
    console.error("Chrome not found. Pass --chrome=PATH or set CHROME_PATH.");
    process.exit(2);
  }
  return found;
}

// ---------- fixtures (written to a temporary folder) ----------

function png(width, height, rgb) {
  const row = Buffer.alloc(1 + width * 3);
  for (let x = 0; x < width; x++) row.set(rgb, 1 + x * 3);
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // truecolor
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// 30 s of 8 kHz mono 16-bit silence: a valid audio file whose duration the
// browser can read, so the MV "完成音源" readiness item becomes done.
function wav(seconds = 30, rate = 8000) {
  const data = rate * seconds * 2;
  const buffer = Buffer.alloc(44 + data);
  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + data, 4);
  buffer.write("WAVEfmt ", 8, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(data, 40);
  return buffer;
}

// Test ghost-check report in the shape parseGhostCheckReport (src/job.ts)
// reads: one isolated flash and one clustered run, each with a still pair.
export const ghostFixture = {
  kind: "biim-ghost-check",
  video: "out/preview.mp4",
  fps: 30,
  frames: 900,
  duration: "30.00s",
  counts: { singleFrameEvents: 4, isolated: 1, clusteredRuns: 1, clusteredEvents: 3 },
  isolated: [{ frame: 214, time: "7.13s", tiles: 6 }],
  clustered: [
    { startFrame: 480, endFrame: 486, startTime: "16.00s", endTime: "16.20s", events: 3, maxTiles: 12 },
  ],
  worst: [
    { frame: 482, time: "16.07s", tiles: 12 },
    { frame: 214, time: "7.13s", tiles: 6 },
  ],
  stills: [
    { frame: 214, time: "7.13s", kind: "isolated", files: ["ghost-stills/f00214-prev.png", "ghost-stills/f00214.png"] },
    { frame: 482, time: "16.07s", kind: "clustered", files: ["ghost-stills/f00482-prev.png", "ghost-stills/f00482.png"] },
  ],
};

function writeFixtures(dir) {
  const files = {
    music: join(dir, "sample-30s.wav"),
    ghostJson: join(dir, "ghost-check-preview.json"),
    stills: [
      ["f00214-prev.png", [40, 40, 40]],
      ["f00214.png", [200, 200, 200]],
      ["f00482-prev.png", [40, 40, 40]],
      ["f00482.png", [120, 120, 120]],
    ].map(([name, rgb]) => {
      const path = join(dir, name);
      writeFileSync(path, png(160, 90, rgb));
      return path;
    }),
  };
  writeFileSync(files.music, wav());
  writeFileSync(files.ghostJson, JSON.stringify(ghostFixture, null, 2));
  return files;
}

const MV_INPUT = {
  title: "夜明けのプリズム",
  description: "眠れない夜から朝へ向かう気持ちを、光が少しずつ色を取り戻す映像で表現したい。見終わった後に静かな前向きさを残す。",
  audience: "インディーポップが好きな10〜20代のリスナー",
  musicMood: "静かなAメロから広がるサビ。青から橙へ移る色、ガラスと光のモチーフ。",
  musicLyrics: [
    "[Verse]",
    "眠れない窓の外で",
    "街の灯りがひとつ消えた",
    "",
    "[Chorus]",
    "プリズムを抜けて 朝が来る",
    "まだ名前のない色を 君に見せたい",
    "",
    "[Verse 2]",
    "冷めたコーヒーと古い歌",
    "繰り返すほど 遠くなるのはどうしてなんだろう 答えはまだ見えない",
  ].join("\n"),
};

// ---------- static server ----------

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".ico": "image/x-icon",
};

function serve() {
  const server = createServer((request, response) => {
    const url = new URL(request.url, "http://localhost");
    if (!url.pathname.startsWith(BASE)) {
      response.writeHead(302, { location: BASE });
      return response.end();
    }
    let path = normalize(join(DIST, decodeURIComponent(url.pathname.slice(BASE.length))));
    if (!path.startsWith(DIST + sep) && path !== DIST) {
      response.writeHead(403);
      return response.end();
    }
    if (existsSync(path) && statSync(path).isDirectory()) path = join(path, "index.html");
    if (!existsSync(path)) {
      response.writeHead(404);
      return response.end();
    }
    response.writeHead(200, { "content-type": MIME[extname(path)] ?? "application/octet-stream" });
    response.end(readFileSync(path));
  });
  return new Promise((done) => server.listen(0, "127.0.0.1", () => done(server)));
}

// ---------- Chrome DevTools Protocol over the built-in WebSocket ----------

function launchChrome(profile) {
  const chrome = spawn(
    findChrome(),
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--hide-scrollbars",
      "--force-color-profile=srgb",
      "--lang=ja-JP",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  return new Promise((done, fail) => {
    let log = "";
    const timer = setTimeout(() => fail(new Error(`Chrome did not start.\n${log}`)), 30000);
    chrome.stderr.on("data", (data) => {
      log += data;
      const match = log.match(/DevTools listening on (ws[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        done({ chrome, endpoint: match[1] });
      }
    });
    chrome.on("exit", (code) => fail(new Error(`Chrome exited (${code}):\n${log}`)));
  });
}

class Cdp {
  constructor(endpoint) {
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Set();
    this.socket = new WebSocket(endpoint);
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { done, fail } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) fail(new Error(`${message.error.message} ${message.error.data ?? ""}`));
        else done(message.result);
      } else if (message.method) {
        for (const listener of this.listeners) listener(message);
      }
    });
    this.ready = new Promise((done, fail) => {
      this.socket.addEventListener("open", done, { once: true });
      this.socket.addEventListener("error", fail, { once: true });
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    this.socket.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((done, fail) => this.pending.set(id, { done, fail }));
  }
  once(method, sessionId, timeout = 30000) {
    return new Promise((done, fail) => {
      const timer = setTimeout(() => {
        this.listeners.delete(listener);
        fail(new Error(`timeout waiting for ${method}`));
      }, timeout);
      const listener = (message) => {
        if (message.method === method && message.sessionId === sessionId) {
          clearTimeout(timer);
          this.listeners.delete(listener);
          done(message.params);
        }
      };
      this.listeners.add(listener);
    });
  }
  close() {
    this.socket.close();
  }
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

// One page in its own browser context (fresh storage per shot).
async function openPage(cdp, url, width, height) {
  const { browserContextId } = await cdp.send("Target.createBrowserContext");
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank", browserContextId });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  const send = (method, params) => cdp.send(method, params, sessionId);
  await send("Page.enable");
  await send("Runtime.enable");
  await send("DOM.enable");
  const mobile = width < 600;
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  if (mobile) await send("Emulation.setTouchEmulationEnabled", { enabled: true });
  const loaded = cdp.once("Page.loadEventFired", sessionId);
  await send("Page.navigate", { url });
  await loaded;

  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    }
    return result.result.value;
  };
  const waitFor = async (expression, label = expression, timeout = 15000) => {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      if (await evaluate(`Boolean(${expression})`)) return;
      await sleep(100);
    }
    throw new Error(`timeout: ${label} (${await evaluate("location.href + ' ' + document.readyState + ' ' + document.body.innerHTML.slice(0, 300)")})`);
  };
  const page = {
    evaluate,
    waitFor,
    // Sets a React-controlled input/textarea/select and fires the events React listens to.
    async fill(selector, value) {
      await evaluate(`(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) throw new Error("not found: " + ${JSON.stringify(selector)});
        const proto = Object.getPrototypeOf(el);
        Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(value)});
        el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
      })()`);
    },
    async click(selector) {
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    },
    async clickText(selector, text) {
      await evaluate(`(() => {
        const el = [...document.querySelectorAll(${JSON.stringify(selector)})]
          .find((node) => node.textContent.includes(${JSON.stringify(text)}));
        if (!el) throw new Error("not found: " + ${JSON.stringify(text)});
        el.click();
      })()`);
    },
    async setFiles(selector, files) {
      const { root } = await send("DOM.getDocument", { depth: 0 });
      const { nodeId } = await send("DOM.querySelector", { nodeId: root.nodeId, selector });
      if (!nodeId) throw new Error(`not found: ${selector}`);
      await send("DOM.setFileInputFiles", { nodeId, files });
    },
    async scrollTo(selector, offset = 16) {
      await evaluate(`(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) throw new Error("not found: " + ${JSON.stringify(selector)});
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - ${offset});
      })()`);
    },
    // Brings the element into view. Inside a note region (which scrolls on
    // its own) the region body is scrolled; otherwise the window is scrolled
    // until the element is fully visible.
    async reveal(selector, margin = 16) {
      await evaluate(`(async () => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) throw new Error("not found: " + ${JSON.stringify(selector)});
        const body = el.closest(".region-body");
        if (body && body.scrollHeight > body.clientHeight) {
          body.scrollTop = el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 8;
          return;
        }
        const max = document.documentElement.scrollHeight - innerHeight;
        for (let y = 0; y <= max; y += 40) {
          window.scrollTo(0, y);
          await new Promise((r) => requestAnimationFrame(r));
          const rect = el.getBoundingClientRect();
          if (rect.top >= ${margin} && rect.bottom <= innerHeight - ${margin}) return;
          if (rect.top < ${margin} && rect.height > innerHeight - ${2 * margin}) return;
        }
      })()`);
    },
    async settle() {
      await evaluate("document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))");
      await sleep(400);
    },
    async screenshot(path) {
      await page.settle();
      const { data } = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(path, Buffer.from(data, "base64"));
    },
    async close() {
      await cdp.send("Target.closeTarget", { targetId });
      await cdp.send("Target.disposeBrowserContext", { browserContextId });
    },
  };
  await waitFor("document.querySelector('form') && document.querySelector('.download-button')", "app mounted");
  return page;
}

// ---------- shots (requirements §3.4) ----------

async function fillMv(page, fixtures) {
  await page.fill("form select", "mv");
  await page.waitFor("document.querySelector('[aria-label=\"MVの完成音源を選択\"]')", "MV fields");
  await page.fill("form input[maxlength='200']", MV_INPUT.title);
  await page.fill("#concept textarea[required]", MV_INPUT.description);
  await page.fill(".concept-row input[required]", MV_INPUT.audience);
  const textareas = "[...document.querySelectorAll('#concept textarea')]";
  await page.evaluate(`${textareas}.forEach((el, i) => el.dataset.shot = "ta" + i)`);
  const moodIndex = await page.evaluate(`${textareas}.findIndex((el) => el.placeholder.startsWith("例：夜の街"))`);
  const lyricsIndex = await page.evaluate(`${textareas}.findIndex((el) => el.placeholder.startsWith("歌詞を改行"))`);
  await page.fill(`[data-shot="ta${moodIndex}"]`, MV_INPUT.musicMood);
  await page.fill(`[data-shot="ta${lyricsIndex}"]`, MV_INPUT.musicLyrics);
  await page.setFiles('[aria-label="MVの完成音源を選択"]', [fixtures.music]);
  await page.waitFor("[...document.querySelectorAll('.readiness li.done')].some((li) => li.textContent.includes('完成音源'))", "music duration read");
}

const shots = [
  {
    id: "S1",
    file: "S1-explainer-initial-1440.png",
    size: [1440, 900],
    async run() {},
  },
  {
    id: "S1-scrolled",
    file: "S1-scrolled-explainer-page-end-1440.png",
    size: [1440, 900],
    async run(page) {
      await page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)");
    },
  },
  {
    id: "S2",
    file: "S2-explainer-sample-direction-1440.png",
    size: [1440, 900],
    async run(page) {
      await page.clickText(".sample-button", "サンプル");
      await page.waitFor("document.querySelector('form input[maxlength=\"200\"]').value.length > 0", "sample filled");
      // T5 adds optional inputs and a direction draft below the style selector.
      // Keep the CP-A0 fallback for builds without those fields.
      if (await page.evaluate("Boolean(document.querySelector('[aria-label=\"構成メモの統計\"]'))")) {
        await page.fill('#concept textarea[placeholder^="視聴後に"]', "虹ができる仕組みを、光の屈折と分散から説明できる。");
        await page.fill('#concept textarea[placeholder^="すでに知っていること"]', "雨と光は知っている。虹が物体として空に浮かんでいるという誤解を扱う。");
        await page.fill('#concept textarea[placeholder^="見出しや段落"]', "# 導入\n雨上がりに虹が見えるのはなぜでしょう。\n\n# 光の道筋\n雨粒に入った光は曲がり、色ごとに分かれます。\n\n# まとめ\n虹は光が分かれて見える現象です。");
        await page.fill('#direction .direction-lab textarea', "雨粒の断面と光の道筋を対応させ、図の変化で説明する。");
        await page.waitFor("document.querySelector('#direction .candidate-card')", "explainer candidates");
        await page.scrollTo("#direction .direction-lab");
      } else {
        await page.scrollTo("#direction");
      }
    },
  },
  {
    id: "S3",
    file: "S3-mv-filled-1440.png",
    size: [1440, 900],
    async run(page, fixtures) {
      await fillMv(page, fixtures);
      await page.scrollTo(".direction-lab", 120);
    },
  },
  {
    id: "S4",
    file: "S4-required-missing-error-1440.png",
    size: [1440, 900],
    async run(page) {
      await page.click(".download-button");
      await page.waitFor("document.querySelector('.errors')", "error list");
      // The error summary lives in the fixed subtitle band; it is always in view.
      await page.reveal(".errors");
    },
  },
  {
    id: "S5",
    file: "S5-ghost-check-loaded-1440.png",
    size: [1440, 900],
    async run(page, fixtures) {
      await page.setFiles('[aria-label="ghost-checkのJSONと静止画を選択"]', [fixtures.ghostJson, ...fixtures.stills]);
      await page.waitFor("document.querySelectorAll('.ghost-still-images img').length === 4", "ghost result with stills");
      await page.reveal(".ghost-check-result");
    },
  },
  {
    id: "S6",
    file: "S6-info-dialog-1440.png",
    size: [1440, 900],
    async run(page) {
      await page.clickText(".about-button", "BiimMotion について");
      await page.waitFor("document.querySelector('dialog[open]')", "dialog open");
    },
  },
  {
    id: "S7",
    file: "S7-explainer-390.png",
    size: [390, 844],
    async run() {},
  },
  {
    id: "S8",
    file: "S8-mv-390.png",
    size: [390, 844],
    async run(page, fixtures) {
      await fillMv(page, fixtures);
      await page.evaluate("window.scrollTo(0, 0)");
    },
  },
];

async function main() {
  mkdirSync(OUT, { recursive: true });
  const work = mkdtempSync(join(tmpdir(), "ui-shots-"));
  const fixtures = writeFixtures(work);
  const server = await serve();
  const url = `http://127.0.0.1:${server.address().port}${BASE}`;
  const { chrome, endpoint } = await launchChrome(join(work, "profile"));
  const cdp = new Cdp(endpoint);
  let failed = 0;
  try {
    await cdp.ready;
    const { product } = await cdp.send("Browser.getVersion");
    console.log(`Node ${process.version} / ${product} / ${url}`);
    for (const shot of shots) {
      if (ONLY && !ONLY.has(shot.id)) continue;
      const page = await openPage(cdp, url, ...shot.size);
      try {
        await shot.run(page, fixtures);
        const width = await page.evaluate("document.documentElement.scrollWidth");
        await page.screenshot(join(OUT, shot.file));
        console.log(`${shot.id} ${shot.file} (${shot.size.join("x")}, scrollWidth ${width})`);
      } catch (error) {
        failed++;
        console.error(`${shot.id} failed: ${error.message}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    cdp.close();
    chrome.kill();
    server.close();
    await sleep(500);
    try {
      rmSync(work, { recursive: true, force: true });
    } catch {
      // Chrome may still hold the profile on Windows; the temp folder is harmless.
    }
  }
  process.exit(failed ? 1 : 0);
}

await main();
