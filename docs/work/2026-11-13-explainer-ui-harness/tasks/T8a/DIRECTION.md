# DIRECTION — T8a 文書の同期（第1波）

- 作業ID: `2026-11-13-explainer-ui-harness`
- あなたは **L3 実働 A（Opus 5.5、effort medium、非対話セッション）**です。文書の同期が仕事です。G3 は L2 が検証コマンドを再実行して行うため、**自分で自分の成果物を合格と判定してはいけません**。
- サブエージェントの使用は可（L4 下請け）。使う場合は REPORT.md に記録すること。
- 表示名は **`BiimMotion` 確定**です（Amendment 02、オーナー決定 2026-11-13 20:36）。暫定扱いにしないこと。repo 名・Pages URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物で変えません。

## 最初に読むもの（この順で）

1. `docs/requirements/2026-11-13-amendment-01.md`（最優先。AM-1 目視ゲート廃止、AM-2 様式自由度）
2. `docs/requirements/2026-11-13-amendment-02.md`（表示名 `BiimMotion` 確定）
3. `docs/requirements/2026-11-13-explainer-ui-harness.md`（要件書。特に §2.6 ゲートと助言の線引き、EX-31、HN-01）
4. `docs/requirements/ORCHESTRATION_PLAN.md`（計画書。§5.1 T8a がこのタスク票の正本。§5.0 共通条件、§6.1 ブランチも読むこと）
5. 第1波の各タスクの記録（**読むだけ**。数値や結果を写すときは、自分の目で REPORT.md の証拠を確認してから書くこと。推測で補ってはならない）：
   - T3 `../BiimMakerWebUI-wt/T3/docs/work/2026-11-13-explainer-ui-harness/tasks/T3/REPORT.md`（コミット `759be8d`。G3 PASS）
   - T4 `../BiimMakerWebUI-wt/T4/docs/work/2026-11-13-explainer-ui-harness/tasks/T4/REPORT.md`（コミット `5e38423`）と交差レビュー記録 `../BiimMakerWebUI-wt/T4-review/docs/work/2026-11-13-explainer-ui-harness/tasks/T4/G3-REVIEW.md`（PASS、`6b9d34f`）
   - T5 `../BiimMakerWebUI-wt/T5/docs/work/2026-11-13-explainer-ui-harness/tasks/T5/REPORT.md`（コミット `424bc75`）と交差レビュー記録 `../BiimMakerWebUI-wt/T5-review/docs/work/2026-11-13-explainer-ui-harness/tasks/T5/G3-REVIEW.md`（PASS）
   - T5b `../BiimMakerWebUI-wt/T5b/docs/work/2026-11-13-explainer-ui-harness/tasks/T5b/REPORT.md`（コミット `b57d2a5`。G3 記録 `daece82`、PASS）
   - T5-4 `../BiimMakerWebUI-wt/T5-4/docs/work/2026-11-13-explainer-ui-harness/tasks/T5-4/REPORT.md`（CP-W1 の所在と S6 の motion-kit 数の確認結果。**T5-4 がまだ終わっていない場合は、VERIFICATION.md への CP-W1 の所在の記載は「T5-4 の完了後に追記する」旨を REPORT.md に書いて進めること。T5-4 を待って止まらないこと**）
6. T4 の `VERIFICATION.md` の EX-17 節（**読むだけ**）。T4 の worktree にある：`../BiimMakerWebUI-wt/T4/VERIFICATION.md` の `## 2026-11-13 EX-17 字幕帯域係数（暫定、T4-1）` の節（T4-1 `15b42a7` で追加）。自分の worktree のルート `VERIFICATION.md` にはまだ無い。**この節を書き換えてはならない。**
7. 現行のルート `README.md` とルート `VERIFICATION.md`（自分の worktree 内。変更対象の原本）。

## 作業ブランチと基準コミット

- あなたの repo ルートは、この DIRECTION.md がある worktree です。ブランチは `task/T8a-docs` で、波のブランチ `feat/explainer-harness` から分岐済みです。**ブランチを切り替えないこと**。
- `<BASE>` = `2a7d209`（第1波ブランチの最初のコミット）。検証コマンドの `git diff <BASE>...HEAD` にはこの値を使うこと。差分には L2 による発注記録（本 DIRECTION.md 等のコミット）も含まれるが、完了条件の判定には影響しない。
- コミットは1件にまとめること。件名は計画書 §5.4 #16（英語・命令形）：`Document explainer mode and record verification`。C-1・C-2 が通ること。コミットメッセージの末尾に規定の帰属行を付けること（書式は過去のコミットの末尾を参照。ファイルには書かない）。
- **push はしないこと**（認証は L2 が後で行う）。main へのマージ・直接 push・強制 push は禁止。スペース版（S0〜S5）には触れないこと。

## 取り込み（しないこと）

- T3・T4・T5・T5b の成果を **cherry-pick で取り込まないこと**。T8a は文書だけのタスクであり、コードや job-template の取り込みは範囲外である。必要な数値・結果は上の「最初に読むもの」5 の REPORT.md から読むこと（読むだけ）。
- **EX-17 節の扱い**：T4-1 が追加した EX-17 暫定係数の節は、T4 のブランチ（`task/T4-qc`）の `VERIFICATION.md` にある。G4-α の統合で T4 のブランチが波のブランチに入るときに一緒に入る。T8a では**この節を自分の `VERIFICATION.md` に複写しないこと**。T8a が追記する第1波の検証結果は、末尾に日付つきの見出しで追加し、既存の節（自分のブランチにはまだ無い EX-17 節を含む、将来入る節）とぶつからない形にすること。REPORT.md に「EX-17 節は T4-1 のもので、G4-α で入る」旨を明記すること。

## 対象ファイル

- ルート `README.md`（解説モードの原則・多様性・入力支援・QC・**様式モード**を MV 節と同じ粒度で。手順の正本ではないと明記）
- ルート `VERIFICATION.md`（第1波の検証結果）

## 内容の要点（計画書 §5.1 T8a）

- README の解説節は MV 節と同粒度にすること。MV 節の小見出しと解説節の小見出しの対応表を REPORT.md に書き、欠けが無いことを示すこと（計画書の検証は L2 が行うが、対応表は実装者が用意する）。
- **制作原則の本文は複製しないこと。リンクのみ。** `job-template/AGENTS.md` の原則の文が README に3文以上連続で複製されていないことを自分で確認し、REPORT.md に記録すること。
- README の解説節に含めること：様式モード（biim／anime／motion／mixed。biim は既定であって必須ではない）、入力支援（理解ゴール・前提と誤解・構成メモ・解説用差別化メモ・様式モード選択）、QC コマンドとゲートの意味（`npm run qc -- --stage=pre|post`、ゲートと助言の線引き）、記録ファイル（`plan/`・`reports/`・ひな形）、主観的な質は助言であること。**MV の制作原則・工程・検証の仕様は変えないこと。MV 節の本文は変えないこと。**
- VERIFICATION.md に追記する第1波の検証結果：test 件数（T3：36、T4：54、T5：49、T5b：72 — 各 REPORT.md の証拠で確認すること。写し間違いをしないこと）、qc の合否事例（4様式の pass、3不合格例の fail、MV の exit 0）、MV 非退行の確認方法と結果（バイト一致の確認、MV 5件・ghost・imagegen の合格）、**CP-W1 の所在**（`docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1/`。T5-4 が未完了の場合は上記 5 の指示に従う）、G3 の結果（T3・T4・T5・T5b と T4-review・T5-review の PASS）、持ち越し（C-3 の末尾空行は G4-α で修正、EX-17 係数は暫定で T11／G4-α で実測確定、T4-review の m1〜m4 と T5-review の N1〜N3 は下流を妨げない旨）。
- VERIFICATION.md の追記は**既存の節を書き換えず**、末尾に日付つきの見出しで追加すること。既存の節（2026-10-06、2026-11-09 の各節）の本文は変えないこと。

## 完了条件

- README の解説節が MV 節と同粒度であること。
- 制作原則の本文を複製していないこと（リンクのみ）。
- `VERIFICATION.md` に test 件数・qc の合否事例・MV 非退行の確認方法と結果・**CP-W1 の所在**があること。

## 検証コマンド

```sh
npm test
npm run build -- --base=/BiimMotionWebUI/
```

- README の MV 節と解説節の小見出しの対応表を REPORT.md に書くこと。
- `job-template/AGENTS.md` の原則の文が README に3文以上連続で複製されていないことを確認し、REPORT.md に記録すること。
- C-1〜C-6。

## 全タスク共通の完了条件（計画書 §5.0。`<BASE>` = `2a7d209`）

- **C-1** `npm test` が合格。
- **C-2** `npm run build -- --base=/BiimMotionWebUI/` が合格。
- **C-3** `git diff --check <BASE>...HEAD` が空。
- **C-4 MV 非退行**：既存の MV 関連テスト（`tests/job.test.ts` の MV 5件、`tests/ghost.test.ts` 全件、`tests/imagegen.test.ts` 全件）が**テスト側の変更なし**で通る。確認コマンド：
  ```sh
  git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts
  git diff -U0 955fa5c -- tests/job.test.ts | grep '^-[^-]'   # 出力が空であること（例外は計画書 §5.3 の許容行のみ）
  ```
- **C-5** `DIRECTION.md` の「触らない範囲」に変更が無い（`git diff --stat <BASE>...HEAD` のファイル一覧で確認）。
- **C-6** 追加した行にローカル絶対パス・メールアドレス・認証情報が無いこと。確認コマンドは計画書 §5.0 の C-6 を参照すること（コマンド文を本 DIRECTION.md に転記しないこと）。
- **C-7** `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の既存の中身を読み込んでいない（REPORT に明記）。**例外**：検証のために自分で生成したフィクスチャに対して `validate`・`qc`・`diff`・`cmp` を実行し、その出力を見るのは可（ファイル全体をコンテキストに読み込まない）。
- **C-8** 作業記録の写しが一致：`cmp docs/work/2026-11-13-explainer-ui-harness/PLAN.md docs/requirements/ORCHESTRATION_PLAN.md`（計画を変えたタスク・ゲートのみ）。

## 触らない範囲

- `src/`、`job-template/`（T8a では触らない。読むだけ）
- `tests/`（無変更）
- `tools/`、`index.html`、ルートの `package.json`
- `docs/requirements/` 配下（要件書・Amendment・計画書）、`docs/work/2026-11-13-explainer-ui-harness/` 配下の `PLAN.md`・`BRIEF.md`・`ENVIRONMENT.md`・`QUESTIONS.md`・`G2-REVIEW*.md`・`CONTRACT.md`・`tasks/T0/`・`tasks/T1/`・`tasks/T2/`・`tasks/T3/`・`tasks/T4/`・`tasks/T5/`・`tasks/T5b/`・`tasks/T5-4/`（自分の `tasks/T8a/` 以外）
- `docs/work/2026-11-13-explainer-ui-harness/` 配下に `VERIFICATION.md` は無い。追記先は**ルートの `VERIFICATION.md`** である。新しい `VERIFICATION.md` を作らないこと。
- `CONTRACT.md` には触れないこと。
- `agentPromptFor("mv")` と MV の brief はバイト単位で変えないこと。
- 既存のコミット履歴を書き換えないこと。`git worktree` で作られた他の worktree に触れないこと。メインのチェックアウトの `.agent-work/` は読むだけで変更しないこと。

## 起動時チェック（計画書 §8.1。最初に行い、結果を REPORT.md に記録すること）

1. 自分の層（L3 実働 A）を確認する。
2. 次を確かめて記録する：エージェント製品とモデル・effort／サブエージェントを起動できるか／コマンドを実行できるか（`node -v`、`npm -v`、`git`）／対話できるか／ネットワーク（`npm ci` の成否で確認する）／ヘッドレス Chrome・Aivis エンジン・GPU レンダーは本タスクでは不要。
3. 縮退レベルを決め（計画書 §8.2）、「レベル・理由・自己判定になるゲート」を書いてから作業に入る。縮退しても守る最低限の関門は §8.3 の5項目。自己レビューになってもオーナー目視の強制はしない（HN-13 置換）。
4. この worktree には `node_modules/` が無い場合がある。その場合は `npm ci` を試みること。ネットワークが使えなければ §8 の縮退として記録し、テスト・ビルドの合格を主張しないこと。
5. `ENVIRONMENT.md` には直接追記しないこと。起動時チェックの行は REPORT.md に記録し、統合時に L2 が集約する。

## REPORT.md

`docs/work/2026-11-13-explainer-ui-harness/tasks/T8a/REPORT.md` に書くこと。README の MV 節と解説節の小見出しの対応表、原則の文の複製が無いことの確認結果、VERIFICATION.md への追記内容の要約（test 件数・qc 合否・MV 非退行・CP-W1 の所在・G3 結果・持ち越し）、EX-17 節の扱い（T4-1 のもので G4-α で入る旨）、T5-4 が未完了だった場合の対応、縮退レベルを載せること。最後に最終メッセージとして、変更したファイルと検証結果の要約を出力すること。

## 禁止事項

- 承認を求められたら（承認カード等）、**承認せずに止めて** REPORT.md に状態を書くこと。
- 実行できない検証を「合格」と書かないこと。未検証は未検証と明記すること。
- 自分で自分の成果物を合格と判定しないこと（G3 は L2 の仕事）。
- 質問が発生したら REPORT.md に書いて既定の判断で進めること（対話はできない）。
