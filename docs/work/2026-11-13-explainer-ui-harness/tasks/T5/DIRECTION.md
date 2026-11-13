# DIRECTION — T5 WebUI 解説支援（ロジックと最小限の配線）

- 作業ID: `2026-11-13-explainer-ui-harness`
- あなたは **L3 実働 B（Codex、非対話セッション、モデル `gpt-6.1-sol`、effort high）**です。実装するのが仕事です。レビュー（G3）は交差レビュー（実働 A＝あなたとは別コンテキストの Opus セッション）が行うため、**自分で自分の成果物を合格と判定してはいけません**。
- サブエージェントの使用は可（L4 下請け）。使う場合は REPORT.md に記録すること。
- 表示名は **`BiimMotion` 確定**です（Amendment 02、オーナー決定 2026-11-13 20:36）。暫定扱いにしないこと。repo 名・Pages URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物で変えません。

## 最初に読むもの（この順で）

1. `docs/requirements/2026-11-13-amendment-01.md`（最優先。AM-1 目視ゲート廃止、AM-2 様式自由度）
2. `docs/requirements/2026-11-13-amendment-02.md`（表示名 `BiimMotion` 確定）
3. `docs/requirements/2026-11-13-explainer-ui-harness.md`（要件書。特に §2.6 ゲートと助言の線引き、EX-08、EX-09、EX-21〜26、EX-32、EX-34、AM-2 の含意）
4. `docs/requirements/ORCHESTRATION_PLAN.md`（計画書。§5.1 T5 がこのタスク票の正本。§5.0 共通条件、§5.3 MV 生成物の許容差分一覧と差分検査の手順、§6.1 ブランチも読むこと）
5. `docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（T1 の契約。確定版）。**注意：自分の worktree にはこのファイルは無い。** 波のブランチにはまだ取り込まれていないため、T1 の worktree にある確定版を読むこと：相対パス `../BiimMakerWebUI-wt/T1/docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（コミット `8d8ba75` の内容）。特に §3（`MotionForm`・`project.json` の追加項目、`schema_version` の新値）、§4（様式モード契約）、§6（字幕帯域の置き場所・型）。読むだけで、変更しないこと。ファイルが無ければ作業を止めて REPORT.md に書くこと。契約の内容を推測で補ってはならない。
6. T3 の job-template（読むだけ）。自分の worktree には T3 の成果は無い。T3 の worktree にある確定版を読むこと：相対パス `../BiimMakerWebUI-wt/T3/job-template/AGENTS.md`（コミット `759be8d` の内容）。`explainerQualityChecklist` の23項目と `job-template/AGENTS.md` の一致テスト（下記「取り込みの順序」）に使う。読むだけで、変更しないこと。
7. 現行の `src/job.ts`、`src/App.tsx`、`src/mv-assist.ts`（自分の worktree 内。変更対象の原本と、MV 側の不変条件の見本）。

## 作業ブランチと基準コミット

- あなたの repo ルートは、この DIRECTION.md がある worktree です。ブランチは `task/T5-webui` で、波のブランチ `feat/explainer-harness` から分岐済みです。**ブランチを切り替えないこと**。
- `<BASE>` = `2a7d209`（第1波ブランチの最初のコミット）。検証コマンドの `git diff <BASE>...HEAD` にはこの値を使うこと。差分には L2 による発注記録（本 DIRECTION.md 等のコミット）と、下記の取り込みコミットも含まれるが、完了条件の判定には影響しない。
- コミットの分け方（計画書 §5.1 T5。順序厳守）：T5-1 `explainer-assist.ts`＋テスト → T5-2 `job.ts`（フォーム・project・brief・`plan/outline.txt`・依頼文・`schema_version`）＋テスト → T5-3 `App.tsx` の配線（01 の新入力と `scriptStats`、03 のたたき台・解説用差別化メモ、様式モード選択、右カラムの準備度一覧と警告、失敗パターン一覧、motion-kit 数の表示を同梱テンプレートから算出する形へ変更）→ T5-4 CP-W1 のスクリーンショット（文書だけのコミット）。件名は計画書 §5.4 #11〜#13・#15（英語・命令形）：
  - T5-1 `Add explainer direction axes, candidates, script stats and checklist`
  - T5-2 `Carry explainer goals, outline, differentiation and style mode into jobs`
  - T5-3 `Wire explainer assist inputs, readiness and style mode into the form`
  - T5-4 `Record wave-1 UI screenshots`（T5b の後）
  各コミットで C-1・C-2 が通ること。コミットメッセージの末尾に規定の帰属行を付けること（書式は過去のコミットの末尾を参照。ファイルには書かない）。
- **push はしないこと**（認証は L2 が後で行う）。main へのマージ・直接 push・強制 push は禁止。スペース版（S0〜S5）には触れないこと。

## 取り込みの順序（必ず守ること）

- **T4-1 の取り込み（着手の最初）**: T5 は T4-1 のコミット `15b42a7`（`job-template/runtime/scripts/caption-capacity.mjs`＋型宣言。T4 のブランチ `task/T4-qc` にある）を取り込んでから着手すること。取り込みは cherry-pick（`git cherry-pick 15b42a7`）で行い、取り込みコミットとして残すこと。取り込んだら `caption-capacity.mjs` と型宣言ファイルが自分の worktree にあることと、`npm test` が通ることを確認し、REPORT.md に記録すること。T4-2〜T4-4 は取り込まないこと（`qc.mjs`・`validate.mjs` の変更は T5 の範囲外）。
- **T3 の取り込み（一致テストの前）**: `explainerQualityChecklist` と `job-template/AGENTS.md` の一致テストだけは、T3 を取り込んでから追加すること。T3 の取り込みは T3 のブランチ `task/T3-docs`（HEAD `759be8d`）を cherry-pick またはマージして行うこと。T5-1・T5-2 のそれ以外の作業は T3 の取り込み前に進めてよい。取り込み時に競合が出た場合は、推測で解消せず REPORT.md に記録して L2 の判断を待つこと（作業を止めてよいのはこの場合のみ）。
- **T5b の取り込み（T5-4 の前）**: T5-4 のスクリーンショットは、T5b を取り込んでから撮ること。motion-kit 数が情報ダイアログ S6 に出るためである。T5b はまだ発注されていない。T5-3 まで終わった時点で T5b が取り込めない場合は、T5-4 を撮らずに REPORT.md にその旨を記録し、最終メッセージでも知らせること（T5-4 は後から撮る）。**T9b は `tools/` のみで UI に影響しないため、待たないこと。**

## 対象ファイル

- `src/explainer-assist.ts`（新設）
- `src/job.ts`
- `src/App.tsx`（**現行の見た目のままの最小配線**。クラスは既存を流用し、新しい見た目は作らない）
- `tests/explainer.test.ts`（新設。`tests/job.test.ts` には追記しない）
- `tools/ui-shots.mjs`（新しい入力の撮影手順の追加のみ）
- `screenshots/wave1/`（CP-W1 の S1〜S8）

## 内容の要点（計画書 §5.1 T5）

- `explainerAxes` の「視覚様式」軸は様式モード（biim／anime／motion／mixed）と各モード内の見た目の型を持ち、`explainerCandidates` は**まず様式モードを同格に選んでから**型を選ぶこと（Biim に偏らない）。`context` は人数（1人・2人・キャラなし）と向き（縦では biim／mixed を除外）。
- たたき台の採用は「デザイン方向性への追記」までとし、様式モードの選択は利用者の操作に残すこと。採用案と選択中の様式モードが食い違う場合は準備度一覧に注意を出すこと。
- 字幕帯域の判定は T4-1 の `caption-capacity.mjs`（取り込み済み）を流用し、自分で式・係数を再実装しないこと。型の与え方は T1 の契約 §6 に従うこと。
- `agentPromptFor` は MV の文字列をバイト単位で変えないこと。解説の文は様式モードを反映し、非 Biim 様式では Biim レイアウトの指示を含めないこと（既存の ghost-check の文は残す）。
- brief も同様：`anime`／`motion` では Biim 枠・ノート欄を使う指示を出さないこと。
- MV のフォーム値・`project.json`（`schema_version` 以外）・brief・`plan/lyrics.txt` を変えないこと。
- `schema_version` は T1 の契約の新値（0.3→0.4）に上げること（T5-2）。

## 完了条件

- EX-21 の export が揃うこと。
- テストで次が表明されること：全軸で相違・seed で決定・キャラ設定で軸が切り替わる・縦で biim／mixed が出ない・**400 seed で4モードの出現がそれぞれ全体の15%以上**（同格の検査）・`scriptStats` の各値・解説 ZIP の `project.json`／`brief.md`／`plan/outline.txt` に入力が反映・**解説 brief が理解先的設計の原則・方向性3案・事前／事後ゲート（`npm run qc`）・23項目を含む**（EX-32）・`anime`／`motion` の brief と依頼文に Biim 枠・ノート欄を使う指示が無い・`explainerQualityChecklist` の23項目がすべて `job-template/AGENTS.md` にも存在（定義の一致、T3 の後）・MV のプロンプトと brief が基準コミットと一致。
- **CP-W1**（S1〜S8、現行の見た目に配線した状態）を `screenshots/wave1/` に記録すること（UI を変えるので AM-1 規則2により公開前に必須）。

## 検証コマンド

```sh
npm test
npm run build -- --base=/BiimMotionWebUI/
```

- `npm run dev` で解説・MV の両モードを操作し、新入力・統計・たたき台・様式選択・準備度・失敗パターンが出ることを REPORT.md に記録すること（見た目の評価はしない）。操作の証拠は `tools/ui-shots.mjs` による撮影（T5-4）と、dev サーバへの確認で残すこと。対話で操作できない場合は、使った方法を REPORT.md に書き、実施していない操作を「確認済み」と書かないこと。
- `ls docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1 | wc -l`（=8）。
- C-1〜C-6。

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

- `job-template/`（取り込みは cherry-pick／マージで行い、手で編集しないこと。`job-template/AGENTS.md` は読むだけ）
- `job-template/runtime/scripts/`（`caption-capacity.mjs` は T4-1 の取り込みで入る。自分で書き換えないこと）
- `tests/job.test.ts`（追記しない。motion-kit 数の1行の変更は T5b の許容範囲であり、T5 の範囲ではない）
- `tests/ghost.test.ts`（無変更。N2）、`tests/imagegen.test.ts`、`tests/qc.test.ts`（T4 の対象）、`tests/harness-docs.test.ts`（T3 の対象）
- `tools/make-fixture.ts`（T4 の対象）、`index.html`、ルートの `package.json`
- `docs/requirements/` 配下（要件書・Amendment・計画書）、`docs/work/2026-11-13-explainer-ui-harness/` 配下の `PLAN.md`・`BRIEF.md`・`ENVIRONMENT.md`・`QUESTIONS.md`・`G2-REVIEW*.md`・`CONTRACT.md`・`tasks/T0/`・`tasks/T1/`・`tasks/T2/`・`tasks/T3/`・`tasks/T4/`（自分の `tasks/T5/` 以外）
- `CONTRACT.md` には触れないこと。
- `agentPromptFor("mv")` と MV の brief はバイト単位で変えないこと（上記「内容の要点」も参照）。
- 既存のコミット履歴を書き換えないこと。`git worktree` で作られた他の worktree に触れないこと。メインのチェックアウトの `.agent-work/` は読むだけで変更しないこと。

## 起動時チェック（計画書 §8.1。最初に行い、結果を REPORT.md に記録すること）

1. 自分の層（L3 実働 B）を確認する。
2. 次を確かめて記録する：エージェント製品とモデル・effort／サブエージェントを起動できるか／コマンドを実行できるか（`node -v`、`npm -v`、`git`）／対話できるか／ネットワーク（`npm ci` の成否で確認する）／ヘッドレス Chrome（T5-4 の撮影に要る）／Aivis エンジン・GPU レンダーは本タスクでは不要。
3. 縮退レベルを決め（計画書 §8.2）、「レベル・理由・自己判定になるゲート」を書いてから作業に入る。縮退しても守る最低限の関門は §8.3 の5項目。自己レビューになってもオーナー目視の強制はしない（HN-13 置換）。
4. この worktree には `node_modules/` が無い場合がある。その場合は `npm ci` を試みること。ネットワークが使えなければ §8 の縮退として記録し、テスト・ビルドの合格を主張しないこと。
5. `ENVIRONMENT.md` には直接追記しないこと。起動時チェックの行は REPORT.md に記録し、統合時に L2 が集約する。

## REPORT.md

`docs/work/2026-11-13-explainer-ui-harness/tasks/T5/REPORT.md` に書くこと。コミットごとの証拠（T5-1〜T5-4 の検証コマンドの出力、400 seed のモード分布、MV のプロンプト・brief のバイト一致の証拠、dev サーバでの操作記録、スクリーンショットの枚数、T4-1・T3・T5b の取り込みの記録、縮退レベル）を載せること。最後に最終メッセージとして、変更したファイルと検証結果の要約を出力すること。

## 禁止事項

- 承認を求められたら（承認カード等）、**承認せずに止めて** REPORT.md に状態を書くこと。
- 実行できない検証を「合格」と書かないこと。未検証は未検証と明記すること。
- 自分で自分の成果物を合格と判定しないこと（G3 は交差レビュー＝実働 A の仕事）。
- 質問が発生したら REPORT.md に書いて既定の判断で進めること（対話はできない）。
