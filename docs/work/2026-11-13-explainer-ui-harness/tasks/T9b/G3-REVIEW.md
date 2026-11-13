# G3 REVIEW — T9b ジョブ生成入口

- 作業ID: `2026-11-13-explainer-ui-harness`／タスク: T9b／ブランチ: `task/T9b-job-entry`（worktree `BiimMakerWebUI-wt\T9b`、main `75986e6` から分岐）
- 実装者: L3 実働 B（Codex 6.1 sol high、01:58 起動）
- レビュー者: L2（別コンテキスト、親）— 2026-11-14 02:07〜02:09 JST
- 判定: **PASS**（条件付きなし。注記は記録のみで、再作業は不要）

## 検証コマンド（L2 が再実行）

| 検証 | 結果 |
| --- | --- |
| `T9b.done` / ログ | 02:05 作成、EXITCODE 0 |
| コミット | `6b14afc`（実装）、`4da4089`（REPORT 記録）。作業ツリーはクリーン |
| `npm test`（worktree、L2 が別プロセスで再実行） | **81 pass / 0 fail**、EXITCODE 0（セッションの主張と一致） |
| 変更ファイル | `tools/generate-job.ts`（新設）、`tests/generate-job.test.ts`（新設）、`tasks/T9b/REPORT.md`（新設）の3ファイルのみ。`src/`、`job-template/`、既存テスト、`package.json` は基準から差分なし（REPORT の C-5 記載と照合） |
| C-3 | `git diff --check 75986e6...HEAD` は出力なし（REPORT 記載） |
| C-4（MV 非退行） | 全件テスト内で既存 MV 5件・ghost・imagegen を実行。`tests/ghost.test.ts`・`tests/imagegen.test.ts` は 955fa5c から差分なし。`tests/job.test.ts` の削除行は統合済みの motion-kit 数 12→15 の1行だけ（REPORT 記載） |
| C-6 | 計画書の正規表現を PowerShell `Select-String` で追加行に適用し、絶対パス・メール・認証情報の検出なし（REPORT 記載）。帰属行はコミットメッセージにだけ記載 |
| REPORT.md の主張との照合 | 81件成功・Pages ビルド成功、解説4様式と MV の ZIP 一致・上書き拒否／未知キー拒否を確認（監視報告の要約と REPORT の C-1〜C-8 表が一致）。判断の記録（JSON 最上位と assets の未知キーも拒否、assets 省略は許可、defaults の型に基づく構造検査を先行、I/O エラー時は生成途中のフォルダを自動削除しない）を確認。UI 差分がないためスクリーンショットは追加しないのは妥当 |

## 注記（L2 判断）

1. **T9b の取り込み先は未定。** T9b のブランチは main `75986e6` から分岐し、第2波ブランチには入っていない。main 直か G4-β 同梱かは、T10 の記録一式チェックまでに L2 が決める（コーディネーターの引き継ぎどおり）。
2. **スペース版の S1 は T9b の完了で着手可能になった**（依存は T5・T9a・T9b）。ただし S1 以降は Q4 の既定どおり保留（オーナーの実装主体・時期の回答待ち）のため、発注しない。

## 次

- T6 は稼働中（02:06 に dist/build とスクリーンショットを更新）。T6 の G3 PASS 後に T7 を発注する。
