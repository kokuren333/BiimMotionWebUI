# FIX-DIRECTION — T5-4 CP-W1 修正（T3 の取り込み漏れの解消）

- 作業ID: `2026-11-13-explainer-ui-harness`
- あなたは **L3 実働 B（Codex、非対話セッション、モデル `gpt-6.1-sol`、effort high）**です。修正とコミットが仕事です。G3 は T5-4 の一環として L2 が記録を確認して行うため、**自分で自分の成果物を合格と判定してはいけません**。
- サブエージェントの使用は可（L4 下請け）。使う場合は REPORT.md に記録すること。
- 表示名は **`BiimMotion` 確定**です（Amendment 02、オーナー決定 2026-11-13 20:36）。暫定扱いにしないこと。repo 名・Pages URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物で変えません。

## 経緯（なぜ修正が必要か）

- T5-4 の初回セッションは 2026-11-14 00:06 頃に EXITCODE 0 で終了したが、完了条件を満たしていない。`npm test` は 42/43 件成功で、失敗は `all 23 shared failure descriptions also exist in the imported T3 agent harness`（`tests/explainer.test.ts:104`）の1件。原因は初回セッションの取り込み順序に T3 が無かったため、`job-template/AGENTS.md` に解説章（23項目）が入っていないこと。
- 成果10ファイルはステージ済み・未コミットのまま残っている。スクリーンショット S1〜S8 と REPORT.md と `tools/ui-shots.mjs` の修正は初回セッションのものを使い、撮り直しはしないこと（T3 の取り込みは job-template とテストだけで、ビルドされる WebUI に影響しないため）。

## 最初に読むもの（この順で）

1. `docs/work/2026-11-13-explainer-ui-harness/tasks/T5-4/DIRECTION.md`（T5-4 の元の指示。取り込み順序・完了条件・検証コマンド・触らない範囲はここが正本）
2. `docs/work/2026-11-13-explainer-ui-harness/tasks/T5-4/REPORT.md`（初回セッションの記録。取り込み6件の対応表、撮影手順、C-1 未充足の原因、S3 の残件が書いてある。読むだけ。修正内容はこのファイルに追記する）
3. `docs/requirements/2026-11-13-amendment-01.md`（最優先。AM-1 目視ゲート廃止、AM-2 様式自由度。**スクリーンショットは証拠記録であり、待ち点ではない**）
4. `docs/requirements/2026-11-13-amendment-02.md`（表示名 `BiimMotion` 確定）
5. `docs/requirements/ORCHESTRATION_PLAN.md`（計画書。§5.1 T5 の T5-4 項目と CP-W1 行、§5.0 共通条件、§5.4 #15）
6. T3 の実装記録 `../BiimMakerWebUI-wt/T3/docs/work/2026-11-13-explainer-ui-harness/tasks/T3/REPORT.md`（読むだけ。T3 のコミットが何を入れるものか確認すること）

## 作業ブランチと基準コミット

- あなたの repo ルートは、この FIX-DIRECTION.md がある worktree です。ブランチは `task/T5-shots` で、worktree は `BiimMakerWebUI-wt\T5-4` のままです。**ブランチを切り替えないこと。新しいブランチ・worktree は作らないこと**。
- 現在の HEAD は `5c573f6`（T0 の撮影スクリプト取り込み）。ステージ済み10ファイル（S1〜S8 の PNG 8枚、`tasks/T5-4/REPORT.md`、`tools/ui-shots.mjs` の修正）が未コミットで残っている。
- `<BASE>` = `2a7d209`（第1波ブランチの最初のコミット）。検証コマンドの `git diff <BASE>...HEAD` にはこの値を使うこと。
- **push はしないこと**（認証は L2 が後で行う）。main へのマージ・直接 push・強制 push は禁止。スペース版（S0〜S5）には触れないこと。既存のコミット履歴を書き換えないこと。`git worktree` で作られた他の worktree に触れないこと。メインのチェックアウトの `.agent-work/` は読むだけで変更しないこと。**既存の `T5-4.done` は上書き・削除しないこと**（初回セッションの完了マーカーとして残す）。

## 修正手順（必ずこの順で）

1. **T3 を cherry-pick で取り込むこと**：T3 の実装コミット `e9f6429`（`Add explainer chapter, shared ghost chapter and record templates to the job harness`。T3 のブランチ `task/T3-docs` にある）。取り込み後に `job-template/AGENTS.md` に解説章が入っていることを確認すること（例：`解説動画モード` の見出しと23項目の存在を grep で確認する）。競合が出た場合は推測で解消せず REPORT.md に記録して L2 の判断を待つこと（作業を止めてよいのはこの場合のみ）。
2. **T4-2〜T4-4 は取り込まないこと**。初回セッションは T4-2〜T4-4 なしに 42/43 まで通っており、残る1件の失敗は T3 不足が原因と特定済みのため。元の DIRECTION でも取り込み対象外とされている。
3. **`npm test` を再実行し、全件合格を確認すること**。T3 の取り込みで `tests/harness-docs.test.ts`（7件）が追加されるため、件数は初回の43件から50件になる見込み。件数を REPORT.md に記録すること。失敗したテストがあれば、その内容を REPORT.md に書くこと（テストを弱めたり、禁止された文書を手編集したりしないこと）。
4. **`npm run build -- --base=/BiimMotionWebUI/` を再実行し、成功を確認すること**（C-2）。Git Bash では `MSYS_NO_PATHCONV=1` を付けること。**スクリーンショットの撮り直しはしないこと**（T3 の取り込みは WebUI のビルドに影響しないため。S1〜S8 は初回セッションのものをそのまま使う）。
5. **ステージ済み10ファイルの内容を変更しないこと**（REPORT.md への追記を除く）。コミット前に `git status --short` で10ファイルが揃っていること（S1〜S8 の PNG 8枚、`tasks/T5-4/REPORT.md`、`tools/ui-shots.mjs` の修正）を確認すること。
6. **10ファイルをコミットすること**。件名は計画書 §5.4 #15（英語・命令形）：`Record wave-1 UI screenshots`。コミットメッセージの末尾に規定の帰属行を付けること（書式は過去のコミットの末尾を参照。ファイルには書かない）。T3 の cherry-pick は元のコミットメッセージのまま別コミットとして残すこと（履歴を書き換えないこと）。

## S3 の扱い（初回セッションの残件）

- S3 で歌詞統計パネルが画面外なのは、T0 のときと同じ許容とする。候補3案と準備度、準備度の「歌詞6行」が写っているためである。撮り直し・画像合成・UI 改変・追加ショットは行わないこと。REPORT.md の該当箇所に、この許容を L2 決定として記録すること（初回 REPORT にも同じ趣旨が書いてある）。

## C-3 の既知の残件

- `git diff --check 2a7d209...HEAD` は `tests/qc.test.ts:47: new blank line at EOF` の1件を出す。これは T4-1 由来の既知のもので、T5-review の決定により**修正は G4-α の統合時に行う**。**本修正セッションでは直さないこと。** 出力を REPORT.md に記録すること。T3 の取り込み後に `git diff --check` の出力がこの1件以外に増えていないことを確認すること。

## 完了条件

- T3 の `e9f6429` が cherry-pick で取り込まれ、`job-template/AGENTS.md` に解説章があること。
- `npm test` が全件合格（50件見込み。件数を記録すること）。
- `npm run build -- --base=/BiimMotionWebUI/` が成功。
- `docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1/` に S1〜S8 の8枚が揃っていること（初回セッションのもの）。
- S6 の情報ダイアログに motion-kit 数 15 が写っていること（初回セッションで確認済み。再撮影はしないが、記録が REPORT.md にあることを確認すること）。
- 撮影手順と修正内容が REPORT.md に再現可能な形で記録されていること。
- 10ファイルが `Record wave-1 UI screenshots` としてコミットされていること。

## 検証コマンド

```sh
npm test
npm run build -- --base=/BiimMotionWebUI/
ls docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1 | wc -l   # =8
git diff --check 2a7d209...HEAD   # 既知の1件（tests/qc.test.ts:47）のみ
```

- C-1〜C-6。ただし **C-3 について既知の残件がある**：上記の `tests/qc.test.ts:47` の末尾空行を除く。
- C-4 の確認では、`tests/job.test.ts` の削除行は motion-kit 数の1行（12→15）だけであること（T5b の許容範囲と同じ）。確認コマンドは元の DIRECTION.md を参照すること。
- C-5：`git diff --stat 2a7d209...HEAD` のファイル一覧で、触らない範囲に変更が無いこと。
- C-6：追加した行にローカル絶対パス・メールアドレス・認証情報が無いこと。確認コマンドは計画書 §5.0 の C-6 を参照すること（コマンド文を本 FIX-DIRECTION.md に転記しないこと）。
- C-7：`node_modules/`・`dist/`・`.verification/`・`package-lock.json` の既存の中身を読み込んでいない（REPORT に明記）。
- C-8：作業記録の写しが一致：`cmp docs/work/2026-11-13-explainer-ui-harness/PLAN.md docs/requirements/ORCHESTRATION_PLAN.md`（計画を変えたタスク・ゲートのみ）。

## 触らない範囲

- `src/`（本修正セッションでは触らない。撮影・修正だけが仕事）
- `job-template/`（取り込みは cherry-pick で行い、手で編集しないこと）
- `tests/job.test.ts`（取り込みで motion-kit 数が変わるだけ。手で編集しないこと）、`tests/ghost.test.ts`（無変更。N2）、`tests/imagegen.test.ts`、`tests/qc.test.ts`（T4 の対象。**末尾空行は直さないこと**。上記 C-3 の既知の残件を参照）、`tests/harness-docs.test.ts`（T3 の対象。cherry-pick で入るもの以外は触らないこと）、`tests/explainer.test.ts`（T5 の対象）
- `tools/make-fixture.ts`（T4 の対象）、`index.html`、ルートの `package.json`
- `docs/requirements/` 配下（要件書・Amendment・計画書）、`docs/work/2026-11-13-explainer-ui-harness/` 配下の `PLAN.md`・`BRIEF.md`・`ENVIRONMENT.md`・`QUESTIONS.md`・`G2-REVIEW*.md`・`CONTRACT.md`・`tasks/T0/`・`tasks/T1/`・`tasks/T2/`・`tasks/T3/`・`tasks/T4/`・`tasks/T5/`・`tasks/T5b/`（自分の `tasks/T5-4/` 以外）
- ルートの `README.md`・`VERIFICATION.md`（T8a の対象。本修正セッションでは触らないこと。CP-W1 の所在の追記は T8a の仕事）
- `CONTRACT.md` には触れないこと。
- `agentPromptFor("mv")` と MV の brief はバイト単位で変えないこと。
- ステージ済みのスクリーンショット S1〜S8 の内容を変更しないこと。撮り直しはしないこと。

## 起動時チェック（計画書 §8.1。最初に行い、結果を REPORT.md に記録すること）

1. 自分の層（L3 実働 B）を確認する。
2. 次を確かめて記録する：エージェント製品とモデル・effort／サブエージェントを起動できるか／コマンドを実行できるか（`node -v`、`npm -v`、`git`）／対話できるか／ネットワーク（`npm ci` の成否で確認する）／ヘッドレス Chrome（本タスクでは撮り直しをしないため不要。未確認でよい）／Aivis エンジン・GPU レンダーは本タスクでは不要。
3. 縮退レベルを決め（計画書 §8.2）、「レベル・理由・自己判定になるゲート」を書いてから作業に入る。縮退しても守る最低限の関門は §8.3 の5項目。自己レビューになってもオーナー目視の強制はしない（HN-13 置換）。
4. この worktree には `node_modules/` が無い場合がある。その場合は `npm ci` を試みること。ネットワークが使えなければ §8 の縮退として記録し、テスト・ビルドの合格を主張しないこと。
5. `ENVIRONMENT.md` には直接追記しないこと。起動時チェックの行は REPORT.md に記録し、統合時に L2 が集約する。

## REPORT.md

`docs/work/2026-11-13-explainer-ui-harness/tasks/T5-4/REPORT.md` に追記すること（初回セッションの記録は残し、末尾に「修正」節を追加する。書き直し・削除はしないこと）。載せるもの：起動時チェック、T3 の取り込み記録（コミットと確認結果）、`npm test` の再実行結果（件数と合否）、ビルドの再実行結果、コミット（件名とハッシュ）、C-3 の既知の残件の出力、S3 の許容の記録、縮退レベル。最後に最終メッセージとして、変更したファイルと検証結果の要約を出力すること。

## 禁止事項

- 承認を求められたら（承認カード等）、**承認せずに止めて** REPORT.md に状態を書くこと。
- 実行できない検証を「合格」と書かないこと。未検証は未検証と明記すること。
- 自分で自分の成果物を合格と判定しないこと（G3 は L2 の仕事）。
- 質問が発生したら REPORT.md に書いて既定の判断で進めること（対話はできない）。
