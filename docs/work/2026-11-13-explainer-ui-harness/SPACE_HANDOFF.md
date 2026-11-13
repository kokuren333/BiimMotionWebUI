# SPACE_HANDOFF — スペース版 MV-E2E 解説モードの引き渡し仕様

| 項目 | 内容 |
| --- | --- |
| 作業ID | `2026-11-13-explainer-ui-harness` |
| タスク | T9a（計画書 §5.1。対応：SP-01〜SP-09、AM-2 の6、A16、A22） |
| 書いた者 | L3 実働 A（Opus 5.5 / effort medium、Claude Code 非対話セッション）。G3 は L2 が行う。本書は自己合格を主張しない |
| 根拠 | Amendment 01（AM-1・AM-2）、Amendment 02（表示名 `BiimMotion` 確定）、要件書 §2.6・§2.10、計画書 §1.2・§1.4・§5.1・§9、T1 の `CONTRACT.md`（コミット `8d8ba75`）、T0 のスペース監査の写し `audits/audit-space.md`、T4 の `job-template/runtime/scripts/qc.mjs`（T4-2 `1b1bb5b`。T4 ブランチ先端 `5e38423` までの差分も確認）、T5 の実装記録 |
| 読む者 | スペース側の実働（S1〜S4。Muse の artifact 編集ができるエージェント）、S0 を行うオーナー／L2 |
| 状態 | **S1 以降は保留**（計画書 Q4 の既定。U1 の実装主体・時期の回答と、スペース編集権を持つ実働の確保（S0）が揃うまで着手しない）。本書は S1〜S4 の着手条件の一つ |

## 0. この文書の読み方と完了条件

- スペースのソースはこの repo からは見えない。スペースの関数名・カラム名・定数名は**スペース監査（2026-11-13）の記述**に基づく。実装時に監査と実物が違っていたら、黙って読み替えずに `space/S<n>-*/REPORT.md` に「監査の記述／実物／採った対応」を書く。
- 監査の変更マップの番号（S1〜S10＝スキーマ、M1〜M3＝移行、A1〜A15＝アクション、C1〜C10＝クライアント）を本書でもそのまま使う。**監査の `S1`〜`S10`（スキーマの行番号）と作業単位の `S1`〜`S5`（計画書 §9）は別物**なので、本書では前者を「監査 S6」のように必ず「監査」を付けて書く。
- 表示名は `BiimMotion`（Amendment 02、確定）。スペースの表示名「MV-E2E」と `space.json` は本書の対象外（変えない。§8 の Q-T9a-4）。
- 「決定」と書いた事項は本書で確定しており、S1〜S4 の実働は変えない。変える必要が出たら実装を止め、理由を REPORT に書いて L2 に申告する。

**本書の完了条件**（L2 が G3 で判定する。本書の書き手は合否を判定しない）：

1. S1〜S4 の実働が本書だけで着手できる。
2. A16「3.10（＝2.10）の仕様と、スペースが読む契約（`reports/qc-*.json` のスキーマ、解説ジョブの入力項目）が確定し、スペース側の作業単位へ引き渡されている」を満たす。
3. **P1-1**：次の4点が本書で確定している（§2）。①`directions` の監査 S6 方針＝案 (a)、②設計パッケージの格納先＝監査 S4 の案 A／案 B のどちらか、③解説ジョブの作成経路（監査 A5）、④成果物 kind 名（SP-07 の5点との対応表）。**S1 の依存に「SPACE_HANDOFF.md に①〜④が確定していること」を含める**（§6.1）。
4. **P1-2**：SP-08 の別モデル／別セッションによるレビュー判定の規則が書かれている（§3.4）。
5. **P1-3**：`designToText` の二重実装（サーバ・クライアント）の注意が書かれている（§5.5）。
6. 末尾に SP-01〜SP-09 と AM-2 の6 を本書の節に対応付ける表がある（§9）。

---

## 1. 現状（U1）と前提

### 1.1 U1 の現状

| 問い（要件書 §5 U1） | 現状 | 出どころ |
| --- | --- | --- |
| スペースは MV ジョブをどう生成しているか | **判明**。スペースはテンプレートの複製を持たない。`buildHandoff` の手順3「その時点の BiimMotionWebUI に合わせ Claude 経由で Biim ジョブ生成」により、**PC 側の制作エージェントに生成させている**。生成後に `recordProductionResult(biim_job)` と `advanceStage(biim_job_generated)` を呼ぶ | 監査 §1.8、計画書 §1.4 D-10 |
| PC 側エージェントが具体的にどの手段で生成しているか（WebUI を操作して ZIP を得るのか、`job-template` を手で写すのか） | **未確認**。手順文は手段を指定していない | 監査 §1.8 の手順3の文言 |
| スペース版の実装主体（誰が S1〜S4 を行うか） | **未決** | 計画書 Q4 |
| 実装時期 | **未決** | 計画書 Q4 |

- S0（U1 の確認とスペース編集権を持つ実働の確保）は**オーナー／L2 の仕事**で、T9a の範囲ではない（計画書 §9）。本書は S0 の結果を待たずに書いたもので、S0 の回答によって変わるのは「誰がいつ着手するか」だけである。本書の決定事項（§2〜§7）は S0 の回答に依存しない。
- 手段が未確認であることへの対処は §7（SP-04 入口の結論）と §5.2 の手順3で行う。

### 1.2 前提（要件書・計画書の決定で、本書が変えないもの）

- **SP-01 決定**：別アプリにしない。既存アプリにジョブ種別（MV／解説）を足す。
- **監査 S10**：ステージ列 8 段（`received → awaiting_direction → direction_confirmed → biim_designed → biim_job_generated → in_production → checking → completed`）は**両モード共通**。ステージキーは変えない。解説固有段は作らない（根拠の確認は事前 QC に寄せる）。表示ラベルだけをクライアントで種別ごとに持つ（§6.3）。
- **SP-06**：解説のゲートの合否は、ジョブフォルダの `reports/qc-pre.json`／`reports/qc-post.json` の `verdict` で決める。スペースはゲートの定義（項目・判定方法）を持たない（D6）。
- **N3**：スペースの実装はこの repo の受け入れ条件に含めない。この repo が渡すのは本書と T1 の契約まで。
- 移行は新規 `0007` に集約し、`0001`〜`0006` は変えない（監査 M3、計画書 S1）。移行は本番 DB のバックアップを取ってから適用し、非対話セッションでは適用の手前で止めて報告する（計画書 §9）。

---

## 2. 確定事項（P1-1 の4点と、それに付随する決定）

### 2.1 `directions` の方針（監査 S6）＝**案 (a)**

**決定**：`directions` の MV 6 軸カラム（`palette`／`typography`／`motion_language`／`composition`／`texture`／`tempo`）の NOT NULL を外し、解説の軸カラムを nullable で追加する。MV の行は従来どおり MV 6 軸をすべて埋め、解説の行は解説軸を埋めて MV 軸を NULL にする。`title`／`description`／`differentiation`（両モード共通の意味）は NOT NULL のまま両方で使う。

| 追加カラム（nullable、TEXT） | 内容（要件書 §2.4 の6軸。AM-2 の2で「視覚様式」は様式モードを含む） |
| --- | --- |
| `intro_type` | 導入の型 |
| `explanation_skeleton` | 説明の骨格 |
| `diagram_core` | 図解の核 |
| `character_role` | キャラの役回り。`characterUsage` が `none` のジョブでは NULL（EX-09：5軸） |
| `visual_style` | 視覚様式（その様式モード内の見た目の型。例：黒板とチョーク） |
| `tempo_shape` | テンポと緩急（MV の `tempo` と意味が違うので別名にする） |
| `style_mode` | その候補の様式モード（`biim`／`anime`／`motion`／`mixed`）。視覚様式軸の一部（CONTRACT §8 の5） |

- 理由：既存の MV 行と既存 zod（`directionShape`）は一切変わらない（MV 行は全カラムが埋まったまま）。`selectDirection`（監査 A8）は `directions` の行 ID と所有権だけを見るので無変更で使える。
- **案 (b) を採らない理由**：軸を JSON カラム `axes` に一般化すると、既存 MV 行の移し替えと `directionShape`・MV の `generateDirections` の保存処理の書き換えが要り、MV 経路に手が入る。
- **案 (c) を採らない理由**：`explainer_directions` テーブルを新設すると、`selected_direction_id` の参照先が2つになり、無変更で使えるはずの `selectDirection`・`deleteJob` のカスケードに手が入る。
- SQLite は既存カラムの NOT NULL を ALTER で外せないので、`directions` はテーブル再作成（`0002` と同じ型）になる。再作成で既存行の値・ID・順序が変わらないことを S1 の検証で確かめる（§6.1）。
- 応答の形：`getJob` は、MV ジョブには従来の `directionShape`（MV 6 軸、変更なし）で、解説ジョブには新しい `explainerDirectionShape`（`title`／`description`／`differentiation`＋上の7カラム）で返す。どちらの形にするかは**ジョブの `job_kind` で決める**（行のカラムの NULL から推測しない）。

### 2.2 設計パッケージの格納先（監査 S4）＝**案 B（`explainer_design` カラム新設）**

**決定**：`jobs` に `explainer_design`（TEXT、nullable、JSON 文字列）を追加し、解説の設計パッケージをここに保存する。`jobs.biim_design` は MV 専用のまま触らない（解説ジョブでは常に NULL）。

- 理由：検証が単純（`explainerDesignShape` を1つ当てるだけ）で、MV の `biim_design` の読み書き・`getJob` の検証・`designToText`（MV 版）がまったく変わらない。移行は §2.1 と同じ `0007` に1行足すだけで、カラムが1本増える以外の費用が無い。
- **案 A を採らない理由**：既存の MV の JSON には種別の印が無いので、同じカラムに入れると `getJob` の検証を判別共用体（「印が無ければ MV」という推測を含む）に変える必要があり、MV の読み出し経路に手が入る。
- 設計の形状は MV 版と別物（要件書 §2.3／§2.4、監査 A9）。形状は §4.3。

### 2.3 解説ジョブの作成経路（監査 A5）＝**単発作成アクション `createExplainerJob` を新設**

**決定**：解説ジョブはチャンク経路（`createJobFromUpload`）を経ない単発アクション `createExplainerJob` で作る。既存の `createJob`／`createJobFromUpload` には `job_kind` 分岐を入れない（関数本体・リクエスト形状・エラー文を変えない）。

- 理由：解説は音源アップロードを伴わない（SP-02 の入力に音源が無い）。既存2アクションに分岐を入れると、MV の必須検証（mp3・歌詞）とタイトルの由来（ファイル名）に条件が混ざり、MV のエラー文と挙動のバイト不変の確認が難しくなる。
- 冪等性：`jobs.client_token`（`0006` で追加済み）を同じ意味で使う。同じ token のジョブがあれば既存ジョブを返す（`createJobFromUpload` と同じ規則）。
- 資料ファイル（SP-02 の「資料（ファイル）」）：バイト列の分割送信は既存の `uploadAudioChunk`（監査 A15：バイト列汎用、無変更）を**そのまま呼んで**送り、`createExplainerJob` に `source_uploads: [{ upload_id, filename, mime }]` を渡す。連結・blob 保存は `createExplainerJob` の中（または解説専用の新しい補助関数）で行い、`createJobFromUpload` の連結処理を共通化のために書き換えない。blob のキーは `jobs/sources/{timestamp}-{filename}`。保存先は §4.1 の `source_files`。
- 作成時の成果物シードは §2.4 の `EXPLAINER_FINAL_DELIVERABLE_KINDS`。

### 2.4 成果物 kind 名（監査 S7、SP-07）

**決定**：SP-07 の5点と kind 名を1対1に対応させる。

| SP-07 | 中身 | kind 名 | 新設／既存 | 主な登録の仕方（`setDeliverable`） |
| --- | --- | --- | --- | --- |
| 1 | `output/final.mp4` | `final_video` | 既存（共通で再利用） | `external_path`（PC 上のパス）、必要なら添付 |
| 2 | YouTube サムネイル | `youtube_thumbnail` | 既存（共通で再利用） | 画像の添付（既存の画像プレビュー） |
| 3 | YouTube メタデータ（タイトル、概要欄、**チャプター**、**出典リスト**、タグ） | `youtube_metadata` | 既存（共通で再利用） | `text_content`。チャプターと出典リストは `reports/delivery.md` の `## チャプター`・`## 出典リスト` から写す |
| 4 | 台本と根拠メモ（`plan/script.md`、`plan/sources.md`、`plan/evidence.json`） | `script_and_evidence` | **新設** | `text_content` に3ファイルを `=== plan/script.md ===` のような区切り行で連結、または3ファイルの PC パスを `external_path` に |
| 5 | 字幕データ（`assets/audio/narration.srt`） | `subtitle_data` | **新設** | SRT の添付（`data_base64`、mime `application/x-subrip`）または `text_content` |

- `DELIVERABLE_KINDS` に `script_and_evidence`・`subtitle_data` を足す（計9種）。`FINAL_DELIVERABLE_KINDS` は `MV_FINAL_DELIVERABLE_KINDS`（現行の5種、**順序も中身も現行と同じ**）と `EXPLAINER_FINAL_DELIVERABLE_KINDS = ["final_video", "youtube_thumbnail", "youtube_metadata", "script_and_evidence", "subtitle_data"]` に分ける。既存コードが参照している `FINAL_DELIVERABLE_KINDS` という名前は、MV の集合を指す別名として残してよい（MV のシード処理を書き換えないため）。
- **解説ジョブでは TuneCore 向けのジャケット（`tunecore_jacket`）と WAV（`tunecore_wav`）を生成しない**。シードに入れず、ハンドオフ文にも書かない。
- 制作記録の kind：`biim_job`（生成したジョブの ID・パス・出力先）は解説でも使う。`kokuren_future`（楽曲プロジェクトの採番）は解説では使わない（§8 Q-T9a-1）。`recordProductionResult` の kind enum は変えない。
- `biim_job`・`biim_job_generated`・`biim_designed` はアクションとステージの**識別子**であり、§5.3 の禁止語の対象外。

### 2.5 付随する決定（S1〜S3 の実働が迷わないためのもの）

| # | 事項 | 決定 | 理由 |
| --- | --- | --- | --- |
| 2.5.1 | `jobs.lyrics`／`jobs.audio_filename` の NOT NULL（監査 S3） | **外さない**。解説ジョブの行では両方を空文字 `''` にする。解説ジョブの応答にはこの2つ（と `audio_*`）を出さない | `jobs` の再作成を避ける（MV の主テーブルを作り直す危険を取らない）。`directions` は案 (a) のため再作成するが、`jobs` は列の追加だけで済む |
| 2.5.2 | 解説の入力の保存形 | フォーム値を `jobs.explainer_form`（JSON）に保存する（§4.1） | SP-04 の「WebUI のフォーム値に相当する設定」とそのまま対応し、ジョブ生成（§7）へ変換なしで渡せる |
| 2.5.3 | 方向性の生成 | 新アクション `generateExplainerDirections`（監査 A7 の (b)）。MV の `generateDirections` は無変更 | MV のプロンプトと出力形状に分岐を入れない |
| 2.5.4 | 設計の生成 | 新アクション `draftExplainerDesign`＋`explainerDesignShape`（監査 A9 の推奨どおり） | 同上 |
| 2.5.5 | QC 結果の受け取り | 新アクション `reportQcResult`（§4.4）。解説ジョブでは `reportQualityCheck` と `updateProductionProgress` の pre／post 更新を拒否する | 合否の正本を `qc-*.json` だけにする（SP-06） |
| 2.5.6 | 下書きの保持（監査 C2） | MV の下書きキー `mv-e2e-intake-draft-v1` と型は**変えない**。解説は別キー `mv-e2e-intake-draft-explainer-v1` に別の型で保存する | 監査 C2 はキーの版上げを推奨しているが、版上げは MV の下書き復元に手を入れる。別キーなら MV は無変更 |
| 2.5.7 | 種別の切り替えの置き場所 | 投入フォームの最上部（監査 C1）。既定は MV（現行の利用者の操作を変えない） | SP-09 |
| 2.5.8 | `STAGES` のラベル | ステージキーは共通。クライアントのラベルを種別ごとの辞書にする。解説のラベルは「Biim」を含めない（例：`biim_designed`＝「解説設計」、`biim_job_generated`＝「解説ジョブ生成」） | 非 Biim 様式でも成り立つ表示にする（AM-2） |

---

## 3. ローカル側から引き渡す契約（T1 の CONTRACT）

正本は `docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（T1、`8d8ba75`）。本節はスペースが使う部分の写しと、スペース側での扱いである。写しと正本が食い違ったら正本に従い、食い違いを REPORT に書く。

### 3.1 解説ジョブの入力項目（SP-02 ↔ WebUI のフォーム ↔ スペース）

キー名は WebUI の `MotionForm`（`src/job.ts`。T1 §3.1、T5 で実装）と同じにする。スペースは `explainer_form` にこのキー名で保存し、ジョブ生成（§7）にそのまま渡す。**スペースは既定値の表（`defaults`）を複製しない**：利用者が入力したキーだけを保存し、未入力のキーはジョブ生成の側（この repo）が `defaults` で埋める。

| SP-02 の入力 | 必須 | `MotionForm` のキー | 備考 |
| --- | --- | --- | --- |
| タイトル | 必須 | `title` | `jobs.title` にも同じ値（一覧表示用） |
| 何を説明するか | 必須 | `description` | |
| 対象視聴者 | 必須 | `audience` | 必須はこの3つだけ（EX-22 と同じ。増やさない） |
| 理解ゴール | 任意 | `takeaway` | |
| 前提知識と想定される誤解 | 任意 | `priorKnowledge` | 1欄 |
| 構成メモ・台本下書き | 任意 | `outline` | 改行を保持。ジョブでは `plan/outline.txt` に原文で入る |
| 資料（URL） | 任意 | `urls` | 改行区切り（WebUI と同じ） |
| 資料（ファイル） | 任意 | （フォーム外。`JobAssets.sources`） | §2.3 の `source_uploads` → `jobs.source_files` |
| メモ | 任意 | `instructions` | WebUI の「動画全体への優先指示（原文）」に相当。`jobs.memo` にも同じ値（MV と同じ欄で表示するため） |
| 差別化メモ | 任意 | `explainerDifferentiation` | MV の `differentiation` とは別キー（EX-22） |
| 希望尺 | 任意 | `durationSec` | |
| キャラ（1人・2人） | 任意 | `characterMode`（`solo`／`duo`）、`characterUsage`（`none`／`occasional`／`frequent`） | |
| キャラの名前と読み | 任意 | `characterName`、`characterReading`、`secondCharacter.name`、`secondCharacter.reading` | `secondCharacter` の内部キーは `src/job.ts` の `CharacterForm` に合わせる |
| 声の設定 | 任意 | `voiceEngine`（`aivis`／`none`）、`styleId`、`voiceSpeed`、`secondCharacter.styleId` 等 | SP-05 の環境確認に使う |
| 出力の向き | 任意 | `width`、`height` | 横 1920×1080／縦 1080×1920 の2択で足りる |
| 追加 Web 調査の可否 | 任意 | `allowWebResearch` | SP-05 の環境確認に使う |
| 根拠方針 | 任意 | `evidencePolicy`（`primary`／`supplied-only`／`balanced`） | |
| 様式モード | 任意（既定 `biim`） | `styleMode` | §3.2。固定・ロックしない |

- `videoMode` はスペースでは保存しない（ジョブ生成時に `"explanation"` を与える）。MV 専用キー（`musicMood`、`musicLyrics`、`musicDurationSec`、`differentiation`）は解説の `explainer_form` に入れない。
- `design`（デザイン方向性）は利用者の入力ではなく、設計パッケージから作る（§4.3 の `form.design`）。
- WebUI のフォームが将来キーを足した場合に備え、スペースの `explainerFormShape`（zod）は**上表のキーだけを受け付け、他は拒否**する。キー名のずれはジョブ生成（§7）の未知キー拒否でも検出される。

### 3.2 様式モード `style_mode`（AM-2、CONTRACT §4）

| 値 | 表示ラベル | 平易な説明（選択肢に添える。CONTRACT §4.1 の文をそのまま使う） |
| --- | --- | --- |
| `biim`（既定） | Biim 形式 | 黒い枠の中に映像、右上と右下に要点と補足、下に字幕を置く従来の形式。 |
| `anime` | アニメ解説 | 枠を使わず画面全体で、キャラクターの演技と掛け合いを中心に説明する。 |
| `motion` | モーション解説 | 枠を使わず画面全体で、図形・文字・図解の動きを中心に説明する。キャラクターは任意。 |
| `mixed` | 混在 | Biim 形式の場面と、アニメ解説・モーション解説の場面を1本の中で切り替える。横向きのみ。 |

- 保存先：`jobs.style_mode`（解説だけ、nullable。MV は NULL）。`explainer_form.styleMode` と同じ値に保つ（どちらか一方だけを更新しない）。
- 入力の検査（`createExplainerJob` と、様式を変えるすべての操作。文言は CONTRACT §3.1 の `validateForm` と同じにする）：
  - 4値以外：`様式モードが不正です。`
  - `mixed` かつ縦（`height > width`）：`縦向きの出力ではBiim枠を置けないため、様式「混在」は選べません。横向きにするか、別の様式を選んでください。`
  - `mixed` かつ（`fullScreen === true` または `biimUsage === "never"`）：`様式「混在」ではBiim区間が必要なため、全画面モードとBiim使用率「使わない」は選べません。`（スペースの入力に `fullScreen`・`biimUsage` を出さない場合、この検査は既定値で常に通る）
- 縦＋`biim` は選べる（Biim 様式の全画面になる。CONTRACT §4.2 変更2）。クライアントは選択肢のそばに「縦向きではBiim枠を使えないため、Biim様式の全画面（枠なし）になります」を表示する。縦で `mixed` を選んでいる状態に切り替わっても様式を自動で変えない（CONTRACT §4.4）。
- `mixed` の区間上書き：区間＝ジョブの場面（`project.scenes[]` の1要素）。設計パッケージでは `scene_outline[].style` に区間ごとの様式を持つ（§4.3）。**制作時の正本**はジョブ内の `plan/storyboard.md` の `様式:` 行と `project.json` の `scenes[].style`（同じ値。PRE-7 で検査）であり、設計パッケージの区間割りは制作エージェントへの指示（出発点）である。`anime`／`motion` の場面は `biim: false`（CONTRACT §4.3 R5）。
- 方向性の候補（`generateExplainerDirections`）は様式モードを候補の対象に含め、`biim`／`anime`／`motion`／`mixed` を同格に扱う（AM-2 の2）。縦のジョブでは `mixed` を候補に出さない（WebUI の `explainerCandidates` は縦で `biim`／`mixed` を候補から外す。スペースも同じにしてよいが、少なくとも `mixed` は外す）。
- ジョブの様式モードは、`draftExplainerDesign` が「採用した候補の `style_mode`」（引数で上書き指定があればその値）で確定し、`jobs.style_mode` と `explainer_form.styleMode` を更新する。上の検査に掛かる場合は設計を作らずエラーを返す。

### 3.3 `reports/qc-<stage>.json` のスキーマ（CONTRACT §2.2 と `qc.mjs` の突き合わせ）

スペースが読むキーと扱い：

| キー | 型（CONTRACT §2.2.1） | スペースの扱い |
| --- | --- | --- |
| `schema_version` | `"1"` | `"1"` 以外は受け付けない（`reportQcResult` がエラー） |
| `kind` | `"biim-explainer-qc"` | 一致しなければ受け付けない（ghost-check の JSON 等との取り違え防止） |
| `stage` | `"pre"`／`"post"` | `reportQcResult` の引数 `stage` と一致すること |
| `mode` | `"explanation"` | 一致しなければ受け付けない（MV では `qc` が JSON を書かない。EX-19） |
| `style_mode` | 4値 | `jobs.style_mode` と一致すること（不一致は受け付けない。様式を変えたのに QC をやり直していない状態を防ぐ） |
| `verdict` | `"pass"`／`"fail"` | **ゲートの合否はこれだけで決める**。加えて整合検査：`gates[]` に `status: "fail"` があるのに `verdict: "pass"` なら受け付けない |
| `gates[]` | `{id, title, kind, scope, status, detail, scene_ids?, items?}` | 表示用。`status` は `pass`／`fail`／`waived`／`not-applicable`。スペースはゲートの判定をやり直さない |
| `advisories[]` | `{id, scope, detail, scene_ids?}` | 表示用。合否に使わない |
| `review_mode` | `"independent"`／`"self"` | `self` なら画面に「自己レビュー」と表示する（SP-06） |
| `waivers[]` | `{gate_id, reason}` | 表示用（§3.5） |
| `inputs` | パス → SHA-256 または `null` | 表示・記録用（後から「どの状態のファイルを検査したか」を追える） |
| `rule_versions` | `{caption_capacity}` | 表示・記録用 |
| `generated_at` | ISO 8601 | 事後 QC の受け取り時、事前 QC の `generated_at` より後であること |

- **未知のキーは無視する**（受け付ける）。`schema_version` が同じ間はキーの追加だけが起こりうる前提で読む。
- `gates[].detail` などの文は人が読むためのもので、**文面を解析して判定に使わない**（下の食い違い D5）。

**CONTRACT と `qc.mjs`（`1b1bb5b`）の突き合わせ結果**：トップレベルのキー13個（`schema_version`〜`generated_at`）、`kind` の固定値、`verdict` の決め方（`fail` が1つでもあれば `fail`、`waived` は合格側）、`review_mode` と免除行の正規表現、ゲート ID・名称・`kind`・`scope` の一覧（PRE-1〜PRE-8、POST-1〜POST-8、POST-4R、POST-5R）、MV で JSON を書かず終了コード0、`.md` の「判定:」行は一致した。次の食い違いがある（どちらも記録し、どちらが正かは本書では決めない。スペースはどちらでも壊れない読み方をする）：

| # | CONTRACT の記述 | `qc.mjs` の実物 | スペースの読み方 |
| --- | --- | --- | --- |
| D1 | POST-2：PRE-1・2・3・6・7・8 を再実行し「`not-applicable` 以外がすべて合格」 | 再実行した事前項目に `fail` が無ければ合格。免除された事前項目（`waived`）は合格側に数え、その免除は事後の `waivers[]` にも載る | `verdict` だけを見る。`items` の `waived` は表示する |
| D2 | `gates[].scene_ids`：「不合格の原因になった場面」 | PRE-8 は**合格時にも** Biim 枠の場面の一覧を `scene_ids` に入れる（不合格時は入れない） | `scene_ids` を「不合格の場面」とみなさない。`status` と組み合わせて表示する |
| D3 | 助言 `ADV-PRE-*` の段階は `pre` | 事後でも事前項目を再実行するため、`qc-post.json` にも `ADV-PRE-*` が出る | 助言の ID から段階を推測しない |
| D4 | `inputs` に載せるファイルの一覧（§2.2.2） | 一覧に加えて、PRE-3 が読んだ資料ファイル（`sources/…`）も載る。`reports/ghost-check.json` は POST-1 の後で読み直したハッシュになる | `inputs` を開いた辞書として扱う |
| D5 | `detail` は人が読む説明（例は日本語） | `detail` は英語の文（例：`Checks passed`、`Missing or empty heading: …`） | 文面を解析しない。表示だけ |
| D6 | 終了コード2は「`--stage` が無い・不正、または `project.json` が読めない」 | 上記に加え、`runQC` の外へ出た例外（ファイル読み取りの ENOENT 以外のエラー等）でも2で終わり、JSON を書かない | スペースは終了コードを見ない（JSON の受け取りだけ）。制作エージェントは JSON が無ければ報告できない |

- 参考：T4 ブランチの先端（`5e38423`）では `qc.mjs` が `1b1bb5b` から変わっているが、変更は見出し判定の正規表現（CONTRACT §1.9 に合わせた）と、チェック行・免除行・GHOST 行の行末の空白の扱いだけで、JSON のキー・値は変わっていない。

### 3.4 `review_mode` とレビュー判定（SP-08、P1-2）

- レビュー判定（PRE-4、PRE-5、POST-4R、POST-5R、POST-6、POST-7）は、ジョブ内の `reports/qc-review.md` のチェック行（CONTRACT §1.6）で記録し、`qc.mjs` がそれを読んで `verdict` に入れる。スペースはレビュー行を自分で解析しない。
- **規則（SP-08。要件書の文言をそのまま引く）：事前・事後のレビュー判定は、可能なら制作したのとは別のモデルまたは別セッションで行う。同一モデルしか使えない場合は別セッションで行い、それも不可能なら自己レビューとして記録する。**
- 記録の仕方：別モデル・別セッション（またはオーナー）が書いた場合は `review_mode: independent`、自己レビューの場合は `review_mode: self`。`reviewer:` 行に誰が確認したか（モデル名とセッションの区別）を書く。この規則は `buildExplainerHandoff` の手順に入れる（§5.2）。
- スペースの表示：`review_mode` が `self` の QC 結果には、QC パネルとジョブカードに「自己レビュー」を表示する。自己レビューでもゲートは止めない（AM-1 の5、HN-13 置換。オーナー目視の強制に使わない）。

### 3.5 免除（EX-16）

- 免除はオーナーだけが出せる。免除の正本はジョブ内の `reports/qc-review.md` の `## 免除（オーナー記入）` 節の `- WAIVE <ID>: <理由>` 行（CONTRACT §1.6）で、`qc.mjs` がそれを読んで `waivers[]` と `status: "waived"` にする。
- **スペースは免除を記録するアクションを持たない**（スペース側に免除の第二の定義を作らない）。オーナーの操作は「PC 上の `reports/qc-review.md` に免除行を書き、制作エージェントに QC の再実行と再報告を頼む」である。スペースのクライアントは、不合格のゲートの横に、オーナーが写して使える免除行のひな形（`- WAIVE POST-5: <理由>（オーナー: <名前>、<日付>）`）を表示してよい。
- 制作エージェントは免除の節に書かない。ハンドオフ文でこれを指示する（§5.2）。

---

## 4. スペース側のデータ形状（S1・S2 が実装するもの）

### 4.1 `jobs` に足すカラム（すべて `0007` で追加）

| カラム | 型 | 既定 | 内容 |
| --- | --- | --- | --- |
| `job_kind` | TEXT enum（`JOB_KINDS = ["mv", "explainer"]`） | `'mv'`、NOT NULL | 既存行はすべて `mv`（監査 S1・S2） |
| `style_mode` | TEXT（4値） | NULL | 解説のみ（§3.2） |
| `explainer_form` | TEXT（JSON） | NULL | §3.1 のキーだけを持つ JSON |
| `explainer_design` | TEXT（JSON） | NULL | §2.2、形状は §4.3 |
| `source_files` | TEXT（JSON） | NULL | `[{ blob_key, filename, mime, size }]`（§2.3） |
| `pre_qc_json` | TEXT | NULL | 受け取った `qc-pre.json` の全文（§4.4） |
| `post_qc_json` | TEXT | NULL | 受け取った `qc-post.json` の全文 |

- 既存の `pre_check_status`／`post_check_status`／`*_detail`（監査 S5）は解説でも使う：`reportQcResult` が `verdict` から `passed`（`pass`）／`needs_fix`（`fail`）を書き、`detail` に要約（不合格のゲート ID、`review_mode`）を書く。**合否の判定は `*_qc_json` の `verdict` で行い、status カラムは表示（`JobCard` の要約）のための写し**とする。
- `production_runs`、`audio_upload_chunks` は変更しない（監査 S8・S9）。

### 4.2 `directions`（§2.1）

再作成して MV 6 軸を nullable にし、§2.1 の7カラムを nullable で足す。既存行の値・ID は保つ。

### 4.3 設計パッケージ `explainerDesignShape`（SP-04、`jobs.explainer_design`）

監査 A9 の候補に、SP-03・SP-04・AM-2 の要求を足した形。字数の上限などの細部は S2 の実働が決めてよいが、キー名と意味は変えない。

| キー | 内容 |
| --- | --- |
| `kind` | `"explainer-design"`（固定） |
| `schema_version` | `"1"` |
| `style_mode` | 確定した様式モード（§3.2） |
| `direction_choice` | `{ selected_direction_id, reason, combination_note }`。採用した候補、選んだ理由、組み合わせた場合の内容（SP-03「選択（組み合わせ可）と理由を保存」） |
| `video_title` | 動画タイトル案 |
| `takeaway` | 理解ゴール（入力が空なら案を作る） |
| `prior_knowledge` | 前提知識と想定される誤解 |
| `concept` | 何を理解させるか（理解先的設計の要約） |
| `structure_summary` | 説明構造と映像構造の対応（要件書 §2.3 の表の語で） |
| `direction_summary` | デザイン方向性の要約 |
| `differentiation_memo` | 差別化メモ |
| `material_plan` | 図解・素材の方針 |
| `narration_policy` | ナレーション・音声の方針（Aivis の有無、話者、読みの方針） |
| `scene_outline[]` | `{ section, purpose, structure_type, visual, narration_focus, style }`。`style` は `biim`／`anime`／`motion`。**`style_mode` が `mixed` のときは全要素で必須**、それ以外は省略可（省略時は `style_mode` に従う。`anime`／`motion` のジョブでは `anime` か `motion` のみ） |
| `failure_checks[]` | 要件書 §2.7 の23項目から、このジョブで特に注意するもの（最大8件。うち2件以上は字幕・ゴーストに関するもの（23項目の 12・14・21 のいずれか）） |
| `source_catalog[]` | 資料目録 `{ id, kind: "file" \| "url", ref, title }`（`file` の `ref` はファイル名、`url` は URL） |
| `form` | ジョブ生成に渡すフォーム値（`Partial<MotionForm>`）。`explainer_form` の全キーに、`design`（下記）と確定した `styleMode` を加えたもの |

- `form.design`：採用した方向性と `direction_summary` から作る、WebUI の「デザイン方向性」欄に入る文。`anime`／`motion` では §5.3 の禁止語を含めない。
- 生成方式：MV の `draftBiimDesign` の並列分割推論（部位ごとに `Promise.all`、台本チャンクの分割）を**複製して**使う（監査 §3 ◎）。台本チャンク分割は `splitLyricsChunks` を書き換えず、解説用の `splitScriptChunks` を新設する（監査 A4。見出しは `##`・`[...]` の両方を受け付ける）。
- 生成後の検査：`style_mode` が `anime`／`motion` の設計パッケージの全文に §5.3 の禁止語があればエラーにして再生成を促す（ハンドオフ文に Biim のレイアウト指示が入るのを生成時に止める）。
- 応答：`getJob` は解説ジョブにだけ `explainer_design` を返す（MV の応答には足さない）。

### 4.4 `reportQcResult`（SP-06）

```text
reportQcResult({ job_id, stage: "pre" | "post", qc_json: string })
```

1. ジョブが `explainer` でなければエラー（MV には QC JSON が無い）。
2. `qc_json` を JSON として読み、§3.3 の受け付け条件（`schema_version`・`kind`・`stage`・`mode`・`style_mode`・`verdict` と `gates[]` の整合・`generated_at` の順序）を検査する。満たさなければエラーにし、何も保存しない。
3. 受け取った文字列をそのまま `pre_qc_json`／`post_qc_json` に保存し（整形し直さない）、§4.1 の status／detail の写しを更新する。
4. 最新の `production_runs.log` に `事前QC（解説）: pass（review_mode: independent）` の形の1行を追記する。

- 解説ジョブに対する `reportQualityCheck` と、`updateProductionProgress` の pre／post 更新は拒否する（「解説ジョブの QC は reportQcResult で qc-pre.json／qc-post.json を報告する」旨のエラー）。手入力で `passed` にする経路を残さないため。
- 制作エージェントがファイルの中身を書き換えて報告することは機械では防げない。`inputs` のハッシュと `generated_at` を保存し、レビュー（G3・S4）で抜き取り照合できるようにする。

### 4.5 解説の `advanceStage` の規則（監査 A6）

拒否の3段構造は MV と同じ：

| 遷移先 | 解説ジョブで拒否する条件 |
| --- | --- |
| （共通） | 前進以外（MV と同じ規則・同じ文） |
| `in_production` | `pre_qc_json` が無い、またはその `verdict` が `pass` でない |
| `checking` | 同上 |
| `completed` | 事前が上と同じ／`post_qc_json` が無い、または `verdict` が `pass` でない／`EXPLAINER_FINAL_DELIVERABLE_KINDS` の成果物に1件でも `pending` がある |

- エラー文は解説用に新しく作る（例：`事前QC（reports/qc-pre.json）が未報告です。npm run qc -- --stage=pre の結果を reportQcResult で報告してください。`、`事前QCが不合格です（verdict: fail）。reports/qc-pre.md の不合格ゲートを直して再実行してください。`）。MV の文言は流用も変更もしない。
- `review_mode: self` でも拒否しない（§3.4）。

---

## 5. ハンドオフ文（`buildExplainerHandoff`）と非 Biim 様式の規則

### 5.1 分離の規則（MV 経路の不変条件の一部）

- `buildHandoff`（MV）は**無変更**。解説は新関数 `buildExplainerHandoff(job, dir, design, runId, model)` で作る。`startAutoProduction` の中でジョブの `job_kind` によってどちらを呼ぶかを選ぶ（監査 A10・A11）。
- `startAutoProduction` の spawnTask 指示文：MV の文字列は無変更。解説用の文字列を別の定数で持つ（「歌詞レイヤー QC 必須」の文の代わりに「事前・事後 QC（npm run qc）の結果を reportQcResult で報告する」）。`dedupeKey`（`mv-e2e-production-job-{id}`）・ラン作成・モデルのスナップショット・`already_active` の判定は無変更。
- 解説の原則の定数 `EXPLAINER_PHILOSOPHY`、QC の観点の定数（監査 A3 の `EXPLAINER_QC_RULES` に相当するもの）は新設する。ただし **QC の観点の正本はジョブ内の `AGENTS.md`（解説章）と `qc.mjs`** であり、スペースの定数は要約にとどめる。ゲートの合否条件をスペースの定数に書かない（SP-06：定義を二重に持たない）。

### 5.2 `buildExplainerHandoff` の構成（`■` 見出しは MV と同じ流儀）

```text
対象ジョブ #{id}「{title}」（解説ジョブ／様式モード: {表示ラベル}）
制作ランID（報告先 run_id の指定）
制作オーケストレーター: {モデルラベル}（勝手に切り替えるな）
■ 選択済みの方向性 … 解説の6軸（キャラなしは5軸）と様式モード、差別化
■ 解説設計パッケージ … explainerDesignToText(design)。未生成なら「draftExplainerDesign を先に実行せよ」
■ 入力 … 題材（タイトル・何を説明するか・対象視聴者）、理解ゴール、前提と誤解、構成メモ（原文）、資料目録（URL と、資料ファイルの取得方法）、メモ（原文）
■ 様式モード … §5.3 の様式別ブロック
■ 制作の原則 … 「ジョブ内の AGENTS.md の解説章（理解先的設計〜失敗チェックリスト）が正本」＋ EXPLAINER_PHILOSOPHY の要約
■ 実行手順
  0. 開始前の環境確認（SP-05）
  1. 設計が未生成なら draftExplainerDesign
  2. 配置先の決定（§8 Q-T9a-1。kokuren_future の採番は使わない）
  3. ジョブ生成 → recordProductionResult(biim_job) + advanceStage(biim_job_generated)
  4. AGENTS.md の解説工程 1〜5 → 事前 QC → reportQcResult(pre) → pass なら advanceStage(in_production)
  5. 工程 7〜12（実装・音声・preview・ghost-check）→ advanceStage(checking)
  6. 工程 13（final・ghost-check final・事後 QC）→ reportQcResult(post)
  7. 工程 14（delivery.md）→ 成果物5点を setDeliverable → 全完了かつ事後 pass のときだけ advanceStage(completed) とランを done
■ レビューと免除の規則（§3.4・§3.5）
詰まった場合: updateProductionProgress(status="blocked") ＋ 再開に必要な利用者の行動を note に具体的に
```

各手順に必ず含める内容：

- **0（SP-05）**：音声合成あり（`voiceEngine: "aivis"`）なら、Aivis エンジンの URL への疎通と、指定した全話者の Style ID が存在することを確かめる。追加 Web 調査が許可（`allowWebResearch: true`）なら、制作エージェントが Web を参照できることを確かめる。結果を `updateProductionProgress` の `log_entry` に残す。**失敗したら制作を始めず、`status="blocked"` と失敗の理由を note に書く。音声なしへ黙って切り替えない。** 確認はスペースではなく PC 側で行う（Aivis は PC 側で動くため）。
- **3（SP-04）**：ジョブは**この repo の `generateJob` と `job-template` からだけ**作る。設計パッケージの `form` を JSON ファイルに書き出し、この repo のチェックアウトで `tools/generate-job.ts`（T9b。§7）を実行して作る。T9b がまだ main に無い場合は、WebUI（BiimMotion）に `form` の値を入力して ZIP を生成する。**`job-template` の中身を手で写す・作り直すことはしない。** 生成に使った repo のコミットを `recordProductionResult(biim_job)` の記録に含める。
- **4・6（SP-06）**：ジョブのルートで `npm run qc -- --stage=pre`（事後は `post`）を実行し、`reports/qc-<stage>.json` の**全文をそのまま** `reportQcResult` の `qc_json` に渡す。不合格なら直して再実行する。`verdict` を書き換えない。
- **4・6（SP-08）**：§3.4 の規則（別モデル／別セッション／自己レビューの記録）を書く。`reports/qc-review.md` の `review_mode`・`reviewer` を正しく書く。
- **免除（EX-16）**：`reports/qc-review.md` の `## 免除（オーナー記入）` 節に書かない。走査に必要なツールが無い等で実施できない項目は不合格のまま理由を note に書き、オーナーに免除の判断を求める。
- **7（SP-05・SP-07）**：`reports/delivery.md` の `## 制作モデル` に実際に使った制作モデル（ランのモデルラベル）を書く。成果物は §2.4 の5点。TuneCore 向けのジャケットと WAV は作らない。`youtube_metadata` のチャプターと出典リストは `delivery.md` から写す。

### 5.3 非 Biim 様式のハンドオフ文に Biim レイアウト指示を入れない規則（AM-2 の6）

- **禁止語**（CONTRACT §4.6 と同じ9語）：`note_top`、`note_bottom`、`BiimScene`、`BiimOverlay`、`biim-standard`、`biim_usage`、`Biim枠`、`Biimレイアウト`、`Biim使用率`。
- **`anime`／`motion`**：`buildExplainerHandoff` が作る文（固定文・様式別ブロック・設計パッケージのテキスト化・方向性のテキスト化）に禁止語を含めない。Biim 枠・ノート欄を使う指示を、禁止語以外の言い方でも入れない。様式別ブロックには「画面全体を使う」「字幕は画面下の標準字幕（`layout.fullscreen_regions.subtitle`）」「全場面 `biim: false`、`scenes[].style` は `anime` か `motion`」「キャラの配置は `FullscreenStage` の `characterStyle`」「全画面の部品は `FullscreenStage`／`StandardCaption`／`DiagramStage`」を書く（CONTRACT §4.3・§4.8）。
  - 例外（CONTRACT §4.6 と同じ考え方）：利用者の原文（`instructions`＝メモ、構成メモ）は加工せずに写す。その中に禁止語があっても消さない。
  - 識別子の例外：`biim_job`、`biim_job_generated`、`biim_designed`（§2.4）はアクションの引数・ステージ名であり、レイアウトの指示ではないので書いてよい。
- **`biim`**：Biim 形式の指示（枠・ノート・字幕の標準 biim-standard-v1、`note_top`／`note_bottom` の記入）を書く。縦の場合は「Biim 様式の全画面（枠なし）」とする。
- **`mixed`（区間上書き）**：Biim の指示を「`scenes[].style` が `biim` の場面だけに適用する」と限定して書く。様式別ブロックに次を入れる：①区間ごとの様式は設計パッケージの `scene_outline[].style` を出発点に、`plan/storyboard.md` の `様式:` 行と `project.json` の `scenes[].style` に同じ値で書く（PRE-7 で検査）、②`anime`／`motion` の場面は `biim: false` にし、画面全体と標準字幕を使う、③Biim の場面では枠・ノート・字幕の標準を守る（PRE-8 で検査）、④様式の切り替えは説明の転換点に合わせる。設計パッケージのテキスト化では、区間ごとに様式を明示する（例：`[導入] style=anime`）。
- テスト：S2 で、`anime`・`motion` の各ジョブの見本（利用者の原文を空にしたもの）で `buildExplainerHandoff` の出力に禁止語が0件であることを確かめる。

### 5.4 方向性の生成（`generateExplainerDirections`）

- 入力：`explainer_form`（題材・理解ゴール・前提と誤解・構成メモの先頭（MV の歌詞と同じく上限を設ける）・資料目録・メモ・差別化メモ）、`EXPLAINER_PHILOSOPHY`、再生成時は旧候補のタイトル一覧（MV と同じ回避）。
- 出力：ちょうど3案。各案に §2.1 の7カラムと `title`・`description`・`differentiation`。
- 相違の規則（EX-05・EX-09）：3案は6軸のうち3軸以上で互いに異なり、かつ「説明の骨格」か「図解の核」の少なくとも一方が必ず異なる。`characterUsage: none` では「キャラの役回り」を外した5軸で同じ規則。利用者が方向性を指定している場合は、その範囲内の3つの解釈にする。
- 様式モード（AM-2 の2）：候補の `style_mode` は4値を同格に扱う（縦のジョブでは `mixed` を出さない）。`anime`／`motion` の候補の文に §5.3 の禁止語を入れない。
- 保存：`directions` の新しい行（MV 軸は NULL）。`generation` の管理・`selectDirection` は MV と同じ。

### 5.5 `designToText` の二重実装（P1-3）

- **設計パッケージをテキスト化する処理（`explainerDesignToText`）がサーバ（`buildExplainerHandoff` 用）とクライアント（コピーボタン用）の両方にある場合、両方を同じ仕様で保つ。片方だけを変えてはならない。**（監査 §1.4・A9・C5 が指摘する既存の負債。MV の `designToText` も同じ規則）
- S2 と S3 の REPORT に、両者の出力を同じ設計パッケージで比較した結果（一致）を書く。

---

## 6. 作業単位 S1〜S4

共通：各単位は G3（実装者と別コンテキストのレビュー）を通す。`DIRECTION.md`・`REPORT.md`・`REVIEW.md` は `docs/work/2026-11-13-explainer-ui-harness/space/S<n>-*/` に置き、この repo への記録コミットは L2 が行う（計画書 §9）。スペースの公開は AM-1 の考え方（機械的確認＋非実装者レビュー、オーナー目視は待たない）による。

### 6.1 S1 スキーマと移行

- **依存**：S0（U1 の実装主体・時期の回答、スペース編集権を持つ実働）、T9a（**SPACE_HANDOFF.md に P1-1 の4点（§2.1 `directions` 案 (a)、§2.2 設計パッケージ案 B、§2.3 作成経路 `createExplainerJob`、§2.4 成果物 kind 名）が確定していること**。S1 の実働は本書を読まずに着手しない）
- **対象**：`server/src/schema.ts`、`drizzle/0007_add_explainer_mode.sql`（番号は次番）、`drizzle/meta/_journal.json`

| 監査 # | 変更内容 |
| --- | --- |
| 監査 S1 | `JOB_KINDS = ["mv", "explainer"] as const`、`JobKind` 型。`STYLE_MODES = ["biim", "anime", "motion", "mixed"] as const` |
| 監査 S2 | `jobs.job_kind`（NOT NULL DEFAULT `'mv'`） |
| 監査 S3 | §2.5.1：`lyrics`／`audio_filename` の NOT NULL は外さない。§4.1 の解説カラム（`style_mode`、`explainer_form`、`source_files`、`pre_qc_json`、`post_qc_json`）を nullable で追加 |
| 監査 S4 | §2.2 案 B：`jobs.explainer_design`（nullable） |
| 監査 S5 | 変更なし（status／detail カラムを流用） |
| 監査 S6 | §2.1 案 (a)：`directions` を再作成し MV 6 軸を nullable に、解説7カラムを追加 |
| 監査 S7 | §2.4：`DELIVERABLE_KINDS` に2種追加、`MV_FINAL_DELIVERABLE_KINDS`／`EXPLAINER_FINAL_DELIVERABLE_KINDS` |
| 監査 S8〜S10 | 変更なし |
| 監査 M1〜M3 | 1本の `0007` に集約。`0001`〜`0006` は変えない |

- **MV 経路への影響と確認方法**：既存の MV 行は `job_kind = 'mv'` になり、他の値は変わらない。
  1. 移行前に、本番 DB の**バックアップ**を取る。非対話セッションでは移行の適用の手前で止めて報告する。
  2. 移行前に、既存の MV ジョブ全件（件数が多ければ代表 5 件以上。方向性あり・設計あり・成果物あり・QC 済みを含める）の `getJob` 応答と `listJobs` 応答を保存する。
  3. 移行後に同じ呼び出しをして比較する。**許す差分は各ジョブに `job_kind: "mv"` が加わることだけ**（S2 で応答に足す場合。S1 単独では差分なし）。`directions` の再作成の前後で、MV の方向性の行数・ID・各カラムの値が一致することを SQL で確かめる。
  4. 結果を `space/S1-*/REPORT.md` に書く。

### 6.2 S2 アクション

- **依存**：S1
- **対象**：`server/src/actions.ts`

| 監査 # | 変更内容 | 本書の節 |
| --- | --- | --- |
| A1 | `jobKindEnum`・`styleModeEnum`。`jobSummary`／`jobDetailResponse` に `job_kind`。解説ジョブにだけ `style_mode`・`explainer_form`・`explainer_design`・`source_files`（取得 URL つき）・QC JSON を返す。MV ジョブの応答に足すのは `job_kind` だけ | §4 |
| A2 | `EXPLAINER_PHILOSOPHY` 新設（`PHILOSOPHY` は無変更） | §5.1 |
| A3 | 解説の QC 観点の要約定数（`LYRIC_QC_RULES` は無変更）。合否条件は書かない | §5.1 |
| A4 | `splitScriptChunks` 新設（`splitLyricsChunks` は無変更） | §4.3 |
| A5 | `createExplainerJob` 新設（`createJob`／`createJobFromUpload` は無変更） | §2.3、§3.1、§3.2 |
| A6 | `advanceStage` の先頭で解説ジョブを解説の判定へ分ける。MV の判定とエラー文は無変更 | §4.5 |
| A7 | `generateExplainerDirections` 新設（`generateDirections` は無変更） | §5.4 |
| A8 | `selectDirection` 無変更 | §2.1 |
| A9 | `draftExplainerDesign`＋`explainerDesignShape`＋`explainerDesignToText`（サーバ側）新設 | §4.3、§5.5 |
| A10 | `buildExplainerHandoff` 新設（`buildHandoff` は無変更） | §5.2、§5.3 |
| A11 | `startAutoProduction`：ハンドオフの選択と spawnTask 指示文の選択だけ | §5.1 |
| A12 | `reportQualityCheck`：解説ジョブを拒否する分岐を先頭に足す（MV の処理・ラベルは無変更） | §4.4 |
| A13 | `updateProductionProgress`：解説ジョブの pre／post 更新を拒否する分岐を先頭に足す。それ以外（status・note・log）は無変更で解説にも使う | §4.4 |
| A14 | `recordProductionResult` 無変更（解説は `biim_job` だけを使う） | §2.4 |
| A15 | 無変更 | — |
| 新設 | `reportQcResult` | §4.4 |

- **既存関数への変更の範囲**：`advanceStage`・`reportQualityCheck`・`updateProductionProgress`・`startAutoProduction`・`listJobs`・`getJob` に加えてよいのは、**先頭（または応答の組み立て）での `job_kind` による振り分けの追加行だけ**。既存の行を削除・書き換えない。`buildHandoff`・`generateDirections`・`draftBiimDesign`・`designToText`（MV）・`createJob`・`createJobFromUpload`・`PHILOSOPHY`・`LYRIC_QC_RULES` は1文字も変えない。
- **MV 経路への影響と確認方法**（計画書 §9 S2 の完了条件「MV のハンドオフ文と `advanceStage` のエラー文が変更前とバイト一致」）：
  1. 変更前に、MV ジョブ（方向性・設計あり）の `buildHandoff` の出力を保存する。既存の `production_runs.handoff_text` のうち、その後ジョブの状態が変わっていないものを使ってもよい。spawnTask の MV 指示文も保存する。
  2. 変更前に、MV の `advanceStage` の拒否をすべて起こしてエラー文を保存する：後退／`in_production`（pre `pending`）／`in_production`（pre `needs_fix`）／`checking`（pre 未合格）／`completed`（pre 未合格・post 未合格・成果物 `pending` の各1件）。
  3. 変更後に同じ入力で再実行し、**バイト単位で比較**する（各出力の SHA-256 を `space/S2-*/REPORT.md` に並べる）。MV の `generateDirections` に渡すプロンプト文字列も、推論呼び出しの直前で取り出して比較する。
  4. 差分の形の確認：上で「無変更」とした関数の差分が0行、振り分けを足した関数の差分が追加行だけであることを、レビュー者が差分で確かめる。
  5. 解説側：`anime`・`motion` の見本ジョブで `buildExplainerHandoff` の出力に §5.3 の禁止語が0件。`mixed` の見本で区間ごとの様式が出力に出る。`reportQcResult` が、T4 のフィクスチャ（`tools/make-fixture.ts` の `--qc=pass`／`--qc=fail` と `--style=…`）で `qc.mjs` を実行して得た JSON を受け付け、`kind`／`stage`／`style_mode` の不一致と `verdict`／`gates` の不整合を拒否する。

### 6.3 S3 クライアント

- **依存**：S2
- **対象**：`client/src/App.tsx`（`client/src/api.ts` は編集しない。監査 §2.5）

| 監査 # | 変更内容 |
| --- | --- |
| C1 | 投入フォームの最上部に種別の切り替え（既定 MV）。解説の入力欄は §3.1 の表のとおり。様式モードの選択（§3.2 の表示ラベルと平易な説明、既定 `biim`、固定しない、縦の注意文）。送信は `createExplainerJob`。資料ファイルは `uploadAudioChunk` の分割送信を再利用 |
| C2 | §2.5.6：解説は別キー `mv-e2e-intake-draft-explainer-v1`。MV の下書きキー・型・復元は無変更 |
| C3 | `JobCard` に種別バッジ（解説）と様式モード。解説の QC 要約は「事前QC／事後QC」と `review_mode: self` の表示 |
| C4 | ステージのラベルを種別ごとの辞書に（§2.5.8）。`PipelineStepper` 本体は無変更 |
| C5 | `JobDetailView`：①`DirectionCard` の軸ラベルを種別で切り替え（解説は6軸＋様式モード、キャラなしは5軸）、②`ExplainerDesignView` 新設（`BiimDesignView` を複製して作る）とコピー用の `explainerDesignToText`（クライアント側。§5.5 のとおりサーバと同じ仕様）、③自動制作の説明文を種別で切り替え（解説で kokuren_future を書かない）、④QC パネル（C6）、⑤投入内容の表示（解説の入力、資料目録） |
| C6 | 解説の QC パネル：`qc-pre.json`／`qc-post.json` の `verdict`、ゲートの表（ID・名称・種別・適用範囲・状態・説明）、助言、免除、`review_mode`（`self` は目立たせる）、`generated_at`。手入力の記録フォームは出さない（§4.4）。不合格ゲートに免除行のひな形（§3.5） |
| C7 | 前進ボタンの無効化条件：解説は `explainer_design` の有無と QC JSON の `verdict` で判定（サーバの §4.5 の鏡像） |
| C8 | `DELIVERABLE_META` に `script_and_evidence`（台本と根拠メモ）・`subtitle_data`（字幕データ）。テキスト編集 UI をこの2種にも割り当てる。解説ジョブでは TuneCore の2種を表示しない（シードされないので出ないはずだが、表示側でも種別で絞る） |
| C9・C10 | 無変更 |

- **MV 経路への影響と確認方法**：MV の投入フォーム（種別が MV のとき）と詳細画面が変更前と同じであることを、変更前後の画面記録（スクリーンショット。証拠記録であり、オーナー目視は待たない）で比べる。MV の下書きの保存・復元（音源の再選択による再開を含む）を変更後に1回通す。

### 6.4 S4 記録・MV 非退行の総合確認・公開

- **依存**：S3
- **対象**：`DATA-PLAN.md`（解説モードの入力・成果物・QC の設計根拠を追記。過去の機能追加と同じ運用）、`space/S4-REPORT.md`
- **内容**：
  1. `DATA-PLAN.md` に、本書 §2〜§5 の決定（理由を含む）を要約して追記する。「3入力のみ」の記述は「MV は3入力、解説は §3.1」と書き分ける。
  2. MV ジョブを1件、投入から完了まで流し、全ゲート（方向性選択・事前／事後の歌詞 QC・成果物5点）が従来どおり動くことを記録する。
  3. 解説ジョブを1件（可能なら `mixed`）、投入から少なくとも事前 QC の受け取りまで流す（制作の通しはこの repo の T11 と同じ題材でよい）。
  4. 公開（機械的確認＋非実装者レビュー。オーナー目視は待たない）。
- **MV 経路への影響と確認方法**：上の2。S1・S2・S3 の各 REPORT の比較結果（getJob、ハンドオフ文、エラー文、画面）を一覧にして `space/S4-REPORT.md` に載せる。

---

## 7. SP-04 入口（T9b）の要否の結論：**要る**

**結論**：フォーム値の JSON からジョブフォルダを生成する入口 `tools/generate-job.ts`（T9b）を作る。

**理由**：

1. SP-04 は「ジョブの生成元はこの repo の `generateJob` と `job-template` だけ」を MUST にしている。U1 の現状（§1.1）では、PC 側エージェントが「Claude 経由で」ジョブを作っており、手段が指定されていない。エージェントが `job-template` を手で写したり作り直したりすると、それがスペース側（正確には PC 側）のテンプレートの複製になり、SP-04 に反する。
2. `generateJob` を使う既存の手段は WebUI だけで、エージェントが使うにはブラウザ操作（フォーム入力、ファイル添付、ZIP の保存と展開）が要り、手順が長く再現性の確認が難しい。
3. 入口があれば、設計パッケージの `form`（§4.3）をそのまま渡して1コマンドで生成でき、「WebUI の ZIP と同じ内容」をテストで保証できる。ハンドオフの手順3（§5.2）が具体的になる。
4. 費用は小さい。`tools/make-fixture.ts` が既に Node から `generateJob` を呼んでおり、依存の追加は要らない。

**T9b の前提（T9b の実働への引き渡し）**：

- **入力の形**：1つの JSON ファイル。

  ```json
  {
    "form": { "videoMode": "explanation", "title": "…", "description": "…", "audience": "…", "styleMode": "mixed" },
    "assets": { "sources": ["sources/textbook.pdf"], "character": null, "secondCharacter": null, "bgm": null, "music": null }
  }
  ```

  - `form` は `Partial<MotionForm>`。CLI は `{ ...defaults, ...form }`（`secondCharacter` は `{ ...defaults.secondCharacter, ...form.secondCharacter }`）で埋めてから `validateForm` に掛け、エラーがあれば一覧を表示して終了コード1。`MotionForm` に無いキーはエラー（スペースとのキー名のずれを検出するため）。
  - `assets` のパスは JSON ファイルの置き場所からの相対（絶対パスも受け付ける）。`Attachment` の `name` はファイル名、`size` はバイト数、`type`（mime）は CLI 内の拡張子の対応表で決め、その表を T9b の REPORT に書く。
  - MV（`videoMode: "mv"`）も同じ形で受け付ける（計画書 T9b の完了条件）。ただしスペースの MV 経路は本書では変えない（SP-09）。MV のハンドオフ文にこの入口を書き足すかは S 系統の範囲外の別判断。
- **出力**：`--out=<dir>` の下に、ZIP と同じ `<safeName(title)>/…` の構成でファイルを書く。既存のフォルダがあれば上書きせずエラー。
- **WebUI の ZIP と同内容であることの条件**：同じ `form`（`defaults` で埋めた後の値）と同じ添付のバイト列・名前・mime から、`generateJob` の ZIP を展開したものと CLI の出力フォルダで、**ファイルのパスの集合と各ファイルのバイト列が一致する**こと（ZIP のフォルダ項目と時刻は比較しない）。テンプレートは WebUI と同じ集合（`src/templates.ts` の `import.meta.glob("../job-template/**/*")` と `loadTemplates` のフォント処理）を Node で読む。`tests/generate-job.test.ts` で解説（`biim`・`anime`・`mixed` を含む）と MV の両方を表明する（計画書 T9b の検証）。
- **使う側の約束**：生成した repo のコミット（`git rev-parse HEAD`）を `recordProductionResult(biim_job)` に残す（§5.2 の手順3）。
- **T9b が main に入る前**：ハンドオフの手順3は WebUI で ZIP を生成する手順を使う（§5.2）。S2 は T9b を待たずに進められる。

---

## 8. 未決事項（スペースの実働が勝手に決めないもの）

| ID | 宛先 | 内容 | 本書の既定（回答が無い間） |
| --- | --- | --- | --- |
| Q4（計画書） | オーナー | U1：スペース版の実装主体・時期 | S1 以降は保留 |
| Q-T9a-1 | オーナー | 解説ジョブの PC 上の配置先と採番（監査 §5。kokuren_future は楽曲プロジェクトの採番） | kokuren_future の採番を使わない。配置先はメモ（`instructions`）で指定されたもの。指定が無ければ制作エージェントは `blocked` にして配置先を質問する |
| Q-T9a-2 | オーナー | キャラの 3D モデル（GLB）をスペースから渡すか | 渡さない（WebUI でも GLB は推奨で必須ではない）。PC 側に使うモデルがあればメモで指定 |
| Q-T9a-3 | PM／オーナー | 制作モデルの選択（`opus_5_5`／`fable_5_2` の2択）と階層ワークフロー（PM／オーケストレーター）の関係（監査 §1.7・§5） | 現行の2択を解説でもそのまま使う（SP-05 の要求はこれで満たす） |
| Q-T9a-4 | オーナー | スペースの表示名「MV-E2E」を変えるか（監査 §2.6） | 変えない |

---

## 9. 対応表（SP-01〜SP-09、AM-2 の6 → 本書の節）

| 要件 | 内容（要約） | 本書の節 |
| --- | --- | --- |
| SP-01 | 既存アプリにジョブ種別の選択。別アプリにしない | §1.2、§2.5.7、§4.1（`job_kind`）、§6.1（監査 S1・S2）、§6.3（C1） |
| SP-02 | 解説の入力（必須3、任意の各項目） | §3.1、§2.3（資料ファイル）、§6.3（C1・C2） |
| SP-03 | 6軸で3案、相違規則、選択と理由を保存して設計に含める | §2.1、§5.4、§4.3（`direction_choice`）、§6.3（C5①） |
| SP-04 | 設計パッケージ、生成元は `generateJob` と `job-template` だけ、入口（SHOULD） | §2.2、§4.3、§5.2（手順3）、§7（T9b の結論と前提） |
| SP-05 | MV と同じ経路で PC へ、制作モデルの選択と記録、開始前の環境確認 | §5.1、§5.2（手順0・7）、§8（Q-T9a-3） |
| SP-06 | QC ゲート（`qc-*.json` の `verdict`）、`review_mode: self` の表示、免除はオーナーのみ | §3.3、§3.4、§3.5、§4.4、§4.5、§6.2（A6・A12・A13）、§6.3（C6・C7） |
| SP-07 | 成果物5点、TuneCore 2点は生成しない | §2.4、§5.2（手順7）、§6.3（C8） |
| SP-08 | 別モデル／別セッションのレビュー、不可能なら自己レビューとして記録 | §3.4、§5.2（手順4・6） |
| SP-09 | MV の導線・ゲート・成果物を変えない | §2.3、§2.5、§5.1、§6.1〜§6.4 の「MV 経路への影響と確認方法」 |
| AM-2 の6 | `style_mode` をジョブ／ハンドオフに。非 Biim のハンドオフ文に Biim レイアウト指示を入れない | §3.2、§4.1、§4.3、§5.3、§5.4 |
| （参考）A16 | 仕様と契約の確定・引き渡し | §3（契約の写しと突き合わせ）、§6（作業単位） |
| （参考）A22 | 引き渡し仕様に `style_mode` と非 Biim の規則 | §3.2、§5.3 |
| （参考）P1-1〜P1-3 | DIRECTION の必須事項 | P1-1：§2.1〜§2.4・§6.1 の依存／P1-2：§3.4／P1-3：§5.5 |
