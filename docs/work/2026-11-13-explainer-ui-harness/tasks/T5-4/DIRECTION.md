# DIRECTION — T5-4 CP-W1 スクリーンショット（S1〜S8 の撮影）

- 作業ID: `2026-11-13-explainer-ui-harness`
- あなたは **L3 実働 B（Codex、非対話セッション、モデル `gpt-6.1-sol`、effort high）**です。撮影と記録が仕事です。G3 は T5 の一環として L2 が記録を確認して行うため、**自分で自分の成果物を合格と判定してはいけません**。
- サブエージェントの使用は可（L4 下請け）。使う場合は REPORT.md に記録すること。
- 表示名は **`BiimMotion` 確定**です（Amendment 02、オーナー決定 2026-11-13 20:36）。暫定扱いにしないこと。repo 名・Pages URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物で変えません。

## 最初に読むもの（この順で）

1. `docs/requirements/2026-11-13-amendment-01.md`（最優先。AM-1 目視ゲート廃止、AM-2 様式自由度。**スクリーンショットは証拠記録であり、待ち点ではない**）
2. `docs/requirements/2026-11-13-amendment-02.md`（表示名 `BiimMotion` 確定）
3. `docs/requirements/2026-11-13-explainer-ui-harness.md`（要件書。特に §3.4 の S1〜S8 の条件、§2.6 ゲートと助言の線引き）
4. `docs/requirements/ORCHESTRATION_PLAN.md`（計画書。§5.1 T5 の T5-4 項目と CP-W1 行、§5.0 共通条件、§5.4 #15、§6.1 ブランチも読むこと）
5. T5 の実装記録 `../BiimMakerWebUI-wt/T5/docs/work/2026-11-13-explainer-ui-harness/tasks/T5/REPORT.md`（読むだけ。T5-1〜T5-3 の内容と、T5-4 が未実施だったことの記録）
6. T5b の実装記録 `../BiimMakerWebUI-wt/T5b/docs/work/2026-11-13-explainer-ui-harness/tasks/T5b/REPORT.md`（読むだけ。**motion-kit 数の実数（15）、部品名、取り込みコミット**を確認すること）
7. T5 の交差レビュー記録 `../BiimMakerWebUI-wt/T5-review/docs/work/2026-11-13-explainer-ui-harness/tasks/T5/G3-REVIEW.md`（読むだけ。PASS。**「撮影時に motion-kit 数が 15 であることを確認すること」**という指示がある）
8. T0 の撮影スクリプトの使い方（下記「取り込みの順序」で取り込む `tools/ui-shots.mjs` の先頭コメントと、T0 の記録 `../BiimMakerWebUI-wt/T0/docs/work/2026-11-13-explainer-ui-harness/tasks/T0/REPORT.md` の撮影手順。読むだけ）

## 作業ブランチと基準コミット

- あなたの repo ルートは、この DIRECTION.md がある worktree です。ブランチは `task/T5-shots` で、波のブランチ `feat/explainer-harness` から分岐済みです。**ブランチを切り替えないこと**。
- `<BASE>` = `2a7d209`（第1波ブランチの最初のコミット）。検証コマンドの `git diff <BASE>...HEAD` にはこの値を使うこと。差分には L2 による発注記録（本 DIRECTION.md 等のコミット）と、下記の取り込みコミットも含まれるが、完了条件の判定には影響しない。
- コミットは1件にまとめること。件名は計画書 §5.4 #15（英語・命令形）：`Record wave-1 UI screenshots`。C-1・C-2 が通ること。コミットメッセージの末尾に規定の帰属行を付けること（書式は過去のコミットの末尾を参照。ファイルには書かない）。
- **push はしないこと**（認証は L2 が後で行う）。main へのマージ・直接 push・強制 push は禁止。スペース版（S0〜S5）には触れないこと。

## 取り込みの順序（必ず守ること）

撮影には T5・T5b の実装が入った状態のビルドが要る。取り込みは cherry-pick で行い、取り込みコミットとして残すこと。順序は依存順にすること：

1. **T4-1 の取り込み**：T4-1 `15b42a7`（`job-template/runtime/scripts/caption-capacity.mjs`＋型宣言。T4 のブランチ `task/T4-qc` にある）。T5-1 がこれを import しているため、無ければビルドが通らない。取り込み後に `caption-capacity.mjs` と型宣言ファイルが自分の worktree にあることを確認すること。**T4-2〜T4-4 は取り込まないこと**（撮影には不要）。
2. **T5 の取り込み**：T5 のブランチ `task/T5-webui` の T5-1 `5177bbc` → T5-2 `1f7099a` → T5-3 `424bc75` を cherry-pick する。T5-4 は T5 のブランチには無い（T5 の REPORT に未実施と記録されている）。
3. **T5b の取り込み**：T5b のブランチ `task/T5b-motion-kit` の実装コミット `b57d2a5` を cherry-pick する。T5b の G3 記録 `daece82` は取り込まなくてよい。取り込み後に `tests/job.test.ts` の motion-kit 数が 15 になっていることを確認すること。
4. **T0 の撮影スクリプトの取り込み**：T0 のブランチ `task/T0-base` の `7519188`（`.gitignore` への `.agent-work/` 追加＋`tools/ui-shots.mjs` 新設）を cherry-pick する。**波のブランチにはこのスクリプトは無い**（T0 の成果はまだ波のブランチに統合されていない）。`bf56c4d`（監査の写しと刷新前スクショ）は取り込まないこと（T5-4 の範囲外）。取り込み後に `tools/ui-shots.mjs` が自分の worktree にあることと、`git check-ignore .agent-work/PM_BRIEF.md` が通ることを確認すること。
5. 取り込み時に競合が出た場合は、推測で解消せず REPORT.md に記録して L2 の判断を待つこと（作業を止めてよいのはこの場合のみ）。

## 対象ファイル

- `docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1/`（CP-W1 の S1〜S8。8枚）
- `docs/work/2026-11-13-explainer-ui-harness/tasks/T5-4/REPORT.md`（撮影手順と確認結果）
- 必要なら `tools/ui-shots.mjs`（撮影手順の追加・セレクタの修正のみ。T5 の新しい入力にスクリプトのセレクタが届かない場合に限る。下記「内容の要点」も参照）

## 内容の要点（計画書 §5.1 T5、要件書 §3.4）

- 撮影は Pages 用ビルドをローカルで配信し、ヘッドレス Chrome で撮る（T0 と同じ方法）。手順：
  ```sh
  npm run build -- --base=/BiimMotionWebUI/
  node tools/ui-shots.mjs --out=docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1
  ```
  Git Bash では `MSYS_NO_PATHCONV=1` を付けること（`--base=/BiimMotionWebUI/` が Windows パスに書き換わるのを防ぐ。T0 のスクリプト先頭コメントも参照）。
- S1〜S8 の条件（要件書 §3.4）：S1 1440×900・解説モード・初期状態／S2 1440×900・解説モード・サンプル入力後（方向性のたたき台が見える位置）／S3 1440×900・MV モード・入力済み（歌詞統計・たたき台・準備度が見える）／S4 1440×900・必須未入力で生成を押した状態（エラー表示）／S5 1440×900・ゴースト検査結果を読み込んだ状態／S6 1440×900・情報ダイアログ／S7 390×844・解説モード／S8 390×844・MV モード。
- **S6 で motion-kit 数が 15 であることを確認すること**（T5-review の指示。T5-3 で自動算出される表示が T5b の部品追加で 15 になっているはず）。15 でなければ REPORT.md に記録し、最終メッセージでも知らせること（撮影のやり直しは L2 の判断を待つ）。
- スクリプトのセレクタは刷新前の DOM（CP-A0）向けである。T5 の新しい入力（01 の新入力、たたき台、様式モード選択）にセレクタが届かず S2 等が撮れない場合は、スクリプトをその撮影手順の範囲で最小限に修正してよい。修正した場合は REPORT.md に変更箇所と理由を記録すること。T6／T7 の UI 刷新はまだ無いので、刷新後のセレクタ更新はしないこと。
- スクリーンショットは証拠記録であり、見た目の評価はしないこと（AM-1）。写っている内容の良し悪しを判定しないこと。

## 完了条件

- `docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1/` に S1〜S8 の8枚が揃うこと。
- S6 の情報ダイアログに motion-kit 数 15 が写っていること。
- 撮影手順が REPORT.md に再現可能な形で記録されていること。

## 検証コマンド

```sh
npm test
npm run build -- --base=/BiimMotionWebUI/
ls docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1 | wc -l   # =8
```

- C-1〜C-6。ただし **C-3 について既知の残件がある**：T4-1 の取り込みにより `tests/qc.test.ts` が47行目で終わり末尾に空行があるため、`git diff --check 2a7d209...HEAD` は `tests/qc.test.ts:47: new blank line at EOF` を出す。これは T5 の C-3 残件と同じもので、T5-review の決定により**修正は G4-α の統合時に行う**。**T5-4 では直さないこと。** 出力を REPORT.md に記録すること。T5b のように T4-1〜T4-4 を通して取り込んで消す方法もあるが、T5-4 の取り込み対象は上の順序のとおりとし、範囲を広げないこと。
- C-4 の確認では、`tests/job.test.ts` の削除行は motion-kit 数の1行（12→15）だけであること（T5b の許容範囲と同じ）。

## 全タスク共通の完了条件（計画書 §5.0。`<BASE>` = `2a7d209`）

- **C-1** `npm test` が合格。
- **C-2** `npm run build -- --base=/BiimMotionWebUI/` が合格。
- **C-3** `git diff --check <BASE>...HEAD` が空。**ただし上記の既知の残件（`tests/qc.test.ts:47` の末尾空行）を除く。** 出力を REPORT.md に記録すること。
- **C-4 MV 非退行**：既存の MV 関連テスト（`tests/job.test.ts` の MV 5件、`tests/ghost.test.ts` 全件、`tests/imagegen.test.ts` 全件）が**テスト側の変更なし**で通る。確認コマンド：
  ```sh
  git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts
  git diff -U0 955fa5c -- tests/job.test.ts | grep '^-[^-]'   # 出力は motion-kit 数の1行だけであること
  ```
- **C-5** `DIRECTION.md` の「触らない範囲」に変更が無い（`git diff --stat <BASE>...HEAD` のファイル一覧で確認）。
- **C-6** 追加した行にローカル絶対パス・メールアドレス・認証情報が無いこと。確認コマンドは計画書 §5.0 の C-6 を参照すること（コマンド文を本 DIRECTION.md に転記しないこと）。
- **C-7** `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の既存の中身を読み込んでいない（REPORT に明記）。**例外**：検証のために自分で生成したフィクスチャに対して `validate`・`qc`・`diff`・`cmp` を実行し、その出力を見るのは可（ファイル全体をコンテキストに読み込まない）。
- **C-8** 作業記録の写しが一致：`cmp docs/work/2026-11-13-explainer-ui-harness/PLAN.md docs/requirements/ORCHESTRATION_PLAN.md`（計画を変えたタスク・ゲートのみ）。

## 触らない範囲

- `src/`（T5-4 では触らない。撮影だけが仕事）
- `job-template/`（取り込みは cherry-pick で行い、手で編集しないこと）
- `tests/job.test.ts`（取り込みで motion-kit 数が変わるだけ。手で編集しないこと）、`tests/ghost.test.ts`（無変更。N2）、`tests/imagegen.test.ts`、`tests/qc.test.ts`（T4 の対象。**末尾空行は直さないこと**。上記 C-3 の既知の残件を参照）、`tests/harness-docs.test.ts`（T3 の対象）、`tests/explainer.test.ts`（T5 の対象）
- `tools/make-fixture.ts`（T4 の対象）、`index.html`、ルートの `package.json`
- `docs/requirements/` 配下（要件書・Amendment・計画書）、`docs/work/2026-11-13-explainer-ui-harness/` 配下の `PLAN.md`・`BRIEF.md`・`ENVIRONMENT.md`・`QUESTIONS.md`・`G2-REVIEW*.md`・`CONTRACT.md`・`tasks/T0/`・`tasks/T1/`・`tasks/T2/`・`tasks/T3/`・`tasks/T4/`・`tasks/T5/`・`tasks/T5b/`（自分の `tasks/T5-4/` 以外）
- ルートの `README.md`・`VERIFICATION.md`（T8a の対象。T5-4 では触らないこと。CP-W1 の所在の追記は T8a の仕事）
- `CONTRACT.md` には触れないこと。
- `agentPromptFor("mv")` と MV の brief はバイト単位で変えないこと。
- 既存のコミット履歴を書き換えないこと。`git worktree` で作られた他の worktree に触れないこと。メインのチェックアウトの `.agent-work/` は読むだけで変更しないこと。

## 起動時チェック（計画書 §8.1。最初に行い、結果を REPORT.md に記録すること）

1. 自分の層（L3 実働 B）を確認する。
2. 次を確かめて記録する：エージェント製品とモデル・effort／サブエージェントを起動できるか／コマンドを実行できるか（`node -v`、`npm -v`、`git`）／対話できるか／ネットワーク（`npm ci` の成否で確認する）／**ヘッドレス Chrome（本タスクの撮影に要る）**／Aivis エンジン・GPU レンダーは本タスクでは不要。
3. 縮退レベルを決め（計画書 §8.2）、「レベル・理由・自己判定になるゲート」を書いてから作業に入る。縮退しても守る最低限の関門は §8.3 の5項目。自己レビューになってもオーナー目視の強制はしない（HN-13 置換）。
4. この worktree には `node_modules/` が無い場合がある。その場合は `npm ci` を試みること。ネットワークが使えなければ §8 の縮退として記録し、テスト・ビルドの合格を主張しないこと。
5. `ENVIRONMENT.md` には直接追記しないこと。起動時チェックの行は REPORT.md に記録し、統合時に L2 が集約する。

## REPORT.md

`docs/work/2026-11-13-explainer-ui-harness/tasks/T5-4/REPORT.md` に書くこと。取り込みの記録（T4-1・T5-1〜T5-3・T5b・T0 の各コミットと確認結果）、撮影手順（実行したコマンド、ビルドの結果、Chrome の確認）、S1〜S8 の枚数と S6 の motion-kit 数の確認結果、スクリプトを修正した場合はその変更箇所と理由、C-3 の既知の残件の出力、縮退レベルを載せること。最後に最終メッセージとして、変更したファイルと検証結果の要約を出力すること。

## 禁止事項

- 承認を求められたら（承認カード等）、**承認せずに止めて** REPORT.md に状態を書くこと。
- 実行できない検証を「合格」と書かないこと。未検証は未検証と明記すること。
- 自分で自分の成果物を合格と判定しないこと（G3 は L2 の仕事）。
- 質問が発生したら REPORT.md に書いて既定の判断で進めること（対話はできない）。
