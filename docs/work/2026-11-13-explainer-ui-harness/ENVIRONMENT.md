# ENVIRONMENT — 各層の実際の担当と縮退の記録

作業ID：`2026-11-13-explainer-ui-harness`
書く者：L2 オーケストレーター。各セッションは起動時に計画書 §8.1 のチェックを行い、この表に1行追記する。
ローカルの絶対パス・連絡先は書かない。

## 1. 層ごとの実際の担当

| 層 | 担当（実際） | エージェント製品・起動形態 | モデル | effort | セッション | 状態 |
| --- | --- | --- | --- | --- | --- | --- |
| 監査（材料） | Muse 側（オーナーのエージェント環境） | 不明（このリポジトリからは確認できない） | 不明 | 不明 | L1・L2 と別 | 完了（`.agent-work/audit-*.md`、未追跡） |
| L1 PM | Fable 5.2 | Claude Code CLI、非対話（`-p`） | `claude-fable-5-2` | high | 独立セッション。初回起動はモデル未認識で失敗し、別の起動方法で再実行して完了 | 完了（要件書） |
| オーナー決定 | オーナー（side chat） | — | — | — | — | Amendment 01（2026-11-13 20:11 JST）、Amendment 02（表示名 `BiimMotion` 確定、2026-11-13 20:36 JST） |
| L2 オーケストレーター（初回） | Opus 5.5 | Claude Code CLI、非対話（`-p`） | `claude-opus-5-5` | high | 独立セッション | Amendment 01 反映のため成果物作成前に停止（成果物なし） |
| L2 オーケストレーター（差し替え版・本セッション） | Opus 5.5 | Claude Code CLI、非対話（`-p`） | `claude-opus-5-5` | high | 独立セッション（L1・初回 L2 と別） | 計画書・BRIEF・本ファイル・QUESTIONS を作成 |
| G2 計画レビュー | Opus 5.5 のレビュー用サブエージェント | 本 L2 セッションから起動した別コンテキスト | 親と同じ | 親と同じ | L2 の子コンテキスト（計画を書いたコンテキストとは別） | `G2-REVIEW.md` を参照 |
| G2 計画レビュー（独立） | Muse（親エージェントの別コンテキスト） | VM のコピーのみで検証。PC には触れていない | 不明 | 不明 | L2・その子とは別の独立セッション | 条件付き GO。`~/workspace/biim-upgrade/g2-review.md` を参照。P0 2件（Amendment 02 反映、T9b コミット位置）を本ファイル群の更新で解消済み |
| L3 実働 A | Opus 5.5 medium（予定） | Claude Code | — | medium | 未起動 | — |
| L3 実働 B | Codex 6.1 sol high（予定） | Codex CLI | — | high | 未起動 | — |
| L3 制作（T11） | Opus 5.5 または Fable 5.2（予定） | 生成した解説ジョブ内 | — | — | 未起動 | — |
| L4 下請け | 各実働のサブエージェント（予定） | — | — | — | 未起動 | — |

## 2. 縮退レベル

| 時点 | レベル | 理由 |
| --- | --- | --- |
| 2026-11-13 計画時点 | 0（標準） | PM＝Fable 5.2、L2＝Opus 5.5 high が別セッションで稼働。サブエージェントは本 L2 セッションで利用可能。実働は未起動のため L3 の可否は起動時に判定する |

注記：L1・L2 とも非対話実行。質問は `QUESTIONS.md` に書き、既定の判断で進めている（HN-11 の「対話できない」行）。main へのマージと Pages 公開は Amendment 01 AM-1 によりオーナーが事前に許可済みとして扱う（計画書 §1.1、Q1）。

## 3. 自己判定になったゲート

| ゲート | review_mode | 説明 |
| --- | --- | --- |
| G1 要件 | —（判定者は L2。要件の起案者は L1 なので自己判定ではない） | 条件付き合格（計画書 §2） |
| G2 計画 | independent（レビュー用サブエージェント。同一モデル・同一セッションの子だが、計画を書いたコンテキストとは別） | 1回目「差し戻し」（高2・中9・低8）→ L2 が修正 → 2回目「合格」（低4、反映済み）。同一モデルである点は限界として記録する。PM による追加確認は任意 |

（以降、G3・G4 と各タスクの判定をここに追記する）

## 4. セッション起動記録（追記用）

| 日時（JST） | タスク | 層 | 製品／モデル／effort | サブエージェント | コマンド実行 | 対話 | ネットワーク | Chrome | 縮退レベル | 備考 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-11-13 | 計画 | L2 | Claude Code／Opus 5.5／high | 可 | 可 | 不可 | 未確認 | 未確認 | 0 | 本セッション |
| 2026-11-13 | T0 | L3 実働 A | Claude Code／Opus 5.5／medium | 可（未使用） | 可 | 不可 | 可（`npm ci` 成功、Pages HTTP 200） | 可（Chrome 157、`--headless=new`） | 0 | Node v24.15.0。Aivis・GPU 不要。G4-α で `tasks/T0/REPORT.md` §1 から集約 |
| 2026-11-13 | T2 | L3 実働 A | Claude Code／Opus 5.5／medium | 可（未使用） | 可 | 不可 | 可（`npm ci` 成功） | 未確認（不要） | 0 | G4-α で `tasks/T2/REPORT.md` §1 から集約 |
| 2026-11-13 | T1 | L3 実働 A | Claude Code／Opus 5.5／medium | 可（未使用） | 可 | 不可 | 可（`npm ci` 成功） | 未確認（不要） | 0 | 着手前ベースライン29件合格。G4-α で `tasks/T1/REPORT.md` §1 から集約 |
| 2026-11-13 | T4 | L3 実働 B | Codex／`gpt-6.1-sol`（指定値）／high | 可（未使用） | 可 | 不可 | 可（`npm ci` 成功） | 未確認（不要） | 0 | G4-α で `tasks/T4/REPORT.md` 冒頭から集約 |
| 2026-11-13 | T3 | L3 実働 A | Claude Code 2.1.319／Opus 5.5／medium | 提示あり（未使用） | 可 | 不可 | npm 可、Pages 未確認 | 未確認（不要） | 0 | G4-α で `tasks/T3/REPORT.md` §0 から集約 |
| 2026-11-13 | T5 | L3 実働 B | Codex／`gpt-6.1-sol`（指定値）／high | 可（未使用） | 可 | 不可 | 可（`npm ci` 成功） | 実行ファイルあり | 0 | G4-α で `tasks/T5/REPORT.md` 冒頭から集約 |
| 2026-11-13 | T5b | L3 実働 B | Codex／`gpt-6.1-sol`（指定値）／high | 可（未使用） | 可 | 不可 | 可（`npm ci` 成功） | 未確認（不要） | 0 | G4-α で `tasks/T5b/REPORT.md` 冒頭から集約 |
| 2026-11-14 | T5-4 | L3 実働 B | Codex／`gpt-6.1-sol`（指定値）／high | 可（未使用） | 可 | 不可 | 可（`npm ci` 成功） | 可（Chrome 157、撮影で確認） | 0 | G4-α で `tasks/T5-4/REPORT.md` 冒頭から集約 |
| 2026-11-14 | T8a | L3 実働 A | Claude Code／Opus 5.5／medium | 提示あり（未使用） | 可 | 不可 | 可（`npm ci` 成功） | 未確認（不要） | 0 | G4-α で `tasks/T8a/REPORT.md` §0 から集約 |
| 2026-11-14 | T9a | L3 実働 A | Claude Code／Opus 5.5／medium | 可（未使用） | 可 | 不可 | 可（`npm ci` 成功） | 未確認（不要） | 0 | G4-α で `tasks/T9a/REPORT.md` から集約 |
| 2026-11-14 | G4-α 統合 | L3 実働 A | Claude Code／Opus 5.5／medium | 可（未使用） | 可 | 不可 | 可（`npm ping` 応答） | 実行ファイルあり（Chrome・Edge） | 0 | GPU（RTX 3080）あり。自己判定になるゲートなし（G3 は L2）。詳細は `tasks/G4-alpha/REPORT.md` |
| 2026-11-14 | T6 | L3 実働 A | Claude Code 2.1.319／Opus 5.5／medium | 可（未使用） | 可 | 不可 | 可（`npm ci` 成功） | 可（Chrome 157、撮影で確認） | 0 | G4-β で `tasks/T6/REPORT.md` §1 から集約 |
| 2026-11-14 | T7 | L3 実働 A | Claude Code 2.1.319／Opus 5.5／medium | 可（未使用） | 可 | 不可 | 可（`npm ci` 成功） | 可（Chrome 157、撮影・操作で確認） | 0 | G4-β で `tasks/T7/REPORT.md` §1 から集約 |
| 2026-11-14 | T9b | L3 実働 B | Codex／`gpt-6.1-sol`（指定値）／high | 可（未使用） | 可 | 不可 | 可（`npm ci` 成功、registry・Pages の HTTP HEAD 200） | 実行ファイルあり（headless の動作は未実証、不要） | 0 | G4-β で `tasks/T9b/REPORT.md` 冒頭から集約 |
| 2026-11-14 | T8b | L3 実働 A | Claude Code 2.1.319／Opus 5.5／medium | 可（未使用） | 可 | 不可 | 可（`npm ci`・`git ls-remote` 成功） | 実行ファイルあり（起動せず、不要） | 0 | G4-β で `tasks/T8b/REPORT.md` §1 から集約 |
| 2026-11-14 | G4-β 統合 | L3 実働 A | Claude Code／Opus 5.5／medium | 可（未使用） | 可 | 不可 | 可（`npm ping` 応答、基準 worktree の `npm ci` 成功） | 実行ファイルあり（Chrome 157。撮り直しをしないため起動せず） | 0 | GPU（RTX 3080）あり（本タスクでは不要）。自己判定になるゲートなし（G3 は L2）。詳細は `tasks/G4-beta/REPORT.md` |
