# DIRECTION — T3 制作ハーネス文書（job-template）

- 作業ID: `2026-11-13-explainer-ui-harness`
- あなたは **L3 実働 A（Opus 5.5 / effort medium、Claude Code 非対話セッション）**です。実装するのが仕事です。レビュー（G3）は L2 が別コンテキストで行うため、**自分で自分の成果物を合格と判定してはいけません**。
- 表示名は **`BiimMotion` 確定**です（Amendment 02、オーナー決定 2026-11-13 20:36）。暫定扱いにしないこと。repo 名・Pages URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物で変えません。

## 最初に読むもの（この順で）

1. `docs/requirements/2026-11-13-amendment-01.md`（最優先。AM-1 目視ゲート廃止、AM-2 様式自由度）
2. `docs/requirements/2026-11-13-amendment-02.md`（表示名 `BiimMotion` 確定）
3. `docs/requirements/2026-11-13-explainer-ui-harness.md`（要件書。特に §2 解説ハーネス、§2.6 ゲートと助言の線引き、EX-01〜13、EX-20、EX-27、EX-28、EX-31、EX-32、AM-2 の含意）
4. `docs/requirements/ORCHESTRATION_PLAN.md`（計画書。§5.1 T3 がこのタスク票の正本）
5. `docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（T1 の契約。確定版）。**注意：自分の worktree にはこのファイルは無い。** 波のブランチにはまだ取り込まれていないため、T1 の worktree にある確定版を読むこと：相対パス `../BiimMakerWebUI-wt/T1/docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（コミット `8d8ba75` の内容）。読むだけで、変更しないこと。ファイルが無ければ作業を止めて REPORT.md に書くこと。契約の内容を推測で補ってはならない。
6. 現行の `job-template/AGENTS.md`（自分の worktree 内。書き換え対象の原本）。

## 制作ハーネスの設計思想（必読。オーナー確認 2026-11-13 20:57）

MV の制作ハーネスは**あえて緩く作ってある**。この思想を守って job-template を書き換えること。

- **制作ハーネスは意図的に緩く作ってある。** 原則を示し、フォーマット（構成・演出・様式・ファイルの書き方）は固定しない。モデルの能力を引き出し、作品が型にはまらないようにするためである。
- **合否ゲートにするのは、客観的に判定できて、外すと視聴者に実害が出るものだけ**（誤情報、読めない字幕、切れる音声、未確認のままの納品、記録の欠落）。
- **主観的な質**（面白さ、演出の巧拙、スロップ感、テンポ）は合否に入れず、**助言に留める**。
- **将来ハーネスを編集するエージェントは、この緩さを「改善」と称して締め付けてはならない。** 主観的な質の規則化、表現手法の禁止・固定、出力フォーマットの固定、助言の合否化は締め付けにあたる。

この思想は要件書の非目的 N1・N10 と §2.6 の線引き（決定 D4・D5）が効果として守っているものを、宣言として書いたものである（T2 のルート AGENTS.md §6 と同じ趣旨）。

## 作業ブランチと基準コミット

- あなたの repo ルートは、この DIRECTION.md がある worktree です。ブランチは `task/T3-docs` で、波のブランチ `feat/explainer-harness` から分岐済みです。**ブランチを切り替えないこと**。
- `<BASE>` = `2a7d209`（第1波ブランチの最初のコミット）。検証コマンドの `git diff <BASE>...HEAD` にはこの値を使うこと。差分には L2 による発注記録（本 DIRECTION.md 等のコミット）も含まれるが、完了条件の判定には影響しない。
- コミットは計画書 §5.4 #10 の件名 `Add explainer chapter, shared ghost chapter and record templates to the job harness` を使うこと。件名は英語・命令形。コミットメッセージの末尾に規定の帰属行を付けること（書式は過去のコミット `Document ghost-check commands and layer separation in top-level docs` の末尾を参照。ファイルには書かない）。文書とテストは同じコミットに含めること（§5.4 の流儀：テストは対象の変更と同じコミット）。
- **push はしないこと**（認証は L2 が後で行う）。main へのマージ・直接 push・強制 push は禁止。スペース版（S0〜S5）には触れないこと。

## 対象ファイル

- `job-template/AGENTS.md`
- `job-template/README.md`
- `job-template/plan/templates/`（`explanation-map.md`、`direction-explainer.md`、`storyboard-explainer.md`、`evidence.example.json`、`qc-review.md`）
- `tests/harness-docs.test.ts`（新設。並行する T4・T5 と `tests/job.test.ts` の追記が衝突しないよう新ファイルに置く）

## 内容の要点（計画書 §5.1 T3）

- 冒頭に「`project.mode` によって読む章」と HN-14 の1文を置くこと。
- 解説章を MV 章と対称にすること：理解先的設計7原則、構造翻訳の対応表11行、方向性3案と6軸、スタイルと演者、制作工程14ステップ、事前・事後 QC、失敗チェックリスト23項目。
- **様式モードの節**：4モード（biim／anime／motion／mixed）の説明、`biim` は既定だが必須ではないこと、Biim の標準（EX-07）は Biim 様式の場面にだけ適用すること、`mixed` の区間割り当ての書き方、非 Biim の場面の字幕・提示部品（T5b の部品名は T1 の契約に従うこと）。
- 「解説動画と共通の演出」を「解説動画の演出と実装の規則」に改題し、15項目を保持すること。
- レンダーゴースト節を両モード共通の章へ移し、解説字幕にも当てはまる1文を追加すること。
- MV 章の本文は削らないこと（要件書 N1）。F9 の11文言を残すこと。

## CONTRACT §5.5 の行番号参照ずれについて

- 現 CONTRACT §5.5 の `job-template/AGENTS.md` 行番号参照は一部ずれていることが、T1 の G3 再レビューで確認済みである（例：`note_top`／`note_bottom` の記録は「100」ではなく 101 行目、「biim-standard-v1 を標準にする」は「110」ではなく 112 行目）。
- **CONTRACT.md には触れないこと**（T1 の成果物であり、T3 の触らない範囲）。参照ずれの修正は T10 締めで行う。
- ただし T3 の書き換えで `job-template/AGENTS.md` の行番号がさらに動くため、REPORT.md に「**移動・改題した節の新旧行番号対応表**」を残すこと（T10 が CONTRACT §5.5 を直すときの材料にする）。

## 完了条件

- F9 の11文言が残り、`MV brief and AGENTS…` テストが無変更で通ること。
- ひな形が `validate`・`qc` の検査対象パスに無いこと。
- 新テストが次を表明すること：(a) 解説章の主要見出し・23項目・様式モードの記述、(b) HN-14 の1文、(c) **生成した ZIP（MV・解説とも）で、`plan/templates/` 以外に `validate`・`qc` が検査するパス（`plan/direction.md`、`plan/explanation-map.md`、`plan/evidence.json`、`plan/script.md`、`plan/storyboard.md`、`plan/sources.md`、`plan/music-analysis.md`、`reports/*.md`）のファイルが存在しないこと**（EX-32）。
- 上の「内容の要点」がすべて入っていること。

## 検証コマンド

```sh
npm test
ls job-template/plan/   # direction.md 等が無いこと
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

- `src/`、`job-template/runtime/`、`job-template/motion-kit/`、`job-template/scenes/`、`job-template/` 配下の上記以外（`job-template/AGENTS.md`・`job-template/README.md`・`job-template/plan/templates/` は対象）、`tests/`（`tests/harness-docs.test.ts` 以外。`tests/job.test.ts` には追記しない）、`index.html`、`package.json`、`docs/requirements/` 配下（要件書・Amendment・計画書）、`docs/work/2026-11-13-explainer-ui-harness/` 配下の `PLAN.md`・`BRIEF.md`・`ENVIRONMENT.md`・`QUESTIONS.md`・`G2-REVIEW*.md`・`CONTRACT.md`・`tasks/T0/`・`tasks/T1/`・`tasks/T2/`・`tasks/T4/`（自分の `tasks/T3/` 以外）、`VERIFICATION.md`（T8a の対象）。
- `CONTRACT.md` には触れないこと（上記 §5.5 の件）。
- 既存のコミット履歴を書き換えないこと。`git worktree` で作られた他の worktree に触れないこと。メインのチェックアウトの `.agent-work/` は読むだけで変更しないこと。

## 起動時チェック（計画書 §8.1。最初に行い、結果を REPORT.md に記録すること）

1. 自分の層（L3 実働 A）を確認する。
2. 次を確かめて記録する：エージェント製品とモデル・effort／サブエージェントを起動できるか／コマンドを実行できるか（`node -v`、`npm test` が動くか）／対話できるか／ネットワーク（npm install、Pages の閲覧）／ヘッドレス Chrome。Aivis エンジン・GPU レンダーは本タスクでは不要。
3. 縮退レベルを決め（計画書 §8.2）、「レベル・理由・自己判定になるゲート」を書いてから作業に入る。縮退しても守る最低限の関門は §8.3 の5項目。自己レビューになってもオーナー目視の強制はしない（HN-13 置換）。
4. この worktree には `node_modules/` が無い場合がある。その場合は `npm ci` を試みること。ネットワークが使えなければ §8 の縮退として記録し、テスト・ビルドの合格を主張しないこと。
5. `ENVIRONMENT.md` には直接追記しないこと。起動時チェックの行は REPORT.md に記録し、統合時に L2 が集約する。

## REPORT.md

`docs/work/2026-11-13-explainer-ui-harness/tasks/T3/REPORT.md` に書くこと。完了条件ごとに証拠（検証コマンドの出力、対象ファイルの一覧、テストの表明内容、移動・改題した節の新旧行番号対応表、縮退レベル）を載せること。最後に最終メッセージとして、変更したファイルと検証結果の要約を出力すること。

## 禁止事項

- 承認を求められたら（承認カード等）、**承認せずに止めて** REPORT.md に状態を書くこと。
- 実行できない検証を「合格」と書かないこと。未検証は未検証と明記すること。
- 自分で自分の成果物を合格と判定しないこと（G3 は L2 の仕事）。
- 質問が発生したら REPORT.md に書いて既定の判断で進めること（対話はできない）。
