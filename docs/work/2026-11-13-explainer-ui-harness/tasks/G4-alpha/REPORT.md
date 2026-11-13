# REPORT — G4-α 統合（第1波）

- 作業ID：`2026-11-13-explainer-ui-harness`／タスク：G4-α／層：L3 実働 A
- 本ファイルは作業記録であり、**合否判定はしない**（G3 は L2 が別コンテキストで行う）。

## 0. 起動時チェック（計画書 §8.1）

| 項目 | 結果 |
| --- | --- |
| 層 | L3 実働 A（`DIRECTION.md` による） |
| エージェント製品・モデル・effort | Claude Code（非対話セッション）／Opus 5.5（`claude-opus-5-5`）／medium |
| サブエージェント | 起動可能（Agent ツールあり。本タスクでは使っていない。L4 下請けなし） |
| コマンド実行 | 可（node v24.15.0、npm 11.12.1、git 2.54.0） |
| 対話 | 不可（非対話。質問は §7 に書き、既定の判断で進めた） |
| ネットワーク | 可（`npm ping` 応答あり、基準 worktree の `npm ci` とフィクスチャの `npm install` が成功）。Pages の閲覧は push 前のため対象外 |
| ヘッドレス Chrome | 可（Chrome・Edge の実行ファイルあり。Remotion の preview・still で headless shell を使用） |
| GPU レンダー | GPU あり（NVIDIA RTX 3080）。preview レンダーは成功（§3） |
| Aivis | 本タスクでは不要。未確認 |

- **縮退レベル：0（標準）**。理由：サブエージェント・コマンド実行・ネットワーク・Chrome・GPU がすべて使え、G3 は L2 が別コンテキストで行うため。
- **自己判定になるゲート：なし**。本セッションでは自分の成果物を合格と判定していない。

## 1. 統合したブランチとコミット

作業場所はメイン checkout の `feat/explainer-harness`（開始時 `7336589`＝`5814dc3` に G4-α の DIRECTION を足した L2 のコミット）。新規ブランチ・新規 worktree は作っていない（§3 の MV 差分検査用の一時 worktree を除く。検査後に削除済み）。`review/*` ブランチは統合していない。

| 順序 | ブランチ（先端） | マージコミット | 結果 | 直後の `npm test` | 直後の build |
| --- | --- | --- | --- | --- | --- |
| 1 | `task/T0-base`（`f4911a1`） | `4c95562` | 競合なし | 29 pass / 0 fail | exit 0 |
| 2 | `task/T2-harness-docs`（`b13758b`） | `7bf3240` | 競合なし | 29 / 0 | exit 0 |
| 3 | `task/T1-contract`（`8d8ba75`） | `bcf852a` | 競合なし | 29 / 0 | exit 0 |
| 4 | `task/T4-qc`（`5e38423`） | `040204c` | 競合なし | 54 / 0 | exit 0 |
| 5 | `task/T3-docs`（`759be8d`） | `a54749a` | 競合なし | 61 / 0 | exit 0 |
| 6 | `task/T5-webui`（`424bc75`） | `0d0127f` | add/add 競合3件を解決（下記） | 71 / 0 | exit 0 |
| 7 | `task/T5b-motion-kit`（`daece82`） | `b79c4a5` | 競合なし | 72 / 0 | exit 0 |
| 8 | `task/T5-shots`（`fe7efcb`） | `2e408e3` | add/add 競合4件を解決（下記） | 72 / 0 | exit 0 |
| 9 | `task/T8a-docs`（`726a8d7`） | `1cfe87e` | `VERIFICATION.md` の競合を解決（§2） | 72 / 0 | exit 0 |
| 10 | `task/T9a-handoff`（`ffda58c`） | `5bfc330` | 競合なし | 72 / 0 | exit 0 |

- 「already contained」（内容がすべて含まれていて空マージになる）ブランチは無かった。全10件をマージコミットで取り込んだ。
- G3 記録：T0・T2・T3・T5b・T5-4・T8a・T9a は各ブランチ内の G3 記録（`tasks/<T>/G3-REVIEW.md`）が入った。T1 は確定版 `8d8ba75` を取り込み、G3 再判定の記録は `review/T1-contract-r2` の `016aa9d`（PASS）を引用するだけとした。T4 は `review/T4-qc` の `6b9d34f`（PASS）、T5 は `review/T5-webui` の `0c78d81`（PASS）を引用するだけとした（いずれも波ブランチには入れていない）。
- 各マージ直後の build は Git Bash から実行した。Git Bash では MSYS のパス変換で `--base` が書き換わる可能性がある（T4・T8a の記録）ため、各段の build は「成功すること」の確認としてだけ扱う。指定 base の確認は §3 の C-2 を PowerShell で実行して行った。
- 1件目のマージは帰属行なしでコミットしたため、push 前のローカルコミットに対して `git commit --amend` でメッセージに帰属行を足した（内容は不変）。

### 競合の解決

- **6（T5）**：`job-template/runtime/scripts/caption-capacity.mjs`・`tests/qc.test.ts`・`tasks/T4/REPORT.md` の add/add。`task/T5-webui` は T4-1（`15b42a7`）の cherry-pick `fe51eb2` を持っており、T5 自身はこの3ファイルを変えていない（`git diff fe51eb2 424bc75 -- <3ファイル>` が空）。そこで G3 合格済みの T4 最終版（波ブランチ側）を採った。
- **8（T5-4）**：上の3ファイルは同じ理由で T4 最終版を採った（`git diff 70a83aa fe7efcb -- <3ファイル>` が空）。`tools/ui-shots.mjs` は T0 の版（`7519188`）に T5-4 が S2・S4 の撮影手順を足したもの（G3 合格済み）で、T0 側は以後変えていないので T5-4 の版を採った。
- **9（T8a）**：`VERIFICATION.md` の末尾追記どうしの競合。両方の節を残し、日付順（T4-1 の EX-17 節 → T8a の節）に並べた。どちらの本文も変えていない。
- T5b（7）は T3・T4・T5 の cherry-pick を含んでいたが、内容が同じため競合なしでマージされた。
- 統合後の内容確認：各タスクブランチが変えたファイルについて、統合後と各ブランチ先端との差分を取った。差があるのは、上記の解決どおりのファイル（T4 最終版を採った3ファイル、T5-4 版の `ui-shots.mjs`）と、複数タスクが追記した `README.md`（T2 の節と T8a の節の両方を含む）・`VERIFICATION.md` だけだった。
- 線引き（N1・N10・ゲートと助言）に関わる競合は無かった。

## 2. C-3 修正、ENVIRONMENT.md 集約、VERIFICATION.md

- **C-3**：統合後の `tests/qc.test.ts` は T4 最終版（T4-4 で末尾空行を除去済み）なので、`tests/qc.test.ts:47` の末尾空行は統合結果に存在しなかった。**ファイルは変更していない**（削除対象の空行が無い）。`git diff --check 2a7d209..HEAD` と `git diff --check 2a7d209...HEAD` は出力なし（exit 0）。
- **ENVIRONMENT.md**：§4「セッション起動記録」の表に T0・T2・T1・T4・T3・T5・T5b・T5-4・T8a・T9a の各 REPORT の起動時チェックを1行ずつ転記し、本セッション（G4-α）の行を足した（コミット `67c0706`）。T4・T5・T5b・T5-4 のモデルは各 REPORT の「指定値」をそのまま写した。
- **VERIFICATION.md**：
  - 競合は上記のとおり両節を残した。
  - CP-W1 の結果を新しい節「2026-11-14 CP-W1 追記（T5-4 の完了後、G4-α で追記）」として末尾に足した（所在 `docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1/`、8枚、S6 の motion-kit 数15。コミット `67c0706`）。T8a の節の本文（「予定」の記述）は G3 合格済みなので書き換えず、追記で結果を示した。
  - EX-17 の still 実測を節「2026-11-14 EX-17 字幕帯域係数の still 実測（G4-α、一部の配置のみ）」として足した（下記）。
- **README の motion-kit 数**：`job-template/motion-kit/` 直下の `.tsx` は統合後15個。README の「15個の小さなヘルパー」と一致。
- **スクリーンショット**：T0 の刷新前（`screenshots/before/`）は `task/T0-base` と差分なし（上書きなし）。T5-4 の8枚は `screenshots/wave1/` に入った。撮り直しはしていない。
- **EX-17 still 実測（一部）**：統合後の biim・anime フィクスチャの一時コピーに、無音 WAV と試験文字列の字幕クリップを `runtime/data/narration.json` へ差し込み、`npx remotion still … --scale=3` の画像で行数と1行の文字数を数えた。Biim 枠・キャラ左（規則 23×2＝46）と全画面・横（規則 32×1＝32）は、どちらも実測と一致（全角数字60字の改行位置、容量ちょうどの文字列と容量＋1字の文字列で確認）。係数・規則版（`1`）は変えていない。キャラ右・2人・キャラなし・縦、半角幅比率、読み上げ速度は未実測で T11 に持ち越す。差し込みは一時フォルダの中だけで、repo には入れていない。

## 3. §4 統合後の検証（波ブランチ）

| 検査 | コマンドと結果 |
| --- | --- |
| C-1 | `npm test`（PowerShell）：72 tests / 72 pass / 0 fail、exit 0 |
| C-2 | `npm run build -- --base=/BiimMotionWebUI/`（PowerShell）：`tsc -b && vite build --base=/BiimMotionWebUI/`、98 modules、exit 0（既存の chunk size 助言のみ）。自分で生成した `dist/index.html` に `/BiimMotionWebUI/assets` が含まれることを `Select-String -Quiet` で確認（内容は読んでいない） |
| C-3 | `git diff --check 2a7d209...HEAD`：出力なし |
| C-4 | `git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts`：exit 0。`git diff -U0 955fa5c -- tests/job.test.ts` の削除行は `-    12,` の1行だけ（対応する追加行は `+    15,`。T5b の motion-kit 計数） |
| C-5 | `git diff --stat 2a7d209...HEAD`：85 files（統合後・本 REPORT のコミット前）。本セッションが書いたのは `VERIFICATION.md`（追記のみ）・`ENVIRONMENT.md`（表への追記のみ）・本 REPORT だけ。`docs/requirements/` は差分なし。`reviews/G4-alpha.md` は作っていない |
| C-6 | 1つ目の grep：2件一致。①`tasks/G4-alpha/DIRECTION.md` のメイン checkout の絶対パス（L2 のコミット `7336589` で追加。本セッションは変更していない）、②`tasks/T0/G3-REVIEW.md` の、検査語（ドライブ文字つきのユーザーフォルダ名など）を列挙して「ヒットなし」と書いた行（誤検出）。2つ目の grep：一致なし |
| C-7 | `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の既存の中身は読み込んでいない。自分で生成したフィクスチャ・ビルドに対して `validate`・`qc`・`diff`・`cmp`・`Select-String -Quiet` を実行し、その出力だけを見た。EX-17 実測では自分で出した still 画像を見た |
| C-8 | `cmp PLAN.md docs/requirements/ORCHESTRATION_PLAN.md`：一致（exit 0）。計画は変えていない |

### MV 生成物の差分検査（計画書 §5.3）

OS の一時フォルダに `git worktree add --detach <一時>/base 955fa5c` → 基準側 `npm ci`（exit 0）→ `node --experimental-strip-types tools/make-fixture.ts --mv`（exit 0）。統合側 `node --experimental-strip-types tools/make-fixture.ts --mv --out=<一時>/head`（exit 0）。`git diff --no-index --stat`：17 files changed, 1121 insertions(+), 48 deletions(-)。

| 差分のあるファイル | 許容一覧の該当 |
| --- | --- |
| `AGENTS.md`、`README.md` | AGENTS.md（N1 の範囲）、job-template 側の README |
| `package.json`、`runtime/package.json`（各 +1） | `qc` スクリプトの追加 |
| `runtime/scripts/caption-capacity.mjs`・`caption-capacity.d.mts`・`qc.mjs`（新規）、`validate.mjs` | runtime/scripts の新規ファイルと validate.mjs |
| `plan/templates/` の5ファイル（新規） | plan/templates の新規ファイル |
| `motion-kit/DiagramStage.tsx`・`FullscreenStage.tsx`・`StandardCaption.tsx`（新規） | motion-kit の新規ファイル |
| `project.json`（1行） | `schema_version` のみ：`"0.3"` → `"0.4"` |

- 許容一覧の外の差分は無かった。`scenes/` は差分なし（`scenes/index.tsx` は `cmp` で一致）。
- `cmp brief.md`：一致（exit 0）。
- `git diff --no-index project.json`：`schema_version` の1行だけ。
- `job-template/AGENTS.md` の `955fa5c` からの削除行を確認した：MV 章の見出しと本文の行はすべて新しい AGENTS.md に残っている（見出しの段の変更と、ゴースト節の共通章への移動）。新ファイルに無い行は、旧「制作工程」の汎用手順1〜12と見出し「解説動画と共通の演出」で、T3 が解説章へ組み替えたもの（T3 の G3 の範囲）。MV の制作原則・工程の本文は削られていない。
- 基準 worktree は `git worktree remove --force` で削除した（`npm ci` と生成物で未追跡ファイルがあったため `--force`。自分で作った一時 worktree だけが対象）。`git worktree list` に残っていない。

### 解説フィクスチャ（T4 の検証コマンド、Git Bash）

| フィクスチャ | `npm install` | validate | qc | 出力 |
| --- | --- | --- | --- | --- |
| biim / pass | 0 | 0 | `--stage=pre` 0 | `QC pre: pass` |
| anime / pass | 0 | 0 | `--stage=pre` 0 | `QC pre: pass` |
| motion / pass | 0 | 0 | `--stage=pre` 0 | `QC pre: pass` |
| mixed / pass | 0 | 0 | `--stage=pre` 0 | `QC pre: pass` |
| mixed / fail-evidence | 0 | — | `--stage=pre` 1 | fail は PRE-3 だけ（`Verified claim needs resolvable source_ids: C01`） |
| mixed / fail-caption | 0 | — | `--stage=pre` 1 | fail は PRE-6 だけ（`Split oversized captions: s01-1 (46), s02-1 (32)`） |
| mixed / fail-review | 0 | — | `--stage=pre` 1 | fail は PRE-4 だけ（`Missing checked review line: PRE-4`） |
| mv | 0 | 0 | `npm run qc` 0 | 「この版に MV の規則は無い。MV は AGENTS.md の MV 制作工程に従う」。`reports/qc-pre.json` なし（`test ! -e` exit 0） |

- 作業上の事故：最初の実行で一時フォルダのパスを Windows 形式のまま heredoc に埋めたため、バックスラッシュが落ちて `--out` が repo 内の相対パス（`UsersnekomAppDataLocalTemp/`）になり、フィクスチャが repo 直下に生成された（未追跡、コミットなし）。そのフォルダを削除し、`cygpath -u` で直したパスで全件を再実行した。表は再実行の結果。

### preview レンダーと ghost-check（motion フィクスチャ1本）

- `npm run preview`：exit 0。180 フレーム（6秒）をレンダーし `output/preview.mp4`（261 kB）。初回に Remotion が headless shell をダウンロードした（ネットワーク可）。
- `npm run ghost-check -- --target=preview`：1回目は exit 1。PATH の `ffmpeg`（scoop の shim）が壊れていて（`current` リンクにアクセスできない）、スクリプトが Remotion 同梱の ffmpeg に切り替わり、その ffmpeg に `rawvideo` 出力が無いため失敗した（環境の問題。`ghost-check.mjs` は `955fa5c` から無変更）。スクリプトの既存の上書き手段 `FFMPEG_PATH` で scoop の実体（ffmpeg 9.0.2 essentials）を指定して再実行し、exit 0：`Scanned 180 frames of output/preview.mp4`、`Single-frame events: 0 (isolated 0, clustered 0 in 0 runs)`、`reports/ghost-check-preview.md`・`.json` を出力。
- 縮退なし（GPU・ネットワークとも使えた）。ffmpeg の件は §8 の縮退ではなく、このマシンの PATH 上の ffmpeg の問題として記録する（オーナー環境の修理はしていない）。

### UI-C4・C5（第1波は現行の見た目に配線を足しただけ）

- UI-C4：`package.json` は `2a7d209` から差分なし（`dependencies` 不変）。
- UI-C5：上記 C-1・C-2 のとおり。
- 見た目：`src/style.css`・`index.html`・`public/` は差分なし。`src/` の差分は `App.tsx`・`explainer-assist.ts`・`job.ts` の3つ。`App.tsx` で新たに付いた `className`（`axis-hints`・`candidate-card`・`candidate-grid`・`direction-lab`・`readiness` など11種）はすべて既存の `style.css` に定義があるクラスで、新しいスタイルは足していない。

### 受け入れ基準の照合（計画書 §7.2、G4-α の列）

| 基準 | 照合した根拠 |
| --- | --- |
| A1 | `job-template/AGENTS.md`：`## 解説動画モード`（95行）と `## 両モード共通` の `### レンダーゴースト…`（335行）。`tests/harness-docs.test.ts` の該当テストが合格 |
| A2 | `src/App.tsx` の解説支援入力・方向性候補・準備度。`tests/explainer.test.ts` 合格。CP-W1 の S2（`screenshots/wave1/`） |
| A3 | `tests/explainer.test.ts`「explainer ZIPs carry goals, exact outline, independent differentiation, style and full production guidance」合格 |
| A4 | `tests/qc.test.ts`（QC pre/post・CLI の終了コード）合格。上の解説フィクスチャ表 |
| A5 | `tests/qc.test.ts`「validate final <style> requires explainer design records and scopes note fields」合格 |
| A7 | C-4 と MV 生成物差分検査（上記） |
| A16 | `docs/work/2026-11-13-explainer-ui-harness/SPACE_HANDOFF.md`（T9a、G3 PASS） |
| A18 | `src/App.tsx` の様式モード選択、`tests/explainer.test.ts`（様式切り替え・mixed の検証）。`project.json`・brief の `style_mode` は ZIP のテストで表明 |
| A19 | `tests/qc.test.ts`（Biim 定数・note 欄の scope、mixed の Biim 区間）。上の4様式フィクスチャの pre 合格 |
| A20 | `job-template/motion-kit/` の3部品、`tests/job.test.ts`「non-Biim parts retain fullscreen captions…」合格。Biim 部品0件のジョブの validate 合格は T5b の記録（`tasks/T5b/verify-fixtures.mjs`） |
| A21 | `tests/explainer.test.ts`「400 seeds give each style mode at least 15 percent of all candidates」合格 |
| A22 | `SPACE_HANDOFF.md` §3.2（`style_mode`）と §5.3（非 Biim のハンドオフに Biim レイアウト指示を入れない規則、禁止語9語） |

上は照合の記録で、合否は判定しない。

## 4. main へのローカルマージと push 待ち

- マージコミット：`5e50308`「Merge feat/explainer-harness: explainer harness, QC and style modes」。親は `955fa5c`（main の元の先端）と `ef8cd96`（波ブランチの検証記録コミット）。マージコミット（no-ff）にした。
- 手順の補足：`git checkout main` の時点で `tasks/G4-alpha/DIRECTION.md` を Windows が削除できず（`unable to unlink … Invalid argument`。本セッションを起動した側がファイルを開いたままにしているとみられる）、`git merge --no-ff` がファイルを書き換える前に中止した（main は `955fa5c` のまま、変更なし）。残ったファイルの内容は波ブランチの blob（`0a7d415`）と同一だった。main が波ブランチの祖先であり、no-ff マージの結果のツリーは波ブランチのツリーそのものになるので、同じマージコミットを `git commit-tree "feat/explainer-harness^{tree}" -p main -p feat/explainer-harness` で作り、`git update-ref`（旧値 `955fa5c` を指定）で main を進めた。作業ツリーは `git reset --mixed` の後、ロックされたファイル以外を `git checkout --` で戻した。`git status` はクリーン。結果は通常の `git merge --no-ff` と同じ（2つの親、波ブランチと同一のツリー）。
- main 上での再検証（PowerShell）：
  - `npm ci`：exit 0（`package-lock.json` に変化なし）
  - `npm test`：72 tests / 72 pass / 0 fail、exit 0
  - `npm run build -- --base=/BiimMotionWebUI/`：98 modules、exit 0。`dist/index.html` に `/BiimMotionWebUI/assets` を含む（`Select-String -Quiet`）
  - Pages 用ビルド：`.github/workflows/pages.yml` は `npm ci` → `npm test` → `npm run build -- --base=/${{ github.event.repository.name }}/`。リポジトリ名は `BiimMotionWebUI`（`origin` の URL）なので、上の3コマンドがそのまま Pages 用ビルドの再現になる。すべて exit 0
- 本 REPORT の main マージ後の追記（この節以降）は、波ブランチを main に fast-forward してから波ブランチでコミットし、main をそのコミットへ fast-forward した。そのため main と `feat/explainer-harness` は同じコミットを指す（マージコミットの後に記録だけのコミットが1つ続く）。
- **push はしていない。** GitHub 認証ブロッカー（Git Credential Manager の対話認証待ち）のため、`git push`・`gh pr create`・`gh pr merge` は行っていない。main は `origin/main` より先に進んだローカル状態（main マージ済み・push 待ち）。
- **Pages の表示確認（公開後確認①）は push 後のオーナー作業**として残す。計画書 §6.3 の手順（`gh run watch` で build・deploy の成功を確認し、`tools/ui-shots.mjs --url=https://kokuren333.github.io/BiimMotionWebUI/ --only=S1,S3,S7` で撮って CP-W1 と比べ、`VERIFICATION.md` に追記）。G4-α の完了条件には含めない。
- `docs/work/2026-11-13-explainer-ui-harness/reviews/G4-alpha.md` は L2 が書くので作っていない。

## 5. 持ち越し事項

- **T9a の D1〜D6**（CONTRACT と `qc.mjs` の食い違い。POST-2 での `waived` の数え方、`scene_ids` の意味、`ADV-PRE-*` の出現段階、`inputs` の範囲、`detail` の言語、終了コード2の範囲）：スペース版の読み方を指定したので S1 の進行は妨げない。どちらを正とするかは T4（QC の所有者）の判断に委ねる持ち越し。本セッションでは直していない。
- **T4-review（`6b9d34f`）の m1〜m4**：
  - m1（preview でゴーストと判定して修正した後も、古い `- GHOST preview fNNN: ゴースト` 行が残ると final で不合格になる。照合行の書き換え方の明記）：`job-template/AGENTS.md` に書き換え方の説明は見当たらず、**未対応**。T3 系の文書（T8b など）への持ち越し。
  - m2（非 Biim のシーンコードでの validate）：T5b で対応済み（`tasks/T5b/verify-fixtures.mjs`）。
  - m3（`.verification/` の ZIP バイト列の比較手順）・m4（POST-1 の単体テストがスタブ）：参考・粒度の指摘で、**未対応のまま持ち越し**。
- **T5-review（`0c78d81`）の N1〜N3**：
  - N1（縦のとき mixed を選べない理由の文言が選択肢のそばに出ない）：`src/App.tsx` に CONTRACT §4.4 の文言は無く、**未対応**。T7 の刷新時に扱うかは L2 の判断。
  - N2（T5 の REPORT の C-5 行の記録の誤り、訂正は任意）：未対応（記録の訂正なし）。
  - N3（所見、対応不要）：対応なし。
- **EX-17**：Biim 枠・キャラ左と全画面・横の2配置は still 実測で一致。キャラ右・2人・キャラなし・縦、半角幅比率（0.5）、読み上げ速度（6.0文字/秒）の実測は **T11 へ持ち越し**。
- **完成動画つきの事後ゲート（`qc --stage=post`）の合格経路**：本セッションでは preview と ghost-check までで、final と事後ゲートの通しは T11 の範囲（T8a の記録どおり）。
- **C-6 の一致1件**：`tasks/G4-alpha/DIRECTION.md` にメイン checkout のローカル絶対パスがある（L2 の `7336589`）。本セッションは触っていない。公開前に消すかは L2 の判断。
- **このマシンの ffmpeg**：PATH 上の scoop の shim が壊れており、`ghost-check` は `FFMPEG_PATH` を指定しないと Remotion 同梱の ffmpeg（`rawvideo` 出力なし）で失敗する。T11 の制作環境では `FFMPEG_PATH` の指定か scoop の修理が要る（オーナー環境の作業）。

## 6. 判断したこと・質問（非ブロッキング。既定の判断で進めた）

1. **C-3**：指示は「`tests/qc.test.ts:47` の末尾空行を削除」だったが、競合解決で T4 最終版を採った結果、その空行は統合後に存在しなかった。テストファイルは触らず、`git diff --check` が空であることだけを確認した。
2. **CP-W1 の追記場所**：T8a の節（G3 合格済み）の「予定」の文を書き換えず、別の節として末尾に追記した。
3. **EX-17**：一部の配置で実測できたので記録したが、全配置ではないため「係数の実測確定」とはせず、規則版も上げていない。残りは T11。
4. **ghost-check の ffmpeg**：環境を直さず、スクリプトが元から持つ `FFMPEG_PATH` の上書きで実行した。最初の失敗も記録した。
5. **main マージの方法**：ファイルのロックで `git merge` が中止したため、同じ結果になるマージコミットを plumbing で作った（§4）。L2 が通常の `git merge` を求める場合は、ロックを外したうえで `git update-ref refs/heads/main 955fa5c` で戻してやり直せる（push 前なので影響はローカルだけ）。
6. **記録コミットの main への取り込み**：main マージ後の REPORT 追記は fast-forward で main にも入れた（main と波ブランチを同じ先端にそろえるため）。main にマージ以外のコミットを足したくない場合は、L2 が push 前に main を `5e50308` に戻せる。
7. 1件目のマージコミットに帰属行を付け忘れたので、push 前に `--amend` でメッセージだけ直した。
