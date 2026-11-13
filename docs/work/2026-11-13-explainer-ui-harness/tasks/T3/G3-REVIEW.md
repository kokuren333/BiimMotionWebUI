# G3 REVIEW — T3 制作ハーネス文書（job-template）

- 作業ID: `2026-11-13-explainer-ui-harness`／タスク: T3／ブランチ: `task/T3-docs`（worktree `BiimMakerWebUI-wt\T3`）
- 実装者: L3 実働 A（Opus 5.5 medium、セッション `7b8a57b7-57a8-4688-946f-072f94959a76`）
- レビュー者: L2（別コンテキスト、親）— 2026-11-13 22:31〜22:36 JST
- 判定: **PASS**（条件付きなし。注記は記録のみで、再作業は不要）

## 検証コマンド（L2 が再実行）

| 検証 | 結果 |
| --- | --- |
| `T3.done` / `T3.log` | 22:29 作成、`EXITCODE 0` |
| `git log`（worktree） | `e9f6429`（実装）、`ded399b`（REPORT）。`git status` はクリーン |
| `npm test`（worktree、L2 実行） | **36 pass / 0 fail**（既存29＋新設7。`MV brief and AGENTS…` を含む MV 5件・ghost 全件・imagegen 全件が ✔） |
| `npm run build -- --base=/BiimMotionWebUI/`（worktree、L2 実行） | **built in 11.47s**（チャンクサイズ警告のみ） |
| `ls job-template/plan/` | `narration.json`、`sound-design.json`、`templates` のみ。検査対象パス（`direction.md` 等）は無い |
| C-4（MV 非退行） | `tests/ghost.test.ts`・`tests/imagegen.test.ts` は 955fa5c から差分なし。`tests/job.test.ts` の削除行なし。MV 5件がテストで ✔ |
| C-6 | `git diff 2a7d209..HEAD -- job-template tests` にローカル絶対パス・メールアドレス・認証情報のヒットなし |
| 削除行の検査（`git diff 2a7d209..HEAD -- job-template/AGENTS.md` の `-` 行28件を全件確認） | すべて説明のつく移動・改題・再編：見出しレベルの変更（`####`→`###` 等）、`## 自由度` 見出しの削除、レンダーゴースト節の共通章への移動（本文は新位置に再掲）、「解説動画と共通の演出」の改題、旧12ステップの14ステップへの再編（REPORT §2 の収め先どおり）。MV 章の本文行の削除は見出し以外になし |
| 失敗チェックリスト23項目 | `sed -n '291,324p'` に番号付き項目が23件。テスト2が全項目を表明し合格 |
| 様式モード節 | `biim` は既定であって必須ではない、4モード表、mixed の区間割り当て、非 Biim の3部品名を確認 |
| 設計思想の宣言（T2 と同じ趣旨の明記） | AGENTS.md 328–333行の「ゲートと助言の線引き」にあり。「この緩さは意図したものである。主観的な質を規則にする、表現手法を禁止・固定する、出力フォーマットを固定する、助言を合否にする、といった締め付けをしない」を確認 |
| REPORT.md の主張との照合 | §2 の新行番号の対応、§3 のテスト表明内容（a)(b)(c)、§4 の完了条件の証拠、§5 の新旧行番号対応表と実ファイルを照合。§5 の対応表は CONTRACT §5.5 の修正材料として使える状態 |

## L2 決定（REPORT §6 の Q-T3-1／Q-T3-2）

1. **Q-T3-1（方向性3案の様式モードの扱い）— 実装者の解釈を認める。** 案の様式モードは `brief.md` と `project.direction.style_mode`（ユーザーの選択）に従い、その範囲で見た目の型を変える。エージェントが方向性の検討の結果として `style_mode` 自体を書き換えることはしない（ユーザーの明示選択を上書きする恐れがあるため）。様式モード自体の候補生成は WebUI 側（T5）の役割。AM-2 の「explainer-assist は様式モード自体を候補生成対象に」と矛盾しない（候補生成は T5 の `explainer-assist` が行い、方向性はその選択の範囲で検討する）。
2. **Q-T3-2（工程13・14の順序）— 実装者の解釈を認める。** POST-1（`validate --final`）と POST-8 が `reports/delivery.md` を検査するため、工程13に「14の納品記録を書いてから事後ゲートを通す」と書いた。EX-10 の番号順は変えていない。

## 注記（L2 判断）

1. **未検証の2件は T4 取り込み後の確認に委ねる（ブロッキングではない）。** 生成ジョブ内での `npm run qc` の実動作と、ひな形を写した記録が T4 の `qc.mjs` の解析規則で期待どおり判定されることは、T4 がまだ無いため T3 では検証できない。REPORT §7 に明記されており、T4・T5 の統合時に確認する。T4 の G3（交差レビュー）でこの突き合わせが検証対象になる。
2. **§5.5 のソース行参照ずれは T10 締めで対応（変更なし）。** REPORT §5 の対応表により、T10 が CONTRACT §5.5 を直すときの新旧行番号が確定している。T3 の DIRECTION に入れられた「REPORT.md に新旧行番号対応表を残す」は果たされている。
3. **非 Biim 部品名は T5b 待ち。** AGENTS.md は CONTRACT §4.8 の部品名（`FullscreenStage`・`StandardCaption`・`DiagramStage`）で書き、「任意。独自実装してよい」としている。T5b が名前を変える場合は AGENTS.md とテストの表明も合わせる必要がある（REPORT §6 に明記済み）。
4. **ENVIRONMENT.md への起動時チェック行の転記は G4-α の統合時に行う**（T3 の起動時チェック：Node v24.15.0、npm ci 成功、縮退レベル 0）。

## 次

- T3 の成果は `task/T3-docs` にあり、G4-α で `feat/explainer-harness` へ統合する。
- T4 は実行中。監視 cron `biim-t3t4-watch`（5分間隔）が完了を検知して報告する。
