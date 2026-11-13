# G3 REVIEW — T9a スペース引き渡し仕様

- 作業ID: `2026-11-13-explainer-ui-harness`／タスク: T9a／ブランチ: `task/T9a-handoff`（worktree `BiimMakerWebUI-wt\T9a`）
- 実装者: L3 実働 A（Opus 5.5 medium）
- レビュー者: L2（別コンテキスト、親）— 2026-11-14 00:22〜00:26 JST
- 判定: **PASS**（条件付きなし。注記は記録のみで、再作業は不要）

## 検証コマンド（L2 が再実行）

| 検証 | 結果 |
| --- | --- |
| `T9a.done` / `T9a.log` | 00:14 作成、`EXITCODE 0` |
| 実装コミット | `01a5a1d Add space handoff spec for the explainer mode`（SPACE_HANDOFF.md 525行＋REPORT.md。ほかは L2 の発注記録） |
| `npm test`（worktree、L2 実行） | **29 pass / 0 fail**（既存29件。テスト変更なし） |
| `npm run build -- --base=/BiimMotionWebUI/`（worktree、L2 実行） | **built in 4.59s** |
| SPACE_HANDOFF.md の構成 | §0 完了条件、§1 現状（U1）と前提、§2 確定事項（P1-1 の4点と付随する決定）、§3 契約、§4 データ形状、§5 ハンドオフ文と非 Biim 規則、§6 作業単位 S1〜S4、§7 SP-04 入口（T9b）の要否、§8 未決事項、§9 対応表（SP-01〜SP-09、AM-2 の6） |
| P1-1 の4点 | ① S6 は案 (a)（MV 6軸を nullable 化＋解説軸7カラム追加）、② 設計パッケージ格納先は案 B（`jobs.explainer_design` を新設）、③ 作成経路は `createExplainerJob` を新設（既存 `createJob` に分岐を入れない）、④ kind 名は既存3種＋新設 `script_and_evidence`／`subtitle_data`。理由はいずれも SPACE_HANDOFF.md §2 に記載 |
| P1-2／P1-3 | P1-2 は §3.4（SP-08 の文言を引用）、ハンドオフ手順への組み込みは §5.2。P1-3 は §5.5（`designToText` の二重実装の注意） |
| S1 の依存 | 「SPACE_HANDOFF.md に①〜④が確定していること」を足した（§0 の完了条件3、§6.1 の依存） |
| SP-04／T9b の要否 | **要る**（§7）。理由：SP-04 の MUST に対し現状は PC 側エージェントが Claude 経由で生成で手段未指定。`tools/make-fixture.ts` が既に Node から `generateJob` を呼んでおり、依存の追加なしで作れる。T9b の前提は §7 に記載 |
| D1〜D6 の記録 | CONTRACT と `qc.mjs`（`1b1bb5b`）の食い違い6件を §3.3 に記録。どちらが正かは決めていない。スペースはどちらでも壊れない読み方（`verdict` だけで合否、`detail` を解析しない等）をするよう §3.3 で指定 |
| S1 以降の保留 | SPACE_HANDOFF.md 冒頭の表「状態」と §1.1 に明記。スペース版のソースには一切触れていない |
| C-3 | `git diff --check 2a7d209..HEAD` は出力なし |
| C-4 | `tests/` を変更していない。`tests/ghost.test.ts`・`tests/imagegen.test.ts` は 955fa5c から差分なし、`tests/job.test.ts` の削除行なし |
| C-5 | 変更は SPACE_HANDOFF.md・REPORT.md のみ（ほかは L2 の発注記録） |
| C-6 | SPACE_HANDOFF.md の追加行にローカル絶対パス・メールアドレス・認証情報のヒットなし |
| REPORT.md の主張との照合 | 起動時チェック、読んだもの（T4 worktree の HEAD `5e38423`、`qc.mjs` は `1b1bb5b` から正規表現だけの差分）、P1-1 の4点の決定と理由、Q-T9a-1〜4 の既定つき記録、検証結果（C-1〜C-8）を照合 |

## L2 決定・注記

1. **Q-T9a-1〜4 は QUESTIONS.md へ転記しない。** 質問はスペース側の決定事項（配置先、GLB、制作モデルと階層ワークフロー、スペース表示名）で、SPACE_HANDOFF.md §8 に既定つきで記録されている。S1 の実働が読むのはこの文書であり、ローカル作業の質問ログへ移す必要はない。
2. **D1〜D6 は T4／G4-α への持ち越し。** CONTRACT と `qc.mjs` の食い違い6件は、スペースの読み方を指定したことで S1 の進行を妨げない。どちらが正かは、QC の所有者である T4（または G4-α の統合時）に判断を委ねる。T9a の範囲外として正しく記録されている。
3. **T9b は要る（SPACE_HANDOFF.md §7 の結論を承認）。** T9b の発注は G4-α の後、T9a の結論を前提に行う。担当は実働 B、依存は T5・T9a。
4. **ENVIRONMENT.md への起動時チェック行の転記は G4-α の統合時に行う**（T9a の起動時チェック：Node v24.15.0、npm ci 成功、縮退レベル 0）。

## 次

- T9a の成果は `task/T9a-handoff` にあり、G4-α で `feat/explainer-harness` へ統合する。
- G4-α は T5-4-fix・T8a・T9a の完了後。T5-4-fix はまだ実行中。
