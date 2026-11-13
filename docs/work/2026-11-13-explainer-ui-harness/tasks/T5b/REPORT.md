# T5b 実装記録

作業ID: `2026-11-13-explainer-ui-harness`。担当: L3 実働 B（Codex、指定モデル `gpt-6.1-sol` / effort high、非対話セッション）。本書は実装と検証コマンドの証拠であり、G3 判定は行わない。L2 が別コンテキストで再実行して判定する。

## 起動時チェック

- ブランチ `task/T5b-motion-kit`、開始 HEAD `e7e24b4`、基準 `2a7d209`。開始時の作業ツリーはクリーン。ブランチ切り替えなし。
- コマンド実行可: Node `v24.15.0`、npm `11.12.1`、Git `2.54.0.windows.1`。
- サブエージェント機能は利用可能。本作業では使用しない。
- 指示どおり非対話として実施。ヘッドレス Chrome・Aivis・GPU レンダーは不要のため未確認。
- 初期状態に依存フォルダなし。`npm ci`: 終了コード0、34 packages added。ネットワーク経由の依存取得成功。audit 通知あり（依存変更は対象外）。
- 縮退レベル0。自己判定になるゲートなし。G3 は L2 に残す。
- 指定順に Amendment 01・02、要件書、計画書、T1 契約、T3 AGENTS、T5 記録、T4 交差レビューを参照。指定相対パスの余分な階層を除いた隣接 worktree `../T1/`・`../T3/`・`../T5/`・`../T4-review/` を読み取り専用で使用。
- T1 契約 §4.8 の3部品と API、T3 の様式モード・実装規則を確認。T4 レビューの m2 に従い、非 Biim のシーンコードに差し替えたフィクスチャで検証する。
- 表示名 `BiimMotion` は確定。識別子・base パスは変更しない。
- `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の既存の中身は読み込んでいない。検証コマンドによる依存利用・生成のみ。

## 依存コミットの取り込み

指定順に以下の10件を cherry-pick。競合なし。取り込みコミットは履歴に残している。

| 依存 | 元コミット | このブランチの取り込みコミット |
| --- | --- | --- |
| T4-1 | `15b42a7` | `c7fbb7b` |
| T4-2 | `1b1bb5b` | `b79f531` |
| T4-3 | `70a51de` | `dbd2c8f` |
| T4-4 | `5e38423` | `9c83b5a` |
| T3 | `e9f6429` | `e43981e` |
| T3 記録 | `ded399b` | `f177310` |
| T3 レビュー | `759be8d` | `99c5ba5` |
| T5-1 | `5177bbc` | `3c8b56a` |
| T5-2 | `1f7099a` | `f8d6746` |
| T5-3 | `424bc75` | `29c0417` |

- T4-4 まで取り込んだ直後の `git diff --check 2a7d209...HEAD`: 出力なし、終了コード0。T4-1 の末尾空行問題を持ち越していない。
- T3 取り込み後、AGENTS の様式モード節・実装規則、および `FullscreenStage`・`StandardCaption`・`DiagramStage` の記述を確認。手編集なし。
- T5-3 取り込み後、部品追加前の `npm test`: 終了コード0、tests 71 / pass 71 / fail 0。

## 実装内容

- `job-template/motion-kit/FullscreenStage.tsx`: 契約 §4.8 の Props。全画面の背景と独立したキャラ2層。初期座標は `fullscreen_regions`、`characterStyle` / `secondCharacterStyle` で移動・拡縮・重なり順を変更でき、初期領域でクリップしない。キャラなし・solo / duo の設定に従う。
- `job-template/motion-kit/StandardCaption.tsx`: 既存 `Captions` に `enabled={false}` を渡し、全画面字幕の座標・書体・文字サイズ・話者色・白ふちをそのまま使う。MainVideo の自動字幕との二重表示を避けるコメントを記載。
- `job-template/motion-kit/DiagramStage.tsx`: 全画面から字幕と必要なキャラ領域を避けた候補矩形を求め、基準座標の余白を引いた面積が最大の矩形を使う。既定は字幕を予約、キャラ予約は登場設定に従い、余白48。予約を個別に解除できる。横・縦と2人の配置に対応。
- 3部品すべて文字の層に `textLayerStyle` を使用。stage / diagram は `stageRootStyle` で分離。既存 motion-kit・runtime は変更していない。
- `tests/job.test.ts`: 既存行の変更は TSX 数の `12` → `15` の1行のみ。末尾へ実際の配布 TSX を読み出すテストを1件追記。横・縦の字幕描画と既存 Captions の一致、話者色、固定文字サイズ、キャラの移動・重なり順、図解と字幕・キャラの非交差、予約解除・余白の基準座標、キャラなしの既定を検査。
- 非 Biim スターターの製品追加は不要と判断。既存シーン・`src/job.ts`・`src/App.tsx` の手編集なし。検証用シーンは一時フィクスチャだけに差し込む。

## 同梱数と T5-4 への引き継ぎ

- motion-kit の `.tsx` の実数は **15**（従来12＋今回3）。`.ts` の補助ファイルは数えない。
- 部品名は **`FullscreenStage`・`StandardCaption`・`DiagramStage`**。契約・T3 の名称と一致する。
- ZIP 同梱数の既存テストは15を表明し、実行成功。App の `motionKitCount` は T5-3 の `Object.keys(templates)` と直下 TSX の正規表現で自動算出され、ファイル一覧と情報ダイアログの2箇所から参照される。App の変更は取り込みコミットだけ。
- T5-4 実施者はこのブランチの T5b 実装コミットを取り込むこと。先行依存10件の対応表は上記。実装コミットの件名は `Add non-Biim presentation parts to motion-kit`（本記録と同じコミット。確定ハッシュは最終メッセージに記載）。取り込み後の CP-W1 / S6 で期待する部品数は15。
- CP-W1 のスクリーンショット撮影・実画面の表示確認は T5-4 の担当。T5b では未実施。G3 判定は L2 の担当。

## フィクスチャの再現手順

Git Bash で repo ルートから実行する（OS の一時ディレクトリを `mktemp -d` で作る）。

```sh
FX=$(mktemp -d)
node --experimental-strip-types tools/make-fixture.ts --style=motion --qc=pass --out="$FX/motion"
node --experimental-strip-types tools/make-fixture.ts --style=anime --qc=pass --out="$FX/anime"
node docs/work/2026-11-13-explainer-ui-harness/tasks/T5b/verify-fixtures.mjs "$FX"
```

`verify-fixtures.mjs` は T5b の再実行用証拠スクリプト。生成済みの `<FX>/<style>/smoke-video/scenes/Scene001.tsx` を、3部品だけを使った動く因果図と簡易SVG演者へ差し替える。`scenes/index.tsx` は既存のまま Scene001 を呼ぶ。`project.scenes` の非 Biim 指定を確認し、全シーンコードに `BiimScene` / `BiimOverlay` 参照がないことを検査する。音声の字幕は MainVideo に任せ、手動字幕は音声なし設定でだけ表示する。各ジョブで `npm install` → `npm run validate` → `npm run qc -- --stage=pre` を順に実行する。repo の製品シーン・他 worktree は変更しない。

## 検証結果

`mktemp -d` による上記の再現手順を実行した結果（終了コードはすべて0）:

| 様式 | Biim 部品参照 | npm install | validate | qc pre |
| --- | --- | --- | --- | --- |
| motion | 0 | 277 packages added | OK TypeScript / Structural checks passed | QC pre: pass |
| anime | 0 | 277 packages added | OK TypeScript / Structural checks passed | QC pre: pass |

両者とも `OK project.json` / `OK sources and assets` / `OK audio manifests` / `OK sync public assets` / `OK TypeScript` を出力。install の audit 通知あり（依存更新は対象外）。先に PowerShell の OS 一時ディレクトリでも同じ2件を生成して実行成功し、その後、指定に合わせた Git Bash の `mktemp -d` 手順でも再実行した。映像レンダー・still・音の視聴・事後QCは本タスクでは実施していない。

- 追加テスト単独: `node --experimental-strip-types --test --test-name-pattern='non-Biim parts' tests/job.test.ts`: 終了コード0、1件成功。
- C-1 `npm test`: 終了コード0、tests 72 / pass 72 / fail 0 / cancelled 0 / skipped 0 / todo 0。MV 5件・ghost 全件・imagegen 全件を含む。
- C-2 `npm run build -- --base=/BiimMotionWebUI/`: 終了コード0、98 modules transformed、built in 7.39s。既存の500kB超チャンク警告あり。
- C-3: 依存取り込み後の `git diff --check 2a7d209...HEAD` と、実装6ファイルを stage した `git diff --cached --check` は、どちらも出力なし、終了コード0。コミット後にも基準付きコマンドを再実行する。
- C-4 `git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts`: 出力なし、終了コード0。
- C-4 の削除行検査は、`2a7d209`・`955fa5c` の両方を基準に `git diff -U0 ... -- tests/job.test.ts` を grep。出力はどちらも部品数の `-    12,` の1行だけ。
- C-5: `29c0417`（依存取り込み完了）からの差分で、App・job・explainer-assist・AGENTS・runtime・既存他テスト・make-fixture・index・ルート package に変更なし。基準からの一覧には L2 の発注記録と指定依存取り込みが含まれる。自分の変更は3部品・jobテスト・T5b の記録と再現スクリプトのみ。
- C-6: 新規6ファイルを stage した後、基準 `2a7d209` からの全追加行を計画書の2本の grep パターンで検査。パス・メールおよび認証情報の語は両方とも一致なし（grep 終了コード1）。帰属行はコミットメッセージだけに付ける。
- C-7: 起動時記録どおり。検証用に自分で生成した一時フィクスチャの validate / qc 出力と必要な project キーだけを確認。禁止された既存生成物やロックファイルの全文は読み込んでいない。
- C-8: 計画変更なしのため対象外。要件書・計画書・写しを編集していない。
- push・main マージ・公開・他 worktree への書き込みなし。サブエージェント使用なし。自己合格判定なし。
