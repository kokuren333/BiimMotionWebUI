# T5 実装記録

作業ID: `2026-11-13-explainer-ui-harness`。担当: L3 実働 B（Codex、指定モデル `gpt-6.1-sol` / effort high、非対話セッション）。G3 は別コンテキストの実働 A による交差レビューに残す。本記録は実装とコマンド結果の証拠であり、自己合格判定ではない。

## 起動時チェックと判断

- ブランチ `task/T5-webui`、開始 HEAD `68e6847`、基準 `2a7d209`。ブランチを切り替えない。
- コマンド実行可: Node `v24.15.0`、npm `11.12.1`、git `2.54.0.windows.1`。
- サブエージェント起動機能は利用可能。今回は使用せず、順に実装する。
- 非対話セッションとして質問はこの記録に残し、既定で進める。
- 初期状態に依存フォルダなし。`npm ci` は終了コード0（34 packages added）。ネットワークを使った依存取得が成功。
- Chrome / Edge の実行ファイルが存在。ヘッドレス実行可否は UI 検証時に実行で確認する。Aivis と GPU レンダーは対象外。
- 縮退レベル0。別コンテキストの G3 は予定どおり。自己判定になるゲートはない。スクリーンショットは T5b の取り込み後まで実施しない。
- 指定順で Amendment 01・02、要件書、計画書、T1 契約、T3 AGENTS、現行ソースを参照。契約と T3 文書は、提示された相対パスの余分な階層を除いた隣接 worktree `../T1/` と `../T3/` から読む。T1 HEAD `8d8ba75`、T3 HEAD `759be8d`。他 worktree には書き込まない。
- 縦向きの候補生成は DIRECTION どおり biim / mixed を除外する。フォーム自体の縦＋biim は T1 §4.2・4.4 に従い全画面として許可し説明する（既存 MV / job テストを維持）。
- この worktree に `tools/ui-shots.mjs` はまだない（T0 未取り込み）。T5b も未発注。T5-4 は後続で必要。
- `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の既存内容は読んでいない。検証コマンドによる依存利用・ビルドのみ。

## 取り込み

- 最初の変更操作: `git cherry-pick 15b42a7` → `fe51eb2`。T4-1 の字幕帯域 `.mjs` と `.d.mts`、同コミットのテストと T4 記録が入った。T4-2〜4 は取り込んでいない。
- `.mjs` / `.d.mts` の存在と export 型を確認。`npm test` の結果は以下へ追記する。
- T4-1 取り込み直後の `npm test`: 終了コード0、32 tests / 32 pass / 0 fail。
- 一致テスト追加前に T3 のブランチ差分3コミットを順に cherry-pick: `e9f6429` → `38f0a4b`、`ded399b` → `5e2cc42`、`759be8d` → `2b8a6fd`。競合なし。job-template の手編集なし。

## T5-1

- `src/explainer-assist.ts` を追加。6軸、人数による役回りの切り替え、キャラなしの5軸、様式→型の順の抽選、候補の追記文、共通字幕モジュールによる統計、23項目の定義。
- `tests/explainer.test.ts` で seed 再現性・全軸での相違・縦向き制約・役回り・統計・半角と改行の字幕判定・T3 の23項目との一致を表明。
- 400 seed、各3案（計1200）: biim 299 (24.92%)、anime 298 (24.83%)、motion 294 (24.50%)、mixed 309 (25.75%)。先頭案のみでも 110 / 97 / 92 / 101（全モード15%以上）。
- `npm test`: 45 tests / 45 pass / 0 fail（終了コード0）。
- `npm run build -- --base=/BiimMotionWebUI/`: 終了コード0、92 modules transformed。既存の500kB超チャンク警告あり。
- 統計の文字数・推定秒数は空白以外を数える。見出しは Markdown / 角括弧、ブロックは空行で区切る。字幕単位は見出しを除いて共通 `splitCaptionUnits` を使い、使用しうる領域のいずれかに収まらなければ注意として数える。

## 検証と残作業

実装・検証の進行に応じて追記する。T5b 取り込み前の CP-W1 は撮影しない。push・main マージ・公開は行わない。

## T5-2

- T1 §3・4 に従い、解説専用フォーム項目・様式切り替え・未編集既定文の差し替え・project の解説キー・`schema_version: 0.4` を実装。MV には解説専用キーを出力しない。
- 構成メモは非空時だけ `plan/outline.txt` に改行を含む原文で保存。brief へ理解設計・3案比較・スタイル定義・前後QCとレビュー・助言の線引き・23項目・14工程の成果物を追加。
- anime / motion は全画面と標準字幕。createBrief と ZIP へ追記する部分、依頼文のすべてで契約 §4.6 の禁止語が出ないことを検査。mixed の場面単位の様式と `biim: false` の指示を検査。
- `npm test`: 終了コード0、49 tests / 49 pass / 0 fail。
- `npm run build -- --base=/BiimMotionWebUI/`: 終了コード0、94 modules transformed。500kB超チャンク警告のみ。
- MV 非退行の追加証拠: テスト内で `git show 955fa5c:src/job.ts` 等の追跡ソースを一時ディレクトリへ読み出し実行。横・縦の2ケースでフォーム切り替え結果と project（schema_version以外）を deepEqual、依頼文・brief・ZIP内 brief と lyrics を bytes で比較。baseline worktree や既存生成物は読んでいない。
- MV 依頼文 SHA-256（両ケースとも基準と一致）: `6a6a84c993999ef0e87502892bb8eec34f3320857eb82deddc0bfa15510c5075`。
- MV brief SHA-256（横）: `a2ed8ea9aa26f088c2becef3541dd51f280a693ce7dc9ba3249b2732508d6c13`、（縦）: `1dd42e013bf14c36276ea3048d3cc187a1da395d107a940cd6b3825ce491bb5f`。どちらも基準とバイト一致。
