# REPORT — T2 開発ハーネス文書

- 作業ID：`2026-11-13-explainer-ui-harness` ／ ブランチ：`task/T2-harness-docs` ／ `<BASE>`：`2a7d209`
- 実働：L3 実働 A（Claude Code、Opus 5.5、effort medium の指定で起動。非対話）
- 合否の判定はしない（G3 は L2）。以下は証拠の提出のみ。

## 1. 起動時チェック（計画書 §8.1）

| 項目 | 結果 |
| --- | --- |
| 層 | L3 実働 A（`DIRECTION.md` の記載どおり） |
| 製品／モデル／effort | Claude Code ／ `claude-opus-5-5` ／ medium（起動指示による。effort は自分では計測できないので指示の値を記録） |
| サブエージェント | 起動可能（Agent ツールあり）。本タスクでは使っていない（下請けに出した範囲：なし） |
| コマンド実行 | 可。`node -v` → `v24.15.0`。`npm test` 実行可 |
| 対話 | 不可（非対話セッション） |
| ネットワーク | 可（`npm ci` が成功。worktree に `node_modules/` が無かったため実行） |
| Chrome・Aivis・GPU | 本タスクでは不要のため未確認 |
| 縮退レベル | **0（標準）**。理由：サブエージェント・コマンド実行・ネットワークが使える。非対話だが質問は不要だった（`QUESTIONS.md` への追加なし） |
| 自己判定になるゲート | なし（G3 は L2 が別セッションで行う予定） |

## 2. 変更したファイル

| ファイル | 内容 |
| --- | --- |
| `AGENTS.md`（新設、111行） | 2つのハーネスの区別と HN-14 の1文（冒頭 §1）、最初にやること、絶対規則9項（HN-03 の1〜8。2は AM-1 版。9は HN-11 非対話行の「取り消しにくい操作」を計画書 §1.1 の解釈で規則化）、コマンド、地図、**§6 制作ハーネスの設計思想**、§7 制作原則の要約とリンク・制作ハーネスとの境界（HN-01・14・15・16）、完了の定義、正本の一覧 |
| `CLAUDE.md`（新設、16行） | `@AGENTS.md` の取り込みと Claude Code 固有の事項（層とモデル・effort の対応、サブエージェント、セッションの分け方、worktree と stash） |
| `docs/WORKFLOW.md`（新設、159行） | 層と責務（HN-05・07 の運用・交差レビュー）、ゲート G1〜G4＋公開＋公開後確認（HN-06 の AM-1 版、HN-08、公開後の巻き戻し）、ブランチとコミット、受け渡しファイルと書式例（HN-04・09）、起動時チェック（HN-10）、縮退（HN-11 の統合順序・レベル表、HN-12 の AM-1 置換版、HN-13 の置換後の文）、エージェント製品ごとの注意（Codex・その他・Windows） |
| `README.md`（+4行） | 冒頭近く（「ローカル起動」の前）に「エージェントで開発する場合」の1節（HN-02、HN-01 の「README の MV・解説の節は紹介であり正本ではない」の明記） |
| `docs/work/…/tasks/T2/REPORT.md` | 本書 |

## 3. 完了条件ごとの証拠

### 3.1 行数上限

```
$ wc -l AGENTS.md CLAUDE.md docs/WORKFLOW.md
  111 AGENTS.md
   16 CLAUDE.md
  159 docs/WORKFLOW.md
```

### 3.2 規則の所在一覧（規則ごとに所在1つ）

| 規則・事柄（要件 ID） | 所在 | 他ファイルでの扱い |
| --- | --- | --- |
| 2つのハーネスの区別、HN-14 の1（開発中は `job-template/AGENTS.md` に従わない） | `AGENTS.md` §1 | WORKFLOW の Codex 注意は「§1 に従う」と参照のみ |
| HN-14 の2（job-template 冒頭の1文を置き消さない）、HN-15（job-template は repo 文書に依存しない）、HN-16（ジョブに4層を持ち込まない） | `AGENTS.md` §7「制作ハーネスとの境界」 | ジョブ内 QC レビュー分離の本文は job-template 側（T3）に委ねると明記 |
| 最初にやること（層の判定・環境記録・成果物から開始） | `AGENTS.md` §2 | 起動時チェックの項目は WORKFLOW §4 のみ |
| 絶対規則1〜9（HN-03、AM-1 版の2、非対話時の取り消しにくい操作） | `AGENTS.md` §3 | WORKFLOW は「絶対規則 n」と番号で参照 |
| 制作ハーネスの設計思想（オーナー確認 2026-11-13 20:57） | `AGENTS.md` §6 | 他に無し |
| 制作原則の要約とリンク（HN-01） | `AGENTS.md` §7（要約のみ。本文は `job-template/AGENTS.md`） | — |
| 完了の定義 | `AGENTS.md` §8 | ゲート条件は WORKFLOW §2 を参照 |
| 層の責務・下請けの使い方（HN-05）・自己合格禁止の運用（HN-07）・交差レビュー | `docs/WORKFLOW.md` §1 | 規則本体（自己合格禁止）は AGENTS 規則8 |
| ゲート G1〜G4・公開・公開後確認（HN-06 AM-1 版）、差し戻し（HN-08）、公開後の巻き戻し | `docs/WORKFLOW.md` §2 | AGENTS 規則2は「G4 合格でマージ可」の方針のみで、条件の列挙は WORKFLOW G4 行 |
| ブランチ名・コミットの切り方・帰属行の置き場所 | `docs/WORKFLOW.md` §2「ブランチとコミット」 | — |
| 受け渡しファイルと書式例（HN-09）、記録の置き場所（HN-04） | `docs/WORKFLOW.md` §3 | AGENTS の地図は場所の説明のみ |
| 起動時チェック（HN-10） | `docs/WORKFLOW.md` §4 | — |
| 縮退の統合順序・レベル表（HN-11）、最低限の関門（HN-12 AM-1 版）、自己レビューの扱い（HN-13 置換） | `docs/WORKFLOW.md` §5 | 最低限の関門は AGENTS 規則1・3・4・8 を番号で参照し、追加の2項目だけを書いた |
| Codex 固有の注意 | `docs/WORKFLOW.md` §5「エージェント製品ごとの注意」 | — |
| Claude Code 固有（層とモデル・effort、サブエージェント、セッション、worktree） | `CLAUDE.md` | — |
| 他エージェントの入口（HN-02）、README の節は紹介であって正本ではない（HN-01） | `README.md`「エージェントで開発する場合」 | AGENTS §9 の正本一覧は README を「利用者向けの使い方」とだけ書く |

### 3.3 「目視」の全出現箇所

```
$ grep -n "目視" AGENTS.md CLAUDE.md docs/WORKFLOW.md
AGENTS.md:27:2. **main へ直接 push しない。強制 push しない。** …機械的ゲート・実装者以外のレビュー・スクリーンショットの記録（…G4）に合格したら、**オーナー目視を待たずに** main へマージし Pages へ公開してよい。…
docs/WORKFLOW.md:148:**自己レビューの扱い。** `review_mode: self` のゲートがあっても作業は止めず、上の記録をして進める。オーナー目視の強制には使わない。…
```

2件とも「待たない」「強制に使わない」という否定の文脈で、マージ・公開の条件ではない（判定は L2）。G5 は書いていない（`grep -n "G5"` は3ファイルとも0件）。オーナーの意見は WORKFLOW §2 で「公開後の任意フィードバック（`FEEDBACK.md`）」として扱った。

### 3.4 制作ハーネスの設計思想（`AGENTS.md` §6）

DIRECTION の4点との対応：意図的な緩さとフォーマット非固定（1項目め）／ゲートは客観的に判定できて視聴者に実害のあるものだけ、例示5種つき（2項目め）／主観的な質は助言に留める（3項目め）／将来の編集者は緩さを「改善」と称して締め付けてはならない、締め付けにあたる行為の例つき（4項目め）。末尾で N1・N10・§2.6（D4・D5）との関係を書いた。

## 4. 全タスク共通の完了条件（コミット前に、ステージした内容で実行）

| 条件 | コマンドと結果 |
| --- | --- |
| C-1 | `npm test` → `ℹ tests 29 / pass 29 / fail 0` |
| C-2 | `npm run build -- --base=/BiimMotionWebUI/` → `✓ built in 4.54s`（チャンクサイズの警告のみ。既存） |
| C-3 | `git diff --cached --check 2a7d209` → 出力なし。`git diff --check 2a7d209...HEAD` → 出力なし |
| C-4 | `git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts` → 差分なし（終了コード0）。`git diff -U0 955fa5c -- tests/job.test.ts \| grep '^-[^-]'` → 出力なし |
| C-5 | `git diff --cached --stat 2a7d209` → `AGENTS.md`、`CLAUDE.md`、`README.md`、`docs/WORKFLOW.md` と、L2 の発注記録 `tasks/T0・T1・T2/DIRECTION.md`（L2 のコミット）のみ。本 REPORT を加えてコミットする |
| C-6 | 計画書 §5.0 の2つの grep をステージした差分に実行 → どちらも一致なし（終了コード1） |
| C-7 | `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の中身は読み込んでいない（`npm ci`・`npm test`・`npm run build` の実行で生成・使用されたのみ） |
| C-8 | `cmp docs/work/2026-11-13-explainer-ui-harness/PLAN.md docs/requirements/ORCHESTRATION_PLAN.md` → 一致（本タスクは計画を変えていない） |

コミット後に同じ C-3・C-5・C-6 を `2a7d209...HEAD` で再実行する（結果は最終メッセージで報告。ファイルの内容はステージ時と同一）。

## 5. 指示からの逸脱・判断と理由

1. **監査の場所**：DIRECTION の相対パス `../BiimMakerWebUI/.agent-work/` はこの worktree からは存在しなかった。メインのチェックアウトは worktree の2階層上にあり、`../../BiimMakerWebUI/.agent-work/audit-*.md` を読んだ（読むだけ。変更なし）。T2 に関係する記述は少なく、要件書 §4 と計画書が主な根拠。
2. **絶対規則9の追加**：HN-03 は8項目だが、HN-11 の「対話できない」行にある「取り消しにくい操作は手前で止める」を、計画書 §1.1 の解釈（main マージと Pages 公開は AM-1 で許可済み、強制 push・履歴改変・一括削除・本番 DB 移行は止める）とともに AGENTS の規則9として1箇所に置いた。WORKFLOW の該当行は規則9を参照するだけ。
3. **層とモデルの対応の置き場所**：要件書 4.1 が「モデル・effort と層の対応」を `CLAUDE.md` の内容としているため、Claude のモデル対応は `CLAUDE.md`、Codex の割り当ては WORKFLOW の Codex の注意に置き、WORKFLOW の層の表にはモデル列を入れなかった（重複を避けるため）。
4. **タスクフォルダ名**：要件書は `tasks/<T番号>-<名前>/` だが、本作業の実際のフォルダは `tasks/T2/` のため、WORKFLOW では `tasks/<タスクID>/` と書いた。
5. **G4 の条件**：作業固有の統合検査（MV 生成物の差分検査など）は WORKFLOW に書き写さず「`PLAN.md` が定める統合検査」とした。
6. `docs/DESIGN.md` は未作成（T6 の担当）なので、AGENTS では「作成後」と注記しリンクにしていない。

## 6. 未解決の点

- README の見出し `# BiimMakerWebUI` は表示名の変更対象だが、本タスクの範囲（1節の追加のみ）外なので変えていない（T8b 等の担当）。
- `.agent-work/` の `.gitignore` 追加は T0 の担当。AGENTS の地図は「追跡しない」と書いており、T0 の取り込み前は実態と食い違う。
- push はしていない（DIRECTION の指示）。
