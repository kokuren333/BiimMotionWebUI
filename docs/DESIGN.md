# DESIGN — BiimMotion WebUI のデザイン言語（草稿）

- 状態：**草稿**（T6 で新設。T7 の全面適用で確定版にする）
- 根拠：要件書 `docs/requirements/2026-11-13-explainer-ui-harness.md` §3.2・§3.3、Amendment 02（表示名 `BiimMotion`）、**Amendment 03**（製品ファミリーテーマへの統一。D12 と矛盾する点は Amendment 03 が優先）
- 対象：この repo の WebUI（`index.html`、`src/App.tsx`、`src/style.css`、`public/icons/`）。**出力映像の仕様（biim-standard-v1、字幕帯域、QC 規則）は対象外で、ここでは変えない**

## 1. 採用宣言と正本

BiimMotion の WebUI は、CyberSprite・MankoMIX と同じ製品ファミリーテーマ **「Circuit White / Solder Mask」** を採用する。BiimMotion は3つ目の採用プロダクトである。

- **値の正本**：CyberSprite リポジトリの `gui/src/theme/tokens.css`（基礎トークン `--cs-*`、役割トークン `--ui-*`、寸法）
- **アイコンの正本**：CyberSprite リポジトリの `gui/public/icons/`（16×16 のピクセルアイコン）
- 本書は独自のパレットを定義しない。ファミリーの正本を参照し、**BiimMotion 固有の差分だけ**を規定する。

## 2. 取り込んだトークン（写し）と所在

写しは `src/style.css` 冒頭の1つ目の `:root` ブロックにある。先頭のコメントに正本の所在と「手作業で同期する写し」である旨を書いてある。自動同期の仕組みは作らない。正本の値が変わったら、正本から手で写し直す（写し側で値を変えない）。

| 種類 | 取り込んだもの | 備考 |
| --- | --- | --- |
| 基礎トークン | `--cs-board` `#EEF6F8`、`--cs-panel` `#FFFFFF`、`--cs-pad` `#EAF6F9`、`--cs-pad-shade` `#B9DDE6`、`--cs-trace` `#19C3E6`、`--cs-trace-soft` `#BFEFF9`、`--cs-trace-deep` `#0A86A8`、`--cs-ink` `#0B2A3A`、`--cs-ink-soft` `#43606E`、`--cs-warn` `#E8A317`、`--cs-error` `#E5484D`、`--cs-agent` `#7C5CFF`、`--cs-canvas-surround` `#D5DEE2`、`--cs-checker-a` `#FFFFFF`、`--cs-checker-b` `#E1E7EA` | 正本の theme normal ブロックの全15個 |
| 役割トークン | `--ui-*` の全項目（`--ui-text`、`--ui-panel-line`、`--ui-ph-*`、`--ui-sep`、`--ui-pad-*`、`--ui-focus`、`--ui-field-line`、`--ui-error-bg`、`--ui-warn-bg` ほか） | 正本の theme normal ブロックをそのまま写した。コンポーネントは主に役割トークンを使う |
| 寸法 | `--font-ui`、`--font-mono`、`--fs`（13px）、`--fs-s`（12px）、`--bw`（2px）、`--notch`（10px）、`--gap`、`--ph-h`、`--tab-h`、`--pad-h`、`--row-h`、`--chamfer` | CyberSprite のエディタ固有の寸法（`--layer-w`、`--palette-w`、`--timeline-h` など）は写さない |
| 取り込まないもの | high-contrast テーマ（`:root[data-contrast="high"]`）、文字サイズ切り替え（`data-text`） | BiimMotion に切り替え UI が無いため。必要になったら同じ正本から写す |

### アイコン（写し）

`public/icons/` に正本から次の4つを写した（ファイルは無加工）。いずれも文字ラベルと併記し、`alt=""` の補助表示として使う。

| ファイル | 使う場所 |
| --- | --- |
| `info.png` | アプリバーの「このスタジオについて」 |
| `validate-ok.png` | 字幕帯の状態の一文（書き出せる状態） |
| `warning.png` | 字幕帯の状態の一文（必須項目が足りない状態） |
| `error.png` | 字幕帯のエラーの要約の見出し |

BiimMotion 固有のアイコンを新たに描く場合は、正本と同じ 16×16・同じ11色パレットの様式で描き、`public/icons/` に置く。

## 3. 形と文字（ファミリーの様式）

- **領域（パネル）**：白地（`--cs-panel`）に `--bw`（2px）の枠線（`--ui-panel-line`）。左上に 45° のピクセルの切り欠き（`Notch` 部品。CyberSprite のパネルの切り欠きと同じ形）。角丸は使わない。
- **見出し帯**：領域の上端に高さ `--ph-h` の帯、下線は `--ui-ph-line`。選択中・現在地は `--ui-ph-bg-on`（trace）で塗る。
- **ボタン（パッド）**：`--cs-pad` 地、2px の枠（左上が明るく右下が `--ui-pad-line`）、角は `--chamfer` の 2px の切り欠き。主操作（ZIP 生成）は `--ui-pad-on-bg` 地＋`--ui-on-line` 枠で区別する。フォーカスは `--ui-focus` の 2px 輪郭（切り欠きで切れないよう内側に描く）。
- **入力欄**：白地、1px の `--ui-field-line`、角丸0。
- **書体**：`--font-ui`（欧文は Segoe UI、和文は Yu Gothic UI → Meiryo → Hiragino Sans → Noto Sans CJK JP の**日本語ゴシック系統**）、数値・パス・コマンドは `--font-mono`。外部 CDN からフォントを取得しない。
- **区切り**：領域内の区切りは `--ui-sep`（2px）／`--ui-sep-weak`（1px）。

## 4. BiimMotion 固有の差分

`src/style.css` の2つ目の `:root` ブロックに置く。ファミリーの正本には含めない。

### 4.1 4領域の骨格（UI-01）

| 領域 | 中身 | 寸法 |
| --- | --- | --- |
| アプリバー | 表示名 `BiimMotion`、作業名、データの扱いの一言、情報ダイアログ、バージョン | 高さ `--bar-h`（44px）、上端に固定 |
| **主領域** | 目次（上端に固定）と入力フォーム 01〜05・演出と調査の詳細 | 残りの幅 |
| **右上ノート** | ジョブの要点（タイトル・モード・尺・出力・資料数・音声）と準備度一覧・解説の注意 | 右カラム `--note-w`＝`clamp(320px, 27vw, 420px)`。右カラムの高さの最大55%、超える分は領域内でスクロール |
| **右下ノート** | 切り替え式の補足（イメージ・同梱ファイル・JSON のタブ）、Opus への指示文、失敗パターン、ゴースト検査結果 | 右カラムの残り。領域内でスクロール |
| **字幕帯** | 状態の一文、エラーの要約、ZIP 生成ボタンと進捗、指示のコピー | 画面下に固定、高さ `--band-h`（88px。要件の 64〜96px の範囲） |

- 領域の境界は枠線（`--bw`）で示し、領域どうしの間隔は `--region-gap`（10px）。
- 幅 921px 以上で4領域（右カラムは上端固定で、スクロール位置によらず右上ノートと字幕帯が見える）。要件の基準幅 1250px 以上はこの範囲に含まれる。
- 幅 920px 以下では、主領域 → 右上ノート → 右下ノートの順に縦に積み、字幕帯は画面下に固定のまま（左右の余白なし、高さ 96px）。
- 幅 650px 以下では、作業名・データの一言・バージョンを隠し、右下ノートのレイアウト図とタブを隠す（刷新前の「650px 以下ではプレビューカードを隠す」挙動を引き継ぐ）。字幕帯は内容に合わせて高さが伸びる。
- 解説と MV で骨格・寸法は同じ。モードで変わるのは目次の項目数（MV は 01〜03）、右上ノートの項目、右下ノートの失敗パターン、字幕帯の様式だけ。

### 4.2 Biim 枠モチーフの適用範囲

Biim 枠（出力仕様 biim-standard-v1）の見た目は **ステージ／プレビュー領域にだけ**使う。シェル（地色・領域の枠線・フォーム・ナビゲーション）には使わない。

| 変数 | 値 | 意味 |
| --- | --- | --- |
| `--biim-bg` | `#1e1e1e` | Biim 枠の黒地 |
| `--biim-line` | `#cccccc` | Biim 枠の灰色の枠線 |
| `--biim-text` | `#f4f4f4` | Biim 枠の文字 |
| `--biim-stroke` | `#FFFFFF` | 字幕の白ふち |
| `--font-caption` | M PLUS Rounded 1c → OS の丸ゴシック → 日本語ゴシック | 字幕書体（字幕帯・字幕見本・プレビュー用） |

適用する場所：

1. **右下ノートのレイアウト図**（`.video-schematic`）：黒地・灰色の枠線・字幕の帯。図中の線や人物の色も CSS で `--biim-*` に揃える（Biim／全画面／縦型／人数／字幕位置の切り替えは従来のクラス切り替えのまま）。字幕の帯の色は利用者が選んだ字幕色。
2. **字幕色の見本**（`.subtitle-sample`）：黒地に、選んだ字幕色＋白ふちの字幕書体。
3. **字幕帯の字幕表示部**（`.band-caption`）：黒地・灰色の枠線の帯。
   - 解説モード：状態の一文を**実際の字幕と同じ様式**（キャラ1の字幕色＋白ふち、字幕書体）で表示し、エラーの要約はキャラ2の字幕色で表示する。字幕色を変えると即時に反映される（字幕の見え方の実物プレビューを兼ねる、UI-04）。字幕色は CSS 変数 `--caption-color`／`--caption-alert-color` として要素に渡す（利用者のデータなので直値の規則の対象外）。
   - MV モード：字幕もキャラも使わないので、白の通常書体で状態と音源の尺を表示する。
   - 字幕様式の文字も通常のテキストとして DOM にあり、読み上げられる。

字幕帯の外枠（ボタンの並ぶ部分）はシェルなので、ファミリーテーマ（白地、`--ui-panel-line-on` の枠線）で描く。

### 4.3 文字サイズ

- 本文は `--bm-fs`（14px、行間 1.5）。ファミリーの `--fs`（13px）より1px大きいのは、要件 UI-06（本文 14px 以上）による BiimMotion の差分。補助の文字は `--fs-s`（12px、最小）。
- レイアウト図の中の極小の文字（`SCENE / 01` 等）は図の一部であり、本文の規則の対象外（T7 で扱いを確定する）。

### 4.4 名称文字列の所在一覧（UI-10）

表示名は `BiimMotion`（Amendment 02）。repo 名・Pages の URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物として変えない。計画書 §1.3 の8箇所の現況（行番号は T6 時点。今後ずれるので文字列で探すこと）：

| # | 所在（955fa5c 時点の位置） | T6 時点の文字列 | 状態 |
| --- | --- | --- | --- |
| 1 | `index.html` の `<title>` | `BiimMotion` | T6 で変更済み |
| 2 | `src/App.tsx` のブランドの `aria-label` | `BiimMotion トップ` | T6 で変更済み（アプリバー） |
| 3 | `src/App.tsx` のブランド表示 | `BiimMotion` | T6 で変更済み（アプリバー） |
| 4 | `src/App.tsx` のバージョン表示 | `BiimMotion · v0.1` | T6 で変更済み（アプリバー） |
| 5 | `src/App.tsx` のフッター | `BiimMotion` | T6 で変更済み（主領域の末尾） |
| 6 | `src/App.tsx` の情報ダイアログの本文コピー | `BiimMakerは企画・資料・演出方針を…` | **未変更**（T8b で統一） |
| 7 | `src/style.css` の `content`（旧 `.sidebar:after` の `MOTION JOB STUDIO`） | なし | T6 の CSS 全面書き換えで消滅 |
| 8 | `README.md` の1行目の見出し | `# BiimMakerWebUI` | **未変更**（T8b で統一） |

名称の総入れ替えの完了判定（旧文字列の不在）は T8b の範囲。

## 5. 禁止リスト

- 影（`box-shadow`・`text-shadow`・`filter: drop-shadow`）、グラデーション、ぼかし（`blur`・`backdrop-filter`）、半透明の重ね。例外：ファイル入力を覆う透明な `<input type=file>`（`opacity: 0`、覆い構造の維持のため）。
- `src/style.css` の `:root` ブロック以外への色の直値。シェルの色はトークン（`--cs-*`／`--ui-*`）経由だけ。Biim 枠モチーフの色は `--biim-*` 経由だけ。`index.html` の `theme-color` は HTML の都合で直値を書く（`--cs-board` と同じ値）。
- シェルの地色・枠線に Biim 枠の色（`--biim-*`）を使うこと。
- 意味を持たない装飾（飾りのアイコン、飾りの英語見出し、見出し用の飾り領域）。アイコンは文字ラベルと併記する。
- 角丸（入力欄・パネル・ボタンとも0。形はファミリーの切り欠きで表す）。
- 外部 CDN からのフォント・アイコンの取得、依存パッケージの追加。

## 6. 保持する接続点（UI 監査 §(3) の4〜7）

- セクションの `id`（`concept`／`sources`／`direction`／`character`／`voice`）：目次のアンカーと現在地判定に使う。
- `role=tab/tabpanel`・`aria-selected`・`aria-expanded/aria-controls`・エラー領域の `role=alert` とフォーカス移動。
- ファイル入力の覆い構造（`.file-button` の中の透明な `<input type=file>`、`:focus-within` の輪郭）。
- `isMV` による表示・必須条件の分岐。

## 7. T7 へ持ち越すもの（草稿の範囲外）

- 文言の全面改稿（英語の飾りラベル `CONCEPT` 等、`Ideas in motion.` など）、装飾アイコン（自前 SVG の `Icon`）の整理、`♫`・`+`/`−` の扱い。
- favicon（ファミリーのピクセル様式で枠の構成を描く）。
- 字幕書体の実フォント読み込み（同梱の M PLUS Rounded 1c を初期表示を妨げない方法で読み込むか）。
- 右下ノートの補足（失敗パターン・ゴースト検査結果）をタブの切り替えに含めるか。
- UI-11 全機能の操作確認、コントラスト比の計算表、Tab 順の記録。
