# G3 REVIEW — T0 作業基盤と刷新前記録

- 作業ID: `2026-11-13-explainer-ui-harness`／タスク: T0／ブランチ: `task/T0-base`（worktree `BiimMakerWebUI-wt\T0`）
- 実装者: L3 実働 A（Opus 5.5 medium、セッション `d907e7da-bc14-4fc1-8653-b3a5e4bfdaa0`）
- レビュー者: L2（別コンテキスト、親）— 2026-11-13 21:05〜21:08 JST
- 判定: **PASS**（条件付きなし。以下の注記は記録のみで、再作業・撮り直しは不要）

## 検証コマンド（L2 が再実行）

| 検証 | 結果 |
| --- | --- |
| `T0.done` / `T0.log` 末尾 | 21:03 作成、`EXITCODE 0` |
| `git log`（worktree） | `bf56c4d`（監査写し＋スクショ8枚）、`7519188`（`.gitignore`＋`tools/ui-shots.mjs`）、基底 `bff59c6` |
| `git check-ignore .agent-work/PM_BRIEF.md` | 無視されることを確認 |
| `git diff --exit-code 955fa5c -- package.json package-lock.json` | 差分なし（PKG_CLEAN） |
| `npm test`（worktree、L2 実行） | **29 pass / 0 fail**（MV 5件・ghost・imagegen 含む。C-4 MV 非退行を満たす） |
| スクショ8枚の実在・サイズ | `S1`〜`S8` すべて存在（61,515〜294,551 B、2026-11-13 21:02） |
| C-6（追加行のローカル絶対パス・メールアドレス・認証情報） | `git diff 2a7d209..HEAD` を検査。`C:\Users`・`/home/hatch`・`@gmail.com`・`nekom\` のヒットなし。`token` のヒットは監査写し内の `jobs.client_token`（DB カラム名）で認証情報の値ではない。**C-6 合格** |
| REPORT.md の主張との照合 | 完了条件の各証拠（§3.1〜3.5）と実ファイルが一致。監査写しの差分3行の記述も REPORT どおり |

## 注記（L2 判断）

1. **S3 の歌詞統計が枠に入っていない件 — 許容する。** 要件書 §3.4 は8枚の枠を固定しており、S3 の目的（MV 入力済み状態＋方向性たたき台＋準備度）は満たされている。準備度の「歌詞 6行」が写っており、歌詞の行数情報は記録されている。追加の1枚は撮らない（T0 の判断を支持）。
2. **S2 が 03 付近の撮影である件 — 仕様どおり。** 現行の解説モードに方向性のたたき台が無い（要件書 F8）ため、たたき台に相当する位置として 03 を撮ったのは正しい。
3. **S3・S8 の方向性たたき台は乱数で変わる。** CP-A1（刷新後）との比較時は、内容の差がたたき台の乱数によるものか刷新によるものかを区別すること。
4. **Git Bash の MSYS パス変換問題**（`--base=/BiimMotionWebUI/` が Windows パスに書き換わる）を T0 が発見し、`tools/ui-shots.mjs` に検出ガード（`MSYS_NO_PATHCONV=1` の案内付き）を入れている。将来の撮影手順の注意点として残す。
5. **T0 は自分のコミット #2 を amend している**（C-6 が `ui-shots.mjs` 内の2文字列を拾ったため。実害のない文字列だが条件が空結果を要求するため書き換え）。`bff59c6` 以前の履歴には触れておらず、push 前のため問題なし。
6. **ENVIRONMENT.md への起動時チェック行の転記は G4-α の統合時に行う**（共有ファイルの同時編集を避けるため、各セッションの REPORT.md に記録させてある。T0 の起動時チェック：Node v24.15.0、Chrome/157.0.8103.40、npm ci 成功、Pages HTTP 200、縮退レベル 0）。

## 次

- T0 の成果は `task/T0-base` にあり、G4-α で `feat/explainer-harness` へ統合する。
- T1・T2 は実行中。監視 cron `biim-t1t2-watch`（5分間隔）が完了を検知して報告する。
