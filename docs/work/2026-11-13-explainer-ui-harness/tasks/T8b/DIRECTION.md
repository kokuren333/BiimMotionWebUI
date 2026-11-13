# DIRECTION — T8b 文書の同期（第2波）

- 作業ID: `2026-11-13-explainer-ui-harness`
- あなたは **L3 実働 A（Opus 5.5、effort medium、非対話セッション）**です。文書の同期が仕事です。レビュー（G3）は L2 が検証コマンドを再実行して行うため、**自分で自分の成果物を合格と判定してはいけません**。
- サブエージェントの使用は可（L4 下請け）。使う場合は REPORT.md に記録すること。
- 表示名は **`BiimMotion` 確定**です（Amendment 02、オーナー決定 2026-11-13 20:36）。暫定扱いにしないこと。repo 名・Pages URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物で変えません。

## 発注時確定（2026-11-14 03:35 JST、L2 発注）

- **`<BASE>` = `fb40029cea59cea83d1243d761bcc5647b788264`**（第2波ブランチ `feat/ui-biim-frame` の T7 取り込み後の先端。T7 `task/T7-ui-full` 先端 `387b6b8` をマージコミットで取り込み済み）。検証コマンドの `git diff <BASE>...HEAD` にはこの値を使うこと。本書に実ハッシュの追記があるので、着手条件は満たされている。
- **T7 の G3 合格は確定**（交差レビュー Codex、review/T7-ui-full `1fa4f8d`、差し戻しなし。L2 最終判定も PASS。L2 再実行で npm test 72/72、Pages ビルド成功、diff --check 空）。
- **Q-T7-3（DESIGN.md 草稿の更新）— T8b への申し送り。次の 7 群すべてを更新すること**：
  1. §2 アイコン表（実際は 10 点。「このスタジオについて」も旧名）
  2. §4.1 右上寸法・650px 以下（CSS は 46% 固定。目次「上端に固定」に 650px 以下の例外がない。プレビューのタブ／図を 650px 以下で隠す記述は今も実装と一致。右下ノートの「Opus への指示文」も制作エージェントへ同期する）
  3. §4.2 字幕書体（BiimMotion Caption の @font-face・swap を追記）
  4. §4.3 極小文字（文字を廃止して図形へ置換済み）
  5. §4.4 #6（BiimMotion へ変更済み）
  6. **§5 favicon（§5 には favicon の記述自体がない。誤った所在指定は修正または削除し、favicon のデータ URI と 4 色パレットを確定版の適切な節へ記載）**
  7. §7 持ち越し（文言・Icon・favicon・フォント・操作確認は消化済み。失敗パターン／ghost をタブ化するかは「3 タブの下へ並べる」で決着。完了結果へ同期し、タブ化を未完の必須条件に変えない）
- **N2 の限定（G4-β への引き継ぎ）**：S3 の歌詞統計は画角外。「歌詞統計が見える」を全統計が写った証拠とは読めない。統計機能自体は UI-V7 の操作結果で確認済みで機能欠落ではない。この限定を VERIFICATION.md への追記に含め、G4-β で記録の十分性を判断する際に引き継ぐこと。
- **表示名の扱いの再確認**：`README.md` の見出しだけを本タスクで直す。`src/`・`index.html` に旧表示文字列が残っていた場合は直さず、所在を REPORT.md に書いて L2 へ申告すること（下記「内容 2.」のとおり）。

## 前提（着手条件）

- **T7 の G3 合格が前提**です（交差レビューを含む）。T7 が合格していない状態で本書を渡された場合は、作業を始めず REPORT.md にその旨を書いて止まること。
- 本書は T6 の発注と同時に下書きとして作られたものです。**作業ブランチ `task/T8b-docs` と worktree は発注時に L2 が作ります**。渡された時点で自分の worktree とブランチを確認し、合っていなければ止めて報告すること。

## 最初に読むもの（この順で）

1. `docs/requirements/2026-11-13-amendment-01.md`（最優先。AM-1 目視ゲート廃止、AM-2 様式自由度）
2. `docs/requirements/2026-11-13-amendment-02.md`（表示名 `BiimMotion` 確定。名称統一の対象と、変えない識別子）
3. **`docs/requirements/2026-11-14-amendment-03.md`（ファミリーテーマ統一と Pages 補足。CP-A2 は Pages 用ビルドに対して撮られた記録であること）**
4. `docs/requirements/2026-11-13-explainer-ui-harness.md`（要件書。EX-31、HN-01、UI-10）
5. `docs/requirements/ORCHESTRATION_PLAN.md`（計画書。§5.1 T8b がこのタスク票の正本。§5.0 共通条件、§5.4 コミットの切り方、§6.3 Pages 確認も読むこと）
6. **`docs/DESIGN.md`（T6 の草稿。自分の worktree 内。確定の対象）**、T6 の REPORT.md と T7 の REPORT.md・UI-V7-CHECK.md（`docs/work/2026-11-13-explainer-ui-harness/tasks/T6/REPORT.md`、`tasks/T7/REPORT.md`、`tasks/T7/UI-V7-CHECK.md`）。数値や結果を写すときは、自分の目で証拠を確認してから書くこと。推測で補ってはならない
7. 現行のルート `README.md` とルート `VERIFICATION.md`（自分の worktree 内。変更対象の原本）

## 作業ブランチと基準コミット

- あなたの repo ルートは、この DIRECTION.md がある worktree です。ブランチは `task/T8b-docs` で、第2波ブランチ `feat/ui-biim-frame`（T7 取り込み後）から分岐済みのはずです。**ブランチを切り替えないこと**。
- `<BASE>` は発注時に L2 が確定します（T7 取り込み後の第2波ブランチの先端）。**確定済み：上記「発注時確定」の値を参照**。本書に実ハッシュの追記が無い場合は、作業を始めず REPORT.md に書いて止まること。検証コマンドの `git diff <BASE>...HEAD` にはその値を使うこと。
- コミットは計画書 §5.4 の流儀で、件名は `Finalize DESIGN.md and record UI verification`（英語・命令形）。各コミットで C-1・C-2 が通ること。コミットメッセージの末尾に規定の帰属行を付けること（書式は過去のコミットの末尾を参照。ファイルには書かない）。
- **push はしないこと**。main へのマージ・直接 push・強制 push は禁止。スペース版（S0〜S5）には触れないこと。

## 起動時チェック（計画書 §8.1）

最初に §8.1 の起動時チェックを行い、結果を自分の REPORT.md（後述）に記録すること（層、エージェント製品・モデル・effort、サブエージェントの可否、コマンド実行、対話、ネットワーク、ヘッドレス Chrome）。縮退レベルを決め、理由と自己判定になるゲート（なしのはず）を REPORT.md に書いてから作業に入ること。**共有の `ENVIRONMENT.md` は同時編集しない**（起動時チェック行は L2 が統合時に集約する）。

## 対象

- `docs/DESIGN.md`（確定）
- `README.md`（見出し・UI の説明）
- `VERIFICATION.md`（UI の検証結果、UI-C・UI-V の結果、スクリーンショットの所在）

### 触らない範囲

- `src/` の全部、`index.html`、`tools/`、`job-template/`、`tests/`、`package.json`
- 名称文字列が `src/` や `index.html` に残っていた場合は、下記のとおり**直さずに L2 へ申告する**（本タスクの対象は文書だけ）

## 内容

1. **`docs/DESIGN.md` の確定**：T6 の草稿を、T7 完了後の実装の実態と一致させて確定する。構成は次を保つ：ファミリーテーマの採用宣言と正本参照（CyberSprite の `gui/src/theme/tokens.css`、repo 相対で書く。ローカル絶対パスは書かない）／取り込んだトークンの一覧と BiimMotion 側の所在／BiimMotion 固有の差分（Biim 枠モチーフの適用範囲＝ステージ／プレビュー領域、字幕帯の字幕様式、4領域の寸法）／禁止リスト／**名称文字列の所在一覧（最新）**。実装と食い違う記述があれば、実装に合わせて直す（実装を文書に合わせて変えるのではない。食い違いの内容は REPORT.md に記録する）。
2. **名称統一の最終確認（UI-10）**：名称文字列の所在8箇所がすべて `BiimMotion` になっていることを確認する。所在（計画書 §1.3。**行番号は 955fa5c 時点の実測で現在はずれている。文字列で探すこと**）：`index.html:11` の title、`src/App.tsx:526` の aria-label、`src/App.tsx:531` のブランド表示、`src/App.tsx:573` のバージョン表示、`src/App.tsx:2089` のフッター、`src/App.tsx:2124` の本文コピー、`src/style.css:1516` の `content`、`README.md:1` の見出し。
   - `README.md:1` の見出しは本タスクで `BiimMotion` に直す（README は本タスクの対象）。
   - それ以外の箇所は T6・T7 で変更済みのはずである。**残っていた場合は直さず、所在を REPORT.md に書いて L2 に申告すること**（対象ファイルの範囲を勝手に広げない）。
   - 合否は旧表示文字列の**不在**で判定する（下の検証コマンド）。`BiimMotion` は `BiimMotionWebUI` の部分文字列なので、`grep "BiimMotion"` での確認は不可。
3. **`README.md`**：見出しの表示名を `BiimMotion` にし、UI の説明を刷新後の実態（ファミリーテーマ、4領域の構成）に合わせる。制作原則の本文は複製しない（リンクのみ。T8a と同じ規則）。
4. **`VERIFICATION.md`**：第2波の検証結果を追記する。内容：UI-C1〜C5 と UI-V1〜V7 の結果（T7 の REPORT.md と UI-V7-CHECK.md の証拠に基づく）、スクリーンショットの所在（CP-A0 `screenshots/before/`、CP-A1 `screenshots/cp-a1/`、CP-A2 `screenshots/after/`。**CP-A2 は Pages 用ビルド（base パス付き）に対して撮られた記録である旨も書く**。Amendment 03 補足）、test 件数、MV 非退行の確認結果。
5. **公開後確認①の記録**：計画書 §5.4 では本タスクのコミットに公開後確認①の記録を含めることになっている。しかし GitHub 認証ブロッカーのため公開①（push・PR・Pages デプロイ）が未実施の場合は、**その旨（未実施であることと理由）を `VERIFICATION.md` に記録し、本タスクの完了を公開①待ちにしない**。公開①が実施済みの場合は、その結果（CI の状態、公開 URL での S1・S3・S7 の一致）を記録する。

## 完了条件

- `docs/DESIGN.md` の規則が実装と一致している
- 名称文字列の所在一覧が最新で、旧表示文字列の不在の検証（下記）が `README.md` の識別子（`--base=/BiimMotionWebUI/`、repo 名、Pages URL）を除いて0件
- `VERIFICATION.md` に CP-A0・CP-A1・CP-A2 の所在と、UI-C・UI-V の結果がある
- C-1〜C-6（下記）

## 検証

```sh
grep -rn "BiimMaker\|MOTION JOB STUDIO\|IDEAS DESERVE MOTION" index.html src README.md   # 0件であること（README.md の --base=/BiimMotionWebUI/、repo 名、Pages URL は識別子として残るため、この grep の対象文字列には含まれない）
```

- G3 ではレビュー者が、`docs/DESIGN.md` の規則ごとに `src/style.css`／`src/App.tsx` の該当箇所（行番号）を対応表にして REVIEW.md に書く（本セッションは判定しない）。
- C-1〜C-6（下記）。

## 全タスク共通の完了条件（計画書 §5.0）

- **C-1** `npm test` が合格。
- **C-2** `npm run build -- --base=/BiimMotionWebUI/` が合格。
- **C-3** `git diff --check <BASE>...HEAD` が空。
- **C-4 MV 非退行**：既存の MV 関連テスト（`tests/job.test.ts` の MV 5件、`tests/ghost.test.ts` 全件、`tests/imagegen.test.ts` 全件）がテスト側の変更なしで通る。確認コマンドは計画書 §5.0 の2つ。
- **C-5** 上の「触らない範囲」に変更が無い（`git diff --stat <BASE>...HEAD` のファイル一覧で確認）。
- **C-6** 追加した行にローカル絶対パス・メールアドレス・認証情報が無い。検査コマンドは計画書 §5.0 の2つの grep（本書には転記しない）。帰属行はコミットメッセージにだけ書き、ファイルには書かない。
- **C-7** `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の中身を読まない（例外：検証のために自分で生成したフィクスチャに対して `validate`・`qc`・`diff`・`cmp` を実行し、その出力を見るのは可）。
- **C-8** 本タスクは計画書を変えないので、`docs/work/2026-11-13-explainer-ui-harness/PLAN.md` と `docs/requirements/ORCHESTRATION_PLAN.md` の写しに変更が無いことだけ確認する。

## REPORT.md

`docs/work/2026-11-13-explainer-ui-harness/tasks/T8b/REPORT.md` に次を書く。**合否判定はしない**。

- 起動時チェックと縮退レベル
- DESIGN.md の確定内容（実装と食い違って直した箇所があれば、その一覧）
- 名称統一の確認結果（8箇所の状態。不在 grep の結果。残っていた箇所があればその所在）
- VERIFICATION.md への追記内容（CP-A0・CP-A1・CP-A2 の所在、UI-C・UI-V の結果、公開後確認①の扱い）
- C-1〜C-6 の結果、変更ファイルの一覧
- 判断したこと・質問（非ブロッキング。既定の判断で進めたもの）

## 禁止事項

- push しない。自己合格禁止。承認カードが出たら止めて報告する。
- MV の制作原則・工程・検証の仕様変更はしない（N1）。MV に QC 規則を追加しない（N10）。ゲートと助言の線引きを変えない。出力映像の仕様は変更しない。
- 計画書・要件書・Amendment を変えない。共有の `ENVIRONMENT.md` を編集しない。
- 対象ファイルの範囲を勝手に広げない（名称の残存は申告するだけ）。
