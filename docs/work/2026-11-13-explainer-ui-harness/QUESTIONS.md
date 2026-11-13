# QUESTIONS — 差し戻し・確認事項

作業ID：`2026-11-13-explainer-ui-harness`
いずれも**非ブロッキング**。回答が無い間は「既定」で進める（非対話実行のため。HN-11）。

| ID | 宛先 | 質問 | 既定（回答が無い間） | 回答 | 決定日 |
| --- | --- | --- | --- | --- | --- |
| Q1 | PM | Amendment 01 AM-1 が明示列挙していない2点を、同じ規則の別記述として置換してよいか。(a) HN-12 の4「UI を変えた場合はオーナーの目視を受けるまで main に入れない」→「スクリーンショットを取得し VERIFICATION.md に記録するまで main に入れない」。(b) HN-11 の「対話できない」行の「公開は手前で止める」→ 本作業ID の main マージと Pages 公開は AM-1 で事前許可済み（強制 push・履歴改変・一括削除・スペース本番 DB 移行は従来どおり手前で止める） | 置換する（計画書 §1.1） | | |
| Q2 | PM | EX-25（`schema_version` を上げる）と EX-26（MV の生成物は前後で同一）の関係。MV の `project.json` の `schema_version` の値の変化と、計画書 §5.3 の許容差分一覧（job-template の追加ファイル・AGENTS.md の章移動など）を EX-26 の範囲内と見てよいか | 許容差分一覧で判定する | | |
| Q3 | オーナー | U3／AM-3：表示名。「統一としていいbiimotion」は表示名の統一（BiimMotionWebUI）の承認か、別の意味か | 名称は変数 `{{DISPLAY_NAME}}`、暫定値 `BiimMotionWebUI`。確定扱いにせず、`docs/DESIGN.md` の所在一覧で1コミットで差し替えられるようにする | **表示名は `BiimMotion` に統一（Amendment 02）。repo 名・Pages URL・base パス・package 名は変えない** | 2026-11-13 |
| Q4 | オーナー | U1：スペース版 MV-E2E の解説モードの実装主体と時期。スペース監査で「ジョブ生成は PC 側エージェントに BiimMotionWebUI を使わせている（テンプレートの複製は無い）」ことは判明している | ローカル側を先に完了し、スペースは引き渡し仕様（T9a）まで。S1 以降は保留 | | |
| Q5 | オーナー | A6（解説動画1本の通し制作）の題材と様式モード | WebUI のサンプル入力（虹）、`style_mode: mixed` | | |
| Q6 | オーナー | U2：`docs/requirements/` と `docs/work/` を公開 repo に含めてよいか | 含める（要件書の既定） | | |
