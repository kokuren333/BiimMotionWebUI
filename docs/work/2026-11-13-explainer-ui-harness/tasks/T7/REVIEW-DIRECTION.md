# REVIEW-DIRECTION — T7 UI 刷新 第2段の G3 交差レビュー

- 作業ID: `2026-11-13-explainer-ui-harness`／タスク: T7 の G3 交差レビュー
- レビュー者: L3 実働 B（Codex、非対話セッション、モデル `gpt-6.1-sol`、effort high）
- 実装者: L3 実働 A（Claude Code、Opus 5.5 medium）— あなたとは別コンテキストである
- レビュー対象: ブランチ `task/T7-ui-full` のコミット `6ddd7bf..8125d05`（10件。先頭は `8125d05`「Add the T7 report and UI-V7 check record」）
- レビュー用ブランチ: `review/T7-ui-full`（`task/T7-ui-full` から分岐、先端は本書の配置コミットを含む）
- `<BASE>` = `15dbbb4`（第2波ブランチ `feat/ui-biim-frame` の T6 取り込み後の先端。マージコミット `Merge task/T6-ui-base: family theme UI shell and DESIGN draft`）
- 作業場所: この worktree（`BiimMakerWebUI-wt\T7-review`）を repo ルートとして作業する

## あなたの仕事

T7（UI 刷新 第2段・全面適用）の G3 交差レビューを行う。**実装を変更してはならない。** 合否を判定するのはあなたである。
判定は `docs/work/2026-11-13-explainer-ui-harness/tasks/T7/G3-REVIEW.md` に記録し、`review/T7-ui-full` にコミットする。
push はしない（main へは絶対に push しない。レビュー用ブランチも push しない）。

**自己合格禁止**: 実装者の REPORT.md は証拠の提出であり、合否の根拠ではない。すべての判定は、あなた自身が検証コマンドを再実行し、該当箇所を自分の目で読んだ結果に基づくこと。
実装者の主張を鵜呑みにして PASS を出してはならない。逆に、軽微な指摘だけで差し戻すこともしないこと。
判定基準は §5 のとおり。T7 は機能を落とす危険があるため交差レビュー対象になった（計画書 §5.1）。「見た目が良くなったか」の主観は判定しない。判定するのは、UI-01〜17・UI-C1〜C5・UI-V1〜V7 の機械的な条件と、機能が落ちていないことである。

## 1. 起動時チェック（計画書 §8.1）

作業開始時に次を確認し、G3-REVIEW.md の §1 に記録すること。

| 項目 | 確認すること |
| --- | --- |
| 層 | L3 実働 B（本 REVIEW-DIRECTION.md による） |
| エージェント製品／モデル／effort | Codex（非対話）／`gpt-6.1-sol`／high |
| サブエージェント | 起動可能かどうか。本タスクでは使わない見込み（使う場合は記録する） |
| コマンド実行 | 可（`node -v`、`npm -v`、`git`）。worktree に `node_modules/` が無ければ `npm ci` を実行する |
| 対話 | 不可（非対話実行）。質問は発生したら G3-REVIEW.md に書いて既定の判断で進める |
| ネットワーク | `npm ci` の成否で確認する |
| ヘッドレス Chrome | 本タスクでは要る（`ui-v7-check.mjs` の再実行とスクリーンショットの目視確認のため）。`Chrome/157` 相当があることを確認する |

縮退レベルが 0 でない場合（コマンド実行・ネットワーク・ヘッドレス Chrome のいずれかが使えない場合）は、その旨と、どの判定ができなかったかを G3-REVIEW.md に明記し、L2 に判断を委ねること。

## 2. 読むもの（優先順）

1. `docs/requirements/2026-11-13-amendment-01.md`（オーナー決定、最優先。AM-1 目視ゲート廃止、AM-2 様式自由度）と `docs/requirements/2026-11-13-amendment-02.md`（表示名は `BiimMotion` 確定）と `docs/requirements/2026-11-14-amendment-03.md`（ファミリーテーマ統一と Pages 補足。D12 と矛盾する点は Amendment 03 が優先。CP-A2 は Pages 用ビルドに対して撮る）
2. `docs/requirements/2026-11-13-explainer-ui-harness.md`（要件書）。特に §3.1（UI-01〜UI-17 の規則）、§3.3、§3.4（CP-A2 の撮影条件）
3. `docs/work/2026-11-13-explainer-ui-harness/tasks/T7/REPORT.md`（実装者の証拠。§2〜§9 を読む。鵜呑みにしない）と `docs/work/2026-11-13-explainer-ui-harness/tasks/T7/UI-V7-CHECK.md`（操作記録。44項目の生出力は同フォルダの `ui-v7-result.json`、再現手順は `ui-v7-check.mjs` 冒頭のコメント）
4. `docs/DESIGN.md`（T6 の草稿。T7 は対象外で変えていないはず。Q-T7-3 の照合先）
5. `docs/requirements/ORCHESTRATION_PLAN.md` の T7 票（§5.1）と §5.0（共通条件 C-1〜C-8）、§7.2（受け入れ基準 A2・A7・A8・A9・A10・A18）
6. UI 監査の写し `docs/work/2026-11-13-explainer-ui-harness/audits/` の UI 監査（§(2) の機能21項目が UI-V7-CHECK の対象。§(2) の8と17 は Q-T7-1 の照合先）

## 3. レビュー観点（判定項目）

### R1. UI-C1〜C5 の再実行（最重点）

§4 の UI-C1〜C5 の検証コマンドを review worktree で自分で実行し、出力が空（または期待どおり）であることを確認する。UI-C1 の1つ目の grep で一致が出た場合は、表示されない識別子かどうかを自分の目で確認し、表示文字列なら不合格とする。実装者の REPORT.md §3 の表は証拠であり、あなたの再実行が判定の根拠である。

### R2. 色の確認（Amendment 03 の読み替え）

計画書の「`:root` 以外の色の直値と緑系の色」の確認は、ファミリーテーマ採用に伴い「**`:root`（トークンの写しの置き場）以外に色の直値が無く、色がすべて `--cs-*` トークンの写しの範囲内であること**」の確認に読み替える（緑系禁止は D12 前提のため適用しない）。
`src/style.css` を `:root` ブロックとそれ以外に分け、それ以外から `#…`・`rgb(`・`hsl(`・色名・`transparent`・`currentColor` を検索すること（実装者は `awk` で分けて行った。REPORT.md §3 の方法を再現する）。一致があれば1件ずつ読み、色の直値かどうかを判定する。先頭コメントのテーマ名や `white-space` は色ではない。利用者の字幕色（`--caption-color`／`--caption-alert-color`、App.tsx が要素に渡す）は利用者のデータであり、UI の色ではない。
`src/App.tsx` 側の色の直値も確認する。レイアウト図の SVG に残っている直値が無いこと。残っているのは注記の文中の説明文字列（`#1e1e1e`・`#cccccc`）と字幕色の既定値の参照だけのはずである。

### R3. UI-V7-CHECK の検証（UI-11・UI-16・UI-09）

- UI-11 の機能一覧（§1 の20項目＋AM-2-5）と UI 監査 §(2) の21項目（§2）が、1項目ずつ実際に操作した記録になっているかを読む。**`ui-v7-check.mjs` をスクリプト冒頭のコメントの再現手順で再実行し、出力が `ui-v7-result.json`（44項目）と一致するかを照合する**。再実行できない場合は、その旨と照合できなかった項目を G3-REVIEW.md に明記し、L2 に委ねる。
- UI-16（§4〜§6）：使っている文字色と地色の全組のコントラスト比の計算表が妥当か（計算値を1〜2組だけ自分で再計算して照合する）。Tab キーで全操作に到達した順序の記録があるか。`aria-*`・`role` の付与箇所が刷新前と同数以上であることの確認が、数え方を含めて記録されているか。
- UI-09（§7）：`transition`・`animation` の時間がすべて 100ms 以下であることの確認。実装者は「なし」と記録しているので、`src/style.css` に `transition`・`animation` が無いことを自分の grep で確認する。
- Q-T7-2 の字幕色コントラスト（既定のキャラ2の赤と白で 4.00:1）は R9 で扱う。ここでは計算表の数値が正しいかだけを見る。

### R4. CP-A2 スクリーンショットの確認

`screenshots/after/` の9枚（S1〜S8 と `S1-scrolled`）が存在し、0バイトでないことを確認する。実装者は Pages 用ビルド（`MSYS_NO_PATHCONV=1 npm run build -- --base=/BiimMotionWebUI/` の成果物を `/BiimMotionWebUI/` 配下で配信）に対して撮ったと記録している（REPORT.md §4）。**撮り直しはしない**（記録点。目視ゲートは廃止済み）。ただし、ファイル名・枚数・条件（S1-scrolled が S1 の最下部までのスクロールであること）が REPORT.md §4 の表と一致しているかを確認する。スクリーンショットを1枚ずつ目で見て、画面が真っ白・真っ黒・崩壊していないことを確認する（主観の良し悪しは判定しない）。
`VERIFICATION.md` への所在の記録は T8b の範囲であり、本レビューの範囲外とする。

### R5. App.tsx のロジック変更が無いこと

`git diff 15dbbb4...HEAD -- src/App.tsx` を読み、ロジックの変更が無いことを確認する。実装者は差分から `set…`・`use…`・`onClick`・`onChange`・`disabled`・`value=` を含む変更行を抽出して確かめたと記録している（REPORT.md §6）。あなたも同じ抽出を自分で実行し、出てくる変更行が `Icon` の削除、`PixelIcon` の型、様式説明の一覧の `map` だけであることを確認する。状態管理・生成処理・検証の呼び出しに変更があれば差し戻しとする。様式モード選択のロジック（`switchStyleMode` の呼び出し、`disabled` の条件、既定値）が変わっていないことも確認する（R6）。

### R6. 様式モード選択の配置（AM-2 の5、A18）

刷新後の配置で、4様式（Biim 形式／アニメ解説／モーション解説／混在）すべての平易な説明が一覧で表示され、選択中の行に「選択中」、Biim の行に「既定」の印があること。縦向きでは混在の行に「（縦向きでは選べません）」と表示され、選べないこと。選んだ様式が `project.json` の `direction.style_mode` と制作エージェントへの指示に入ることが注記されていること。UI-V7-CHECK §1 の AM-2-5 の記録と、実際の `src/App.tsx` の該当箇所を突き合わせる。選択のロジックは T5 のままであること（R5）。

### R7. favicon

`index.html` の favicon が、Biim 枠のモチーフ（主映像、右上と右下のノート、2行の字幕）をファミリーのピクセルアイコンの様式（16×16、アンチエイリアスなし）で描いたものであること。色がアイコンの11色パレットの範囲内であること。SVG のデータ URI として置かれていること。実装者の REPORT.md §2.4 の記述と実物を突き合わせる。

### R8. UI-10 の名称と触らない範囲

- 情報ダイアログの見出し・本文とアプリバーのボタンが `BiimMotion` になっていること（実装者は DESIGN 草稿 §4.4 では T8b に残していたが、UI-07 の文言書き直しに合わせて同時に直した。REPORT.md §8-3）。
- `README.md` の見出しは触っていないこと（T8b の範囲）。`git diff --stat 15dbbb4...HEAD` に `README.md` が無いことを確認する。
- `docs/DESIGN.md` に変更が無いこと（T7 は対象外。Q-T7-3 の照合先として読むだけ）。
- C-5 の触らない範囲（`src/job.ts`・`src/explainer-assist.ts`・`src/mv-assist.ts`・`src/templates.ts`・`job-template/`・`tests/`・`package.json`・`src/biim-standard.json`）に変更が無いこと（§4 の C-5 でも確認する）。

### R9. Q-T7-1〜Q-T7-4 の検討

REPORT.md §9 の各件について、G3-REVIEW.md に判断を書くこと。**解決はしないこと。** 解決と `QUESTIONS.md` への転記要否の判断は L2 の仕事である。

- **Q-T7-1**（現在値タグ・runtime タグの削除）：実装者は要件書 §3.1 を優先し、UI 監査 §(2) の8と17（「維持すべき機能」）と食い違うと記録している（REPORT.md §8-1）。要件書 §3.1 の該当記述と監査 §(2) の8・17 を実際に読んで突き合わせ、実装者の判断が妥当かを結論づける。同じ情報がレイアウト図の `aria-label`、右上ノート、情報ダイアログの文で読めるという主張も、該当箇所を読んで確かめる。妥当でないと判断した場合は差し戻しとし、正しい解決を提示する。
- **Q-T7-2**（字幕色コントラスト 4.00:1）：字幕色は利用者のデータであり、UI-04 は出力映像と同じ見え方を求めている。同じ文は通常の DOM テキストとして読み上げられる。UI-16 の基準の対象外として扱ってよいかを、UI-V7-CHECK §4 の計算表と要件書の UI-16・UI-04 の記述を読んで検討し、結論を書く。対象外とする場合は、その根拠（利用者のデータであること、出力映像との同一性）を明記する。対象外とできないと判断した場合は、差し戻しか PASS 時の指摘かを判断する。
- **Q-T7-3**（DESIGN.md 草稿のずれ）：実装者が挙げた7箇所（§2 のアイコン表、§4.1 の右上ノートの寸法と 650px 以下の目次、§4.2 の字幕書体、§4.3 のレイアウト図の極小文字、§4.4 の #6、§5 の favicon、§7 の持ち越し）が、T7 後の実態と本当にずれているかを `docs/DESIGN.md` を読んで1件ずつ確かめる。ずれの有無と、T8b への申し送りとして正しいかを G3-REVIEW.md に記録する。DESIGN.md 自体を直してはならない。
- **Q-T7-4**（`ui-v7-check.mjs` の置き場所）：記録として `tasks/T7/` に置いた判断（REPORT.md §8-9）が妥当かを検討する。`tools/` に足すか、記録から外すか、現状のままでよいかを結論づける。現状のままでよい場合は、その根拠（再実行可能性のための記録であること）を書く。

### R10. C-1〜C-8 の再実行

§4 のコマンドを review worktree で再実行し、結果を記録する。C-6 の既知の誤検出（下記）に注意する。

### R11. 要件書・Amendment との矛盾

上記の観点以外で、T7 の差分が要件書・Amendment と矛盾する箇所があれば列挙する。矛盾の重大さに応じて、差し戻しか PASS 時の指摘かを判断する。特に、出力映像の仕様（`src/biim-standard.json` を含む）に変更が無いこと、MV の制作原則・工程・検証の仕様変更が無いこと（N1）、MV に QC 規則を追加していないこと（N10）、ゲートと助言の線引きを変えていないことを確認する。

**範囲外**: T8b の範囲（`docs/DESIGN.md` の確定、`README.md` 見出しの名称、`VERIFICATION.md` への CP-A2 の所在の記録、公開後確認①）は本レビューの範囲外とする。DESIGN.md や README.md にずれがあっても、T7 の欠落として指摘しないこと（Q-T7-3 として記録するだけ）。T11 の EX-17 係数の実測確定、D1〜D6（CONTRACT と `qc.mjs` の食い違い。T4 への持ち越し）も範囲外とする。

## 4. 検証コマンド（review worktree で実行。Git Bash で実行すること）

```sh
npm ci
npm test
MSYS_NO_PATHCONV=1 npm run build -- --base=/BiimMotionWebUI/
git diff --check 15dbbb4...HEAD
git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts
git diff -U0 955fa5c -- tests/job.test.ts | grep '^-[^-]'
git diff --stat 15dbbb4...HEAD
git diff 955fa5c -- package.json
```

- C-1: `npm test` が 72/72 pass であること。
- C-2: `npm run build -- --base=/BiimMotionWebUI/` が成功すること（Git Bash では `MSYS_NO_PATHCONV=1` を付ける。付けないと `--base` が Windows パスに書き換わる）。
- C-3: `git diff --check 15dbbb4...HEAD` の出力が空であること。
- C-4: `tests/ghost.test.ts`・`tests/imagegen.test.ts` が 955fa5c から無変更であり、`tests/job.test.ts` の削除行が `-    12,`（T5b の motion-kit 数）の1行だけであること。T6 の G3 で既存差分として解決済みであり、本タスクは `tests/` を変えていない。
- C-5: `git diff --stat 15dbbb4...HEAD` が次の範囲内であること：`src/style.css`・`src/App.tsx`・`index.html`・`tools/ui-shots.mjs`・`public/icons/` の6点・`screenshots/after/` の9枚・`tasks/T7/` の記録一式（REPORT.md・UI-V7-CHECK.md・`ui-v7-check.mjs`・`ui-v7-result.json`）。`tasks/T7/DIRECTION.md` の差分は L2 の発注コミット `6ddd7bf` によるもので、本タスクの変更ではない。本 REVIEW-DIRECTION.md と G3-REVIEW.md は L2・レビュー者の記録コミットによるもので、実装の変更ではない。
- C-6: 計画書 §5.0 の C-6 の2本の grep を、ステージした差分（`15dbbb4...HEAD`）で実行し、どちらも出力が空であること。ただし既知の誤検出が1件ある：`tasks/T7/DIRECTION.md` の、L2 が `6ddd7bf` で足した注記の行（角丸の検査コマンドの書き換えを説明する行で、正規表現の断片がドライブ文字のパターンに当たる）。**その行だけが一致し、本タスクで追加した行には一致が無いことを確認すること。** 新しい一致があれば、その行がパス・メール・認証情報の値かどうかを1件ずつ読んで判定する。
- C-7: `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の中身をコンテキストに読み込んでいないこと（`npm ci`・`npm test`・`npm run build` の実行で生じた・使われただけであること）。`dist/` はビルドで生成し、撮影と操作確認のスクリプトが配信しただけであること。
- C-8: `cmp docs/work/2026-11-13-explainer-ui-harness/PLAN.md docs/requirements/ORCHESTRATION_PLAN.md` が一致し、両ファイルとも本タスクの差分が無いこと。

UI-C1〜C5（T7 の DIRECTION の検証コマンドをそのまま転記する。Git Bash で実行すること）:

```sh
# UI-C1：要件書 3.1 の英語飾りラベル・コピー・架空の枠組み・飾りの部品・特定モデル名。一致はすべて、表示されない識別子かどうかをレビュー者が目で確認し、表示文字列なら不合格
grep -nE "MOTION JOB STUDIO|WORKSPACE|YOUR BRIEF|FROM IDEA TO MOTION|LOCAL ONLY|JOB OVERVIEW|\bLIVE\b|YOUR NEXT VIDEO|AFTER DOWNLOAD|ABOUT THE STUDIO|IDEAS DESERVE MOTION|\bADVANCED\b|\bCONTEXT\b|GHOST CHECK|\bCONCEPT\b|\bSOURCES\b|\bDIRECTION\b|\bCHARACTER\b|VOICE (&|&amp;) OUTPUT|Workspace|New motion job|Motion graphics|React Three Fiber|Opus" src/App.tsx index.html
grep -nE "伝えたいことを|あとはOpusへ|構成も、演出も|制作のバトン|まだ名前のない|小さな出発点|まずは、動画のゴール|細部を決めすぎず" src/App.tsx index.html   # 空であること
# UI-C2
grep -nE "box-shadow|gradient|blur" src/style.css                                       # フォーカス表示以外が無いこと
grep -noE "border(-[a-z]+)*-radius:[[:space:]]*[^;]+" src/style.css | grep -vE "radius:[[:space:]]*(0|2px|50%)$"   # 空であること
# 注意：`\s` を `[[:space:]]` に書き換えた。`radius:\s` は「s・コロン・バックスラッシュ」の並びを含み、C-6 のドライブ文字パターンに誤検出されるため（T6 の G3 で判明）。意味は同じ。
grep -nE "font(-size)?:[^;]*(^|[^0-9.])([0-9]|1[01])(\.[0-9]+)?px" src/style.css       # 12px 未満が無いこと（13.5px などの小数は一致しない）
grep -nE "font(-size)?:[^;]*[0-9.]+r?em\b" src/style.css                                 # 空であること（文字の大きさは px で書く規則を DESIGN.md に置く）
# UI-C3
grep -nE "Inter|Georgia" src/style.css index.html                                        # 空であること
grep -nE "(href|src)=[\"']https?://|@import|url\([\"']?https?://" src/style.css index.html   # 空であること（SVG の xmlns は対象外）
# UI-C4
git diff 955fa5c -- package.json                                                          # dependencies の差分が無いこと
```

色の確認（R2）の方法：`src/style.css` を `:root` ブロックとそれ以外に分け、それ以外から `#…`・`rgb(`・`hsl(`・色名・`transparent`・`currentColor` を検索する（実装者の REPORT.md §3 の方法を再現する）。一致があれば1件ずつ読んで判定する。

## 5. 判定基準

G3-REVIEW.md の冒頭に結論（**PASS** または **差し戻し**）と理由を明記すること。

- **PASS**: R1〜R11 のすべてに問題が無いか、問題があっても下流タスク（T8b・G4-β）の着手を妨げない軽微な指摘のみである場合。軽微な指摘は G3-REVIEW.md に列挙し、修正は後続タスクまたは L2 の判断に委ねる。PASS の場合も、R9 の Q-T7-1〜Q-T7-4 の判断と、R3 の `ui-v7-check.mjs` の再実行の照合結果は必ず書くこと。
- **差し戻し**: 完了条件（計画書 T7 票）のいずれかが満たされていない、要件書・Amendment との矛盾がある、下流タスクが着手できない不明点がある、UI-11 の機能が落ちている、App.tsx のロジックが変わっている、のいずれかに該当する場合。差し戻しの場合は、具体的な修正箇所（ファイル・節・行）と修正方針を列挙し、F1〜・N1〜 の番号を付けること。**自分で修正してはならない。** 修正は実装者（L3 実働 A）が行い、再レビューを受ける。

## 6. 成果物とコミット

- `docs/work/2026-11-13-explainer-ui-harness/tasks/T7/G3-REVIEW.md` を新設する。内容は、§1 の起動時チェック、R1〜R11 の判定結果（R9 は Q-T7-1〜Q-T7-4 ごとの判断、R3 は `ui-v7-check.mjs` の再実行の照合結果）、§4 の検証コマンドの出力、結論（PASS／差し戻し）と理由を含むこと。
- `review/T7-ui-full` にコミットする。件名は `Add G3 cross-review for T7 (PASS)` または `Add G3 cross-review for T7 (return)`。コミットメッセージの末尾には、過去の Codex のコミットが付けたものと同じ形式の帰属行を付けること（`git log --format=%B -1 3a7ba5f` で確認して同じ形式を使う）。
- **触ってよいのは G3-REVIEW.md のみ。** REPORT.md・UI-V7-CHECK.md・その他を変更しないこと。G3-REVIEW.md 以外に差分が出た場合は、その差分を破棄してからコミットすること。
- `ENVIRONMENT.md` は触らないこと（起動時チェックの行は G3-REVIEW.md に記録し、L2 が G4-β の統合時に集約する）。

## 7. 禁止事項

- push しない（main へは絶対に push しない。レビュー用ブランチも push しない）。
- 実装を変更しない（差し戻しの場合は修正箇所を列挙するだけ）。
- 承認カードが出たら作業を止め、状況を G3-REVIEW.md またはログに記録して終了する。承認待ちで止まらない構成のため原則出ないはずだが、出たら止めること。
- 監査の原本（`../../BiimMakerWebUI/.agent-work/audit-*.md`）を変更しないこと。
- `QUESTIONS.md` を変更しないこと（Q-T7-1〜Q-T7-4 の転記要否の判断は L2 の仕事である）。
