# G3 REVIEW — T2 開発ハーネス文書

- 作業ID: `2026-11-13-explainer-ui-harness`／タスク: T2／ブランチ: `task/T2-harness-docs`（worktree `BiimMakerWebUI-wt\T2`）
- 実装者: L3 実働 A（Opus 5.5 medium、セッション `355e93b3-f15c-4656-8a8e-9c52ee43bf07`）
- レビュー者: L2（別コンテキスト、親）— 2026-11-13 21:11〜21:14 JST
- 判定: **PASS**（条件付きなし。注記は記録のみ）

## 検証コマンド（L2 が再実行）

| 検証 | 結果 |
| --- | --- |
| `T2.done` / `T2.log` | 21:05 作成、`EXITCODE 0` |
| `git log`（worktree） | `b361706`（AGENTS.md・CLAUDE.md・README.md・docs/WORKFLOW.md・REPORT.md、5ファイル395行）、基底 `ab4a6d7`。`git status` はクリーン |
| 行数 | AGENTS.md 111行、CLAUDE.md 16行、WORKFLOW.md 159行（いずれも200行以内の上限内。REPORT §3.1 と一致） |
| `npm test`（worktree、L2 実行） | **29 pass / 0 fail** |
| `npm run build -- --base=/BiimMotionWebUI/`（worktree、L2 実行） | **built in 2.53s**（チャンクサイズ警告のみ。既存のもの） |
| 「目視」の全出現（Git Bash grep で再検査。cmd の findstr は UTF-8 を拾わないため偽陰性になる） | 2件のみ。AGENTS.md:27「オーナー目視を待たずに」、WORKFLOW.md:148「オーナー目視の強制には使わない」。いずれも否定の文脈で、マージ・公開の条件ではない。REPORT §3.3 と一致 |
| G5 の出現 | 0件 |
| 設計思想 §6（AGENTS.md） | 4点すべて明記：意図的な緩さとフォーマット非固定／ゲートは客観判定＋実害のみ（5種の例示つき）／主観的な質は助言に留める／将来の編集者は緩さを「改善」と称して締め付けてはならない（締め付けにあたる行為の例つき）。末尾で N1・N10・§2.6（D4・D5）との関係を明記。オーナー確認 2026-11-13 20:57 の原文の趣旨を満たす |
| README の開発者向け1節 | `## エージェントで開発する場合` を 12行目に確認（+4行） |
| C-1〜C-8（REPORT §4 の証拠と照合） | C-1 test 29/29、C-2 build 成功、C-3 diff --check 出力なし、C-4 ghost/imagegen/job.test.ts は 955fa5c から無変更、C-5 ステージ内容は対象ファイルのみ、C-6 L2 が `git diff 2a7d209..HEAD` で再検査しクリーン、C-7 node_modules/dist 等は実行で生じたもののみ、C-8 PLAN.md と ORCHESTRATION_PLAN.md は一致 |
| REPORT.md の主張との照合 | §3.2 の規則所在一覧の各行と実ファイルが一致（§1・§3・§6・§7・§8 の所在、WORKFLOW §1〜§5、CLAUDE.md、README の節）。逸脱 §5 の6件はいずれも記録・判断として妥当（下記注記参照） |

## 注記（L2 判断）

1. **README の見出し `# BiimMakerWebUI` は T2 では変えていない。** 表示名の変更は T8b の範囲であり、T2 の範囲（1節の追加）のみで正しい。
2. **AGENTS.md の地図は `.agent-work/` を「追跡しない」と書いているが、T0 の取り込み前は実態と食い違う。** REPORT §6 の指摘どおりで、T0 の成果（`.gitignore` 追加）が G4-α で統合されれば一致する。T2 の欠陥ではない。
3. **絶対規則9の追加**（HN-03 は8項目だが、HN-11 の非対話行「取り消しにくい操作の手前で止める」を計画書 §1.1 の解釈で規則化）は、計画書の解釈の範囲内で妥当。WORKFLOW は規則9を参照するだけに留めており重複はない。
4. **タスクフォルダの表記**（`tasks/<T番号>-<名前>/` ではなく実際の `tasks/T2/` に合わせて `tasks/<タスクID>/` と書いた）は、実態に合わせた正しい判断。
5. **`docs/DESIGN.md` は未作成（T6 の範囲）**のため AGENTS では「作成後」と注記してリンクしている。T6 完了後にリンクが生きることを G4-β で確認すること。

## 次

- T2 の成果は `task/T2-harness-docs` にあり、G4-α で `feat/explainer-harness` へ統合する。
- T1 は実行中。監視 cron `biim-t1t2-watch`（5分間隔）が完了を検知して報告する。
- ENVIRONMENT.md への起動時チェック行の転記は G4-α の統合時に行う（T2 の起動時チェック：Node v24.15.0、npm ci 成功、縮退レベル 0）。
