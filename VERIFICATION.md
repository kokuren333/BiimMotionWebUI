# Verification — 2026-10-06

## Compositing-layer separation and render-ghost checks (2026-11-09)

- `npm test`: 25 tests passed (19 existing + 6 new in `tests/ghost.test.ts`). New coverage: tile signatures average each tile region; single-frame detection catches a one-frame appearance and ignores cuts, sustained and held content; double-render comparison flags only the differing frames; the motion-kit text parts (LyricLine / LyricPunch / KineticText), Captions and overlays sit on their own compositing layers by default via `motion-kit/layers.ts`; `validate --final` wires the ghost scan as an advisory (`reports/ghost-check.md`), not a failure.
- New job commands: `npm run ghost-check` scans `output/final.mp4`; `npm run ghost-check -- --double-render` (or `validate -- --final --double-render`) renders a second copy and compares every frame. AGENTS.md documents the symptom, cause, layer-separation fix and the 3-frame minimum for intentional short displays.
- `npm run build -- --base=/BiimMotionWebUI/` passed. End-to-end runs on real production material are left to the user; the checks above cover the detection logic and template wiring, not a full production render.

## Design-first MV principles, diversity and Codex imagegen (2026-11-09)

- `npm test`: 19 tests passed (13 existing + 6 new). New coverage: direction candidates differ on every axis, are deterministic per seed and vary across seeds; lyric stats (lines, section tags, blocks, long lines); MV brief/project carry the differentiation memo, `plan/direction.md`, the quality checklist and `asset_generation` (image generation on, video generation off by default, both switchable); the shipped AGENTS.md contains the design-first principles, 3-direction diversity step, lyric visualisation, character sheet / anti-slop consistency, optional layer approach, video generation off by default, the verification loop and failure checklist; the imagegen wrapper and new motion-kit files are packaged. The motion-kit count assertion moved from 10 to 12.
- `tests/imagegen.test.ts` drives `runtime/scripts/imagegen.mjs` with a fake Codex (`CODEX_BIN`): PNG saved and verified, `-v2` versioning instead of overwrite, reference images passed as `-i`, `plan/style-sheet.md` injected into the prompt, manifest records; missing Codex, non-zero exit and "finished but no file" all return `skipped` without stopping, and unsafe names/paths are rejected.
- Real run: `npm run imagegen -- --name verify-paper --kind texture …` in the extracted MV fixture on Windows invoked `codex exec` (codex-cli 0.160.0), which used the imagegen skill and saved a 640×360-aspect PNG at `assets/generated/verify-paper.png`; the wrapper verified it and recorded `status: ok`. No other job files were modified. `npm run validate` then passed including the generated-asset manifest check.
- Regenerated the `--mv` fixture: runtime validation including TypeScript passed with the new `LyricLine`, `LyricPunch` and `lyric-fit`. Rendered stills of a temporary demo scene (640×360): LyricPunch stacked three timed words inside the left region beside a right-side placeholder; LyricLine shrank a long two-line phrase to fit the frame width. The demo scene was not kept in the template.
- Browser check (built site in headless Chrome, 1440px): MV mode shows the "MVで表現したいこと" label, lyric stats chips with the long-line warning, three direction candidates with "この案を追記" / "別の組み合わせ", axis hints, the differentiation memo, asset-generation toggles, the MV readiness list and the failure-pattern checklist.
- `npm run build -- --base=/BiimMotionWebUI/` and `git diff --check` passed. This checks the harness and helpers, not the artistic quality of a produced MV.

## MV mode (2026-10-06)

- `npm test`: 13 tests passed. New MV coverage checks mode-specific prompt restoration, required/valid completed audio, size limits, exact music bytes, lyric text/newline preservation in project.json and plan/lyrics.txt, forced fullscreen/no Biim, disabled Aivis and extra audio, and exclusion of inactive BGM/GLB assets.
- Browser inspection confirmed that MV input uses sections 01–03 only; character/audio/output/advanced sections and their sidebar links disappear. Song mood, lyrics and completed-audio inputs appear in section 01. A 6.25-second synthetic WAV was read successfully, and UI ZIP generation showed its success message with no browser errors. The in-app browser did not return a download event, so ZIP bytes were inspected through the generator tests instead.
- Switching back to explanation restored the original Biim design, Aivis controls and advanced settings. Switching to MV again restored its edited design, mood, lyrics and selected music duration.
- The generated MV runtime passed validation including TypeScript. A real preview render used the completed 6.25-second WAV instead of the 30-second target or the normal six-second starter duration. FFprobe confirmed 188 video frames at 30fps (6.266667 seconds), H.264 at 320×180 and AAC audio; container duration was 6.272 seconds. Audio was present, with mean volume −22.5dB and peak −19.5dB for the synthetic mono tone rendered to stereo.
- Frames at 3s and 6.1s were visually inspected: the starter scene filled the frame with no Biim border, character or narration caption, including the final portion of the track. The fixture tests the renderer and audio wiring; it is not a finished artistic MV or a lyric alignment evaluation.
- `npm run build -- --base=/BiimMotionWebUI/` and `git diff --check` passed. README files describe the MV workflow, full-track playback, lyric input and plan/music-analysis.md completion record.

## Free character motion in solo and duo modes (2026-10-06)

- Follow-up clarified the default staging policy: captions stay at the layout's fixed position, characters usually stay at their basic positions, and independent movement/scale/rotation beyond the slots is available for specific scene actions. The brief, UI help text and production instructions now agree on this policy; the character motion APIs remain available.
- `npm test`: all 11 tests passed, including generated brief instructions allowing screen-wide, independent character movement in both modes. `npm run build -- --base=/BiimMotionWebUI/` and `git diff --check` passed.
- Generated and extracted solo and duo ZIPs. Both runtime configurations passed validation, including TypeScript and asset/audio manifests.
- Rendered and visually inspected frames 0 and 90 at 640×360 using self-authored animated GLBs and synthetic silent narration. Captures are `.verification/{solo,duo}-motion-{start,moved}.png`.
- In both modes, Character3D canvas translation, enlargement and rotation moved the model beyond its initial slot into the main image. Duo models used different positions, scale factors and rotations. BiimScene characterStyle / secondCharacterStyle also affected their independent motion. The original slot boundary did not clip the transformed canvases.
- Captions style overrides moved the captions with the scene frame; blue/white character-1 and red/white character-2 captions rendered correctly. Captions default to a higher z-index than the characters.
- These checks verify screen-space staging and deterministic frame sampling with simple GLBs. They do not validate production rigs or lip sync. Existing downloaded jobs must be regenerated or updated to receive the new helper APIs and production instructions.

## Character modes and output layouts (2026-10-06)

- `npm test`: all 11 tests passed. New coverage verifies solo/duo settings, separate model bytes, inactive second-model exclusion, names/readings, custom subtitle colors, per-character voice settings, portrait/fullscreen enforcement, character/subtitle bounds, and the generated Biim subtitle-frame SVG for all left/right placements.
- The HTTP-mocked Aivis integration verifies alternating speaker IDs, different Style IDs and speeds, name readings used only for synthesis, explicit spoken_text, unchanged caption spelling, second-model asset synchronization, and rejection of missing/unknown speakers before network requests or manifest replacement. This update did not call a real Aivis engine.
- `npm run build -- --base=/BiimMotionWebUI/`: passed. `git diff --check`: passed.
- Browser inspection confirmed solo/duo controls, character-specific fields, color previews, the vertical Full HD / HD / 4K choices, the automatically enabled/disabled fullscreen switch for portrait output, and the complete updated default design text.
- Generated ZIPs were extracted into the existing smoke workspace. Runtime validation, including TypeScript, passed for Biim duo (640×360), fullscreen duo (640×360), and portrait duo (360×640).
- Rendered and visually inspected frame 135 for all three layouts with two self-authored animated GLB cubes and synthetic caption manifests. Confirmed the blue/white speaker-2 caption, central Biim subtitle frame, separate left/right model positions, larger model framing with slight upward overlap, and frame-free horizontal/vertical canvases. Speaker-1 red/white rendering was also inspected before the final model-fitting adjustment.
- Model fitting accounts for canvas aspect ratio and model depth to avoid the clipping found during the initial enlargement check. Character3D exposes sizeMultiplier (default 1.2) for scene-level adjustments.
- `npm run preview -- --gl=swangle --concurrency=2 --log=error` also produced the portrait smoke MP4. FFprobe confirmed H.264 at 180×320 (half-scale preview of 360×640), 30fps, AAC audio, and a 6.016-second container duration. Caption audio in this fixture is synthetic silence; this check verifies rendering and output orientation rather than voice quality.
- Rendered fixtures are structural/visual smoke checks, not production character rigs or lip-sync validation. Actual scenes may move or resize the models as directed in the brief.

## Previous baseline (2026-10-04)

## WebUI and ZIP

- `npm test`: 7 tests passed. Includes required values and asset limits, safe/unique filenames, exact binary attachments and bundled font bytes, original instructions, empty scenes, runtime/motion-kit packaging, deterministic WAV synthesis, and an HTTP-mocked Aivis integration test.
- Aivis integration checks `project.scenes[].script` splitting, Style ID and speed forwarding, measured WAV durations, scene_id captions, SRT timestamps, disabled synthesis, and overlapping segments. An overlap failure preserves the prior manifest and avoids writing partial replacement WAVs.
- `npm run build -- --base=/BiimMotionWebUI/`: passed. The site uses repository-relative asset URLs, including both font files.
- Browser checks: missing required fields show errors; sample input populates the form; Advanced settings appear in JSON; source file selection updates the attachment list; standard fonts and frame metadata appear in generated JSON; ZIP generation completes. Desktop 1440px and mobile 390px widths were inspected, with no horizontal body overflow.

## Extracted runtime

Generated and extracted `.verification/smoke-motion-job.zip`, installed its npm workspace dependencies, and tested the source runtime rather than the WebUI alone.

- `npm run validate`: passed, including TypeScript and asset manifests.
- Actual local AivisSpeech at `http://127.0.0.1:10101`, Style ID `1069147200`, generated a 2.708-second narration WAV from a scene's script. Subtitle/SRT output and scene linkage were checked. No external voice service was called.
- `npm run sound`: generated BGM, chime, whoosh, and impact WAVs; paths and measured lengths passed validation.
- A self-authored animated GLB cube verified GLB loading, model fitting, and frame-driven animation support. Async model commits now explicitly draw the ThreeCanvas before releasing Remotion's render handle.
- `npm run preview -- --gl=angle --concurrency=2`: produced a 6-second MP4 at half resolution.
- `npm run build -- --gl=angle --concurrency=2 --log=error`: produced final.mp4. FFprobe reported H.264 video at 640×360, 30fps and stereo AAC at 48kHz, container duration 6.016 seconds.
- FFmpeg audio inspection: mean volume −20.8 dB, maximum −3.1 dB for the mixed smoke video.
- `npm run still -- --frame=45 --gl=angle --log=error`: inspected bundled-font rendering, black/gray Biim frame, separate note_top/note_bottom, red/black/white outlined captions, and GLB placement outside the subtitle region.
- `npm run validate -- --final` correctly failed when production script/storyboard/source/QA/delivery records were absent, even though preview and final MP4 existed. A rendered starter scene is not treated as a completed production video.

## Scope and limits

This verifies the MVP job generator and a short runtime smoke video. It does not certify a full 30-second Opus production, actual character rig retargeting, mouth morphs, arbitrary GLB animations, or subjective music quality. Automated validation does not replace watching and listening to the completed video. Fonts are bundled under their OFL licenses and explicitly awaited; consistent layout and fonts depend on using the provided standard components. Node/npm dependencies and the render browser are acquired during runtime setup, not bundled as portable executables.

## 2026-11-13 EX-17 字幕帯域係数（暫定、T4-1）

出典は要件書 EX-17 の試算と T1 契約 §6（現行 Captions の余白・行間）。単一モジュール `job-template/runtime/scripts/caption-capacity.mjs`、規則版 `1` に定義した。片側余白 x=12・y=4、行間=1.2、全画面の文字サイズは横52・縦54、Biim キャラなしの幅比率=0.94、半角幅=0.5・全角幅=1。内寸を文字サイズと行間で除して切り捨て、1行文字数×行数を容量とする。既定容量は Biim 1人左46（23×2）・右48（24×2）・2人38（19×2）・キャラなし54（27×2）、全画面横32（32×1）・縦34（17×2）。読み上げ推定の6.0文字/秒も暫定の目安。

still による実測確定は未了。T11 または G4-α で実測し、係数を変える場合は規則版を上げる。今回の幾何計算テストとビルド確認を、実表示の実測確定として扱わない。

## 2026-11-14 解説モード 第1波の検証結果（T3・T4・T5・T5b、T8a で集約）

作業ID `2026-11-13-explainer-ui-harness`。各タスクの作業ブランチで実装者が実行し、G3 でレビュー者が再実行した結果を、各タスクの記録（`docs/work/2026-11-13-explainer-ui-harness/tasks/<タスク>/REPORT.md` と G3 記録）から集約した。波のブランチへの統合後の再実行（G4-α）の結果ではない。統合後の値は G4-α で記録する。

### テスト件数（各作業ブランチの `npm test`）

| タスク | 件数 | 内訳と再実行 |
| --- | --- | --- |
| T3 制作ハーネス文書 | 36 pass / 0 fail | 既存29＋`tests/harness-docs.test.ts` 7。G3（L2）の再実行も36 |
| T4 QC と様式対応の検証 | 54 pass / 0 fail | T4-1〜T4-4 の最終。`tests/qc.test.ts` を新設。交差レビューの再実行も54 |
| T5 WebUI 解説支援 | 49 pass / 0 fail | T4-1・T3 を取り込んだ上で `tests/explainer.test.ts` を新設。交差レビューの再実行も49 |
| T5b motion-kit 非 Biim 部品 | 72 pass / 0 fail | T4・T3・T5 をすべて取り込んだ上で1件追加。G3（L2）の再実行も72 |

各ブランチで `npm run build -- --base=/BiimMotionWebUI/` も成功した（チャンクサイズの警告のみ）。Git Bash では MSYS のパス変換で base が書き換わるため、`MSYS2_ARG_CONV_EXCL='*'` または `MSYS_NO_PATHCONV=1` を付けて実行した結果を根拠にしている。

### qc の合否事例（T4、生成したフィクスチャで実行）

`node --experimental-strip-types tools/make-fixture.ts --style=<mode> --qc=<case> --out=<一時フォルダ>` で生成し、展開先で `npm install` の後に実行した。T4 の実装者と交差レビュー者の両方が同じ結果を得た。

| フィクスチャ | validate | qc | 結果 |
| --- | --- | --- | --- |
| biim / pass | exit 0 | `--stage=pre` exit 0 | `QC pre: pass` |
| anime / pass | exit 0 | `--stage=pre` exit 0 | `QC pre: pass` |
| motion / pass | exit 0 | `--stage=pre` exit 0 | `QC pre: pass` |
| mixed / pass | exit 0 | `--stage=pre` exit 0 | `QC pre: pass` |
| mixed / fail-evidence | — | `--stage=pre` exit 1 | PRE-3 だけが fail（`Verified claim needs resolvable source_ids: C01`） |
| mixed / fail-caption | — | `--stage=pre` exit 1 | PRE-6 だけが fail（`Split oversized captions: s01-1 (46), s02-1 (32)`。Biim 場面と全画面場面の両方の領域で判定） |
| mixed / fail-review | — | `--stage=pre` exit 1 | PRE-4 だけが fail（`Missing checked review line: PRE-4`） |
| mv | exit 0 | `npm run qc` exit 0 | 「この版に MV の規則は無い。MV は AGENTS.md の MV 制作工程に従う」と表示。`reports/qc-pre.json` は作られない |

validate には生成 runtime 全体の TypeScript 検査が含まれる。T5b では、`motion`・`anime` のフィクスチャのシーンを非 Biim 部品（`FullscreenStage`・`StandardCaption`・`DiagramStage`）だけを使う場面に差し替え（手順は `tasks/T5b/verify-fixtures.mjs`）、Biim 部品の参照0件で `validate` と `qc --stage=pre` が合格した。完成動画のない mixed フィクスチャの `qc --stage=post` は期待どおり exit 1（`QC post: fail`）。完成動画つきの事後ゲート全体の合格経路は未検証で、G4-α または T11 に残す。

### MV 非退行の確認方法と結果

- **既存テストを変えずに通ること**（計画書 §5.0 C-4）：`git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts` が差分なし、`git diff -U0 955fa5c -- tests/job.test.ts | grep '^-[^-]'` が空。T3・T4・T5 で空。T5b では許容される唯一の変更（motion-kit の TSX 数 `12` → `15`）の1行だけ。各ブランチの `npm test` で MV 5件・`tests/ghost.test.ts` 全件・`tests/imagegen.test.ts` 全件が合格した。
- **生成物のバイト一致**（T4）：基準 `955fa5c` の一時 worktree と現行で `--mv` フィクスチャを生成して比較。差分は計画書 §5.3 の許容範囲の6ファイル（`qc` スクリプトの追加、`caption-capacity.mjs`・`.d.mts`・`qc.mjs` の新設、`validate.mjs`）だけで、`brief.md`・`project.json` は `cmp` で一致した。交差レビュー者も同じ比較を再実行して一致を確認した。
- **依頼文と brief のバイト一致**（T5）：テスト内で `955fa5c` の `src/job.ts` を一時フォルダへ取り出して実行し、MV の依頼文と brief（横・縦）がバイト単位で一致、`project.json` は `schema_version` 以外が一致することを確認した。依頼文の SHA-256 は `6a6a84c993999ef0e87502892bb8eec34f3320857eb82deddc0bfa15510c5075`、brief は横 `a2ed8ea9aa26f088c2becef3541dd51f280a693ce7dc9ba3249b2732508d6c13`・縦 `1dd42e013bf14c36276ea3048d3cc187a1da395d107a940cd6b3825ce491bb5f`。交差レビュー者も独自のスクリプトで同じ値を得た。
- **MV の qc**：上表のとおり終了コード0で、合格の JSON を書かない（EX-19）。

### CP-W1（第1波 UI のスクリーンショット）

- 所在（予定）：`docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1/`（S1〜S8。S6 の情報ダイアログで motion-kit 数15を表示する想定）。
- 本節の作成時点で T5-4 は完了しておらず、撮影結果と所在は確認できていない。T5-4 の完了後に、所在・枚数・確認結果を本節へ追記する。

### G3 の結果

| タスク | 判定 | レビュー |
| --- | --- | --- |
| T3 | PASS | L2（別コンテキスト）。記録コミット `759be8d` |
| T4 | PASS | 実働 A の交差レビュー（T4-review、`6b9d34f`） |
| T5 | PASS | 実働 A の交差レビュー（T5-review、`0c78d81`）。CP-W1（T5-4）は範囲外 |
| T5b | PASS | L2（別コンテキスト）。記録コミット `daece82` |

### 持ち越し

- **C-3 の末尾空行**：T5 のブランチで `git diff --check 2a7d209...HEAD` が `tests/qc.test.ts:47: new blank line at EOF.` を出す。T4-1（`15b42a7`）の取り込みに由来し、T4 の最終版では解消している。G4-α の統合時に修正する。
- **EX-17 字幕帯域係数**：暫定値（T4-1 が係数を記録した節を参照）。still による実測確定は T11 または G4-α で行い、係数を変える場合は規則版を上げる。
- **T4-review の m1〜m4**（ゴースト照合行の書き換え方の明記、非 Biim シーンでの validate の確認（T5b で実施済み）、ZIP バイト列の比較手順、POST-1 の結合）と **T5-review の N1〜N3**（縦で mixed を選べない理由の表示、REPORT の記録の誤り、チェックリスト19の扱い）は、どれも下流の作業を妨げない軽微な指摘である。
- **CP-W1**：上記のとおり T5-4 の完了後に追記する。
- この節は文書・テストと生成フィクスチャによる検証であり、完成した解説動画の制作（still・音・事後ゲートの合格）は T11 で行う。

## 2026-11-14 CP-W1 追記（T5-4 の完了後、G4-α で追記）

前節「CP-W1（第1波 UI のスクリーンショット）」の予定に対する結果。撮影は T5-4（記録コミット `5db094d`、G3 PASS `fe7efcb`）が行い、G4-α では撮り直していない。

- 所在：`docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1/`。T0 の刷新前スクリーンショット（`screenshots/before/` の S1〜S8、CP-A0）とは別のフォルダで、刷新前の記録は上書きしていない。
- 枚数：8（S1〜S8）。S1〜S6 は 1440×900、S7・S8 は 390×844（T5-4 の記録による）。
- S6 の確認結果：情報ダイアログに「15個のmotion-kitコンポーネント」が表示されている（T5-4 が画像で確認）。統合後の `job-template/motion-kit/` 直下の `.tsx` の実数も15で、README の記載（15個）と一致する。
- 撮影の手順と各枚の内容は `docs/work/2026-11-13-explainer-ui-harness/tasks/T5-4/REPORT.md` を参照。

## 2026-11-14 EX-17 字幕帯域係数の still 実測（G4-α、一部の配置のみ）

統合後の波ブランチで生成した解説フィクスチャ（`tools/make-fixture.ts --style=<mode> --qc=pass --out=<一時フォルダ>`、640×360）の一時コピーに、検証用の字幕クリップ（無音 WAV と試験文字列）を `runtime/data/narration.json` へ差し込み、`npx remotion still src/index.ts MainVideo <png> --frame=<n> --scale=3`（1920×1080 相当）で still を出して行数と1行の文字数を画像で数えた。字幕は製品の `Captions` がそのまま描画しており、係数・式・規則版（`1`）は変えていない。差し込みは一時フォルダ内だけで、repo のフィクスチャ生成・ランタイムは変更していない。

| 配置 | 規則の計算（`captionBox`） | still の実測 | 一致 |
| --- | --- | --- | --- |
| Biim 枠・キャラ1人（左）、字幕 64px | 23字×2行＝46 | 全角数字60字は23字・23字で2行、3行目は字幕枠の外にはみ出す。`国`×46 は2行に収まり、×47 は47字目が3行目（枠外）へ出る | 一致 |
| 全画面・横、字幕 52px | 32字×1行＝32 | 全角数字60字は1行目32字。`国`×32 は1行に収まり、×33 は33字目が2行目（画面下端）へ出る | 一致 |

- 実測した2配置では、規則の容量が実表示の1行文字数・行数と一致した。係数の変更は不要で、規則版は `1` のまま。
- **未実測の配置**：Biim 枠のキャラ右（48）・2人（38）・キャラなし（54）、全画面・縦（34）。これらは T11 の通し制作で still を確認する持ち越しとする。半角文字の幅比率（0.5）と読み上げ推定（6.0文字/秒）も未実測。
