# REPORT — T8b 文書の同期（第2波）

- 作業ID: `2026-11-13-explainer-ui-harness`
- ブランチ: `task/T8b-docs`（`<BASE>` = `fb40029cea59cea83d1243d761bcc5647b788264`）。push していない
- 実装者: L3 実働 A（Claude Code、Opus 5.5、非対話セッション）
- **合否判定はしていない**。以下の自己実行は証拠の提示である（G3 は L2 が検証コマンドを再実行して行う）

## 1. 着手条件と起動時チェック（計画書 §8.1）

- 着手条件：DIRECTION の「発注時確定」に `<BASE>` の実ハッシュと T7 の G3 合格（`review/T7-ui-full` の `1fa4f8d`、PASS）がある。`1fa4f8d` の `tasks/T7/G3-REVIEW.md` を `git show` で読み、判定が PASS・差し戻しなしであることを確かめた。worktree は `BiimMakerWebUI-wt/T8b`、ブランチは `task/T8b-docs`、先端は L2 の発注コミット `ce6269b`（`<BASE>` の次）で、`<BASE>` が祖先であることを `git merge-base --is-ancestor` で確かめてから始めた

| 項目 | 結果 |
| --- | --- |
| 層 | L3 実働 A（DIRECTION の指定） |
| エージェント製品・モデル・effort | Claude Code 2.1.319、`claude-opus-5-5`、effort medium（DIRECTION の指定。effort の実値は実行環境から読めないため指定値を記録） |
| サブエージェント | 使用可。**使っていない**（文書の確認・執筆・検証はすべて自分で行った） |
| コマンド実行 | 可（Git Bash、Node v24.15.0）。worktree に `node_modules` が無かったので `npm ci` を実行（終了0） |
| 対話 | 不可（非対話セッション）。判断は §7 に非ブロッキングで記録 |
| ネットワーク | 可（`npm ci` と `git ls-remote origin main` が成功） |
| ヘッドレス Chrome | インストールあり（Google Chrome 157.0.8103.40）。本タスクでは撮影・操作をしていないので起動はしていない |

**縮退レベル: 0（標準）**。理由：コマンド実行・ネットワークが使え、G3 は別コンテキスト（L2）で行う。自己判定になるゲート：なし。共有の `ENVIRONMENT.md` は編集していない（起動時チェック行は L2 が統合時に集約する）。

## 2. DESIGN.md の確定内容

`docs/DESIGN.md` を草稿から確定版にした。構成は DIRECTION の指定どおり（採用宣言と正本参照／取り込んだトークンと所在／BiimMotion 固有の差分（Biim 枠モチーフの適用範囲、字幕様式、4領域の寸法）／禁止リスト／名称文字列の所在一覧（最新））。正本は repo 相対（CyberSprite の `gui/src/theme/tokens.css`）で書き、ローカルの絶対パスは書いていない。記述は `src/style.css`・`src/App.tsx`・`index.html`・`public/icons/` を読んで確かめた。

### 2.1 Q-T7-3 の7群の扱い

| 群 | 草稿の記述 | 実装（確かめた箇所） | 確定版 |
| --- | --- | --- | --- |
| 1 §2 アイコン表 | 4点、「このスタジオについて」 | `public/icons/` に10点。`App.tsx` の `PixelIcon` の使用箇所（info 551、remove 145、folder 783 ほか、sources 841、add 1022・1084、settings 1634、validate-ok／warning 2106、error 2128、agent 2166）。アプリバーのボタンは「BiimMotion について」（552） | §2.1 を10点の表にし、追加したタスクと使う場所を書いた |
| 2 §4.1 右上の寸法・650px 以下 | 右上は最大55%。目次は「上端に固定」のみ。右下に「Opus への指示文」 | `style.css:288` `grid-template-rows: 46% …`。650px 以下の `.toc-bar { position: static }`（1414 付近）。タブと tabpanel を隠す（1438 付近）。右下の見出しは「制作エージェントへの指示」（`App.tsx:1978`） | 46% 固定に直した。650px 以下で目次を固定しない例外を追記。プレビューのタブ／図を隠す記述は実装と一致するので残し、隠すのはタブと tabpanel（指示文・失敗パターン・ゴースト結果は残る）と明記。「Opus への指示文」→「制作エージェントへの指示」 |
| 3 §4.2 字幕書体 | フォント候補だけ | `style.css:93` の `--font-caption` は先頭が `"BiimMotion Caption"`。`style.css:107〜113` の `@font-face`（`local()` → 同梱 TTF、`font-weight: 800`、`font-display: swap`） | `--font-caption` の実際の候補順と、`@font-face`・`swap`・読み込み先を追記 |
| 4 §4.3 極小文字 | 「図の一部、T7 で確定」 | `App.tsx` に `<text` 要素も `SCENE`・`POINT` も無い（grep）。図は `schematic-title` などの span（1838 付近） | 「レイアウト図の中に文字を置かない。飾り文字は T7 で廃止し図形に置き換えた」に直した |
| 5 §4.4 #6 | `BiimMaker…`、未変更 | `App.tsx:2191` は `BiimMotion は、…` | T7 で変更済みに直した（§3 の表） |
| 6 §5 favicon | （草稿の §5 に favicon の記述は無い。Q-T7-3 の所在指定の誤り） | `index.html` の `link rel="icon"`。データ URI の SVG、`viewBox 0 0 16 16`、`crispEdges`、`fill` は `#0B2A3A`・`#BFEFF9`・`#19C3E6`・`#FFFFFF` の4色（URI を読んで確かめた） | 新設の §4.5 favicon にデータ URI・様式・4色パレット・Biim の黒／灰の置き換えを記載。§5 の禁止リストには「favicon の4色は `index.html` の直値の例外」を足しただけで、favicon の規則は置いていない |
| 7 §7 持ち越し | 5項目を T7 へ持ち越し | T7 の REPORT・UI-V7-CHECK・G3 | 「草稿からの決着（T7 で完了したもの）」の表に置き換えた。失敗パターン／ゴーストは「3タブの下に並べる」で決着と書き、タブ化を未完の必須条件にしていない |

### 2.2 7群のほかに実装に合わせて直した箇所

| 箇所 | 草稿 | 実装 | 確定版 |
| --- | --- | --- | --- |
| §4.1 920px 以下のアプリバー | （記述なし。表で「上端に固定」） | `@media (max-width: 920px)` の `.app-bar { position: static }`、`.toc-bar { top: 0 }` | 921px 以上でだけ固定、920px 以下では固定をやめ目次が上端に固定、と明記 |
| §4.1 字幕帯の伸長 | （記述なし） | `.subtitle-band:has(.errors)`（`style.css:1244`、最大 50vh） | エラー表示中だけ伸びることを追記 |
| §4.1 右上ノート・右下ノート・アプリバーの中身 | 「データの扱いの一言」等の概略 | `App.tsx` 536〜556・1723〜2060 | 実際の見出し（「ジョブの要点」「補足」「書き出し」）と項目に合わせた |
| §3 ボタンの枠・フォーカス | 「左上が明るく」「内側に描く」 | `border-color: var(--cs-pad) var(--ui-pad-line) …`、パッドの `outline-offset: -5px`、入力欄 `0`、その他 `1px` | 実際の値で書き直した。文字リンクの見た目のボタン（`text-button`）を追記 |
| §4 固有の変数 | `--bar-h` 等を本文中に散在 | 2つ目の `:root` に `--bm-fs-h2`・`--bm-fs-h3`・`--field-h` もある | 変数の一覧表を §4 冒頭に置いた |
| §4.3 文字サイズ | 本文 14px・補助 12px だけ | 見出し・ブランド・字幕様式に 15〜22px の px 指定（`style.css` の `font-size` を grep） | px だけ・12px 未満なし・em／rem なしと、見出し等の範囲を追記 |
| §5 禁止リスト | — | T7 で SVG の色の直値を廃止、制作者の呼称を「制作エージェント」に統一、`transition`・`animation` なし | SVG の `fill`・`stroke` の直値、モデル名での呼称、動き、12px 未満・em／rem を禁止リストに足した（いずれも実装がすでに満たしている規則の明文化） |
| §6 接続点 | id の列挙だけ | `html { scroll-padding-top: calc(var(--bar-h) + 52px) }`（650px 以下は 8px）、T7 の `5f46d28` | 現在地判定と合わせた移動先の上端 96px を追記 |

実装側は変えていない（本タスクは文書だけ）。

## 3. 名称統一の確認結果（UI-10）

| # | 所在（T8b 時点） | 状態 |
| --- | --- | --- |
| 1 | `index.html:11` `<title>BiimMotion</title>` | `BiimMotion` |
| 2 | `src/App.tsx:539` `aria-label="BiimMotion トップ"` | `BiimMotion` |
| 3 | `src/App.tsx:540` ブランド表示 | `BiimMotion` |
| 4 | `src/App.tsx:554` `BiimMotion · v0.1` | `BiimMotion` |
| 5 | `src/App.tsx:1711` フッター | `BiimMotion` |
| 6 | `src/App.tsx:2191` 情報ダイアログの本文 | `BiimMotion は、…`（T7 で変更済み） |
| 7 | `src/style.css` の `content` | `content:` の指定自体が無い（`grep -n "content:" src/style.css` の一致は `justify-content` だけ） |
| 8 | `README.md:1` | **本タスクで `# BiimMakerWebUI` → `# BiimMotion` に変更** |

- 不在の検証：`grep -rn "BiimMaker\|MOTION JOB STUDIO\|IDEAS DESERVE MOTION" index.html src README.md` は**変更前に `README.md:1:# BiimMakerWebUI` の1件、変更後に0件**。
- `src/`・`index.html` に旧表示文字列の残りは無かった。**L2 への申告事項はない**。
- T7 で増えた表示箇所（`App.tsx:552` のアプリバーのボタン、`App.tsx:2180` のダイアログ見出し「BiimMotion について」）も一覧に足した。

## 4. README.md の変更

- 見出しを `# BiimMotion` にし、冒頭に「表示名は BiimMotion、repo 名・Pages の URL・base パスは識別子として BiimMotionWebUI のまま」の1文を足した。冒頭の「Opus 5.5などの…エージェント」を「制作エージェント（Opus 5.5など）」に、図の「Motion Job ZIP」を「ジョブのZIP」に（UI の呼称に合わせた）。
- 新設の「画面の構成」節：ファミリーテーマの採用、Biim 枠はプレビュー部分だけ、4領域とアプリバーの中身（表）、920px／650px の挙動。規則の正本は `docs/DESIGN.md` へのリンクにして、規則は複製していない。
- MV・解説の入力支援の「右側の書き出しカード」「『指示をコピー』の下」を、刷新後の所在（右上ノート「ジョブの要点」、右下ノート「補足」の指示の下）に直した。制作手順の「UIの『指示をコピー』」を字幕帯のボタン名に合わせた。
- 制作原則の本文は触っていない（既存のリンク方式のまま）。識別子（`--base=/BiimMotionWebUI/`、repo 名、Pages の URL）はそのまま。

## 5. VERIFICATION.md への追記

節「2026-11-14 第2波 UI 刷新の検証結果（T6・T7、T8b で集約）」を末尾に追加した。

- テスト件数とビルド：T6・T7（実装者と G3 の再実行）と T8b の結果。いずれも 72 pass / 0 fail、ビルド成功
- UI-C1〜C5：T7 の実装者と G3（R1）の再実行の結果
- UI-V1〜V7：**合否は書かず**、G4-β の判定に使う証拠（画像・UI-V7-CHECK の節・数値）の所在と記録された内容を表にした
- 記録の限定：**N2**（S3 の歌詞統計は画角外。全統計が写った証拠とは読めない。統計機能は UI-V7 の `A5-lyrics` で確認済みで機能欠落ではない。G4-β へ引き継ぐ）。S3 は自分でも開いて、歌詞欄の統計が写っていないこと（右上ノートの「歌詞 6行」だけ）を確かめた。ほかに N1（操作スクリプトの変動）、Q-T7-2（字幕色のコントラスト）
- スクリーンショットの所在：CP-A0 `screenshots/before/`（8枚）、CP-W1 `screenshots/wave1/`（8枚）、CP-A1 `screenshots/cp-a1/`（2枚）、CP-A2 `screenshots/after/`（9枚）。各フォルダの枚数は `ls` で確かめた。**CP-A2 は Pages 用ビルド（base `/BiimMotionWebUI/` 付き）に対して撮った**ことと、その裏付け（T7 REPORT §4 の手順、G3 のスクリプト読解。PNG 自体には由来の情報が無いこと）を書いた
- MV 非退行：C-4 の2つのコマンドの結果、T7 G3 の操作属性 130件の一致
- 名称の統一：不在の grep が0件
- **公開後確認①：未実施**と、その理由（GitHub の認証ブロッカー、`reviews/G4-alpha.md` の申し送り6）。`git ls-remote origin main` でリモートの main が `955fa5c` のままであることを 2026-11-14 に確かめた。T8b はこれを待たない

画像は S1・S3・S7 を自分で開いて、DESIGN と VERIFICATION に書いた見え方（4領域、アプリバーの文言、390px で作業名等が隠れること、S3 の画角）を確かめた。数値（座標・件数・比）は UI-V7-CHECK と G3-REVIEW から写し、両者が一致していることを読み合わせた。

## 6. C-1〜C-8 の結果

本タスクのコミット `Finalize DESIGN.md and record UI verification` の内容に対して実行した結果（C-3・C-5・C-6 はコミット前に同じ内容をステージして `git diff --cached` で実行し、コミット後に `fb40029...HEAD` で再実行して同じ結果を確かめた）。

| 条件 | 結果 |
| --- | --- |
| C-1 `npm test` | 合格（tests 72、pass 72、fail 0） |
| C-2 `MSYS_NO_PATHCONV=1 npm run build -- --base=/BiimMotionWebUI/` | 合格（500kB 超のチャンクの警告のみ、従来から） |
| C-3 `git diff --check fb40029…HEAD` | 出力なし |
| C-4 MV 非退行 | `git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts` は差分なし。`git diff -U0 955fa5c -- tests/job.test.ts \| grep '^-[^-]'` は `-    12,` の1行（T5b の既知差分。本タスクは `tests/` を変えていない） |
| C-5 触らない範囲 | `git diff --stat fb40029…HEAD` のファイルは `README.md`、`VERIFICATION.md`、`docs/DESIGN.md`、`tasks/T8b/DIRECTION.md`（L2 の発注コミット `ce6269b` の差分）、`tasks/T8b/REPORT.md` だけ。`src/`・`index.html`・`tools/`・`job-template/`・`tests/`・`package.json` は無い |
| C-6 絶対パス・メール・認証情報 | 計画書 §5.0 の2つの grep を `git diff fb40029…HEAD` に実行し、どちらも出力なし（L2 の DIRECTION の差分を含めて一致0件）。帰属行はコミットメッセージにだけ書いた |
| C-7 読まないもの | `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の中身は読んでいない（`npm ci` とビルドで生成・利用しただけ） |
| C-8 計画の写し | `cmp docs/work/2026-11-13-explainer-ui-harness/PLAN.md docs/requirements/ORCHESTRATION_PLAN.md` は一致。両ファイルとも本タスクの差分なし |

### 変更ファイル

- `docs/DESIGN.md`（確定版に書き直し）
- `README.md`（見出し、冒頭、「画面の構成」節の新設、入力支援の所在、制作手順の操作名）
- `VERIFICATION.md`（第2波の節を追記）
- `docs/work/2026-11-13-explainer-ui-harness/tasks/T8b/REPORT.md`（本書）

## 7. 判断したこと・質問（非ブロッキング）

1. **favicon の節を §4.5 に置いた**：Q-T7-3 の「§5 favicon」は所在の誤りで、草稿の §5（禁止リスト）に favicon の記述は無い。favicon は BiimMotion 固有の差分なので §4 の下に置き、§5 には直値の例外としてだけ書いた。既存の §4.4（名称の所在一覧）の番号は、DIRECTION・計画書・REPORT からの参照を壊さないよう変えていない。
2. **禁止リストに実装済みの規則を足した**（SVG の色の直値、モデル名での呼称、動き、12px 未満・em／rem）。どれも T7 が満たし G3 が確かめた規則で、新しい制約を実装に課すものではない。DESIGN を「実装に合わせて確定する」範囲の明文化と判断した。
3. **VERIFICATION には UI-V1〜V7 の合否を書かなかった**：計画書 §1.1 で UI-V1〜V7 の判定は G4-β の非実装者の役割なので、証拠の所在と記録内容だけを書いた。
4. **README の冒頭の「Opus 5.5など」を残した**：利用者に使えるエージェントの例を示す情報なので、UI の呼称「制作エージェント」を主にして括弧の例として残した。UI-C1 の検査対象（`src/App.tsx`・`index.html`）ではない。
5. **公開①の追記先**：VERIFICATION には「公開①が実施されたら締めの PR か、その前の記録コミットで追記する」と書いた。どの PR に入れるかは L2 の判断で変えてよい。
6. 質問 Q-T8b-1：DESIGN §4.4 の行番号は T8b 時点の実測で、今後ずれる。G3 の対応表で行番号を使うときは文字列で探し直してほしい。
