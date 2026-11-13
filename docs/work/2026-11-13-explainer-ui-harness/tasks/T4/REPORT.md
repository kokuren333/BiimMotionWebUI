# T4 実装報告

- 作業ID: `2026-11-13-explainer-ui-harness`
- 担当: L3 実働 B、Codex、指定モデル `gpt-6.1-sol` / effort high、非対話セッション。
- 起動時確認: `task/T4-qc`、作業開始時の差分なし。Node v24.15.0、npm 11.12.1、Git 2.54.0.windows.1。コマンド実行可能。サブエージェント用ツールは利用可能だが使用しない。
- ネットワーク: `npm ci` 成功（34 packages）。Chrome・Aivis・GPU は本タスクでは不要。
- 縮退レベル: 0。非対話の質問は本報告に残して契約の既定で進める。自己判定になるゲートなし。G3 は別コンテキストの実働 A に委ね、本報告は機械検証の事実だけを記録する。
- 正本を指定順に確認。契約は指示中の相対パスを worktree 配置に合わせて `../T1/docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md` と解決して読み取り（変更なし）。
- C-7: 既存の `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の中身をコンテキストに読み込んでいない。依存のインストールとテスト・ビルドによる利用のみ。
- push・main マージ・他 worktree の変更・スペース操作なし。サブエージェント使用なし。

## T4-1 字幕帯域

契約 §6 の export と `.d.mts` を追加。式・係数・様式判定を import のない単一 ES モジュールに集約。字幕は半角幅と明示改行を評価し、超過は分割で直す。係数は暫定値として `VERIFICATION.md` 末尾に記録。

T4-1 完了。`npm test`: 32 tests / 32 pass / 0 fail。`npm run build -- --base=/BiimMotionWebUI/`: exit 0（87 modules、既存の chunk size 助言あり）。`git diff --check`: 出力なし。L2 はこのコミットから T5 を発注可能。T4-2 以降も本 worktree で継続する。
