# REPORT — T9b フォーム JSON からジョブフォルダを生成する入口

- 作業ID: `2026-11-13-explainer-ui-harness` / 層: L3 実働 B / 基準: `75986e6`
- 実働: Codex / `gpt-6.1-sol` / effort high（起動指示の指定値）。非対話セッション。
- ブランチ: `task/T9b-job-entry`（起動時 HEAD `1076a0f`、変更なし）。切り替え・push は行わない。
- G3 は別セッションの L2 が検証を再実行して判定する。本報告は証拠の記録であり、合否判定ではない。

## 起動時チェック（2026-11-14、実装前に記録）

| 項目 | 結果 |
| --- | --- |
| 層・入力 | L3。DIRECTION、Amendment 01・02、要件書、計画書、SPACE_HANDOFF §7 を確認 |
| サブエージェント | ツールあり・使用可。本タスクでは使用しない（下請けなし） |
| コマンド | 実行可。Node `v24.15.0`、npm `11.12.1`。初回 `npm test` は依存未導入のため jszip 解決失敗。`npm ci` 成功（34 packages）。再実行した既存テストは72件成功、失敗0 |
| 対話 | 起動指示に従い非対話で進行。質問は既定の判断とともに本報告に残す |
| ネットワーク | npm registry の HTTP HEAD 200、`npm ci` 成功。README 記載の公開 Pages も HTTP HEAD 200（最初に推測した URL は404のため README の正しい URL で再確認） |
| ヘッドレス Chrome | Chrome のインストールを確認。headless の起動コマンドは終了0、DOM 出力は得られず動作の実証は未実施。本タスクは UI 変更なしのため使用不要 |
| Aivis・GPU | 本タスクの対象外（未検証） |
| 縮退レベル | 0。L2 と実働は別セッション、コマンド・依存導入が利用可能。非対話は WORKFLOW §5 の運用を適用。自己判定になるゲート: なし |

## 実装の概要

- コード・テストのコミット: `6b14afc`（`Add generate-job CLI that builds job folders from form JSON`）。報告は別コミット。
- 実行形: `node --experimental-strip-types tools/generate-job.ts <input.json> --out=<dir>`。引数の順序はどちらでもよい。`--help` は使用法を表示して終了0、それ以外の入力・実行エラーは理由を stderr に出して終了1。
- JSON の `form` は必須。`assets` とその各キーは省略可能（資料は空配列、単独添付はなし）。UTF-8 の BOM も受け付ける。
- `{ ...defaults, ...form }` と、`secondCharacter` の `{ ...defaults.secondCharacter, ...form.secondCharacter }` を使う。モード・様式切り替え関数による補正は入れず、指定されたマージ後の値をそのまま `validateForm(form, assets)` と `generateJob` に渡す。
- `defaults` の自身のキーを `MotionForm` の実行時のキー一覧として使う。`secondCharacter` も再帰的に未知キーを拒否する。JSON の値の型を検査してから `validateForm` を呼び、エラーの一覧を改行区切りで表示する。既存 `src/job.ts` の検証・生成ロジックは変更していない。
- 添付は JSON の所在ディレクトリから相対解決し、絶対パスも受け付ける。名前は basename、サイズは読み込んだバイト数、mime は下表。`--out` の相対パスは実行時の作業ディレクトリから解決する。
- テンプレートはスクリプトの所在を基準に `job-template/` を UTF-8 で読み、Vite の glob と同様にドット項目と `node_modules` を除外する。`src/font-assets.json` の全フォントを `public/job-assets/fonts/` からバイナリで読み、WebUI と同じ SHA-256 を確認して上書きする。テンプレートの複製や依存追加はない。
- `generateJob` が返した ZIP のファイルを展開するため、生成物を別実装で組み立てない。ZIP 全体の出力先が `<safeName(title.trim())>/…` の下に収まることを事前に検査する。既存の出力先は `lstat` で拒否し、非再帰の `mkdir` と `wx` 書き込みでも上書きを防ぐ。
- MV は同じ入口で受け付ける。音源と正の `musicDurationSec` は既存の `validateForm` に従う（尺の自動測定は追加しない）。MV ハンドオフ文、制作原則・工程・QC 規則、スペースの S 系統は変更していない。

### 添付の mime 拡張子対応表

拡張子は小文字化して照合する。表にない拡張子・拡張子なしは `application/octet-stream`。

| 拡張子 | mime |
| --- | --- |
| `.pdf` | `application/pdf` |
| `.txt` | `text/plain` |
| `.md` | `text/markdown` |
| `.csv` | `text/csv` |
| `.tsv` | `text/tab-separated-values` |
| `.json` | `application/json` |
| `.html`, `.htm` | `text/html` |
| `.png` | `image/png` |
| `.jpg`, `.jpeg` | `image/jpeg` |
| `.gif` | `image/gif` |
| `.webp` | `image/webp` |
| `.svg` | `image/svg+xml` |
| `.glb` | `model/gltf-binary` |
| `.mp3` | `audio/mpeg` |
| `.wav` | `audio/wav` |
| `.ogg` | `audio/ogg` |
| `.m4a` | `audio/mp4` |
| `.aac` | `audio/aac` |
| `.mp4` | `video/mp4` |
| `.webm` | `video/webm` |
| `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `.pptx` | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |

## 検証の結果

### 自動テスト・ビルド

- `node --experimental-strip-types --test tests/generate-job.test.ts`: 9件成功、失敗0。
- `npm test`: 81件成功、失敗0（既存72件、新設9件）。既存の MV 5件、ghost 全10件、imagegen 全3件を含む。
- `npm run build -- --base=/BiimMotionWebUI/`: 終了0。チャンクサイズの既存の警告あり。
- 新設テストの比較元は Vite の `ssrLoadModule` で実行する実際の `src/templates.ts`。フォントの HTTP 取得だけローカルのバイト列で代替し、`loadTemplates` 自体のハッシュ検証を通す。CLI の読み込み処理を比較元に再利用していない。
- 解説 `biim`・`anime`・`motion`・`mixed` と MV の5経路で、同じマージ後のフォーム・添付から `generateJob` の ZIP を作り、ディレクトリ項目と時刻を除いたパス集合と全ファイルのバイト列を CLI 出力と比較。フォント原本のバイト列、資料名の重複、非ASCII名、バイナリ資料、大文字拡張子、未知拡張子、相対・絶対の添付パス、別の作業ディレクトリからの実行、部分的な2人目設定、構成メモと歌詞の原文も含む。
- 追加の検査は最小フォーム（assets 省略）、不正 JSON・型・未知キー（入れ子と自身のキーでないものも含む）、`validateForm` のエラー一覧、音源なし MV、資料の欠落、既存の空フォルダ・通常ファイル、引数エラー。失敗時に出力を新設していないことを確認。5経路の再実行では編集した `brief.md` を含む全ファイルが保持されることを比較。

### CLI の実実行（ローカルの未追跡領域）

サンプル入力は `.agent-work/T9b-cli-smoke-20261114/input.json`。同じ階層の `sources/textbook.txt` に検証用資料を作成した。

```json
{
  "form": {
    "videoMode": "explanation",
    "title": "T9b 虹:仕組み?",
    "description": "虹の仕組みを説明する",
    "audience": "中高生",
    "styleMode": "mixed"
  },
  "assets": {
    "sources": ["sources/textbook.txt"],
    "character": null,
    "secondCharacter": null,
    "bgm": null,
    "music": null
  }
}
```

```sh
node --experimental-strip-types tools/generate-job.ts .agent-work/T9b-cli-smoke-20261114/input.json --out=.agent-work/T9b-cli-smoke-20261114/jobs
```

- 初回: 終了0、`jobs/T9b 虹-仕組み-/` の下に68ファイル。直下に `assets/`、`motion-kit/`、`output/`、`plan/`、`reports/`、`runtime/`、`scenes/`、`sources/` と `AGENTS.md`、`brief.md`、`LICENSE`、`package.json`、`project.json`、`README.md` がある。
- 同じコマンドの再実行: `Output already exists`、終了1。`project.json` の SHA-256 は前後とも `C0810D6C5759BEDB4159F9D92773A8375BF14007498E96340A03E69B7EB1E636`。
- 同じ場所の `unknown.json` に必須3項目と未知の `form.style_mode` を入れ、出力先を `unknown-output` として実行: `Unknown key: form.style_mode`、終了1。`unknown-output` は存在しない。

## C-1〜C-8 の記録

| 条件 | 結果・確認方法 |
| --- | --- |
| C-1 | `npm test`: 81件成功、失敗0 |
| C-2 | `npm run build -- --base=/BiimMotionWebUI/`: 終了0 |
| C-3 | `git diff --check 75986e6...HEAD`: 出力なし。記録追加の staged 差分も基準を指定して検査 |
| C-4 | 全件テスト内で既存 MV 5件・ghost・imagegen を実行。`git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts` は差分なし。`git diff -U0 955fa5c -- tests/job.test.ts` の削除行は既に統合済みの motion-kit 数 `12` → `15` の1行だけ。`75986e6` からは既存テストの変更なし |
| C-5 | `git diff --stat 75986e6...HEAD` は発注済み DIRECTION と下記3ファイルだけ。`src/`、`job-template/`、既存テスト、`package.json` は基準から差分なし |
| C-6 | 計画書の2つの grep と同じ正規表現を PowerShell `Select-String` で追加行に適用。絶対パス・メール・認証情報の検出なし。帰属行はコミットメッセージにだけ記載 |
| C-7 | `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の既存の中身を読み込んでいない。検証は npm・Node の実行出力と、自分で生成した一時領域のジョブで実施 |
| C-8 | `git diff --exit-code 75986e6 -- docs/work/2026-11-13-explainer-ui-harness/PLAN.md docs/requirements/ORCHESTRATION_PLAN.md`: 差分なし |

## 変更ファイル

- `tools/generate-job.ts`（新設）
- `tests/generate-job.test.ts`（新設）
- `docs/work/2026-11-13-explainer-ui-harness/tasks/T9b/REPORT.md`（新設）

基準との差分には L2 が先にコミットした `tasks/T9b/DIRECTION.md` も含む。本セッションでは変更していない。共有 ENVIRONMENT、計画・要件・Amendment に変更なし。push・マージ・G3 判定は実施していない。

## 判断したこと・質問（非ブロッキング）

- 入力のキー名ずれを早く検出するため、フォームだけでなく JSON 最上位と assets の未知キーも拒否する。添付なしの最小入力を扱えるよう assets の省略は許可した。
- 不正な型で既存関数が例外になるのを避けるため、defaults の型に基づく構造検査を先行する。選択肢・範囲・モードごとの意味の検証は既存 `validateForm` に委ねる。
- 出力中の I/O エラーでは生成途中のフォルダを自動削除しない。理由を表示し、再実行は既存フォルダとして拒否する（取り消しにくい削除を追加しない）。
- UI 差分がないためスクリーンショットは追加しない。L2 の別セッションによる G3 再検証を依頼する。ブロッキングの質問、指示からの逸脱、下請けに出した範囲はない。

使う側の約束は SPACE_HANDOFF.md §7 のとおり。
