# DIRECTION — G4-α 統合（第1波）

- 作業ID：`2026-11-13-explainer-ui-harness`／タスク：G4-α／層：L3 実働 A（Opus 5.5、effort medium、Claude Code 非対話セッション）
- 計画書：`docs/requirements/ORCHESTRATION_PLAN.md` §5.3（G4 統合検査）・§5.4（コミットの切り方）・§6（ブランチ・push・Pages の手順）・§8.1（起動時チェック）
- `<BASE>` = `2a7d209`（第1波ブランチの分岐元）。表示名はすべて `BiimMotion` 確定。
- **G3 は L2 が別コンテキストで行う。本セッションでは自分の成果物を合格と判定しない。**

## 0. 起動時チェック（計画書 §8.1）

最初に §8.1 の起動時チェックを行い、結果を `docs/work/2026-11-13-explainer-ui-harness/tasks/G4-alpha/REPORT.md` に記録すること（層、エージェント製品・モデル・effort、サブエージェントの可否、コマンド実行、対話、ネットワーク、ヘッドレス Chrome、GPU レンダー）。縮退レベルを決め、理由と自己判定になるゲート（なしのはず）を REPORT.md に書いてから作業に入ること。`ENVIRONMENT.md` への追記は下の手順 4 で行う。

## 1. 作業場所

- メイン checkout `C:\Users\nekom\Desktop\doujin_projects\YouTube\BiimMakerWebUI`、ブランチ `feat/explainer-harness`（現在 `5814dc3`）。**新規ブランチ・新規 worktree は作らない。**
- 統合は波ブランチ上で行い、main へのマージも同じセッション内でローカルに行う。**push はしない。**

## 2. 統合対象（すべて G3 PASS 済み）

`review/*` ブランチは統合しない。G3 記録は各タスクブランチに cherry-pick 済みのものだけを対象とし、レビュー用ブランチの記録は REPORT.md に引用するだけとする。T1 の G3 記録は `task/T1-contract` には無いので、T1 の CONTRACT.md の確定版 `8d8ba75` を使うこと。

| 順序 | ブランチ | 先端コミット | G3 記録 |
| --- | --- | --- | --- |
| 1 | `task/T0-base` | `f4911a1` | 同ブランチ内 `f4911a1` |
| 2 | `task/T2-harness-docs` | `b13758b` | 同ブランチ内 `b13758b` |
| 3 | `task/T1-contract` | `8d8ba75` | `review/T1-contract-r2` の `016aa9d`（引用のみ） |
| 4 | `task/T4-qc` | `5e38423` | `review/T4-qc` の `6b9d34f`（引用のみ） |
| 5 | `task/T3-docs` | `759be8d` | 同ブランチ内 `759be8d` |
| 6 | `task/T5-webui` | `424bc75` | `review/T5-webui` の `0c78d81`（引用のみ） |
| 7 | `task/T5b-motion-kit` | `daece82` | 同ブランチ内 `daece82` |
| 8 | `task/T5-shots` | `fe7efcb` | 同ブランチ内 `fe7efcb` |
| 9 | `task/T8a-docs` | `726a8d7` | 同ブランチ内 `726a8d7` |
| 10 | `task/T9a-handoff` | `ffda58c` | 同ブランチ内 `ffda58c` |

## 3. 統合手順

1. 上の表の順序で、各タスクブランチを波ブランチへマージする（`git merge --no-ff <ブランチ>`。マージコミットの件名は計画書 §5.4 の流儀に従う英語・命令形）。すでに内容がすべて含まれているブランチは「already contained」として記録し、空のマージは作らない。
2. 各マージの直後に `npm test` と `npm run build -- --base=/BiimMotionWebUI/` を実行し、C-1・C-2 が通ることを確認する。通らなければ無理に進めず、その場で止めて REPORT.md に記録し、L2 の判断を待つ（セッションは終了してよい）。
3. 競合が出たら、G3 合格済みの内容を優先して解決する。次の線引きは変えない：MV の制作原則・工程・検証の仕様変更はしない（N1）、MV に QC 規則を追加しない（N10）、ゲートと助言の線引きを変えない（設計思想の宣言を守る）。この線引きの範囲で解決できない競合は、無理に解消せず REPORT.md に記録して止める。
4. C-3 の修正：`tests/qc.test.ts:47` の末尾空行（T4-1 由来、T5-review の決定）を統合時に削除する。**修正は空行の削除のみ**で、テストの内容は変えないこと。修正後に `git diff --check 2a7d209..HEAD` が空になることを確認する。
5. `ENVIRONMENT.md` の集約：各タスクの REPORT.md（`docs/work/2026-11-13-explainer-ui-harness/tasks/<T0|T1|T2|T3|T4|T5|T5b|T5-4|T8a|T9a>/REPORT.md`）から起動時チェックの行を集約し、`docs/work/2026-11-13-explainer-ui-harness/ENVIRONMENT.md` に追記する。自分の起動時チェックの行も同じ表に入れる。
6. `VERIFICATION.md` の競合：T4-1 の EX-17 節（`task/T4-qc` の `VERIFICATION.md`）と T8a の節（`task/T8a-docs` の `VERIFICATION.md`）はどちらも末尾への追記で、統合時に同じ位置への追加として競合する可能性が高い。内容は独立しているので、**両方の節を残す（EX-17 節 → T8a の節の順、日付順）**形で解決する。
7. CP-W1 の追記：T8a の `VERIFICATION.md` には予定の所在と「T5-4 の完了後に追記する」旨だけが書かれている。T5-4 は完了した（S1〜S8 の8枚、S6 の motion-kit 数15）ので、**所在（`docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1/`）・枚数（8）・S6 の確認結果（motion-kit 数15）を `VERIFICATION.md` に追記する**。
8. T8a の README の motion-kit 数15は、統合後の実物（T5b が入る）と一致することを確認する（`job-template/motion-kit/` の `.tsx` の実数を数える）。
9. T5-4 のスクリーンショット S1〜S8 は `docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1/` に入る。T0 の刷新前スクショ（`screenshots/` の S1〜S8）とは別物なので、上書きしないこと。スクリーンショットの撮り直しはしない（T5-4 の S1〜S8 を使う）。
10. EX-17 係数の実測確定：still での実測を試みる。環境（ヘッドレス Chrome・still 生成）が整えば実測して `VERIFICATION.md` に記録する。できなければ未検証として REPORT.md に明記し、T11 の仕事として残す（**ブロッキングにしない**）。

## 4. 統合後の検証（計画書 §5.3、G4-α の列）

波ブランチ上で次をすべて実行し、結果を REPORT.md に記録する。1つでも不合格なら、合格と主張せず REPORT.md に記録して止める。

| 検査 | コマンド・手順 |
| --- | --- |
| C-1〜C-8 | 計画書 §5.0 の共通条件。C-1 `npm test`、C-2 `npm run build -- --base=/BiimMotionWebUI/`、C-3 `git diff --check`、C-4 MV 非退行テスト（`tests/ghost.test.ts`・`tests/imagegen.test.ts` は 955fa5c から差分なし、`tests/job.test.ts` の削除行は T5b の計数1行のみ）、C-5 変更ファイル一覧、C-6 2つの grep、C-7・C-8 |
| MV 生成物の差分検査 | 計画書 §5.3 の手順どおり。一時ディレクトリに基準コミット 955fa5c の worktree を作り（`git worktree add <一時ディレクトリ>/base 955fa5c`）、基準側で `npm ci` → `node --experimental-strip-types tools/make-fixture.ts --mv`、統合側で `node --experimental-strip-types tools/make-fixture.ts --mv --out=<一時ディレクトリ>/head`。`git diff --no-index --stat` で差分のあるファイル一覧を許容一覧と照合。`brief.md` は完全一致、`project.json` は `schema_version` の行だけ。終わったら基準の worktree を `git worktree remove` で削除する。一時ディレクトリは repo の外（OS の一時フォルダ）に作る |
| 解説フィクスチャ | 4様式（biim／anime／motion／mixed）で `validate` と `qc --stage=pre` の合格、不合格3事例（fail-evidence／fail-caption／fail-review）が期待どおり fail すること（T4 の検証コマンド） |
| preview レンダーと ghost-check | 短い preview のレンダーと `ghost-check -- --target=preview` を解説フィクスチャ1本で実行する。GPU・ネットワークが無ければ §8 に記録し、未検証として REPORT.md に明記する（ブロッキングにしない） |
| UI-C4・C5 | 第1波は現行の見た目に配線を足しただけであること（UI の見た目の変更は T6・T7 の範囲） |
| 受け入れ基準の照合 | A1〜A5、A7、A16、A18〜A22（計画書 §7.2） |

## 5. main へのローカルマージと push 待ちの記録

1. 統合ブランチの検証がすべて合格したら、波ブランチを main へローカルでマージする（`git checkout main` → `git merge --no-ff feat/explainer-harness`。論理コミットを残すためマージコミットにする。件名は計画書 §6.2 の PR タイトルに準じる英語・命令形）。
2. main 上で `npm test`・`npm run build -- --base=/BiimMotionWebUI/`・Pages 用ビルドを再実行し、すべて合格することを確認する。
3. **push はしない。** GitHub 認証ブロッカー（Git Credential Manager の対話認証待ち）のため、push・`gh pr create`・`gh pr merge` は行わない。main マージ済み・push 待ちの状態を REPORT.md に記録する。
4. Pages の表示確認は push 後にしかできないため、G4-α の完了条件から外す。別途オーナー作業（push 後の公開後確認①）として REPORT.md に記録する。
5. `docs/work/2026-11-13-explainer-ui-harness/reviews/G4-alpha.md` は L2 が G3 判定の記録として書くので、本セッションでは触らない。

## 6. REPORT.md

`docs/work/2026-11-13-explainer-ui-harness/tasks/G4-alpha/REPORT.md` に次を書く。**合否判定はしない。** G3 は L2 が別コンテキストで行う。

- 起動時チェックと縮退レベル
- 統合したブランチとコミットの一覧（各マージの結果。already contained のものも含む）
- C-3 修正の内容、ENVIRONMENT.md 集約の内容、VERIFICATION.md の競合解決と CP-W1 追記の内容
- §4 の各検査の実行結果（コマンドと出力の要約）
- MV 生成物差分検査の結果（差分のあるファイル一覧と許容一覧との照合、`brief.md` の完全一致、`project.json` の差分）
- main マージのコミットと、main 上での再検証の結果、push 待ちの状態
- 持ち越し事項：T9a の D1〜D6（CONTRACT と `qc.mjs` の食い違い）は、スペースの読み方を指定したことで S1 の進行を妨げない。どちらが正かは T4（QC の所有者）に判断を委ねる持ち越しとして記録する（**統合セッションが直さない**）。T4-review の m1〜m4 と T5-review の N1〜N3 も、未対応であれば持ち越しとして記録する。EX-17 係数の実測ができなかった場合は T11 への持ち越しとして記録する。
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
