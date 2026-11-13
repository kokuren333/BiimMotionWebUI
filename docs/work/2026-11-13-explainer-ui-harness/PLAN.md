# 実装計画：解説動画ハーネス強化・UI刷新・自走ハーネス整備

| 項目 | 内容 |
| --- | --- |
| 作業ID | `2026-11-13-explainer-ui-harness` |
| 作成 | L2 オーケストレーター（Opus 5.5 / effort high、Claude Code 非対話セッション） |
| 入力（優先順） | ① `docs/requirements/2026-11-13-amendment-01.md`（オーナー決定、最優先）② `docs/requirements/2026-11-13-explainer-ui-harness.md`（PM 要件、以下「要件書」）③ `.agent-work/audit-*.md`（監査3本、材料） |
| 基準コミット | `955fa5c`（main） |
| 写し | `docs/work/2026-11-13-explainer-ui-harness/PLAN.md` が作業記録の正本。本書はその**バイト単位の写し**（オーナーの指示で2ファイルを置く）。直すときは `PLAN.md` を直してから `cp` で本書へ写す。G3・G4 で `cmp docs/work/2026-11-13-explainer-ui-harness/PLAN.md docs/requirements/ORCHESTRATION_PLAN.md` を確認する |
| 状態 | G1 判定済み（条件付き合格、§2）。G2：1回目「差し戻し」→ 修正 → 2回目「合格」。2回目の低指摘 N1〜N4 も反映済み（記録は `docs/work/2026-11-13-explainer-ui-harness/G2-REVIEW.md`） |

---

## 0. 読み方

- 本書は要件を変えない。要件と矛盾しそうな点は §1.3（解釈）と §1.4（差分）に書き、PM 宛ての確認は `QUESTIONS.md` に出した。
- タスク ID：ローカル repo 系は `T0`〜`T11`、スペース版系は `S0`〜`S5`（別系統）。
- 「担当」は L3 実働の割り当て。**レビュー者は必ず実装者と別コンテキスト**（§4）。
- **表示名 `BiimMotion`**：オーナー決定（Amendment 02、2026-11-13 20:36）。`{{DISPLAY_NAME}}` の変数扱いは終了し、表示名は `BiimMotion` 確定で作業する（§1.3、Q3）。
- 公開の規則は Amendment 01 の AM-1 に従う：**機械的ゲート＋実装者以外のレビュー＋スクリーンショット記録に合格すれば、オーナーの目視を待たずに main へマージし Pages へ公開する**。スクリーンショットは証拠記録であり待ち点ではない。

---

## 1. Amendment 01 の反映と要件の解釈

### 1.1 AM-1（目視ゲート廃止）で置き換えた箇所

| 要件書の箇所 | 本計画での扱い |
| --- | --- |
| D18、HN-03 の2（UI 変更はオーナー目視後にのみマージ） | **置換**：「main へ直接 push しない。作業はブランチ＋PR。G4 合格後はオーナー目視なしでマージ・公開してよい」。T2 でルート `AGENTS.md`／`docs/WORKFLOW.md` にこの新規則を書く |
| §3.4 UI-A1（早期目視・オーナー判定） | **記録点 CP-A1 に変更**。T6 完了時に S1・S3 と `docs/DESIGN.md` 草稿を記録し、G3 レビュー（非実装者）で DESIGN 規則との整合を見る。**全面適用（T7）を止める力はない** |
| §3.4 UI-A2（最終目視・オーナー判定） | **記録点 CP-A2 に変更**。S1〜S8 刷新前後の対を記録し、G4-β で非実装者が UI-V1〜V7 を判定する |
| G5（オーナー目視ゲート） | **廃止**。ゲートは G1〜G4。G4 の後は「公開」→「公開後確認（非ゲート）」 |
| A11（オーナーが UI-A1/UI-A2 で合格判定） | **置換**：A11′「CP-A1・CP-A2 のスクリーンショットが記録され、UI-C1〜C5 と非実装者による UI-V1〜V7 の判定が合格」 |
| UI-V8（オーナー判定） | 公開後の任意フィードバック。結果は `FEEDBACK.md` に記録し、問題があれば後続修正タスクにする |
| HN-12 の4（UI 変更はオーナー目視まで main に入れない） | AM-1 の規則2・3から**導出して置換**：「UI を変えた場合はスクリーンショットを取得し `VERIFICATION.md` に記録するまで main に入れない」（Amendment に明示列挙は無いが、同じ規則の別記述のため。`QUESTIONS.md` Q1 で PM に追認を依頼） |
| HN-13（自己レビューがあれば G5 必須） | **置換**：自己レビューになったゲートは `ENVIRONMENT.md` と該当 `REVIEW.md` に記録して進める。オーナー目視の強制には使わない |
| HN-11 の表「対話できない」行（公開は手前で止める） | 本作業ID に限り、**main へのマージと Pages 公開は AM-1 によりオーナーが事前に許可済み**と解釈する。非対話でも G4 合格後に行ってよい。それ以外の取り消しにくい操作（強制 push、履歴改変、ブランチ・ファイルの一括削除、スペース版の本番 DB への移行適用）は従来どおり手前で止めて報告する（Q1） |
| N9 の理由欄（目視ゲートで足りる） | 非目的 N9（スクリーンショット差分の CI 自動化をしない）は維持。理由は「機械基準と非実装者レビューで足りる」に読み替える |

### 1.2 AM-2（解説動画の様式自由度）で立てた前提とタスク

**様式モード `style_mode`**：`biim`（既定）／`anime`／`motion`／`mixed`。MV は対象外（MV の入力・生成物・検証は変えない）。

| AM-2 の含意 | 反映先タスク |
| --- | --- |
| 1. brief／設計に `style_mode`、mixed は区間単位の上書き | **T1**（契約）、**T5**（フォーム・project・brief・依頼文）、**T3**（ストーリーボード必須欄・スタイル定義） |
| 2. explainer-assist の候補生成で様式モード自体を候補対象に。通常様式も同格 | **T5**（`explainerAxes` の「視覚様式」軸、`explainerCandidates` の同格サンプリングとテスト） |
| 3. validate／QC の様式対応。Biim 固有検査は biim モード／mixed の Biim 区間だけ | **T1**（Biim 固有検査の棚卸し表）、**T4**（`validate.mjs`・`qc.mjs` の適用範囲の切り替えとテスト） |
| 4. motion-kit に非 Biim 提示部品。Biim 部品ゼロのジョブを許す | **T5b**（新部品・同梱数の表明更新） |
| 5. WebUI に様式選択（平易な説明つき、既定 biim、固定しない） | **T5**（入力と配線）、**T7**（刷新後の見た目での配置） |
| 6. スペース版も `style_mode` をジョブ／ハンドオフに。非 Biim のハンドオフ文に Biim レイアウト指示を入れない | **T9a**（引き渡し仕様）、**S1〜S3**（スペース実装） |
| 7. MV 対象外 | 全タスクの完了条件「MV 非退行」 |

**様式モードと既存設定の関係（T1 で契約として確定させる初期案。T1 は変えてよいが、変えた理由を CONTRACT.md に書く）**

| style_mode | `project.layout.mode` | `direction.biim_usage` | 場面ごとの様式 `scenes[].style` | Biim 固有検査 |
| --- | --- | --- | --- | --- |
| `biim` | 現行どおり（`biim`、または全画面設定・縦なら `fullscreen`） | 現行どおり（`sometimes`／`mostly`） | 全場面 `biim`（Biim 枠の場面と Biim 様式の全画面場面を含む＝現行の既定挙動） | 適用 |
| `anime` | `fullscreen` | `never` | 全場面 `anime` | 適用しない |
| `motion` | `fullscreen` | `never` | 全場面 `motion` | 適用しない |
| `mixed` | `biim`（Biim 区間の幾何を使えるようにする） | `sometimes` 以上 | 場面ごとに `biim`／`anime`／`motion` を記入 | `style: biim` の場面だけ |

- 縦（portrait）出力では `biim`／`mixed` は選べない（現行の「縦は Biim 枠なし」を維持）。WebUI は理由を表示して選択肢を無効化し、`validateForm` も拒否する。これは「固定・ロック」ではなく既存の幾何制約。
- 既存の `scene.biim` フラグ（`validate.mjs:197`）と `scenes[].style` の整合規則は T1 で決める。
- `anime` と `motion` の違いは主役の違い（anime＝キャラの演技とアニメ的な演出が主、motion＝図形・タイポグラフィ・図解のモーションが主、キャラは任意）。いずれも字幕領域は既存の全画面字幕領域（「標準字幕」）を使い、字幕帯域の検査（PRE-6）は**全モード共通**で、場面の様式に応じた領域で計算する。
- 既定のデザイン文（`defaults.design`、「Biim形式を軸に…」）は様式モードごとの既定文を持ち、ユーザーが未編集なら様式切り替えで差し替え、編集済みなら保持する（`switchVideoMode` のドラフト保持と同じ考え方）。
- 要件書のうち次の記述は AM-2 で読み替える（T1 が CONTRACT.md に一覧化し、T3 が job-template に反映）：2.1「移植しない」表の「解説は Biim 枠とキャラが標準」→「Biim は既定であって必須ではない」／EX-06 スタイル定義の「Biim 場面と全画面場面の使い分け規則」→「様式モードと（mixed の場合）区間ごとの様式の割り当て規則」／EX-07 → Biim 様式の場面にだけ適用／EX-11 の必須欄「レイアウト（Biim・全画面）」→「様式（biim／anime／motion）とレイアウト」／2.4「視覚様式」軸 → 様式モードを含む軸。
- **AM-2 は出力動画の様式の話であり、WebUI 自体のデザイン言語（D12「Biim 枠 UI」）は変えない。**

### 1.3 AM-3（表示名）

- U3 は決着（表示名 `BiimMotion`、Amendment 02、2026-11-13 20:36）。T6・T7・T8b は名称を `BiimMotion` 確定で扱う。**名称文字列の所在一覧**（`index.html` の title・説明、UI 内のブランド表示、README 見出し、favicon の代替テキスト、`src/style.css:1516` の `content: "MOTION JOB STUDIO"`）を `docs/DESIGN.md` に載せる。実測で確認した所在は次の8箇所：`index.html:11` title、`src/App.tsx:526` aria-label、`src/App.tsx:531` ブランド表示、`src/App.tsx:573` バージョン表示、`src/App.tsx:2089` フッター、`src/App.tsx:2124` 本文コピー、`src/style.css:1516` の `content`、`README.md:1` 見出し。変えないもの：`README.md:25・212` の `--base=/BiimMotionWebUI/`、`README.md:235` の repo 名・Pages URL、`package.json` の name、`.github/workflows/pages.yml`（識別子・URL として維持）。
- Pages の base パス `/BiimMotionWebUI/` は repo 名であり `{{DISPLAY_NAME}}` とは別物。名称が変わっても base は変えない。package 名・ローカルのフォルダ名も変えない（要件書 U3 の既定どおり）。
- AM-3 は計画を止めない。

### 1.4 要件書と監査の差分（PM 要件を優先した点）

| # | 監査の記述 | 要件書の決定 | 計画での扱い |
| --- | --- | --- | --- |
| D-1 | UI 監査：アイコンは SVG 体系に統一する | UI-08：装飾アイコンを廃止、文字ラベル | 要件書に従う |
| D-2 | UI 監査：状態色（成功・警告・エラー）を意味色として体系化 | UI-03：色は枠3色＋字幕の青赤＋無彩色5段に限定 | 要件書に従う。状態は青・赤と文字ラベルで示す |
| D-3 | UI 監査：650px 以下でプレビューカードが消える現行挙動は、変えるなら意図的な変更として扱え | UI-15：920px 以下は主領域→右上→右下の順に縦積み | 要件書に従い、狭幅でも右下ノートを出す。`docs/DESIGN.md` に「意図的な仕様変更」と明記（T7） |
| D-4 | UI 監査：フィールド単位のエラー表示へ格上げ | UI-11：エラー表示とフォーカス移動を維持（格上げは要求なし） | 必須にしない。T7 で追加コストが小さければ行ってよい（行った場合は REPORT に記録） |
| D-5 | 解説監査：解説の方向性軸（図解様式／例示戦略…） | D2：導入の型／説明の骨格／図解の核／キャラの役回り／視覚様式／テンポと緩急 | 要件書の6軸。ただし「視覚様式」軸は AM-2 で様式モードを含む |
| D-6 | 解説監査：`plan/script.md` 等の雛形を同梱 | EX-28：ひな形は `plan/templates/` に置き、検査対象パスには置かない | 要件書に従う |
| D-7 | 解説監査：motion-kit に解説専用部品（段階提示・チャート等） | 要件書に motion-kit 部品の要件は無い | 要件外として見送る。AM-2 の非 Biim 提示部品（T5b）だけ入れる。解説専用部品は `RETRO.md` の次回候補に記録 |
| D-8 | スペース監査：QC は pre/post の status と自由文 detail | SP-06：ジョブフォルダの `reports/qc-*.json` の `verdict` を読む | 要件書に従う（S2 で実装方法を決める） |
| D-9 | スペース監査：成果物 kind 案（explainer_script、evidence_notes、subtitle_data） | SP-07：5点（final／サムネ／メタデータ／台本と根拠メモ／字幕データ） | 要件書の5点。kind 名は S1 で決める |
| D-10 | スペース監査：スペースは「その時点の BiimMotionWebUI に合わせ Claude 経由で Biim ジョブ生成」（PC 側エージェントに生成させている）。テンプレートの複製は持っていない | U1：生成方法は未確認 | 監査で U1 の「生成方法」の半分は判明。**実装主体・時期**は未決のまま。SP-04 の入口（T9b）は SHOULD のまま、T9a の結論で要否を決める |
| D-11 | UI 監査：HEX 実使用154色 | F11：6桁 HEX 145種 | 数え方の違い。UI-C2 は規則（`:root` 以外に直値なし）で判定するので影響なし |
| D-12 | 要件書本文の「3.10」参照（スペース版仕様） | 実際の節番号は **2.10** | 誤記として 2.10 と読む |
| D-13 | 要件書 EX-25「`schema_version` を上げる」と EX-26「MV の生成物は前後で同一」 | 両方 MUST | `schema_version` は全モード共通の値なので MV の `project.json` でも上がる。**MV の生成物で許す差分は §5.3 の許容差分一覧に限る**（Q2） |

---

## 2. G1（要件）判定

**判定：条件付き合格（計画可能）。** 全 MUST 要件は判定可能な形で書かれており、未決は U1・U2（オーナー判断）だけ（U3 は決着：表示名 `BiimMotion`、Amendment 02）。条件は次の非ブロッキング確認（`docs/work/2026-11-13-explainer-ui-harness/QUESTIONS.md`）で、回答を待たずに既定で進める。

| ID | 宛先 | 内容 | 既定（回答が無い間） |
| --- | --- | --- | --- |
| Q1 | PM | AM-1 から導出した置換（HN-12 の4、HN-11 非対話行の公開扱い）の追認 | §1.1 の解釈で進める |
| Q2 | PM | EX-25 と EX-26 の関係（MV の `project.json` の `schema_version` 変化を許すか） | §5.3 の許容差分で進める |
| Q3 | オーナー | U3：表示名 | 表示名 `BiimMotion`（Amendment 02、2026-11-13 20:36 決定） |
| Q4 | オーナー | U1：スペース版の実装主体・時期 | S 系統は S0（引き渡し）まで。S1 以降は回答とスペース編集権のある実働が揃うまで着手しない |
| Q5 | オーナー | A6（解説1本の通し制作）の題材と様式 | WebUI のサンプル入力（虹）、`style_mode: mixed`（Biim 区間と非 Biim 区間の両方の検査経路を通すため） |
| Q6 | オーナー | U2：作業記録の公開 | 要件書の既定どおり含める。BRIEF 等にローカル絶対パス・メールアドレスを書かない |

---

## 3. 層と担当

| 層 | 担当（標準） | 本作業での役割 |
| --- | --- | --- |
| L1 PM | Fable 5.2 | 要件書（済）。`QUESTIONS.md` の Q1・Q2 に回答する |
| L2 オーケストレーター | Opus 5.5 high | 本計画、各タスクの `DIRECTION.md`（発注時に本書のタスク票から起こす）、G3・G4 の判定（`REVIEW.md`）、`ENVIRONMENT.md`、`RETRO.md` |
| L3 実働 A | Opus 5.5 medium（Claude Code） | 文書・UI 系：T0、T1、T2、T3、T6、T7、T8a、T8b、T9a |
| L3 実働 B | Codex 6.1 sol high（Codex CLI） | コード・検証系：T4、T5、T5b、T9b |
| L3 制作 | 制作モデル（Opus 5.5 または Fable 5.2） | T11（生成した解説ジョブの中で、`job-template/AGENTS.md` に従って制作） |
| L4 下請け | 各実働のサブエージェント | 調査の掃き出し、文字列の機械置換、テストのひな形、スクリーンショット撮影など（HN-05）。成果は実働が検品してから `REPORT.md` に載せる |

**レビューの割り当て（自己合格の禁止、HN-07）**

- G3 の判定者は L2（実装者と別セッション）。L2 は必要に応じてレビュー用サブエージェントを使ってよいが、判定と `REVIEW.md` の記名は L2 が行う。
- **交差レビュー**：危険度の高いタスクは、L2 の判定に加えてもう一方の実働製品が差分を読む（`REVIEW.md` に併記）。対象：T1（全員が依存する契約）、T4（ゲートの実装）、T5（MV と共有する `job.ts`）、T7（機能を落とす危険）。
- L2 自身が書いた成果物（本計画、DIRECTION、RETRO）は、G2 と同様に別コンテキスト（PM またはレビュー用サブエージェント）が確認する。

---

## 4. ゲート設計（AM-1 で組み直した版）

| ゲート | 時点 | 通過の条件 | 判定者 |
| --- | --- | --- | --- |
| **G1 要件** | 計画前 | 要件が判定可能、未決はオーナー判断のものだけ | L2（§2 で済） |
| **G2 計画** | 発注前 | 全 MUST 要件 → タスクの対応表（§7）、依存、各タスクの完了条件と検証コマンド、環境記録がある | 別コンテキスト（レビュー用サブエージェントまたは PM）。結果は `G2-REVIEW.md` |
| **G3 タスク** | 各タスクの `REPORT.md` 提出後 | `REPORT.md` に完了条件ごとの証拠。**レビュー者が検証コマンドを自分で再実行**。MV 非退行。範囲外の変更が無い | L2（＋交差レビュー対象は他製品の実働） |
| **G4 統合** | PR ごと（G4-α／G4-β／G4-γ） | §5.3 の統合検査がすべて合格。UI を含む PR はスクリーンショットの取得と `VERIFICATION.md` への記録まで済んでいる | L2（統合ブランチ上で再実行）。**G4-γ は L2 の成果物を含むので別コンテキスト**（T10 参照） |
| 公開（ゲートではない） | G4 合格直後 | PR を main へマージ → Pages の自動デプロイ。**オーナー目視を待たない** | L2 が実行 |
| **公開後確認（非ゲート）** | デプロイ完了後 | CI（test・build・deploy）が緑、公開 URL で S1・S3・S7 を撮り直して公開前の記録点（公開①は CP-W1、公開②は CP-A2）と一致、`VERIFICATION.md` に追記（A17）。オーナーの目視は任意で、指摘は `FEEDBACK.md` → 後続修正タスク | L2（記録のみ。不一致や破損があれば §6.4 の手順） |

**スクリーンショット記録点（いずれも待ち点ではない）**

| 記録点 | タスク | 内容 | 保存先 |
| --- | --- | --- | --- |
| CP-A0 現状記録 | T0 | S1〜S8（刷新前） | `docs/work/2026-11-13-explainer-ui-harness/screenshots/before/` |
| CP-W1 第1波記録 | T5-4（第1波で UI に影響する最後のコミット＝T5b。T9b は `tools/` のみで UI に影響しないため、CP-W1 は T9b の取り込みを待たない。記録の追記は T8a） | 解説支援を現行の見た目に配線した状態の S1〜S8（S2 は解説のたたき台、S3 は MV の既存支援が不変であること） | `screenshots/wave1/` |
| CP-A1 骨格記録 | T6 | S1・S3（骨格と配色のみ）＋`docs/DESIGN.md` 草稿 | `screenshots/cp-a1/` |
| CP-A2 刷新後記録 | T7 | S1〜S8（刷新後） | `screenshots/after/` |
| CP-P 公開後記録 | 公開後確認 | 公開 URL の S1・S3・S7 | `screenshots/public/` |

S1〜S8 の撮影条件は要件書 §3.4 の表のとおり。撮影は「Pages 用ビルドをローカルで配信し、ヘッドレス Chrome で撮る」。依存を増やさないため、Chrome の CDP を Node 組み込みの `WebSocket` で操作する撮影スクリプト `tools/ui-shots.mjs` を T0 で作る（`package.json` の依存に何も足さない）。刷新後に DOM が変わるので、T7 で同スクリプトのセレクタを更新する。

**差し戻し（HN-08）**：`REVIEW.md` の判定は「合格／差し戻し／要件差し戻し」。差し戻しには満たしていない完了条件と期待する状態を書く。同一タスクの差し戻しが3回に達したら L2 がタスクの切り方を見直すかオーナーへ上げる。要件の不備は `QUESTIONS.md` で PM へ戻し、L2 は要件を書き換えない。

---

## 5. タスク一覧（ローカル repo 系）

### 5.0 全タスク共通の完了条件

`<BASE>` は、そのタスクの発注時に L2 が `DIRECTION.md` に書く基準コミット（波のブランチの先端）。レビュー者はコミット後に再実行するので、**基準を付けない `git diff` は使わない**。

- **C-1** `npm test` が合格。
- **C-2** `npm run build -- --base=/BiimMotionWebUI/` が合格。
- **C-3** `git diff --check <BASE>...HEAD` が空。
- **C-4 MV 非退行**：既存の MV 関連テスト（`tests/job.test.ts` の MV 5件＝「MV mode preserves…」「MV ZIP includes…」「MV direction candidates…」「lyric stats…」「MV brief and AGENTS…」、`tests/ghost.test.ts` 全件、`tests/imagegen.test.ts` 全件）が**テスト側の変更なし**で通る。確認コマンド：
  ```sh
  git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts
  git diff -U0 955fa5c -- tests/job.test.ts | grep '^-[^-]'   # 出力が空であること（例外は §5.3 の許容行のみ）
  ```
- **C-5** `DIRECTION.md` の「触らない範囲」に変更が無い（`git diff --stat <BASE>...HEAD` のファイル一覧で確認）。
- **C-6** 追加した行にローカル絶対パス・メールアドレス・認証情報が無い：
  ```sh
  git diff <BASE>...HEAD | grep -nE '^\+.*([A-Za-z]:[\\]|/Users/|/home/|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,})'   # 空であること（Git Bash の grep 3.0 で動作確認済みの書き方）
  git diff <BASE>...HEAD | grep -niE '^\+.*(secret|api[_-]?key|password|bearer )'                                    # 一致は目で誤検出か確かめる
  ```
  （`noreply@anthropic.com` を含む帰属行はコミットメッセージにだけ書き、ファイルには書かない）
- **C-7** `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の既存の中身を読み込んでいない（REPORT に明記）。**例外**：検証のために自分で生成したフィクスチャに対して `validate`・`qc`・`diff`・`cmp` を実行し、その出力を見るのは可（ファイル全体をコンテキストに読み込まない）。
- **C-8** 作業記録の写しが一致：`cmp docs/work/2026-11-13-explainer-ui-harness/PLAN.md docs/requirements/ORCHESTRATION_PLAN.md`（計画を変えたタスク・ゲートのみ）。

### 5.1 タスク票

#### T0 作業基盤と刷新前記録
- **担当** 実働 A（撮影は L4 下請け可）／**依存** なし／**対応** HN-04、HN-10、HN-19、UI-A0（CP-A0）
- **対象** `.gitignore`（`.agent-work/` を追加）、`docs/work/2026-11-13-explainer-ui-harness/tasks/` の各フォルダ、`docs/work/2026-11-13-explainer-ui-harness/audits/`（監査3本の写し。`.agent-work/` は無視対象になり他の実働・レビュー者が読めないため。ローカルパス・ホームディレクトリ表記は除く。Q6 の回答で公開不可となった場合はスペース監査の写しを外し、必要箇所を `SPACE_HANDOFF.md` だけに残す）、`tools/ui-shots.mjs`（新設、依存なし）、`screenshots/before/` の S1〜S8
- **完了条件** `.agent-work/` が無視される／監査3本の写しが追跡され、C-6 に掛からない／S1〜S8 の8枚が揃う（S2 は解説の 03 付近、S5 はテスト用に作った ghost-check JSON を読み込んだ状態）／撮影手順が `REPORT.md` に再現可能な形である／`package.json` の差分なし
- **検証** `git check-ignore .agent-work/PM_BRIEF.md`、`ls docs/work/2026-11-13-explainer-ui-harness/audits`（3ファイル）、`ls docs/work/2026-11-13-explainer-ui-harness/screenshots/before | wc -l`（=8）、`git diff --exit-code 955fa5c -- package.json`、C-1〜C-6

以降、本書で「UI 監査」「解説監査」「スペース監査」と書くときは、この `audits/` の写しを指す。

#### T1 契約の固定（CONTRACT.md）
- **担当** 実働 A／**依存** なし／**対応** EX-14、EX-17、EX-18、EX-25、EX-28、AM-2 の1・3・5（交差レビュー：実働 B）
- **対象** `docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（文書のみ）
- **内容（必須の節）**
  1. ジョブ内のファイル名と必須見出し（`plan/explanation-map.md`、`plan/direction.md`、`plan/storyboard.md` の様式、`reports/qc-review.md` のチェック行の書式、`reports/delivery.md` の見出し）
  2. `plan/evidence.json` スキーマ（EX-18）と `reports/qc-<stage>.json` スキーマ（EX-14。**`style_mode` と、各ゲートの適用範囲 `scope`（`all`／`biim-scenes`）を追加**）
  3. `MotionForm` の追加項目（理解ゴール、前提と誤解、構成メモ、解説用差別化メモ、`styleMode`）と、`project.json` の追加項目（`direction.takeaway`、`direction.prior_knowledge`、`direction.outline`、`direction.differentiation`、`direction.style_mode`、`scenes[].style`）、`schema_version` の新値
  4. 様式モード契約：§1.2 の対応表の確定版、`scene.biim` との整合規則、縦出力の扱い、様式ごとの既定デザイン文の切り替え規則、`mixed` の区間上書きの書き方
  5. **Biim 固有検査の棚卸し表**：`validate.mjs`・`qc.mjs`・brief 文の各検査／指示を「全モード共通」「Biim 様式の場面のみ」に分類（例：枠の幾何・Biim 字幕仕様・`note_top`/`note_bottom` の必須性は Biim のみ、説明構造・台本とストーリーボードの整合・理解設計・ゴースト走査・字幕帯域は共通）
  6. 字幕帯域の算出規則（EX-17）の式・係数の置き場所（**単一モジュール**。推奨：`job-template/runtime/scripts/caption-capacity.mjs` を `qc.mjs` と `src/explainer-assist.ts` の両方が import）と、様式ごとの字幕領域。`tsconfig.json` は `allowJs` なし・`strict` なので、`src/` から import する場合の型の与え方（例：同名の `.d.mts` を同梱）を決め、`npm run build` が通ることを条件にする
  7. MV の不変条件と、MV 生成物の許容差分一覧（§5.3 と一致させる）
  8. AM-2 による要件書記述の読み替え一覧（§1.2 末尾の項目）
- **完了条件** 上の8節がある／T3・T4・T5・T5b・T9a が CONTRACT だけを根拠に着手できる（交差レビュー者が「不明点なし」と判定）／要件書・Amendment と矛盾しない（矛盾は `QUESTIONS.md` へ）
- **検証** レビュー者が要件 ID（EX-14/17/18/25/28、AM-2）ごとに CONTRACT の該当節を突き合わせる。C-1〜C-3

#### T2 開発ハーネス文書
- **担当** 実働 A／**依存** なし（T1 と並行可）／**対応** HN-01〜03、HN-05〜16、HN-14 の1、AM-1（新規則の明文化）
- **対象** `AGENTS.md`（ルート新設、200行以内）、`CLAUDE.md`（新設、30行以内）、`docs/WORKFLOW.md`（新設）、`README.md`（冒頭近くに「エージェントで開発する場合は AGENTS.md を読む」の1節のみ）
- **内容の要点** 2つのハーネスの区別と HN-14 の1文を冒頭に／絶対規則（HN-03 の2は **AM-1 の新規則**で書く）／層・成果物・ゲート（**G1〜G4＋公開＋公開後確認**）／受け渡しファイルの書式例（HN-09）／縮退規則（HN-11・12 は AM-1 で置換した版、HN-13 は置換後の文）／Codex 固有の注意は `docs/WORKFLOW.md` の環境の節／制作原則の本文は書かず `job-template/AGENTS.md` へリンク（HN-01）
- **完了条件** 行数上限を守る／同じ規則が複数ファイルに重複していない（レビュー者が規則ごとに所在を1つに特定できる）／「オーナー目視」をマージ・公開の条件として書いた箇所が無い
- **検証** `wc -l AGENTS.md CLAUDE.md`、`grep -n "目視" AGENTS.md CLAUDE.md docs/WORKFLOW.md`（条件としての記述が無いことを目で確認）、C-1〜C-6

#### T3 制作ハーネス文書（job-template）
- **担当** 実働 A／**依存** T1／**対応** EX-01〜13、EX-20、EX-27、EX-28、EX-31（job-template 側）、HN-14 の2、HN-15、HN-16、AM-2 の1（ストーリーボード・スタイル定義の様式記述）、EX-32 の「AGENTS.md が原則・3案・ゲート・失敗項目を含む」テスト
- **対象** `job-template/AGENTS.md`、`job-template/README.md`、`job-template/plan/templates/`（`explanation-map.md`、`direction-explainer.md`、`storyboard-explainer.md`、`evidence.example.json`、`qc-review.md`）、`tests/harness-docs.test.ts`（新設。並行する T4・T5 と `tests/job.test.ts` の追記が衝突しないよう新ファイルに置く）
- **要点** 冒頭に「`project.mode` によって読む章」と HN-14 の1文／解説章を MV 章と対称に（理解先的設計7原則、構造翻訳の対応表11行、方向性3案と6軸、スタイルと演者、制作工程14ステップ、事前・事後 QC、失敗チェックリスト23項目）／**様式モードの節**：4モードの説明、`biim` は既定だが必須ではないこと、Biim の標準（EX-07）は Biim 様式の場面にだけ適用、`mixed` の区間割り当ての書き方、非 Biim の場面の字幕・提示部品（T5b の部品名は T1 の契約に従う）／「解説動画と共通の演出」を「解説動画の演出と実装の規則」に改題し15項目を保持／レンダーゴースト節を両モード共通の章へ移し、解説字幕にも当てはまる1文を追加
- **完了条件** F9 の11文言が残り、`MV brief and AGENTS…` テストが無変更で通る／ひな形が `validate`・`qc` の検査対象パスに無い／新テストが (a) 解説章の主要見出し・23項目・様式モードの記述、(b) HN-14 の1文、(c) **生成した ZIP（MV・解説とも）で、`plan/templates/` 以外に `validate`・`qc` が検査するパス（`plan/direction.md`、`plan/explanation-map.md`、`plan/evidence.json`、`plan/script.md`、`plan/storyboard.md`、`plan/sources.md`、`plan/music-analysis.md`、`reports/*.md`）のファイルが存在しないこと**（EX-32）を表明
- **検証** `npm test`、`ls job-template/plan/`（`direction.md` 等が無いこと）、C-1〜C-6

#### T4 QC 実装と様式対応の検証
- **担当** 実働 B／**依存** T1／**対応** EX-14〜19、EX-29、EX-30、EX-32（qc・validate 部分）、EX-33、AM-2 の3（交差レビュー：実働 A）
- **対象** `job-template/runtime/scripts/caption-capacity.mjs`（新設、型は T1 の決定に従う）、`job-template/runtime/scripts/qc.mjs`（新設）、`job-template/runtime/scripts/validate.mjs`、`job-template/runtime/package.json`・`job-template/package.json`（`qc` スクリプト）、`tests/qc.test.ts`（新設。validate 部分も新ファイルに置き、`tests/job.test.ts` には追記しない）、`tools/make-fixture.ts`（解説 QC フィクスチャ：`--style=<mode>`、`--qc=pass|fail-evidence|fail-caption|fail-review`、**`--out=<dir>`**。`--out` 省略時は従来どおり `.verification/` に出し、既存の使い方を変えない）
- **コミットの分け方** T4-1 字幕帯域モジュール＋テスト（**T5 はこのコミット以降に着手**）→ T4-2 `qc.mjs`＋スクリプト＋テスト → T4-3 `validate.mjs` の解説記録と様式対応＋テスト → T4-4 フィクスチャ
- **T4-4 の扱い** EX-33 は SHOULD だが、T4・T5b・G4-α の検証コマンドがこのフィクスチャを使うため、**本計画では必須**とする
- **完了条件**
  - `qc --stage=pre|post` が要件書 §2.6 の機械判定項目を実装し、JSON 必須項目（EX-14＋`style_mode`・`scope`）を出す。不合格で終了コード1
  - テストで：根拠の無い claim／容量超過の字幕／レビュー行の欠落／免除の扱い（オーナー記載のみ有効）／MV での挙動（EX-19：合格 JSON を書かず終了コード0）／**様式**：`anime`・`motion` のジョブに Biim 固有検査が適用されず合格できる、`mixed` では `style: biim` の場面だけに Biim 検査が適用される、字幕帯域は全モードで検査される
  - `validate --final` が解説で `plan/explanation-map.md`・`plan/direction.md`・`plan/evidence.json` の欠落を拒否（EX-29）。MV の検査内容は不変。ghost 走査は助言のまま（N2、`ghost.test.ts` 無変更で合格）
  - 字幕帯域の係数は暫定値（要件書 EX-17 の試算）で実装し、still での実測確定は T11 または G4-α で行って `VERIFICATION.md` に記録
- **検証**（`$FX` は OS の一時ディレクトリ配下の作業用フォルダ。例：`FX=$(mktemp -d)`）
  ```sh
  npm test
  for s in biim anime motion mixed; do
    node --experimental-strip-types tools/make-fixture.ts --style=$s --qc=pass --out=$FX/$s
    (cd $FX/$s/smoke-video && npm install && npm run validate && npm run qc -- --stage=pre)        # 4様式とも合格
  done
  for f in fail-evidence fail-caption fail-review; do
    node --experimental-strip-types tools/make-fixture.ts --style=mixed --qc=$f --out=$FX/$f
    (cd $FX/$f/smoke-video && npm install) && (cd $FX/$f/smoke-video && npm run qc -- --stage=pre; test $? -eq 1)   # それぞれ不合格（終了コード1）
  done
  node --experimental-strip-types tools/make-fixture.ts --mv --out=$FX/mv
  (cd $FX/mv/smoke-video && npm install && npm run validate && npm run qc; test $? -eq 0)          # MV：validate 合格、qc は終了コード0で合格 JSON を書かない
  test ! -e $FX/mv/smoke-video/reports/qc-pre.json
  ```
  展開先のフォルダ名はジョブのタイトルに従う（現行のフィクスチャは `smoke-video`）。`npm install` にネットワークが要る。使えなければ §8 の縮退として記録し、テスト（`npm test`）での表明を根拠にする。C-1〜C-6。

#### T5 WebUI 解説支援（ロジックと最小限の配線）
- **担当** 実働 B／**依存** T1、T4-1（`explainerQualityChecklist` と `job-template/AGENTS.md` の一致テストだけは T3 の取り込み後に追加する）／**対応** EX-08（WebUI 側）、EX-09、EX-21〜26、EX-32（WebUI 部分）、EX-34、AM-2 の1・2・5（交差レビュー：実働 A）
- **対象** `src/explainer-assist.ts`（新設）、`src/job.ts`、`src/App.tsx`（**現行の見た目のままの最小配線**。クラスは既存を流用し、新しい見た目は作らない）、`tests/explainer.test.ts`（新設。`tests/job.test.ts` には追記しない）、`tools/ui-shots.mjs`（新しい入力の撮影手順の追加のみ）、`screenshots/wave1/`
- **コミットの分け方** T5-1 `explainer-assist.ts`＋テスト → T5-2 `job.ts`（フォーム・project・brief・`plan/outline.txt`・依頼文・`schema_version`）＋テスト → T5-3 `App.tsx` の配線（01 の新入力と `scriptStats`、03 のたたき台・解説用差別化メモ、様式モード選択、右カラムの準備度一覧と警告、失敗パターン一覧、motion-kit 数の表示を同梱テンプレートから算出する形へ変更）→ T5-4 CP-W1 のスクリーンショット（文書だけのコミット。motion-kit 数が情報ダイアログ S6 に出るので、**T5b の取り込み後に撮る**。T9b は `tools/` のみで UI に影響しないため待たない）
- **要点**
  - `explainerAxes` の「視覚様式」軸は様式モード（biim／anime／motion／mixed）と各モード内の見た目の型を持ち、`explainerCandidates` は**まず様式モードを同格に選んでから**型を選ぶ（Biim に偏らない）。`context` は人数（1人・2人・キャラなし）と向き（縦では biim／mixed を除外）
  - たたき台の採用は「デザイン方向性への追記」までとし、様式モードの選択は利用者の操作に残す。採用案と選択中の様式モードが食い違う場合は準備度一覧に注意を出す
  - `agentPromptFor` は MV の文字列をバイト単位で変えない。解説の文は様式モードを反映し、非 Biim 様式では Biim レイアウトの指示を含めない（既存の ghost-check の文は残す）
  - brief も同様：`anime`／`motion` では Biim 枠・ノート欄を使う指示を出さない
  - MV のフォーム値・`project.json`（`schema_version` 以外）・brief・`plan/lyrics.txt` を変えない
- **完了条件** EX-21 の export が揃う／テストで：全軸で相違・seed で決定・キャラ設定で軸が切り替わる・縦で biim／mixed が出ない・**400 seed で4モードの出現がそれぞれ全体の15%以上**（同格の検査）・`scriptStats` の各値・解説 ZIP の `project.json`／`brief.md`／`plan/outline.txt` に入力が反映・**解説 brief が理解先的設計の原則・方向性3案・事前／事後ゲート（`npm run qc`）・23項目を含む**（EX-32）・`anime`／`motion` の brief と依頼文に Biim 枠・ノート欄を使う指示が無い・`explainerQualityChecklist` の23項目がすべて `job-template/AGENTS.md` にも存在（定義の一致、T3 の後）・MV のプロンプトと brief が基準コミットと一致／**CP-W1**（S1〜S8、現行の見た目に配線した状態）を `screenshots/wave1/` に記録（UI を変えるので AM-1 規則2により公開前に必須）
- **検証** `npm test`、`npm run build -- --base=/BiimMotionWebUI/`、`npm run dev` で解説・MV の両モードを操作し、新入力・統計・たたき台・様式選択・準備度・失敗パターンが出ることを REPORT に記録（見た目の評価はしない）、`ls docs/work/2026-11-13-explainer-ui-harness/screenshots/wave1 | wc -l`（=8）、C-1〜C-6

#### T5b motion-kit の非 Biim 提示部品
- **担当** 実働 B／**依存** T1、T4-3（validate の様式対応）、T4-4（フィクスチャ）、T5-3（App.tsx の数の自動算出。T5b 自身は App.tsx を触らない）／**対応** AM-2 の4、EX-34（テストの同梱数）
- **対象** `job-template/motion-kit/` に非 Biim の提示部品（例：全面シーン、標準字幕、図解の全面表示。名前と API は T1 の契約に従う）、必要なら `job-template/scenes/` の非 Biim スターター（様式モードで選ばれる場合は `src/job.ts` の該当箇所のみ）、`tests/job.test.ts` の motion-kit 数（**許容される唯一の既存行の変更**）
- **完了条件** 文字を出す部品は `layers.ts` の合成レイヤー分離に従う（`ghost.test.ts` 無変更で合格）／`anime`・`motion` のフィクスチャで Biim 部品を1つも使わないシーン構成が `validate` を通る（TypeScript 検査を含む）／同梱数の表明（テスト・App.tsx の表示）が実数と一致（App.tsx は T5-3 で自動算出済み）
- **検証** `npm test`；`node --experimental-strip-types tools/make-fixture.ts --style=motion --qc=pass --out=$FX/motion` と `--style=anime` で生成し、Biim 部品を使わないデモ場面を差し込んで（差し込み手順は REPORT に記録）展開先で `npm install && npm run validate`；`git diff -U0 <BASE>...HEAD -- tests/job.test.ts | grep '^-[^-]'` の出力が motion-kit 数の1行だけ；C-1〜C-6

#### T6 UI 刷新 第1段（骨格と配色）
- **担当** 実働 A／**依存** T0（CP-A0）、**G4-α のマージ**（第2波ブランチは第1波マージ後の main から作る。これで T5-3 → T6 の App.tsx 直列化も保たれる）／**対応** UI-01〜03、UI-05、UI-06 の書体、UI-10（表示名 `BiimMotion` 確定）、CP-A1
- **対象** `src/style.css`、`src/App.tsx`（構造とクラスのみ。ロジックは変えない）、`index.html`、`docs/DESIGN.md`（草稿）
- **完了条件** 4領域の骨格・枠線・`:root` の色変数・角丸0・影なしが入っている／セクション `id`・`aria-*`・file input の覆い構造・`isMV` 分岐を保持（UI 監査 §(3) の4〜7）／`docs/DESIGN.md` 草稿に規則・色と文字の変数・禁止リスト・名称文字列の所在一覧／CP-A1（S1・S3）を記録。**オーナーの判定は待たない**
- **検証** C-1〜C-6、`node tools/ui-shots.mjs --only=S1,S3 --out=docs/work/2026-11-13-explainer-ui-harness/screenshots/cp-a1`、レビュー者は DESIGN 草稿の規則とスクリーンショットを突き合わせる

#### T7 UI 刷新 第2段（全面適用）
- **担当** 実働 A（文言の機械置換・撮影は L4 可）／**依存** T6 の G3 合格（オーナー判定ではない）／**対応** UI-01〜17、UI-C1〜C5、UI-V1〜V7、AM-2 の5（様式モード選択を刷新後の配置で、平易な説明つき）
- **対象** `src/style.css`（全面書き換え）、`src/App.tsx`（見た目と文言。ロジック変更は禁止、必要ならタスクを分けて L2 に申告）、`index.html`（favicon を枠の図案に）、`tools/ui-shots.mjs`（セレクタ更新）、`screenshots/after/`
- **完了条件** UI-C1〜C5 が機械的に合格（下の検証コマンド）／S1〜S8 刷新後を記録（加えて、S1 を下までスクロールした状態 `S1-scrolled` を UI-13 の証拠として撮る）／UI-11 の機能一覧と UI 監査 §(2) の21項目を1項目ずつ操作した記録（`tasks/T7-ui-full/UI-V7-CHECK.md`。**UI-16**：使っている文字色と地色の全組のコントラスト比の計算表、Tab キーで全操作に到達した順序の記録、`aria-*`・`role` の付与箇所が刷新前と同数以上であること。**UI-09**：`transition`・`animation` の時間がすべて 100ms 以下であること）／依存の追加なし
- **検証**
  ```sh
  # UI-C1：要件書 3.1 の英語飾りラベル・コピー・架空の枠組み・飾りの部品・特定モデル名。一致はすべて、表示されない識別子かどうかをレビュー者が目で確認し、表示文字列なら不合格
  grep -nE "MOTION JOB STUDIO|WORKSPACE|YOUR BRIEF|FROM IDEA TO MOTION|LOCAL ONLY|JOB OVERVIEW|\bLIVE\b|YOUR NEXT VIDEO|AFTER DOWNLOAD|ABOUT THE STUDIO|IDEAS DESERVE MOTION|\bADVANCED\b|\bCONTEXT\b|GHOST CHECK|\bCONCEPT\b|\bSOURCES\b|\bDIRECTION\b|\bCHARACTER\b|VOICE (&|&amp;) OUTPUT|Workspace|New motion job|Motion graphics|React Three Fiber|Opus" src/App.tsx index.html
  grep -nE "伝えたいことを|あとはOpusへ|構成も、演出も|制作のバトン|まだ名前のない|小さな出発点|まずは、動画のゴール|細部を決めすぎず" src/App.tsx index.html   # 空であること
  # UI-C2
  grep -nE "box-shadow|gradient|blur" src/style.css                                       # フォーカス表示以外が無いこと
  grep -noE "border(-[a-z]+)*-radius:\s*[^;]+" src/style.css | grep -vE "radius:\s*(0|2px|50%)$"   # 空であること
  grep -nE "font(-size)?:[^;]*(^|[^0-9.])([0-9]|1[01])(\.[0-9]+)?px" src/style.css       # 12px 未満が無いこと（13.5px などの小数は一致しない）
  grep -nE "font(-size)?:[^;]*[0-9.]+r?em\b" src/style.css                                 # 空であること（文字の大きさは px で書く規則を DESIGN.md に置く）
  # UI-C3
  grep -nE "Inter|Georgia" src/style.css index.html                                        # 空であること
  grep -nE "(href|src)=[\"']https?://|@import|url\([\"']?https?://" src/style.css index.html   # 空であること（SVG の xmlns は対象外）
  # UI-C4
  git diff 955fa5c -- package.json                                                          # dependencies の差分が無いこと
  ```
  `:root` 以外の色の直値と緑系の色は、L2 が `src/style.css` を `:root` ブロックとそれ以外に分けて HEX・`rgb(`・`hsl(`・色名を検索して確認する。C-1〜C-6。

#### T8a 文書の同期（第1波）
- **担当** 実働 A／**依存** T3、T4、T5、T5b／**対応** EX-31（ルート README）、HN-01
- **対象** `README.md`（解説モードの原則・多様性・入力支援・QC・**様式モード**を MV 節と同じ粒度で。手順の正本ではないと明記）、`VERIFICATION.md`（第1波の検証結果）
- **完了条件** README の解説節が MV 節と同粒度／制作原則の本文を複製していない（リンクのみ）／`VERIFICATION.md` に test 件数・qc の合否事例・MV 非退行の確認方法と結果・**CP-W1 の所在**
- **検証** レビュー者が README の MV 節と解説節の小見出しを並べた対応表を `REVIEW.md` に書き、欠けを確認する。`job-template/AGENTS.md` の原則の文が README に3文以上連続で複製されていないことを確認。C-1〜C-6

#### T8b 文書の同期（第2波）
- **担当** 実働 A／**依存** T7／**対応** UI 規則の正本化（`docs/DESIGN.md` 確定）、UI-10（README 見出しの名称）、HN-01
- **対象** `docs/DESIGN.md`、`README.md`（見出し・UI の説明）、`VERIFICATION.md`（UI の検証結果、UI-C・UI-V の結果、スクリーンショットの所在）
- **完了条件** `docs/DESIGN.md` の規則が実装と一致／名称文字列の所在一覧が最新／`VERIFICATION.md` に CP-A0・CP-A2 の所在
- **検証** レビュー者が `docs/DESIGN.md` の規則ごとに `src/style.css`／`src/App.tsx` の該当箇所（行番号）を対応表にして `REVIEW.md` に書く。名称の所在一覧は、旧表示文字列（`BiimMaker`、`BiimMakerWebUI`、`MOTION JOB STUDIO`、`IDEAS DESERVE MOTION.`）の不在で判定する（`grep -rn "BiimMaker\|MOTION JOB STUDIO\|IDEAS DESERVE MOTION" index.html src README.md` が 0件であること。`README.md` の `--base=/BiimMotionWebUI/`、repo 名、Pages URL は識別子として残るため除外する。なお `BiimMotion` は `BiimMotionWebUI` の部分文字列なので `grep "BiimMotion"` での確認は不可）。C-1〜C-6

#### T9a スペース版への引き渡し仕様
- **担当** 実働 A／**依存** T1、T4（`qc-*.json` の実スキーマ）／**対応** SP-01〜09（仕様）、AM-2 の6、A16
- **対象** `docs/work/2026-11-13-explainer-ui-harness/SPACE_HANDOFF.md`
- **内容** 要件書 §2.10 の仕様、T1 の契約（解説ジョブの入力項目、`style_mode`、`qc-*.json` スキーマ、`review_mode`、免除）、スペース監査の変更マップに沿った S1〜S4 の作業単位、MV 経路の不変条件（MV のハンドオフ文と `advanceStage` のエラー文をバイト単位で保つため、解説は別関数 `buildExplainerHandoff` 等に分離）、**非 Biim 様式のハンドオフ文に Biim レイアウト指示を入れない規則**、U1 の現状（監査で判明した生成方法と未決の実装主体）、SP-04 入口（T9b）の要否の結論
- **完了条件** S1〜S4 の実働が本書だけで着手できる（レビュー者が判定）／A16 の「契約が確定し引き渡されている」を満たす
- **検証** レビュー者が SP-01〜09・AM-2 の6 を1項目ずつ本書に対応付ける

#### T9b フォーム JSON からジョブフォルダを生成する入口（SHOULD、条件付き）
- **担当** 実働 B／**依存** T5、T9a の結論が「必要」／**対応** SP-04（SHOULD）
- **対象** `tools/generate-job.ts`（新設。`generateJob` と `job-template` を使い、テンプレートを複製しない）、テスト
- **完了条件** フォーム JSON（解説・MV）からジョブを生成でき、WebUI の ZIP と同内容／依存の追加なし
- **検証** `tests/generate-job.test.ts`（新設）で、同じフォーム値から `generateJob` の ZIP と CLI の出力フォルダがファイル単位で一致することを表明。`npm test`、C-1〜C-6
- **見送る場合** 理由を `RETRO.md` と `SPACE_HANDOFF.md` に記録（SHOULD のため）

#### T10 統合・実証の締め
- **担当** L2（`RETRO.md` の起案と HN-20 の確認の段取り）。`docs/WORKFLOW.md` への反映は実働 A への小タスク（T10-W）として発注。HN-20 の確認は repo だけを渡した**新しいセッション**で行う／**依存** 全タスク／**対応** HN-17〜20、A12〜A15
- **判定者** L2 自身の成果物を含むので、T10 と G4-γ の判定は**別コンテキスト**（PM、またはレビュー用サブエージェント）が行い `reviews/T10.md` に記録する
- **対象** `docs/work/2026-11-13-explainer-ui-harness/RETRO.md`、`docs/WORKFLOW.md`（T10-W）、`docs/work/2026-11-13-explainer-ui-harness/selfstart/`（新規セッションの記録：起動指示、最初の10手程度の行動、作成したファイル）
- **完了条件** A14・A15 の記録が揃う／RETRO の各項目が `docs/WORKFLOW.md` に反映済みか、反映しない理由が書かれている／HN-20 の (1)〜(3) が読み取れる
- **検証**
  ```sh
  D=docs/work/2026-11-13-explainer-ui-harness
  ls $D/ENVIRONMENT.md $D/PLAN.md $D/RETRO.md
  for t in $D/tasks/*/; do ls $t/DIRECTION.md $t/REPORT.md $t/REVIEW.md || echo "MISSING in $t"; done   # MISSING が出ないこと
  grep -l "review_mode" $D/tasks/*/REVIEW.md | wc -l                                                     # タスク数と一致
  ```

#### T11 解説動画1本の通し制作（A6）
- **担当** L3 制作（制作モデルは Opus 5.5 または Fable 5.2。使ったモデルを `delivery.md` と `ENVIRONMENT.md` に記録）。QC のレビュー判定は制作と別コンテキスト（EX-15）／**依存** G4-α の公開（新しい job-template が main にあること）／**対応** A6、EX-17 の係数の実測確定
- **内容** WebUI で解説ジョブを生成（Q5 の既定：サンプル入力、`style_mode: mixed`）→ repo の外で展開して制作 → `qc --stage=pre`／`post` 合格 → `plan/`・`reports/` に EX-10 の成果物 → 記録を `docs/work/2026-11-13-explainer-ui-harness/production/` に（動画本体はコミットしない。パスと要約、`qc-post.json` の写しのみ）
- **完了条件** `reports/qc-post.json` の `verdict` が `pass`／`review_mode` が記録されている／EX-10 の成果物が揃う／オーナーの視聴は公開後確認と同じく**任意の事後フィードバック**であり、待たない
- **検証**（`$JOB` は展開したジョブのフォルダ。判定は制作者と別コンテキストの L2 が行う）
  ```sh
  node -e "const r=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));if(r.verdict!=='pass'||!r.review_mode)process.exit(1)" "$JOB/reports/qc-post.json"
  (cd "$JOB" && npm run qc -- --stage=post)                     # 再実行しても合格
  for f in plan/sources.md plan/evidence.json plan/explanation-map.md plan/direction.md plan/script.md plan/storyboard.md reports/qc-pre.json reports/qc-review.md reports/visual-qa.md reports/ghost-check-preview.json reports/ghost-check.json reports/qc-post.json reports/delivery.md output/final.mp4 assets/audio/narration.srt; do test -s "$JOB/$f" || echo "MISSING $f"; done
  ```
- **縮退** Aivis エンジン・GPU レンダー・ネットワークのいずれかが無い場合は、何ができなかったかを記録して A6 を「未達」として `RETRO.md` に残す（合格を主張しない）

### 5.2 依存関係と実施順序

```
第1波（ブランチ feat/explainer-harness）
T0 ───────────────────────────────────────────────┐
T2 ───────────────────────────────────────────────┤
T1 ─┬─> T3 ───────────────────────────────────────┤
    ├─> T4-1 ─> T4-2 ─> T4-3 ─> T4-4 ─────────────┤
    │     └─> T5-1 ─> T5-2 ─> T5-3 ──────────────┤
    │          （T5 の一致テストは T3 の後）       │
    │        T4-3, T4-4, T5-3 ─> T5b ─> T5-4(CP-W1) ┤
    └─> T9a（T4-2 の後に確定） ───────────────────┤
                                                  └─> T8a ─> G4-α ─> 公開① ─> 公開後確認① ─> T11
第2波（ブランチ feat/ui-biim-frame、公開①の後の main から作る）
                         G4-α のマージ ─> T6(CP-A1) ─> T7(CP-A2) ─> T8b ─> G4-β ─> 公開② ─> 公開後確認②
締め（ブランチ docs/harness-retro）
                         公開後確認②、T11 ─> T10 ─> G4-γ ─> 公開③
T9b（条件付き）：T5、T9a の後。第1波に入らなければ第2波に同梱
```

- **最初に並行**：T0、T1、T2（互いに独立）。
- **T1 の後に並行**：T3（実働 A）、T4（実働 B）、T9a の下書き（実働 A。`qc-*.json` の実スキーマは T4-2 の後に確定）。T5 は T4-1 の後に実働 B が続けて行う。T4-4 と T5 の順は実働 B が決めてよいが、T5b は T4-3・T4-4・T5-3 のすべての後。
- **テストファイルの分担**：T3 は `tests/harness-docs.test.ts`、T4 は `tests/qc.test.ts`、T5 は `tests/explainer.test.ts`、T9b は `tests/generate-job.test.ts`。`tests/job.test.ts` の既存行は変えない（例外：T5b の motion-kit 数1行）。
- **`src/App.tsx` の直列化**：**T5-3 → T6 → T7** の順で、同時に2つのタスクが `App.tsx` を持たない。T6 は G4-α のマージ後に main から作る第2波ブランチで始めるので、T5-3 と重ならない。T5b と T9b は `App.tsx` を触らない（motion-kit 数は T5-3 で自動算出に変える）。T7 でロジック変更が必要と分かった場合は、T7 を止めて L2 に申告し、ロジックだけの小タスクを挟む。
- **`src/job.ts` の直列化**：T5-2 → T5b（スターター選択が必要な場合のみ）→ T9b。
- 第2波（T6・T7）と T11 は並行して進められる。

### 5.3 G4 統合検査（各 PR で L2 が統合ブランチ上で再実行）

| 検査 | G4-α（第1波） | G4-β（UI） | G4-γ（締め） |
| --- | --- | --- | --- |
| C-1〜C-8 | ○ | ○ | ○ |
| MV 非退行テスト（C-4） | ○ | ○ | ○ |
| **MV 生成物の差分検査**（手順は下） | ○ | ○ | — |
| 解説フィクスチャ：4様式で `validate` と `qc --stage=pre` の合格、不合格3事例（T4 の検証コマンド） | ○ | job-template に差分があれば ○、無ければ `git diff --stat <G4-αのマージ>...HEAD -- job-template` が空であることを記録 | 同左 |
| 短い preview のレンダーと `ghost-check -- --target=preview`（解説フィクスチャ1本） | ○（GPU・ネットワークが無ければ §8 に記録） | — | — |
| UI-C1〜C5 | C4・C5（第1波は現行の見た目に配線を足しただけ） | ○ | — |
| **スクリーンショット：公開前に取得し `VERIFICATION.md` に記録**（AM-1 規則2） | CP-W1（S1〜S8） | CP-A1、CP-A2（S1〜S8、`S1-scrolled`） | UI 差分なし（`git diff --stat` で `src/`・`index.html` が空なことを記録） |
| UI-V1〜V7（非実装者がスクリーンショットと操作記録で判定） | — | ○ | — |
| 受け入れ基準の該当項目（§7.2） | A1〜A5、A7、A16、A18〜A22 | A8〜A10、A11′、A12 | A13〜A15、A6（T11 の結果を記録） |

**MV 生成物の差分検査の手順**（`$FX` は一時ディレクトリ。基準側は基準コミットの `make-fixture.ts` が `--out` を持たないので、基準の worktree の中に出す）

```sh
git worktree add $FX/base 955fa5c
(cd $FX/base && npm ci && node --experimental-strip-types tools/make-fixture.ts --mv)   # → $FX/base/.verification/smoke-video
node --experimental-strip-types tools/make-fixture.ts --mv --out=$FX/head                # → $FX/head/smoke-video
git diff --no-index --stat $FX/base/.verification/smoke-video $FX/head/smoke-video       # 差分のあるファイル一覧を許容一覧と照合
cmp $FX/base/.verification/smoke-video/brief.md $FX/head/smoke-video/brief.md            # 完全一致
git diff --no-index $FX/base/.verification/smoke-video/project.json $FX/head/smoke-video/project.json   # schema_version の行だけ
git worktree remove $FX/base
```

依頼文（`agentPromptFor("mv")`）の完全一致は T5 のテストで表明する（ZIP に入らないため）。

**MV 生成物の許容差分一覧**（これ以外の差分があれば G4 不合格）：
- `project.json` の `schema_version` の値のみ（Q2）
- `AGENTS.md`（N1 の範囲：章の移動・共通化・案内の追加。MV 章の本文は削らない）、`README.md`（job-template 側）
- `package.json`・`runtime/package.json` の `qc` スクリプトの追加
- `runtime/scripts/` の新規ファイル（`qc.mjs`、`caption-capacity.mjs` とその型宣言）と `validate.mjs`（MV 分岐の挙動不変は MV フィクスチャの `validate` 合格で確認）
- `plan/templates/` の新規ファイル、`motion-kit/` の新規ファイル、`scenes/` の新規ファイル（MV の `scenes/index.tsx` の挙動が変わらないこと）
- `brief.md` は**完全一致**

### 5.4 コミットの切り方

既存の流儀に合わせる：英語・命令形の件名、1コミット＝1つの論理的変更、文書だけの変更は別コミット、テストは対象の変更と同じコミット、表明している数や文言（EX-34）は同じコミットで合わせる、**UI の見た目の変更とロジックの変更を同じコミットに混ぜない**。各コミットで C-1・C-2 が通ること。コミットメッセージの末尾には規定の帰属行を付ける。

| # | タスク | 件名の例 |
| --- | --- | --- |
| 1 | L2 | `Add requirements, amendments 01 and 02 and orchestration plan for explainer/UI/harness work`（`docs/requirements/2026-11-13-amendment-02.md` を含む） |
| 2 | T0 | `Ignore local agent workspace and add dependency-free UI screenshot script` |
| 3 | T0 | `Record audits and pre-redesign UI screenshots` |
| 4 | T2 | `Add root agent harness: AGENTS.md, CLAUDE.md and docs/WORKFLOW.md` |
| 5 | T1 | `Document the explainer job contract including style modes` |
| 6 | T4-1 | `Add caption capacity rule shared by QC and the WebUI` |
| 7 | T4-2 | `Add explainer QC command with pre/post gates and review records` |
| 8 | T4-3 | `Require explainer design records in final validation and scope Biim checks by style` |
| 9 | T4-4 | `Generate explainer QC fixtures for each style mode` |
| 10 | T3 | `Add explainer chapter, shared ghost chapter and record templates to the job harness` |
| 11 | T5-1 | `Add explainer direction axes, candidates, script stats and checklist` |
| 12 | T5-2 | `Carry explainer goals, outline, differentiation and style mode into jobs` |
| 13 | T5-3 | `Wire explainer assist inputs, readiness and style mode into the form` |
| 14 | T5b | `Add non-Biim presentation components to motion-kit` |
| 15 | T5-4 | `Record wave-1 UI screenshots`（T5b の後） |
| 16 | T8a | `Document explainer mode and record verification` |
| 17 | T9a | `Add space handoff spec for the explainer mode` |
| — | **G4-α → PR#1 マージ → 公開① → 公開後確認①** | |
| 18 | T6 | `Restructure the UI into the Biim frame layout with tokenized colors` |
| 19 | T6 | `Draft docs/DESIGN.md and record CP-A1 screenshots` |
| 20〜 | T7 | `Rewrite styles to the design rules` ／ `Replace decorative labels and copy with factual text` ／ `Draw the favicon from the Biim frame` ／ `Record post-redesign screenshots` |
| n | T8b | `Finalize DESIGN.md and record UI verification`（公開後確認①の記録もここに入れる） |
| — | **G4-β → PR#2 マージ → 公開② → 公開後確認②** | |
| m | T10 ほか | `Record production run, public checks and retrospective` ／ `Fold retrospective lessons into WORKFLOW.md` |
| — | **G4-γ → PR#3 マージ → 公開③** | |

---

## 6. ブランチ・push・Pages の手順（AM-1 版。目視待ちを入れない）

### 6.1 ブランチ

- 第1波：`feat/explainer-harness`（T0〜T5b、T8a、T9a）。第2波：`feat/ui-biim-frame`（T6〜T8b、**G4-α のマージ後の main から作る**）。締め：`docs/harness-retro`（公開②の後の main から作る）。
- 実働は各タスク用の作業ブランチ（例：`task/T4-qc`、波のブランチから分岐）で作業し、G3 合格後に L2 が波のブランチへ取り込む（fast-forward またはマージコミット）。`<BASE>` は分岐時の波のブランチの先端。
- **main へ直接 push しない。強制 push しない。**

### 6.2 PR とマージ

```sh
git push -u origin feat/explainer-harness
gh pr create --base main --head feat/explainer-harness --title "Explainer harness, QC and style modes" --body-file <PR本文>
gh pr checks --watch                       # PR の CI（npm ci → test → build）が緑
# G4-α を L2 が統合ブランチで再実行し、結果を docs/work/2026-11-13-explainer-ui-harness/reviews/G4-alpha.md に記録
gh pr merge --merge                         # 論理コミットを残すためマージコミット
```

- PR 本文の末尾には規定の帰属行を付ける。PR はレビュー記録と巻き戻しのための道具であり、**承認待ちの関門にしない**。G4 合格後、オーナーの目視を待たずにマージする。

### 6.3 Pages 確認（公開後確認・非ゲート）

```sh
gh run list --branch main --limit 1          # main への push で起動した Pages ワークフロー
gh run watch <run-id> --exit-status          # build と deploy が成功
node tools/ui-shots.mjs --url=https://kokuren333.github.io/BiimMotionWebUI/ --only=S1,S3,S7 --out=docs/work/2026-11-13-explainer-ui-harness/screenshots/public-<波>
```

- 比較対象：公開①は **CP-W1**、公開②は **CP-A2**。領域・文言・機能が一致することを `VERIFICATION.md` に追記（A17）。公開①の記録は第2波の PR（T8b のコミット）に、公開②の記録は締めの PR に入れる。
- オーナーの目視は任意。指摘は `FEEDBACK.md` に記録し、後続修正タスクとして同じゲートを通す。

### 6.4 公開後に問題が見つかった場合

1. 表示が壊れている・機能が落ちている：L2 が `git revert -m 1 <マージコミット>` の PR を作り、C-1・C-2 合格で即マージしてよい（**緊急時の例外**。巻き戻しは新しいコミットで行い、履歴は書き換えない）。例外を使った場合は、次のタスクの G3 で別コンテキストのレビュー者が巻き戻しの差分を事後確認し、`reviews/revert-<日付>.md` に記録する。原因は修正タスクとして再発注。
2. 見た目の好みに関する指摘：巻き戻さず、`FEEDBACK.md` → 修正タスク → G3・G4 → 再公開。

---

## 7. 要件 → タスク対応表

### 7.1 要件 ID

| 要件 | タスク | 要件 | タスク |
| --- | --- | --- | --- |
| EX-01、02 | T3 | UI-01〜03 | T6（骨格）→ T7 |
| EX-03、04 | T3（PRE-7 の機械検査は T4） | UI-04 | T7（字幕帯の様式。T6 で骨格） |
| EX-05〜07 | T3（AM-2 で EX-06・07 を読み替え） | UI-05、06 | T6 → T7 |
| EX-08 | T3（AGENTS）、T5（保存と入力） | UI-07〜09 | T7 |
| EX-09 | T3、T5 | UI-10 | T6・T7・T8b（表示名 `BiimMotion` 確定、Amendment 02） |
| EX-10〜13 | T3 | UI-11〜17 | T7 |
| EX-14〜16 | T4（スキーマは T1） | UI-C1〜C5 | T7 実装、G4-β 判定 |
| EX-17 | T4-1（式）、T1（置き場所）、T11（係数の実測） | UI-V1〜V7 | T7 記録、G4-β 判定 |
| EX-18 | T1（スキーマ）、T3（ひな形）、T4（検査） | UI-V8 | 公開後確認（任意、AM-1） |
| EX-19 | T4 | HN-01〜03 | T2（HN-03 の2は AM-1 版） |
| EX-20 | T3（AGENTS）、T5（定義・UI・brief・一致テスト） | HN-04 | T0、L2（BRIEF） |
| EX-21〜26 | T5 | HN-05〜13 | T2（HN-11〜13 は §1.1 の置換版）、本計画で運用 |
| EX-27、28 | T3 | HN-14 | T2（ルート）、T3（job-template） |
| EX-29、30 | T4 | HN-15、16 | T2、T3 |
| EX-31 | T3（job-template）、T8a（ルート） | HN-17〜20 | T10（全タスクで記録） |
| EX-32 | T3・T4・T5（各部分） | SP-01〜03、05〜09 | T9a（仕様）、S1〜S4（実装） |
| EX-33（SHOULD） | T4-4 | SP-04 | T9a（結論）、T9b（SHOULD） |
| EX-34 | T5-3（表示の自動算出）、T5b（テストの数） | AM-1 | 本計画 §1.1・§4・§6、T2 |
| AM-2 の1 | T1、T3、T5 | AM-2 の2 | T5 |
| AM-2 の3 | T1、T4 | AM-2 の4 | T5b |
| AM-2 の5 | T5、T7 | AM-2 の6 | T9a、S1〜S3 |
| AM-2 の7 | 全タスク（C-4、§5.3） | AM-3（決着：表示名 `BiimMotion`、Amendment 02） | T6・T7・T8b、Q3 |

### 7.2 受け入れ基準

| 基準 | 担保するタスク／ゲート |
| --- | --- |
| A1 解説章とゴースト章の位置 | T3、G4-α |
| A2 解説モードの入力支援が MV と並んで欠けない | T5（機能）、T7（刷新後も維持）、G4-α・β |
| A3 ZIP への反映 | T5、G4-α |
| A4 qc の合否がテストで示される | T4、G4-α |
| A5 validate --final が解説記録の欠落で失敗 | T4、G4-α |
| A6 解説1本の通し制作 | T11（オーナーの視聴は事後・任意） |
| A7 MV 非退行 | 全タスク C-4、G4 の MV 生成物差分検査 |
| A8 UI-C1〜C5 | T7、G4-β |
| A9 S1〜S8 刷新前後の対、UI-V1〜V7 | T0、T7、G4-β |
| A10 UI-11 の全機能の操作記録 | T7（`UI-V7-CHECK.md`） |
| A11′（AM-1 で置換） | CP-A1・CP-A2 の記録＋G4-β の非実装者判定 |
| A12 ハーネス文書の分担・重複なし | T2、T6・T8b（DESIGN.md）、G4-β |
| A13 HN-14 の1文と2つのハーネスの区別 | T2、T3 |
| A14 作業記録一式 | 全タスク、T10 |
| A15 新規セッションでの自走確認 | T10 |
| A16 スペース版の仕様と契約の引き渡し | T9a |
| A17 公開サイトの確認と VERIFICATION 追記 | 公開後確認（非ゲート） |
| **A18（AM-2 由来）** WebUI で様式モードを選べる（平易な説明、既定 biim、固定しない）。`project.json`・brief に `style_mode`、mixed では場面ごとの様式 | T5、T7 |
| **A19（AM-2 由来）** 非 Biim 様式に Biim 固有検査で不合格を出さない。mixed では Biim 区間だけに適用（テストで表明） | T4 |
| **A20（AM-2 由来）** motion-kit に非 Biim 提示部品があり、Biim 部品ゼロのジョブが validate を通る | T5b |
| **A21（AM-2 由来）** たたき台の候補で4つの様式モードが同格に出る（テストで表明） | T5 |
| **A22（AM-2 由来）** スペース引き渡し仕様に `style_mode`、非 Biim のハンドオフに Biim レイアウト指示を入れない規則 | T9a |

A18〜A22 は要件書に無い。Amendment 01 の AM-2 を判定可能にするために L2 が導出した基準であり、要件の追加ではなく AM-2 の検証方法である（PM が異なる基準を望む場合は `QUESTIONS.md` で差し戻してよい）。

---

## 8. 環境フォールバック（実働の起動時に使う手順）

### 8.1 起動時チェック（各セッションの最初に行い、`ENVIRONMENT.md` の表に1行追記）

1. 自分の層（L1〜L4）を `DIRECTION.md` または起動指示から判定する。
2. 次を確かめて記録する：エージェント製品とモデル・effort／サブエージェントを起動できるか／コマンドを実行できるか（`node -v`、`npm test` が動くか）／対話できるか／ネットワーク（npm install、Pages の閲覧）／ヘッドレス Chrome／Aivis エンジン（T11 のみ）／GPU レンダー（T11・G4-α の preview のみ）。
3. 下の縮退レベルを決め、`ENVIRONMENT.md` に「レベル・理由・自己判定になるゲート」を書いてから作業に入る。

### 8.2 縮退レベル（下の層から統合する。HN-11）

| レベル | 状況 | 運用 | 自己判定になるゲート |
| --- | --- | --- | --- |
| 0 | 標準（Fable PM、Opus high L2、Opus medium／Codex の実働、サブエージェントあり） | 本計画どおり | なし |
| 1 | サブエージェントが使えない | L4 を省き実働が小タスクを順に処理 | なし（L2 のレビューは別セッションで維持） |
| 2 | 実働の製品が片方しか無い（例：Codex が無い） | すべての L3 を残った製品が担当。交差レビューは「別セッションの同一製品」に置き換え | なし（別セッションなら independent） |
| 3 | モデルが1つだけ・セッションは分けられる | 同じモデルが層ごとに別セッションで順に務める。成果物ファイルは省かない | なし（別セッションなら independent と記録してよい） |
| 4 | セッションも分けられない（1セッションで全層） | 段階を区切り、各段階の成果物ファイルを書き終えてから次へ。レビューは差分を読み直し検証コマンドを再実行して行う | **G2・G3・G4 すべて `review_mode: self`** |
| 5 | コマンドを実行できない | テスト・ビルドの合格を主張しない。差分を提出し、実行できる環境での検証を G3 の条件として残す | 実行を要するゲートは「未検証」 |
| — | Fable が使えない | 使える最上位モデルが PM を**L2 と別セッション**で務める | — |
| — | Claude Code でも Codex でもない | `README.md` → `AGENTS.md`（T2 前は要件書 §4）の順に読み、同じファイル様式に従う。モデル切り替え不可ならレベル3／4 | — |

### 8.3 どの縮退でも守る最低限の関門（HN-12 を AM-1 で置換した版）

1. 要件が実装より前にファイルとして存在する。
2. `npm test` と `npm run build -- --base=/BiimMotionWebUI/` が通る（実行できない環境では未検証と明記し、マージしない）。
3. MV の非退行（既存の MV 関連テストが無変更で通る）。
4. UI を変えた場合は、スクリーンショットを取得して `VERIFICATION.md` に記録するまで main に入れない（**オーナーの目視は待たない**）。
5. 縮退したこと・自己レビューになったゲートを `ENVIRONMENT.md` と該当の `REVIEW.md` に記録する。自己レビューであってもオーナー目視の強制はしない（HN-13 置換）。

### 8.4 縮退記録欄（実際に縮退した場合に追記する。正本は `ENVIRONMENT.md`、ここには要約）

| 日時（JST） | タスク／ゲート | 縮退レベル | 理由 | 影響（自己判定になったゲート、未検証の項目） | 記録者 |
| --- | --- | --- | --- | --- | --- |
| 2026-11-13 | L1 PM（初回起動） | — | 起動スクリプト経由で `claude-fable-5-2` が未認識となり失敗。別の起動方法で再実行し Fable 5.2 で完了 | なし（PM は Fable 5.2 のまま） | L2 |
| | | | | | |

---

## 9. スペース版 MV-E2E 系統（別系統。スペースは artifact 編集経由）

この系統は**このリポジトリを編集しない**。スペース「MV-E2E」の編集は Muse の artifact 編集で行い、記録だけを `docs/work/2026-11-13-explainer-ui-harness/space/` に残す。本作業の受け入れ条件は A16（T9a）までで、S1 以降の完了は含めない（N3）。

| ID | 内容 | 担当 | 依存 | 完了条件 | 検証 |
| --- | --- | --- | --- | --- | --- |
| **S0** | U1 の確認（実装主体・時期）と、スペース編集権を持つ実働の確保 | オーナー／L2 | T9a | `QUESTIONS.md` Q4 に回答、または「未定」のまま S1 以降を保留と記録 | — |
| **S1** | スキーマと移行：`JOB_KINDS`、`jobs.job_kind`（既定 `mv`）、`jobs.style_mode`（解説のみ、nullable）、解説入力カラム（nullable）、`directions` の解説軸（スペース監査 S6 の案 (a) を推奨。最終判断は SPACE_HANDOFF の制約の範囲で実働が行い記録）、成果物 kind のモード別シード（TuneCore 2点は解説に出さない）。**新規 `0007` に集約し、`0001`〜`0006` は変えない** | スペース側実働（artifact 編集可能なエージェント） | S0、T9a | 既存 MV 行が移行後に同一挙動。移行は**本番 DB のバックアップを取ってから**適用し、非対話の場合は適用の手前で止めて報告 | 移行前後で MV ジョブの `getJob` 応答を比較 |
| **S2** | アクション：`job_kind`・`style_mode` の応答への追加、解説ジョブ作成、解説の方向性3案（6軸、様式モードを候補対象に含め同格）、解説設計パッケージ（`style_mode`、mixed の区間別様式）、`advanceStage` の解説ゲート（**`reports/qc-*.json` の `verdict` を読む**、`review_mode: self` の表示用情報、免除はオーナー操作のみ）、`buildExplainerHandoff`（別関数。MV の `buildHandoff` は不変。**非 Biim 様式では Biim レイアウト指示を含めない**）、開始前の環境確認（SP-05） | 同上 | S1 | MV のハンドオフ文と `advanceStage` のエラー文が変更前とバイト一致 | 変更前に MV ジョブのハンドオフ文を保存し、変更後と比較 |
| **S3** | クライアント：ジョブ種別の切り替え、解説の投入フォーム（SP-02）、様式モード選択（平易な説明、既定 biim、固定しない）、方向性カードの軸ラベル、解説設計の表示、QC パネルの解説版、成果物表示、下書き保持の版上げ | 同上 | S2 | MV の投入と詳細画面が不変 | 画面記録（スクリーンショットは証拠記録。オーナー目視は待たない） |
| **S4** | `DATA-PLAN.md` の追記、MV 非退行の総合確認、公開 | 同上 | S3 | MV ジョブを1件流して全ゲートが従来どおり | 記録を `space/S4-REPORT.md` に |
| **S5** | スペース系統の締め（`RETRO.md` への反映） | L2 | S4 | 記録が揃う | — |

- 各 S タスクも G3（実装者と別コンテキストのレビュー）を通す。`DIRECTION.md`・`REPORT.md`・`REVIEW.md` は `docs/work/2026-11-13-explainer-ui-harness/space/S<n>-*/` に置く（このリポジトリへの記録コミットは L2 が行う）。
- スペースの公開も AM-1 と同じ考え方（機械的確認＋非実装者レビューで公開、オーナー目視は待たない）で扱う。ただし本番 DB の移行は取り消しにくい操作なので、バックアップを前提とし、非対話では手前で止める。

---

## 10. L2 の次の手順

1. G2 は合格（2回目）。N1〜N4 は反映済み。
2. 本書・BRIEF・ENVIRONMENT・QUESTIONS・G2-REVIEW と要件書・Amendment を、第1波ブランチの最初のコミット（§5.4 の1）にする。
3. T0・T1・T2 の `DIRECTION.md`（`<BASE>`、触ってよい範囲／触らない範囲、完了条件、検証コマンド、依存、禁止事項）を本書のタスク票から起こし、実働 A に発注（3本並行可）。
4. T1 の G3 合格後、T3（実働 A）と T4（実働 B）を発注。T4-1 の取り込み後に T5 を実働 B へ。
5. 以後 §5.2 の順に発注・判定し、波ごとに §6 の手順で公開する。
6. 各セッションの実担当・縮退を `ENVIRONMENT.md` に追記する。
