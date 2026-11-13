# DIRECTION — T9b フォーム JSON からジョブフォルダを生成する入口

- 作業ID: `2026-11-13-explainer-ui-harness`
- あなたは **L3 実働 B（Codex、非対話セッション、モデル `gpt-6.1-sol`、effort high）**です。実装するのが仕事です。レビュー（G3）は L2 が検証コマンドを再実行して行うため、**自分で自分の成果物を合格と判定してはいけません**。
- サブエージェントの使用は可（L4 下請け）。使う場合は REPORT.md に記録すること。
- 表示名は **`BiimMotion` 確定**です（Amendment 02、オーナー決定 2026-11-13 20:36）。暫定扱いにしないこと。repo 名・Pages URL・ビルドの base パス `/BiimMotionWebUI/`・package 名は識別子であり、表示名とは別物で変えません。

## 最初に読むもの（この順で）

1. `docs/requirements/2026-11-13-amendment-01.md`（最優先。AM-1 目視ゲート廃止、AM-2 様式自由度）
2. `docs/requirements/2026-11-13-amendment-02.md`（表示名 `BiimMotion` 確定）
3. `docs/requirements/2026-11-13-explainer-ui-harness.md`（要件書。特に §2.6 ゲートと助言の線引き、SP-04）
4. `docs/requirements/ORCHESTRATION_PLAN.md`（計画書。§5.1 T9b がこのタスク票の正本。§5.0 共通条件、§6.1 ブランチも読むこと）
5. `docs/work/2026-11-13-explainer-ui-harness/SPACE_HANDOFF.md` **§7**（T9a の結論と T9b への引き渡し条件。**本タスクの仕様の正本**。§7 の条件はすべて守ること）
6. `src/job.ts`（自分の worktree 内の現行版。T5-2・T5b の変更が入っている。`generateJob`・`validateForm`・`defaults`・`MotionForm` の定義を確認する。**読むだけで、変更しない**）
7. `src/templates.ts`（テンプレートの読み込み方。`import.meta.glob("../job-template/**/*")` と `loadTemplates` のフォント処理。読むだけ）
8. `tools/make-fixture.ts`（Node から `generateJob` を呼ぶ既存の前例。読むだけ）

## 作業ブランチと基準コミット

- あなたの repo ルートは、この DIRECTION.md がある worktree です。ブランチは `task/T9b-job-entry` で、`75986e6`（第1波統合と G4-α の G3 記録まで入った main 相当の先端）から分岐済みです。**ブランチを切り替えないこと**。
- `<BASE>` = `75986e6`。検証コマンドの `git diff <BASE>...HEAD` にはこの値を使うこと。差分には L2 による発注記録（本 DIRECTION.md のコミット）も含まれるが、完了条件の判定には影響しない。
- コミットは計画書 §5.4 の流儀（英語・命令形の件名、1コミット＝1つの論理的変更、テストは対象の変更と同じコミット）に従うこと。件名の例：`Add generate-job CLI that builds job folders from form JSON`。各コミットで C-1・C-2 が通ること。コミットメッセージの末尾に規定の帰属行を付けること（書式は過去のコミットの末尾を参照。ファイルには書かない）。
- **push はしないこと**。main へのマージ・直接 push・強制 push は禁止。スペース版（S0〜S5）には触れないこと。

## 起動時チェック（計画書 §8.1）

最初に §8.1 の起動時チェックを行い、結果を自分の REPORT.md（後述）に記録すること（層、エージェント製品・モデル・effort、サブエージェントの可否、コマンド実行、対話、ネットワーク、ヘッドレス Chrome）。縮退レベルを決め、理由と自己判定になるゲート（なしのはず）を REPORT.md に書いてから作業に入ること。**共有の `ENVIRONMENT.md` は同時編集しない**（起動時チェック行は L2 が統合時に集約する）。

## 対象

- `tools/generate-job.ts`（新設。`generateJob` と `job-template` を使い、**テンプレートを複製しない**）
- `tests/generate-job.test.ts`（新設）

### 触らない範囲

- `src/` の全部（`src/job.ts` を含む。入口は `generateJob` を使うだけ。`job.ts` の変更が必要と分かった場合は、変更せずに止めて REPORT.md に記録し、L2 の判断を待つこと）
- `src/App.tsx`（T9b は UI に影響しない）
- `job-template/`（複製も変更もしない）
- 既存のテストファイル（`tests/generate-job.test.ts` の新設のみ）

## 仕様（SPACE_HANDOFF.md §7 の条件をすべて転記）

- **入力の形**：1つの JSON ファイル。

  ```json
  {
    "form": { "videoMode": "explanation", "title": "…", "description": "…", "audience": "…", "styleMode": "mixed" },
    "assets": { "sources": ["sources/textbook.pdf"], "character": null, "secondCharacter": null, "bgm": null, "music": null }
  }
  ```

  - `form` は `Partial<MotionForm>`。CLI は `{ ...defaults, ...form }`（`secondCharacter` は `{ ...defaults.secondCharacter, ...form.secondCharacter }`）で埋めてから `validateForm` に掛け、エラーがあれば一覧を表示して終了コード1。`MotionForm` に無いキーはエラーにする（スペースとのキー名のずれを検出するため）。
  - `assets` のパスは JSON ファイルの置き場所からの相対（絶対パスも受け付ける）。`Attachment` の `name` はファイル名、`size` はバイト数、`type`（mime）は CLI 内の拡張子の対応表で決め、**その対応表を REPORT.md に書く**。
  - MV（`videoMode: "mv"`）も同じ形で受け付ける（計画書 T9b の完了条件）。ただしスペースの MV 経路は変えない（SP-09）。**MV のハンドオフ文にこの入口を書き足さない**（S 系統の範囲外の別判断）。
- **出力**：`--out=<dir>` の下に、ZIP と同じ `<safeName(title)>/…` の構成でファイルを書く。既存のフォルダがあれば上書きせずエラー。
- **WebUI の ZIP と同内容であることの条件**：同じ `form`（`defaults` で埋めた後の値）と同じ添付のバイト列・名前・mime から、`generateJob` の ZIP を展開したものと CLI の出力フォルダで、**ファイルのパスの集合と各ファイルのバイト列が一致する**こと（ZIP のフォルダ項目と時刻は比較しない）。テンプレートは WebUI と同じ集合（`src/templates.ts` の `import.meta.glob("../job-template/**/*")` と `loadTemplates` のフォント処理）を Node で読む。
- **テスト**：`tests/generate-job.test.ts` で、同じフォーム値から `generateJob` の ZIP と CLI の出力フォルダがファイル単位で一致することを表明する。対象は**解説（`biim`・`anime`・`mixed` を含む）と MV の両方**。
- **使う側の約束**（生成した repo のコミット `git rev-parse HEAD` を `recordProductionResult(biim_job)` に残す、SPACE_HANDOFF.md §5.2 の手順3）はスペース側の話なので、**本タスクでは実装しない**。REPORT.md に「使う側の約束は SPACE_HANDOFF.md §7 のとおり」とだけ書くこと。

## 完了条件

- フォーム JSON（解説・MV）からジョブを生成できる
- WebUI の ZIP と同内容であることがテストで表明されている（解説は `biim`・`anime`・`mixed` を含む）
- 依存の追加なし（`package.json` の差分なし）
- C-1〜C-8（下記）

## 検証

- `npm test`（`tests/generate-job.test.ts` を含む全件）
- サンプルの入力 JSON を1つ作って CLI を実際に実行し、出力フォルダの構成（`<safeName(title)>/…`）と、既存フォルダがある場合に上書きせずエラーになることを REPORT.md に記録すること
- 未知キー（`MotionForm` に無いキー）を含む JSON が終了コード1 で拒否されることも REPORT.md に記録すること
- C-1〜C-8

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

`docs/work/2026-11-13-explainer-ui-harness/tasks/T9b/REPORT.md` に次を書く。**合否判定はしない**。

- 起動時チェックと縮退レベル
- 実装の概要（入力 JSON の扱い、`defaults` の埋め方、未知キーの拒否、添付の mime 拡張子対応表）
- 検証の結果（`npm test` の件数、CLI の実実行の記録、上書き拒否・未知キー拒否の確認）
- C-1〜C-8 の結果
- 変更ファイルの一覧
- 判断したこと・質問（非ブロッキング。既定の判断で進めたもの）

## 禁止事項

- push しない。自己合格禁止。承認カードが出たら止めて報告する。
- MV の制作原則・工程・検証の仕様変更はしない（N1）。MV に QC 規則を追加しない（N10）。ゲートと助言の線引きを変えない（設計思想の宣言を守る）。
- 計画書・要件書・Amendment を変えない。共有の `ENVIRONMENT.md` を編集しない。
- テンプレートを複製しない。依存を追加しない。
