# DIRECTION — T7 UI 刷新 第2段（全面適用）

- 作業ID: `2026-11-13-explainer-ui-harness`
- あなたは **L3 実働 A（Opus 5.5、effort medium、非対話セッション）**です。実装するのが仕事です。T7 は**交差レビュー対象**です（下記）。**自分で自分の成果物を合格と判定してはいけません**。
- サブエージェントの使用は可（L4 下請け。文言の機械置換・撮影など）。使う場合は REPORT.md に記録すること。
- 表示名は **`BiimMotion` 確定**です（Amendment 02、オーナー決定 2026-11-13 20:36）。暫定扱いにしないこと。repo 名・Pages URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物で変えません。

## 前提（着手条件）

- **T6 の G3 合格が前提**です。T6 が合格していない状態で本書を渡された場合は、作業を始めず REPORT.md にその旨を書いて止まること。
- 本書は T6 の発注と同時に下書きとして作られたものです。**作業ブランチ `task/T7-ui-full` と worktree は発注時に L2 が作ります**。渡された時点で自分の worktree とブランチを確認し、合っていなければ止めて報告すること。

## 最初に読むもの（この順で）

1. `docs/requirements/2026-11-13-amendment-01.md`（最優先。AM-1 目視ゲート廃止、AM-2 様式自由度。AM-2 の5＝様式モード選択の刷新後配置を含む）
2. `docs/requirements/2026-11-13-amendment-02.md`（表示名 `BiimMotion` 確定）
3. **`docs/requirements/2026-11-14-amendment-03.md`（ファミリーテーマ統一と Pages 補足。D12 と矛盾する点は本書が優先。CP-A2 は Pages 用ビルドに対して撮る）**
4. `docs/requirements/2026-11-13-explainer-ui-harness.md`（要件書。§3.2 の UI-01〜UI-17 と §3.3。UI-03・UI-05・UI-08 の読み替えは T6 の DIRECTION と同じ表に従う）
5. `docs/requirements/ORCHESTRATION_PLAN.md`（計画書。§5.1 T7 がこのタスク票の正本。§5.0 共通条件、§5.4 コミットの切り方も読むこと）
6. **`docs/DESIGN.md`（T6 の草稿）**と T6 の REPORT.md（`docs/work/2026-11-13-explainer-ui-harness/tasks/T6/REPORT.md`）。トークンの取り込み先・写したアイコンの一覧・Biim 枠モチーフの適用範囲はここで確定した形を引き継ぐこと
7. UI 監査の写し `docs/work/2026-11-13-explainer-ui-harness/audits/` の UI 監査（§(2) の機能21項目が UI-V7-CHECK の対象）
8. 現行の `src/style.css`・`src/App.tsx`・`index.html`・`tools/ui-shots.mjs`（自分の worktree 内。T6 取り込み後の状態が原本）

## 作業ブランチと基準コミット

- あなたの repo ルートは、この DIRECTION.md がある worktree です。ブランチは `task/T7-ui-full` で、第2波ブランチ `feat/ui-biim-frame`（T6 取り込み後）から分岐済みのはずです。**ブランチを切り替えないこと**。
- `<BASE>` は発注時に L2 が確定します（T6 取り込み後の第2波ブランチの先端）。**本書に実ハッシュの追記が無い場合は、作業を始めず REPORT.md に書いて止まること**。検証コマンドの `git diff <BASE>...HEAD` にはその値を使うこと。
- コミットは計画書 §5.4 の流儀（英語・命令形の件名、1コミット＝1つの論理的変更、**UI の見た目の変更とロジックの変更を混ぜない**、各コミットで C-1・C-2 が通ること）。件名の例（§5.4 #20〜。favicon の件名は Amendment 03 の様式に合わせてよい）：`Rewrite styles to the design rules`／`Replace decorative labels and copy with factual text`／`Draw the favicon as a pixel icon of the Biim frame motif`／`Record post-redesign screenshots`。コミットメッセージの末尾に規定の帰属行を付けること（書式は過去のコミットの末尾を参照。ファイルには書かない）。
- **push はしないこと**。main へのマージ・直接 push・強制 push は禁止。スペース版（S0〜S5）には触れないこと。

## 起動時チェック（計画書 §8.1）

最初に §8.1 の起動時チェックを行い、結果を自分の REPORT.md（後述）に記録すること（層、エージェント製品・モデル・effort、サブエージェントの可否、コマンド実行、対話、ネットワーク、ヘッドレス Chrome）。縮退レベルを決め、理由と自己判定になるゲート（なしのはず）を REPORT.md に書いてから作業に入ること。**共有の `ENVIRONMENT.md` は同時編集しない**（起動時チェック行は L2 が統合時に集約する）。

## 対象

- `src/style.css`（全面書き換え）
- `src/App.tsx`（**見た目と文言のみ。ロジック変更は禁止**）
- `index.html`（favicon）
- `tools/ui-shots.mjs`（刷新後の DOM に合わせたセレクタ更新）
- `docs/work/2026-11-13-explainer-ui-harness/screenshots/after/`（S1〜S8 と `S1-scrolled`）
- `docs/work/2026-11-13-explainer-ui-harness/tasks/T7/UI-V7-CHECK.md`（操作記録。計画書 §5.1 T7 の表記は `tasks/T7-ui-full/` だが、本作業の記録フォルダは `tasks/T7/` に統一する）

### 触らない範囲

- `src/job.ts`、`src/explainer-assist.ts`、`src/mv-assist.ts`、`src/templates.ts`
- `job-template/`、`tests/`、`package.json`
- 出力映像の仕様に関わるもの（`src/biim-standard.json` を含む）
- `src/App.tsx` のロジック（状態管理・生成処理・検証の呼び出し）。**ロジック変更が必要と分かった場合は、変更せずに止めて REPORT.md に記録し、L2 の判断を待つこと**（計画書 §5.2：ロジックだけの小タスクを挟む）

## 内容

1. **UI-01〜UI-17 の全面適用**：T6 の骨格（4領域）とファミリートークンの配色の上に、間隔・文字・状態表示・狭幅（UI-15：920px 以下は主領域→右上→右下の縦積み、字幕帯は下に固定、390px で横スクロールなし）・主操作の常時表示（UI-13）・冒頭の構成（UI-12）などを完成させる。色は T6 で取り込んだ `--cs-*` トークンの写しの範囲内だけを使う（トークン以外の色を新しく作らない）。
2. **文言の総入れ替え（UI-07）**：英語の飾りラベルとキャッチコピーを全廃する（UI-C1 の検証 grep が合格条件）。各欄の説明は「何が・どこに保存され・制作で何に使われるか」の事実で書く。制作者の呼称は「制作エージェント」とし、特定モデル名を固定で書かない。存在しない機能を示す表示を置かない。
3. **様式モード選択の配置（AM-2 の5）**：T5 で配線済みの様式モード選択（biim／anime／motion／mixed、平易な説明つき、既定 biim、固定しない）を、刷新後の配置と見た目で正しく使えるようにする。**選択のロジックは変えない**（見た目と配置だけ）。
4. **favicon**：Biim 枠のモチーフを、ファミリーのピクセルアイコンの様式（16×16・11色パレット）で描いて `index.html` に設定する（計画書の「枠の図案」を Amendment 03 の様式で実現する）。
5. **アイコン**：ファミリーアイコン（CyberSprite `gui/public/icons/`）の再利用範囲を全面適用に広げる。操作には文字ラベルを併記する。新規に描く場合は同じ様式で。写したアイコンの一覧は REPORT.md に書く（T6 の一覧への追加分が分かる形で）。
6. **CP-A2（刷新後記録）**：S1〜S8 と、S1 を下までスクロールした状態 `S1-scrolled`（UI-13 の証拠）を撮る。**必ず Pages 用ビルド（`npm run build -- --base=/BiimMotionWebUI/` の成果物）をローカルで配信して撮ること**（Amendment 03 補足。公開②の成果物は Pages 用ビルドそのものであり、CP-A2 はその記録である）。保存先は `screenshots/after/`。**オーナーの判定は待たない**（記録点）。`VERIFICATION.md` への所在の記録は T8b の範囲なので、本タスクでは REPORT.md に所在を書く。
7. **UI-V7-CHECK.md**：UI-11 の機能一覧と UI 監査 §(2) の21項目を**1項目ずつ実際に操作した記録**を書く。加えて **UI-16**：使っている文字色と地色の全組のコントラスト比の計算表、Tab キーで全操作に到達した順序の記録、`aria-*`・`role` の付与箇所が刷新前と同数以上であることの確認。**UI-09**：`transition`・`animation` の時間がすべて100ms 以下であることの確認。

## 完了条件

- UI-C1〜C5 が機械的に合格する（下の検証コマンド）
- S1〜S8 と `S1-scrolled` を、Pages 用ビルドに対して `screenshots/after/` に記録した
- `UI-V7-CHECK.md` がある（UI-11 と監査21項目の操作記録、UI-16 の計算表と Tab 順序、aria 同数以上の確認、UI-09 の確認）
- `src/App.tsx` のロジック変更が無い
- 依存の追加なし
- C-1〜C-8（下記）

## 検証

計画書 §5.1 T7 の検証コマンドをそのまま転記する（Git Bash で実行すること）。

```sh
# UI-C1：要件書 3.1 の英語飾りラベル・コピー・架空の枠組み・飾りの部品・特定モデル名。一致はすべて、表示されない識別子かどうかをレビュー者が目で確認し、表示文字列なら不合格
grep -nE "MOTION JOB STUDIO|WORKSPACE|YOUR BRIEF|FROM IDEA TO MOTION|LOCAL ONLY|JOB OVERVIEW|\bLIVE\b|YOUR NEXT VIDEO|AFTER DOWNLOAD|ABOUT THE STUDIO|IDEAS DESERVE MOTION|\bADVANCED\b|\bCONTEXT\b|GHOST CHECK|\bCONCEPT\b|\bSOURCES\b|\bDIRECTION\b|\bCHARACTER\b|VOICE (&|&amp;) OUTPUT|Workspace|New motion job|Motion graphics|React Three Fiber|Opus" src/App.tsx index.html
grep -nE "伝えたいことを|あとはOpusへ|構成も、演出も|制作のバトン|まだ名前のない|小さな出発点|まずは、動画のゴール|細部を決めすぎず" src/App.tsx index.html   # 空であること
# UI-C2
grep -nE "box-shadow|gradient|blur" src/style.css                                       # フォーカス表示以外が無いこと
grep -noE "border(-[a-z]+)*-radius:\s*[^;]+" src/style.css | grep -vE "radius:\s*(0|2px|50%)$"   # 空であること
grep -nE "font(-size)?:[^;]*(^|[^0-9.])([0-9]|1[01])(\.[0-9]+)?px" src/style.css       # 12px 未満が無いこと（13.5px などの小数は一致しない）
grep -nE "font(-size)?:[^;]*[0-9.]+r?em\b" src/style.css                                 # 空であること（文字の大きさは px で書く規則を DESIGN.md に置く）
# UI-C3
grep -nE "Inter|Georgia" src/style.css index.html                                        # 空であること
grep -nE "(href|src)=[\"']https?://|@import|url\([\"']?https?://" src/style.css index.html   # 空であること（SVG の xmlns は対象外）
# UI-C4
git diff 955fa5c -- package.json                                                          # dependencies の差分が無いこと
```

- 色の確認（Amendment 03 での読み替え）：計画書の「`:root` 以外の色の直値と緑系の色」の確認は、ファミリーテーマ採用に伴い「**`:root`（トークンの写しの置き場）以外に色の直値が無く、色がすべて `--cs-*` トークンの写しの範囲内であること**」の確認に読み替える（緑系禁止は D12 前提のため適用しない）。この確認は L2 が G3・G4-β で行う。本セッションでも自分の変更について同じ観点で点検し、結果を REPORT.md に書くこと。
- C-1〜C-8（下記）。

## 交差レビューについて

- T7 は交差レビュー対象です。G3 では L2 の判定に加えて、実働 B（Codex の別セッション）が差分を読みます。レビューセッションの発注は L2 が行います。
- 提出の形：REPORT.md に変更ファイルの一覧、UI-C1〜C5 の自己実行結果（コマンドと出力の要約）、UI-V7-CHECK.md の所在、CP-A2 の所在を明記すること。自己実行は証拠の提示であり、合格の判定ではありません。

## 全タスク共通の完了条件（計画書 §5.0）

- **C-1** `npm test` が合格。
- **C-2** `npm run build -- --base=/BiimMotionWebUI/` が合格。
- **C-3** `git diff --check <BASE>...HEAD` が空。
- **C-4 MV 非退行**：既存の MV 関連テスト（`tests/job.test.ts` の MV 5件、`tests/ghost.test.ts` 全件、`tests/imagegen.test.ts` 全件）がテスト側の変更なしで通る。確認コマンドは計画書 §5.0 の2つ。
- **C-5** 上の「触らない範囲」に変更が無い（`git diff --stat <BASE>...HEAD` のファイル一覧で確認）。
- **C-6** 追加した行にローカル絶対パス・メールアドレス・認証情報が無い。検査コマンドは計画書 §5.0 の2つの grep（本書には転記しない）。帰属行はコミットメッセージにだけ書き、ファイルには書かない。
- **C-7** `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の中身を読まない（例外：検証のために自分で生成したフィクスチャに対して `validate`・`qc`・`diff`・`cmp` を実行し、その出力を見るのは可）。
- **C-8** 本タスクは計画書を変えないので、`docs/work/2026-11-13-explainer-ui-harness/PLAN.md` と `docs/requirements/ORCHESTRATION_PLAN.md` の写しに変更が無いことだけ確認する。

## REPORT.md

`docs/work/2026-11-13-explainer-ui-harness/tasks/T7/REPORT.md` に次を書く。**合否判定はしない**。

- 起動時チェックと縮退レベル
- 全面適用の概要（UI-01〜17 のうち本タスクで完成させた項目、文言の入れ替えの範囲、様式モード選択の配置）
- UI-C1〜C5 の自己実行結果（コマンドと出力の要約）
- CP-A2 の所在（S1〜S8 と `S1-scrolled`）と、Pages 用ビルドに対して撮ったこと
- UI-V7-CHECK.md の所在
- 写したアイコンの一覧（T6 からの追加分）
- C-1〜C-8 の結果、変更ファイルの一覧
- 判断したこと・質問（非ブロッキング。既定の判断で進めたもの）

## 禁止事項

- push しない。自己合格禁止。承認カードが出たら止めて報告する。
- **ロジックを変更しない**（上記）。MV の制作原則・工程・検証の仕様変更はしない（N1）。MV に QC 規則を追加しない（N10）。ゲートと助言の線引きを変えない。出力映像の仕様は変更しない。
- 計画書・要件書・Amendment を変えない。共有の `ENVIRONMENT.md` を編集しない。
- 依存を追加しない。
