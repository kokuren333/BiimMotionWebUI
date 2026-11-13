# DIRECTION — G4-β 統合（第2波）

- 作業ID：`2026-11-13-explainer-ui-harness`／タスク：G4-β／層：L3 実働 A（Opus 5.5、effort medium、Claude Code 非対話セッション）
- 計画書：`docs/requirements/ORCHESTRATION_PLAN.md` §5.3（G4 統合検査）・§5.4（コミットの切り方）・§6（ブランチ・push・Pages の手順）・§8.1（起動時チェック）・§5.0（共通条件 C-1〜C-8）
- `<BASE>` = `ce6269b`（第2波ブランチ `feat/ui-biim-frame` の先端）。表示名はすべて `BiimMotion` 確定。
- **G3 は L2 が別コンテキストで行う。本セッションでは自分の成果物を合格と判定しない。**

## 0. 起動時チェック（計画書 §8.1）

最初に §8.1 の起動時チェックを行い、結果を `docs/work/2026-11-13-explainer-ui-harness/tasks/G4-beta/REPORT.md` に記録すること（層、エージェント製品・モデル・effort、サブエージェントの可否、コマンド実行、対話、ネットワーク、ヘッドレス Chrome、GPU レンダー）。縮退レベルを決め、理由と自己判定になるゲート（なしのはず）を REPORT.md に書いてから作業に入ること。`ENVIRONMENT.md` への追記は下の手順 4 で行う。

## 1. 作業場所

- この DIRECTION.md がある repo のメイン checkout、ブランチ `feat/ui-biim-frame`（現在 `ce6269b`）。**新規ブランチ・新規 worktree は作らない。**
- 統合は波ブランチ上で行い、main へのマージも同じセッション内でローカルに行う。**push はしない。**

## 2. 統合対象（すべて G3 PASS 済み）

`review/*` ブランチは統合しない。T6・T7 はすでに第2波ブランチへ取り込み済みで、統合対象は下の2ブランチだけである。G3 記録は各タスクブランチに cherry-pick 済みのものだけを対象とし、レビュー用ブランチの記録は REPORT.md に引用するだけとする。

| 順序 | ブランチ | 先端コミット | G3 記録 |
| --- | --- | --- | --- |
| 1 | `task/T8b-docs` | `eac267e` | 同ブランチ内 `eac267e`（L2 G3 PASS） |
| 2 | `task/T9b-job-entry` | `3a7ba5f` | 同ブランチ内 `3a7ba5f`（L2 G3 PASS） |

取り込み済み（統合しないが、検証の前提として確認すること）：

- `task/T6-ui-base` → マージコミット `15dbbb4`（G3 記録 `467e38d`）
- `task/T7-ui-full` → マージコミット `fb40029`（G3 記録は `review/T7-ui-full` の `1fa4f8d`、PASS。引用のみ。T7 の実装先端は `8125d05`、ブランチ先端はレビュー発注コミット `387b6b8` を含む）

## 3. 統合手順

1. 上の表の順序で、各タスクブランチを波ブランチへマージする（`git merge --no-ff <ブランチ>`。マージコミットの件名は計画書 §5.4 の流儀に従う英語・命令形）。すでに内容がすべて含まれているブランチは「already contained」として記録し、空のマージは作らない。
2. 各マージの直後に `npm test` と `npm run build -- --base=/BiimMotionWebUI/` を実行し、C-1・C-2 が通ることを確認する。通らなければ無理に進めず、その場で止めて REPORT.md に記録し、L2 の判断を待つ（セッションは終了してよい）。
3. 競合が出たら、G3 合格済みの内容を優先して解決する。**機械的に解決できるものだけをこのセッションで解決してよい**（両方の追加を残す末尾追記の競合、片方が他方を包含する差分など）。次の線引きは変えない：MV の制作原則・工程・検証の仕様変更はしない（N1）、MV に QC 規則を追加しない（N10）、ゲートと助言の線引きを変えない（設計思想の宣言を守る）。**実装の判断が必要な競合（どちらを残すか選ばなければならないもの、仕様の解釈が要るもの）は解決せず、REPORT.md に競合箇所と両案を記録して止める。** L2 が判断する。
4. `ENVIRONMENT.md` の集約：各タスクの REPORT.md（`docs/work/2026-11-13-explainer-ui-harness/tasks/<T6|T7|T8b|T9b>/REPORT.md`）から起動時チェックの行を集約し、`docs/work/2026-11-13-explainer-ui-harness/ENVIRONMENT.md` に追記する。自分の起動時チェックの行も同じ表に入れる。第1波の集約（G4-α で実施済み）と重複させないこと。
5. T9b は `tools/` のみの変更（`tools/generate-job.ts` 新設）で `src/`・`index.html`・`job-template/` に触れない。T8b は文書のみ（`README.md`・`VERIFICATION.md`・`docs/DESIGN.md`・`tasks/T8b/`）。両ブランチとも UI コードに触れないため、T6・T7 の UI 実装との競合は想定されない。競合が出た場合は手順 3 の線引きで対応する。
6. スクリーンショットの撮り直しはしない。CP-A2 は T7 の `screenshots/after/`（S1〜S8＋`S1-scrolled` の9枚）を使う。

## 4. 統合後の検証（計画書 §5.3、G4-β の列）

波ブランチ上で次をすべて実行し、結果を REPORT.md に記録する。1つでも不合格なら、合格と主張せず REPORT.md に記録して止める。

| 検査 | コマンド・手順 |
| --- | --- |
| C-1〜C-8 | 計画書 §5.0 の共通条件。C-1 `npm test`、C-2 `npm run build -- --base=/BiimMotionWebUI/`、C-3 `git diff --check`、C-4 MV 非退行テスト、C-5 変更ファイル一覧、C-6 2つの grep、C-7・C-8。**テスト件数の期待値は 81/81**（T9b の G3 で 81/81 を確認済み。T9b 取り込み前は 72/72）。C-4 の `tests/job.test.ts` の差分は T5b 由来の既知のもの（`- 12,` → `+ 15,` と非 Biim 部品のテスト追加）のみであること。`tests/ghost.test.ts`・`tests/imagegen.test.ts` は 955fa5c から差分なし |
| MV 生成物の差分検査 | 計画書 §5.3 の手順どおり（G4-α と同じ）。一時ディレクトリに基準コミット 955fa5c の worktree を作り、基準側と統合側で `tools/make-fixture.ts --mv` を実行し、`git diff --no-index --stat` で差分のあるファイル一覧を許容一覧と照合。`brief.md` は完全一致、`project.json` は `schema_version` の行だけ。終わったら基準の worktree を `git worktree remove` で削除する。一時ディレクトリは repo の外（OS の一時フォルダ）に作る |
| 解説フィクスチャ | `job-template` に差分があれば 4様式（biim／anime／motion／mixed）で `validate` と `qc --stage=pre` の合格、不合格3事例が期待どおり fail すること。**差分が無ければ `git diff --stat <G4-αのマージ>...HEAD -- job-template` が空であることを記録する**（T8b・T9b は `job-template/` に触れないため、空である見込み） |
| UI-C1〜C5 | 計画書 §5.3 の G4-β 列。T7 の REPORT §3 の検証コマンドをそのまま再実行すること（英語飾りラベル・コピーの grep、影・角丸・12px 未満・em／rem の grep、書体・外部参照の grep、`package.json` の差分なし、`npm test`・Pages 用ビルド）。UI-C1 の grep は T8b の名称統一（旧文字列の不在）と合わせて確認する |
| スクリーンショット（CP-A1・CP-A2） | CP-A1（T6 の `screenshots/cp-a1/`、2枚）と CP-A2（T7 の `screenshots/after/`、S1〜S8＋`S1-scrolled` の9枚）が存在し、`VERIFICATION.md` に記録されていること。**CP-A2 は Pages 用ビルド（base `/BiimMotionWebUI/` 付き）に対して撮られたものであること**を、T7 REPORT §4 の手順と T8b の `VERIFICATION.md` 第2波の節の記録で裏付ける（PNG 自体には由来の情報が無いため、手順の記録で確認する）。**撮り直しはしない** |
| UI-V1〜V7（証拠の所在と記録内容の確認） | T7 の `tasks/T7/UI-V7-CHECK.md`・`ui-v7-check.mjs`・`ui-v7-result.json`、T0 の刷新前 S1〜S8（`screenshots/before/`）、T7 の刷新後 S1〜S8（`screenshots/after/`）の所在を確認し、記録内容が計画書 §5.3 の G4-β 列の求めるものと合っているかを照合する。**合否の判定は G4-β の役割だが、本セッションでは判定しない。**証拠の所在と記録内容を REPORT.md に整理し、L2 の判定に渡すこと。**N2 の限定を守ること：S3 の歌詞統計は画角外であり、全統計が写った証拠とは読めない。統計機能は UI-V7 の操作記録で確認済みであり、機能の欠落ではない** |
| 受け入れ基準の照合 | A8〜A10、A11′、A12（計画書 §7.2）。A11′ は「CP-A1・CP-A2 のスクリーンショットが記録され、UI-C1〜C5 と非実装者による UI-V1〜V7 の判定が合格」であること。UI-V1〜V7 の合否は本セッションでは判定しないため、A11′ の UI-V1〜V7 部分は「L2 の判定待ち」として REPORT.md に明記する |
| 名称統一の最終確認 | 旧文字列の不在 grep（T8b の G3 と同じコマンド。`index.html`・`src`・`README.md` に対象文字列が 0 件であること）。行番号ではなく文字列で照合すること（Q-T8b-1） |

## 5. main へのローカルマージと push 待ちの記録

1. 統合ブランチの検証がすべて合格したら、波ブランチを main へローカルでマージする（`git checkout main` → `git merge --no-ff feat/ui-biim-frame`。論理コミットを残すためマージコミットにする。件名は計画書 §6.2 の PR タイトルに準じる英語・命令形）。
2. main 上で `npm test`・`npm run build -- --base=/BiimMotionWebUI/`・Pages 用ビルドを再実行し、すべて合格することを確認する。テスト件数の期待値は 81/81。
3. **push はしない。** GitHub 認証ブロッカー（Git Credential Manager の対話認証待ち）のため、push・`gh pr create`・`gh pr merge` は行わない。main マージ済み・push 待ちの状態を REPORT.md に記録する。
4. Pages の表示確認は push 後にしかできないため、G4-β の完了条件から外す。別途オーナー作業（push 後の公開後確認②）として REPORT.md に記録する。
5. `docs/work/2026-11-13-explainer-ui-harness/reviews/G4-beta.md` は L2 が G3 判定の記録として書くので、本セッションでは触らない。

## 6. REPORT.md

`docs/work/2026-11-13-explainer-ui-harness/tasks/G4-beta/REPORT.md` に次を書く。**合否判定はしない。** G3 は L2 が別コンテキストで行う。

- 起動時チェックと縮退レベル
- 統合したブランチとコミットの一覧（各マージの結果。already contained のものも含む。T6・T7 の取り込み済みマージも前提として記録する）
- 競合の有無と解決内容。実装の判断が必要で解決しなかった競合があれば、その箇所と両案を記録する
- ENVIRONMENT.md 集約の内容
- §4 の各検査の実行結果（コマンドと出力の要約）。UI-V1〜V7 については証拠の所在と記録内容の整理、N2 の限定の扱い、A11′ の UI-V1〜V7 部分が L2 の判定待ちである旨
- MV 生成物差分検査の結果（差分のあるファイル一覧と許容一覧との照合、`brief.md` の完全一致、`project.json` の差分）
- main マージのコミットと、main 上での再検証の結果、push 待ちの状態
- 持ち越し事項：T9a の D1〜D6（CONTRACT と `qc.mjs` の食い違い）は T4（QC の所有者）の判断待ちとして記録する（**統合セッションが直さない**）。T4-review の m1〜m4、T5-review の N1〜N3、Q-T7-1／Q-T7-2／Q-T7-4（T7 REPORT §9 の L2 への判断依頼のうち T8b で決着しなかったもの）が未対応であれば持ち越しとして記録する。EX-17 係数の実測の残りは T11 への持ち越しとして記録する。
- 判断したこと・質問（非ブロッキング。既定の判断で進めたもの）

## 7. 禁止事項

- push しない。main へ直接 push しない。強制 push しない。
- 自己合格禁止。承認カードが出たら止めて報告する。
- `review/*` ブランチは統合しない。
- MV の制作原則・工程・検証の仕様変更はしない（N1）。MV に QC 規則を追加しない（N10）。ゲートと助言の線引きを変えない（設計思想の宣言を守る）。
- T9a の D1〜D6 は直さない（REPORT に持ち越しとして記録するだけ）。
- T0 の刷新前スクショを上書きしない。スクリーンショットの撮り直しはしない。
- 計画書・要件書・Amendment を変えない。`docs/requirements/` には触らない。
- `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の中身は読まない。
