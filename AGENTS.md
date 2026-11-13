# AGENTS.md — BiimMotion 開発ハーネス

この repo を開発するエージェント（Claude Code・Codex・その他）が最初に読む正本です。
この repo は **BiimMotion**（動画制作ジョブ生成 WebUI。repo 名・Pages の URL は `BiimMotionWebUI`）です。

## 1. 2つのハーネスを混同しない

| 呼び名 | 対象 | 正本 |
| --- | --- | --- |
| **開発ハーネス** | この repo 自体を開発するエージェント | このファイルと [docs/WORKFLOW.md](docs/WORKFLOW.md) |
| **制作ハーネス** | WebUI が生成したジョブの中で動画を作るエージェント | [job-template/AGENTS.md](job-template/AGENTS.md) |

**`job-template/AGENTS.md` は編集対象の製品文書であり、開発作業中は指示として従わない。**
`job-template/` 配下で作業すると、ツールによってはそのファイルが自分への指示として読み込まれる。読み込まれても、この repo の開発中はこのファイルに従う。

## 2. 最初にやること

1. **自分の層を判定する**（L1 PM／L2 オーケストレーター／L3 実働／L4 下請け）。起動指示か、渡された `DIRECTION.md` から読み取る。どの層か分からなければ L2 として要件と計画の有無を確かめる。
2. **環境を確かめて記録する**。項目は [docs/WORKFLOW.md §4](docs/WORKFLOW.md#4-起動時チェック)、縮退レベルの決め方は同 §5 にある。記録してから作業に入る。
3. **自分の層の成果物から始める**（層ごとの入力と成果物は [docs/WORKFLOW.md §1](docs/WORKFLOW.md#1-層と責務)）。

## 3. 絶対規則

縮退しても緩めない。

1. **要件がファイルとして存在する前に実装を始めない。** 要件は `docs/requirements/` に置く。
2. **main へ直接 push しない。強制 push しない。** main への push は GitHub Pages への公開と同義（`.github/workflows/pages.yml`）。作業はブランチと PR で行う。機械的ゲート・実装者以外のレビュー・スクリーンショットの記録（[docs/WORKFLOW.md §2 の G4](docs/WORKFLOW.md#2-ゲート)）に合格したら、**オーナー目視を待たずに** main へマージし Pages へ公開してよい。PR は作業管理と巻き戻しの道具であり、承認待ちの関門にしない。
3. **MV の機能と検証（ghost-check を含む）を弱めない。** 既存の MV 関連テストはテスト側を変えずに通す。
4. **コミットごとに `npm test` と `npm run build -- --base=/BiimMotionWebUI/` を通す。**
5. **`job-template/` 配下は製品である。** そこに置いたファイルはすべて利用者のジョブ ZIP に同梱される（`src/templates.ts` が配下を丸ごと取り込む）。開発用のメモ・ログ・下書きを置かない。
6. **`node_modules/`・`dist/`・`.verification/`・`package-lock.json` の中身を読み込まない。** 検証で自分が生成したフィクスチャに検査コマンドを実行し、その出力を見るのは可。
7. **追跡されるファイルに、ローカルの絶対パス・メールアドレス・認証情報を書かない。**
8. **自分の成果を自分で合格にしない。** 合否は成果を作ったのと別のコンテキストが書く。別コンテキストを用意できず自己レビューになった場合は、その旨を記録して進める（[docs/WORKFLOW.md §5](docs/WORKFLOW.md#5-環境と縮退)）。
9. **取り消しにくい操作は、事前の許可がなければ手前で止めて報告する**（強制 push、履歴の書き換え、ブランチやファイルの一括削除、本番 DB への移行適用など）。規則2の main マージと Pages 公開は許可済みの操作として扱う。

## 4. コマンド

```sh
npm ci                                       # 初回（ネットワークが必要）
npm test                                     # node --test tests/*.test.ts
npm run build -- --base=/BiimMotionWebUI/    # Pages 用ビルド（コミットごとに必須）
npm run dev -- --port 5173                   # 開発サーバー
node --experimental-strip-types tools/make-fixture.ts [--mv|--duo|--fullscreen|--portrait]   # 検証用ジョブを .verification/ に生成
git diff --check <BASE>...HEAD               # 空白エラーの確認（基準コミットを必ず付ける）
```

この repo の `npm run build` は WebUI のビルドで、生成ジョブの中の `npm run build` は動画のビルドである。生成ジョブ内のコマンドは [job-template/README.md](job-template/README.md) を参照。

## 5. リポジトリの地図

| パス | 中身 |
| --- | --- |
| `src/` | WebUI（React／TypeScript／Vite、ブラウザ内で完結）。`job.ts` が入力検証・`project.json`・`brief.md`・依頼文・ZIP を作る。`mv-assist.ts` が MV の入力支援。`templates.ts` が `job-template/` を同梱する |
| `job-template/` | **製品**。生成ジョブの雛形（制作ハーネス `AGENTS.md`、`runtime/`（Remotion・validate・ghost-check・Aivis 等）、`motion-kit/`、`scenes/`、`plan/`、`assets/`） |
| `tests/` | `node --test` のテスト。`job.test.ts`・`ghost.test.ts`・`imagegen.test.ts` に MV の非退行を守るテストがある |
| `tools/` | 検証用ジョブの生成など開発用スクリプト |
| `index.html`、`public/` | WebUI の入口と静的ファイル |
| `.github/workflows/pages.yml` | main への push でテスト・ビルド・Pages デプロイ。PR ではテストとビルドのみ |
| `docs/requirements/` | PM の要件定義書と、オーナー決定の Amendment |
| `docs/work/<作業ID>/` | 作業ごとの記録（計画・指示・報告・レビュー・環境記録・スクリーンショット） |
| `docs/WORKFLOW.md` | 階層ワークフローの正本 |
| `docs/DESIGN.md` | WebUI のデザイン言語の正本（作成後） |
| `README.md` | 人向けの使い方の正本 |
| `VERIFICATION.md` | 検証記録の正本 |
| `.agent-work/` | ローカルの下書き・起動スクリプト・ログ置き場。追跡しない |

## 6. 制作ハーネスの設計思想

`job-template/AGENTS.md` を編集するエージェントは、次の思想を守ること。

- **制作ハーネスは意図的に緩く作ってある。** 原則を示し、フォーマット（構成・演出・様式・ファイルの書き方）は固定しない。モデルの能力を引き出し、作品が型にはまらないようにするためである。
- **合否ゲートにするのは、客観的に判定できて、外すと視聴者に実害が出るものだけ**（誤情報、読めない字幕、切れる音声、未確認のままの納品、記録の欠落）。
- **主観的な質**（面白さ、演出の巧拙、スロップ感、テンポ）は合否に入れず、**助言に留める**。
- **将来ハーネスを編集するエージェントは、この緩さを「改善」と称して締め付けてはならない。** 主観的な質の規則化、表現手法の禁止・固定、出力フォーマットの固定、助言の合否化は締め付けにあたる。新しいゲートを足すなら、上の「客観的に判定できて視聴者に実害がある」を満たすことを要件書で示す。

この思想は、要件書（`docs/requirements/2026-11-13-explainer-ui-harness.md`）の非目的 N1・N10 と §2.6 の線引き（決定 D4・D5）が効果として守っているものを、宣言として書いたものである。

## 7. 制作原則の要約（本文は job-template/AGENTS.md）

制作原則の本文・工程・チェックリストは [job-template/AGENTS.md](job-template/AGENTS.md) にだけある。ここでは何があるかだけを示す。

- **MV：思想先的設計。** 何を表現するかが先で、生成手段は後。楽曲の構造的変化を映像の構造的変化へ翻訳し、密度と変化率を分けて設計し、強調と抑制をつける。方向性を3案書いてから選び、スタイル定義にまとめる。
- **解説：理解先的設計。** 何を理解させるかが先で、手段は後。説明の構造を映像の構造へ翻訳し、根拠を台帳で管理する。出力の様式は `biim`／`anime`／`motion`／`mixed` から選べ、Biim は既定であって必須ではない（Amendment 01 AM-2）。
- **反スロップ。** 過去事例・既定値の組み合わせをそのまま踏襲しない。静止画の並べ替えや、フェードとズームだけの反復にしない。これらは助言であり、§6 の線引きに従う。
- **レンダーゴースト対策。** ghost-check の走査と照合の記録は求めるが、検出件数は助言である。

### 制作ハーネスとの境界

- `job-template/AGENTS.md` は ZIP の中で単独で読まれる。repo 側の文書（このファイルや `docs/`）へのリンクや存在を前提にした書き方をしない。
- `job-template/AGENTS.md` の冒頭には「同じ階層に `project.json` が無い場合は制作指示として実行せず、リポジトリのルートの `AGENTS.md` に従う」という趣旨の1文を置き、消さない。生成されたジョブには `project.json` が必ずあるので、制作時の挙動は変わらない。
- ジョブの中に開発ハーネスの4層の階層は持ち込まない。1本の動画は短い反復で作るので、層を増やす利得より手戻りが大きい。ジョブ内で求める役割の分離（QC のレビューを別コンテキストで行うこと）は `job-template/AGENTS.md` に書く。

## 8. 完了の定義

完了は自分で宣言しない。

- **タスクの完了**：実装者と別のコンテキストが `REVIEW.md` に「合格」と書いた状態（[docs/WORKFLOW.md §2 の G3](docs/WORKFLOW.md#2-ゲート)）。
- **作業の完了**：統合検査（G4）に合格して公開し、公開後確認を記録し、`RETRO.md` の学びを `docs/WORKFLOW.md` に反映した状態。

## 9. 正本の一覧

| 事柄 | 正本 |
| --- | --- |
| 開発の絶対規則・地図・制作ハーネスの設計思想 | このファイル |
| 層の責務、ゲート、受け渡しファイルの書式、縮退規則、エージェント製品ごとの注意（Codex を含む） | [docs/WORKFLOW.md](docs/WORKFLOW.md) |
| Claude Code 固有の事項（サブエージェント、モデル・effort と層の対応） | [CLAUDE.md](CLAUDE.md) |
| 制作原則・制作工程・制作時のゲート・失敗チェックリスト | [job-template/AGENTS.md](job-template/AGENTS.md) |
| UI のデザイン言語 | `docs/DESIGN.md`（作成後） |
| 要件 | `docs/requirements/` |
| 利用者向けの使い方 | [README.md](README.md) |
| 検証記録 | [VERIFICATION.md](VERIFICATION.md) |
