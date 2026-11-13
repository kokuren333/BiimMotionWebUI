# DIRECTION — T5b motion-kit の非 Biim 提示部品

- 作業ID: `2026-11-13-explainer-ui-harness`
- あなたは **L3 実働 B（Codex、非対話セッション、モデル `gpt-6.1-sol`、effort high）**です。実装するのが仕事です。レビュー（G3）は L2 が検証コマンドを再実行して行うため、**自分で自分の成果物を合格と判定してはいけません**。
- サブエージェントの使用は可（L4 下請け）。使う場合は REPORT.md に記録すること。
- 表示名は **`BiimMotion` 確定**です（Amendment 02、オーナー決定 2026-11-13 20:36）。暫定扱いにしないこと。repo 名・Pages URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物で変えません。

## 最初に読むもの（この順で）

1. `docs/requirements/2026-11-13-amendment-01.md`（最優先。AM-1 目視ゲート廃止、AM-2 様式自由度）
2. `docs/requirements/2026-11-13-amendment-02.md`（表示名 `BiimMotion` 確定）
3. `docs/requirements/2026-11-13-explainer-ui-harness.md`（要件書。特に §2.6 ゲートと助言の線引き、AM-2 の4、EX-34）
4. `docs/requirements/ORCHESTRATION_PLAN.md`（計画書。§5.1 T5b がこのタスク票の正本。§5.0 共通条件、§5.3 MV 生成物の許容差分一覧と差分検査の手順、§6.1 ブランチも読むこと）
5. `docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（T1 の契約。確定版）。**注意：自分の worktree にはこのファイルは無い。** 波のブランチにはまだ取り込まれていないため、T1 の worktree にある確定版を読むこと：相対パス `../BiimMakerWebUI-wt/T1/docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（コミット `8d8ba75` の内容）。特に §4.8（非 Biim 提示部品の名前と API）。読むだけで、変更しないこと。ファイルが無ければ作業を止めて REPORT.md に書くこと。部品名を推測で補ってはならない
6. T3 の job-template（読むだけ）。T3 の worktree にある確定版を読むこと：相対パス `../BiimMakerWebUI-wt/T3/job-template/AGENTS.md`（コミット `759be8d` の内容）。非 Biim 部品の扱い（様式モード節、解説動画の演出と実装の規則の追記）が書かれている。読むだけで、変更しないこと。自分の worktree への取り込みは下記「取り込みの順序」に従うこと
7. `docs/work/2026-11-13-explainer-ui-harness/tasks/T5/REPORT.md`（T5 の実装記録。T5-3 の App.tsx 配線と motion-kit 数の自動算出の証拠）と T4 の交差レビュー記録 `../BiimMakerWebUI-wt/T4-review/docs/work/2026-11-13-explainer-ui-harness/tasks/T4/G3-REVIEW.md`（PASS、`6b9d34f`。フィクスチャの使い方と ghost 扱いの決定）。読むだけ
8. 現行の `job-template/motion-kit/`（自分の worktree 内。変更対象の原本）と `job-template/scenes/`、`src/job.ts` の該当箇所

## 作業ブランチと基準コミット

- あなたの repo ルートは、この DIRECTION.md がある worktree です。ブランチは `task/T5b-motion-kit` で、波のブランチ `feat/explainer-harness` から分岐済みです。**ブランチを切り替えないこと**。
- `<BASE>` = `2a7d209`（第1波ブランチの最初のコミット）。検証コマンドの `git diff <BASE>...HEAD` にはこの値を使うこと。差分には L2 による発注記録（本 DIRECTION.md 等のコミット）と、下記の取り込みコミットも含まれるが、完了条件の判定には影響しない。
- コミットは1件にまとめること。件名は計画書 §5.4 #11〜#13・#15（英語・命令形）：`Add non-Biim presentation parts to motion-kit`。C-1・C-2 が通ること。コミットメッセージの末尾に規定の帰属行を付けること（書式は過去のコミットの末尾を参照。ファイルには書かない）。
- **push はしないこと**（認証は L2 が後で行う）。main へのマージ・直接 push・強制 push は禁止。スペース版（S0〜S5）には触れないこと。

## 取り込みの順序（必ず守ること）

依存は T1、T4-3、T4-4、T5-3。いずれも取り込んでから着手すること。取り込みは cherry-pick で行い、取り込みコミットとして残すこと。順序は依存順にすること：

1. **T4 の取り込み**：T4-1 `15b42a7` → T4-2 `1b1bb5b` → T4-3 `70a51de` → T4-4 `5e38423`（T4 のブランチ `task/T4-qc` にある）。**必ず T4-1〜T4-4 を通して取り込むこと。** 途中で止めてはならない。理由：T4-1 の時点で `tests/qc.test.ts` は47行目で終わり末尾に空行があり、`git diff --check` が `new blank line at EOF` を出す（T5 の C-3 残件として L2 が実測で確認済み）。T4-2〜T4-4 でファイルが伸びて空行がファイル途中になり問題が消える。T4-1 だけを取り込むと**同じ末尾空行を持ち込む**ことになる。取り込み後に `git diff --check 2a7d209...HEAD` を実行し、出力が空であることを確認して REPORT.md に記録すること。T4-2 の `qc.mjs` はフィクスチャの検証に使う。T4-3 の `validate.mjs` の様式対応と T4-4 のフィクスチャが無いと、完了条件の検証ができない。
2. **T3 の取り込み**：T3 のブランチ `task/T3-docs` の `e9f6429` → `ded399b` → `759be8d` を cherry-pick する。`job-template/AGENTS.md` は手で編集しないこと。取り込み後に `job-template/AGENTS.md` の様式モード節と非 Biim 部品の記述を確認すること。
3. **T5 の取り込み**：T5 のブランチ `task/T5-webui` の T5-1 `5177bbc` → T5-2 `1f7099a` → T5-3 `424bc75` を cherry-pick する。T5-3 の App.tsx 配線（motion-kit 数の自動算出）が無いと、同梱数の表明が実数と一致しない。T5-4 はまだ無い（T5b の取り込み後に撮るスクリーンショットであり、T5 のブランチにも無い）。取り込み後に `npm test` が通ることを確認し、REPORT.md に記録すること。
4. 取り込み時に競合が出た場合は、推測で解消せず REPORT.md に記録して L2 の判断を待つこと（作業を止めてよいのはこの場合のみ）。

## 対象ファイル

- `job-template/motion-kit/` に非 Biim の提示部品（例：全面シーン、標準字幕、図解の全面表示。名前と API は T1 の契約 §4.8 に従う）
- 必要なら `job-template/scenes/` の非 Biim スターター（様式モードで選ばれる場合は `src/job.ts` の該当箇所のみ）
- `tests/job.test.ts` の motion-kit 数（**許容される唯一の既存行の変更**。下記「完了条件」も参照）

## 内容の要点（計画書 §5.1 T5b）

- 非 Biim の提示部品は T1 の契約 §4.8 の名前と API に従うこと（T3 の AGENTS.md が挙げている部品名と同じであること）。名前を変える場合は AGENTS.md とテストの表明も合わせる必要があるため、変えないこと。変えざるを得ない場合は REPORT.md に記録して L2 の判断を待つこと
- 文字を出す部品は `job-template/motion-kit/layers.ts` の合成レイヤー分離に従うこと（ghost の再発防止。`ghost.test.ts` は無変更で合格すること）
- Biim 部品ゼロのジョブも成立させること。`anime`・`motion` のフィクスチャで Biim 部品を1つも使わないシーン構成が `validate` を通ること（TypeScript 検査を含む）
- **App.tsx を触らないこと。** motion-kit 数の表示は T5-3 で自動算出済みである。T5b の部品追加で数が変われば、表示は自動で追随する。数を手で書き換えてはならない
- `tests/job.test.ts` の変更は motion-kit 数の1行だけが唯一許容される既存行の変更であること。新しい表明が必要なら `tests/job.test.ts` への追記で行うこと（既存行の変更はその1行のみ）

## 完了条件

- 文字を出す部品は `layers.ts` の合成レイヤー分離に従うこと（`ghost.test.ts` 無変更で合格）。
- `anime`・`motion` のフィクスチャで Biim 部品を1つも使わないシーン構成が `validate` を通ること（TypeScript 検査を含む）。
- 同梱数の表明（テスト・App.tsx の表示）が実数と一致すること（App.tsx は T5-3 で自動算出済み）。

## 検証コマンド

```sh
npm test
node --experimental-strip-types tools/make-fixture.ts --style=motion --qc=pass --out=$FX/motion
node --experimental-strip-types tools/make-fixture.ts --style=anime --qc=pass --out=$FX/anime
```

- 展開先で Biim 部品を使わないデモ場面を差し込んで（差し込み手順は REPORT.md に記録すること）、`npm install && npm run validate` が通ること。`$FX` は `mktemp -d` で作った一時ディレクトリ。
- `git diff -U0 <BASE>...HEAD -- tests/job.test.ts | grep '^-[^-]'` の出力が motion-kit 数の1行だけであること。
- C-1〜C-6。

## 全タスク共通の完了条件（計画書 §5.0。`<BASE>` = `2a7d209`）

- **C-1** `npm test` が合格。
- **C-2** `npm run build -- --base=/BiimMotionWebUI/` が合格。
- **C-3** `git diff --check <BASE>...HEAD` が空。**注意**：T4-1 の取り込みで `tests/qc.test.ts` の末尾空行を持ち込まないこと（上記「取り込みの順序」1 を参照）。取り込み後に必ず確認すること。
- **C-4 MV 非退行**：既存の MV 関連テスト（`tests/job.test.ts` の MV 5件、`tests/ghost.test.ts` 全件、`tests/imagegen.test.ts` 全件）が**テスト側の変更なし**で通る。確認コマンド：

```sh
git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts
git diff -U0 955fa5c -- tests/job.test.ts | grep '^-[^-]'
```

2本目（`tests/job.test.ts` の削除行）の出力は motion-kit 数の1行だけであること。

- **C-5** `DIRECTION.md` の「触らない範囲」に変更が無い（`git diff --stat <BASE>...HEAD` のファイル一覧で確認）。
- **C-6** 追加した行にローカル絶対パス・メールアドレス・認証情報が無いこと。確認コマンドは計画書 §5.0 の C-6 を参照すること（コマンド文を本 DIRECTION.md に転記しないこと）。
- **C-7** `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の既存の中身を読み込んでいない（REPORT に明記）。**例外**：検証のために自分で生成したフィクスチャに対して `validate`・`qc`・`diff`・`cmp` を実行し、その出力を見るのは可（ファイル全体をコンテキストに読み込まない）。
- **C-8** 作業記録の写しが一致：`cmp docs/work/2026-11-13-explainer-ui-harness/PLAN.md docs/requirements/ORCHESTRATION_PLAN.md`（計画を変えたタスク・ゲートのみ）。

## 触らない範囲

- `src/App.tsx`（T5b は触らない。motion-kit 数は T5-3 で自動算出済み）
- `src/explainer-assist.ts`、`src/job.ts`（T5b のスターター選択が必要な場合の該当箇所のみ例外）
- `tests/ghost.test.ts`（無変更。N2）、`tests/imagegen.test.ts`、`tests/qc.test.ts`（T4 の対象。取り込みは cherry-pick で行い、手で編集しないこと）、`tests/harness-docs.test.ts`（T3 の対象）、`tests/explainer.test.ts`（T5 の対象）
- `job-template/AGENTS.md`（T3 の対象。取り込みは cherry-pick で行い、手で編集しないこと）、`job-template/runtime/scripts/`（`caption-capacity.mjs`・`qc.mjs`・`validate.mjs` は取り込みで入る。自分で書き換えないこと）
- `tools/make-fixture.ts`（T4 の対象）、`index.html`、ルートの `package.json`
- `docs/requirements/` 配下（要件書・Amendment・計画書）、`docs/work/2026-11-13-explainer-ui-harness/` 配下の `PLAN.md`・`BRIEF.md`・`ENVIRONMENT.md`・`QUESTIONS.md`・`G2-REVIEW*.md`・`CONTRACT.md`・`tasks/T0/`・`tasks/T1/`・`tasks/T2/`・`tasks/T3/`・`tasks/T4/`・`tasks/T5/`（自分の `tasks/T5b/` 以外）
- `CONTRACT.md` には触れないこと。
- `agentPromptFor("mv")` と MV の brief はバイト単位で変えないこと。
- 既存のコミット履歴を書き換えないこと。`git worktree` で作られた他の worktree に触れないこと。メインのチェックアウトの `.agent-work/` は読むだけで変更しないこと。

## 起動時チェック（計画書 §8.1。最初に行い、結果を REPORT.md に記録すること）

1. 自分の層（L3 実働 B）を確認する。
2. 次を確かめて記録する：エージェント製品とモデル・effort／サブエージェントを起動できるか／コマンドを実行できるか（`node -v`、`npm -v`、`git`）／対話できるか／ネットワーク（`npm ci` の成否で確認する）／ヘッドレス Chrome・Aivis エンジン・GPU レンダーは本タスクでは不要。
3. 縮退レベルを決め（計画書 §8.2）、「レベル・理由・自己判定になるゲート」を書いてから作業に入る。縮退しても守る最低限の関門は §8.3 の5項目。自己レビューになってもオーナー目視の強制はしない（HN-13 置換）。
4. この worktree には `node_modules/` が無い場合がある。その場合は `npm ci` を試みること。ネットワークが使えなければ §8 の縮退として記録し、テスト・ビルドの合格を主張しないこと。
5. `ENVIRONMENT.md` には直接追記しないこと。起動時チェックの行は REPORT.md に記録し、統合時に L2 が集約する。

## REPORT.md

`docs/work/2026-11-13-explainer-ui-harness/tasks/T5b/REPORT.md` に書くこと。コミットごとの証拠（取り込みの記録と `git diff --check` の結果、検証コマンドの出力、フィクスチャへのデモ場面の差し込み手順、motion-kit 数の実数と表明の一致、縮退レベル）を載せること。最後に最終メッセージとして、変更したファイルと検証結果の要約を出力すること。

- 実行できない検証を「合格」と書かないこと。未検証は未検証と明記すること。
- **T5 の T5-4（CP-W1 のスクリーンショット）は T5b の取り込み後に撮るため、T5b の完了が T5-4 の前提になる。** T5b の REPORT.md には、T5-4 の実施者が T5b を取り込むときに必要な情報（motion-kit 数の実数、部品名、取り込みコミット）を明記すること。
- G3 の判定は行わない。L2 が検証コマンドを再実行して判定する（T5b は交差レビュー対象ではない）。
