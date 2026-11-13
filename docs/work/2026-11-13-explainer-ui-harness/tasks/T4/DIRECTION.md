# DIRECTION — T4 QC 実装と様式対応の検証

- 作業ID: `2026-11-13-explainer-ui-harness`
- あなたは **L3 実働 B（Codex、非対話セッション、モデル `gpt-6.1-sol`、effort high）**です。実装するのが仕事です。レビュー（G3）は交差レビュー（実働 A＝あなたとは別コンテキストの Opus セッション）が行うため、**自分で自分の成果物を合格と判定してはいけません**。
- サブエージェントの使用は可（L4 下請け）。使う場合は REPORT.md に記録すること。
- 表示名は **`BiimMotion` 確定**です（Amendment 02、オーナー決定 2026-11-13 20:36）。暫定扱いにしないこと。repo 名・Pages URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物で変えません。

## 最初に読むもの（この順で）

1. `docs/requirements/2026-11-13-amendment-01.md`（最優先。AM-1 目視ゲート廃止、AM-2 様式自由度）
2. `docs/requirements/2026-11-13-amendment-02.md`（表示名 `BiimMotion` 確定）
3. `docs/requirements/2026-11-13-explainer-ui-harness.md`（要件書。特に §2.6 ゲートと助言の線引き、EX-14〜19、EX-29、EX-30、EX-32、EX-33、AM-2 の含意。EX-17 の字幕帯域の式・係数は**試算（暫定値）**であること）
4. `docs/requirements/ORCHESTRATION_PLAN.md`（計画書。§5.1 T4 がこのタスク票の正本。§5.0 共通条件、§5.3 MV 生成物の許容差分一覧と差分検査の手順、§6.1 ブランチも読むこと）
5. `docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（T1 の契約。確定版）。**注意：自分の worktree にはこのファイルは無い。** 波のブランチにはまだ取り込まれていないため、T1 の worktree にある確定版を読むこと：相対パス `../BiimMakerWebUI-wt/T1/docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（コミット `8d8ba75` の内容）。特に §5（Biim 固有検査の棚卸し表）、§6（字幕帯域の置き場所・型）、§9（確認事項）。読むだけで、変更しないこと。ファイルが無ければ作業を止めて REPORT.md に書くこと。契約の内容を推測で補ってはならない。
6. 現行の `job-template/runtime/scripts/validate.mjs` と `tools/make-fixture.ts`（自分の worktree 内。変更対象の原本）。

## 作業ブランチと基準コミット

- あなたの repo ルートは、この DIRECTION.md がある worktree です。ブランチは `task/T4-qc` で、波のブランチ `feat/explainer-harness` から分岐済みです。**ブランチを切り替えないこと**。
- `<BASE>` = `2a7d209`（第1波ブランチの最初のコミット）。検証コマンドの `git diff <BASE>...HEAD` にはこの値を使うこと。差分には L2 による発注記録（本 DIRECTION.md 等のコミット）も含まれるが、完了条件の判定には影響しない。
- コミットの分け方（計画書 §5.1 T4。順序厳守）：T4-1 字幕帯域モジュール＋テスト → T4-2 `qc.mjs`＋スクリプト＋テスト → T4-3 `validate.mjs` の解説記録と様式対応＋テスト → T4-4 フィクスチャ。件名は計画書 §5.4 #6〜#9（英語・命令形）：
  - T4-1 `Add caption capacity rule shared by QC and the WebUI`
  - T4-2 `Add explainer QC command with pre/post gates and review records`
  - T4-3 `Require explainer design records in final validation and scope Biim checks by style`
  - T4-4 `Generate explainer QC fixtures for each style mode`
  各コミットで C-1・C-2 が通ること。コミットメッセージの末尾に規定の帰属行を付けること（書式は過去のコミットの末尾を参照。ファイルには書かない）。**T4-1 のコミットができたら、L2 が T5 を発注するため、REPORT.md にその旨を明記し、最終メッセージでも知らせること。**
- **push はしないこと**（認証は L2 が後で行う）。main へのマージ・直接 push・強制 push は禁止。スペース版（S0〜S5）には触れないこと。

## 対象ファイル

- `job-template/runtime/scripts/caption-capacity.mjs`（新設。型は T1 の決定に従う）
- `job-template/runtime/scripts/qc.mjs`（新設）
- `job-template/runtime/scripts/validate.mjs`
- `job-template/runtime/package.json`・`job-template/package.json`（`qc` スクリプト）
- `tests/qc.test.ts`（新設。validate 部分も新ファイルに置き、`tests/job.test.ts` には追記しない）
- `tools/make-fixture.ts`（解説 QC フィクスチャ：`--style=<mode>`、`--qc=pass|fail-evidence|fail-caption|fail-review`、**`--out=<dir>`**。`--out` 省略時は従来どおり `.verification/` に出し、既存の使い方を変えない）
- `VERIFICATION.md`（下記 P1-5 の節の追記のみ）

## 内容の要点（計画書 §5.1 T4）

- `caption-capacity.mjs`：字幕帯域の式・係数・様式の判定関数はここにだけ書く（単一モジュール）。**import を持たない純粋な ES モジュールにする**（`node:` モジュールも `lib.mjs` も import しない）。型は同じフォルダに `caption-capacity.d.mts` を置く（T1 の契約 §6 に従う）。`src/` から import する場合の型の与え方は T1 の契約 §6 に従い、`npm run build` が通ることを条件にする。
- `qc.mjs`：要件書 §2.6 の機械判定項目を実装すること。JSON 必須項目（EX-14＋`style_mode`・`scope`）を出すこと。`qc --stage=pre|post` で、不合格なら終了コード1。
- `validate.mjs`：解説で `plan/explanation-map.md`・`plan/direction.md`・`plan/evidence.json` の欠落を拒否すること（EX-29）。MV の検査内容は不変。ghost 走査は助言のまま（N2）。
- 様式対応：`anime`・`motion` のジョブに Biim 固有検査を適用しないこと。`mixed` では `style: biim` の場面だけに Biim 検査を適用すること。字幕帯域は全モードで検査すること。
- `qc` スクリプト：`job-template/runtime/package.json`・`job-template/package.json` に追加すること。
- `make-fixture.ts`：`--style=<mode>`、`--qc=pass|fail-evidence|fail-caption|fail-review`、`--out=<dir>` に対応すること。`--out` 省略時は従来どおり `.verification/` に出すこと。
- EX-17 の係数は**暫定値**（要件書 EX-17 の試算）で実装すること。still での実測確定は T11 または G4-α で行う（下記 P1-5）。
- T4-4 の扱い：EX-33 は SHOULD だが、T4・T5b・G4-α の検証コマンドがこのフィクスチャを使うため、**本計画では必須**とする。

## P1-5：EX-17 係数の暫定性の記録（完了条件）

- 字幕帯域の係数が暫定値であることを `VERIFICATION.md` に記録すること。末尾に日付つきの節を追記し、係数の値・出典（要件書 EX-17 の試算）・実測確定が未了であること（T11 または G4-α で行う）を書くこと。既存の節は書き換えないこと。

## P1-6：MV 生成物差分検査のネットワーク縮退

- 計画書 §5.3 の MV 生成物差分検査では、フィクスチャ展開先での `npm install` にネットワークが要る。ネットワークが使えなければ計画書 §8 の縮退として REPORT.md に記録し、`npm test` での表明（MV の挙動テスト・MV 非退行）を根拠にすること。未検証を合格と書かないこと。

## 完了条件

- `qc --stage=pre|post` が要件書 §2.6 の機械判定項目を実装し、JSON 必須項目（EX-14＋`style_mode`・`scope`）を出すこと。不合格で終了コード1。
- テストで次が表明されること：根拠の無い claim／容量超過の字幕／レビュー行の欠落／免除の扱い（オーナー記載のみ有効）／MV での挙動（EX-19：合格 JSON を書かず終了コード0）／**様式**：`anime`・`motion` のジョブに Biim 固有検査が適用されず合格できる、`mixed` では `style: biim` の場面だけに Biim 検査が適用される、字幕帯域は全モードで検査される。
- `validate --final` が解説で `plan/explanation-map.md`・`plan/direction.md`・`plan/evidence.json` の欠落を拒否すること（EX-29）。MV の検査内容は不変。ghost 走査は助言のまま（N2、`ghost.test.ts` 無変更で合格）。
- 字幕帯域の係数は暫定値（要件書 EX-17 の試算）で実装し、P1-5 のとおり `VERIFICATION.md` に記録すること。
- T4-4 のフィクスチャが必須として完成していること。

## 検証コマンド（`$FX` は OS の一時ディレクトリ配下の作業用フォルダ。例：`FX=$(mktemp -d)`。Git Bash で行うこと）

```sh
npm test
for s in biim anime motion mixed; do
  node --experimental-strip-types tools/make-fixture.ts --style=$s --qc=pass --out=$FX/$s
  (cd $FX/$s/smoke-video && npm install && npm run validate && npm run qc -- --stage=pre)        # 4様式とも合格
done
for f in fail-evidence fail-caption fail-review; do
  node --experimental-strip-types tools/make-fixture.ts --style=mixed --qc=$f --out=$FX/$f
  (cd $FX/$f/smoke-video && npm install) && (cd $FX/$f/smoke-video && npm run qc -- --stage=pre; test $? -eq 1)   # それぞれ不合格（終了コード1）
done
node --experimental-strip-types tools/make-fixture.ts --mv --out=$FX/mv
(cd $FX/mv/smoke-video && npm install && npm run validate && npm run qc; test $? -eq 0)          # MV：validate 合格、qc は終了コード0で合格 JSON を書かない
test ! -e $FX/mv/smoke-video/reports/qc-pre.json
```

展開先のフォルダ名はジョブのタイトルに従う（現行のフィクスチャは `smoke-video`）。`npm install` にネットワークが要る。使えなければ P1-6 のとおり §8 の縮退として記録し、テスト（`npm test`）での表明を根拠にする。C-1〜C-6。

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

- `src/`、`job-template/AGENTS.md`、`job-template/README.md`、`job-template/plan/`（`plan/templates/` を含む）、`job-template/motion-kit/`、`job-template/scenes/`、`tests/job.test.ts`（追記しない。validate 部分も `tests/qc.test.ts` に置く）、`tests/ghost.test.ts`（無変更。N2）、`tests/harness-docs.test.ts`（T3 の対象）、`index.html`、ルートの `package.json`（`qc` スクリプトの追加は job-template 側の package.json のみ）、`docs/requirements/` 配下（要件書・Amendment・計画書）、`docs/work/2026-11-13-explainer-ui-harness/` 配下の `PLAN.md`・`BRIEF.md`・`ENVIRONMENT.md`・`QUESTIONS.md`・`G2-REVIEW*.md`・`CONTRACT.md`・`tasks/T0/`・`tasks/T1/`・`tasks/T2/`・`tasks/T3/`（自分の `tasks/T4/` 以外）。
- `CONTRACT.md` には触れないこと。`VERIFICATION.md` は P1-5 の節の追記のみとし、既存の節を書き換えないこと。
- 既存のコミット履歴を書き換えないこと。`git worktree` で作られた他の worktree に触れないこと。メインのチェックアウトの `.agent-work/` は読むだけで変更しないこと。

## 起動時チェック（計画書 §8.1。最初に行い、結果を REPORT.md に記録すること）

1. 自分の層（L3 実働 B）を確認する。
2. 次を確かめて記録する：エージェント製品とモデル・effort／サブエージェントを起動できるか／コマンドを実行できるか（`node -v`、`npm -v`、`git`）／対話できるか／ネットワーク（`npm ci` の成否で確認する）／ヘッドレス Chrome・Aivis エンジン・GPU レンダーは本タスクでは不要。
3. 縮退レベルを決め（計画書 §8.2）、「レベル・理由・自己判定になるゲート」を書いてから作業に入る。縮退しても守る最低限の関門は §8.3 の5項目。自己レビューになってもオーナー目視の強制はしない（HN-13 置換）。
4. この worktree には `node_modules/` が無い場合がある。その場合は `npm ci` を試みること。ネットワークが使えなければ §8 の縮退として記録し、テスト・ビルドの合格を主張しないこと。
5. `ENVIRONMENT.md` には直接追記しないこと。起動時チェックの行は REPORT.md に記録し、統合時に L2 が集約する。

## REPORT.md

`docs/work/2026-11-13-explainer-ui-harness/tasks/T4/REPORT.md` に書くこと。コミットごとの証拠（T4-1〜T4-4 の検証コマンドの出力、4様式・3不合格・MV の結果、EX-17 係数の暫定性の記録、縮退レベル）を載せること。T4-1 の完了を明記すること。最後に最終メッセージとして、変更したファイルと検証結果の要約を出力すること。

## 禁止事項

- 承認を求められたら（承認カード等）、**承認せずに止めて** REPORT.md に状態を書くこと。
- 実行できない検証を「合格」と書かないこと。未検証は未検証と明記すること。
- 自分で自分の成果物を合格と判定しないこと（G3 は交差レビュー＝実働 A の仕事）。
- 質問が発生したら REPORT.md に書いて既定の判断で進めること（対話はできない）。
