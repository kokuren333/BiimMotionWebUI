# REPORT — G4-β 統合（第2波）

- 作業ID：`2026-11-13-explainer-ui-harness`／タスク：G4-β／層：L3 実働 A
- 本ファイルは作業記録であり、**合否判定はしない**（G3・G4-β の判定は L2 が別コンテキストで行う）。

## 0. 起動時チェック（計画書 §8.1）

| 項目 | 結果 |
| --- | --- |
| 層 | L3 実働 A（`DIRECTION.md` による） |
| エージェント製品・モデル・effort | Claude Code（非対話セッション）／Opus 5.5（`claude-opus-5-5`）／medium（指定値） |
| サブエージェント | 起動可能（Agent ツールあり）。本タスクでは使っていない（L4 下請けなし） |
| コマンド実行 | 可（node v24.15.0、npm 11.12.1、git 2.54.0。Git Bash と PowerShell） |
| 対話 | 不可（非対話。質問は §8 に書き、既定の判断で進めた） |
| ネットワーク | 可（`npm ping` 応答、基準 worktree の `npm ci` 成功）。Pages の閲覧は push 前のため対象外 |
| ヘッドレス Chrome | 実行ファイルあり（Chrome 157）。スクリーンショットを撮り直さないため起動していない |
| GPU レンダー | GPU あり（NVIDIA RTX 3080）。本タスクでは preview レンダーは対象外（計画書 §5.3 の G4-β 列は「—」） |
| Aivis | 対象外。未確認 |

- **縮退レベル：0（標準）**。理由：コマンド実行・ネットワーク・Chrome が使え、G3・G4-β の判定は L2 が別コンテキストで行うため。
- **自己判定になるゲート：なし**。本セッションでは自分の成果物を合格と判定していない。

## 1. 統合したブランチとコミット

作業場所はメイン checkout の `feat/ui-biim-frame`（開始時 `8671d45`＝`<BASE>` `ce6269b` に G4-β の DIRECTION を足した L2 のコミット）。新規ブランチ・新規 worktree は作っていない（§4 の MV 差分検査用の一時 worktree を除く。検査後に削除済み）。`review/*` ブランチは統合していない。

### 前提（取り込み済み、本セッションでは統合していない）

| ブランチ | マージコミット | G3 記録 |
| --- | --- | --- |
| `task/T6-ui-base`（先端 `467e38d`） | `15dbbb4` | 同ブランチ内 `467e38d`（`tasks/T6/G3-REVIEW.md`、PASS）。波ブランチに入っている |
| `task/T7-ui-full`（実装先端 `8125d05`、ブランチ先端はレビュー発注 `387b6b8`） | `fb40029` | `review/T7-ui-full` の `1fa4f8d`（Codex の交差レビュー、PASS）。**引用のみ**で波ブランチには入れていない |

`git merge-base --is-ancestor` で `main`（`7d5dd59`）が波ブランチの祖先であることを確認した。

### 本セッションで統合したもの

| 順序 | ブランチ（先端） | マージコミット | 結果 | 直後の `npm test` | 直後の build |
| --- | --- | --- | --- | --- | --- |
| 1 | `task/T8b-docs`（`eac267e`） | `c616cd8` | 競合なし（5ファイル） | 72 tests / 72 pass / 0 fail | exit 0 |
| 2 | `task/T9b-job-entry`（`3a7ba5f`） | `2930980` | 競合なし（5ファイル、新規のみ） | **81 / 81 pass / 0 fail** | exit 0、`dist/index.html` に `/BiimMotionWebUI/assets` を含む |

- テストとビルドは PowerShell で実行した（Git Bash の MSYS パス変換で `--base` が書き換わるのを避けるため）。
- 「already contained」のブランチは無かった。2件ともマージコミット（no-ff）で取り込んだ。
- G3 記録：T8b は `eac267e`（`tasks/T8b/G3-REVIEW.md`、L2、PASS）、T9b は `3a7ba5f`（`tasks/T9b/G3-REVIEW.md`、L2、PASS）が各ブランチ内にあり、マージで波ブランチに入った。
- T9b は G4-α の記録コミット前の `75986e6` から分岐していたが、変更は `tools/generate-job.ts`・`tests/generate-job.test.ts`・`tasks/T9b/` だけで、競合は起きなかった。

### 競合

- **なし**。実装の判断が必要な競合も無い。線引き（N1・N10・ゲートと助言）に関わる変更は統合で生じていない。

## 2. ENVIRONMENT.md の集約

`ENVIRONMENT.md` §4「セッション起動記録」の表に5行を追記した：T6（`tasks/T6/REPORT.md` §1）、T7（`tasks/T7/REPORT.md` §1）、T9b（`tasks/T9b/REPORT.md` 冒頭）、T8b（`tasks/T8b/REPORT.md` §1）、本セッション（G4-β）。第1波の行（G4-α で集約済み）は重複させていない。T9b のモデルは REPORT の「指定値」をそのまま写した。G3 レビューのセッション（T7 の Codex 交差レビュー、L2 の G3）は各 G3 記録にあり、本表の対象（実働の起動時チェック）には入れていない。

## 3. 統合後の検証（波ブランチ、`<BASE>` = `ce6269b`）

### C-1〜C-8

| 検査 | コマンドと結果 |
| --- | --- |
| C-1 | `npm test`（PowerShell）：tests 81 / pass 81 / fail 0、exit 0（期待値 81/81） |
| C-2 | `npm run build -- --base=/BiimMotionWebUI/`（PowerShell）：98 modules、exit 0（既存の chunk size 助言のみ）。自分で生成した `dist/index.html` に `/BiimMotionWebUI/assets` が含まれることを `Select-String -Quiet` で確認（内容は読んでいない） |
| C-3 | `git diff --check ce6269b...HEAD`：出力なし（exit 0）。参考に波全体 `git diff --check 7d5dd59...HEAD` も出力なし |
| C-4 | `git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts`：exit 0。`git diff -U0 955fa5c -- tests/job.test.ts \| grep '^-[^-]'` は `-    12,` の1行だけ（T5b 由来の既知差分。対応する `+    15,` と非 Biim 部品のテスト追加）。`git diff --stat 5e50308 -- tests/job.test.ts tests/ghost.test.ts tests/imagegen.test.ts` は空（第2波で3ファイルとも無変更） |
| C-5 | `git diff --stat ce6269b...HEAD`：11 files（本 REPORT のコミット前）。`README.md`・`VERIFICATION.md`・`docs/DESIGN.md`・`tasks/T8b/{G3-REVIEW,REPORT}.md`（T8b）、`tools/generate-job.ts`・`tests/generate-job.test.ts`・`tasks/T9b/{DIRECTION,G3-REVIEW,REPORT}.md`（T9b）、`tasks/G4-beta/DIRECTION.md`（L2 の `8671d45`）。`src/`・`index.html`・`job-template/`・`package.json`・`docs/requirements/` は無い。本セッションが書いたのは `ENVIRONMENT.md`（表への追記のみ）と本 REPORT だけ。`reviews/G4-beta.md` は作っていない。参考：波全体（`7d5dd59...HEAD`）は 48 files。repo 側の非記録ファイルは `README.md`・`VERIFICATION.md`・`docs/DESIGN.md`・`docs/requirements/2026-11-14-amendment-03.md`（L2 の `e40adbe`）・`index.html`・`public/icons/` 10点・`src/App.tsx`・`src/style.css`・`tools/ui-shots.mjs`・`tools/generate-job.ts`・`tests/generate-job.test.ts`。`job-template/`・`src/job.ts`・`src/mv-assist.ts`・`src/templates.ts`・`package.json`・MV のテスト3ファイルは無い |
| C-6 | `ce6269b...HEAD` に対する2つの grep：どちらも出力なし。参考：波全体 `7d5dd59...HEAD` では1つ目の grep が3件一致し、いずれも L2 の記録ファイル（`reviews/G4-alpha.md` の C-6 の説明文、`tasks/T7/DIRECTION.md`・`REVIEW-DIRECTION.md` の、角丸の検査コマンドの空白クラスを書き換えた注記）で、ローカルパスではない誤検出。2つ目の grep は一致なし |
| C-7 | `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の既存の中身は読み込んでいない。自分で生成したフィクスチャ・ビルドに `diff`・`cmp`・`Select-String -Quiet` を実行し、その出力だけを見た |
| C-8 | `cmp PLAN.md docs/requirements/ORCHESTRATION_PLAN.md`：一致（exit 0）。計画は変えていない。`git diff --stat ce6269b...HEAD -- docs/requirements` は空 |

### MV 生成物の差分検査（計画書 §5.3、G4-α と同じ手順）

OS の一時フォルダに `git worktree add --detach <一時>/base 955fa5c` → 基準側 `npm ci`（exit 0）→ `node --experimental-strip-types tools/make-fixture.ts --mv`（exit 0）。統合側 `node --experimental-strip-types tools/make-fixture.ts --mv --out=<一時>/head`（exit 0）。`git diff --no-index --stat`：**17 files changed, 1121 insertions(+), 48 deletions(-)**（G4-α と同じファイル・同じ行数）。

| 差分のあるファイル | 許容一覧の該当 |
| --- | --- |
| `AGENTS.md`、`README.md` | AGENTS.md（N1 の範囲）、job-template 側の README |
| `package.json`、`runtime/package.json`（各 +1） | `qc` スクリプトの追加 |
| `runtime/scripts/caption-capacity.mjs`・`caption-capacity.d.mts`・`qc.mjs`（新規）、`validate.mjs` | runtime/scripts の新規ファイルと validate.mjs |
| `plan/templates/` の5ファイル（新規） | plan/templates の新規ファイル |
| `motion-kit/DiagramStage.tsx`・`FullscreenStage.tsx`・`StandardCaption.tsx`（新規） | motion-kit の新規ファイル |
| `project.json`（1行） | `schema_version` のみ：`"0.3"` → `"0.4"` |

- 許容一覧の外の差分は無かった。`scenes/index.tsx` は `cmp` で一致。
- `cmp brief.md`：一致（exit 0）。
- `git diff --no-index project.json`：`-  "schema_version": "0.3",` と `+  "schema_version": "0.4",` の1行だけ。
- 基準 worktree は `git worktree remove --force` で削除し（`npm ci` と生成物の未追跡ファイルがあるため `--force`。自分で作った一時 worktree だけが対象）、一時フォルダごと消した。`git worktree list` に残っていない。

### 解説フィクスチャ

- `git diff --stat 5e50308...HEAD -- job-template`：**空**（exit 0）。G4-α の記録コミット `7d5dd59` 基準でも空。第2波は `job-template/` に差分が無いので、4様式の `validate`・`qc --stage=pre` と不合格3事例は再実行していない（計画書 §5.3 の G4-β 列のとおり、空であることの記録で代える）。

### UI-C1〜C5（T7 REPORT §3 のコマンドを Git Bash でそのまま再実行）

| 検査 | コマンド | 出力 |
| --- | --- | --- |
| UI-C1 英語ラベル等 | `grep -nE "MOTION JOB STUDIO\|WORKSPACE\|…\|Opus" src/App.tsx index.html`（T7 DIRECTION の全文） | 出力なし（exit 1） |
| UI-C1 コピー | `grep -nE "伝えたいことを\|…\|細部を決めすぎず" src/App.tsx index.html` | 出力なし |
| UI-C2 影等 | `grep -nE "box-shadow\|gradient\|blur" src/style.css` | 出力なし |
| UI-C2 角丸 | `grep -noE "border(-[a-z]+)*-radius:[[:space:]]*[^;]+" src/style.css \| grep -vE "radius:[[:space:]]*(0\|2px\|50%)$"` | 出力なし |
| UI-C2 12px 未満 | `grep -nE "font(-size)?:[^;]*(^\|[^0-9.])([0-9]\|1[01])(\.[0-9]+)?px" src/style.css` | 出力なし |
| UI-C2 em／rem | `grep -nE "font(-size)?:[^;]*[0-9.]+r?em\b" src/style.css` | 出力なし |
| UI-C2 色（Amendment 03 の読み替え） | `awk` で `src/style.css` の `:root` ブロック以外を取り出し、`#…`・`rgb(`・`hsl(`・色名・`transparent`・`currentColor` を検索 | 一致は `white-space` の4行だけ（誤検出）。本文側の色の直値は0件 |
| UI-C3 書体 | `grep -nE "Inter\|Georgia" src/style.css index.html` | 出力なし |
| UI-C3 外部参照 | `grep -nE "(href\|src)=[\"']https?://\|@import\|url\([\"']?https?://" src/style.css index.html` | 出力なし |
| UI-C4 依存 | `git diff 955fa5c -- package.json` | 出力なし |
| UI-C5 | `npm test`、`npm run build -- --base=/BiimMotionWebUI/` | 上の C-1・C-2 のとおり（81/81、build exit 0） |

第2波で `src/`・`index.html`・`src/style.css` を変えたのは T6・T7 だけで、T8b・T9b はこれらに触れていない（C-5）。したがって上の結果は T7 の `5f46d28` 時点と同じ対象に対するもの。

### 名称統一の最終確認（T8b の G3 と同じコマンド、文字列で照合）

- `git grep -n -E "BiimMaker|MOTION JOB STUDIO|IDEAS DESERVE MOTION" -- index.html src README.md`：一致0件（exit 1）。UI-C1 の grep（`MOTION JOB STUDIO`・`IDEAS DESERVE MOTION` を含む）も0件。

### スクリーンショット（CP-A1・CP-A2）。撮り直しはしていない

| 記録点 | フォルダ | 枚数（`ls`） | `VERIFICATION.md` の記録 |
| --- | --- | --- | --- |
| CP-A0（刷新前、T0） | `screenshots/before/` | 8（S1〜S8） | 節「2026-11-14 第2波 UI 刷新の検証結果」の「スクリーンショットの所在」。`git diff --stat task/T0-base -- screenshots/before` は空（上書きなし） |
| CP-A1（T6） | `screenshots/cp-a1/` | 2（S1・S3） | 同節。T6 が Pages 用ビルドを `/BiimMotionWebUI/` 配下で配信して撮影と記録 |
| CP-A2（T7） | `screenshots/after/` | 9（S1〜S8、`S1-scrolled-explainer-page-end-1440.png`） | 同節。`git diff --stat 8125d05 -- screenshots/after` は空（T7 の提出時から不変） |

- **CP-A2 が Pages 用ビルドに対して撮られたことの裏付け**（PNG には由来の情報が無いため手順の記録で確認）：
  - `tasks/T7/REPORT.md` §4：`5f46d28` の作業ツリーで `MSYS_NO_PATHCONV=1 npm run build -- --base=/BiimMotionWebUI/` を実行し、その `dist/` を `tools/ui-shots.mjs` が `/BiimMotionWebUI/` 配下で配信、スクリプトは `index.html` が `/BiimMotionWebUI/assets/` を読むことを確認してから撮る。
  - `VERIFICATION.md` 第2波の節「スクリーンショットの所在」：同じ手順と、T7 の G3 によるスクリプトの読解で裏付けた旨の記録。
  - T7 の G3（`1fa4f8d` の R4）：CP-A2 を合格とし、S1〜S8 の条件を照合。
  - UI-V4 の記録（字幕書体が `/BiimMotionWebUI/job-assets/fonts/…` から読まれた）も base 付きの配信であることと整合する。

### UI-V1〜V7：証拠の所在と記録内容（判定はしない）

計画書 §5.3 の G4-β 列は「非実装者がスクリーンショットと操作記録で判定」。本セッションは判定せず、L2 に渡す証拠を整理する。各基準の詳しい記録内容は `VERIFICATION.md` 第2波の節「UI-V1〜V7 の証拠（G4-β で判定）」の表にある（T8b が UI-V7-CHECK と T7 G3 から集約し、L2 の T8b G3 で照合済み）。

| 基準 | 証拠の所在 | 記録内容（要約） |
| --- | --- | --- |
| UI-V1 4領域・枠線・ZIP 生成ボタン・状態の一文 | `screenshots/after/` S1〜S6 | S1〜S5 に4領域と字幕帯の生成ボタン・状態の一文。S6 は情報ダイアログが不透明の背景の上に出る条件で背面が写らない（T7 G3 R4 で崩壊ではないと記録） |
| UI-V2 解説 01 の5項目がスクロールなし（UI-12） | S1、`tasks/T7/UI-V7-CHECK.md` §3 | 1440×900 で5項目の下端が字幕帯の上端より上 |
| UI-V3 S1 と S3 で領域の位置と寸法が同じ（UI-14） | S1・S3、UI-V7-CHECK §3 | 4領域の座標・寸法が解説と MV で一致（数値は VERIFICATION の表） |
| UI-V4 字幕帯の書体（解説は字幕様式、MV は通常） | S2・S3、UI-V7-CHECK §3 | 解説は `BiimMotion Caption` が読み込まれ `document.fonts.check` が真、MV は通常書体 |
| UI-V5 390px で横スクロールなし・字幕帯が下端固定 | S7・S8、UI-V7-CHECK §3 | `scrollWidth` 390、字幕帯 `position: fixed` で下端 844 |
| UI-V6 機能を持たない部品が無い | S1〜S8 | 現在値・runtime のタグ、飾りのアイコン・英語ラベルは T7 で削除（要件書 3.1）。Q-T7-1 として T7 G3 R9 が支持 |
| UI-V7 UI-11 の機能一覧の操作記録 | `tasks/T7/UI-V7-CHECK.md`（§1 UI-11 の20項目＋AM-2 の5、§2 監査21項目、§3 骨格、§4 コントラスト表、§5 Tab 順 解説71・MV36、§6 `aria-*`・`role` 39／10 → 46／14、§7 UI-09）、`tasks/T7/ui-v7-check.mjs`、`tasks/T7/ui-v7-result.json`（44キー） | Pages 用ビルドに対してヘッドレス Chrome で操作した記録。T7 G3 は再実行2回で各44キーを確認 |

計画書 T7 の完了条件が求める項目（UI-11 と監査21項目の1項目ずつの操作記録、UI-16 のコントラスト表・Tab 順・aria 同数以上、UI-09 の 100ms 以下）は、上の UI-V7-CHECK の §1〜§7 にそれぞれ節として存在する（所在の照合。内容の十分性は判定しない）。

記録の限定（L2 の判定に引き継ぐ）：

- **N2**：S3 の歌詞統計は画角外であり、S3 は全統計が写った証拠とは読めない。統計機能は UI-V7 の操作記録（`A5-lyrics`）で確認済みであり、機能の欠落ではない（T7 G3 の N2、T8b G3、`VERIFICATION.md` に記録済み）。
- **N1**：`ui-v7-check.mjs` の `A1-toc`・`A1-current` は再実行で値が変わることがあり、`A9-mv-direction` は先頭の軸だけを比べる。提出記録との完全一致で判定しないこと（T7 G3 の N1）。
- **Q-T7-2**：既定のキャラ2の字幕色（赤）と白ふちの比 4.00:1。T7 G3 は「字幕プレビューの塗り／白ふちの組に限り UI-16 の本文配色の判定から外してよい」とした。**最終的な扱いは L2・G4-β の判断**として残っている。

### 受け入れ基準の照合（計画書 §7.2、G4-β の列。判定はしない）

| 基準 | 照合した根拠 |
| --- | --- |
| A8 UI-C1〜C5 | 上の UI-C1〜C5 の再実行（すべて出力なし／81/81・build exit 0） |
| A9 S1〜S8 刷新前後の対、UI-V1〜V7 | 刷新前 `screenshots/before/` 8枚と刷新後 `screenshots/after/` 9枚が揃っている。UI-V1〜V7 は上の証拠整理。**判定は L2 待ち** |
| A10 UI-11 の全機能の操作記録 | `tasks/T7/UI-V7-CHECK.md` §1（UI-11 の20項目＋AM-2 の5）・§2（監査21項目）、スクリプトと生の出力 |
| A11′ | CP-A1（2枚）・CP-A2（9枚）は記録済み（`VERIFICATION.md`）。UI-C1〜C5 は上のとおり。**UI-V1〜V7 の非実装者判定の部分は L2 の判定待ち** |
| A12 ハーネス文書の分担・重複なし | `docs/DESIGN.md` 確定版（T8b、G3 PASS）は UI のデザイン言語だけを書き、README の「画面の構成」節は規則を複製せず DESIGN へリンク（T8b REPORT §4）。AGENTS.md §9 の正本表で `docs/DESIGN.md` が「UI のデザイン言語」の正本。第2波は `AGENTS.md`・`CLAUDE.md`・`docs/WORKFLOW.md`・`job-template/AGENTS.md` を変えていない |

## 4. main へのローカルマージと push 待ち

- 統合ブランチの検証記録コミット：`843ffae`（本 REPORT の §0〜§3・§5・§6 と ENVIRONMENT.md の追記）。コミット後に波ブランチ上で `npm test` 81/81、Pages 用ビルド exit 0 を再確認した。
- マージコミット：`9d3bf2e`「Merge feat/ui-biim-frame: redesign the UI on the Biim frame and family theme」。親は `7d5dd59`（main の元の先端）と `843ffae`（波ブランチの検証記録コミット）。no-ff のマージコミット。
- 手順の補足（G4-α と同じ事象）：`git checkout main` の時点で `tasks/G4-beta/DIRECTION.md` を Windows が削除できず（`unable to unlink … Invalid argument`。本セッションを起動した側がファイルを開いたままにしているとみられる）、`git merge --no-ff` がファイルを書き換える前に中止した（main は `7d5dd59` のまま）。残ったファイルの blob は波ブランチの blob（`55cfca1`）と同一だった。main が波ブランチの祖先なので no-ff マージの結果のツリーは波ブランチのツリーそのものであり、同じマージコミットを `git commit-tree "feat/ui-biim-frame^{tree}" -p main -p feat/ui-biim-frame` で作り、`git update-ref`（旧値 `7d5dd59` を指定）で main を進めた。作業ツリーは `git reset --mixed` → `git checkout -- .` で戻し、`git status` はクリーン、`git diff HEAD feat/ui-biim-frame` は空。結果は通常の `git merge --no-ff` と同じ（2つの親、波ブランチと同一のツリー）。
- main 上での再検証（PowerShell）：
  - `npm ci`：exit 0（34 packages）
  - `npm test`：tests 81 / pass 81 / fail 0、exit 0（期待値 81/81）
  - `npm run build -- --base=/BiimMotionWebUI/`：98 modules、exit 0。`dist/index.html` に `/BiimMotionWebUI/assets` を含む（`Select-String -Quiet`）
  - Pages 用ビルド：`.github/workflows/pages.yml` は `npm ci` → `npm test` → `npm run build -- --base=/${{ github.event.repository.name }}/` で、リポジトリ名は `BiimMotionWebUI`（`origin` の URL）。上の3コマンドがそのまま Pages 用ビルドの再現になり、すべて exit 0
- 本節の追記は、波ブランチを main に fast-forward してから波ブランチでコミットし、main をそのコミットへ fast-forward した（G4-α と同じ扱い）。main と `feat/ui-biim-frame` は同じコミットを指す。
- **push はしていない。** GitHub 認証ブロッカー（Git Credential Manager の対話認証待ち）のため、`git push`・`gh pr create`・`gh pr merge` は行っていない。main はローカルで G4-α・G4-β の両マージを含み、`origin/main`（`955fa5c`）より先に進んだ状態（**main マージ済み・push 待ち**）。
- **Pages の表示確認は G4-β の完了条件に含めない**。push 後のオーナー作業として残す：
  - 公開①・②（push で main の Pages ワークフローが起動。第1波と第2波は同じ push で公開される見込み）：`gh run list --branch main --limit 1` → `gh run watch <run-id> --exit-status` で build・deploy の成功を確認。
  - 公開後確認②：`node tools/ui-shots.mjs --url=https://kokuren333.github.io/BiimMotionWebUI/ --only=S1,S3,S7 --out=docs/work/2026-11-13-explainer-ui-harness/screenshots/public-<波>` で撮り、CP-A2 と領域・文言・機能が一致することを `VERIFICATION.md` に追記（計画書 §6.3、締めの PR）。公開①を別に行わない場合、CP-W1 との比較（公開後確認①）は UI 刷新後の公開になるため成り立たない。その扱いは L2 の判断。
- `docs/work/2026-11-13-explainer-ui-harness/reviews/G4-beta.md` は L2 が書くので作っていない。

## 5. 持ち越し事項

- **T9a の D1〜D6**（CONTRACT と `qc.mjs` の食い違い）：T4（QC の所有者）の判断待ち。本セッションでは直していない。第2波で `job-template/` は変わっていないので状態は G4-α から同じ。
- **T4-review（`6b9d34f`）の m1〜m4**：m1（古い `- GHOST preview fNNN: ゴースト` 行の書き換え方の明記）は `job-template/` 無変更のため**未対応のまま**。m2 は T5b で対応済み。m3・m4 は**未対応のまま**持ち越し。
- **T5-review（`0c78d81`）の N1〜N3**：
  - N1（縦のとき mixed を選べない理由を選択肢のそばに出す。CONTRACT §4.4 の文言「縦向きの出力ではBiim枠を置けないため選べません」）：T7 の様式説明の一覧で、縦のとき混在の行に「（縦向きでは選べません）」が出るようになった（`src/App.tsx` の `style-mode-list`）。**選択肢のそばに出す点は満たすが、理由（Biim 枠を置けないため）の文言は無い。部分対応**として持ち越し、扱いは L2 の判断。
  - N2（T5 REPORT の記録の訂正、任意）：未対応。N3（所見）：対応なし。
- **Q-T7-1／Q-T7-2／Q-T7-4**（T8b で決着しなかったもの）：T7 の G3（`1fa4f8d` R9）はそれぞれ「タグ削除は妥当」「字幕プレビューの組に限り UI-16 の判定から除外してよい（最終は L2 判断）」「`tasks/T7/` に置く現状でよい」とした。`QUESTIONS.md` への転記や L2 の正式な決着の記録は波ブランチ上に見当たらない。Q-T7-2 は上記のとおり G4-β の判断事項。Q-T7-1・Q-T7-4 は L2 の確認待ちとして持ち越す。Q-T7-3 は T8b で決着（T8b G3）。
- **EX-17 係数の実測の残り**（キャラ右・2人・キャラなし・縦、半角幅比率、読み上げ速度）：T11 へ持ち越し。
- **公開後確認①・②**：push 待ちのため未実施（§4）。

## 6. 判断したこと・質問（非ブロッキング。既定の判断で進めた）

1. **解説フィクスチャを再実行しなかった**：`job-template/` の差分が空なので、計画書 §5.3 の G4-β 列どおり空であることの記録で代えた。
2. **ENVIRONMENT.md の行の順序**：既存の表に合わせ、各タスクの起動の順（T6 → T7 → T9b → T8b、REPORT の記録とコミット時刻から）に並べ、最後に本セッションを置いた。
3. **C-5・C-6 の参考に波全体（`7d5dd59...HEAD`）も確認した**：指示の `<BASE>` は `ce6269b` だが、main へ入る差分全体を見る意味で追加した。一致は L2 の記録ファイルの誤検出だけ。
4. **T5-review N1 を「部分対応」と記録した**：T7 の変更で理由の短い表示は出るが CONTRACT の文言どおりではないため。直していない（統合セッションの範囲外）。
5. **main マージの方法**：ファイルのロックで `git merge` が中止したため、G4-α と同じく同じ結果になるマージコミットを plumbing で作った（§4）。L2 が通常の `git merge` を求める場合は、ロックを外したうえで `git update-ref refs/heads/main 7d5dd59` で戻してやり直せる（push 前なので影響はローカルだけ）。
6. **記録コミットの main への取り込み**：main マージ後の §4 の追記は fast-forward で main にも入れた。main にマージ以外のコミットを足したくない場合は、L2 が push 前に main を `9d3bf2e` に戻せる。
7. **REPORT のコミットを1度 amend した**：最初のコミットで、本 REPORT の C-6 行の文言自体が C-6 の grep（ドライブ文字のパターン）に一致したため、文言を言い換えて push 前のローカルコミットを `--amend` した（記録コミットは `843ffae`）。
