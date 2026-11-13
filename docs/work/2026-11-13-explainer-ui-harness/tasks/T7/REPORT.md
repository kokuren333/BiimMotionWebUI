# REPORT — T7 UI 刷新 第2段（全面適用）

- 作業ID: `2026-11-13-explainer-ui-harness`
- ブランチ: `task/T7-ui-full`（`<BASE>` = `15dbbb4`）。push していない
- 実装者: L3 実働 A（Claude Code、Opus 5.5、非対話セッション）
- **合否判定はしていない**。以下の自己実行は証拠の提示である（G3 は L2 と実働 B の交差レビュー）

## 1. 着手条件と起動時チェック（計画書 §8.1）

- 着手条件：T6 の G3 は `tasks/T6/G3-REVIEW.md` で PASS。worktree は `BiimMakerWebUI-wt/T7`、ブランチは `task/T7-ui-full`、先端は L2 の発注コミット `6ddd7bf`（`<BASE>` の次）であることを確認してから始めた

| 項目 | 結果 |
| --- | --- |
| 層 | L3 実働 A（DIRECTION.md の指定） |
| エージェント製品・モデル・effort | Claude Code 2.1.319、`claude-opus-5-5`、effort medium（DIRECTION の指定。effort の実値は実行環境から読めないため指定値を記録） |
| サブエージェント | 使用可。**使っていない**（文言の置換・撮影・操作確認とも自分で実行した） |
| コマンド実行 | 可（Git Bash、Node v24.15.0）。worktree に `node_modules` が無かったので `npm ci` を実行 |
| 対話 | 不可（非対話セッション）。判断は §8、質問は §9 に非ブロッキングで記録 |
| ネットワーク | 可（`npm ci` が成功） |
| ヘッドレス Chrome | 可（`Chrome/157.0.8103.40`） |

**縮退レベル: 0（標準）**。理由：コマンド実行・ネットワーク・ヘッドレス Chrome が使え、G3 は別コンテキスト（L2 と実働 B）で行う。自己判定になるゲート：なし。

## 2. 全面適用の概要

### UI-01〜17 で本タスクが完成させたもの

| 項目 | 本タスクでしたこと |
| --- | --- |
| UI-01 骨格 | T6 の4領域を引き継ぎ、右上ノートを右カラムの高さの 46% に固定し（T6 は内容に合わせて最大 55%）、右下ノートを広げた。モードで右上ノートの高さが変わらないようにするため（UI-14） |
| UI-02 目次 | 目次の番号の色をコントラストの基準に合わせ（§4）、目次のリンクで移動したときに現在地の印が移動先と一致するよう余白を直した（`5f46d28`、UI-V7-CHECK §6 の注） |
| UI-03／Amendment 03 色 | `src/style.css` 全面書き換え。色は `:root` の `--cs-*`・`--ui-*`・`--biim-*` の写しだけ。App.tsx のレイアウト図の SVG に残っていた緑系の直値（`fill`・`stroke` の8色）を消し、CSS のトークンで塗るようにした |
| UI-04 字幕帯 | 字幕書体を実際に読み込むようにした（`public/job-assets/fonts/MPLUSRounded1c-ExtraBold.ttf` を `@font-face`、`font-display: swap`）。エラーの要約が出ている間は字幕帯が伸び（最大 50vh）、全件が見える |
| UI-05 形 | 角丸 0、影・グラデーション・ぼかし・半透明なし（ファイル入力の覆いの `opacity: 0` のみ） |
| UI-06 文字 | 文字の大きさはすべて px、最小 12px、本文 14px・行間 1.5。レイアウト図の 4〜5px の飾り文字（`SCENE / 01`、`POINT` 等）は図形に置き換えて廃止 |
| UI-07 文言 | §2.2 |
| UI-08 アイコン | 自作の線画アイコン 12 種（`Icon` 部品）と `♫`・`↗`・`+`/`−` を廃止。操作にはファミリーのピクセルアイコンを文字ラベルと並べて置いた（§5）。記号は完了の印 ✓ だけ |
| UI-09 動き | `transition`・`animation` なし（UI-V7-CHECK §7） |
| UI-10 名称 | 情報ダイアログの見出し・本文とアプリバーのボタンも `BiimMotion` にした（§8-3）。favicon（§2.4） |
| UI-11 機能 | すべて操作して確認（UI-V7-CHECK §1・§2） |
| UI-12 冒頭 | 01 の飾りの導入文を削除。1440×900 で5項目が字幕帯より上（S1、UI-V7-CHECK §3） |
| UI-13 常時表示 | S1-scrolled で記録。本文の下端の余白を直し、最下部で右カラムが 10px 押し上がる現象をなくした |
| UI-14 両モード | 解説と MV で4領域の位置と寸法が一致（UI-V7-CHECK §3） |
| UI-15 狭い画面 | 920px 以下で縦積み・字幕帯固定、390px で横スクロールなし。650px 以下では目次を固定しない（折り返した目次が画面を覆うため） |
| UI-16 アクセシビリティ | コントラスト表、Tab 順、`aria-*`・`role` の数（UI-V7-CHECK §4〜§6） |
| UI-17 依存 | 追加なし |

### 2.2 文言の入れ替えの範囲（UI-07）

- 英語の飾りラベルを全廃：セクションの `CONCEPT`〜`VOICE & OUTPUT`（`sections` の `caption` ごと削除）、`ADVANCED`、`GHOST CHECK`、`ABOUT THE STUDIO`、レイアウト図の `SCENE / 01`・`Ideas in motion.`・`POINT`・`CONTEXT`、飾りタグ（`Full screen`／`Biim layout`、`Motion graphics`、`Lyric typography`／`3D character`）、runtime タグ（`Remotion`、`React Three Fiber`、`Aivis`／`Music Video`）
- キャッチコピーと誘導文を全廃：「まずは、動画のゴールを決めましょう。」「説明の根拠と、動画全体へのリクエストを。」「細部を決めすぎず、目指す雰囲気を伝えます。」「3Dキャラクターを、説明を支える演者に。」「声と、最終的な動画の仕様を設定します。」「演出の強さと調査方針。数値でシーンを縛らず…」「まだ名前のない、次の動画。」「ZIPを展開して、Opusへ。」「展開したフォルダを開き、この指示を渡すだけ。」「動画制作のための、小さな出発点。」
- 置き換えた説明は「何が・どこに保存され・制作で何に使われるか」の事実で書いた。保存先は `src/job.ts` の `createProject`・ブリーフ生成・ZIP 生成を読んで確かめた（例：理解ゴール →「brief.md の『理解ゴール』と project.json の direction.takeaway」、歌詞 →「plan/lyrics.txt と brief.md」、資料 →「ZIP の sources/」、GLB →「assets/character.glb（2人目は assets/character2.glb）」）
- 制作者の呼称を「制作エージェント」に統一（`Opus` の表示は0件）。`Motion Job ZIP` は「ジョブのZIP」に。単位の `sec`・`files`・`URLs` を「秒」「件」に
- ハンドラ内の文字列も2つ変えた（ロジックは不変）：`submit` の成功メッセージ（「…展開したフォルダを制作エージェントに渡してください。」）と、`copyPrompt` の失敗メッセージ（指示文の位置を「右下の『制作エージェントへの指示』」に訂正。刷新後は指示文が字幕帯の「下」に無いため）
- `index.html` の description を事実の文に変更

### 2.3 様式モード選択の配置（AM-2 の5）

- 位置：03 デザイン方向性の導入文の直後、最初の入力として置いた（T5 の配線位置のまま）
- 見た目：`select` の下に、4様式（Biim 形式／アニメ解説／モーション解説／混在）すべての平易な説明を一覧で表示し、選択中の行を枠と「選択中」の印で示す。Biim の行に「既定」の印。縦向きでは混在の行に「（縦向きでは選べません）」。選んだ様式が `project.json` の `direction.style_mode` と制作エージェントへの指示に入ることを注記
- 右上ノートに「様式」の行を足した（解説のみ）
- 選択のロジック（`switchStyleMode` の呼び出し、`disabled` の条件、既定値）は変えていない

### 2.4 favicon

Biim 枠の構成（主映像、右上と右下のノート、2行の字幕）を、ファミリーのアイコンの様式（16×16、輪郭は ink の 1px、内容は座標 1〜14、アンチエイリアスなし）で描いた。色はアイコンの11色パレットのうち ink `#0B2A3A`・trace-soft `#BFEFF9`・trace `#19C3E6`・white `#FFFFFF` の4色。`index.html` に SVG のデータ URI（`shape-rendering='crispEdges'`）で置いた。Biim 枠の黒と灰色はパレットに無いので、黒地を ink、灰色の枠線を trace-soft に置き換えた。

## 3. UI-C1〜C5 の自己実行結果

すべて `5f46d28`（UI に関わる最後のコミット）以降の作業ツリーで、DIRECTION の検証コマンドを Git Bash でそのまま実行した。

| 検査 | コマンド（DIRECTION の転記どおり） | 出力 |
| --- | --- | --- |
| UI-C1 英語ラベル等 | 1つ目の `grep -nE "MOTION JOB STUDIO\|WORKSPACE\|…\|Opus" src/App.tsx index.html` | **出力なし**（0件） |
| UI-C1 コピー | 2つ目の `grep -nE "伝えたいことを\|…\|細部を決めすぎず" …` | 出力なし |
| UI-C2 影等 | `grep -nE "box-shadow\|gradient\|blur" src/style.css` | 出力なし（先頭コメントの言い回しも一致しないよう変えた） |
| UI-C2 角丸 | `grep -noE "border(-[a-z]+)*-radius:…" … \| grep -vE …` | 出力なし（`border-radius: 0` だけ） |
| UI-C2 12px 未満 | `grep -nE "font(-size)?:[^;]*(^\|[^0-9.])([0-9]\|1[01])(\.[0-9]+)?px" src/style.css` | 出力なし |
| UI-C2 em／rem | `grep -nE "font(-size)?:[^;]*[0-9.]+r?em\b" src/style.css` | 出力なし |
| UI-C3 書体 | `grep -nE "Inter\|Georgia" src/style.css index.html` | 出力なし |
| UI-C3 外部参照 | `grep -nE "(href\|src)=[\"']https?://\|@import\|url\([\"']?https?://" src/style.css index.html` | 出力なし（`@font-face` の `url()` は同じサイトの `/job-assets/fonts/…`。favicon の SVG の `xmlns` は `href="data:…"` の中） |
| UI-C4 依存 | `git diff 955fa5c -- package.json` | 出力なし |
| UI-C5 | `npm test`、`npm run build -- --base=/BiimMotionWebUI/` | tests 72・pass 72・fail 0。ビルド成功（チャンクサイズの警告のみ、従来から） |

色の点検（Amendment 03 の読み替え）：`awk` で `src/style.css` を `:root` ブロックとそれ以外に分け、それ以外から `#…`・`rgb(`・`hsl(`・色名・`transparent`・`currentColor` を検索した。一致は先頭コメントのテーマ名「Circuit White」と `white-space` だけで、色の直値は0件。`var(--…)` の参照先はすべて `:root` で定義済み（例外は App.tsx が要素に渡す利用者の字幕色 `--caption-color`／`--caption-alert-color`）。緑系の禁止は Amendment 03 により適用しない。App.tsx 側の色の直値はレイアウト図から消した（残るのは 03 の注記の文中の `#1e1e1e`・`#cccccc` という説明の文字列と、字幕色の既定値の参照）。

## 4. CP-A2

- 所在：`docs/work/2026-11-13-explainer-ui-harness/screenshots/after/`

| # | ファイル | 条件 |
| --- | --- | --- |
| S1 | `S1-explainer-initial-1440.png` | 1440×900、解説、初期状態 |
| S1-scrolled | `S1-scrolled-explainer-page-end-1440.png` | S1 を最下部までスクロール（UI-13） |
| S2 | `S2-explainer-sample-direction-1440.png` | 解説、サンプル入力後、方向性のたたき台 |
| S3 | `S3-mv-filled-1440.png` | MV、入力済み（歌詞統計・たたき台・準備度） |
| S4 | `S4-required-missing-error-1440.png` | 必須未入力で生成（エラー表示） |
| S5 | `S5-ghost-check-loaded-1440.png` | ゴースト検査結果を読み込んだ状態 |
| S6 | `S6-info-dialog-1440.png` | 情報ダイアログ |
| S7 | `S7-explainer-390.png` | 390×844、解説 |
| S8 | `S8-mv-390.png` | 390×844、MV |

- **Pages 用ビルドに対して撮った**：`5f46d28` の作業ツリーで `MSYS_NO_PATHCONV=1 npm run build -- --base=/BiimMotionWebUI/` を実行し、その `dist/` を `tools/ui-shots.mjs` が `/BiimMotionWebUI/` 配下で配信（スクリプトは `index.html` が `/BiimMotionWebUI/assets/` を読むことを確認してから撮る）。コマンド：`node tools/ui-shots.mjs --out=docs/work/2026-11-13-explainer-ui-harness/screenshots/after`。出力の `scrollWidth` は 1440 の各枚で 1440、390 の2枚で 390
- オーナーの判定は待っていない（記録点）。`VERIFICATION.md` への所在の記録は T8b の範囲なので、ここに書いた

## 5. 写したアイコン

正本：CyberSprite リポジトリの `gui/public/icons/`（無加工の写し、`public/icons/` へ）。意味は正本の設計データ `assets/ui/icons/tools/icon_grids.py` と README で確かめた。

| ファイル | 追加 | 使う場所（いずれも文字ラベルと併記、`alt=""`） |
| --- | --- | --- |
| `info.png` | T6 | アプリバー「BiimMotion について」 |
| `validate-ok.png` | T6 | 字幕帯の状態の一文（書き出せる） |
| `warning.png` | T6 | 字幕帯の状態の一文（不足がある） |
| `error.png` | T6 | 字幕帯のエラー要約の見出し |
| `folder.png` | **T7** | ファイルを選ぶ操作：「ファイルを選ぶ」「音源を選ぶ」（MV の完成音源・BGM）「モデルを選ぶ」「検査結果を開く」 |
| `sources.png` | **T7** | 02 のドロップ区域「参考資料をここにドロップ」 |
| `add.png` | **T7** | たたき台の「この案を追記」（MV・解説） |
| `remove.png` | **T7** | 添付の「削除」 |
| `settings.png` | **T7** | 「演出と調査の詳細」の開閉ボタン |
| `agent.png` | **T7** | 字幕帯の「指示をコピー」（制作エージェントへの指示） |

新しく描いたアイコンは favicon（§2.4）だけ。`public/icons/` には置かず、`index.html` のデータ URI にした。

## 6. C-1〜C-8

`<BASE>` = `15dbbb4`。最後のコミットの後に実行した結果。

| 条件 | 結果 |
| --- | --- |
| C-1 `npm test` | 合格（tests 72、pass 72、fail 0）。各コミットでも実行 |
| C-2 `npm run build -- --base=/BiimMotionWebUI/` | 合格（チャンクサイズの警告のみ）。各コミットでも実行 |
| C-3 `git diff --check 15dbbb4...HEAD` | 出力なし |
| C-4 MV 非退行 | `git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts` は差分なし。`git diff -U0 955fa5c -- tests/job.test.ts \| grep '^-[^-]'` は `-    12,` の1行（T5b の motion-kit 数。T6 の G3 で既存差分として解決済み。本タスクは `tests/` を変えていない） |
| C-5 触らない範囲 | `git diff --stat 15dbbb4...HEAD` に `src/job.ts`・`src/explainer-assist.ts`・`src/mv-assist.ts`・`src/templates.ts`・`job-template/`・`tests/`・`package.json`・`src/biim-standard.json` は無い。`tasks/T7/DIRECTION.md` の差分は L2 の発注コミット `6ddd7bf` のもの |
| C-6 絶対パス・メール・認証情報 | 1つ目の grep の一致は1件：`tasks/T7/DIRECTION.md` の、L2 が `6ddd7bf` で足した注記の行（角丸の検査コマンドの書き換えを説明する行で、正規表現の断片がドライブ文字のパターンに当たる誤検出。パスではない）。本タスクで追加した行には一致なし。2つ目の grep は一致なし |
| C-7 読まないもの | `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の中身は読んでいない。`dist/` はビルドで生成し、撮影と操作確認のスクリプトが配信しただけ（ブラウザの DOM と computed style を読んだ） |
| C-8 計画の写し | `cmp docs/work/2026-11-13-explainer-ui-harness/PLAN.md docs/requirements/ORCHESTRATION_PLAN.md` は一致、両ファイルとも本タスクの差分なし |

その他：`npx tsc -b` 合格。App.tsx の差分から `set…`・`use…`・`onClick`・`onChange`・`disabled`・`value=` を含む変更行を抽出し、ロジックの変更が無いことを確かめた（出てくるのは `Icon` の削除、`PixelIcon` の型、様式説明の一覧の `map` だけ）。

### 変更ファイルとコミット

| コミット | 内容 | ファイル |
| --- | --- | --- |
| `1e170b6` Replace decorative labels and copy with factual text | 文言のみ | `src/App.tsx`、`index.html` |
| `1b89cc0` Rewrite styles to the design rules | 見た目（CSS 全面書き換え、アイコン、様式説明の一覧、レイアウト図、字幕帯の伸長） | `src/style.css`、`src/App.tsx`、`public/icons/{folder,sources,add,remove,settings,agent}.png` |
| `13fcaa7` Show the music length in seconds in the subtitle band | 文言のみ（`sec` の取り残し） | `src/App.tsx` |
| `2b6a535` Draw the favicon as a pixel icon of the Biim frame motif | favicon | `index.html` |
| `6ed5798` Update screenshot selectors for the redesigned UI | 撮影スクリプト（S6 のセレクタ、S5 の右下ノート内スクロール、S1-scrolled の追加） | `tools/ui-shots.mjs` |
| `a57c169` Keep table-of-contents numbers at body-text contrast | 見た目（目次の番号の色） | `src/style.css` |
| `1bddf57` Use only token colours in the stylesheet body | 見た目（`transparent` をトークンに、コメントの言い回し） | `src/style.css` |
| `5f46d28` Land table-of-contents jumps where the current-section mark agrees | 見た目（スクロールの余白） | `src/style.css` |
| （次の2つ）Record post-redesign screenshots／Add the T7 report and UI-V7 check record | 記録 | `screenshots/after/` の9枚、`tasks/T7/{REPORT.md,UI-V7-CHECK.md,ui-v7-check.mjs,ui-v7-result.json}` |

## 7. UI-V7-CHECK の所在

`docs/work/2026-11-13-explainer-ui-harness/tasks/T7/UI-V7-CHECK.md`。操作に使ったスクリプト `ui-v7-check.mjs` と生の出力 `ui-v7-result.json` を同じフォルダに置いた。

## 8. 判断したこと（既定の判断で進めたもの）

1. **現在値のタグと runtime タグを削除した**：UI 監査 §(2) の8と17は「維持すべき機能」に挙げているが、要件書 3.1 は「何も操作できないタグ」を飾りの部品として除去対象にしている。要件書を優先し、同じ情報はレイアウト図の `aria-label`、右上ノート、情報ダイアログの文で読めるようにした。
2. **右下ノートの切り替えはタブ3つのまま**（T6 の判断を継続）。失敗パターンとゴースト検査結果をタブに入れると `preview` の状態の型を変えるロジック変更になる。タブの下に区切り線と見出しで並べた。
3. **情報ダイアログの `BiimMaker` を `BiimMotion` にした**：DESIGN 草稿 §4.4 では T8b に残していたが、本タスクで UI-07 によりダイアログの文を書き直すため、同時に直した。`README.md` の見出しは触っていない（T8b）。
4. **字幕書体を読み込んだ**：UI-04 の「実際の字幕と同じ様式」を満たすため、同梱の M PLUS Rounded 1c ExtraBold（約3.6MB）を `font-display: swap` で読む。初期表示は妨げない（OS の書体で先に描き、読み込み後に差し替え）。解説モードの字幕帯は初期表示から使うので、Pages の初回表示でこのファイルを取得する。Noto Sans JP（約9.6MB）は UI に使わない（シェルの書体はファミリーの `--font-ui`）。
5. **エラー表示中は字幕帯を伸ばす**：88px の固定では3件目以降が帯の中のスクロールに隠れていた。「全問題を列挙して直せる」（監査 §(2)-16）を保つため、`.errors` がある間だけ高さを最大 50vh にした（CSS の `:has()`）。その間は右カラムの下部に重なるが、入力すればエラーは消えて元に戻る。
6. **目次の番号と現在地の不具合を CSS で直した**：どちらも T6 の CSS が原因で、ロジック（`IntersectionObserver` の設定）は変えていない。
7. **650px 以下では目次を固定しない**：折り返した目次（3〜4行）が上端を覆い、移動先の見出しが隠れるため。
8. **アプリバーの「BiimMotion について」は T6 のまま、文字リンクの見た目**（`text-button`）にした。パッドにはしていない。
9. **操作確認のスクリプトを記録フォルダに置いた**：レビュー者が再実行できるようにするため。開発用のツールではなく記録として `tasks/T7/` に置き、`tools/` には足していない。

## 9. 質問（非ブロッキング）

- Q-T7-1：§8-1（現在値タグ・runtime タグの削除）は要件書 3.1 を優先した判断。監査の「維持すべき機能」と食い違うので確認したい。
- Q-T7-2：字幕様式の文字の塗りと白ふちのコントラスト（既定のキャラ2の赤 `#ff0000` と白で 4.00:1、エラー要約は 15px）。字幕色は利用者のデータで、UI-04 は出力映像と同じ見え方を求めている。同じ文は通常の DOM テキストとして読み上げられる。UI-16 の基準の対象外として扱ってよいか（UI-V7-CHECK §4）。
- Q-T7-3：`docs/DESIGN.md` は本タスクの対象外なので変えていない。草稿の次の記述は T7 後の実態とずれるので、T8b の確定時に直す必要がある：§2 のアイコン表（6点追加、「このスタジオについて」→「BiimMotion について」）、§4.1 の右上ノートの寸法（最大55% → 46% 固定）と 650px 以下の目次、§4.2 の字幕書体（`BiimMotion Caption` の `@font-face` で読み込む）、§4.3 のレイアウト図の極小文字（廃止）、§4.4 の #6（ダイアログの名称は T7 で変更済み）、§5 の favicon、§7 の持ち越し（T7 で消化）。
- Q-T7-4：`ui-v7-check.mjs` を `tasks/T7/` に置いた判断（§8-9）でよいか。不要なら記録から外す。
