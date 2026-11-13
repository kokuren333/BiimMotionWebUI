# REPORT — T8a 文書の同期（第1波）

- 作業ID：`2026-11-13-explainer-ui-harness`／タスク T8a／ブランチ `task/T8a-docs`（切り替えなし、push なし）
- 書いた者：L3 実働 A（Claude Code、`claude-opus-5-5`、effort medium、非対話セッション）
- 成果物コミット：`Document explainer mode and record verification`（README.md・VERIFICATION.md・本 REPORT を1コミット）
- **合否判定はしていない。** 以下は証拠の記録であり、G3 は L2 が検証コマンドを再実行して行う。

## 0. 起動時チェック（計画書 §8.1）

| 項目 | 結果 |
| --- | --- |
| 層 | L3 実働 A（DIRECTION.md の記載どおり） |
| エージェント製品・モデル・effort | Claude Code、`claude-opus-5-5`、effort medium |
| サブエージェント | Agent ツールは提示されていた。本タスクでは起動していない（L4 下請けなし。文書タスクで分割の利得が小さいため） |
| コマンド実行 | 可（`node -v` = v24.15.0、`npm -v` = 11.12.1、`git version 2.54.0.windows.1`、Git Bash） |
| 対話 | 不可（非対話セッション） |
| ネットワーク | 可（`node_modules/` が無かったため `npm ci` を実行し、終了コード0。audit の通知のみ） |
| ヘッドレス Chrome・Aivis・GPU | 本タスクでは不要。未確認 |

**縮退レベル：0（標準）。** 理由：コマンド実行・ネットワークとも可、G3 は L2 が別コンテキストで行う。自己判定になるゲート：なし。本セッションでは自分の成果物を合格と判定していない。`ENVIRONMENT.md` には追記していない（L2 が統合時に集約）。

## 1. 変更したファイル

| ファイル | 内容 |
| --- | --- |
| `README.md` | `## MVモード` 節の直後に `## 解説モード` 節（小見出し6つ）を追加。ほかに、生成ジョブのファイル一覧の motion-kit 数（12 → 15、非 Biim 部品を含む旨）、生成ジョブのコマンド一覧に `npm run qc -- --stage=pre`、「開発・検証」に `make-fixture.ts` の `--style`・`--qc`・`--out` と解説モードのテスト範囲の1文を追加 |
| `VERIFICATION.md` | 末尾に `## 2026-11-14 解説モード 第1波の検証結果（T3・T4・T5・T5b、T8a で集約）` を追加。既存の節（2026-10-06、2026-11-09 など）の本文は無変更 |
| `docs/work/2026-11-13-explainer-ui-harness/tasks/T8a/REPORT.md` | 本書 |

MV 節（`## MVモード` から `### MVの入力支援` の末尾まで）の本文は変えていない。`git diff -U0 -- README.md` の削除行は、ファイル一覧の motion-kit の1行と「開発・検証」の段落1行（文を末尾に追加したため）の2行だけで、どちらも MV 節の外。

## 2. README の MV 節と解説節の小見出しの対応表

| MV 節（README、無変更） | 解説節（README、新設） | 内容の対応 |
| --- | --- | --- |
| `## MVモード`（導入：選び方・入力範囲・生成ジョブが参照するキー・記録の流れ） | `## 解説モード`（導入：既定モード・入力範囲・必須3項目・**手順の正本ではない旨とリンク**・参照キー・`plan/outline.txt`・工程の流れ） | 同粒度 |
| `### MVの制作原則（思想先的設計）` | `### 解説の制作原則（理解先的設計）` | 7原則を「何を扱う原則か」だけ1行ずつ。本文は AGENTS.md へのリンク。禁止・固定しない旨と2つの例外 |
| `### 似た作品ばかりにしない仕組み` | `### 似た作品ばかりにしない仕組み（解説）` | 6軸（解説用）、3案の規則、WebUI のたたき台（様式モードを同格）、差別化メモ |
| `### MVの入力支援` | `### 解説の入力支援` | 01 の新入力と統計、右カラムの準備度と注意、失敗パターン23項目 |
| （MV 節には独立した小見出しなし。様式は「Biim枠は使わず画面全体」の1文） | `### 様式モード` | 4モード（biim／anime／motion／mixed）、`biim` は既定であって必須ではない、様式切り替えの挙動、縦の制約、mixed の書き方、Biim 固有検査の適用範囲、非 Biim 部品 |
| （MV 節には独立した小見出しなし。MV に QC の規則は無い：EX-19） | `### 解説のQC（事前・事後ゲート）` | `npm run qc -- --stage=pre|post`、ゲートと助言の線引き、レビュー行と `review_mode`、免除、字幕帯域、MV での挙動 |
| （MV 節の導入の最終段落が記録ファイル（`plan/lyrics.txt`・`plan/music-analysis.md`・`plan/direction.md`）を説明） | `### 解説の記録ファイル` | 記録ファイルの表、`validate --final` の必須記録、`plan/templates/` のひな形 |

MV 節の4つの見出し（導入＋小見出し3つ）はすべて解説節に対応する見出しがある。解説節に追加した3つ（様式モード・QC・記録ファイル）は、DIRECTION／計画書 §5.1 T8a が求める内容（様式モード、QC コマンドとゲートの意味、記録ファイル）で、MV 側には対応する仕組みが無いか導入段落で済んでいるもの。欠けの最終確認は計画書どおりレビュー者が行う。

## 3. 制作原則の本文を複製していないことの確認

確認方法：OS の一時フォルダに置いた Node スクリプト（リポジトリには置いていない）で、Markdown の強調・コード記号・箇条書きの記号と空白を除いてから `。` で文に分け、README の文の並びのうち AGENTS.md の文と完全一致するものの最長連続数を数えた。比較対象は、解説章を含む T3 の `job-template/AGENTS.md`（`git -C ../T3 show 759be8d:job-template/AGENTS.md`。G4-α で入る版）と、本ブランチの現行 `job-template/AGENTS.md` の2つ。

| 比較 | 一致した文 | 最長連続 |
| --- | --- | --- |
| README（変更後） vs T3 の AGENTS.md | 5（すべて表の区切り行 `|---|---|` で、文ではない） | 1 |
| README（変更後） vs 現行の AGENTS.md | 0 | 0 |

さらに厳しい確認として、README に追加した行の文（15文字以上、表の行を除く76文）が T3 の AGENTS.md の本文に部分文字列として含まれるかも調べた：**0件**。

**結論（事実の記録）：`job-template/AGENTS.md` の原則の文は README に3文以上連続で複製されていない（1文も文単位では一致していない）。** 原則の節は、各原則が何を扱うかを独自の1行で示し、本文と例は AGENTS.md へのリンクに任せている。

## 4. VERIFICATION.md への追記内容の要約

すべて各タスクの REPORT.md と G3 記録を自分で読んで確認した値（読むだけ。他 worktree は変更していない）。

- **test 件数**：T3 36（REPORT §4、T3 G3-REVIEW）、T4 54（REPORT T4-4、T4-review §3）、T5 49（REPORT T5-3、T5-review §2）、T5b 72（REPORT 検証結果、T5b G3-REVIEW）。各作業ブランチの件数であり、統合後の件数ではないと明記した。
- **qc の合否事例**：4様式（biim／anime／motion／mixed）の pass で `validate` exit 0・`qc --stage=pre` exit 0。3不合格例（fail-evidence／fail-caption／fail-review）が exit 1 で、それぞれ PRE-3／PRE-6／PRE-4 の1件だけが fail（T4-review §3 の出力文言を引用）。MV は `qc` exit 0、`reports/qc-pre.json` なし。T5b の非 Biim 部品だけのシーンでの validate・qc pre 合格も記載。
- **MV 非退行**：C-4 の2コマンドと結果（T5b の許容1行のみ）、T4 の `--mv` 生成物の比較（許容6ファイル、`brief.md`・`project.json` は `cmp` 一致）、T5 の MV 依頼文・brief のバイト一致と SHA-256（T5 REPORT の値。T5-review が同じ値を確認）、MV の qc の挙動。
- **CP-W1 の所在**：予定の所在 `docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1/` を書き、**T5-4 が未完了のため撮影結果・所在は未確認で、T5-4 の完了後に追記する**と明記した（§6）。
- **G3 の結果**：T3 PASS（`759be8d`）、T4 PASS（T4-review `6b9d34f`）、T5 PASS（T5-review `0c78d81`。T5-review の worktree の HEAD コミット件名 `Add G3 cross-review for T5 (PASS)` で確認）、T5b PASS（`daece82`）。
- **持ち越し**：C-3 の末尾空行（`tests/qc.test.ts:47`、T4-1 由来、G4-α で修正）、EX-17 係数は暫定（T11／G4-α で実測確定）、T4-review の m1〜m4 と T5-review の N1〜N3 は下流を妨げない、CP-W1 は T5-4 後に追記、完成動画の制作は T11。

## 5. EX-17 節の扱い

EX-17 字幕帯域係数の節（`## 2026-11-13 EX-17 字幕帯域係数（暫定、T4-1）`）は T4-1（`15b42a7`）が T4 のブランチ（`task/T4-qc`）の `VERIFICATION.md` に追加したもので、G4-α の統合で T4 のブランチが波のブランチに入るときに一緒に入る。T8a ではこの節を複写・書き換えしていない（読むだけ）。T8a の節からは「T4-1 が係数を記録した節を参照」とだけ書いた。

**G4-α での注意**：T4-1 の節も T8a の節も `VERIFICATION.md` の末尾への追記なので、両ブランチを統合するとき、同じ位置への追加として Git の競合になる可能性が高い。内容は独立しているので、両方の節を残す（EX-17 節 → T8a の節の順、日付順）形で解決できる。

## 6. T5-4 が未完了だった場合の対応

作業開始時に `../BiimMakerWebUI-wt/T5-4/docs/work/2026-11-13-explainer-ui-harness/tasks/T5-4/REPORT.md` を読んだ時点で、記録は起動時チェックだけで「取り込み・撮影・検証」は未記入、T5-4 の worktree の HEAD は取り込み途中のコミット（`5c573f6`）だった。撮影結果の記録・コミットが無いので **T5-4 は未完了と判断した**（作業ツリーにファイルがあることは見えたが、未コミット・未報告のものを証拠として扱わなかった）。

DIRECTION の指示どおり待たずに進め、VERIFICATION.md には予定の所在と「T5-4 の完了後に追記する」旨だけを書いた。**CP-W1 の所在・枚数（8）・S6 の motion-kit 数15の確認結果は、T5-4 の完了後に追記が必要**（T8a の追補、または G4-α で L2 が記録）。

## 7. 判断したこと・質問（非ブロッキング。既定の判断で進めた）

- **README 見出しの表示名**：Amendment 02 で `BiimMotion` は確定だが、README の `# BiimMakerWebUI` 見出しの置換は計画書上 T8b（UI-10）の範囲なので変えていない。追加した文には製品の表示名を書いていない。repo 名・Pages URL・`--base=/BiimMotionWebUI/` は識別子なので変えていない。
- **motion-kit 数の README 表記を 15 にした**：T5b（EX-34）は root README を変えていないため、G4-α 後に README だけが12のまま残る。T8a は第1波の状態を記述する文書タスクなので15に合わせた。**本ブランチ単体の `job-template/motion-kit/` はまだ12個**で、15になるのは T5b が入る G4-α の後。
- **「開発・検証」とコマンド一覧への追記**：解説の QC を README から使えるようにするため、MV 節の外の2箇所に1行ずつ追加した（MV 節の本文は不変）。
- **VERIFICATION.md の言語**：既存の節は英語だが、T4-1 の EX-17 節と第1波の記録は日本語なので日本語で書いた。
- 「手順の正本ではない」旨は解説節の導入に書いた。MV 節にも同じ性質があるが、MV 節の本文は変えない指示のため書き足していない（解説節の文は「この節は」と自節について述べる）。

## 8. 完了条件の証拠（コミット前に実行。コミット後の再実行結果は最終メッセージに記す）

| 条件 | 結果 |
| --- | --- |
| C-1 `npm test` | `tests 29 / pass 29 / fail 0`（本ブランチは第1波の他タスクを取り込んでいないので既存29件。テスト変更なし） |
| C-2 `npm run build -- --base=/BiimMotionWebUI/` | Git Bash で `MSYS2_ARG_CONV_EXCL='*'` を付けて実行。`vite build --base=/BiimMotionWebUI/`、85 modules、`✓ built in 4.03s`、exit 0 |
| C-3 `git diff --check` | 作業ツリーで出力なし（基準付きはコミット後に再実行） |
| C-4 | `tests/` を変更していない（コミット後に指定コマンドを再実行） |
| C-5 | 変更は `README.md`・`VERIFICATION.md`・`tasks/T8a/REPORT.md` のみ（コミット後に `git diff --stat 2a7d209...HEAD` で確認） |
| C-6 | コミット後に計画書 §5.0 の2つの grep を実行 |
| C-7 | `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の中身は読んでいない（`npm ci`・`npm test`・`npm run build` がそれらを生成・使用しただけ） |
| C-8 | 計画は変更していない（対象外） |
