# DIRECTION — T1 契約の固定（CONTRACT.md）

- 作業ID: `2026-11-13-explainer-ui-harness`
- あなたは **L3 実働 A（Opus 5.5 / effort medium、Claude Code 非対話セッション）**です。実装するのが仕事です。レビュー（G3）は実装者とは別コンテキストの L2 が行い、さらに**交差レビューとして実働 B（Codex）が差分を読みます**。自分で自分の成果物を合格と判定してはいけません。
- 表示名は **`BiimMotion` 確定**です（Amendment 02、オーナー決定 2026-11-13 20:36）。暫定扱いにしないこと。repo 名・Pages URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物で変えません。

## 最初に読むもの（この順で）

1. `docs/requirements/2026-11-13-amendment-01.md`（最優先。AM-1 目視ゲート廃止、AM-2 様式自由度）
2. `docs/requirements/2026-11-13-amendment-02.md`（表示名 `BiimMotion` 確定）
3. `docs/requirements/2026-11-13-explainer-ui-harness.md`（要件書。特に EX-14、EX-17、EX-18、EX-25、EX-28、§2.6）
4. `docs/requirements/ORCHESTRATION_PLAN.md`（計画書。§1.2 の様式モード対応表と §5.1 T1 がこのタスク票の正本）
5. 監査3本：メインのチェックアウトの `.agent-work/` にある原本を読むこと（相対パス `../BiimMakerWebUI/.agent-work/audit-explainer.md`、`audit-ui.md`、`audit-space.md`。読むだけで、原本を変更しないこと）。

## 作業ブランチと基準コミット

- あなたの repo ルートは、この DIRECTION.md がある worktree です。ブランチは `task/T1-contract` で、波のブランチ `feat/explainer-harness` から分岐済みです。**ブランチを切り替えないこと**。
- `<BASE>` = `2a7d209`（第1波ブランチの最初のコミット）。検証コマンドの `git diff <BASE>...HEAD` にはこの値を使うこと。差分には L2 による発注記録（本 DIRECTION.md 等のコミット）も含まれるが、完了条件の判定には影響しない。
- コミットは計画書 §5.4 #5 の件名で1つにまとめること：`Document the explainer job contract including style modes`。件名は英語・命令形。コミットメッセージの末尾に規定の帰属行を付けること（書式は過去のコミット `Document ghost-check commands and layer separation in top-level docs` の末尾を参照。ファイルには書かない）。
- **push はしないこと**（認証は L2 が後で行う）。main へのマージ・直接 push・強制 push は禁止。スペース版（S0〜S5）には触れないこと。

## 対象ファイル

- `docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（文書のみ。新設）

## 内容（必須の8節。節番号と見出しをこのとおりにすること）

1. ジョブ内のファイル名と必須見出し（`plan/explanation-map.md`、`plan/direction.md`、`plan/storyboard.md` の様式、`reports/qc-review.md` のチェック行の書式、`reports/delivery.md` の見出し）
2. `plan/evidence.json` スキーマ（EX-18）と `reports/qc-<stage>.json` スキーマ（EX-14。**`style_mode` と、各ゲートの適用範囲 `scope`（`all`／`biim-scenes`）を追加**）
3. `MotionForm` の追加項目（理解ゴール、前提と誤解、構成メモ、解説用差別化メモ、`styleMode`）と、`project.json` の追加項目（`direction.takeaway`、`direction.prior_knowledge`、`direction.outline`、`direction.differentiation`、`direction.style_mode`、`scenes[].style`）、`schema_version` の新値
4. **様式モード契約**：計画書 §1.2 の対応表の確定版、`scene.biim` との整合規則、縦出力の扱い、様式ごとの既定デザイン文の切り替え規則、`mixed` の区間上書きの書き方。様式モードは `biim`（既定）／`anime`／`motion`／`mixed`。MV は対象外。
   - 対応表の初期案（変えてよいが、変えた理由を CONTRACT.md に書くこと）：
     - `biim`：`project.layout.mode` は現行どおり、`direction.biim_usage` は現行どおり（`sometimes`／`mostly`）、場面ごとの様式は全場面 `biim`、Biim 固有検査は適用
     - `anime`：`project.layout.mode` は `fullscreen`、`direction.biim_usage` は `never`、場面ごとの様式は全場面 `anime`、Biim 固有検査は適用しない
     - `motion`：`project.layout.mode` は `fullscreen`、`direction.biim_usage` は `never`、場面ごとの様式は全場面 `motion`、Biim 固有検査は適用しない
     - `mixed`：`project.layout.mode` は `biim`、`direction.biim_usage` は `sometimes` 以上、場面ごとに `biim`／`anime`／`motion` を記入、Biim 固有検査は `style: biim` の場面だけ
   - 縦（portrait）出力では `biim`／`mixed` は選べない（現行の「縦は Biim 枠なし」を維持）。WebUI は理由を表示して選択肢を無効化し、`validateForm` も拒否する。これは「固定・ロック」ではなく既存の幾何制約であることを明記すること。
   - `anime` と `motion` の違いは主役の違い（anime＝キャラの演技とアニメ的な演出が主、motion＝図形・タイポグラフィ・図解のモーションが主、キャラは任意）。いずれも字幕領域は既存の全画面字幕領域（「標準字幕」）を使う。
   - 既定のデザイン文（`defaults.design`、「Biim形式を軸に…」）は様式モードごとの既定文を持ち、ユーザーが未編集なら様式切り替えで差し替え、編集済みなら保持する。
5. **Biim 固有検査の棚卸し表**：`validate.mjs`・`qc.mjs`・brief 文の各検査／指示を「全モード共通」「Biim 様式の場面のみ」に分類すること。例：枠の幾何・Biim 字幕仕様・`note_top`／`note_bottom` の必須性は Biim のみ、説明構造・台本とストーリーボードの整合・理解設計・ゴースト走査・字幕帯域は共通。
6. 字幕帯域の算出規則（EX-17）の式・係数の置き場所（**単一モジュール**。推奨：`job-template/runtime/scripts/caption-capacity.mjs` を `qc.mjs` と `src/explainer-assist.ts` の両方が import）と、様式ごとの字幕領域。`tsconfig.json` は `allowJs` なし・`strict` なので、`src/` から import する場合の型の与え方（例：同名の `.d.mts` を同梱）を決め、`npm run build` が通ることを条件にする。
7. MV の不変条件と、MV 生成物の許容差分一覧（計画書 §5.3 と一致させること）
8. AM-2 による要件書記述の読み替え一覧（計画書 §1.2 末尾の項目：2.1「移植しない」表の「解説は Biim 枠とキャラが標準」→「Biim は既定であって必須ではない」／EX-06 スタイル定義→「様式モードと（mixed の場合）区間ごとの様式の割り当て規則」／EX-07 → Biim 様式の場面にだけ適用／EX-11 の必須欄「レイアウト（Biim・全画面）」→「様式（biim／anime／motion）とレイアウト」／2.4「視覚様式」軸 → 様式モードを含む軸）

## 完了条件

- 上の8節があること
- T3・T4・T5・T5b・T9a が CONTRACT だけを根拠に着手できること（交差レビュー者が「不明点なし」と判定）
- 要件書・Amendment と矛盾しないこと（矛盾は `QUESTIONS.md` へ。**要件書・Amendment を書き換えないこと**）

## 検証

- レビュー者が要件 ID（EX-14/17/18/25/28、AM-2）ごとに CONTRACT の該当節を突き合わせる。C-1〜C-3 を通すこと。

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

- `CONTRACT.md` 以外のすべてのファイル。特に `src/`、`job-template/`、`tests/`、`index.html`、`package.json`、`docs/requirements/` 配下、`docs/work/2026-11-13-explainer-ui-harness/` 配下の `PLAN.md`・`BRIEF.md`・`ENVIRONMENT.md`・`QUESTIONS.md`・`G2-REVIEW*.md`・`tasks/T0/`・`tasks/T2/`（自分の `tasks/T1/` 以外）。
- 既存のコミット履歴を書き換えないこと。`git worktree` で作られた他の worktree に触れないこと。

## 起動時チェック（計画書 §8.1。最初に行い、結果を REPORT.md に記録すること）

1. 自分の層（L3 実働 A）を確認する。
2. 次を確かめて記録する：エージェント製品とモデル・effort／サブエージェントを起動できるか／コマンドを実行できるか（`node -v`、`npm test` が動くか）／対話できるか／ネットワーク。ヘッドレス Chrome・Aivis エンジン・GPU レンダーは本タスクでは不要。
3. 縮退レベルを決め（計画書 §8.2）、「レベル・理由・自己判定になるゲート」を書いてから作業に入る。縮退しても守る最低限の関門は §8.3 の5項目。自己レビューになってもオーナー目視の強制はしない（HN-13 置換）。
4. この worktree には `node_modules/` が無い場合がある。その場合は `npm ci` を試みること。ネットワークが使えなければ §8 の縮退として記録し、テスト・ビルドの合格を主張しないこと。

## REPORT.md

`docs/work/2026-11-13-explainer-ui-harness/tasks/T1/REPORT.md` に書くこと。完了条件ごとに証拠（8節の所在、様式モード契約の確定内容と変更理由、棚卸し表の根拠となった検査の列挙、検証コマンドの出力、縮退レベル）を載せること。最後に最終メッセージとして、変更したファイルと検証結果の要約を出力すること。

## 禁止事項

- 承認を求められたら（承認カード等）、**承認せずに止めて** REPORT.md に状態を書くこと。
- 実行できない検証を「合格」と書かないこと。未検証は未検証と明記すること。
- 自分で自分の成果物を合格と判定しないこと（G3 は L2＋交差レビューの仕事）。
