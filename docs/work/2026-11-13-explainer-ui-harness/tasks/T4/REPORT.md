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

コミット: `15b42a7`。T1 worktree の HEAD は `8d8ba75`、契約の blob はそのコミットの blob と一致していることも確認した。

## T4-2 QC コマンド

PRE-1〜8、POST-1〜8（POST-4R・POST-5R を含む）、JSON/Markdown 出力、検査入力の SHA-256、規則版、様式・scope、レビュー読取、免除を実装。post の構造検査は実際に `validate --final` を子プロセスで実行する。ghost 検出件数は助言であり、preview・final 双方の全件照合と残存ゴーストの解消をゲートにした。音声なしの自動字幕・同期検査は対象外。

`npm test`: 47 tests / 47 pass / 0 fail。`npm run build -- --base=/BiimMotionWebUI/`: exit 0。QC 単独18件で合否・様式・免除・MV・事後同期・走査鮮度・照合欠落・通し視聴未確認・納品記録欠落を表明。POST-1 の単体テストは子プロセス起動と終了コードをスタブで確認し、実際の validate は T4-3 と展開フィクスチャで別途検証する。

免除の書き手本人は機械認証できないため、契約どおりオーナー専用節にある行だけを読む。節外のエージェント免除は無効。実装がレビュー行や免除行を書き込むことはない。テストのチェック・免除記録は一時フォルダ内の合成データ。

コミット: `1b1bb5b`。

## T4-3 validate の記録・様式対応

解説の完了記録に explanation-map・direction・evidence を追加。evidence は JSON として読め、sources・claims が配列であることも確認。様式整合 R1〜R7 を共通モジュールで検査し、note_top・note_bottom は実効様式 biim の場面だけに要求。MV 分岐・ghost 助言のコードは維持。

`npm test`: 52 tests / 52 pass / 0 fail。`npm run build -- --base=/BiimMotionWebUI/`: exit 0。`git diff --check`: 出力なし（改行形式の Git 通知のみ）。実際の validate 子プロセスで4様式の記録検査、3記録それぞれの欠落、evidence の配列型、Biim ノート欄の必須性、mixed の様式欠落、MV の従来記録を確認。単体テストの TypeScript 対象は最小プログラム（インストール済みの実コンパイラを利用）、MP4 は構造検査用の合成ヘッダ。完成動画の生成・目視を検証したとは扱わない。生成 runtime 全体の TypeScript は T4-4 の展開先 validate で検証する。

`git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts tests/job.test.ts`: exit 0。既存テスト3ファイル無変更。
