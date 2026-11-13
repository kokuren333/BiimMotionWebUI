# DIRECTION — T6 UI 刷新 第1段（骨格と配色、ファミリーテーマ適用）

- 作業ID: `2026-11-13-explainer-ui-harness`
- あなたは **L3 実働 A（Opus 5.5、effort medium、非対話セッション）**です。実装するのが仕事です。レビュー（G3）は L2 が検証コマンドを再実行して行うため、**自分で自分の成果物を合格と判定してはいけません**。
- サブエージェントの使用は可（L4 下請け。文言の機械置換・撮影など）。使う場合は REPORT.md に記録すること。
- 表示名は **`BiimMotion` 確定**です（Amendment 02、オーナー決定 2026-11-13 20:36）。暫定扱いにしないこと。repo 名・Pages URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物で変えません。

## 最初に読むもの（この順で）

1. `docs/requirements/2026-11-13-amendment-01.md`（最優先。AM-1 目視ゲート廃止、AM-2 様式自由度）
2. `docs/requirements/2026-11-13-amendment-02.md`（表示名 `BiimMotion` 確定）
3. **`docs/requirements/2026-11-14-amendment-03.md`（本タスクの設計変更の正本。ファミリーテーマ統一と Pages 補足。D12 と矛盾する点は本書が優先）**
4. `docs/requirements/2026-11-13-explainer-ui-harness.md`（要件書。特に §3.2 の UI-01・UI-02・UI-04・UI-06・UI-10 と、§3.3 の UI-11〜UI-17。UI-03・UI-05 は Amendment 03 で読み替える。下記「Amendment 03 の読み替え」参照）
5. `docs/requirements/ORCHESTRATION_PLAN.md`（計画書。§5.1 T6 がこのタスク票の正本。§5.0 共通条件、§5.4 コミットの切り方、§6.1 ブランチも読むこと）
6. UI 監査の写し `docs/work/2026-11-13-explainer-ui-harness/audits/` の UI 監査（特に §(2) の機能21項目と §(3) の保持項目4〜7）
7. 現行の `src/style.css`・`src/App.tsx`・`index.html`（自分の worktree 内。変更対象の原本）と、T0 の刷新前スクリーンショット（`docs/work/2026-11-13-explainer-ui-harness/screenshots/before/`、CP-A0）
8. ファミリーテーマの正本（**PC ローカルに実在する。読むだけ**）：CyberSprite repo の `gui/src/theme/tokens.css`（絶対パスはコミットするファイルに書かないこと、C-6。所在は本書の「ファミリーテーマの取り込み」に書いた相対情報と、PC 上の `Desktop\kokuren_future\CyberSprite` フォルダから辿ること）と、アイコンの置き場 `gui/public/icons/`（42ファイル。PNG 16×16 と `manifest.json`）

## 作業ブランチと基準コミット

- あなたの repo ルートは、この DIRECTION.md がある worktree です。ブランチは `task/T6-ui-base` で、第2波ブランチ `feat/ui-biim-frame` から分岐済みです。**ブランチを切り替えないこと**。
- `<BASE>` = `e40adbe`（第2波ブランチの最初のコミット。Amendment 03 の配置）。検証コマンドの `git diff <BASE>...HEAD` にはこの値を使うこと。差分には L2 による発注記録（本 DIRECTION.md 等のコミット）も含まれるが、完了条件の判定には影響しない。
- コミットは計画書 §5.4 #18・#19 の2件を基本とする（内容は Amendment 03 の実態に合わせてよい。流儀は英語・命令形の件名、1コミット＝1つの論理的変更、**UI の見た目の変更とロジックの変更を混ぜない**、各コミットで C-1・C-2 が通ること）：
  1. `Restructure the UI shell on the family theme with the four-region layout`（骨格と配色）
  2. `Draft docs/DESIGN.md and record CP-A1 screenshots`（文書と記録）
  コミットメッセージの末尾に規定の帰属行を付けること（書式は過去のコミットの末尾を参照。ファイルには書かない）。
- **push はしないこと**。main へのマージ・直接 push・強制 push は禁止。スペース版（S0〜S5）には触れないこと。

## 起動時チェック（計画書 §8.1）

最初に §8.1 の起動時チェックを行い、結果を自分の REPORT.md（後述）に記録すること（層、エージェント製品・モデル・effort、サブエージェントの可否、コマンド実行、対話、ネットワーク、ヘッドレス Chrome）。縮退レベルを決め、理由と自己判定になるゲート（なしのはず）を REPORT.md に書いてから作業に入ること。**共有の `ENVIRONMENT.md` は同時編集しない**（起動時チェック行は L2 が統合時に集約する）。

## Amendment 03 の読み替え（D12 との関係）

要件書 D12・§3.2 のデザイン規則のうち、次を Amendment 03 で読み替える。読み替えない規則（4領域の骨格 UI-01、目次 UI-02、字幕帯の様式 UI-04、機能 UI-11〜UI-17）はそのまま守ること。

| 要件書の規則 | Amendment 03 での扱い |
| --- | --- |
| UI-03 色（枠3色＋字幕2色＋無彩色5段、緑系禁止） | **置換**。シェルの色はファミリーテーマ「Circuit White / Solder Mask」のトークン（`--cs-*`）だけを使う。「緑系禁止」はファミリーテーマの色相と矛盾するため適用しない。色の直値は `:root`（トークンの写しの置き場）以外に書かない |
| UI-05 形（角丸0、黒地・灰枠の見た目） | **読み替え**。形の様式はファミリーテーマに従う（2px の枠線、切り欠きのある角、影・グラデーション・ぼかしは使わない）。黒地・灰色の枠線はシェルには使わず、ステージ／プレビュー領域のモチーフとしてだけ残す |
| UI-08 アイコン（装飾アイコンを廃止） | **一部置換**。ファミリーの 16×16 ピクセルアイコン（CyberSprite `gui/public/icons/`）のうち意味が合うものは再利用してよい。ただし操作には文字ラベルを併記し、意味を持たない装飾だけのアイコンは置かない（UI-08 の趣旨は維持） |
| UI-10 の favicon（枠の構成を図案に） | T7 の範囲。ただし図案はファミリーのピクセル様式で描く（T7 の DIRECTION に明記済み） |
| `docs/DESIGN.md` は §3.2 の規則を移して正本にする | **読み替え**。DESIGN.md は独自パレットを定義しない。ファミリートークンの正本参照＋取り込んだトークンの一覧＋BiimMotion 固有の差分だけを規定する |

出力映像の仕様（biim-standard-v1、字幕帯域、QC 規則）は Amendment 03 の対象外で、**変更しない**。

## ファミリーテーマの取り込み

- 正本：CyberSprite repo（PC 上の `Desktop\kokuren_future\CyberSprite`）の `gui/src/theme/tokens.css`。基礎トークン `--cs-*` は次の値（2026-11-14 に L2 が実物で確認）：board `#EEF6F8`、panel `#FFFFFF`、pad `#EAF6F9`、pad-shade `#B9DDE6`、trace `#19C3E6`、trace-soft `#BFEFF9`、trace-deep `#0A86A8`、ink `#0B2A3A`、ink-soft `#43606E`、warn `#E8A317`、error `#E5484D`、agent `#7C5CFF`、canvas-surround `#D5DEE2`、checker-a `#FFFFFF`、checker-b `#E1E7EA`。役割トークン `--ui-*` と寸法（`--font-ui`、`--fs`、`--bw` 等）も同ファイルにある。**実物を読んでから取り込むこと**（上の値は補助）。
- 取り込み方法：使うトークンの**写し**を BiimMotion 側に置く（値の正本は CyberSprite のまま。同期は手作業でよい。自動同期の仕組みは作らない）。取り込み先は実働が決める（例：`src/style.css` 冒頭の `:root` ブロック、または専用ファイル）。写しの先頭に、正本の所在（repo 相対：CyberSprite の `gui/src/theme/tokens.css`）と「手作業で同期する写し」である旨をコメントで書くこと。**ローカル絶対パスは書かない**（C-6）。
- アイコン：`gui/public/icons/` の42ファイルのうち、意味が合うものを BiimMotion 側（`public/icons/` 等）へ写して使ってよい。本タスクでは骨格に必要な範囲に留める（全面適用は T7）。写したアイコンの一覧を REPORT.md に書くこと。BiimMotion 固有のアイコンを新規に描く場合は、同じ 16×16・同じ11色パレットの様式で描く。

## 対象

- `src/style.css`
- `src/App.tsx`（**構造とクラスのみ。ロジックは変えない**）
- `index.html`
- `docs/DESIGN.md`（草稿として新設）
- トークンの写しの置き場（上記。`src/style.css` 内または新規の CSS ファイル）
- `public/icons/` 等へのアイコンの写し（必要な範囲）
- `docs/work/2026-11-13-explainer-ui-harness/screenshots/cp-a1/`（S1・S3）
- `tools/ui-shots.mjs`（撮影に必要な最小限のセレクタ追随だけ許可する。変更した場合は REPORT.md に記録すること。全面のセレクタ更新は T7 の範囲）

### 触らない範囲

- `src/job.ts`、`src/explainer-assist.ts`、`src/mv-assist.ts`、`src/templates.ts`
- `job-template/`、`tests/`、`package.json`
- 出力映像の仕様に関わるもの（`src/biim-standard.json` を含む）

## 内容（第1段の範囲）

1. **骨格（UI-01）**：幅1250px 以上で4領域（**主領域**＝入力フォーム、**右上ノート**＝ジョブの要点と準備度一覧、**右下ノート**＝切り替え式の補足、**字幕帯**＝画面下に固定：状態の一文、エラーの要約、ZIP 生成ボタン、指示のコピー）。領域の境界は枠線で示す。寸法は要件どおり（右カラム320〜420px、字幕帯64〜96px）。幅920px 以下で主領域→右上→右下の縦積みになる骨格も入れる（UI-15 の骨格部分。細部の仕上げは T7）。
2. **配色**：シェル全体をファミリーテーマにする（地色は board、パネルは panel、文字は ink、線は trace 系）。シェルの色はトークン変数経由のみ。
3. **Biim 枠モチーフ**：ステージ／プレビュー領域（レイアウト図など、映像の見え方を示す領域）に Biim 枠の見た目（黒地 `#1e1e1e`、枠線 `#cccccc`、青・赤の白ふち字幕の様式）を残す。字幕帯の字幕様式表示（UI-04：解説モードでは状態の一文を実際の字幕と同じ様式で表示し、字幕色の変更が即時反映される実物プレビューを兼ねる。MV モードは白の通常書体）は出力プレビューとして維持する。**シェルの地色・枠線には Biim 枠の色を使わない**。
4. **目次（UI-02）**：現行の左サイドバーを廃止し、主領域の上端にセクション番号と日本語名の目次（完了の印つき）を置く。MV では 01〜03 だけを出す現行の挙動を保つ。
5. **書体（UI-06）**：ファミリートークンの `--font-ui`・`--font-mono` を土台にし、日本語ゴシック系統であることを DESIGN.md 草稿に明記する。字幕書体は字幕帯・プレビュー用に維持する。外部 CDN からのフォント取得は禁止（UI-C3 は T7 の判定だが、本タスクでも増やさない）。
6. **保持事項**：セクション `id`・`aria-*`・file input の覆い構造・`isMV` 分岐を保持する（UI 監査 §(3) の4〜7）。機能は落とさない（UI-11 の全項目確認は T7 だが、本タスクでも機能の削除はしない）。
7. **表示名の下地（UI-10）**：ブランド表示・`index.html` の title は本タスクで触る範囲では `BiimMotion` にする。名称文字列の所在一覧（計画書 §1.3 の8箇所）を DESIGN.md 草稿に載せる：`index.html:11` の title、`src/App.tsx:526` の aria-label、`src/App.tsx:531` のブランド表示、`src/App.tsx:573` のバージョン表示、`src/App.tsx:2089` のフッター、`src/App.tsx:2124` の本文コピー、`src/style.css:1516` の `content`、`README.md:1` の見出し。**行番号は 955fa5c 時点の実測で現在はずれている。文字列で探すこと**。名称の総入れ替えの完了判定（旧文字列の不在）は T8b の範囲。
8. **`docs/DESIGN.md` 草稿**：次の内容で新設する。ファミリーテーマの採用宣言と正本参照（repo 相対で書く）／取り込んだトークンの一覧と BiimMotion 側の所在／BiimMotion 固有の差分（Biim 枠モチーフの適用範囲＝ステージ／プレビュー領域、字幕帯の字幕様式、4領域の寸法、名称文字列の所在一覧）／禁止リスト（影・グラデーション・ぼかし、トークン以外の色の直値、意味のない装飾）。

## 完了条件

- 4領域の骨格・枠線が入っている（1250px 以上で4領域、920px 以下の縦積みの骨格）
- シェルの配色がファミリートークン（`--cs-*` の写し）経由だけで構成され、Circuit White の地・パネル・文字・線になっている
- Biim 枠の見た目がステージ／プレビュー領域にだけ残っている（シェルの地・枠線に使われていない）
- セクション `id`・`aria-*`・file input の覆い構造・`isMV` 分岐を保持している
- `src/App.tsx` のロジック変更が無い（構造とクラスのみ）
- `docs/DESIGN.md` 草稿がある（正本参照・トークン一覧・差分・禁止リスト・名称所在一覧）
- CP-A1（S1・S3）を `screenshots/cp-a1/` に記録した。**オーナーの判定は待たない**（CP-A1 は記録点であり待ち点ではない）
- C-1〜C-8（下記）

## 検証

- C-1〜C-8（下記）
- `node tools/ui-shots.mjs --only=S1,S3 --out=docs/work/2026-11-13-explainer-ui-harness/screenshots/cp-a1`
  - スクリーンショットは **Pages 用ビルド（`npm run build -- --base=/BiimMotionWebUI/` の成果物）をローカルで配信して撮る**（`tools/ui-shots.mjs` の既定の方式。Amendment 03 補足：公開②の成果物は Pages 用ビルドそのものなので、記録もそれに対して撮る）
- G3 ではレビュー者が DESIGN 草稿の規則とスクリーンショットを突き合わせる（本セッションは判定しない）

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

`docs/work/2026-11-13-explainer-ui-harness/tasks/T6/REPORT.md` に次を書く。**合否判定はしない**。

- 起動時チェックと縮退レベル
- 取り込んだトークンの一覧と取り込み先、写したアイコンの一覧
- 骨格・配色の実装概要（4領域の寸法、Biim 枠モチーフを残した場所）
- DESIGN.md 草稿の要点
- CP-A1 の所在（S1・S3）と、Pages 用ビルドに対して撮ったこと
- C-1〜C-8 の結果、変更ファイルの一覧
- 判断したこと・質問（非ブロッキング。既定の判断で進めたもの）

## 禁止事項

- push しない。自己合格禁止。承認カードが出たら止めて報告する。
- **ロジックを変更しない**。ロジック変更が必要と分かった場合は、変更せずに止めて REPORT.md に記録し、L2 の判断を待つこと（計画書 §5.2：T7 と同じ直列化の規則）。
- MV の制作原則・工程・検証の仕様変更はしない（N1）。MV に QC 規則を追加しない（N10）。ゲートと助言の線引きを変えない（設計思想の宣言を守る）。出力映像の仕様は変更しない。
- 計画書・要件書・Amendment を変えない。共有の `ENVIRONMENT.md` を編集しない。
- 依存を追加しない。
