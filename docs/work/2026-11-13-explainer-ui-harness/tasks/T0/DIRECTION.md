# DIRECTION — T0 作業基盤と刷新前記録

- 作業ID: `2026-11-13-explainer-ui-harness`
- あなたは **L3 実働 A（Opus 5.5 / effort medium、Claude Code 非対話セッション）**です。実装するのが仕事です。レビュー（G3）は実装者とは別コンテキストの L2 が行うため、**自分で自分の成果物を合格と判定してはいけません**。
- 表示名は **`BiimMotion` 確定**です（Amendment 02、オーナー決定 2026-11-13 20:36）。暫定扱いにしないこと。repo 名・Pages URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物で変えません。

## 最初に読むもの（この順で）

1. `docs/requirements/2026-11-13-amendment-01.md`（最優先。AM-1 目視ゲート廃止、AM-2 様式自由度）
2. `docs/requirements/2026-11-13-amendment-02.md`（表示名 `BiimMotion` 確定）
3. `docs/requirements/2026-11-13-explainer-ui-harness.md`（要件書）
4. `docs/requirements/ORCHESTRATION_PLAN.md`（計画書。§5.1 T0 がこのタスク票の正本）
5. 監査3本：この worktree にはまだ `docs/work/2026-11-13-explainer-ui-harness/audits/` が無いため、**メインのチェックアウトの `.agent-work/` にある原本を読むこと**（相対パス `../BiimMakerWebUI/.agent-work/audit-explainer.md`、`audit-ui.md`、`audit-space.md`。読むだけで、原本を変更しないこと）。

## 作業ブランチと基準コミット

- あなたの repo ルートは、この DIRECTION.md がある worktree です。ブランチは `task/T0-base` で、波のブランチ `feat/explainer-harness` から分岐済みです。**ブランチを切り替えないこと**。
- `<BASE>` = `2a7d209`（第1波ブランチの最初のコミット）。検証コマンドの `git diff <BASE>...HEAD` にはこの値を使うこと。差分には L2 による発注記録（本 DIRECTION.md 等のコミット）も含まれるが、完了条件の判定には影響しない。
- コミットは計画書 §5.4 の件名で分けること：#2 `Ignore local agent workspace and add dependency-free UI screenshot script`、#3 `Record audits and pre-redesign UI screenshots`。件名は英語・命令形。コミットメッセージの末尾に規定の帰属行を付けること（書式は過去のコミット `Document ghost-check commands and layer separation in top-level docs` の末尾を参照。ファイルには書かない）。
- **push はしないこと**（認証は L2 が後で行う）。main へのマージ・直接 push・強制 push は禁止。スペース版（S0〜S5）には触れないこと。

## 対象ファイル

- `.gitignore`（`.agent-work/` を追加）
- `docs/work/2026-11-13-explainer-ui-harness/tasks/` の各フォルダ（`T0`・`T1`・`T2`。本 DIRECTION.md のコミットで既に存在するはず。存在を確認すること）
- `docs/work/2026-11-13-explainer-ui-harness/audits/`（監査3本の写し。`.agent-work/` は無視対象になり他の実働・レビュー者が読めないため。ローカルパス・ホームディレクトリ表記は除くこと。Q6 の回答で公開不可となった場合はスペース監査の写しを外し、必要箇所を `SPACE_HANDOFF.md` だけに残す。現時点では要件書の既定「含める」で進める）
- `tools/ui-shots.mjs`（新設、依存なし）
- `docs/work/2026-11-13-explainer-ui-harness/screenshots/before/` の S1〜S8

## 完了条件

- `.agent-work/` が無視されること
- 監査3本の写しが追跡され、C-6 に掛からないこと
- S1〜S8 の8枚が揃うこと（S2 は解説の 03 付近、S5 はテスト用に作った ghost-check JSON を読み込んだ状態）
- 撮影手順が `REPORT.md` に再現可能な形であること
- `package.json` の差分なし

## 撮影スクリプトの要件（計画書 §4）

- S1〜S8 の撮影条件は要件書 §3.4 の表のとおり。「Pages 用ビルドをローカルで配信し、ヘッドレス Chrome で撮る」こと。
- 依存を増やさないこと。Chrome の CDP を **Node 組み込みの `WebSocket`** で操作する撮影スクリプト `tools/ui-shots.mjs` を作ること（`package.json` の依存に何も足さない）。
- **Node バージョンの確認（G2 P2-2）**：作業開始時に `node -v` を確認し、`package.json` の engines と照らして REPORT.md に記録すること。Node 組み込み `WebSocket` が使えるバージョンであること（PC は Node v24.15.0＝2026-11-13 実測だが、自分の環境で再確認すること）。使えないバージョンだった場合は計画書 §8 の縮退として記録し、撮影スクリプトの代替案（または未検証）を REPORT.md に明記すること。テスト・ビルドの合格を主張しないこと。
- S5 用の ghost-check JSON はテスト用に作ること（作り方を REPORT.md に記録すること）。

## 検証コマンド

```sh
git check-ignore .agent-work/PM_BRIEF.md
ls docs/work/2026-11-13-explainer-ui-harness/audits   # 3ファイル
ls docs/work/2026-11-13-explainer-ui-harness/screenshots/before | wc -l   # =8
git diff --exit-code 955fa5c -- package.json
```

C-1〜C-6 も通すこと（下記）。

## 全タスク共通の完了条件（計画書 §5.0。`<BASE>` = `2a7d209`）

- **C-1** `npm test` が合格。
- **C-2** `npm run build -- --base=/BiimMotionWebUI/` が合格。
- **C-3** `git diff --check <BASE>...HEAD` が空。
- **C-4 MV 非退行**：既存の MV 関連テスト（`tests/job.test.ts` の MV 5件＝「MV mode preserves…」「MV ZIP includes…」「MV direction candidates…」「lyric stats…」「MV brief and AGENTS…」、`tests/ghost.test.ts` 全件、`tests/imagegen.test.ts` 全件）が**テスト側の変更なし**で通る。確認コマンド：
  ```sh
  git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts
  git diff -U0 955fa5c -- tests/job.test.ts | grep '^-[^-]'   # 出力が空であること（例外は計画書 §5.3 の許容行のみ）
  ```
- **C-5** `DIRECTION.md` の「触らない範囲」に変更が無い（`git diff --stat <BASE>...HEAD` のファイル一覧で確認）。
- **C-6** 追加した行にローカル絶対パス・メールアドレス・認証情報が無いこと。確認コマンドは計画書 §5.0 の C-6 を参照すること（コマンド文を本 DIRECTION.md に転記しないこと）。
- **C-7** `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の既存の中身を読み込んでいない（REPORT に明記）。**例外**：検証のために自分で生成したフィクスチャに対して `validate`・`qc`・`diff`・`cmp` を実行し、その出力を見るのは可（ファイル全体をコンテキストに読み込まない）。
- **C-8** 作業記録の写しが一致：`cmp docs/work/2026-11-13-explainer-ui-harness/PLAN.md docs/requirements/ORCHESTRATION_PLAN.md`（計画を変えたタスク・ゲートのみ）。

## 触らない範囲

- `src/`、`job-template/`、`tests/`、`index.html`、`package.json`（差分なしが完了条件）、`docs/requirements/` 配下（要件書・Amendment・計画書）、`docs/work/2026-11-13-explainer-ui-harness/` 配下の `PLAN.md`・`BRIEF.md`・`ENVIRONMENT.md`・`QUESTIONS.md`・`G2-REVIEW*.md`・`CONTRACT.md`・`tasks/T1/`・`tasks/T2/`（自分の `tasks/T0/` 以外）。
- 既存のコミット履歴を書き換えないこと。`git worktree` で作られた他の worktree に触れないこと。

## 起動時チェック（計画書 §8.1。最初に行い、結果を REPORT.md に記録すること）

1. 自分の層（L3 実働 A）を確認する。
2. 次を確かめて記録する：エージェント製品とモデル・effort／サブエージェントを起動できるか／コマンドを実行できるか（`node -v`、`npm test` が動くか）／対話できるか／ネットワーク（npm install、Pages の閲覧）／ヘッドレス Chrome。Aivis エンジン・GPU レンダーは本タスクでは不要。
3. 縮退レベルを決め（計画書 §8.2）、「レベル・理由・自己判定になるゲート」を書いてから作業に入る。縮退しても守る最低限の関門は §8.3 の5項目。自己レビューになってもオーナー目視の強制はしない（HN-13 置換）。
4. この worktree には `node_modules/` が無い場合がある。その場合は `npm ci` を試みること。ネットワークが使えなければ §8 の縮退として記録し、テスト・ビルドの合格を主張しないこと。

## REPORT.md

`docs/work/2026-11-13-explainer-ui-harness/tasks/T0/REPORT.md` に書くこと。完了条件ごとに証拠（検証コマンドの出力、ファイル一覧、スクリーンショット8枚の所在、撮影手順の再現手順、Node バージョン、縮退レベル）を載せること。最後に最終メッセージとして、変更したファイルと検証結果の要約を出力すること。

## 禁止事項

- 承認を求められたら（承認カード等）、**承認せずに止めて** REPORT.md に状態を書くこと。
- 実行できない検証を「合格」と書かないこと。未検証は未検証と明記すること。
- 自分で自分の成果物を合格と判定しないこと（G3 は L2 の仕事）。
