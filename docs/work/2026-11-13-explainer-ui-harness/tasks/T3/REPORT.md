# REPORT — T3 制作ハーネス文書（job-template）

- 作業ID：`2026-11-13-explainer-ui-harness`／タスク T3／ブランチ `task/T3-docs`（切り替えなし、push なし）
- 書いた者：L3 実働 A（Opus 5.5 / effort medium、Claude Code 非対話セッション）
- 成果物コミット：`e9f6429 Add explainer chapter, shared ghost chapter and record templates to the job harness`（文書とテストを同じコミットに含めた）。本 REPORT は別コミット。
- **合否判定はしていない。** 以下は証拠の記録であり、G3 は L2 が別コンテキストで行う。

## 0. 起動時チェック（計画書 §8.1）

| 項目 | 結果 |
| --- | --- |
| 層 | L3 実働 A（DIRECTION.md の記載どおり） |
| エージェント製品・モデル・effort | Claude Code 2.1.319、`claude-opus-5-5`、effort medium、非対話 |
| サブエージェント | Agent ツールは提示されていた。本タスクでは起動していない（文書タスクで分割の利得が小さいため） |
| コマンド実行 | 可（`node -v` = v24.15.0、Git Bash） |
| 対話 | 不可（非対話セッション） |
| ネットワーク | npm registry は可（`npm ci` 成功）。Pages の閲覧は未確認（本タスクで不要） |
| ヘッドレス Chrome | 未確認（本タスクで不要） |
| Aivis・GPU | 本タスクでは不要。未確認 |
| `node_modules/` | worktree に無かったため `npm ci` を実行し成功（終了コード0。audit の警告のみ） |

**縮退レベル：0（標準）。** 理由：コマンド実行・ネットワークとも可。自己判定になるゲート：なし（G3 は L2 が別コンテキストで行う）。本セッションでは自分の成果物を合格と判定していない。

## 1. 変更したファイル

| ファイル | 内容 |
| --- | --- |
| `job-template/AGENTS.md` | 冒頭に HN-14 の1文と「章の読み分け」。MV 章（本文無変更、見出しレベルのみ変更）／解説動画モード章（新設）／両モード共通章（ゲートと助言の線引き、レンダーゴースト、素材生成、完成の条件） |
| `job-template/README.md` | コマンド一覧に `npm run qc -- --stage=pre|post`。「解説動画の制作」節（様式モード／記録ファイル／QC コマンドとゲートの意味）を MV 節の後に追加。Biim 場面テキスト節に適用範囲の1文、ファイル一覧の `plan/` に templates の説明 |
| `job-template/plan/templates/explanation-map.md` | CONTRACT §1.2 の6見出し。説明は HTML コメントのみ |
| `job-template/plan/templates/direction-explainer.md` | CONTRACT §1.3 の見出し（`## 方向性の3案`＋`### 案1〜3`、`## 採用と理由`、`## スタイル定義`）。説明は HTML コメントのみ |
| `job-template/plan/templates/storyboard-explainer.md` | `## 場面 EXAMPLE-01` と13項目（CONTRACT §1.4 の例と同じラベル） |
| `job-template/plan/templates/evidence.example.json` | CONTRACT §2.1 のスキーマに合う例（ID はすべて `EXAMPLE` 始まり。file／url／common、number＋check、common 根拠の fact、hedged の例） |
| `job-template/plan/templates/qc-review.md` | CONTRACT §1.6 の書式。`review_mode: self`、未チェック行 `- [ ]` のみ、`## 免除（オーナー記入）` 節は HTML コメントのみ（`- WAIVE` 行は置いていない） |
| `tests/harness-docs.test.ts` | 新設（7テスト。§3） |

## 2. 内容の要点との対応（計画書 §5.1 T3）

| 要点 | 場所（`job-template/AGENTS.md` の新行番号） |
| --- | --- |
| 冒頭の HN-14 の1文 | 3 |
| 「`project.mode` によって読む章」 | 7–16 |
| 理解先的設計7原則（各1例以上）＋EX-02 の位置づけと例外 | 99–109 |
| 様式モードの節（4モード表、`biim` は既定だが必須ではない、Biim 標準は Biim 様式の場面だけ、`mixed` の区間割り当て、非 Biim の字幕と部品 `FullscreenStage`／`StandardCaption`／`DiagramStage`） | 111–145 |
| 構造翻訳の対応表11行＋「出発点」＋EX-04 | 147–165 |
| 方向性3案と6軸（EX-05、EX-08、EX-09、AM-2 の視覚様式軸） | 167–185 |
| スタイルと演者（EX-06 を AM-2 で読み替えた項目、EX-07 を Biim 様式の場面に限定） | 187–203 |
| 「解説動画の演出と実装の規則」（改題、15項目保持） | 205–221 |
| 制作工程14ステップ（EX-10、成果物パス、工程5で scenes 下書き・工程8で確定＝CONTRACT §1.4）＋評価の3区別（EX-13） | 223–247 |
| 事前・事後 QC（PRE-1〜8、POST-1〜8、POST-4R・5R、レビュー行、review_mode、免除はオーナーのみ、ゴースト件数は助言） | 249–289 |
| 失敗チェックリスト23項目（EX-20 の文言そのまま） | 291–324 |
| ゲートと助言の線引き（制作ハーネスの緩さの宣言を含む） | 328–333 |
| レンダーゴースト節（両モード共通章へ移動、本文無変更）＋解説字幕の1文 | 335–346 |
| 完成の条件（EX-12：事後ゲート合格を追加、既存文は維持） | 367–371 |
| MV 章の本文・F9 の11文言 | 28–93（本文は基準と同一。§4） |

### 15項目に加えた文（削った文は無い）

- 項目4（old 101）：「制作時（工程5で下書き、工程8で確定）に」と、`note_top`／`note_bottom` は Biim 枠の場面のテキストで `anime`／`motion` では不要、の1文。
- 項目8（old 105）：「設定した**様式モード・**Biim使用率…」。
- 項目11（old 108）：`anime`／`motion` でも全場面で Biim 枠を使わない、の1文。
- 項目12（old 109）：`anime`／`motion` の場面も `biim=false`、`FullscreenStage` 等で描いてよい、の1文。
- 項目14（old 111）：非 Biim では `FullscreenStage` の `characterStyle` でも同様、の1文。
- 項目15（old 112）：「この項目は Biim 様式の場面にだけ適用」の1文（CONTRACT §5.5 の指示）。

### 旧解説工程12ステップの収め先（EX-10「削らず該当ステップへ」）

旧 1→新1、旧 2→新4（読み）・新2（前提・結論）、旧 3→新5（希望尺の一文を含む。説明目的・画面変化・ナレーション・キャラ動作・BGM/SE は必須欄に展開）、旧 4→新8、旧 5・6→新9（文は原文のまま）、旧 7・8→新10（「**場面に合う簡単なBGMとSEも制作する。**」を含め原文のまま）、旧 9→新11、旧 10・11→新12、旧 12→新13・14。旧文のうち文単位で一致しないのは、言い換え・展開した7文（旧2の2文、旧3の2文、旧4の目録の文に括弧を追加、旧6「必要なら短い字幕単位に分割・調整する」に括弧を追加、旧9の確認の文に「音と一緒に通しで視聴」を追加）で、内容は新しい文に含まれている。

## 3. テストの表明内容（`tests/harness-docs.test.ts`）

1. ZIP 内 `AGENTS.md` の先頭20行に HN-14 の1文があり「優先順位」より前にある／読み分け表に mv・explanation の両行と `style_mode`。**(b)**
2. 解説章の9つの小見出し／旧見出し「解説動画と共通の演出」が無い／7原則／EX-02 の位置づけと例外／翻訳表11行＋前置き／3案・3軸以上・骨格か図解の核・6軸・5軸・differentiation／スタイル定義の項目／番号1〜14のステップと各ステップの成果物・コマンド／評価の3区別／PRE-1〜8・POST-1〜8（4R・5R 含む）／レビュー・self・免除・ゴースト件数／**23項目すべて（番号付き、要件書 2.7 の文言）**。**(a)**
3. 様式モード節：4モードの表の行、「`biim`は既定であって必須ではない」、Biim 様式の場面にだけ適用、`mixed` の区間割り当て、`biim=false`、非 Biim の3部品名、標準字幕／演出と実装の規則が15項目で、Biim 限定の文がある。**(a)**
4. レンダーゴースト節が「両モード共通」章にあり、本文の要所と解説字幕の1文がある／MV 章にゴーストの見出しが無く、MV 工程からの参照文は残る／緩さの宣言／完成の条件の qc-post。
5. ひな形5つの見出し・ラベル・`EXAMPLE` ID・evidence のスキーマ・qc-review にチェック済み行と WAIVE 行が無いこと。
6. **生成した ZIP（解説・MV の両方）で、`plan/direction.md`、`plan/explanation-map.md`、`plan/evidence.json`、`plan/script.md`、`plan/storyboard.md`、`plan/sources.md`、`plan/music-analysis.md`、`reports/*.md` のファイルが存在せず、`plan/templates/` の5ファイルは同梱されている。**（**(c)**、EX-32）。変異確認：`job-template/plan/direction.md` と `job-template/reports/visual-qa.md` を一時的に置くとこのテストが `…/plan/direction.md is a checked path` で失敗することを確かめ、ファイルは削除した。
7. job-template/README.md の解説節（様式モード／記録ファイル／QC コマンドとゲートの意味、qc の pre/post、templates、主観は助言）。

## 4. 完了条件の証拠

| 条件 | 結果（コミット `e9f6429` 時点） |
| --- | --- |
| F9 の11文言・`MV brief and AGENTS…` が無変更で通る | `npm test` で `✔ MV brief and AGENTS carry design-first principles, diversity steps and asset policy`。MV 章の本文行は基準 `2a7d209` の行とすべて完全一致（見出し `####`→`###`、`### MVモード`→`## MVモード`、`## 自由度` の削除のみ。行単位の照合スクリプトで確認） |
| ひな形が検査対象パスに無い | `ls job-template/plan/` → `narration.json  sound-design.json  templates`。テスト6 |
| C-1 `npm test` | `tests 36 / pass 36 / fail 0`（既存29＋新設7） |
| C-2 `npm run build -- --base=/BiimMotionWebUI/` | `✓ built`（チャンクサイズの警告のみ） |
| C-3 `git diff --check 2a7d209...HEAD` | 出力なし |
| C-4 | `git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts` → 差分なし。`git diff -U0 955fa5c -- tests/job.test.ts \| grep '^-[^-]'` → 出力なし。MV 5件・ghost 全件・imagegen 全件が `npm test` で ✔ |
| C-5 `git diff --stat 2a7d209...HEAD` | 変更は `job-template/AGENTS.md`、`job-template/README.md`、`job-template/plan/templates/`（5ファイル）、`tests/harness-docs.test.ts` と、L2 の発注記録（`tasks/T0〜T4/DIRECTION.md`）のみ。触らない範囲に変更なし |
| C-6 | 計画書 §5.0 C-6 の2つの grep：どちらも出力なし |
| C-7 | `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の中身は読んでいない（`npm ci`・`npm run build` がそれらを生成・使用しただけ。`dist/` と `tsconfig.tsbuildinfo` は ignore 対象で未コミット） |
| C-8 | `cmp PLAN.md ORCHESTRATION_PLAN.md` → 一致（計画は変更していない） |

## 5. 移動・改題した節の新旧行番号対応表（`job-template/AGENTS.md`、旧＝`2a7d209`、新＝`e9f6429`）

| 旧行 | 旧見出し・内容 | 新行 | 新見出し・扱い |
| --- | --- | --- | --- |
| 1–3 | 題、冒頭文 | 1, 5 | 同じ。間に HN-14 の1文（3）を挿入 |
| — | — | 7–16 | `## 章の読み分け（project.mode によって読む章）`（新設） |
| 5–13 | `## 優先順位` | 18–26 | 同じ（無変更） |
| 15 | `## 自由度` | — | 削除（見出しのみ。下の章に再編） |
| 17 | `### MVモード（project.mode="mv"）` | 28 | `## MVモード（project.mode="mv"）`（レベル変更） |
| 19–22 | MV 方針の4項目 | 30–33 | 無変更 |
| 24–82 | `####` 思想先的設計〜失敗パターンのチェックリスト | 35–93 | `###` に変更、本文無変更（+11行） |
| 84–94 | `#### レンダーゴースト（合成レイヤー残留）の再発防止` | 335–345 | `## 両モード共通` 下の `###` へ移動、本文無変更。346 に解説字幕の1文を追加 |
| 96 | `### 解説動画と共通の演出` | 205 | `### 解説動画の演出と実装の規則`（改題） |
| 98–112 | 同15項目 | 207–221 | 15項目保持（§2 の追記あり） |
| 101 | note_top／note_bottom の記録（CONTRACT §5.5 の「100」） | 210 | 追記あり |
| 105 | Biim使用率・字幕位置の固定 | 214 | 「様式モード」を追記 |
| 108–109 | 全画面・縦／`biim=false` の場面（CONTRACT §5.5 の「105、107」） | 217–218 | 追記あり |
| 110–111 | キャラの自由移動・Character3D（同「108-109」） | 219–220 | 220 に追記あり |
| 112 | biim-standard-v1 を標準にする（同「110」） | 221 | 「Biim 様式の場面にだけ適用」を追記 |
| 114 | `## 素材生成（画像）` | 348 | `###`（両モード共通章）、本文 116–131 → 350–365 無変更 |
| 133 | `## 制作工程` | 223 | `### 解説動画の制作工程`（解説章へ移動・改題） |
| 135 | MV は MV 工程に従う、の文 | 225 | 同じ文を先頭に保持（後ろに説明を追加） |
| 137–148 | 解説工程12ステップ | 227–241 | 14ステップへ再編（§2 の収め先） |
| 150 | `## 完成の条件` | 367 | `###`（両モード共通章） |
| 151 | 完成の条件の本文 | 369 | 無変更。371 に解説の事後ゲート条件を追加 |
| 153 | README への案内 | 373 | 無変更 |

CONTRACT §5.5 を直す場合の対応：「96-101、103-104、106」→ 205–210、212–213、215／「100」（実際は旧101）→ 210／「105、107」（実際は旧108–109）→ 217–218／「108-109」（実際は旧110–111）→ 219–220／「110」（実際は旧112）→ 221／「84-94」→ 335–345。

## 6. 判断したこと・質問（非ブロッキング。既定の判断で進めた）

- **Q-T3-1（L2）**：解説の方向性3案の「視覚様式」軸に様式モードを含めたが、案の様式モードは `brief.md` と `project.direction.style_mode`（ユーザーの選択）に従い、その範囲で見た目の型を変える、とした。エージェントが方向性の検討の結果として `style_mode` 自体を書き換えてよいかは書いていない（WebUI の既定 `biim` とユーザーの明示選択を区別できず、ユーザーの選択を上書きする恐れがあるため）。様式モード自体の候補生成は WebUI 側（T5）の役割と解釈した。
- **Q-T3-2（L2）**：制作工程13（final と事後ゲート）と14（納品記録）の順序。POST-1（`validate --final`）と POST-8 が `reports/delivery.md` を検査するので、工程13に「14の納品記録を書いてから事後ゲートを通す」と書いた（要件書 EX-10 の番号順は変えていない）。
- ひな形 `qc-review.md` の `review_mode` は `self` を既定にした（写しただけで `independent` と主張されることを防ぐため）。
- 非 Biim 部品（`FullscreenStage`・`StandardCaption`・`DiagramStage`）は T5b が追加する。本ブランチの motion-kit にはまだ無いが、CONTRACT §4.8 の名前で書き、「任意。独自実装してよい」とした。T5b が名前を変える場合は AGENTS.md と本テスト（部品名の表明）も合わせる必要がある。
- `job-template/README.md` の motion-kit 数「12コンポーネント」は T5b の対象（EX-34）なので変えていない。
- T5 の「`explainerQualityChecklist` の23項目がすべて `job-template/AGENTS.md` にも存在」テストのため、23項目は要件書 2.7 の文言をそのまま1行ずつ置いた（項目19のみ末尾に括弧書きを付けた。項目文字列は部分一致で含まれる）。

## 7. 未検証

- 生成ジョブ内での `npm run qc` の実行（`qc.mjs` は T4 の成果物で、本ブランチには無い）。AGENTS.md・README のコマンド記述は CONTRACT §2.2.2 に合わせたが、実動作は未検証。
- ひな形を写した記録が T4 の `qc.mjs` の解析規則で期待どおりに判定されること（`EXAMPLE` で不合格、HTML コメントのみで空扱い）。CONTRACT §1.9・§1.10 に合わせて作ったが、実装との突き合わせは T4 取り込み後。
