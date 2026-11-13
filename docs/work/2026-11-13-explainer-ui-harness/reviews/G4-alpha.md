# G3 REVIEW — G4-α 第1波統合（統合＋ローカル main マージ）

- 作業ID: `2026-11-13-explainer-ui-harness`／タスク: G4-α／ブランチ: `feat/explainer-harness` → `main`（ローカル）
- 実装者: L3 実働 A（Opus 5.5 medium、00:46 起動）
- レビュー者: L2（別コンテキスト、親）— 2026-11-14 01:21〜01:32 JST
- 判定: **PASS**（条件付きなし。注記は記録のみで、再作業は不要）

## 検証コマンド（L2 が再実行）

| 検証 | 結果 |
| --- | --- |
| `G4-alpha.done` / ログ | 01:21 作成、EXITCODE 0。統合セッションは終了し、プロセスは死んでいる |
| `main` と波ブランチの先端 | ともに `7d5dd59`（`Record the local main merge, carry-overs and decisions for G4-alpha`） |
| マージコミット `5e50308` | **実在のマージコミット**（parents `955fa5c`（旧 main）と `ef8cd96`（波ブランチ先端））。`git merge` ではなく plumbing（commit-tree）で作られたが、親2つ・ツリーともに正しいマージの形。`955fa5c` は `HEAD` の祖先（ANCESTOR-OK） |
| マージツリーの内容 | `git diff 5bfc330 5e50308` は `VERIFICATION.md` +21（EX-17 節）・`ENVIRONMENT.md` +11（起動時チェック集約）・`tasks/G4-alpha/REPORT.md` +142 のみ。波ブランチ先端（`5bfc330`）の内容がそのまま入っており、余計な変更なし。`5e50308`→`7d5dd59` は REPORT.md +40 のみ |
| `npm test`（main、L2 が別プロセスで再実行） | **72 pass / 0 fail**（セッションの主張と一致） |
| `npm run build -- --base=/BiimMotionWebUI/`（main、L2 が別プロセスで再実行） | **成功**（built in 7.22s、EXITCODE 0。注：L2 の最初の .bat は `call` なしで `npm test` の後に制御が戻らず build が走らなかったため、build だけ別 .bat で再実行した。再実行の結果は上記のとおり） |
| `git diff --check 955fa5c..7d5dd59` | 終了コード 0、出力なし。**C-3 は消滅**（T4 最終版を採った競合解決で末尾空行自体が無くなったため。テストファイルは触っていない） |
| C-6 | 追加行にメールアドレス・認証情報の値なし。粗い grep で `C:\Users` を含む行が数件出るが、いずれも DIRECTION.md／REPORT.md 内の C-6 検査自体を説明する文書行で、T9a の G3 でも同じ内容で合格済み。`token` のヒットは監査写し内の `jobs.client_token`（DB カラム名）で値ではない |
| REPORT.md の主張との照合 | 競合3回（T5/T5-4 の add/add は G3 合格済み T4 最終版を採用、`tools/ui-shots.mjs` は T5-4 版、`VERIFICATION.md` は両節を日付順に残す）とその解決を照合。MV 生成物の差分（`brief.md` 完全一致、`project.json` は `schema_version` 0.3→0.4 の1行のみ）、4様式の validate・`qc --stage=pre` 合格、preview 180フレーム成功、ghost-check 0件合格、EX-17 は2配置を実測し規則と一致（残りは T11 へ持ち越し）はいずれも REPORT の記載どおり |

## 注記（L2 判断）

1. **main マージの方法は plumbing だったが、結果は通常のマージと等価。** ファイルのロックで `git merge` が中止したため、セッションは同じ結果になるマージコミットを commit-tree で作った（REPORT §6.5）。L2 の検証では親2つ・ツリー内容ともに正しいことを確認した（上表）。巻き戻し手順（`git update-ref refs/heads/main 955fa5c`）は REPORT に記録済み。push 前のローカルだけの話なので、やり直しはしない。
2. **main にはマージ以外の記録コミット（`7d5dd59`）が1件ある。** main マージ後の REPORT 追記を fast-forward で main にも入れたもの（REPORT §6.6）。main と波ブランチの先端をそろえる意図で、内容は REPORT.md の40行追加のみ。L2 はこのまま残す（push 前に main を `5e50308` に戻す選択肢も REPORT に記録済み）。
3. **1件目のマージコミットに帰属行を付け忘れ、push 前に `--amend` でメッセージだけ直した**（REPORT §6.7）。内容の変更はなく、履歴への影響はローカルだけ。G3 には影響しない。
4. **EX-17 は全配置の実測確定には至らず、残りは T11 へ持ち越し**（REPORT §6.3）。G4-α の完了条件としてはブロッキングにしない（DIRECTION の指示どおり）。
5. **D1〜D6 は T4 への持ち越しとして REPORT に記録された。** 直していない。スペースの読み方は §3.3 で指定済みのため S1 の進行を妨げない。
6. **push・PR 作成・Pages の表示確認は未実施**（GitHub 認証ブロッカー、オーナー作業）。G4-α の完了条件からは外れている（DIRECTION の指示どおり）。

## 次

- 第1波は完了。公開①（push→PR→Pages 確認）はオーナーの GitHub 認証の解消待ち。
- T11（解説1本の通し制作、題材「虹」、style_mode: mixed）の着手条件は「G4-α の公開後確認①の後」なので、push 待ちの間は発注しない。
- T9b の発注は G4-α の後。G4-α が完了したので発注可（担当は実働 B、依存は T5・T9a）。T9b は push を待たない。
- 第2波 `feat/ui-biim-frame`（T6→T7→T8b→G4-β→公開②）は G4-α のマージ後の main から作る。G4-α が main に入ったので発注可。
