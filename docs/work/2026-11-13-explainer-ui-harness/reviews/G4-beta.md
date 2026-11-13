# G4-REVIEW — G4-β 第2波統合

**判定: PASS。** 2026-11-14 04:2x JST、L2（親）による G4 判定。
統合セッション（Opus 5.5 medium）の REPORT.md を判定根拠として代用せず、下記は L2 の再実行・差分読解・記録確認に基づく。

- 作業ID: `2026-11-13-explainer-ui-harness`／タスク: G4-β
- 対象: 第2波ブランチ `feat/ui-biim-frame` → main へのローカルマージ。統合コミット `9d3bf2e`、記録コミット `245a85c`。
- 本書は G4-β の判定であり、公開・作業全体の完了判定ではない。push・Pages 表示確認は未実施（GitHub 認証ブロッカー）。

## 1. マージの実在性（L2 実測）

- マージコミット `9d3bf2e` の親は `7d5dd59`（main の元先端）と `843ffae`（第2波ブランチ）の 2 つ。`git diff --exit-code 9d3bf2e 843ffae` は空で、ツリーは第2波ブランチと同一。commit-tree 製だが、G4-α の `5e50308` と同じく親 2 つ・ツリーともに正しい実在のマージ。やり直しはしない。巻き戻し手順（`git update-ref refs/heads/main 7d5dd59`）は G4-β REPORT §6 に記録済み。
- 記録コミット `245a85c` の親は `9d3bf2e` で、差分は `tasks/G4-beta/REPORT.md` の §4 追記のみ。main と `feat/ui-biim-frame` はともに `245a85c` を指す。
- 本書のコミット後も main と波ブランチを同じ位置に保つこと（G4-β REPORT §4 の扱いと同じ）。

## 2. L2 再実行結果（main と同一ツリーの checkout、PC 実測）

- `npm test`: **81/81 pass、fail 0**、EXITCODE 0（期待値 81/81、T9b 込み）
- Pages 用ビルド `npm run build -- --base=/BiimMotionWebUI/`: 成功、built in 3.16s、EXITCODE 0
- `git diff --check 7d5dd59...HEAD`: 出力なし、EXITCODE 0
- 旧名の不在 grep（`index.html src README.md` に対する `BiimMaker|MOTION JOB STUDIO|IDEAS DESERVE MOTION`）: 一致 0 件
- C-4: `tests/ghost.test.ts`・`tests/imagegen.test.ts` は 955fa5c から差分なし。`tests/job.test.ts` の差分は T5b 由来の既知のもの（`- 12,` → `+ 15,` と非 Biim 部品のテスト追加）のみ。第2波で 3 ファイルとも無変更（`git diff --stat 5e50308 -- tests/...` は空、統合セッションの申告と一致）。
- MV 生成物の差分は G4-α と同じ 17 ファイル・同じ行数で、許容一覧の外の差分なし（統合セッションの検査を L2 は手順と結果で確認。`brief.md` 完全一致、`project.json` は `schema_version` の 1 行のみ）。
- `job-template/` は G4-α から差分なし。4 様式の validate・QC 再実行を省略した判断は計画書 §5.3 の G4-β 列どおり。

## 3. UI-V1〜V7 の判定：PASS（限定付き）

証拠はすべて main のツリーにあり、T7 提出時から不変であることを L2 が確認した。

- スクリーンショット（正本の所在は `docs/work/2026-11-13-explainer-ui-harness/screenshots/`。repo 直下の `screenshots/` ではない）：CP-A2 `after/` 9 枚、CP-A0 `before/` 8 枚、CP-A1 `cp-a1/` 2 枚、CP-W1 `wave1/` 8 枚。CP-A2 は `git diff --exit-code 8125d05` で T7 提出時から不変。UI-V7-CHECK.md・ui-v7-result.json（44 キー）も T7 提出時から不変。
- UI-V1〜V7 の各基準について、T7 の交差レビュー（Codex）が UI-V7-CHECK の再実行 2 回と 9 枚の目視で確認し、VERIFICATION.md 第2波の節に証拠の所在と記録内容が整理されている。L2 は証拠の所在・不変性・記録の対応を再確認し、判定する。
- **限定（PASS を妨げない）**：N1（`ui-v7-check.mjs` の A1-toc／A1-current は再実行で値が変わることがあり、A9 は先頭の軸だけを比べる。提出記録との完全一致で判定しない）、N2（S3 の歌詞統計は画角外。S3 は全統計が写った証拠とは読めない。統計機能は UI-V7 の `A5-lyrics` で確認済みで機能欠落ではない）。
- A9（刷新前後の対）・A11′（CP-A1・CP-A2 の記録、UI-C1〜C5）・A8・A10・A12 は上記の証拠で満たす。

## 4. Q-T7-1／Q-T7-2／Q-T7-4 の正式な決着（L2 決定の repo 記録）

G4-β REPORT §5 はこれらを「L2 の確認待ち」として持ち越したが、**決着は T7 の G3 における L2 最終判定（2026-11-14 03:27、記録 `L2-G3-DECISION-T7.md`）で既に下している**。本書で repo 上に正式に記録する。

- **Q-T7-1（飾りタグ削除）：妥当。** 要件書 §3.1（「何も操作できないタグ」全除去）が監査の維持リストより上位。操作機能は落ちていない。
- **Q-T7-2（字幕色コントラスト）：字幕プレビューの塗り／白ふちの組に限り UI-16 の通常本文配色の判定から除外してよい。** 赤／白 3.998:1 は 4.5 未達を否定しないが、利用者データ＋出力同一性のため補正しない。通常本文・操作ラベルまで免除ではない。15px を大きな文字として合格させてもいない。
- **Q-T7-4（操作確認スクリプトの置き場所）：`tasks/T7/` に記録として保持。** tools への移設は不要。
- Q-T7-3 は T8b で決着済み（T8b G3 PASS）。QUESTIONS.md への転記は不要（各タスクの DIRECTION・G3 記録・本書に決定が残る）。

## 5. 公開①・公開②の扱いの決定（L2）

- **公開①と公開②は 1 回の push で同時公開することを認める。** 第1波の main マージ（G4-α）後に push が一度も行われず、第2波も同じローカル main に入ったため、公開①（第1波の UI）だけを先に公開することはもはやできない。公開①を別に行うために main を巻き戻すことはしない。
- そのため公開後確認①（CP-W1 との比較）は成り立たない。代わりに公開後確認②で最終 UI を CP-A2 と直接照合する（計画書 §6.3 の手順どおり）。CP-W1（wave1 8 枚）は刷新前の記録として残る。
- T11 の着手条件「公開①の後」は、この同時 push＋Pages 表示確認の後と読み替える。

## 6. T10 への持ち越し（G4-β では対応しない）

- T9a の D1〜D6（CONTRACT と `qc.mjs` の食い違い。T4＝QC の所有者が判断）
- T4-review の m1・m3・m4（m2 は T5b で対応済み）
- T5-review の N1（部分対応：縦のとき「（縦向きでは選べません）」は選択肢のそばに出るが、CONTRACT §4.4 の理由文言「Biim 枠を置けないため」は無い。T10 で文書の注記として扱う。実装の差し戻しではない）、N2（任意の記録訂正）、N3
- CONTRACT §5.5 のソース行参照ずれの修正
- EX-17 係数の残りの実測（T11 へ）
- G2 の P2-1（G2-REVIEW.md への計画書の版識別追記）
- 公開後確認②（push 後）

## 7. 次工程

- 第2波はこれで完了。残りは **公開（push＋Pages 表示確認、オーナーの GitHub 認証待ち）→ T10 締め → T11 通し制作**。
- push の手順：PC の対話ターミナルで一度 `git push -u origin main` を実行して資格情報を保存するか、トークンを用意する。push 後は Pages ワークフローの成功確認と公開後確認②（CP-A2 との照合）を行う。
