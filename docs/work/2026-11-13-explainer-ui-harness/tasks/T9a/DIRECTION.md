# DIRECTION — T9a スペース版への引き渡し仕様

- 作業ID: `2026-11-13-explainer-ui-harness`
- あなたは **L3 実働 A（Opus 5.5、effort medium、非対話セッション）**です。引き渡し仕様書を書くのが仕事です。G3 は L2 が行うため、**自分で自分の成果物を合格と判定してはいけません**。
- サブエージェントの使用は可（L4 下請け）。使う場合は REPORT.md に記録すること。
- 表示名は **`BiimMotion` 確定**です（Amendment 02、オーナー決定 2026-11-13 20:36）。暫定扱いにしないこと。repo 名・Pages URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物で変えません。

## 最初に読むもの（この順で）

1. `docs/requirements/2026-11-13-amendment-01.md`（最優先。AM-1 目視ゲート廃止、AM-2 様式自由度）
2. `docs/requirements/2026-11-13-amendment-02.md`（表示名 `BiimMotion` 確定）
3. `docs/requirements/2026-11-13-explainer-ui-harness.md`（要件書。特に **§2.10 スペース版 MV-E2E への解説モード新設（SP-01〜SP-09）**、§2.6 ゲートと助言の線引き、AM-2 の6）
4. `docs/requirements/ORCHESTRATION_PLAN.md`（計画書。§5.1 T9a がこのタスク票の正本。§5.0 共通条件、§6.2 スペース版の扱いも読むこと）
5. `docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（T1 の契約。確定版）。**注意：自分の worktree にはこのファイルは無い。** 波のブランチにはまだ取り込まれていないため、T1 の worktree にある確定版を読むこと：相対パス `../BiimMakerWebUI-wt/T1/docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（コミット `8d8ba75` の内容）。特に §1（ジョブ内のファイル名と必須見出し、`plan/evidence.json` スキーマ、`reports/qc-<stage>.json` スキーマ）、§3（`MotionForm`・`project.json` の追加項目、`schema_version` の新値）、§4（様式モード契約）、§6（字幕帯域の置き場所・型）。読むだけで、変更しないこと。ファイルが無ければ作業を止めて REPORT.md に書くこと。契約の内容を推測で補ってはならない。
6. スペース監査の写し `../BiimMakerWebUI-wt/T0/docs/work/2026-11-13-explainer-ui-harness/audits/`（T0 の worktree にある。読むだけ。特に変更マップの S1〜S7・M1、アクションの A1・A5・A6・A7・A9・A10・A11、クライアントの C1・C5、SP-07 の5点との対応）。自分の worktree には監査の写しは無い。
7. T4 の `qc.mjs`（`qc-*.json` の実スキーマ。読むだけ）：`../BiimMakerWebUI-wt/T4/job-template/runtime/scripts/qc.mjs`（T4-2 `1b1bb5b` の内容）。CONTRACT のスキーマと突き合わせて、食い違いがあれば REPORT.md に記録すること（推測で埋めないこと）。
8. T5 の実装記録 `../BiimMakerWebUI-wt/T5/docs/work/2026-11-13-explainer-ui-harness/tasks/T5/REPORT.md`（読むだけ。WebUI のフォーム値＝SP-04 の設計パッケージの入力一式の対応）。

## 作業ブランチと基準コミット

- あなたの repo ルートは、この DIRECTION.md がある worktree です。ブランチは `task/T9a-handoff` で、波のブランチ `feat/explainer-harness` から分岐済みです。**ブランチを切り替えないこと**。
- `<BASE>` = `2a7d209`（第1波ブランチの最初のコミット）。検証コマンドの `git diff <BASE>...HEAD` にはこの値を使うこと。差分には L2 による発注記録（本 DIRECTION.md 等のコミット）も含まれるが、完了条件の判定には影響しない。
- コミットは1件にまとめること。件名は計画書 §5.4 #17（英語・命令形）：`Add space handoff spec for the explainer mode`。C-1・C-2 が通ること。コミットメッセージの末尾に規定の帰属行を付けること（書式は過去のコミットの末尾を参照。ファイルには書かない）。
- **push はしないこと**（認証は L2 が後で行う）。main へのマージ・直接 push・強制 push は禁止。**スペース版の S1 以降には触れないこと**（T9a は引き渡し仕様まで。S1 以降は Q4 の既定どおり保留）。

## 対象ファイル

- `docs/work/2026-11-13-explainer-ui-harness/SPACE_HANDOFF.md`（新設）

## 内容（計画書 §5.1 T9a。要件書 §2.10 の仕様を、S1〜S4 の実働が本書だけで着手できる形に書くこと）

- 要件書 §2.10 の仕様（SP-01〜SP-09）を、スペース監査の変更マップに沿った S1〜S4 の作業単位に落とすこと。各作業単位に、対象（スキーマ／アクション／クライアント）、変更内容、MV 経路への影響（不変であることの確認方法）を示すこと。
- T1 の契約（解説ジョブの入力項目、`style_mode`、`qc-*.json` スキーマ、`review_mode`、免除）を引き渡すこと。`qc-*.json` のスキーマは CONTRACT の記述と T4 の `qc.mjs` の実物を突き合わせ、食い違いがあれば両方を記録すること。
- **MV 経路の不変条件**：MV のハンドオフ文と `advanceStage` のエラー文をバイト単位で保つため、解説は別関数（`buildExplainerHandoff` 等）に分離すること。MV 側の既存の関数・文言に手を入れない設計にすること。
- **非 Biim 様式のハンドオフ文に Biim レイアウト指示を入れない規則**（AM-2 の6）。`style_mode` が `anime`／`motion`／`mixed` の非 Biim 区間では、Biim 枠・ノート欄を使う指示をハンドオフ文に入れないこと。`mixed` の区間上書きの扱いも書くこと。
- **U1 の現状**：監査で判明した生成方法（スペースは「その時点の BiimMotionWebUI に合わせ Claude 経由で Biim ジョブ生成」。PC 側エージェントに生成させている）と、未決の実装主体・時期を記録すること。S0 はオーナー／L2 の仕事であり、T9a の範囲ではない。
- **SP-04 入口（T9b）の要否の結論**：フォーム値の JSON からジョブフォルダを生成できる入口（`tools/generate-job.ts`）が要るか、要らないかを結論づけること。要る場合は T9b の前提（入力の形、WebUI の ZIP と同内容であることの条件）を書き、要らない場合は理由を書くこと。SHOULD のため、結論が「要らない」でもよいが、理由を記録すること。

## 必ず入れること（P1-1〜P1-3。SPACE_HANDOFF.md の完了条件として明記すること）

1. **（P1-1）次の4点を本書で確定させること**。S1 の依存に「SPACE_HANDOFF.md に上記が決まっていること」を足すこと（S1 の実働が本書を読まずに着手できないようにするため）：
   - `directions` の S6 方針：**案 (a)**（MV 軸カラムを nullable 化＋解説軸カラム追加。既存行・既存 zod（`directionShape`）への影響が最も小さい）。案 (b)・(c) を採らなかった理由も1行で記録すること。
   - 設計パッケージの格納先：監査 S4 の**案 A**（同カラムに kind で判別できる JSON を格納。移行ゼロ）か**案 B**（`explainerDesign` カラム新設。検証が単純）か、いずれか1つに決めること。決めた案の理由と、もう一方を採らなかった理由を記録すること。どちらでも設計形状は MV 版と別物になる（要件書 §2.3 D2 参照）。
   - 解説ジョブの作成経路：監査 A5 の単発アクション要否。解説が音源アップロードを伴わない場合はチャンク経路を経ない単発作成アクション（例 `createExplainerJob`）を別に置くか、既存の `createJob`／`createJobFromUpload` に `job_kind` 分岐を入れるか、どちらかに決めること。
   - 成果物 kind 名：SP-07 の5点（`final.mp4`、YouTube サムネイル、YouTube メタデータ、台本と根拠メモ、字幕データ）との対応表。5点それぞれに対応する kind 名を決め、TuneCore 向けのジャケットと WAV は生成しないことを明記すること。
2. **（P1-2）SP-08 の別モデル／別セッションによるレビュー判定の規則を1行足すこと**：事前・事後のレビュー判定は、可能なら制作したのとは別のモデルまたは別セッションで行う。同一モデルしか使えない場合は別セッションで行い、それも不可能なら自己レビューとして記録する（要件書 SP-08 の文言をそのまま引く形でよい）。
3. **（P1-3）`designToText` の二重実装（サーバ・クライアント）の注意を1行足すこと**：設計パッケージをテキスト化する処理がサーバとクライアントの両方にある場合、両方を同じ仕様で保つこと。片方だけを変えてはならない。

## 完了条件

- S1〜S4 の実働が本書だけで着手できること（L2 が判定）。
- A16 の「契約が確定し引き渡されている」を満たすこと。
- 上の P1-1〜P1-3 が本書に含まれていること。

## 検証

- 本書の末尾に、SP-01〜SP-09 と AM-2 の6 を1項目ずつ本書の節に対応付ける対応表を置くこと（L2 の G3 判定の材料）。
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

- `src/`、`job-template/`（T9a では触らない。読むだけ）
- `tests/`（無変更）、`tools/`、`index.html`、ルートの `package.json`
- `docs/requirements/` 配下（要件書・Amendment・計画書）、`docs/work/2026-11-13-explainer-ui-harness/` 配下の `PLAN.md`・`BRIEF.md`・`ENVIRONMENT.md`・`QUESTIONS.md`・`G2-REVIEW*.md`・`CONTRACT.md`・`tasks/T0/`・`tasks/T1/`・`tasks/T2/`・`tasks/T3/`・`tasks/T4/`・`tasks/T5/`・`tasks/T5b/`・`tasks/T5-4/`・`tasks/T8a/`（自分の `tasks/T9a/` 以外）
- ルートの `README.md`・`VERIFICATION.md`（T8a の対象）
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

`docs/work/2026-11-13-explainer-ui-harness/tasks/T9a/REPORT.md` に書くこと。P1-1 の4点の決定内容と理由、P1-2・P1-3 の記載箇所、SP-04／T9b の要否の結論と理由、CONTRACT と `qc.mjs` の突き合わせ結果（食い違いがあれば両方を記録）、U1 の現状の記載箇所、S1 以降が保留であることの記録、縮退レベルを載せること。最後に最終メッセージとして、変更したファイルと検証結果の要約を出力すること。

## 禁止事項

- 承認を求められたら（承認カード等）、**承認せずに止めて** REPORT.md に状態を書くこと。
- 実行できない検証を「合格」と書かないこと。未検証は未検証と明記すること。
- 自分で自分の成果物を合格と判定しないこと（G3 は L2 の仕事）。
- 質問が発生したら REPORT.md に書いて既定の判断で進めること（対話はできない）。
