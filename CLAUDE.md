# CLAUDE.md — Claude Code 向けの入口

規則の正本はルートの AGENTS.md です。ここには Claude Code 固有の事項だけを書き、規則は複製しません。

@AGENTS.md

## Claude Code 固有の事項

- **層とモデル・effort の標準の対応**
  - L1 PM：Fable 5.2（`claude-fable-5-2`）、effort high
  - L2 オーケストレーター：Opus 5.5（`claude-opus-5-5`）、effort high
  - L3 実働（文書・UI 系）：Opus 5.5、effort medium
  - L4 下請け：実働セッションから起動するサブエージェント
- **サブエージェント**：Agent ツールで起動する。L4 の切り出し方と検品は docs/WORKFLOW.md §1。レビュー用サブエージェントは親と別コンテキストとして扱えるが、同一モデルである点を `REVIEW.md` に書く。
- **層ごとにセッションを分ける**：層を替えるときは新しいセッション（`claude -p` の非対話実行を含む）で始める。`-p` は対話できない実行なので、docs/WORKFLOW.md §5 の「対話できない」行に従う。
- **worktree**：L2 がタスクごとに `git worktree` を用意した場合、自分の worktree の外を変更しない。git stash は他のセッションと共有されるので使わない。
