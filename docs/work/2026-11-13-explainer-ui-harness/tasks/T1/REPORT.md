# REPORT — T1 契約の固定（CONTRACT.md）

| 項目 | 内容 |
| --- | --- |
| 作業ID | `2026-11-13-explainer-ui-harness` |
| タスク | T1（DIRECTION.md、計画書 §5.1） |
| 実装者 | L3 実働 A（Claude Code 非対話セッション、Opus 5.5、effort medium） |
| ブランチ | `task/T1-contract`（`<BASE>` = `2a7d209`）。push はしていない |
| 変更したファイル | `docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（新設）、本 REPORT.md（新設） |
| 合否 | **本書は合否を判定しない**（G3 は L2、交差レビューは実働 B） |

## 1. 起動時チェック（計画書 §8.1）

| 項目 | 結果 |
| --- | --- |
| 層 | L3 実働 A（DIRECTION.md の記載から判定） |
| エージェント製品・モデル・effort | Claude Code（非対話）、`claude-opus-5-5`、medium |
| サブエージェント | 起動可能（Agent ツールあり）。本タスクでは使っていない（下請けに出した範囲なし） |
| コマンド実行 | 可。`node -v` → v24.15.0、`npm -v` → 11.12.1 |
| `npm test` | worktree に `node_modules/` が無かったので `npm ci` を実行（成功、終了コード0）。着手前のベースラインで 29件合格 |
| 対話 | 不可（非対話実行）。確認事項は CONTRACT.md §9 に書いた |
| ネットワーク | 可（`npm ci` が成功） |
| ヘッドレス Chrome・Aivis・GPU | 本タスクでは不要のため未確認 |

**縮退レベル：0（標準）。** 理由：実働 A の割り当てどおりの製品・モデルで、コマンド実行とネットワークが使える。自己判定になるゲート：なし（G3 は L2、交差レビューは実働 B が行う）。非対話であることは HN-11 の「対話できない」行に従い、質問をファイルに書いて既定の判断で進めた。

## 2. 完了条件ごとの証拠

### 2.1 8節がある

| DIRECTION の節 | CONTRACT.md の所在 |
| --- | --- |
| 1 ジョブ内のファイル名と必須見出し | §1（1.1 ファイル一覧、1.2 explanation-map、1.3 direction、1.4 storyboard、1.5 script、1.6 qc-review、1.7 visual-qa、1.8 delivery、1.9 見出しの判定規則、1.10 ひな形） |
| 2 evidence.json と qc-<stage>.json のスキーマ（`style_mode`・`scope` 追加） | §2（2.1 evidence、2.2 qc。`style_mode` と `gates[].scope`（`all`／`biim-scenes`）は §2.2.1、ゲート一覧は §2.2.3） |
| 3 MotionForm・project.json の追加項目、schema_version | §3（3.1 MotionForm、3.2 project.json、`schema_version` は `"0.3"` → `"0.4"`、3.3 outline.txt・brief・依頼文） |
| 4 様式モード契約 | §4（4.1 4モード、4.2 対応表の確定版と変更理由、4.3 `scene.biim` との整合規則 R1〜R7、4.4 縦出力、4.5 既定デザイン文の切り替え、4.6 brief・ハンドオフの規則、4.7 mixed の区間上書き、4.8 非 Biim 部品の名前と API、4.9 変更点一覧） |
| 5 Biim 固有検査の棚卸し表 | §5（5.1 validate.mjs、5.2 qc.mjs、5.3 PRE-8、5.4 brief・依頼文、5.5 AGENTS.md） |
| 6 字幕帯域の算出規則と置き場所・型の与え方 | §6（6.1 単一モジュール `caption-capacity.mjs`＋`caption-capacity.d.mts`、6.2 export、6.3 式と容量表、6.4 検査する字幕単位、6.5 推定読み上げ秒数） |
| 7 MV の不変条件と許容差分 | §7（7.2 は計画書 §5.3 の許容差分一覧と同じ項目。型宣言のファイル名と motion-kit の新規3ファイルを具体化した点だけが加筆） |
| 8 AM-2 による読み替え一覧 | §8（DIRECTION が挙げた5項目＝表の #1〜#5、加えて #6〜#10） |

### 2.2 様式モード契約の確定内容と、初期案からの変更理由

確定した対応表は CONTRACT.md §4.2。初期案（計画書 §1.2）から変えた点（§4.9）：

1. **`anime`／`motion` の場面に `anime` と `motion` の両方を許す。** 両者の違いは主役だけで、適用する検査は同じ。縦では `mixed` を選べないため、縦でアニメ的な場面とモーション的な場面を混ぜるにはこれしか手段がない。
2. **縦で選べないのは `mixed` だけにし、縦＋`biim` は現行の「Biim 様式の全画面（枠なし）」として残す。** 既存テスト `tests/job.test.ts:603-607` が既定フォーム（様式の既定は `biim`）の縦 1080×1920 で `generateJob` が成功することを表明している。`validateForm` が縦＋`biim` を拒否すると、このテストを変えなければならない。計画書 §5.2 は `tests/job.test.ts` の既存行の変更を禁じている。また計画書 §1.2 の対応表自身も、`biim` 行に「縦なら `fullscreen`」と書いている。DIRECTION の「縦では biim／mixed を選べない」と食い違うため、CONTRACT.md §9 Q-T1-2 に挙げた。
3. 非 Biim 様式の場面には `biim: false` の明記を必須にした（R5）。`runtime/src/`（MV の ZIP に入るので変えられない）の描画が `scene.biim` だけで切り替わるので、`mixed` で非 Biim 場面に Biim 枠が描かれないようにするため。
4. 様式の判定関数（`effectiveStyleMode`、`effectiveSceneStyle`、`sceneUsesBiimFrame`）を `caption-capacity.mjs` に置く。計画書 §5.3 の許容差分一覧は `runtime/scripts/` の新規ファイルとして `qc.mjs` と `caption-capacity.mjs`（とその型宣言）だけを挙げているため、3つ目のモジュールは作らない。

### 2.3 棚卸し表の根拠にした検査・指示（実際に読んだ箇所）

- `job-template/runtime/scripts/validate.mjs` 全289行：V1〜V20 を行範囲ごとに分類（43-44、45-64、65-73、74-80、81-85、86、87-100、103-129、130-170、172-182、185-205、207-208、209-221、222-226、228-241、249-281）。
- `job-template/runtime/src/Captions.tsx` 全80行、`Presentation.ts` 全23行、`MainVideo.tsx` の 30-106 行、`BiimScene.tsx`、`motion-kit/BiimOverlay.tsx` の冒頭、`motion-kit/layers.ts`、`scenes/index.tsx`・`scenes/Scene001.tsx` の冒頭。
- `job-template/runtime/scripts/aivis.mjs` の `sceneSegments`（17-58 行）と `plan/narration.json` の扱い。`ghost-check.mjs` の `ghostMachineSummary`（266-300 行）と `ghostReportStem`。
- `src/job.ts`：`MotionForm`（19-66）、`defaults.design`（91-92）、`usesFullScreen`（192-196）、`agentPromptFor`（202-205）、`modeKeys`／`switchVideoMode`（322-358）、`validateForm`（377-）、`createProject`（513-697）、`createBrief`（726-808）、`generateJob`（811-884）。`src/biim-standard.json`。
- `job-template/AGENTS.md` の 1-16、96-153 行。
- 監査 `audit-explainer.md` 全文、`audit-space.md` の該当箇所（QC・ハンドオフ・directions の項）。

字幕容量の表（§6.3）は手計算したあと、検証用の一時スクリプトで `createProject` の実際の出力から再計算し、6条件すべてが一致することを確かめた：Biim・1人・左 23×2=46、Biim・1人・右 24×2=48、Biim・2人 19×2=38、Biim・キャラなし 27×2=54、全画面・横 32×1=32、縦 17×2=34。要件書 EX-17 の試算（46・38・32・34）とも一致する。一時スクリプトは削除済みで、コミットには含まれない。

`.d.mts` による型の与え方（§6.1）は、repo の外の一時ディレクトリで試した。ルートの `tsconfig.json` と同じ設定（`types` だけを空にした）で `src/a.ts` から `../job-template/runtime/scripts/cap.mjs` を import し、同名の `cap.d.mts` を置いた。この状態で `tsc -p` が終了コード0になった。一時ディレクトリは削除済み。実際の `npm run build` の合否は T4-1 で確かめる。

### 2.4 交差レビューで「不明点なし」と判定できるか

この判定は交差レビュー者（実働 B）の仕事なので、ここでは判定しない。各後続タスクが使う節を次に示す：

- T3：§1（見出し・様式・ひな形）、§4.1・4.3・4.7・4.8、§5.5、§8。
- T4：§1.4・1.6〜1.9、§2、§4.3、§5.1〜5.3、§6。
- T5：§3、§4.1〜4.6、§6.2・6.3・6.5、§7.1。
- T5b：§4.8、§7。
- T9a：§2.2、§3、§4.1・4.6、§8 の #10。

### 2.5 要件書・Amendment との矛盾

要件書・Amendment は書き換えていない。契約で追加・解釈した点は CONTRACT.md §9 の Q-T1-1〜Q-T1-5 に挙げた。

**逸脱**：DIRECTION は「矛盾は `QUESTIONS.md` へ」としているが、同じ DIRECTION の「触らない範囲」に `QUESTIONS.md` が含まれている。触らない範囲を優先し、確認事項は CONTRACT.md §9 に書いた。転記するかどうかは L2 が判断する。

## 3. 検証コマンドの出力

C-1・C-2 はコミット前に、C-3〜C-6 はコミット後に実行した。

- **C-1** `npm test` → `tests 29 / pass 29 / fail 0`（終了コード0）。
- **C-2** `npm run build -- --base=/BiimMotionWebUI/` → 終了コード0、`✓ built in 2.72s`。
- **C-3** `git diff --check 2a7d209...HEAD` → 出力なし（終了コード0）。
- **C-4** `git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts` → 終了コード0。`git diff -U0 955fa5c -- tests/job.test.ts | grep '^-[^-]'` → 出力なし。
- **C-5** `git diff --stat 2a7d209...HEAD` → `CONTRACT.md`、`tasks/T0/DIRECTION.md`、`tasks/T1/DIRECTION.md`、`tasks/T1/REPORT.md`、`tasks/T2/DIRECTION.md`。3つの DIRECTION.md は L2 の発注記録のコミット `bff59c6` によるもので、本タスクで変更したのは `CONTRACT.md` と本 REPORT.md だけ。
- **C-6** 計画書 §5.0 の C-6 の1本目（パス・メールアドレス）は、初回のコミット後に CONTRACT.md の2行で一致した。§1.6 の `review_mode` 行と `reviewer` 行の正規表現で、キー名の末尾の英字・コロン・空白クラスのバックスラッシュが並び、ドライブ文字の形に見えた誤検出で、パスではない。それでも出力を空にするため、空白クラスを `[ \t]` に書き換えて同じコミットに含めた（未 push の自分のコミットを amend。単一コミットの指示に従うため）。書き換え後は1本目・2本目（認証情報の語）とも出力なし。
- **C-7** `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の中身は読み込んでいない。`npm ci` が `package-lock.json` を読み `node_modules/` を作り、`npm run build` が `dist/` を作ったが、どちらもツールの動作であり、中身をコンテキストに読み込んでいない（出力の末尾行だけを見た）。
- **C-8** 計画を変えていないので対象外（`PLAN.md`・`ORCHESTRATION_PLAN.md` は触っていない）。

## 4. 未解決の点・申し送り

- 監査の原本は、DIRECTION にある相対パス `../BiimMakerWebUI/.agent-work/` には無かった。実際にはメインのチェックアウト（この worktree から見て `../../BiimMakerWebUI/.agent-work/`）にあり、そこから読んだ。原本は変更していない。
- 字幕容量の係数と読み上げ速度（`SPEECH_CHARS_PER_SEC = 6.0`）は暫定値。実測による確定は T11 または G4-α で行う（計画書 T4 の完了条件どおり）。
- CONTRACT.md §9 の Q-T1-1〜Q-T1-5 は、L2 が `QUESTIONS.md` へ転記するかどうかを判断する。
