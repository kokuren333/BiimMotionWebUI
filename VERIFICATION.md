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

## 2026-11-14 第2波 UI 刷新の検証結果（T6・T7、T8b で集約）

作業ID `2026-11-13-explainer-ui-harness`。WebUI をファミリーテーマ「Circuit White / Solder Mask」（Amendment 03）と4領域の骨格に刷新し、表示名を `BiimMotion`（Amendment 02）に統一した。以下は各タスクの記録（`docs/work/2026-11-13-explainer-ui-harness/tasks/T6/`・`tasks/T7/` の REPORT.md・UI-V7-CHECK.md・G3 記録）と画像を読み合わせて集約したもの。T7 の G3 記録は `review/T7-ui-full` ブランチのコミット `1fa4f8d`（`tasks/T7/G3-REVIEW.md`、Codex の交差レビュー、PASS）にある。**UI-V1〜V7 の合否は G4-β で非実装者が判定する**（計画書 §1.1、A11′）。本節は判定ではなく、判定に使う証拠の所在と記録された結果である。デザインの規則の正本は `docs/DESIGN.md`（T8b で確定）。

### テスト件数とビルド

| 時点 | `npm test` | `npm run build -- --base=/BiimMotionWebUI/` |
| --- | --- | --- |
| T6（実装者、G3 で L2 が再実行） | 72 pass / 0 fail（再実行も 72 / 0） | 成功 |
| T7（実装者、G3 で Codex が再実行） | 72 pass / 0 fail（再実行も 72 / 0） | 成功（500kB 超のチャンクの警告のみ、従来から） |
| T8b（`task/T8b-docs`、文書だけの変更） | 72 pass / 0 fail | 成功（同じ警告のみ） |

Git Bash では MSYS のパス変換で base が書き換わるため、ビルドは `MSYS_NO_PATHCONV=1` を付けて実行した。

### UI-C1〜C5（機械基準）

T7 の実装者が `5f46d28` の作業ツリーで DIRECTION の検査コマンドを実行し、T7 の G3（R1）でレビュー者が同じコマンドを再実行した。両者の結果は一致した。

| 基準 | 内容 | 結果 |
| --- | --- | --- |
| UI-C1 | `src/App.tsx`・`index.html` に英語の飾りラベル・キャッチコピー・特定モデル名が無い | grep 2本とも出力なし |
| UI-C2 | 影・グラデーション・ぼかしが無い／角丸が `0` だけ／12px 未満の文字が無い／em・rem の文字サイズが無い／`:root` 以外に色の直値が無い | grep 4本とも出力なし。色は `awk` で `:root` とそれ以外に分けて検索し、本文側の直値は0件（一致はコメントの「White」と `white-space` だけ）。緑系の禁止は D12 由来の旧基準で、Amendment 03 により適用しない |
| UI-C3 | Inter・Georgia が無い／外部ドメインのフォント・スタイルの参照が無い | 出力なし（字幕書体の `@font-face` は同じサイトの `job-assets/fonts/`） |
| UI-C4 | `package.json` の依存が増えていない | `git diff 955fa5c -- package.json` が出力なし |
| UI-C5 | `npm test` とビルドが通る | 上表のとおり |

### UI-V1〜V7 の証拠（G4-β で判定）

| 基準 | 証拠 | 記録された内容 |
| --- | --- | --- |
| UI-V1 4領域・枠線・ZIP 生成ボタン・状態の一文 | CP-A2 の S1〜S6 | S1〜S5 に4領域と字幕帯の生成ボタン・状態の一文が写る。S6 は情報ダイアログが不透明の背景の上に出る条件で、背面の4領域は写らない（T7 G3 の R4） |
| UI-V2 解説 01 の5項目がスクロールなしで写る（UI-12） | S1、UI-V7-CHECK §3 | 1440×900 の初期表示で、制作モード・タイトル・説明目的・対象視聴者・希望尺の下端が字幕帯の上端より上 |
| UI-V3 S1 と S3 で領域の位置と寸法が同じ（UI-14） | S1・S3、UI-V7-CHECK §3 | 解説と MV で、主領域 10,54 幅 1021／右上ノート 1041,54 389×339／右下ノート 1041,403 389×389／字幕帯 10,802 1420×88 が一致 |
| UI-V4 字幕帯が解説は字幕様式、MV は通常書体（UI-04） | S2・S3、UI-V7-CHECK §3 | 解説は `BiimMotion Caption`（同梱の M PLUS Rounded 1c ExtraBold、`font-display: swap`）が `/BiimMotionWebUI/job-assets/fonts/…` から読まれ、`document.fonts.check` が真。MV は通常書体 |
| UI-V5 390px で横スクロールが無く、字幕帯が下端に固定（S7・S8） | S7・S8、UI-V7-CHECK §3 | `scrollWidth` 390、字幕帯は `position: fixed` で下端 844。最下部までスクロールしても下端は同じ。幅 900 でも同様 |
| UI-V6 機能を持たない部品が写っていない | S1〜S8 | 現在値のタグ・runtime のタグ・飾りのアイコンと英語ラベルは T7 で削除（要件書 3.1）。同じ情報はレイアウト図の `aria-label`、右上ノート、情報ダイアログの文で読める |
| UI-V7 UI-11 の機能一覧を1項目ずつ操作した記録 | `tasks/T7/UI-V7-CHECK.md`、操作スクリプト `ui-v7-check.mjs`、生の出力 `ui-v7-result.json`（44項目） | UI-11 の20項目と AM-2 の5（様式モード選択）、UI 監査 §(2) の21項目を、Pages 用ビルドに対してヘッドレス Chrome で実際に操作して記録。UI-16 のコントラスト比の表（本文の配色はすべて 4.5:1 以上）、Tab 順（解説 71 か所・MV 36 か所、フォーカスが見えない到達先0件）、`aria-*`・`role` の数（刷新前 39／10 → T7 後 46／14）、UI-09（`transition`・`animation` なし、computed の時間 100ms 超0件）を含む |

記録の限定（G4-β へ引き継ぐ）：

- **N2（S3 の撮影範囲）**：S3 に写るのは方向性のたたき台3案・右上ノートの準備度（「歌詞 6行」を含む）・音源の尺までで、01 の歌詞欄の下の**詳細な歌詞統計（ブロック数・見出し・最長行の文字数など）は画角の外**である。「S3 で歌詞統計が見える」を、その欄の全統計が写った証拠と読むことはできない。統計の機能自体は UI-V7 の操作記録（`A5-lyrics`：「2行 2ブロック 見出し [Verse] [Chorus] 最長 27文字（20文字超 1行）」）で確認されており、機能の欠落ではない。G4-β で記録の十分性を判断するときは、この限定を前提にすること。T8b は画像を見て画角外であることを確かめた（撮り直しはしていない）。
- **N1（操作スクリプトの再現性）**：`ui-v7-check.mjs` の `A1-toc`・`A1-current` は現在地の判定が確定するのを待たずに読むので、再実行で値が変わることがある。`A9-mv-direction` は先頭の軸だけを比べる。T7 の G3 は目次の6遷移・追加の操作・全候補の比較で機能を確かめた。再実行の結果を提出記録との完全一致で判定しないこと。
- **Q-T7-2（字幕様式の文字のコントラスト）**：既定のキャラ2の字幕色（赤 `#ff0000`）と白ふちの比は 4.00:1 で 4.5:1 に届かない。字幕色は利用者のデータで、UI-04 が出力映像と同じ見え方を求めているため、T7 の G3 は「字幕のプレビューの塗りと白ふちの組に限って UI-16 の本文配色の判定から外してよい」とした（外形の白ふちと黒地は 16.67:1、同じ文は `role="alert"` の DOM テキストとして読み上げられる）。最終的な扱いは L2・G4-β の判断。

### スクリーンショットの所在

すべて `docs/work/2026-11-13-explainer-ui-harness/screenshots/` の下。撮影は `tools/ui-shots.mjs`（ビルドした `dist/` をローカル配信し、ヘッドレス Chrome で撮る）。オーナーの判定は待たない記録点である（Amendment 01 AM-1）。

| 記録点 | フォルダ | 枚数 | 撮ったもの |
| --- | --- | --- | --- |
| CP-A0（刷新前） | `screenshots/before/` | 8（S1〜S8） | T0 が刷新前の UI を撮影。T6・T7 では上書きしていない |
| CP-W1（第1波） | `screenshots/wave1/` | 8（S1〜S8） | T5-4 が撮影（前節の CP-W1 追記を参照） |
| CP-A1（刷新第1段） | `screenshots/cp-a1/` | 2（S1・S3） | T6 が `npm run build -- --base=/BiimMotionWebUI/` の成果物を `/BiimMotionWebUI/` 配下で配信して撮影 |
| CP-A2（刷新後） | `screenshots/after/` | 9（S1〜S8 と S1-scrolled） | T7 が撮影。S1〜S6 と S1-scrolled は 1440×900、S7・S8 は 390×844 |

**CP-A2 は Pages 用ビルドに対して撮った記録である**（Amendment 03 の補足）。T7 は `5f46d28` の作業ツリーで `MSYS_NO_PATHCONV=1 npm run build -- --base=/BiimMotionWebUI/` を実行し、その `dist/` を `tools/ui-shots.mjs` が `/BiimMotionWebUI/` 配下で配信して撮った。スクリプトは `index.html` が `/BiimMotionWebUI/assets/` を読むことを確かめてから撮る。PNG 自体にはビルドの由来を示す情報が無いので、由来は撮影手順の記録（`tasks/T7/REPORT.md` §4）と T7 の G3 によるスクリプトの読解で裏付けている。

CP-A2 の各枚の条件：S1 解説の初期状態、S1-scrolled S1 を最下部までスクロール（UI-13）、S2 解説のサンプル入力後の方向性のたたき台、S3 MV の入力済み、S4 必須未入力で生成したエラー表示、S5 ゴースト検査結果の読み込み、S6 情報ダイアログ、S7 390px の解説、S8 390px の MV。

### MV 非退行

- `git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts` は差分なし。`git diff -U0 955fa5c -- tests/job.test.ts | grep '^-[^-]'` は `-    12,` の1行だけで、これは T5b の motion-kit の数（12 → 15）の既知の変更（G4-α で許容済み）。T6・T7・T8b は `tests/` を変えていない。
- 各時点の `npm test` で MV 5件・`tests/ghost.test.ts` 全件・`tests/imagegen.test.ts` 全件が合格した。
- T6・T7 は `src/job.ts`・`src/mv-assist.ts`・`src/templates.ts`・`job-template/`・`src/biim-standard.json` を変えていない（C-5）。T7 の G3 は `src/App.tsx` の操作属性（イベント・`disabled`・`value` など）130件が刷新前後で完全一致することを TypeScript の構文木で確かめた。出力映像の仕様、MV の制作原則・工程・検証は変わらない。

### 名称の統一（UI-10）

`grep -rn "BiimMaker\|MOTION JOB STUDIO\|IDEAS DESERVE MOTION" index.html src README.md` は T8b の変更後に0件。名称文字列の所在一覧は `docs/DESIGN.md` §4.4。

### 公開後確認①（第1波の公開）：未実施

- 計画書 §6.3 は、公開①（第1波の main を push → PR → Pages デプロイ）の後に、公開 URL で S1・S3・S7 を撮って CP-W1 と比べた結果を本節（第2波の PR）に記録するとしている。
- **公開①は未実施のため、公開後確認①の結果は無い。** 理由は GitHub の認証ブロッカー（オーナー側の作業待ち。`reviews/G4-alpha.md` の申し送り6）。G4-α のマージ（`5e50308`）と記録コミット（`7d5dd59`）はローカルの main にだけあり、2026-11-14 に `git ls-remote origin main` で確かめたリモートの main は `955fa5c` のままだった。
- T8b の記録は公開①を待たない（T8b の DIRECTION の指示）。公開①が実施されたら、CI の状態と公開 URL での S1・S3・S7 の一致を、公開②の記録と同じ締めの PR か、その前の記録コミットで追記する。
