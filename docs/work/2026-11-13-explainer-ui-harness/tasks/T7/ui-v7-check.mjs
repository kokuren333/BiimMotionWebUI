#!/usr/bin/env node
// UI-V7 operation check (T7). Drives the Pages build (dist/, base /BiimMotionWebUI/)
// in headless Chrome over CDP and operates every UI-11 / audit §(2) item.
// Record of the T7 UI-V7 operation check (kept with the task record, not a tool).
// Usage (repo root, after npm run build -- --base=/BiimMotionWebUI/; in Git Bash
// prefix MSYS_NO_PATHCONV=1):
//   mkdir -p .agent-work && node docs/work/2026-11-13-explainer-ui-harness/tasks/T7/ui-v7-check.mjs > .agent-work/ui-v7-result.json
// Chrome: CHROME_PATH, or the default Windows install location.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve, sep } from "node:path";

const DIST = resolve("dist");
const BASE = "/BiimMotionWebUI/";
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".ttf": "font/ttf", ".json": "application/json", ".svg": "image/svg+xml" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fontRequests = [];

function serve() {
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.endsWith(".ttf")) fontRequests.push(url.pathname);
    if (!url.pathname.startsWith(BASE)) { res.writeHead(404); return res.end(); }
    let path = normalize(join(DIST, decodeURIComponent(url.pathname.slice(BASE.length))));
    if (!path.startsWith(DIST + sep) && path !== DIST) { res.writeHead(403); return res.end(); }
    if (existsSync(path) && statSync(path).isDirectory()) path = join(path, "index.html");
    if (!existsSync(path)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": MIME[extname(path)] ?? "application/octet-stream" });
    res.end(readFileSync(path));
  });
  return new Promise((done) => server.listen(0, "127.0.0.1", () => done(server)));
}

function launch(profile) {
  const chrome = spawn(process.env.CHROME_PATH || `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`, [
    "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run",
    "--disable-extensions", "--hide-scrollbars", "--lang=ja-JP", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  return new Promise((done, fail) => {
    let log = "";
    chrome.stderr.on("data", (d) => { log += d; const m = log.match(/DevTools listening on (ws\S+)/); if (m) done({ chrome, endpoint: m[1] }); });
    setTimeout(() => fail(new Error(log)), 30000);
  });
}

class Cdp {
  constructor(endpoint) {
    this.id = 0; this.pending = new Map(); this.ws = new WebSocket(endpoint);
    this.ws.addEventListener("message", (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.fail(new Error(m.error.message)) : p.done(m.result); }
    });
    this.ready = new Promise((d) => this.ws.addEventListener("open", d, { once: true }));
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id; this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((done, fail) => this.pending.set(id, { done, fail }));
  }
}

async function open(cdp, url, width, height) {
  const { browserContextId } = await cdp.send("Target.createBrowserContext");
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank", browserContextId });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  const send = (m, p) => cdp.send(m, p, sessionId);
  await send("Page.enable"); await send("Runtime.enable"); await send("DOM.enable");
  await cdp.send("Browser.grantPermissions", { browserContextId, origin: new URL(url).origin, permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] });
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await send("Browser.setDownloadBehavior", { behavior: "deny" }).catch(() => {});
  await send("Page.navigate", { url });
  const ev = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const wait = async (expr, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await ev(`Boolean(${expr})`)) return true; await sleep(50); } throw new Error("timeout " + expr); };
  await wait("document.querySelector('.download-button')");
  await ev("document.fonts.ready");
  const fill = (sel, v) => ev(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) throw new Error("nf " + ${JSON.stringify(sel)}); Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value").set.call(el, ${JSON.stringify(v)}); el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true })); })()`);
  const click = (sel) => ev(`document.querySelector(${JSON.stringify(sel)}).click()`);
  const clickText = (sel, t) => ev(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find((n) => n.textContent.includes(${JSON.stringify(t)})); if (!el) throw new Error("nf " + ${JSON.stringify(t)}); el.click(); })()`);
  const setFiles = async (sel, files) => {
    const { root } = await send("DOM.getDocument", { depth: 0 });
    const { nodeId } = await send("DOM.querySelector", { nodeId: root.nodeId, selector: sel });
    if (!nodeId) throw new Error("nf " + sel);
    await send("DOM.setFileInputFiles", { nodeId, files });
  };
  const key = async (k, code, keyCode, shift = false) => {
    const mod = shift ? 8 : 0;
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: k, code, windowsVirtualKeyCode: keyCode, modifiers: mod });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: keyCode, modifiers: mod });
  };
  const close = async () => { await cdp.send("Target.closeTarget", { targetId }); await cdp.send("Target.disposeBrowserContext", { browserContextId }); };
  return { ev, wait, fill, click, clickText, setFiles, key, send, close };
}

// fixtures
function wav(seconds = 12, rate = 8000) {
  const data = rate * seconds * 2; const b = Buffer.alloc(44 + data);
  b.write("RIFF", 0); b.writeUInt32LE(36 + data, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(data, 40); return b;
}
const dir = mkdtempSync(join(tmpdir(), "uiv7-"));
const fx = {
  wav: join(dir, "song.wav"), glb: join(dir, "model.glb"), glb2: join(dir, "model2.glb"), pdf: join(dir, "paper.pdf"), txt: join(dir, "notes.txt"),
  ghost: join(dir, "ghost-check.json"), bad: join(dir, "broken.json"), still: join(dir, "f00214.png"),
};
writeFileSync(fx.wav, wav()); writeFileSync(fx.glb, Buffer.from("glTF")); writeFileSync(fx.glb2, Buffer.from("glTF2"));
writeFileSync(fx.pdf, Buffer.from("%PDF-1.4\n")); writeFileSync(fx.txt, "memo");
writeFileSync(fx.bad, "{ not json");
writeFileSync(fx.ghost, JSON.stringify({ kind: "biim-ghost-check", video: "out/preview.mp4", fps: 30, frames: 900, duration: "30.00s",
  counts: { singleFrameEvents: 1, isolated: 1, clusteredRuns: 0, clusteredEvents: 0 }, isolated: [{ frame: 214, time: "7.13s", tiles: 6 }], clustered: [],
  worst: [{ frame: 214, time: "7.13s", tiles: 6 }], stills: [{ frame: 214, time: "7.13s", kind: "isolated", files: ["ghost-stills/f00214-prev.png", "ghost-stills/f00214.png"] }] }));
writeFileSync(fx.still, readFileSync(resolve("public/icons/info.png")));

const out = {};
const rec = (id, ok, detail) => { out[id] = { ok, detail }; writeFileSync(".agent-work/ui-v7-partial.json", JSON.stringify(out, null, 2)); };

const server = await serve();
const url = `http://127.0.0.1:${server.address().port}${BASE}`;
const { chrome, endpoint } = await launch(join(dir, "profile"));
const cdp = new Cdp(endpoint); await cdp.ready;
try {
  // ---------- 1440x900 explainer ----------
  let p = await open(cdp, url, 1440, 900);
  const q = (s) => p.ev(s);
  rec("font-caption", await q(`document.fonts.check('800 22px "BiimMotion Caption"')`), { fontRequests: [...fontRequests] });
  rec("favicon", await q(`document.querySelector('link[rel=icon]').href.startsWith('data:image/svg+xml')`), null);
  // UI-12: first five 01 items above the band
  rec("UI-12", await q(`(() => { const band = document.querySelector('.subtitle-band').getBoundingClientRect().top;
    const els = [document.querySelector('#concept select'), document.querySelector('input[maxlength="200"]'), document.querySelector('#concept textarea[required]'), document.querySelector('.concept-row input[required]'), document.querySelector('[aria-label="希望尺（秒）"]')];
    return els.every((e) => e.getBoundingClientRect().bottom <= band); })()`), "制作モード・タイトル・説明目的・対象視聴者・希望尺の下端が字幕帯より上");
  const regions = `JSON.stringify(['.region-main','.region-note-top','.region-note-bottom','.subtitle-band'].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [s, Math.round(r.left), Math.round(r.top), Math.round(r.width), s === '.region-main' ? 'h*' : Math.round(r.height)]; }))`;
  const regionsExp = await q(regions);
  // UI-13 at page end
  await q("window.scrollTo(0, document.documentElement.scrollHeight)"); await sleep(100);
  rec("UI-13", await q(`(() => { const v = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }; return v('.download-button') && v('.band-status') && v('.region-note-top'); })()`), "最下部までスクロールしても ZIP 生成ボタン・状態の一文・右上ノートが画面内");
  await q("window.scrollTo(0, 0)");
  // UI-09: transitions / animations on every element
  rec("UI-09", await q(`(() => { const bad = []; for (const el of document.querySelectorAll('*')) { const c = getComputedStyle(el); for (const v of [c.transitionDuration, c.animationDuration]) for (const t of v.split(',')) { const ms = parseFloat(t) * (t.trim().endsWith('ms') ? 1 : 1000); if (ms > 100) bad.push(el.className + ' ' + v); } } return bad.length === 0 ? true : bad.slice(0, 5); })()`), "全要素の computed transition-duration / animation-duration が 100ms 以下");
  // audit 1, UI-02: TOC and section ids
  rec("A1-toc", await q(`[...document.querySelectorAll('.toc a')].map((a) => a.getAttribute('href') + (a.getAttribute('aria-current') ? '*' : '')).join(' ')`), "目次5項目");
  await q("document.getElementById('direction').scrollIntoView()"); await sleep(400);
  rec("A1-current", await q(`document.querySelector('.toc a[aria-current]').getAttribute('href')`), "03 へスクロール後の現在地");
  const jumps = [];
  for (const id of ["concept", "sources", "direction", "character", "voice", "concept"]) {
    await q(`document.querySelector('.toc a[href="#${id}"]').click()`); await sleep(500);
    jumps.push(await q(`'#${id}→' + document.querySelector('.toc a[aria-current]').getAttribute('href') + ' heading@' + Math.round(document.querySelector('#${id} h2').getBoundingClientRect().top) + ' tocBottom@' + Math.round(document.querySelector('.toc-bar').getBoundingClientRect().bottom)`));
  }
  rec("A1-toc-jump", jumps.every((j) => j.split(' ')[0].split('→')[0] === j.split(' ')[0].split('→')[1]) ? jumps : { mismatch: jumps }, "目次のリンクで各セクションへ移動したときの現在地と見出しの位置");
  await q("window.scrollTo(0, 0)"); await sleep(300);
  await q("window.scrollTo(0,0)"); await sleep(200);
  // audit 4: fields
  await p.fill('input[maxlength="200"]', "検証タイトル");
  await p.fill("#concept textarea[required]", "検証の目的");
  await p.fill(".concept-row input[required]", "検証の視聴者");
  await p.fill('[aria-label="希望尺（秒）"]', "45");
  rec("A4-fields", await q(`[document.querySelector('.job-title h3').textContent, [...document.querySelectorAll('.job-specs dd')].map((d) => d.textContent).join(' | '), document.querySelector('.toc a[href="#concept"] .toc-mark').textContent]`), "入力→右上ノートと目次の完了印に反映");
  // explainer extra fields and script stats
  await p.fill('#concept textarea[placeholder^="見出しや段落"]', "# 導入\n雨上がりに虹が見えるのはなぜでしょう。\n\n# まとめ\n虹は光が分かれて見える現象です。");
  rec("script-stats", await q(`document.querySelector('[aria-label="構成メモの統計"]').textContent`), "台本統計");
  // audit 2: mode switch and drafts
  await p.fill("#direction textarea[placeholder^='配色']", "解説のデザイン文");
  await p.fill("#concept select", "mv"); await sleep(100);
  const mvState = await q(`[document.querySelectorAll('.toc a').length, !!document.getElementById('character'), !!document.getElementById('voice'), !!document.querySelector('.advanced-section'), document.querySelector("#direction textarea[placeholder^='配色']").value.slice(0, 20), !!document.querySelector('[aria-label="MVの完成音源を選択"]')]`);
  const regionsMv = await q(regions);
  await p.fill("#direction textarea[placeholder^='配色']", "MVのデザイン文");
  await p.fill("#concept select", "explanation"); await sleep(100);
  const backExp = await q(`document.querySelector("#direction textarea[placeholder^='配色']").value`);
  await p.fill("#concept select", "mv"); await sleep(100);
  const backMv = await q(`document.querySelector("#direction textarea[placeholder^='配色']").value`);
  rec("A2-mode", { mvState, backExp, backMv }, "MV で目次3・04/05/詳細なし・音源欄あり、モード別デザイン文の保持");
  rec("UI-14", regionsExp === regionsMv, { explainer: regionsExp, mv: regionsMv });
  // audit 5/6: MV lyrics, music
  const tas = "[...document.querySelectorAll('#concept textarea')]";
  await q(`${tas}.forEach((el, i) => el.dataset.v = 'ta' + i)`);
  const li = await q(`${tas}.findIndex((el) => el.placeholder.startsWith("歌詞を改行"))`);
  await p.fill(`[data-v="ta${li}"]`, "[Verse]\n一行目\n\n[Chorus]\nとても長い行でとても長い行でとても長い行でとても長い行");
  rec("A5-lyrics", await q(`document.querySelector('#concept .lyric-stats').textContent`), "歌詞統計（20字超の警告つき）");
  await p.setFiles('[aria-label="MVの完成音源を選択"]', [fx.wav]);
  await p.wait(`document.body.textContent.includes('完成音源の尺: 12.00秒')`);
  rec("A6-music", await q(`[[...document.querySelectorAll('#concept small[role=status]')].map((e) => e.textContent).join(''), document.querySelector('.band-status').textContent]`), "音源の尺の実測と字幕帯の表示");
  // audit 9 MV direction lab
  const mvCand1 = await q(`document.querySelector('#direction .candidate-card dd').textContent`);
  await p.clickText("#direction .ghost-button", "別の組み合わせ");
  const mvCand2 = await q(`document.querySelector('#direction .candidate-card dd').textContent`);
  await p.clickText("#direction .candidate-card .ghost-button", "この案を追記");
  rec("A9-mv-direction", { changed: mvCand1 !== mvCand2 || "same-first-axis", appended: await q(`document.querySelector("#direction textarea[placeholder^='配色']").value.includes('配色')`), label: await q(`document.querySelector('#direction .candidate-card .ghost-button').textContent`), hints: await q(`document.querySelectorAll('#direction .axis-hints li').length`) }, "MV たたき台：引き直し・追記・軸の説明");
  rec("readiness-mv", await q(`[...document.querySelectorAll('.readiness li')].map((l) => (l.classList.contains('done') ? '✓' : '・') + l.textContent).join(' / ')`), "MV 準備度");
  rec("checklist-mv", await q(`document.querySelectorAll('.quality-checklist li').length`), "MV 失敗パターン件数");
  rec("band-mv-plain", await q(`getComputedStyle(document.querySelector('.band-line')).fontFamily`), "MV の字幕帯は通常書体");
  await p.fill("#concept select", "explanation"); await sleep(100);
  // audit 3 sample
  await p.clickText(".sample-button", "サンプル");
  rec("A3-sample", await q(`[document.querySelector('input[maxlength="200"]').value, document.querySelector('[aria-label="希望尺（秒）"]').value]`), "サンプル入力");
  // audit 7 sources: file input, drop, remove, count
  await p.setFiles('[aria-label="参考資料を選択"]', [fx.pdf]);
  await q(`(async () => { const dt = new DataTransfer(); dt.items.add(new File(['abc'], 'dropped.txt', { type: 'text/plain' })); const z = document.querySelector('.dropzone'); z.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt })); await new Promise((r) => setTimeout(r, 80)); window.__dragging = z.classList.contains('dragging'); z.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt })); })()`);
  await sleep(100);
  const srcBefore = await q(`[[...document.querySelectorAll('#sources .attachments li strong')].map((s) => s.textContent).join(','), document.querySelector('.attachment-count').textContent, window.__dragging]`);
  await q(`document.querySelector('#sources .attachments li button').click()`); await sleep(50);
  const srcAfter = await q(`[[...document.querySelectorAll('#sources .attachments li strong')].map((s) => s.textContent).join(','), document.querySelector('.attachment-count').textContent, document.querySelector('#sources .attachments li button').getAttribute('aria-label'), document.querySelector('#sources .attachments li button').textContent.trim()]`);
  await p.fill("#sources textarea", "https://example.com/a\nhttps://example.com/b");
  rec("A7-sources", { srcBefore, srcAfter, specs: await q(`[...document.querySelectorAll('.job-specs dd')][4].textContent`) }, "選択・ドロップ（dragging 表示）・削除（文字ラベル）・件数と容量・URL 件数");
  // audit 8 / AM-2-5 style mode
  const styleList = await q(`[...document.querySelectorAll('.style-mode-list li')].map((l) => (l.classList.contains('selected') ? '[選択]' : '') + l.querySelector('strong').textContent).join(' / ')`);
  await p.fill("#direction select", "motion"); await sleep(50);
  const styleMotion = await q(`[document.querySelector('.style-mode-list li.selected strong').textContent, document.querySelector('.layout-switch input').disabled, [...document.querySelectorAll('.job-specs dd')][1].textContent, document.querySelector('.prompt-box p').textContent.includes('motion')]`);
  await p.fill("#direction select", "biim"); await sleep(50);
  await q(`document.querySelector('.layout-switch input').click()`); await sleep(50);
  const fullOn = await q(`[document.querySelector('.layout-switch input').checked, document.querySelector('.video-schematic').className, document.querySelector('.video-schematic').getAttribute('aria-label')]`);
  await q(`document.querySelector('.layout-switch input').click()`); await sleep(50);
  rec("A8-style-layout", { styleList, styleMotion, fullOn }, "様式モード4種の説明・選択・全画面切替とレイアウト図の連動");
  // explainer direction lab
  const exDesign0 = await q(`document.querySelector("#direction textarea[placeholder^='配色']").value.length`);
  await p.clickText("#direction .ghost-button", "別の組み合わせ");
  await q(`[...document.querySelectorAll('#direction .candidate-card .ghost-button')][1].click()`); await sleep(50);
  rec("explainer-direction", { appended: (await q(`document.querySelector("#direction textarea[placeholder^='配色']").value.length`)) > exDesign0, label: await q(`[...document.querySelectorAll('#direction .candidate-card .ghost-button')][1].textContent`), memo: await q(`!!document.querySelector('#direction textarea[placeholder^="前作と変えたい説明"]')`) }, "解説たたき台：引き直し・追記・差別化メモ");
  // audit 10 asset generation
  const ag = "#direction .asset-options input";
  const ag0 = await q(`[...document.querySelectorAll('${ag}')].map((i) => i.checked)`);
  await q(`document.querySelectorAll('${ag}')[1].click()`); await sleep(30);
  rec("A10-asset", { before: ag0, after: await q(`[...document.querySelectorAll('${ag}')].map((i) => i.checked)`), json: await (async () => { await q(`document.querySelector('#tab-json').click()`); await sleep(80); return q(`document.querySelector('.json-preview').textContent.includes('"video_generation": true')`); })() }, "素材生成2設定と JSON への反映");
  await q(`document.querySelector('#tab-layout').click()`);
  // audit 11 character
  await p.fill("#character select", "duo"); await sleep(50);
  const duo = await q(`[document.querySelectorAll('.character-card').length, !!document.querySelector('.schematic-character.second')]`);
  await p.fill('[aria-label="1人目の字幕色（HEX）"]', "#00aa00"); await sleep(50);
  const color = await q(`[document.querySelector('.subtitle-sample').style.color, document.querySelector('.band-caption').style.getPropertyValue('--caption-color'), getComputedStyle(document.querySelector('.band-line')).color]`);
  await p.fill('[aria-label="1人目の字幕色"]', "#123456"); await sleep(50);
  const colorPicker = await q(`document.querySelector('[aria-label="1人目の字幕色（HEX）"]').value`);
  await p.fill('[aria-label="1人目の配置"]', "right"); await sleep(50);
  const pos = await q(`document.querySelector('.schematic-character').style.left`);
  await p.setFiles('[aria-label="1人目の3Dモデルを選択"]', [fx.glb]);
  await p.setFiles('[aria-label="2人目の3Dモデルを選択"]', [fx.glb2]);
  await sleep(50);
  await q(`document.querySelector('#tab-files').click()`); await sleep(80);
  const glb = await q(`document.querySelector('.file-tree').textContent.match(/character2?\\.glb/g)`);
  await q(`document.querySelector('#tab-layout').click()`);
  rec("A11-character", { duo, color, colorPicker, pos, glb, duoAivis: await q(`!!document.querySelector('[aria-label="2人目のStyle ID"]')`) }, "1人／2人・字幕色（HEX／ピッカー）と字幕見本・字幕帯の即時反映・配置・GLB");
  await p.fill("#character select", "solo"); await sleep(50);
  // audit 12 voice / output
  await p.fill("#voice select", "none"); await sleep(50);
  const voiceNone = await q(`!!document.querySelector('#voice input[type=url]')`);
  await p.fill("#voice select", "aivis"); await sleep(50);
  const voiceAivis = await q(`[!!document.querySelector('#voice input[type=url]'), document.querySelector('#voice .row small')?.textContent]`);
  await p.setFiles('[aria-label="BGMを選択"]', [fx.wav]); await sleep(50);
  const bgm = await q(`[...document.querySelectorAll('#voice .attachments li strong')].map((s) => s.textContent)`);
  const selVoice = "[...document.querySelectorAll('#voice select')]";
  await q(`(() => { const s = ${selVoice}.find((x) => [...x.options].some((o) => o.value === 'portrait')); s.dataset.v = 'orient'; })()`);
  await p.fill('[data-v="orient"]', "portrait"); await sleep(50);
  const portrait = await q(`[${selVoice}.map((s) => s.value).join(' '), [...document.querySelectorAll('#direction select option')].find((o) => o.value === 'mixed').disabled, document.querySelector('.video-schematic').className]`);
  await p.fill('[data-v="orient"]', "landscape"); await sleep(50);
  await q(`(() => { const s = ${selVoice}.find((x) => [...x.options].some((o) => o.value === '60')); s.dataset.v = 'fps'; })()`);
  await p.fill('[data-v="fps"]', "60"); await sleep(50);
  rec("A12-voice-output", { voiceNone, voiceAivis, bgm, portrait, fps: await q(`[...document.querySelectorAll('.job-specs dd')][3].textContent`) }, "音声エンジン切替・Aivis・BGM・向き・解像度・fps");
  // audit 13 advanced
  const adv0 = await q(`[document.querySelector('.advanced-toggle').getAttribute('aria-expanded'), document.getElementById('advanced-controls').hidden, document.querySelector('.toggle-state').textContent]`);
  await q(`document.querySelector('.advanced-toggle').click()`); await sleep(50);
  const adv1 = await q(`[document.querySelector('.advanced-toggle').getAttribute('aria-expanded'), document.getElementById('advanced-controls').hidden, document.querySelector('.toggle-state').textContent, document.querySelectorAll('#advanced-controls select').length, document.querySelectorAll('#advanced-controls textarea, #advanced-controls input').length]`);
  rec("A13-advanced", { adv0, adv1 }, "詳細の展開（aria-expanded・hidden）と項目");
  // audit 14 preview tabs
  const tabs = [];
  for (const t of ["files", "json", "layout"]) { await q(`document.querySelector('#tab-${t}').click()`); await sleep(30); tabs.push(await q(`[document.querySelector('#tab-${t}').getAttribute('aria-selected'), document.querySelector('[role=tabpanel]').id, document.querySelector('[role=tabpanel]').textContent.length > 0]`)); }
  rec("A14-preview", tabs, "イメージ／同梱ファイル／JSON のタブ");
  // explainer readiness/warnings/checklist
  rec("readiness-explainer", await q(`[...document.querySelectorAll('.readiness li')].map((l) => (l.classList.contains('done') ? '✓' : '・') + l.textContent).join(' / ')`), "解説の準備度");
  rec("checklist-explainer", await q(`document.querySelectorAll('.quality-checklist li').length`), "解説の失敗パターン件数");
  rec("band-caption-font", await q(`getComputedStyle(document.querySelector('.band-line')).fontFamily`), "解説の字幕帯は字幕書体");
  // audit 17 copy
  await q(`document.querySelector('.copy-button').click()`); await sleep(300);
  rec("A17-copy", [await q(`document.querySelector('.copy-status').textContent`), await q(`document.querySelector('.prompt-box p').textContent.slice(0, 30)`)], "指示のコピーと状態表示");
  // audit 15/21 ZIP generation, busy disables the fieldset
  await q(`window.__busy = []; new MutationObserver(() => window.__busy.push([document.querySelector('fieldset.form-body').disabled, !!document.querySelector('.band-actions progress'), document.querySelector('.download-button').textContent])).observe(document.querySelector('.band-actions'), { subtree: true, childList: true, characterData: true, attributes: true })`);
  await q(`document.querySelector('.download-button').click()`);
  await p.wait(`document.querySelector('.success')`, 60000);
  rec("A15-zip", { success: await q(`document.querySelector('.success').textContent`), busySeen: await q(`window.__busy.find((b) => b[0]) ?? null`) }, "ZIP 生成・進捗・生成中の入力無効化・成功表示");
  // audit 18 ghost check: broken then valid
  await p.setFiles('[aria-label="ghost-checkのJSONと静止画を選択"]', [fx.bad]); await sleep(200);
  const gErr = await q(`document.querySelector('.ghost-check-error')?.textContent`);
  await p.setFiles('[aria-label="ghost-checkのJSONと静止画を選択"]', [fx.ghost, fx.still]); await sleep(300);
  rec("A18-ghost", { error: gErr, verdict: await q(`document.querySelector('.ghost-check-result .ghost-verdict').textContent`), counts: await q(`document.querySelectorAll('.ghost-counts li').length`), imgs: await q(`document.querySelectorAll('.ghost-still-images img').length`), missing: await q(`document.querySelectorAll('.ghost-still-missing').length`) }, "読込エラー・判定文・件数・静止画・欠けの表示");
  // audit 19 dialog
  await q(`document.querySelector('.about-button').click()`); await sleep(50);
  const d1 = await q(`document.querySelector('dialog').open`);
  await q(`document.querySelector('dialog .small-button').click()`); await sleep(50);
  const d2 = await q(`document.querySelector('dialog').open`);
  await q(`document.querySelector('.main-footer .text-button').click()`); await sleep(50);
  const d3 = await q(`[document.querySelector('dialog').open, [...document.querySelectorAll('dialog h3')].map((h) => h.textContent).join('/')]`);
  await p.key("Escape", "Escape", 27); await sleep(50);
  rec("A19-dialog", { openAbout: d1, closedButton: !d2, openFooter: d3, closedEsc: !(await q(`document.querySelector('dialog').open`)) }, "情報ダイアログ（アプリバー・フッターから開く、閉じる、Esc）");
  rec("A20-local", await q(`[document.querySelector('.local-note').textContent, document.querySelector('.editor-footnote').textContent]`), "ローカル完結の明示");
  await p.close();

  // ---------- required errors + focus ----------
  p = await open(cdp, url, 1440, 900);
  await p.ev(`document.querySelector('.download-button').click()`);
  await p.wait(`document.querySelector('.errors')`);
  await sleep(300);
  rec("A16-errors", await p.ev(`[[...document.querySelectorAll('.errors li')].map((l) => l.textContent), document.activeElement.className, document.querySelector('.errors').getAttribute('role'), (() => { const r = document.querySelector('.errors').getBoundingClientRect(); return r.bottom <= innerHeight; })()]`), "全問題の列挙・role=alert・フォーカス移動・全件が画面内");
  await p.fill('input[maxlength="200"]', "x"); await sleep(50);
  rec("A16-clear", await p.ev(`!document.querySelector('.errors')`), "入力でエラー表示が消える");
  await p.close();

  // ---------- Tab order (explainer, 1440, details open) ----------
  for (const mode of ["explanation", "mv"]) {
    p = await open(cdp, url, 1440, 900);
    if (mode === "mv") { await p.fill("#concept select", "mv"); await sleep(100); }
    else { await p.ev(`document.querySelector('.advanced-toggle').click()`); await sleep(50); }
    await p.ev(`document.activeElement.blur(); window.scrollTo(0,0)`);
    const seen = []; let first = null;
    for (let i = 0; i < 200; i++) {
      await p.key("Tab", "Tab", 9);
      const d = await p.ev(`(() => { const e = document.activeElement; if (!e || e === document.body) return null;
        const lab = e.getAttribute('aria-label') || (e.labels && e.labels[0] ? e.labels[0].textContent.trim().split('\\n')[0] : '') || e.textContent.trim();
        const region = e.closest('.app-bar') ? 'bar' : e.closest('.region-main') ? 'main' : e.closest('.region-note-top') ? 'note-top' : e.closest('.region-note-bottom') ? 'note-bottom' : e.closest('.subtitle-band') ? 'band' : 'other';
        const cs = getComputedStyle(e); const fv = e.matches(':focus-visible') || e.closest('.file-button')?.matches(':focus-within');
        const outl = e.closest('.file-button') ? getComputedStyle(e.closest('.file-button')).outlineStyle : cs.outlineStyle;
        return region + ' | ' + e.tagName.toLowerCase() + (e.type ? '[' + e.type + ']' : '') + ' | ' + lab.slice(0, 40).replace(/\\s+/g, ' ') + ' | focus:' + (fv && outl !== 'none' ? 'visible' : 'NONE'); })()`);
      if (d === null) continue;
      if (first === d) break;
      if (!first) first = d;
      seen.push(d);
    }
    rec(`tab-order-${mode}`, seen, `Tab で到達した順（${seen.length}件）`);
    await p.close();
  }

  // ---------- narrow screens ----------
  for (const [w, h] of [[900, 900], [390, 844]]) {
    p = await open(cdp, url, w, h);
    rec(`UI-15-${w}`, await p.ev(`(() => { const t = (s) => Math.round(document.querySelector(s).getBoundingClientRect().top + scrollY); const b = document.querySelector('.subtitle-band').getBoundingClientRect();
      return { order: [t('.region-main'), t('.region-note-top'), t('.region-note-bottom')], stacked: t('.region-main') < t('.region-note-top') && t('.region-note-top') < t('.region-note-bottom'), bandFixed: getComputedStyle(document.querySelector('.subtitle-band')).position, bandBottom: Math.round(b.bottom), innerHeight, scrollWidth: document.documentElement.scrollWidth }; })()`), "縦積みの順・字幕帯の固定・横スクロール");
    await p.ev("window.scrollTo(0, document.documentElement.scrollHeight)"); await sleep(100);
    rec(`UI-15-${w}-end`, await p.ev(`[Math.round(document.querySelector('.subtitle-band').getBoundingClientRect().bottom), innerHeight, document.documentElement.scrollWidth]`), "最下部でも字幕帯は下端");
    await p.close();
  }
  // reduced motion
  p = await open(cdp, url, 1440, 900);
  await p.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  rec("reduced-motion", await p.ev(`getComputedStyle(document.documentElement).scrollBehavior + ' / ' + getComputedStyle(document.querySelector('.download-button')).transitionDuration`), "prefers-reduced-motion: reduce の適用");
  await p.close();
} finally {
  cdp.ws.close(); chrome.kill(); server.close();
}
console.log(JSON.stringify(out, null, 2));
process.exit(0);
