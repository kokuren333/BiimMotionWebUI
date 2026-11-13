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

コミット: `70a51de`。

## T4-4 フィクスチャと最終検証

`--style=biim|anime|motion|mixed`、`--qc=pass|fail-evidence|fail-caption|fail-review`、`--out=<dir>` を追加。`--out` 省略時は従来の `.verification/`。既存 MV・duo・portrait・fullscreen オプションを維持。QC 用の台本・根拠・設計・ストーリーボードと、合成データと明記したレビュー記録を ZIP と展開先の両方に生成する。実際の動画のレビュー済み記録とは扱わない。

フィクスチャ検査から追加した境界ケースとして、契約 §1.9 の空白＋括弧書きつき見出し、空本文のレビュー行、明示的な null 様式の拒否も補強した。字幕式・係数は変更していない。テストファイル末尾の余分な空行も除去した。

最終 `npm test`（Git Bash）: 54 tests / 54 pass / 0 fail（duration 35907.9122ms）。PowerShell での指定 base ビルドは exit 0（88 modules）。Git Bash の通常実行では MSYS が base をパスに変換したため、その実行は指定 base 検証の根拠にせず、`MSYS2_ARG_CONV_EXCL='*'` で自動変換を止めて再実行し、`vite build --base=/BiimMotionWebUI/`・88 modules・exit 0 を確認した（6.25s、既存の chunk size 助言あり）。

Git Bash で指示の4様式・3不合格・MV コマンドを実行し、8展開先すべてで `npm install` 成功。以下の出力を得た。表の validate は生成 runtime 全体の実 TypeScript 検査を含む。

| フィクスチャ | validate | qc pre / qc | 出力 |
| --- | --- | --- | --- |
| biim | exit 0 | pre exit 0 | QC pre: pass |
| anime | exit 0 | pre exit 0 | QC pre: pass |
| motion | exit 0 | pre exit 0 | QC pre: pass |
| mixed | exit 0 | pre exit 0 | QC pre: pass |
| mixed / fail-evidence | 対象外 | pre exit 1 | QC pre: fail |
| mixed / fail-caption | 対象外 | pre exit 1 | QC pre: fail |
| mixed / fail-review | 対象外 | pre exit 1 | QC pre: fail |
| mv | exit 0 | qc exit 0 | この版に MV の規則は無い。MV は AGENTS.md の MV 制作工程に従う |

MV の `test ! -e .../reports/qc-pre.json`: exit 0。3不合格は単体テストでも PRE-3・PRE-6・PRE-4 のそれぞれ1項目だけが fail になることを表明した。最終ソースで再展開し、導入済み依存を使って4様式の validate/pre・3不合格・MV を再確認し、全結果が表と一致した。最終動画・音声・事後レビューのない mixed フィクスチャに `npm run qc -- --stage=post` を実行し、`QC post: fail`・exit 1（期待結果）も確認した。

### MV 生成物差分（計画 §5.3）

一時ディレクトリに自分で作った基準 worktree（`955fa5c`、detached）で `npm ci` と従来の `tools/make-fixture.ts --mv` を実行。現行は `--mv --out=$FX/head` で生成し、`git diff --no-index --stat` と `cmp` で検査した。ネットワーク縮退なし。基準 worktree は完了後に削除し、既存の他 worktree は変更していない。

差分出力: 6 files changed, 454 insertions(+), 1 deletion(-)。対象は job-root package.json・runtime/package.json の qc 追加、caption-capacity.mjs・caption-capacity.d.mts・qc.mjs の新設、validate.mjs のみ。すべて計画の許容差分一覧内。

`cmp brief.md`: exit 0。`cmp project.json`: exit 0（T4 は schema_version を変えないため完全一致）。本比較ではソースや生成物全体をコンテキストへ読み込まず、diff/cmp の出力だけを確認した。

### 共通条件・引き渡し

- C-1・C-2: 上記の最終54件と指定 base ビルドが exit 0。
- C-3: `git diff --check 2a7d209`（最終作業ツリーを含む）・`git diff --cached --check 2a7d209` は出力なし。同内容のコミットに対する指定の `2a7d209...HEAD` 検査結果は最終メッセージにも記す。
- C-4: `git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts tests/job.test.ts` は exit 0。テスト側の変更なしで MV 5件・ghost 全件・imagegen 全件を含む全体テストが通る。
- C-5: 発注コミット以降の変更は対象10ファイルのみ。src・制作文書・テンプレート計画・既存 motion-kit/scenes・既存テスト・index・ルート package・要件/計画/他タスクは無変更。VERIFICATION は暫定係数の末尾追記のみ。
- C-6: 計画 §5.0 の2パターンを最終 staged 差分に対して Git Bash で実行し、両方一致なし（grep exit 1）を確認。帰属行はコミットメッセージのみに付ける。
- C-7: 冒頭のとおり。自分で作った検証フィクスチャの validate/qc/diff/cmp の出力のみ確認した。
- C-8: 計画を変更していないため対象外。
- 縮退レベル0のまま。ネットワーク検証の縮退なし。実動画の still による EX-17 実測確定は未了で、T11 または G4-α に残す。
- G3 の合否は記入していない。実働 A の交差レビュー待ち。push・main マージなし。

変更ファイル: `caption-capacity.mjs`・`caption-capacity.d.mts`・`qc.mjs`・`validate.mjs`（runtime/scripts）、job-template と runtime の package.json、`tests/qc.test.ts`、`tools/make-fixture.ts`、`VERIFICATION.md`、本 REPORT。
