# DESIGN — BiimMotion WebUI のデザイン言語

- 状態：**確定版**（T6 で草稿を新設し、T7 の全面適用の後、T8b で実装に合わせて確定）
- 根拠：要件書 `docs/requirements/2026-11-13-explainer-ui-harness.md` §3.2・§3.3、Amendment 02（表示名 `BiimMotion`）、**Amendment 03**（製品ファミリーテーマへの統一。D12 と矛盾する点は Amendment 03 が優先）
- 対象：この repo の WebUI（`index.html`、`src/App.tsx`、`src/style.css`、`public/icons/`）。**出力映像の仕様（biim-standard-v1、字幕帯域、QC 規則）は対象外で、ここでは変えない**
- 本書と実装が食い違ったときは、実装を確かめたうえで本書を直すか、本書に合わせる修正を別タスクとして起こす。本書だけを書き換えて規則を変えない

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
| 役割トークン | `--ui-*` の全項目（`--ui-text`、`--ui-panel-line`、`--ui-ph-*`、`--ui-sep`、`--ui-pad-*`、`--ui-focus`、`--ui-field-line`、`--ui-error-bg`、`--ui-warn-bg`、`--ui-scrim` ほか） | 正本の theme normal ブロックをそのまま写した。コンポーネントは主に役割トークンを使う |
| 寸法 | `--font-ui`、`--font-mono`、`--fs`（13px）、`--fs-s`（12px）、`--bw`（2px）、`--notch`（10px）、`--gap`（8px）、`--ph-h`（28px）、`--tab-h`（30px）、`--pad-h`（26px）、`--row-h`（24px）、`--chamfer` | CyberSprite のエディタ固有の寸法（`--layer-w`、`--palette-w`、`--timeline-h` など）は写さない |
| 取り込まないもの | high-contrast テーマ（`:root[data-contrast="high"]`）、文字サイズ切り替え（`data-text`） | BiimMotion に切り替え UI が無いため。必要になったら同じ正本から写す |

### 2.1 アイコン（写し、10点）

`public/icons/` に正本から次の10点を写した（ファイルは無加工）。`src/App.tsx` の `PixelIcon` 部品が `import.meta.env.BASE_URL` 基準の `icons/<名前>.png` を `alt=""` で表示する。**どれも文字ラベルと並べて置き、アイコンだけの操作は作らない。**

| ファイル | 追加 | 使う場所 |
| --- | --- | --- |
| `info.png` | T6 | アプリバーの「BiimMotion について」 |
| `validate-ok.png` | T6 | 字幕帯の状態の一文（書き出せる状態） |
| `warning.png` | T6 | 字幕帯の状態の一文（必須項目が足りない状態） |
| `error.png` | T6 | 字幕帯のエラーの要約の見出し |
| `folder.png` | T7 | ファイルを選ぶ操作（「ファイルを選ぶ」、MV の完成音源・BGM の「音源を選ぶ」、「モデルを選ぶ」、「検査結果を開く」） |
| `sources.png` | T7 | 02 のドロップ区域「参考資料をここにドロップ」 |
| `add.png` | T7 | 方向性のたたき台の「この案を追記」（MV・解説） |
| `remove.png` | T7 | 添付一覧の「削除」 |
| `settings.png` | T7 | 「演出と調査の詳細」の開閉ボタン |
| `agent.png` | T7 | 字幕帯の「指示をコピー」（制作エージェントへの指示） |

BiimMotion 固有のアイコンを新たに描く場合は、正本と同じ 16×16・同じ11色パレットの様式で描き、`public/icons/` に置く。現時点で新しく描いたものは favicon（§4.5）だけで、これは `public/icons/` ではなく `index.html` に置いている。

## 3. 形と文字（ファミリーの様式）

- **領域（パネル）**：白地（`--cs-panel`）に `--bw`（2px）の枠線（`--ui-panel-line`）。左上に 45° のピクセルの切り欠き（`Notch` 部品。11×11 の SVG で、CyberSprite のパネルの切り欠きと同じ形）。角丸は使わない。
- **見出し帯**：領域の上端に高さ `--ph-h` の帯（`.region-head`）、下線は `--ui-ph-line`。目次の現在地・選択中のタブは `--ui-ph-bg-on`（trace）で塗る。
- **ボタン（パッド）**：`--cs-pad` 地、2px の枠（左上が地と同色、右下が `--ui-pad-line`）、角は `--chamfer` の 2px の切り欠き（`clip-path`）。主操作（ZIP 生成）は `--ui-pad-on-bg` 地＋`--ui-on-line` 枠で区別する。パッドのフォーカスは `--ui-focus` の 2px 輪郭を内側（`outline-offset: -5px`）に描き、切り欠きで切れないようにする。アプリバーの「BiimMotion について」とフッターの「同梱物とデータの扱い」は文字リンクの見た目（`text-button`）にしている。
- **入力欄**：白地、1px の `--ui-field-line`、角丸0。フォーカスは `--ui-focus` の 2px 輪郭（`outline-offset: 0`）。その他の要素のフォーカスも同じ 2px 輪郭（`outline-offset: 1px`）。
- **書体**：`--font-ui`（欧文は Segoe UI、和文は Yu Gothic UI → Meiryo → Hiragino Sans → Noto Sans CJK JP の**日本語ゴシック系統**）、数値・パス・コマンド・目次の番号・バージョンは `--font-mono`。外部 CDN からフォントを取得しない。字幕様式の書体は §4.2。
- **区切り**：領域内の区切りは `--ui-sep`（2px）／`--ui-sep-weak`（1px）。
- **動き**：`transition`・`animation`・`@keyframes` を指定しない。状態の切り替え（タブ、詳細の開閉、hover、字幕色）は即時。`prefers-reduced-motion: reduce` では `scroll-behavior: auto` と `transition`・`animation` の打ち消しを置く。

## 4. BiimMotion 固有の差分

値は `src/style.css` の2つ目の `:root` ブロックに置く。ファミリーの正本には含めない。

| 変数 | 値 | 用途 |
| --- | --- | --- |
| `--bm-fs` | 14px | 本文（§4.3） |
| `--bm-fs-h2`／`--bm-fs-h3` | 18px／15px | フォームの見出し |
| `--bar-h` | 44px | アプリバーの高さ |
| `--band-h` | 88px（920px 以下は 96px） | 字幕帯の高さ |
| `--note-w` | `clamp(320px, 27vw, 420px)` | 右カラムの幅 |
| `--region-gap` | 10px | 領域どうしの間隔と外周の余白 |
| `--field-h` | 34px | 入力欄の最小の高さ |
| `--biim-*`・`--font-caption` | §4.2 | Biim 枠モチーフと字幕様式 |

### 4.1 4領域の骨格（UI-01）

| 領域 | 中身 | 寸法 |
| --- | --- | --- |
| アプリバー | 表示名 `BiimMotion`、作業名「動画ジョブを作成」、データの扱いの一言、「BiimMotion について」（情報ダイアログ）、バージョン `BiimMotion · v0.1` | 高さ `--bar-h`（44px）。921px 以上では画面の上端に固定（`position: sticky`） |
| **主領域** | 目次（01〜05 と「30秒のサンプルを入力」）、入力フォーム 01〜05、「演出と調査の詳細」、フッター（`BiimMotion` と「同梱物とデータの扱い」） | 残りの幅。目次はアプリバーの直下に固定（921px 以上） |
| **右上ノート**（「ジョブの要点」） | タイトル、モード・様式（解説のみ）・尺の目安・出力・資料・音声の一覧、準備度の一覧、解説の注意 | 右カラム `--note-w` の上側。**右カラムの高さの 46% に固定**（モードで高さが変わらないようにするため、UI-14）。超える分は領域内でスクロール |
| **右下ノート**（「補足」） | 切り替え式の表示（イメージ＝レイアウト図・同梱ファイル・JSON の3タブ）、その下に「制作エージェントへの指示」、「previewで確認する失敗パターン」、「レンダーゴースト検査の結果」 | 右カラムの残り。領域内でスクロール |
| **字幕帯**（「書き出し」） | 字幕表示部（状態の一文・添付容量・音源の尺・エラーの要約・成功の表示）、「ジョブのZIPを生成」と進捗、「指示をコピー」 | 画面下に固定（`position: fixed`、左右と下に `--region-gap`）、高さ `--band-h`（88px。要件の 64〜96px の範囲） |

- 右カラムは `position: sticky`（アプリバーの下 `--region-gap` の位置）で、高さは画面の高さからアプリバー・字幕帯・間隔を引いた値。スクロール位置によらず右上ノート・右下ノート・字幕帯が見える。
- 領域の境界は枠線（`--bw`）で示し、領域どうしの間隔は `--region-gap`（10px）。
- **エラーの要約が出ている間だけ**、字幕帯は内容に合わせて伸びる（`.subtitle-band:has(.errors)`、最小 `--band-h`・最大 50vh）。全件を列挙して直せるようにするため（監査 §(2)-16）。入力してエラーが消えると元の高さに戻る。伸びている間は右カラムの下部に重なる。
- 右下ノートの補足のうち、失敗パターンとゴースト検査結果は**タブに含めず、3タブの下に区切り線と見出しで並べる**（T7 で決着。タブに入れると表示状態の型を変えるロジック変更になるため）。
- **幅 921px 以上**：4領域（主領域と右カラムの2列）。要件の基準幅 1250px 以上はこの範囲に含まれる。
- **幅 920px 以下**：主領域 → 右上ノート → 右下ノートの順に縦に積む。アプリバーは固定をやめて折り返し（`position: static`）、目次は画面の上端に固定。右カラムの高さの固定と領域内スクロールをやめる。字幕帯は画面下に固定のまま（左右と下の余白なし、高さ 96px、字幕の文字は 17px）。
- **幅 650px 以下**：アプリバーの作業名・データの一言・バージョンを隠す。**目次も固定しない**（折り返した目次が画面の上端を覆い、移動先の見出しが隠れるため）。右下ノートのタブとタブの中身（レイアウト図・同梱ファイル・JSON）を隠す（刷新前の「650px 以下ではプレビューカードを隠す」挙動を引き継ぐ。指示文・失敗パターン・ゴースト検査結果は残る）。字幕帯は内容に合わせて高さが伸び（最小 64px）、ボタンは字幕表示部の下に折り返す。
- 解説と MV で骨格・寸法は同じ。モードで変わるのは目次の項目数（MV は 01〜03）、右上ノートの項目（MV に「様式」は無い）、右下ノートの失敗パターン（MV 11 件、解説 23 件）、字幕帯の様式（§4.2）だけ。

### 4.2 Biim 枠モチーフと字幕様式の適用範囲

Biim 枠（出力仕様 biim-standard-v1）の見た目は **ステージ／プレビュー領域にだけ**使う。シェル（地色・領域の枠線・フォーム・ナビゲーション）には使わない。

| 変数 | 値 | 意味 |
| --- | --- | --- |
| `--biim-bg` | `#1e1e1e` | Biim 枠の黒地 |
| `--biim-line` | `#cccccc` | Biim 枠の灰色の枠線 |
| `--biim-text` | `#f4f4f4` | Biim 枠の文字 |
| `--biim-stroke` | `#FFFFFF` | 字幕の白ふち |
| `--font-caption` | `"BiimMotion Caption"` → M PLUS Rounded 1c → Hiragino Maru Gothic ProN → Yu Gothic UI → Meiryo → sans-serif | 字幕様式の書体（字幕帯・字幕見本） |

**字幕書体の読み込み**：`src/style.css` の `@font-face` で `BiimMotion Caption`（太さ 800）を定義する。読み込み先は、OS に入っている M PLUS Rounded 1c ExtraBold（`local()`）、無ければ同梱の `public/job-assets/fonts/MPLUSRounded1c-ExtraBold.ttf`（同じサイトの URL。ビルドで base パスが付く）。`font-display: swap` にして、読み込み中は OS の書体で先に描き、初期表示を妨げない。外部 CDN は使わない。シェルの書体は `--font-ui` のままで、字幕様式だけがこの書体を使う。

適用する場所：

1. **右下ノートのレイアウト図**（`.video-schematic`）：黒地・灰色の枠線・字幕の帯。図中の線や人物の色も CSS で `--biim-*` に揃える（`src/App.tsx` の SVG に色の直値を書かない）。Biim／全画面／縦型／人数／字幕位置の切り替えはクラスの切り替え。字幕の帯の色は利用者が選んだ字幕色。図の意味は `role="img"` と `aria-label`（例：「画面配置の概形：横16:9、全画面、キャラ1人、字幕は下」）で読める。
2. **字幕色の見本**（`.subtitle-sample`）：黒地に、選んだ字幕色＋白ふちの字幕書体。
3. **字幕帯の字幕表示部**（`.band-caption`）：黒地・灰色の枠線の帯。
   - 解説モード（`.band-caption.caption`）：状態の一文を**実際の字幕と同じ様式**（キャラ1の字幕色＋白ふち、字幕書体、22px・太さ 800）で表示し、エラーの要約はキャラ2の字幕色（15px・太さ 800）で表示する。字幕色を変えると即時に反映される（字幕の見え方の実物プレビューを兼ねる、UI-04）。字幕色は CSS 変数 `--caption-color`／`--caption-alert-color` として要素に渡す（利用者のデータなので直値の規則の対象外）。
   - MV モード（`.band-caption.plain`）：字幕もキャラも使わないので、`--biim-text` の通常書体で状態と音源の尺を表示する。
   - 字幕様式の文字も通常のテキストとして DOM にあり、読み上げられる（エラーの要約は `role="alert"`）。

字幕帯の外枠（ボタンの並ぶ部分）はシェルなので、ファミリーテーマ（白地、`--ui-panel-line-on` の枠線）で描く。

### 4.3 文字サイズ

- 文字の大きさはすべて px で指定する（em／rem を使わない）。
- 本文は `--bm-fs`（14px、行間 1.5）。ファミリーの `--fs`（13px）より1px大きいのは、要件 UI-06（本文 14px 以上）による BiimMotion の差分。ボタン・領域の見出し帯は `--fs`（13px）、補助の文字は `--fs-s`（12px）で、**12px 未満は使わない**。見出し・ブランド・字幕様式は 14px より大きい px（15〜22px）。
- **レイアウト図の中に文字を置かない**。刷新前の極小の飾り文字（`SCENE / 01`、`Ideas in motion.`、`POINT`、`CONTEXT` 等）は T7 で廃止し、図形（タイトルの帯・線・点）に置き換えた。

### 4.4 名称文字列の所在一覧（UI-10、最新）

表示名は `BiimMotion`（Amendment 02）。repo 名・Pages の URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物として変えない。計画書 §1.3 の8箇所と、T7 で増えた表示箇所の現況（T8b 時点の位置。行番号は今後ずれるので文字列で探すこと）：

| # | 所在（T8b 時点の位置） | 現在の文字列 | 経緯 |
| --- | --- | --- | --- |
| 1 | `index.html:11` の `<title>` | `BiimMotion` | T6 で変更 |
| 2 | `src/App.tsx:539` のブランドの `aria-label` | `BiimMotion トップ` | T6 で変更（アプリバー） |
| 3 | `src/App.tsx:540` のブランド表示 | `BiimMotion` | T6 で変更（アプリバー） |
| 4 | `src/App.tsx:554` のバージョン表示 | `BiimMotion · v0.1` | T6 で変更（アプリバー） |
| 5 | `src/App.tsx:1711` のフッター | `BiimMotion` | T6 で変更（主領域の末尾） |
| 6 | `src/App.tsx:2191` の情報ダイアログの本文 | `BiimMotion は、動画の企画・資料・演出方針を、…` | T7 で変更（ダイアログの文の書き直しと同時） |
| 7 | `src/style.css` の `content`（旧 `.sidebar:after` の `MOTION JOB STUDIO`） | なし（`src/style.css` に `content:` の指定は無い） | T6 の CSS 全面書き換えで消滅 |
| 8 | `README.md:1` の見出し | `# BiimMotion` | T8b で変更 |
| 追加 | `src/App.tsx:552` のアプリバーのボタン、`src/App.tsx:2180` の情報ダイアログの見出し | `BiimMotion について` | T7 で追加・変更 |

- `index.html` の description は製品名を含まない事実の文。favicon には代替テキストを持たせていない（`link rel="icon"` で、文字を含まない）。
- 完了の判定は旧表示文字列の**不在**で行う：`grep -rn "BiimMaker\|MOTION JOB STUDIO\|IDEAS DESERVE MOTION" index.html src README.md` が0件（T8b 時点で0件）。`BiimMotion` は `BiimMotionWebUI` の部分文字列なので、`grep "BiimMotion"` では判定できない。
- 識別子として残るもの：`README.md` の `--base=/BiimMotionWebUI/`、repo 名 `BiimMotionWebUI` と Pages の URL、`package.json` の name、`.github/workflows/pages.yml`。

### 4.5 favicon

`index.html` の `link rel="icon"` に、SVG のデータ URI（`type="image/svg+xml"`）で置く。画像ファイルは置かない。

- 図柄：Biim 枠の構成（主映像、右上と右下のノート、2行の字幕）を、ファミリーのアイコンの様式で描いたもの。
- 様式：`viewBox="0 0 16 16"`、`shape-rendering='crispEdges'`、整数座標の 1px の矩形だけ（アンチエイリアスなし）。輪郭は ink の 1px、内容は座標 1〜14。
- 色：アイコンの11色パレットのうち **ink `#0B2A3A`・trace-soft `#BFEFF9`・trace `#19C3E6`・white `#FFFFFF` の4色**。Biim 枠の黒と灰色はパレットに無いので、黒地を ink、灰色の枠線を trace-soft に置き換えた。
- favicon の色はトークンを参照できないため、`index.html` に直値で書く（§5 の例外）。

## 5. 禁止リスト

- 影（`box-shadow`・`text-shadow`・`filter: drop-shadow`）、グラデーション、ぼかし（`blur`・`backdrop-filter`）、半透明の重ね。例外：ファイル入力を覆う透明な `<input type=file>`（`opacity: 0`、覆い構造の維持のため）。
- `src/style.css` の `:root` ブロック以外への色の直値（`#…`・`rgb(`・`hsl(`・色名・`transparent`）。シェルの色はトークン（`--cs-*`／`--ui-*`）経由だけ。Biim 枠モチーフの色は `--biim-*` 経由だけ。例外：`index.html` の `theme-color`（`--cs-board` と同じ値）と favicon の4色（§4.5）は HTML の都合で直値を書く。`src/App.tsx` で要素に渡す字幕色（利用者のデータ）は対象外。
- シェルの地色・枠線に Biim 枠の色（`--biim-*`）を使うこと。
- `src/App.tsx` の SVG（レイアウト図など）に `fill`・`stroke` の色の直値を書くこと。色は CSS のトークンで塗る。
- 意味を持たない装飾：飾りのアイコン、飾りの英語見出し・英語ラベル、キャッチコピー、何も操作できないタグ（現在値のタグ・runtime のタグを含む）、見出し用の飾り領域。アイコンは §2.1 の写しだけを文字ラベルと併記する。記号は完了の印 ✓ だけ。
- 角丸（入力欄・パネル・ボタンとも0。形はファミリーの切り欠きで表す）。
- 12px 未満の文字、em／rem による文字サイズ。
- `transition`・`animation`（§3）。
- 外部 CDN からのフォント・アイコン・スタイルの取得、依存パッケージの追加。
- 制作者を特定のモデル名で呼ぶこと。表示上は「制作エージェント」と呼ぶ。

## 6. 保持する接続点（UI 監査 §(3) の4〜7）

- セクションの `id`（`concept`／`sources`／`direction`／`character`／`voice`）：目次のアンカーと現在地判定に使う。現在地判定（`IntersectionObserver`、上 100px の余白）と合うよう、目次から移動した見出しの上端は 96px（`scroll-padding-top: calc(var(--bar-h) + 52px)`。650px 以下は 8px）。
- `role=tab/tabpanel`・`aria-selected`・`aria-expanded/aria-controls`・エラー領域の `role=alert` とフォーカス移動。
- ファイル入力の覆い構造（`.file-button` の中の透明な `<input type=file>`、`:focus-within` の輪郭）。
- `isMV` による表示・必須条件の分岐。

## 7. 草稿からの決着（T7 で完了したもの）

草稿（T6）で T7 へ持ち越した項目は、すべて T7 で決着した。未完の必須条件は残っていない。

| 草稿の持ち越し | 決着 |
| --- | --- |
| 文言の全面改稿（英語の飾りラベル、`Ideas in motion.` など） | 英語の飾りラベル・キャッチコピー・誘導文を全廃し、「何が・どこに保存され・制作で何に使われるか」の事実の文に置き換えた（§5） |
| 装飾アイコン（自前 SVG の `Icon`）、`♫`・`+`/`−` の扱い | `Icon` 部品と記号を廃止し、ファミリーのピクセルアイコンを文字ラベルと併記（§2.1）。記号は ✓ だけ |
| favicon | ファミリーのピクセル様式で Biim 枠の構成を描いた（§4.5） |
| 字幕書体の実フォント読み込み | `@font-face`（`BiimMotion Caption`）と `font-display: swap` で同梱の M PLUS Rounded 1c ExtraBold を読む（§4.2） |
| 右下ノートの補足（失敗パターン・ゴースト検査結果）をタブに含めるか | タブは3つのまま。補足は3タブの下に並べる（§4.1） |
| UI-11 全機能の操作確認、コントラスト比の計算表、Tab 順の記録 | `docs/work/2026-11-13-explainer-ui-harness/tasks/T7/UI-V7-CHECK.md` に記録（結果の要約は `VERIFICATION.md`） |
