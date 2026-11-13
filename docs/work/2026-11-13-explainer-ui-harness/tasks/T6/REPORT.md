# REPORT — T6 UI 刷新 第1段（骨格と配色、ファミリーテーマ適用）

- 作業ID: `2026-11-13-explainer-ui-harness`
- ブランチ: `task/T6-ui-base`（`<BASE>` = `e40adbe`）。push していない
- 実装者: L3 実働 A（Claude Code、Opus 5.5、非対話セッション）
- **合否判定はしていない**（G3 は L2 が別セッションで行う）

## 1. 起動時チェック（計画書 §8.1）

| 項目 | 結果 |
| --- | --- |
| 層 | L3 実働 A（DIRECTION.md の指定） |
| エージェント製品・モデル・effort | Claude Code 2.1.319、`claude-opus-5-5`、effort medium（DIRECTION の指定。実行環境から effort の実値は読めないため指定値を記録） |
| サブエージェント | 使用可。**今回は使っていない**（撮影・置換とも自分で実行） |
| コマンド実行 | 可（Git Bash／PowerShell、Node v24.15.0）。worktree に `node_modules` が無かったため `npm ci` を実行した |
| 対話 | 不可（非対話セッション）。質問は §8 に非ブロッキングで記録し、既定の判断で進めた |
| ネットワーク | 可（`npm ci` が成功） |
| ヘッドレス Chrome | 可（`Chrome/157.0.8103.40`、`tools/ui-shots.mjs` の既定方式） |

**縮退レベル: 0（標準）**。理由：コマンド実行・ネットワーク・ヘッドレス Chrome が使え、G3 は L2 が別コンテキストで行う。自己判定になるゲート：なし。

## 2. 取り込んだトークンとアイコン

### トークン（写し）

- 正本：CyberSprite リポジトリの `gui/src/theme/tokens.css`（実物を読んでから写した。値は DIRECTION の補助値と一致）
- 取り込み先：`src/style.css` 冒頭の1つ目の `:root` ブロック。先頭コメントに正本の所在（repo 相対）と「手作業で同期する写し・自動同期なし」を明記
- 取り込んだもの：
  - 基礎トークン `--cs-*` 全15個（board、panel、pad、pad-shade、trace、trace-soft、trace-deep、ink、ink-soft、warn、error、agent、canvas-surround、checker-a、checker-b）
  - 役割トークン `--ui-*`（theme normal ブロックの全項目）
  - 寸法：`--font-ui`、`--font-mono`、`--fs`、`--fs-s`、`--bw`、`--notch`、`--gap`、`--ph-h`、`--tab-h`、`--pad-h`、`--row-h`、`--chamfer`
- 取り込まなかったもの：high-contrast テーマ、`data-text` の文字サイズ切り替え、CyberSprite のエディタ固有寸法（`--layer-w` 等）
- BiimMotion 固有の値は2つ目の `:root` ブロックに分けた（`--biim-*`、`--font-caption`、`--bm-fs`、`--bar-h`、`--band-h`、`--note-w`、`--region-gap`）

### アイコン（写し、無加工）

CyberSprite の `gui/public/icons/` から `public/icons/` へ4ファイル：

| ファイル | 使う場所（いずれも文字ラベル併記、`alt=""`） |
| --- | --- |
| `info.png` | アプリバー「このスタジオについて」 |
| `validate-ok.png` | 字幕帯の状態の一文（書き出せる） |
| `warning.png` | 字幕帯の状態の一文（必須項目が不足） |
| `error.png` | 字幕帯のエラーの要約の見出し |

新規に描いたアイコンは無い。

## 3. 骨格・配色の実装概要

### 構造（`src/App.tsx`、構造とクラスのみ）

- 左サイドバー・トップバー・見出し用の飾り領域（キャッチコピーと「制作の流れ」）を廃止し、次の構成にした。
  - **アプリバー**（上端固定、高さ 44px）：表示名 `BiimMotion`、`<h1>動画ジョブを作成</h1>`、データの扱いの一言、情報ダイアログのボタン、バージョン表示
  - `<form className="studio">` の中に4領域：
    - **主領域** `<main className="region region-main">`：上端に固定の目次（セクション番号＋日本語名＋完了の印 ✓。MV は 01〜03 だけ。現在地は `aria-current` のまま）と「30秒のサンプルを入力」、その下に従来の `<fieldset className="form-body">`（中身は無変更）、末尾にフッター
    - **右上ノート** `<aside aria-label="ジョブの要点">`：タイトル、モード・尺・出力・資料・音声、準備度一覧、解説の注意
    - **右下ノート** `<aside aria-label="補足">`：イメージ／同梱ファイル／JSON のタブ（`role=tab/tabpanel`・`aria-selected` 無変更）、Opus への指示文、失敗パターン、ランタイム表示、ゴースト検査結果
    - **字幕帯** `<div role="region" aria-label="書き出し">`（画面下に固定）：状態の一文と添付容量（MV は音源の尺も）、エラーの要約（`role=alert`・`ref={errorRef}`・`tabIndex={-1}` 無変更）、成功メッセージ、ZIP 生成ボタン（`type=submit`）と進捗、指示のコピーとその状態表示
- 追加した表示用の小部品：`Notch`（ファミリーの左上の切り欠き。CyberSprite の `Notch` と同じ 10px・線 2px の形を、パスの文字列として埋め込み）、`PixelIcon`（`public/icons/` の画像）
- ロジック（state、副作用、ハンドラ、検証、ZIP 生成、コピー、ghost-check 読込）は変更していない。ハンドラの参照先（`submit`、`copyPrompt`、`sample`、`setInfo`、`setPreview` 等）は移動のみ。

### 配色・形（`src/style.css` 全面書き換え）

- シェル：地 `--cs-board`、領域 `--cs-panel`、文字 `--ui-text`（ink）、領域の枠線 `--bw` の `--ui-panel-line`（trace）、字幕帯の枠線は `--ui-panel-line-on`（trace-deep）。見出し帯と現在地は `--ui-ph-*`。ボタンはファミリーのパッド（`--cs-pad` 地＋`--chamfer`）。
- `:root` 以外に色の直値なし（`awk` で `:root` ブロック外の `#…`・`rgb`・`white` 等を検索して0件）。影・グラデーション・ぼかし・角丸なし（`opacity` はファイル入力の覆い構造の `opacity: 0` のみ）。
- 4領域の寸法：右カラム `clamp(320px, 27vw, 420px)`、字幕帯 88px（920px 以下は 96px）、アプリバー 44px、領域間 10px。右カラムは上端固定（右上ノートは最大55%、右下ノートは残り。どちらも領域内スクロール）。
- 920px 以下：主領域 → 右上ノート → 右下ノートの縦積み、字幕帯は画面下に固定。650px 以下：右下ノートのレイアウト図とタブを隠す（刷新前の「650px 以下でプレビューカードを隠す」挙動の引き継ぎ）。390px で横スクロールなし（撮影時 `scrollWidth 390` を確認、S7 相当を作業用に撮影し確認）。

### Biim 枠モチーフを残した場所（`--biim-*` はここだけ）

1. 右下ノートのレイアウト図 `.video-schematic`：黒地 `#1e1e1e`・枠線 `#cccccc`。図中の SVG の色（App.tsx に直値で残る緑系の `fill`/`stroke`）は CSS で `--biim-*` に上書きした（App.tsx の属性値は変えていない）。Biim／全画面／縦型／2人／字幕位置のクラス切り替えは従来の規則を整理して再現。
2. 字幕色の見本 `.subtitle-sample`：黒地＋選んだ字幕色＋白ふち＋字幕書体。
3. 字幕帯の字幕表示部 `.band-caption`：黒地・灰色の枠線。解説モードは状態の一文をキャラ1の字幕色＋白ふち＋字幕書体で、エラーの要約をキャラ2の字幕色で表示（字幕色は要素の CSS 変数 `--caption-color`／`--caption-alert-color` として渡すので即時反映）。MV モードは白の通常書体。

シェルの地色・枠線に `--biim-*` は使っていない。

### 表示名

触った範囲を `BiimMotion` にした：`index.html` の title、ブランド表示と `aria-label`、バージョン表示、フッター。情報ダイアログ本文の `BiimMaker` と `README.md` の見出しは未変更（T8b）。

## 4. DESIGN.md 草稿の要点（`docs/DESIGN.md`）

- §1 ファミリーテーマ採用宣言と正本参照（repo 相対）
- §2 取り込んだトークンの一覧と所在、写したアイコン、同期の方針（手作業）
- §3 形と文字（切り欠き、パッド、入力欄、書体＝日本語ゴシック系統の `--font-ui`）
- §4 BiimMotion 固有の差分：4領域の寸法とブレークポイント、Biim 枠モチーフの適用範囲（レイアウト図・字幕見本・字幕帯の字幕表示部）、本文 14px（UI-06 による差分）、名称文字列の所在一覧（計画書 §1.3 の8箇所の現況）
- §5 禁止リスト（影・グラデーション・ぼかし・半透明の重ね、`:root` 以外の色の直値、シェルへの Biim 色、意味のない装飾、角丸、外部 CDN、依存追加）
- §6 保持する接続点、§7 T7 への持ち越し

## 5. CP-A1

- 所在：`docs/work/2026-11-13-explainer-ui-harness/screenshots/cp-a1/S1-explainer-initial-1440.png`、`S3-mv-filled-1440.png`
- 撮り方：`npm run build -- --base=/BiimMotionWebUI/` の成果物を `tools/ui-shots.mjs` でローカル配信し（`/BiimMotionWebUI/` 配下）、ヘッドレス Chrome で撮影。コマンド：`node tools/ui-shots.mjs --only=S1,S3 --out=docs/work/2026-11-13-explainer-ui-harness/screenshots/cp-a1`。出力：`S1 … (1440x900, scrollWidth 1440)`、`S3 … (1440x900, scrollWidth 1440)`
- 撮影したビルドは1つ目のコミット（`8e60f5b`）の内容。2つ目のコミットは文書と画像だけで UI は変わらない
- `tools/ui-shots.mjs` は**変更していない**（S1・S3 が使うセレクタ `form`、`.download-button`、`form select`、`#concept …`、`.concept-row …`、`.readiness li.done`、`.direction-lab`、`.sample-button` はすべて残した）。S6 が使う `.sidebar-bottom button` はサイドバー廃止で無くなるため、S6 の撮影には T7 のセレクタ更新が必要
- オーナーの判定は待っていない（記録点）

## 6. 検証結果（C-1〜C-8）

`<BASE>` = `e40adbe`。2つ目のコミットの後に実行した結果。

| 条件 | 結果 |
| --- | --- |
| C-1 `npm test` | 合格（tests 72、pass 72、fail 0） |
| C-2 `npm run build -- --base=/BiimMotionWebUI/` | 合格（チャンクサイズの警告のみ。従来から出ているもの） |
| C-3 `git diff --check e40adbe...HEAD` | 出力なし |
| C-4 MV 非退行 | `git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts` は差分なし。`git diff -U0 955fa5c -- tests/job.test.ts \| grep '^-[^-]'` は `-    12,` の1行を出す。これは本タスクの差分ではなく（本タスクは `tests/` を変更していない。`git diff --stat e40adbe...HEAD` に `tests/` は無い）、`<BASE>` 以前から存在する差分。§5.3 の許容行かどうかの判定は L2 に委ねる |
| C-5 触らない範囲 | `git diff --stat e40adbe...HEAD` の一覧に `src/job.ts`・`src/explainer-assist.ts`・`src/mv-assist.ts`・`src/templates.ts`・`job-template/`・`tests/`・`package.json`・`src/biim-standard.json` は無い |
| C-6 絶対パス・メール・認証情報 | 1つ目の grep で1件一致：`tasks/T7/DIRECTION.md` の border-radius を検査する grep の行（L2 の発注記録のコミット `035378a` の内容）。その行の `radius:` の直後の文字列がドライブ文字のパターン（英字＋コロン＋バックスラッシュ）に当たる誤検出で、パスではない。本タスクで追加した行には一致なし（初版の本 REPORT はこの正規表現を引用して自身が一致したため、3つ目のコミットで言い換えた）。2つ目の grep は一致なし |
| C-7 読まないもの | `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の中身は読んでいない（`npm ci` とビルドで生成・更新しただけ。`dist/` は撮影スクリプトが配信しただけ） |
| C-8 計画の写し | `PLAN.md` と `ORCHESTRATION_PLAN.md` に差分なし、`cmp` で一致 |

補助の確認：

- `src/App.tsx` の接続点の数（変更前 → 変更後）：`isMV` 43 → 47（既存の分岐は全部残り、表示用に4箇所増えた）、`aria-*` 41 → 45、`role=` 12 → 13、`type="file"` 5 → 5、`id=` 4 → 4。セクション `id`（concept／sources／direction／character／voice）は `Section` 部品のまま無変更
- `npx tsc -b` 合格

### 変更ファイル

| コミット | ファイル |
| --- | --- |
| `8e60f5b` Restructure the UI shell on the family theme with the four-region layout | `index.html`、`src/App.tsx`、`src/style.css`、`public/icons/{info,validate-ok,warning,error}.png` |
| `7f10030` Draft docs/DESIGN.md and record CP-A1 screenshots | `docs/DESIGN.md`、`docs/work/2026-11-13-explainer-ui-harness/screenshots/cp-a1/S1-explainer-initial-1440.png`・`S3-mv-filled-1440.png`、本 REPORT.md |
| （3つ目）Reword the C-6 note in the T6 report | 本 REPORT.md のみ（C-6 の記述が検査の正規表現を引用して自身が一致したため言い換え。履歴を書き換えないよう追加のコミットにした） |

## 7. 判断したこと（既定の判断で進めたもの）

1. **4領域を出す幅**：要件は「1250px 以上で4領域」「920px 以下で縦積み」。921〜1249px も4領域のまま（右カラムは最小 320px）とした。間の幅の扱いが要件に無いため、骨格の切り替えを1か所にした。
2. **ページ全体のスクロール方式**：主領域は文書としてスクロールし、右カラムは上端固定、字幕帯は `position: fixed`。主領域を内側スクロールにしなかったのは、`tools/ui-shots.mjs` の `window.scrollTo` と、現在地判定の IntersectionObserver（ビューポート基準）をそのまま使うため。
3. **字幕帯の周りの余白**：字幕帯の下・左右の 10px の隙間からスクロール中の内容が見えないよう、`outline` を地色（`--cs-board`）で描いた（影ではない）。
4. **見出し用の飾り領域と「制作の流れ」を削除**：サイドバー廃止（UI-02）と同時に骨格から外した（UI-12 の趣旨）。機能ではない。キャッチコピー「制作のバトンを渡す。」「JOB OVERVIEW」「LIVE」「YOUR NEXT VIDEO」「AFTER DOWNLOAD」「WORKSPACE」「YOUR BRIEF」「LOCAL ONLY」など、シェル部分の英語・飾りの文言も移動に合わせて外した。フォーム内（`CONCEPT` 等の眉見出し、`Ideas in motion.`、`GHOST CHECK`、`ABOUT THE STUDIO`）は T7 の文言改稿に残した。
5. **右上ノートに「モード」行を追加**：UI-01 の右上ノートの項目（タイトル・モード・尺・出力・資料数・音声）に合わせ、`isMV` による表示だけを足した。字幕帯の MV の「音源の尺」も同じく表示だけ（UI-04）。
6. **右下ノートの切り替え**：タブはイメージ／同梱ファイル／JSON の3つのまま。失敗パターンとゴースト検査結果はタブに入れず、タブの下に並べた（タブに入れると `preview` の状態の型を変えるロジック変更になるため）。T7 で扱いを決める。
7. **字幕書体**：`--font-caption` に M PLUS Rounded 1c を先頭に置いたが、WebUI では読み込んでいない（OS に無ければ丸ゴシック → 日本語ゴシックに落ちる）。同梱フォントの読み込み（UI-06、約3.6MB）は初期表示への影響の判断を含むので T7 に残した。外部 CDN は使っていない。
8. **favicon**：直値の緑を含む現行の favicon は T7 の範囲として残した。`theme-color` は `--cs-board` と同じ値にした。
9. **自前 SVG の `Icon`**：フォーム内の装飾アイコンは T7（UI-08 の全面適用）に残した。シェルから外れた分だけ使われなくなった。

## 8. 質問（非ブロッキング）

- Q-T6-1：921〜1249px を4領域のままにした判断（§7-1）でよいか。1250px 未満で右カラムを狭める以外の扱いが必要なら T7 で直す。
- Q-T6-2：C-4 の `tests/job.test.ts` の `-    12,` は本タスク以前からの差分。§5.3 の許容行に当たるかの確認をお願いしたい。
