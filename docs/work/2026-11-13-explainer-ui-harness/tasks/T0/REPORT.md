# REPORT — T0 作業基盤と刷新前記録

- 作業ID: `2026-11-13-explainer-ui-harness`／タスク: T0／ブランチ: `task/T0-base`（push していない）
- 実装者: L3 実働 A（Claude Code 非対話セッション、Opus 5.5 / effort medium）
- `<BASE>` = `2a7d209`
- 判定: **本書は実装者の提出記録であり、合否判定ではない**（G3 は L2）。

## 1. 起動時チェック（計画書 §8.1）

| 項目 | 結果 |
| --- | --- |
| 層 | L3 実働 A（DIRECTION.md による） |
| エージェント製品／モデル／effort | Claude Code（非対話）／`claude-opus-5-5`／medium |
| サブエージェント | 起動可能（Agent ツールあり）。本タスクでは使っていない（L4 下請けなし） |
| コマンド実行 | 可（Git Bash と PowerShell） |
| 対話 | 不可（非対話実行。質問は発生しなかった） |
| ネットワーク | `npm ci` 成功（npm レジストリに到達可）。Pages（`https://kokuren333.github.io/BiimMotionWebUI/`）は HTTP 200 を確認（中身の閲覧はしていない） |
| ヘッドレス Chrome | 可。`Chrome/157.0.8103.40`（`--headless=new`） |
| Node | `node -v` = **v24.15.0**。`package.json` に `engines` フィールドは無い（制約なし）。Node 24 は組み込み `WebSocket` と `zlib.crc32` を持つので撮影スクリプトの前提を満たす |
| Aivis／GPU | 本タスクでは不要（未確認） |
| `node_modules/` | worktree に無かったため `npm ci` を実行（`package.json`・`package-lock.json` は変化なし） |

**縮退レベル: 0（標準）**。理由：コマンド実行・ネットワーク・ヘッドレス Chrome がすべて使え、レビュー（G3）は L2 が別コンテキストで行う。自己判定になるゲート：なし。
注記：`ENVIRONMENT.md` は本タスクの「触らない範囲」なので追記していない。L2 が本節を転記すること。

## 2. 変更したファイル

| コミット | ファイル |
| --- | --- |
| #2 `Ignore local agent workspace and add dependency-free UI screenshot script` | `.gitignore`（`.agent-work/` を追加）、`tools/ui-shots.mjs`（新設） |
| #3 `Record audits and pre-redesign UI screenshots` | `docs/work/2026-11-13-explainer-ui-harness/audits/`（3ファイル）、`docs/work/2026-11-13-explainer-ui-harness/screenshots/before/`（8ファイル）、本 `tasks/T0/REPORT.md` |

`tasks/T0`・`tasks/T1`・`tasks/T2` の各フォルダは L2 の発注コミット `bff59c6` で既に存在することを確認した（各 `DIRECTION.md`）。新たに作るものは無かった。

## 3. 完了条件ごとの証拠

### 3.1 `.agent-work/` が無視される

```
$ git check-ignore .agent-work/PM_BRIEF.md
.agent-work/PM_BRIEF.md
```

### 3.2 監査3本の写し（追跡され、C-6 に掛からない）

```
$ ls docs/work/2026-11-13-explainer-ui-harness/audits
audit-explainer.md
audit-space.md
audit-ui.md
```

写しの元はメインのチェックアウトの `.agent-work/audit-*.md`（読むだけで変更していない）。元との差分は次の3行だけ（ローカルパス・ホームディレクトリ表記の除去）。

| ファイル | 行 | 元 | 写し |
| --- | --- | --- | --- |
| `audit-explainer.md` | 3 | 対象にホームディレクトリ以下の監査用クローンのパス | 「監査用クローン（ローカルパスは写しでは省略。…）」 |
| `audit-space.md` | 3 | 対象にホームディレクトリ以下のスペースソースのパス | 「（監査者環境上のパスは写しでは省略）」 |
| `audit-space.md` | 107 | PC のデスクトップ以下のフォルダパス | `kokuren_future` のフォルダ名だけ |

`audit-ui.md` は無変更の写し。GitHub の公開 repo 名（`kokuren333/BiimMotionWebUI`）は公開情報なので残した。Q6（作業記録の公開可否）は未回答のため要件書の既定「含める」で進め、スペース監査の写しも含めた。

### 3.3 S1〜S8 の8枚

保存先：`docs/work/2026-11-13-explainer-ui-harness/screenshots/before/`

| # | ファイル | 条件（要件書 §3.4）と撮った状態 |
| --- | --- | --- |
| S1 | `S1-explainer-initial-1440.png` | 1440×900、解説モード、初期状態（ページ先頭） |
| S2 | `S2-explainer-sample-direction-1440.png` | 1440×900、「30秒のサンプルを入力」を押した後、03（デザイン方向性）の見出しを上端に置いた位置。現行の解説モードには方向性のたたき台が無い（要件書 F8）ため、たたき台に相当する位置として 03 付近を撮った |
| S3 | `S3-mv-filled-1440.png` | 1440×900、MV モードに切り替え、タイトル・表現したいこと・視聴者・曲の雰囲気・歌詞（見出し付き11行）・テスト用 WAV（30秒）を入力。方向性のたたき台（案 A〜C）と右列の準備度（5/6 完了、完成音源 30.0秒、歌詞 6行）が写る位置 |
| S4 | `S4-required-missing-error-1440.png` | 1440×900、初期状態で「Motion Job ZIPを生成」を押し、右列のエラー一覧（タイトル・説明・視聴者の3件）が見える位置 |
| S5 | `S5-ghost-check-loaded-1440.png` | 1440×900、テスト用 ghost-check JSON と静止画 PNG 4枚を「検査結果を開く」で読み込み、判定文・件数・ワーストフレーム・静止画が見える位置 |
| S6 | `S6-info-dialog-1440.png` | 1440×900、「このスタジオについて」で情報ダイアログを開いた状態 |
| S7 | `S7-explainer-390.png` | 390×844（モバイル・タッチ有効）、解説モード、初期状態 |
| S8 | `S8-mv-390.png` | 390×844、S3 と同じ MV 入力をした後のページ先頭 |

```
$ ls docs/work/2026-11-13-explainer-ui-harness/screenshots/before | wc -l
8
```

撮影時の `document.documentElement.scrollWidth` はすべてビューポート幅と一致（1440 または 390。横スクロールなし）。

既知の限界（L2 の判断材料）：
- S3 で、歌詞統計（`.lyric-stats`、01 の歌詞欄の下）は、たたき台と同じ 900px の画面に入らないため写っていない。準備度の「歌詞 6行」は写っている。8枚の枠を守るため追加の1枚は撮っていない。
- スクリーンショットはビューポート分だけ（フルページではない）。
- S3・S8 のたたき台の組み合わせは乱数の種で変わるので、撮り直すと内容が変わりうる。

### 3.4 撮影手順（再現手順）

前提：Node 22 以上（組み込み `WebSocket` と `zlib.crc32` を使う。今回は v24.15.0）、Chrome か Chromium か Edge。依存パッケージの追加は不要。

```sh
npm ci
# Git Bash では MSYS のパス変換で --base が Windows パスに書き換わるので MSYS_NO_PATHCONV=1 を付ける
MSYS_NO_PATHCONV=1 npm run build -- --base=/BiimMotionWebUI/
node tools/ui-shots.mjs --out=docs/work/2026-11-13-explainer-ui-harness/screenshots/before
```

- 実行時の出力（今回）：
  ```
  Node v24.15.0 / Chrome/157.0.8103.40 / http://127.0.0.1:<port>/BiimMotionWebUI/
  S1 S1-explainer-initial-1440.png (1440x900, scrollWidth 1440)
  S2 S2-explainer-sample-direction-1440.png (1440x900, scrollWidth 1440)
  S3 S3-mv-filled-1440.png (1440x900, scrollWidth 1440)
  S4 S4-required-missing-error-1440.png (1440x900, scrollWidth 1440)
  S5 S5-ghost-check-loaded-1440.png (1440x900, scrollWidth 1440)
  S6 S6-info-dialog-1440.png (1440x900, scrollWidth 1440)
  S7 S7-explainer-390.png (390x844, scrollWidth 390)
  S8 S8-mv-390.png (390x844, scrollWidth 390)
  ```
- オプション：`--only=S1,S5`（一部だけ撮る）、`--chrome=<実行ファイル>` または環境変数 `CHROME_PATH`、`--dist=`、`--base=`。
- スクリプトの動作：`dist/` を `/BiimMotionWebUI/` 配下で `node:http` により 127.0.0.1 の空きポートで配信 → Chrome を `--headless=new --remote-debugging-port=0` と一時プロファイルで起動 → 組み込み `WebSocket` で CDP に接続 → ショットごとに新しいブラウザコンテキスト（保存領域を共有しない）を作り、`Emulation.setDeviceMetricsOverride` で寸法を決め、入力は React の制御部品に値を設定して `input`／`change` を発火、ファイルは `DOM.setFileInputFiles` で渡し、フォント読み込み完了と2フレーム待ってから `Page.captureScreenshot`。
- ビルドが別の base で作られていると資産を読めないので、スクリプトは `dist/index.html` が `"/BiimMotionWebUI/assets/` を参照しているかを先に確かめ、違えば理由を出して終了する（今回 Git Bash で最初にこの問題に当たった）。
- セレクタは刷新前の DOM 用（`.download-button`、`.sample-button`、`.direction-lab`、`.ghost-check-viewer`、`aria-label` 等）。T7 で更新する前提。

### 3.5 S5 用テスト ghost-check JSON の作り方

`tools/ui-shots.mjs` の定数 `ghostFixture` がそれで、実行のたびに OS の一時フォルダへ `ghost-check-preview.json` として書き出す（repo には置かない。撮影後に一時フォルダごと削除）。中身は `src/job.ts` の `parseGhostCheckReport` が読む形：

- `kind: "biim-ghost-check"`、`video: "out/preview.mp4"`、`fps: 30`、`frames: 900`、`duration: "30.00s"`
- `counts`：1フレーム検出 4、孤立 1、連続クラスタ 1 ラン（3 件）
- `isolated`：frame 214（7.13s、6 タイル）／`clustered`：frame 480〜486（16.00〜16.20s、3 件、最大 12 タイル）
- `worst`：frame 482、frame 214
- `stills`：frame 214（isolated）と frame 482（clustered）に各2枚（`ghost-stills/f00214-prev.png` 等）

静止画 PNG 4枚（160×90 の単色、暗い灰／明るい灰）は同じスクリプトが `node:zlib` で生成して一緒に読み込ませる。孤立が 1 件あるので判定文は「要注意：孤立フラッシュ 1 件…」になる（S5 に写っている）。S3・S8 で使う音源も同様に一時フォルダへ生成する 30 秒・8 kHz・モノラルの無音 WAV。

### 3.6 `package.json` の差分なし

```
$ git diff --exit-code 955fa5c -- package.json
（出力なし、終了コード 0）
```

## 4. 共通完了条件（計画書 §5.0）

各コマンドは #3 のコミット後に再実行した結果。

| 条件 | 結果 |
| --- | --- |
| C-1 `npm test` | 合格：tests 29／pass 29／fail 0 |
| C-2 `npm run build -- --base=/BiimMotionWebUI/` | 合格（`✓ built`。Vite の 500 kB 超チャンク警告は既存のもので失敗ではない）。Git Bash では `MSYS_NO_PATHCONV=1` を付けて実行した。付けないとビルド自体は通るが資産パスが壊れる（§3.4） |
| C-3 `git diff --check 2a7d209...HEAD` | 出力なし |
| C-4 MV 非退行 | `git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts` 出力なし・終了コード 0。`git diff -U0 955fa5c -- tests/job.test.ts \| grep '^-[^-]'` 出力なし。`npm test` で MV 5件・ghost・imagegen を含む全 29 件が合格 |
| C-5 触らない範囲 | `git diff --stat 2a7d209...HEAD` の一覧は §4.1 のとおり。`src/`・`job-template/`・`tests/`・`index.html`・`package.json`・`docs/requirements/`・`PLAN.md` ほか指定ファイル・`tasks/T1/`・`tasks/T2/` に変更は無い。一覧中の `tasks/T0/DIRECTION.md`・`tasks/T1/DIRECTION.md`・`tasks/T2/DIRECTION.md` は L2 の発注コミット `bff59c6` の分で、本タスクのコミット（#2・#3）は触れていない |
| C-6 | 計画書 §5.0 の C-6 の2コマンドを `2a7d209...HEAD` で実行：どちらも出力なし（経緯は §4.2） |
| C-7 | `node_modules/`・`package-lock.json`・`.verification/` の中身は読んでいない（`npm ci` は実行したが内容は読んでいない）。`dist/` は自分が `npm run build` で生成し直したもので、撮影スクリプトの配信元として使い、資産パスの確認のため `dist/index.html` の `src=`／`href=` 属性だけを grep した（ファイル全体は読んでいない）。既存の中身ではない |
| C-8 | 計画を変えていないので対象外（参考：`cmp` は一致） |

### 4.1 `git diff --stat 2a7d209...HEAD` のファイル一覧

```
 .gitignore                                         |   1 +
 .../audits/audit-explainer.md                      |  55 +++
 .../audits/audit-space.md                          | 307 ++++++++++++
 .../audits/audit-ui.md                             | 164 ++++++
 .../before/S1-explainer-initial-1440.png           | Bin
 .../before/S2-explainer-sample-direction-1440.png  | Bin
 .../screenshots/before/S3-mv-filled-1440.png       | Bin
 .../before/S4-required-missing-error-1440.png      | Bin
 .../before/S5-ghost-check-loaded-1440.png          | Bin
 .../screenshots/before/S6-info-dialog-1440.png     | Bin
 .../screenshots/before/S7-explainer-390.png        | Bin
 .../screenshots/before/S8-mv-390.png               | Bin
 .../tasks/T0/DIRECTION.md                          |  （L2 の発注コミット）
 .../tasks/T0/REPORT.md                             |  本書
 .../tasks/T1/DIRECTION.md                          |  （L2 の発注コミット）
 .../tasks/T2/DIRECTION.md                          |  （L2 の発注コミット）
 tools/ui-shots.mjs                                 |  新設
```

（行数・バイト数は撮り直しや本書の編集で変わるので省略した。ファイル一覧はレビュー者が `git diff --stat 2a7d209...HEAD` で再確認すること。）

### 4.2 C-6 2本目の一致

一致なし（出力なし）。1本目も出力なし。

初回の確認では、1本目が `tools/ui-shots.mjs` の2行（エラー文の「start:」の直後の改行エスケープと、DevTools の接続先 URL を取る正規表現の「ws:」の直後のエスケープ）に一致した。どちらもローカルパスではない誤検出だが、「空であること」を満たすために書き方を変え、未 push の自分のコミット #2 を `--amend` で直した（既存の履歴＝`bff59c6` 以前には触れていない）。

## 5. 未検証・申し送り

- 公開 Pages での撮影（CP-P）は本タスクの範囲外。撮影はローカル配信のみ。
- `ENVIRONMENT.md` への起動記録の転記（§1）は L2 に依頼する。
- S3 の歌詞統計が画面外である点（§3.3）を L2 が許容するか判断すること。許容しない場合は S3 の位置を `.lyric-stats` 基準にするか、追加ショットを計画に足す必要がある。
