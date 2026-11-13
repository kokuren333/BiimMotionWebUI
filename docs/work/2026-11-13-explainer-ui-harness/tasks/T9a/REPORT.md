# T9a 実装記録 — スペース版への引き渡し仕様

作業ID: `2026-11-13-explainer-ui-harness`。担当: L3 実働 A（Claude Code、Opus 5.5 / effort medium、非対話セッション）。G3 は L2 が行う。本記録は作業と検証の証拠であり、自己合格の判定ではない。

## 起動時チェック（計画書 §8.1）

| 項目 | 結果 |
| --- | --- |
| 層 | L3 実働 A（DIRECTION.md で確認） |
| エージェント製品・モデル・effort | Claude Code、Opus 5.5、effort medium |
| サブエージェント | 起動できる環境。**今回は使っていない**（L4 下請けなし） |
| コマンド実行 | 可。`node -v` v24.15.0、`npm -v` 11.12.1、`git --version` 2.54.0.windows.1 |
| 対話 | 不可（非対話セッション）。質問は本記録に書き、既定で進めた |
| ネットワーク | `npm ci` 終了コード0（依存の取得に成功） |
| ヘッドレス Chrome・Aivis・GPU レンダー | 本タスクでは不要。確認していない |
| ブランチ | `task/T9a-handoff`（切り替えていない）。開始 HEAD `5814dc3`、`<BASE>` = `2a7d209` |

**縮退レベル：0**（標準）。理由：コマンド実行・ネットワークとも可。G3 は L2 が別コンテキストで行う。自己判定になるゲート：なし。

## 読んだもの

DIRECTION の順：Amendment 01・02、要件書（§2.6・§2.10、U1、A16 を含む）、計画書（§0〜§2、§5.0、§5.1 T9a・T9b、§8、§9）、T1 の `CONTRACT.md`、T0 のスペース監査の写し `audit-space.md`、T4 の `qc.mjs`、T5 の `REPORT.md`。補足として T5 worktree の `src/job.ts`（`MotionForm`・`generateJob`・`agentPromptFor` のシグネチャ）と `src/templates.ts` の冒頭を読んだ（読むだけ）。

- DIRECTION の相対パス `../BiimMakerWebUI-wt/T1/…` は、この worktree からは1階層多い。実際には隣接 worktree `../T1/…`、`../T0/…`、`../T4/…`、`../T5/…` にあった（T5 の記録と同じ読み替え）。
- T1 worktree の HEAD は `8d8ba75`（DIRECTION の指定どおり）。CONTRACT.md は存在した。
- T4 worktree の HEAD は `5e38423` で、`qc.mjs` は `1b1bb5b` から変わっている。`git diff 1b1bb5b HEAD -- job-template/runtime/scripts/qc.mjs` で差分を確認し、`1b1bb5b` の内容を基準に突き合わせた（差分は正規表現だけで、JSON の形は不変）。
- 他の worktree・メインのチェックアウトの `.agent-work/` には書き込んでいない。

## 成果物

- `docs/work/2026-11-13-explainer-ui-harness/SPACE_HANDOFF.md`（新設）
- 本記録

## P1-1 の4点の決定と理由（SPACE_HANDOFF.md §2）

| # | 決定 | 理由（要約） | 記載箇所 |
| --- | --- | --- | --- |
| ① `directions`（監査 S6） | **案 (a)**：MV 6 軸を nullable 化し、解説軸7カラム（`intro_type`、`explanation_skeleton`、`diagram_core`、`character_role`、`visual_style`、`tempo_shape`、`style_mode`）を追加 | 既存 MV 行と `directionShape`、`selectDirection` が無変更。(b) は MV 行の移し替えと MV の保存処理の書き換えが要る。(c) は `selected_direction_id` の参照先が2つになり `selectDirection`・`deleteJob` に手が入る | §2.1 |
| ② 設計パッケージの格納先（監査 S4） | **案 B**：`jobs.explainer_design` を新設 | 検証が単純で、MV の `biim_design` の読み書きが変わらない。案 A は印の無い既存 MV の JSON のため判別共用体（推測を含む）が要り、MV の読み出し経路に手が入る | §2.2 |
| ③ 作成経路（監査 A5） | **`createExplainerJob` を新設**。既存の `createJob`／`createJobFromUpload` に分岐を入れない | 解説は音源を伴わない。既存アクションに分岐を入れると MV の必須検証・タイトルの由来・エラー文のバイト不変の確認が難しくなる。資料ファイルは `uploadAudioChunk` を無変更で再利用 | §2.3 |
| ④ 成果物 kind 名 | `final_video`／`youtube_thumbnail`／`youtube_metadata`（既存）、`script_and_evidence`／`subtitle_data`（新設）。TuneCore の2種は解説で生成しない | SP-07 の5点と1対1。監査の案（`explainer_script`・`evidence_notes` の2つに分ける）は SP-07 の「台本と根拠メモ」1点と数が合わないため1つにまとめた（計画書 D-9「kind 名は S1 で決める」を本書で前倒しして確定） | §2.4 |

- S1 の依存に「SPACE_HANDOFF.md に①〜④が確定していること」を足した（SPACE_HANDOFF.md §0 の完了条件3、§6.1 の依存）。
- 付随して確定したこと（§2.5）：`jobs.lyrics`／`audio_filename` の NOT NULL は外さない（`jobs` の再作成を避ける。解説行は空文字）、入力は `explainer_form`（`MotionForm` のキー名の JSON）、`generateExplainerDirections`／`draftExplainerDesign`／`reportQcResult` の新設、解説の下書きは別キー（監査 C2 の版上げ推奨から変えた。理由は MV の下書き復元を無変更にするため）、ステージラベルは種別ごと。

## P1-2・P1-3 の記載箇所

- P1-2（SP-08 の別モデル／別セッション規則）：SPACE_HANDOFF.md §3.4（要件書 SP-08 の文言をそのまま引用）、ハンドオフ手順への組み込みは §5.2。
- P1-3（`designToText` の二重実装の注意）：SPACE_HANDOFF.md §5.5。

## SP-04／T9b の要否：**要る**

理由（SPACE_HANDOFF.md §7）：SP-04 の MUST（生成元は `generateJob` と `job-template` だけ）に対し、U1 で判明した現状は「PC 側エージェントが Claude 経由で生成」で手段が指定されておらず、手で写すとテンプレートの複製になる。WebUI のブラウザ操作は手順が長く再現性の確認が難しい。`tools/make-fixture.ts` が既に Node から `generateJob` を呼んでおり、依存の追加なしで作れる。T9b の前提（入力 JSON の形、`defaults` での補完と未知キーの拒否、出力の構成、WebUI の ZIP と同内容であることの条件、T9b が main に入る前の代替手順）は §7 に書いた。

## CONTRACT と `qc.mjs`（`1b1bb5b`）の突き合わせ

一致：トップレベル13キー、`kind` 固定値、`verdict` の決め方、`review_mode`・免除行の正規表現、ゲート ID・名称・`kind`・`scope`、MV での挙動、`.md` の「判定:」行。

食い違い（両方を SPACE_HANDOFF.md §3.3 に記録。どちらが正かは決めていない。L2／T4 の判断事項）：

| # | CONTRACT | `qc.mjs` |
| --- | --- | --- |
| D1 | POST-2 は「`not-applicable` 以外がすべて合格」 | 事前項目の `waived` を合格側に数える。その免除は事後の `waivers[]` にも載る |
| D2 | `gates[].scene_ids` は不合格の原因の場面 | PRE-8 は合格時にも Biim 枠の場面を入れる |
| D3 | `ADV-PRE-*` は pre 段階 | 事後でも事前項目を再実行するため `qc-post.json` に出る |
| D4 | `inputs` のファイル一覧（§2.2.2） | 加えて PRE-3 が読んだ `sources/…`。`ghost-check.json` は POST-1 後のハッシュ |
| D5 | `detail` の例は日本語 | `detail` は英語の文 |
| D6 | 終了コード2は `--stage` 不正と `project.json` 読めないとき | `runQC` 外へ出た他の例外でも2（JSON を書かない） |

スペースはどちらでも壊れない読み方（`verdict` だけで合否、`detail` を解析しない、`inputs` は開いた辞書、等）をするよう §3.3 で指定した。

## U1 の現状と S1 以降の保留

- U1 の現状（生成方法は判明、実装主体・時期は未決）：SPACE_HANDOFF.md §1.1。S0 はオーナー／L2 の仕事で T9a の範囲外と明記。
- **S1 以降は保留**（計画書 Q4 の既定）：SPACE_HANDOFF.md 冒頭の表「状態」と §1.1。スペース版のソースには一切触れていない（この repo からも見えない）。

## 質問（非対話のため既定で進めたもの）

- Q-T9a-1〜4（配置先、GLB、制作モデルと階層ワークフロー、スペース表示名）を SPACE_HANDOFF.md §8 に既定つきで記録した。`QUESTIONS.md` は触らない範囲なので、転記は L2 の判断。
- DIRECTION の相対パスの1階層のずれ（上記「読んだもの」）。内容は指定のコミットと一致していたので作業を止めなかった。

## 検証

| 条件 | 結果 |
| --- | --- |
| C-1 `npm test` | 終了コード0。tests 29 / pass 29 / fail 0 |
| C-2 `npm run build -- --base=/BiimMotionWebUI/` | 終了コード0（既存の 500kB 超チャンク警告のみ） |
| C-3 `git diff --check` | 出力なし（下の「コミット前の確認」） |
| C-4 | `git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts` 終了コード0。`tests/job.test.ts` の削除行の grep は出力なし。本タスクは `tests/` を変更していない |
| C-5 | ファイル一覧は本タスクの2ファイルと、L2 の発注記録（`tasks/*/DIRECTION.md` 10件）だけ。触らない範囲の変更なし |
| C-6 | 計画書 §5.0 の2つの grep とも一致0件 |
| C-7 | `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の既存の中身は読んでいない。`npm ci`・`npm test`・`npm run build` の実行で使っただけ |
| C-8 | 計画を変えていないので対象外（`PLAN.md` に変更なし） |
| 対応表 | SPACE_HANDOFF.md §9 に SP-01〜SP-09・AM-2 の6 の対応表を置いた |

### コミット前の確認

コミットは1件にまとめるため、C-3〜C-6 は2ファイルを `git add` した状態で、基準 `2a7d209` に対する staged の差分（`git diff --cached 2a7d209`、コミットの内容と同じ）に対して実行した。

- C-3：`git diff --cached --check 2a7d209` 出力なし（終了コード0）
- C-4：上表のとおり
- C-5：`git diff --cached --stat 2a7d209` は 12 ファイル（本タスクの `SPACE_HANDOFF.md`・`tasks/T9a/REPORT.md` と、L2 コミット済みの `tasks/{T0,T1,T2,T3,T4,T5,T5b,T5-4,T8a,T9a}/DIRECTION.md`）
- C-6：パス・メールの grep、認証情報の語の grep とも一致なし（終了コード1）

コミット後の `<BASE>...HEAD` での再実行結果は最終メッセージで報告する（本記録をもう1コミットで直さないため）。

## 禁止事項の遵守

- push・main へのマージ・強制 push なし。スペース版（S1 以降）に触れていない。`src/`・`job-template/`・`tests/`・`tools/`・`docs/requirements/`・CONTRACT.md・他タスクのフォルダ・ルート README／VERIFICATION を変更していない。承認カードの操作なし。
- G3 の判定は行わない（L2）。
