# G3-REVIEW — T8b 文書の同期（第2波）

**判定: PASS。** 2026-11-14 03:5x JST、L2（親）による G3 判定。T8b は交差レビュー対象外のため、L2 が検証コマンドを再実行して判定した。

- 作業ID: `2026-11-13-explainer-ui-harness`／タスク: T8b
- 対象: `fb40029...8d8fded`、ブランチ `task/T8b-docs`。実装者: L3 実働 A（Opus 5.5 medium）。
- 本書は T8b の G3 判定であり、G4-β・公開・作業全体の完了判定ではない。

## L2 再実行結果（T8b worktree、PC 実測）

- `npm test`: **72/72 pass、fail 0**、EXITCODE 0
- Pages 用ビルド `npm run build -- --base=/BiimMotionWebUI/`: 成功、built in 2.71s、EXITCODE 0
- `git diff --check fb40029...HEAD`: 出力なし、EXITCODE 0
- 旧名の不在 grep（`git grep -n -E "BiimMaker|MOTION JOB STUDIO|IDEAS DESERVE MOTION" -- index.html src README.md`）: 一致 0 件（grep 終了コード 1）
- C-4: `tests/ghost.test.ts`・`tests/imagegen.test.ts` は 955fa5c から差分なし。`tests/job.test.ts` の差分は T5b 由来の既知のもの（`- 12,` → `+ 15,` と非 Biim 部品のテスト追加）のみ。T8b 自身は `tests/` を変えていない。
- C-5: 差分は `README.md`・`VERIFICATION.md`・`docs/DESIGN.md`・`tasks/T8b/DIRECTION.md`・`tasks/T8b/REPORT.md` の 5 ファイルのみ。`src/`・`index.html`・`tools/`・`job-template/`・`tests/`・`package.json` は無変更。
- C-6: 実装者の申告どおり 2 本の grep は出力なし（L2 の検証ログ `L2-T8b-verify.log` に記録）。
- スポット確認: `docs/DESIGN.md` に §4.5 favicon（データ URI・4 色パレット・§5 例外）を新設、右上ノート 46% 固定、字幕書体 `@font-face`（`BiimMotion Caption`、太さ 800）＋ `font-display: swap`（`src/style.css:112` と一致）を確認。

## 受け入れ基準の照合

- Q-T7-3 の 7 群すべてが DESIGN.md 確定版に反映されている（§2 アイコン表 10 点、§4.1 46% 固定・650px 以下の例外、§4.2 字幕書体、§4.3 極小文字→図形置換、§4.4 #6 の変更済み、§5 favicon の所在誤りの修正＝§4.5 新設、§7 完了結果への同期）。favicon を §4.5 に置いた判断（§5 は禁止リストのため規則を置かない）を支持する。
- 表示名の統一: 旧文字列の不在 grep 0 件。`src/`・`index.html` に残存はなく、L2 への申告事項なし。README 見出しは `# BiimMotion` に変更済み。
- VERIFICATION.md の第2波の節: テスト・UI-C1〜C5・UI-V1〜V7 の証拠の所在、MV 非退行、名称統一、CP-A2 の所在と Pages 用ビルドに対する撮影の裏付けを記録。UI-V1〜V7 の合否を書かず証拠の所在だけにした判断は計画書 §1.1 に沿い正しい。
- N2 の限定（S3 の歌詞統計は画角外）を VERIFICATION.md に記録済み。**G4-β で記録の十分性を判断する際にこの限定を引き継ぐ。**
- Q-T8b-1（DESIGN §4.4 の行番号は今後ずれる）: 本書では行番号ではなく文字列で照合した。G4-β 以降の対応表でも行番号ではなく文字列で探すこと。

## 軽微な指摘（PASS を妨げない）

- なし。REPORT §7 の判断 1〜5 はいずれも妥当（favicon の §4.5 配置、禁止リストへの実装済み規則の明文化、UI-V1〜V7 の合否を書かない判断、README 冒頭の「Opus 5.5など」の残置、公開①の追記先は L2 判断）。

## 次工程

- T8b は G3 PASS により G4-β（第2波統合）へ進む。
- **T9b の取り込み先の決定（L2）: G4-β に同梱する。** T9b は G3 PASS 済み（`3a7ba5f`、npm test 81/81、`src/` 無変更）で、UI コードに触れない独立した CLI（`tools/generate-job.ts`）のため、G4-β に同梱して第2波を一括で締める。G4-β の検証では T9b 取り込み後のテスト件数 81/81 を期待値とすること。
- G4-β の検証には、計画書 §5.3 の G4-β 列に加えて、Pages 用ビルドの成功と CP-A2 がそのビルドに対して撮られ VERIFICATION.md に記録されていること、および N2 の限定を含める。
