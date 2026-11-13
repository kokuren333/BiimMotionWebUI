# スペース版 MV-E2E 監査 — 解説動画モード新設の現状と必要作業

- 対象: Muse スペース「MV-E2E」ソース（監査者環境上のパスは写しでは省略）
- 監査範囲（読み取りのみ、編集なし、`app.db` 未接触）:
- `client/src/App.tsx`（単一ファイル、約 2,000 行超）
- `client/src/api.ts`（33 行、型プロキシのみ）
- `server/src/actions.ts`（約 1,500 行、アクション 17 本）
- `server/src/schema.ts`（193 行）
- `drizzle/0001`〜`0006` + `drizzle/meta/_journal.json`
- 参考: `DATA-PLAN.md`、`space.json`（slug `mv-e2e`、runtime typescript）
- 監査日: 2026-11-13
- 結論要旨: **現状は「モード」という概念自体が存在しない完全な MV 専用実装**。ジョブ種別カラムが無く、入力・方向性・設計・QC・成果物・ハンドオフの全層が MV 前提でハードコードされている。ただし基盤の型（方向性選択ゲート、QC ゲート、制作ラン記録、成果物スロット、分割アップロード＋冪等作成、制作モデル選択、spawnTask ハンドオフ）はモード非依存にできている部分が多く、**新テーブル乱立ではなく `jobs` への識別子追加＋分岐追加**で新設するのが最小コスト。最大の摩擦は (1) `jobs.lyrics` / `jobs.audio_filename` の NOT NULL、(2) `directions` の MV 6 軸カラム全 NOT NULL、(3) QC が歌詞レイヤー専用文言・専用ルール定数に直結している点、の 3 つ。

---

## 1. 現状の全体像

### 1.1 ジョブ種別・入力

| 項目 | 現状 |
|---|---|
| ジョブ種別 | **無し**。`jobs` テーブルに kind / mode / type カラムは存在しない。全行が暗黙に MV |
| 入力（3 点固定） | SUNO mp3（必須）＋対応歌詞（必須）＋備考メモ（空可）。`DATA-PLAN.md` に「3 入力のみ」が明記され、UI コピーも `NEW JOB — 3 INPUTS ONLY` |
| ジョブ作成経路 | 2 系統: 旧 `createJob`（mp3 全体を base64 一括 POST、互換のため残存）と現行 `createJobFromUpload`（`uploadAudioChunk` で 192 KiB チャンク分割 → 連結） |
| 冪等性 | `createJobFromUpload` は `jobs.client_token`（`0006` で追加、nullable）で冪等。同一 token があれば既存ジョブを返し重複登録しない |
| タイトルの由来 | `audio_filename` から拡張子を除いた文字列。音源ファイル名依存 |
| 音源の保管 | 本体は `ctx.blobs`（キー `jobs/audio/{timestamp}-{filename}`）、DB には `audio_blob_key / audio_filename(NOT NULL) / audio_mime / audio_size` のみ |
| 下書き保持 | クライアント `localStorage` キー `mv-e2e-intake-draft-v1` に歌詞・メモ・uploadId・clientToken・音源名/サイズを保持、再選択したファイルが name+size 一致で同一アップロードとして再開 |

### 1.2 工程ステージ列

`server/src/schema.ts` の `STAGES`（8 段、順序が `advanceStage` の前進判定の正本）:

```
received → awaiting_direction → direction_confirmed → biim_designed
→ biim_job_generated → in_production → checking → completed
```

- クライアント `App.tsx` 冒頭の `STAGES: {key,label}[]` に日本語ラベルを**複製**して保持（受付／方向性選択待ち／方向性確定／Biim入力設計／Biimジョブ生成／PC展開・制作／チェック／成果物完成）。Stepper はこの複製で描画。
- 手動で進められるのは後半 4 段のみ（`PRODUCTION_STAGES = [biim_job_generated, in_production, checking, completed]`、クライアント・サーバ双方に同じ部分集合が存在）。
- ステージ名自体に `biim_` が埋め込まれているが、工程の骨格（受付→方向性→設計→ジョブ生成→制作→チェック→完了）は解説でもそのまま使える形。

### 1.3 方向性 3 案生成（`generateDirections`）

- 呼び出し条件: ジョブ存在＋`selected_direction_id == null`（選択済みならエラー「方向性は既に選択済みです」）。再生成は可能で `generation = max+1`、旧世代は DB に残るが `getJob` は最新世代のみ返す。
- 入力（`ctx.inference.complete` への単一プロンプト連結）:
1. 役割文「MV の企画設計者。方向性候補をちょうど 3 案」
2. 定数 `PHILOSOPHY`（後述）
3. 多様性必須条件: 配色／タイポグラフィ様式／モーションの言語／構図／質感／テンポ感の **6 軸中 3 軸以上を互いに変える**、色違い禁止
4. 曲名（ファイル名由来 `job.title`）、備考メモ、**歌詞先頭 6,000 字**（`job.lyrics.slice(0,6000)`）
5. 再生成時: 旧候補タイトル一覧を「似た組み合わせを避ける」として付加
- 出力スキーマ: `candidates` 配列（長さちょうど 3）× 9 フィールド
`title / description / palette / typography / motion_language / composition / texture / tempo / differentiation`
- 保存先: `directions` テーブル（上記 9 フィールドが**全て NOT NULL カラム**、英語スネーク→キャメル変換のみ）。
- 選択: `selectDirection` が所有権（`dir.jobId === job_id`）を検証し `selected_direction_id` を記録して `direction_confirmed` へ前進。**選択ゲート自体（未選択だと先へ進めない）はモード非依存の仕組み**。

### 1.4 Biim 入力設計パッケージ（`draftBiimDesign`）

- 前提: 方向性選択済みでないとエラー。結果は JSON 文字列で `jobs.biim_design`（TEXT カラム 1 本）に保存し、ステージを `biim_designed` へ。
- 形状 `biimDesignShape`（zod）:

| フィールド | 内容（MV 版） |
|---|---|
| `video_title` | 動画タイトル案 |
| `concept` | MV で表現したいこと（500 字以内指示） |
| `lyrics_approach` | 歌詞の扱い（歌詞を字幕でなく構図の一部としてどう見せるか、500 字以内） |
| `direction_summary` | デザイン方向性サマリ（700 字以内） |
| `differentiation_memo` | 差別化メモ（300 字以内） |
| `material_plan` | 素材方針（700 字以内、素材種別ごとに箇条書き） |
| `seedance_policy` | 動画生成 AI（Seedance 等）方針。既定オフ、メモで明示時のみ（250 字以内） |
| `scene_outline[]` | `{section, visual, lyric_focus}` の配列。セクション見出し単位 |
| `failure_checks[]` | 失敗パターンチェック最大 8 件。うち**最低 2 件は歌詞レイヤー専用**（事前＝残像を生む設計でないか／事後＝全編フレーム解析）とプロンプトで強制 |

- 生成方式（重要な流用資産）: 1 回の推論ではタイムアウトするため、**並列分割推論**。①コンセプト系 5 フィールド、②素材方針＋Seedance 方針、③失敗チェック、④歌詞チャンクごとのシーン構成、を `Promise.all` で同時発射しマージする。
- 歌詞分割 `splitLyricsChunks`: `[Section]` 見出しでブロック化し、約 4 ブロック／約 1,800 字ごとにチャンク化。見出しが無ければ文字数フォールバック。
- テキスト化 `designToText` が**サーバ（`buildHandoff` 用）とクライアント（コピーボタン用）に二重実装**されている。変更時は両方直す必要がある既存の負債。

### 1.5 QC ゲート（歌詞レイヤー品質チェック）

- 保存: `jobs.pre_check_status / post_check_status`（enum `pending | passed | needs_fix`、`0004` で追加、既定 `pending`）＋ `pre_check_detail / post_check_detail`（自由文）。
- ルール定数 `LYRIC_QC_RULES`（actions.ts 内）: 「発狂」Bridge の実害（プレビューで見えず final でのみ歌詞がゴースト・点滅、通常フリッカー指標で検出不能）を根拠とする必須規程。
- 事前（レンダー前）5 項目: 行表示区間の重なり／退場が不透明度残留でなく完全アンマウントか／トグル・二重描画の有無／歌詞帯 z-order と暗部での分離／セクション・行境界での意図せぬ同時表示。
- 事後（final 後）: **全編・歌詞帯クロップのフレーム単位解析**（フレーム間差分・テンプレート照合等、再現可能な方法と対象フレーム数を detail に書く）。スポット静止画・全画面フリッカー指標だけでの合格を明示禁止。`needs_fix` なら修正版を作り全編解析を再実行、`passed` まで完了不可。
- 記録アクション: `reportQualityCheck(job_id, check_type: pre|post, status: passed|needs_fix, detail必須)`。最新 `production_runs.log` にも結果行を追記する。`updateProductionProgress` からも pre/post フィールドを同時更新可能。
- `advanceStage` の拒否条件（サーバ側強制、クライアントのボタン無効化はその鏡像）:

| 遷移先 | 拒否条件 |
|---|---|
| （共通） | 前進のみ。現在以下への遷移は「ステージは前進のみ可能です」 |
| `in_production` | `pre_check_status!== passed` で拒否。`pending`（未実施）と `needs_fix`（要修正）で別文面のエラー |
| `checking` | `pre_check_status!== passed` で拒否 |
| `completed` | `pre!== passed` 拒否／`post!== passed` 拒否／成果物に 1 件でも `pending` があれば拒否（3 条件の複合） |

- クライアント: `QualityCheckPanel / QualityCheckRow` が事前・事後 2 行を表示（チェック観点の箇条書きはコンポーネント内にハードコード）、手動記録も可能。`JobCard` にも事前／事後ステータス要約が出る。

### 1.6 成果物

`DELIVERABLE_KINDS`（7 種）。うち `FINAL_DELIVERABLE_KINDS` 5 種がジョブ作成時に `pending` でシードされ、残り 2 種は制作ランがオンデマンド作成する。

| kind | 区分 | 用途・備考 |
|---|---|---|
| `final_video` | シード 5 点 | 完成 MV ファイル |
| `youtube_thumbnail` | シード 5 点 | YouTube サムネ。クライアントで画像プレビューあり |
| `youtube_metadata` | シード 5 点 | タイトル・概要欄・タグのテキスト保存専用 UI あり |
| `tunecore_jacket` | シード 5 点 | TuneCore 用ジャケ写 |
| `tunecore_wav` | シード 5 点 | TuneCore 用 WAV（PC パス記録が主） |
| `kokuren_future` | 制作記録 | PC `kokuren_future` への配置パス＋採番メモ。`recordProductionResult` でのみ作成 |
| `biim_job` | 制作記録 | 生成した Biim ジョブの ID・URL・出力先。`recordProductionResult` でのみ作成 |

- 汎用更新: `setDeliverable(job_id, kind, status?, external_path?, text_content?, data_base64?, filename?, mime?)`。ファイル添付時は blob 保存＋自動 `done`。
- クライアント表示メタ `DELIVERABLE_META`（label/hint）は kind ごとに App.tsx にハードコード。画像判定 `isImage` も kind 名の列挙で分岐。

### 1.7 制作モデル選択（`production_model`）

- `PRODUCTION_MODELS = ["opus_5_5", "fable_5_2"]`（`0005` で `jobs` と `production_runs` の両方に追加、既定 `opus_5_5`）。
- `setProductionModel` でジョブ単位に変更。`startAutoProduction` 時にジョブの選択をランへ**スナップショット**し、実行中ランのモデルは不変（変更は次回開始から、と UI 明記）。
- ラベル `PRODUCTION_MODEL_LABEL` はサーバ・クライアントに二重定義。ラベルがハンドオフ文と spawnTask 指示文の両方に埋め込まれる。
- **この仕組みは完全にモード非依存**。新設される階層ワークフロー（Fable=PM／Opus高=オーケストレーター等）の「オーケストレーター」概念とは別物で、現状は「PC 側制作指揮モデルの 2 択」でしかない点に注意（解説モードでも同列で扱うのか、PM/オーケストレーター分業まで広げるのかは要件側の判断事項）。

### 1.8 自動制作ハンドオフ（`buildHandoff` / `startAutoProduction`）

- `startAutoProduction` 前提: 方向性選択済み。既に `running | awaiting_claude` のランがあれば新規作成せず `already_active: true` を返す。
- 処理: `production_runs` 行を作成（status=running、モデルスナップショット）→ `buildHandoff(job, dir, design, runId, model)` でハンドオフ全文を生成し `handoff_text` に保存 → `ctx.agent.spawnTask` で背景エージェントを起動（`expectsAction: "updateProductionProgress"`、`dedupeKey: mv-e2e-production-job-{job.id}`）→ 成功で `awaiting_claude`、失敗で `blocked`＋再開案内 note。
- `buildHandoff` の構造（単一テキスト、区切りは `■` 見出し）:

```

対象ジョブ #{id}「{title}」／音源ファイル名＋audio_url 取得方法の注記
制作ランID（報告先 run_id の指定）
制作オーケストレーター: {モデルラベル}（勝手に切り替えるな）
■ 選択済みの方向性 … direction 9 フィールド全展開
■ Biim入力設計パッケージ … designToText(design)。未生成なら「draftBiimDesign を先に実行せよ」
■ 歌詞 … job.lyrics 全文
■ 備考メモ（ユーザー）
PHILOSOPHY（思想先的の原則 7 項目）
■ 実行手順 1〜6（+4a/5a）
1. 設計未生成なら draftBiimDesign
2. PC の kokuren_future を参照し採番・フォルダ作成・素材配置 → updateJobMeta + recordProductionResult(kokuren_future)
3. その時点の BiimMotionWebUI に合わせ Claude 経由で Biim ジョブ生成 → recordProductionResult(biim_job) + advanceStage(biim_job_generated)
4. 事前チェック必須 → reportQualityCheck(pre)。passed でないと in_production に進めない旨
4a. advanceStage(in_production) 後に素材生成（既定 Codex CLI + imagegen、Seedance はメモ明示時のみ）とレンダー
5. advanceStage(checking)。品質検証（面白いか）と構造検証（仕様通りか）を区別
5a. 事後チェック必須（全編・歌詞帯フレーム解析）→ reportQualityCheck(post)
6. 成果物 5 点を setDeliverable で登録。全完了＋post passed のときのみ advanceStage(completed) + run を done
LYRIC_QC_RULES 全文
詰まった場合: updateProductionProgress(status="blocked")＋再開に必要なユーザー行動を note に具体的に
```

- 進行報告系: `updateProductionProgress`（status/current_step/note/log_entry＋QC 同時更新、ログは JST タイムスタンプ付き追記）、`recordProductionResult`（`kokuren_future | biim_job` の 2 kind 限定＋ project 番号/フォルダ書き戻し）、`updateJobMeta`、`deleteJob`（directions/deliverables/runs を手動カスケード削除）。
- クライアントはランが `running | awaiting_claude` の間 15 秒ポーリング。`ProductionRunView` で status/current_step/note/log/handoff 全文を表示。

### 1.9 アクション一覧（17 本）とモード依存度

| アクション | 役割 | モード依存 |
|---|---|---|
| `createJob` | 旧一括作成 | MV 固有（mp3+歌詞前提） |
| `uploadAudioChunk` | 分割アップロード段取り | 非依存（バイト列汎用） |
| `createJobFromUpload` | 分割確定＋冪等作成＋成果物シード | 成果物シード部分が MV 固有 |
| `listJobs` / `getJob` | 一覧・詳細（zod レスポンス形状固定） | 形状に kind を足す必要あり |
| `generateDirections` | 方向性 3 案生成 | MV 固有（プロンプト・6 軸・歌詞入力） |
| `selectDirection` | 方向性選択ゲート | **非依存** |
| `draftBiimDesign` | Biim 設計パッケージ生成 | MV 固有（形状・プロンプト・歌詞チャンク） |
| `updateJobMeta` | title/project 番号/フォルダ/制作メモ | ほぼ非依存 |
| `advanceStage` | ステージ前進＋QC ゲート強制 | ゲート文言・条件が歌詞 QC 固有 |
| `setDeliverable` | 成果物汎用更新 | **非依存**（kind enum のみ MV） |
| `setProductionModel` | 制作モデル選択 | **非依存** |
| `startAutoProduction` | ラン作成＋ハンドオフ＋spawnTask | ハンドオフ中身が MV 固有、枠は非依存 |
| `updateProductionProgress` | ラン進行報告＋QC 同時更新 | QC フィールド名が pre/post 汎用なのでほぼ非依存 |
| `reportQualityCheck` | QC 記録＋ランログ転記 | 型は非依存、ラベル文が歌詞専用 |
| `recordProductionResult` | kokuren_future / biim_job 記録 | 前者は MV 寄り、後者は非依存 |
| `deleteJob` | 一括削除 | **非依存** |

### 1.10 クライアント（App.tsx）の構成

単一ファイル内に同居: `App`（一覧⇔詳細の切替のみ、ルーター無し）／`HomeView`（投入フォーム＋ジョブ一覧）／`JobCard`／`JobDetailView`（詳細画面の全セクション）／`PipelineStepper`／`DirectionCard`／`BiimDesignView`／`ProductionModelPicker`／`ProductionRunView`／`QualityCheckPanel`・`QualityCheckRow`・`QualityCheckBadge`／`ProductionMeta`／`DeliverableRow`。

詳細画面のセクション順: 方向性の提案と選択 → Biim入力設計 → 自動制作（モデル選択＋ラン表示）→ 品質チェック（歌詞レイヤー）→ 制作管理（PC側）＋ステージ前進ボタン → 成果物・制作記録 → 投入内容（歌詞・メモのアーカイブ）→ 削除。

`api.ts` は `createActionClient<typeof Actions>()` の型プロキシのみで、**アクション追加・変更は型が自動伝播する**ため原則編集不要。

---

## 2. 解説モード新設時のファイル単位変更マップ

凡例: = 無いと解説ジョブが成立しない／= 既存 MV 経路と共存させる条件分岐／= 品質向上のための追加。

### 2.1 `server/src/schema.ts`

| # | 箇所 | 変更内容 | 種別 |
|---|---|---|---|
| S1 | 定数群（`STAGES` の近傍） | `JOB_KINDS = ["mv", "explainer"] as const` と `JobKind` 型を追加 | |
| S2 | `jobs` テーブル | `jobKind: text("job_kind", {enum: JOB_KINDS}).notNull().default("mv")` を追加（既存行は全て MV として移行） | |
| S3 | `jobs.lyrics` / `jobs.audioFilename` | 現状どちらも `.notNull()`。解説入力（台本・テーマ・資料）では歌詞が無く音源も任意/BGM 別扱いになるため、**nullable 化するか、解説用入力カラムを別途追加するか**の設計判断が必須。推奨: 既存カラムは MV 用として温存しつつ NOT NULL を外し、解説用に `topic`（何を解説するか）／`script`（台本・ナレーション原稿、歌詞の対応物）／`sourceMaterial`（根拠資料・URL・指示文）／`targetNote` 対象・尺等のカラムを nullable で追加。`memo` は両モード共通で流用可 | |
| S4 | `jobs.biimDesign` | 解説設計パッケージの格納先を決める。案 A: 同カラムに kind で判別できる JSON を格納（移行ゼロ、ただし `getJob` の zod 検証が判別共用体になる）。案 B: `explainerDesign` カラム新設（検証が単純、カラム増）。どちらでも**設計形状は MV 版と別物**になる（§2.3 D2 参照） | |
| S5 | `jobs` の QC カラム | `pre/post_check_status/detail` は名前が汎用なので**カラム追加なしで流用可能**。ただし意味（チェック内容）は kind で切り替わる。解説側でチェック軸を 2 本以上に増やす場合のみ新カラム/新テーブル（例 `checks` テーブル化）が必要 | |
| S6 | `directions` テーブル | **一番硬い箇所**。`palette / typography / motion_language / composition / texture / tempo` が全て NOT NULL で MV の 6 軸に固定。解説版の方向性軸（例: 説明構造の型／図解様式／ナレーションと画面の主従／テロップ密度／ペース配分／キャラの関与度——要件側で確定）が違うなら、(a) MV 軸カラムを nullable 化＋解説軸カラム追加、(b) 軸を JSON カラム `axes` に一般化、(c) 解説専用 `explainer_directions` テーブル新設、のいずれかが必要。既存行・既存 zod（`directionShape`）への影響が最も小さいのは (a) | |
| S7 | `DELIVERABLE_KINDS` / `FINAL_DELIVERABLE_KINDS` | 解説用 kind を追加し、シード集合を kind 別に分ける。追加候補: `explainer_script`（確定台本）、`evidence_notes`（根拠・出典メモ）、`subtitle_data`（字幕データ SRT/VTT/ASS 等）、必要なら `narration_audio`。`final_video / youtube_thumbnail / youtube_metadata / biim_job` は両モード共通で再利用し、**`tunecore_jacket / tunecore_wav` は MV 専用として解説のシードから除外**。`FINAL_DELIVERABLE_KINDS` は `MV_FINAL_DELIVERABLE_KINDS` と `EXPLAINER_FINAL_DELIVERABLE_KINDS` に分割し、作成時に kind で選択 | |
| S8 | `productionRuns` | 変更不要（`jobId / productionModel / status / currentStep / note / handoffText / log / taskId` は全てモード非依存）。ハンドオフの中身だけが変わる | 変更なし |
| S9 | `audioUploadChunks` | 変更不要。解説でナレーション音源や BGM を分割アップロードする場合もそのまま使える | 変更なし |
| S10 | `STAGES` | 既存 8 段を両モード共通とするのが最小変更（ラベルだけクライアント側で kind 別表示）。解説固有段（例: 台本確定／根拠確認）を独立ステージ化する場合はここ＋§2.3 A6＋§2.4 C5 の 3 箇所同時変更になり、既存 MV の前進判定順序にも影響するため**推奨しない**（根拠確認は QC 事前チェック側に寄せる） | |

### 2.2 `drizzle/`（マイグレーション）

| # | 箇所 | 変更内容 | 種別 |
|---|---|---|---|
| M1 | 新規 `drizzle/0007_add_explainer_mode.sql`（番号は次番） | S2〜S7 の DDL を 1 マイグレーションに集約: `jobs` への `job_kind` 追加（DEFAULT 'mv'）、解説入力カラム追加、`directions` の軸カラム nullable 化＋解説軸追加（案 (a) の場合）、必要なら新テーブル。SQLite の NOT NULL 緩和はテーブル再作成が必要な場合がある点に注意し、`0002` のような再作成パターンになる可能性を実装時に検証 | |
| M2 | `drizzle/meta/_journal.json` | 新マイグレーションのエントリ追加（ビルド系が管理する場合はそちらの手順に従う。手編集は artifact のビルド手順側の指示優先） | |
| M3 | 既存 `0001`〜`0006` | **一切変更しない**（適用済み移行の改変は禁止。後方互換は DEFAULT 値で担保） | — |

### 2.3 `server/src/actions.ts`

| # | 箇所（関数・定数） | 変更内容 | 種別 |
|---|---|---|---|
| A1 | 先頭の enum 束（`stageEnum` 等の近傍） | `jobKindEnum = z.enum(schema.JOB_KINDS)` を追加。`jobSummary` / `jobDetailResponse` の job オブジェクトに `job_kind`（詳細には `topic / script / source_material` 等の解説入力も）を追加し、`listJobs` / `getJob` の詰め替えに反映 | |
| A2 | 定数 `PHILOSOPHY` | MV 専用定数は温存し、解説用 `EXPLAINER_PHILOSOPHY` を新設: 「何を理解させるかが先、手段は後」「論証・手順・因果の説明構造→映像構造への翻訳」「情報密度と変化率の区別」「図解とナレーションの主従を場面ごとに設計」「根拠なき断定の禁止」等、MV 原則の読み替え版。`generateDirections` / `draftBiimDesign` の解説分岐はこちらの定数を差し込む | |
| A3 | 定数 `LYRIC_QC_RULES` | 温存。対になる `EXPLAINER_QC_RULES` を新設（観点は PM 要件側で確定する前提で、枠として: 事前＝台本と根拠資料の整合・数式/図表/固有名詞の正確さ・字幕帯の設計（行長/表示時間/はみ出し）・ナレーション同期設計・テロップ帯の残像を生む設計でないか／事後＝全編の字幕・テロップ帯フレーム単位解析（ゴースト・点滅は歌詞 QC の知見をそのまま転用）・読み上げと図のズレ・字幕と音声の一致）。`buildHandoff` は kind で差し替える | |
| A4 | `splitLyricsChunks` | ロジック（見出しブロック化＋約 1,800 字/4 ブロック分割）は汎用。一般化して `splitScriptChunks` とするか、台本の見出し形式（例 `[導入]` や `##`）に合わせて正規表現を分岐。歌詞側の動作は不変に保つ | |
| A5 | `createJob` / `createJobFromUpload` | (i) リクエストに `job_kind` を追加し既定 `mv`（旧クライアント互換）。(ii) 解説時は必須検証を切り替え（mp3・歌詞必須 → テーマ/台本必須、音源は任意）。(iii) タイトル由来を分岐（解説はテーマ/台本タイトルから。ファイル名由来は使えない）。(iv) 成果物シードを S7 の kind 別集合から選択。(v) `createJobFromUpload` の冪等（client_token）は共通で流用可だが、解説が音源アップロードを伴わない場合はチャンク経路を経ない単発作成アクション（例 `createExplainerJob`）を別に置く方が UI・検証とも単純 | |
| A6 | `advanceStage` | ゲート条件の**仕組みは流用**し、文言と前提を kind 分岐: MV は現行どおり歌詞 QC。解説は A3 の事前/事後チェックが `passed` でないと `in_production` / `checking` / `completed` を拒否（エラー文は解説用チェック名で出す）。拒否の 3 段構造（in_production=事前、checking=事前、completed=事前+事後+成果物全完了）はそのまま | |
| A7 | `generateDirections` | 分岐点。解説版プロンプト: 入力は歌詞→台本＋資料サマリ＋テーマに置換、6 軸は S6 で決めた解説軸に置換、多様性条件（3 軸以上差）・旧候補タイトル回避・`PHILOSOPHY`→`EXPLAINER_PHILOSOPHY` 差し替え・出力 zod 形状の変更。実装は (a) 同アクション内で job_kind 分岐、(b) `generateExplainerDirections` 新設、の二択。directions テーブルの共有方針（S6）とセットで決める | |
| A8 | `selectDirection` | 変更不要（所有権検証＋ステージ前進のみでモード非依存）。解説方向性も同じ `directions` 行を使う設計なら完全に無変更 | 変更なし |
| A9 | `draftBiimDesign`＋`biimDesignShape`＋`designToText` | 解説版は**形状が別物**になるため、新形状 `explainerDesignShape`＋新アクション `draftExplainerDesign` の新設を推奨（同アクション内分岐だと zod・プロンプト・並列分割の全てが二重化し見通しが悪い）。解説形状の候補: `video_title / concept（何を理解させるか）/ structure_summary（説明構造と映像構造の対応）/ direction_summary / differentiation_memo / material_plan（図解・素材方針）/ narration_policy（ナレーション・音声方針。Seedance 方針の対応物として生成 AI 音声の既定もここ）/ scene_outline[{section, visual, narration_focus（その場面で理解させる一点）}] / failure_checks[]（解説版失敗リスト＋字幕帯 QC 最低 2 件を強制）`。並列分割推論のパターン（コンセプト系／素材系／失敗チェック／台本チャンクごとのシーン構成を `Promise.all`）は**そのまま複製して流用**。`designToText` の解説版も併せて追加し、サーバ・クライアントの二重実装（既存負債）を両方に作ることになる点に注意 | |
| A10 | `buildHandoff` | kind で全文分岐（`buildExplainerHandoff` を新設し `startAutoProduction` 側で選択する形が既存 MV 文への影響ゼロで安全）。解説版の差分: ヘッダのモード表記／入力展開は歌詞→台本＋資料／`PHILOSOPHY`→解説版／手順の差し替え（2. 配置先: kokuren_future は楽曲プロジェクト採番のため、解説の配置先・採番ルールは要件側で要確定。同一フォルダ体系に載せるなら手順文のみ変更／3. Biim ジョブ生成は解説モード入力（BiimMotionWebUI の 01 CONCEPT〜05 VOICE & OUTPUT）に合わせる／4・5a. QC は A3 の解説ルール／6. 成果物は解説セット（final＋サムネ＋メタデータ＋台本＋根拠メモ＋字幕データ、TuneCore 2 点は含めない））。「詰まったら blocked＋note に再開条件」の締めは共通で流用 | |
| A11 | `startAutoProduction` | ハンドオフ選択（A10）と spawnTask 指示文の分岐のみ。`dedupeKey` は `mv-e2e-production-job-{id}` のままで衝突しない（job id は一意）。指示文中の「歌詞レイヤー QC 必須」の 1 文を kind で差し替え。ラン作成・モデルスナップショット・`already_active` 判定は無変更 | |
| A12 | `reportQualityCheck` | 型（pre/post、passed/needs_fix、detail 必須）は流用可。ランログへの転記ラベルが「事前チェック（歌詞レイヤー）」等と直書きのため kind でラベル分岐。チェック内容自体は detail 自由文なので**新アクション不要** | |
| A13 | `updateProductionProgress` | 無変更で流用可（pre/post フィールドは汎用名）。解説ランも同じ報告経路を使う | 変更なし |
| A14 | `recordProductionResult` | `kind` enum が `["kokuren_future", "biim_job"]` に固定。解説の配置記録を別 kind（例 `explainer_project`）にする場合はここに enum 追加＋S7 と連動。配置先を kokuren_future に統一するなら無変更 | |
| A15 | `setDeliverable` / `setProductionModel` / `updateJobMeta` / `deleteJob` / `uploadAudioChunk` | 無変更（kind enum の拡張は schema 側 S7 のみで伝播）。`deleteJob` のカスケードは新テーブルを作らない限り無変更 | 変更なし |

### 2.4 `client/src/App.tsx`

| # | 箇所（コンポーネント・定数） | 変更内容 | 種別 |
|---|---|---|---|
| C1 | `HomeView` 投入フォーム全体 | モード切替（MV／解説）をフォーム最上部に追加し、入力欄を分岐。MV は現行 3 入力そのまま。解説は: テーマ/タイトル、台本テキスト（ファイル読み込みボタン含め歌詞欄のパターンを複製）、根拠資料（テキスト貼付/指示）、備考メモ（共通）、音源は任意（BGM/ナレーション素材として置く場合のみチャンクアップロード UI を再利用）。送信は A5 の解説作成経路へ | |
| C2 | 下書き保持（`DRAFT_KEY` / `IntakeDraft` / `loadDraft`） | 下書きに `jobKind` と解説入力を含めるため型拡張し、キーを `mv-e2e-intake-draft-v2` 等へ版上げ（旧 v1 下書きの移行か破棄を決める）。MV 側の既存復元挙動は壊さない | |
| C3 | `JobCard` | kind バッジ（解説）を追加。現行の歌詞チェック要約表示は kind でラベル切替（例: 解説は「字幕・根拠チェック」）。stage バッジ・成果物 n/m 表示は共通 | |
| C4 | `STAGES` ラベル複製＋`PipelineStepper` | ステージキー自体は共通（S10）。ラベルを kind 別に持つ（例: 解説では「Biimジョブ生成→解説ジョブ生成」等の読み替えが必要なら `STAGE_LABEL` を kind 別の 2 辞書に）。Stepper 本体は無変更 | |
| C5 | `JobDetailView` セクション群 | セクション構成自体は両モード共通にできるが、各セクションの中身が分岐: ①方向性（DirectionCard の軸ラベル 6 件が MV 固定 → 解説軸ラベルへ切替、または axes をデータ駆動に一般化）②「Biim入力設計」→ 解説は `ExplainerDesignView`（新規。`BiimDesignView` の複製ベース）＋コピー用 `designToText` 解説版（サーバ側 A9 と二重実装を揃える）③自動制作の説明文（kokuren_future 前提の直書き）→ kind 分岐 ④品質チェック（次項）⑤投入内容アーカイブ（歌詞欄→台本欄、資料欄を追加） | |
| C6 | `QualityCheckPanel` / `QualityCheckRow` | 見出し「品質チェック（歌詞レイヤー）」、説明文（発狂 Bridge の逸話）、各行の観点箇条書き・placeholder 例文が全て歌詞専用でハードコード。解説版の観点セット（A3 に対応: 事前＝台本・根拠整合/図表正確さ/字幕帯設計、事後＝全編字幕帯解析/読み上げと図の同期/字幕一致）を kind で差し替える。バッジ・記録フォームの仕組みは共通 | |
| C7 | `PRODUCTION_STAGES`＋ステージ前進ボタン | ボタンの無効化条件に埋め込まれた QC ラベル（「事前チェック未合格」等）は汎用文なので流用可。`design!= null` が前進条件になっているため、解説は explainerDesign の有無に切替 | |
| C8 | `DELIVERABLE_META` / `DeliverableRow` | S7 で追加した解説 kind の label/hint を追加。`isImage` 判定（サムネ/ジャケの列挙）に新 kind が画像なら追加。`youtube_metadata` 専用テキスト UI のような kind 固有 UI は、解説の `explainer_script` / `evidence_notes` / `subtitle_data` にもテキスト編集 UI を割り当てる分岐が必要（現状は `kind === "youtube_metadata"` の 1 点分岐） | |
| C9 | `ProductionModelPicker` / `ProductionRunView` / `RUN_STATUS_LABEL` / `PRODUCTION_MODEL_LABEL` | 無変更で流用可（モデル 2 択・ラン表示はモード非依存）。ハンドオフ全文表示もそのまま解説版テキストが流れる | 変更なし |
| C10 | `PRODUCTION_MODEL_OPTIONS` の hint 文等 | 「これまでの制作指揮モデル」等のコピーは MV 文脈だが実害なし。階層ワークフロー（Fable=PM 等）をスペース側モデル選択に反映する場合は別途要件判断（現行 2 択の枠を超える） | |

### 2.5 `client/src/api.ts`

| # | 箇所 | 変更内容 |
|---|---|---|
| — | 全体 | **編集不要**。`createActionClient<typeof Actions>()` の型プロキシのため、新アクション（`draftExplainerDesign` 等）・新フィールドはサーバ側の変更だけでクライアント型に伝播する。新設作業のチェック項目として「api.ts に手を入れていないこと」を確認する程度 |

### 2.6 その他ファイル

| ファイル | 変更内容 |
|---|---|
| `DATA-PLAN.md` | スペースのデータ計画ドキュメント。解説モードの入力・成果物・QC の設計根拠を追記するのが同ファイルの運用（過去の追加機能は全てここに追記されてきた）。実装とセットで更新すべき文書であり、コード変更ではないが変更マップに含める |
| `space.json` | 変更不要（slug/runtime はモード追加と無関係）。表示名「MV-E2E」を解説対応に伴い変えるかはオーナー判断事項 |
| `client/src/*`（api.ts 以外） | App.tsx 単一ファイル構成のため新規ファイルは不要。新規コンポーネントも App.tsx 内に追加するのが現行構成との整合的 |

---

## 3. 流用可否表

判定: ◎ そのまま流用可（型・仕組み・中身とも）／○ 仕組み・型は流用、中身（文言・プロンプト・観点）は差し替え／✕ 流用不可（解説側で別途用意）

| 対象 | 判定 | 根拠と解説側での扱い |
|---|---|---|
| 方向性選択ゲート（未選択は先へ進めない、`selectDirection`、generation 管理、旧候補回避） | ◎ | 完全にモード非依存。解説も「3 案から 1 つ選ぶまで `awaiting_direction`」で同一 |
| 方向性 3 案の多様性メカニズム（6 軸中 3 軸以上差、色違い禁止） | ○ | 「軸の集合」と「最低 3 軸差」という**型**は流用。軸の中身は MV 6 軸（配色/タイポ/モーション/構図/質感/テンポ）を解説軸に再定義する |
| 方向性候補の保存形式（`directions` 行＋9 フィールド） | ○ | 行の型は流用可だが全カラム NOT NULL の MV 軸固定が障壁（S6）。nullable 化か JSON 化か新テーブルかの判断が要る |
| `PHILOSOPHY`（思想先的 MV 原則） | ○ | 「思想が先・手段は後」「構造→映像への翻訳」「密度と変化率は別物」「品質検証≠構造検証」「プレビュー合格は最終品質の保証でない」は解説にも通用する骨格。具体則（歌詞を構図の一部に、楽曲構造の翻訳）は解説原則として書き直す |
| Biim 設計の並列分割推論パターン（部位ごとに `Promise.all`、チャンク分割） | ◎ | タイムアウト回避の実装知見そのもの。台本チャンク分割（A4）と組み合わせて解説設計生成にそのまま使う |
| `splitLyricsChunks`（見出しブロック＋文字数分割） | ○ | アルゴリズムは汎用。見出し正規表現だけ台本形式に合わせる |
| 素材方針の既定経路（Codex CLI + imagegen 既定、生成 AI はメモ明示時のみ） | ○ | 図解・挿絵素材でも同じ既定が妥当。ただし対象が「キャラシート/背景」から「図解/グラフ/概念図」に変わる |
| `seedance_policy`（動画生成 AI 方針フィールド） | ○ | フィールドの型（方針を 1 欄持つ）は流用。解説ではナレーション音声（TTS/Aivis 等）の方針欄との対応付けが要る |
| QC ゲートの仕組み（pre/post 2 段、status enum、`reportQualityCheck`、ランログ転記、`advanceStage` の 3 段拒否） | ◎ | 今回の移植の核。ゲートの強制力（サーバ側拒否＋文面分岐）ごと解説に持ち込む |
| 歌詞レイヤー QC の**内容**（行重なり、残像、歌詞帯フレーム解析） | ○ | 字幕・テロップ帯に読み替えれば「帯域テキストの残像・点滅を全編フレーム解析で検出」は解説でもそのまま有効（MV の最重要知見の転用先）。一方「歌詞行の表示区間」等の歌詞固有観点は台本・字幕観点に置換 |
| QC の UI 型（`QualityCheckPanel`、バッジ、手動記録フォーム） | ○ | 仕組みは流用、見出し・観点リスト・例文は差し替え（C6） |
| 制作ラン記録（`production_runs`、status/log/handoff/taskId、15 秒ポーリング、blocked+note の再開案内） | ◎ | 完全にモード非依存。解説ランも同一テーブル・同一報告アクション |
| ハンドオフの枠（`buildHandoff` の見出し構成、spawnTask、`expectsAction`、`dedupeKey`、再開時の `already_active`） | ◎ | 枠は流用。本文（手順・参照先・成果物リスト）は kind 分岐で別文を用意（A10） |
| 制作モデル選択（`production_model`、スナップショット、`setProductionModel`、Picker UI） | ◎ | モード非依存。解説ジョブでも同じ 2 択が既定で効く |
| 成果物スロットの仕組み（`deliverables` 行、status、blob/external_path/text_content、`setDeliverable`、作成時シード） | ◎ | 仕組みは流用。シード集合と kind 一覧だけ kind 別に変える（S7） |
| `final_video` / `youtube_thumbnail` / `youtube_metadata` / `biim_job` の各 kind | ◎ | 解説動画も YouTube 公開と Biim ジョブ生成が前提なら同一 kind を再利用できる |
| `tunecore_jacket` / `tunecore_wav` | ✕ | 楽曲配信専用。解説に概念自体が無い。解説のシードから除外し、代わりに台本・根拠メモ・字幕データの kind を新設（S7） |
| `lyrics_approach`（歌詞の扱い）／`scene_outline.lyric_focus` | ✕ | 歌詞前提のフィールド。解説では「ナレーション/説明の扱い」「場面ごとに理解させる一点（narration_focus 等）」に置換した新形状が要る（A9） |
| `kokuren_future` 配置・Project 採番（楽曲プロジェクト番号体系） | ○ | 「PC ローカルを参照して既存命名に沿って配置し書き戻す」という手順の型は流用。配置先フォルダ体系と採番ルールが楽曲専用のため、解説の置き場は要件側で確定が要る（A10/A14） |
| SUNO mp3 必須入力＋ファイル名由来タイトル | ✕ | 解説の入力形態（テーマ＋台本＋資料）と非互換。作成経路ごと分岐（A5/C1） |
| 分割アップロード＋冪等作成（`uploadAudioChunk`、client_token、localStorage 下書き） | ◎ | 音源を使う場合（BGM/ナレーション素材）はそのまま。下書き保持の型は解説入力にも拡張して使う（C2） |
| ステージ列 8 段 | ○ | 骨格は流用。ラベル読み替えのみ。解説固有段の新設は 3 箇所連動変更になるため非推奨（S10） |
| `designToText`（設計のテキスト化） | ○ | 関数パターンは流用。ただしサーバ/クライアント二重実装の負債も一緒に複製される点は実装時に意識する（A9/C5） |

---

## 4. 実装順序と依存関係（監査からの示唆）

1. **スキーマ＋移行（S1〜S7、M1）が全ての前提**。特に S3（入力カラムの NOT NULL 問題）と S6（directions の軸）の設計判断を先に確定しないと、アクション・クライアントの両方が手戻りする。
2. アクションは `jobSummary/jobDetailResponse` への `job_kind` 追加（A1）→ 作成経路（A5）→ 方向性（A7）→ 設計（A9）→ ゲート/ハンドオフ（A6/A10/A11）の順が依存の素直な流れ。MV 経路の回帰確認（既存ジョブの表示・ゲート・ハンドオフが不変）は各段で要る。
3. クライアントは C1/C2（投入と下書き）が入口で、C5/C6/C8 が詳細画面の本体。`api.ts` 無変更で型が付いてくるため、サーバ先行で型エラーを潰しながら進められる。
4. 既存 MV ジョブ（`job_kind` 既定 `mv`）が移行後に完全に同一挙動であることが受け入れの最低線。特に `advanceStage` の歌詞 QC エラー文と `buildHandoff` の MV 文はバイト単位で不変に保つ分岐の切り方（解説分を別関数に分離）が安全。

## 5. 未決・要判断事項（監査で確定できなかった点）

- 解説入力の確定形: テーマ＋台本＋資料を「必須/任意のどれにするか」、音源（BGM・ナレーション）を入力に含めるか。S3/A5/C1 の形がこれで決まる。
- 解説の方向性軸の定義（S6/A7/C5）: MV 6 軸の読み替えか新規軸か。
- 解説 QC のゲート項目と助言項目の線引き（A3/A6/C6）: MV では全項目ゲート強制だが、解説でも同強度にするか。
- 解説の配置先・採番（A10/A14）: kokuren_future に相乗りか、別体系か。
- 制作モデル選択を階層ワークフロー（Fable PM／Opus 高オーケストレーター）とどう関係づけるか。現状の 2 択は「制作指揮モデル」でしかなく、PM 層の概念はスペース側に存在しない。
- スペース表示名「MV-E2E」の改名要否（`space.json`）。
