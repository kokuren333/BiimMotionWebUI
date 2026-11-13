# 監査レポート: 解説動画モード vs MVモード — 機能・ハーネス格差の実測

- 対象: 監査用クローン（ローカルパスは写しでは省略。GitHub `kokuren333/BiimMotionWebUI` と同一 HEAD の読み取り専用クローン）
- 監査日: 2026-11-13
- 方法: 推測ではなくファイルを開いて裏取り。対象は `src/job.ts`（897行）、`src/App.tsx`（2,164行）、`src/mv-assist.ts`（177行）、`job-template/AGENTS.md`（153行 / 12,679字）、`job-template/runtime/scripts/validate.mjs`、`job-template/plan/`、`job-template/scenes/`、`job-template/motion-kit/`、`tests/`（4ファイル）。
- 結論要約: **インフラ（Biim枠・字幕・Aivis・キャラ・音声同期）は解説側が本家で充実している。格差はその上層 —「入力支援・方向性の発散と収束・品質チェックリスト・分析/設計ゲート・専用部品とテスト」— に集中する。** MV側には `src/mv-assist.ts` という専用支援モジュールと、それに連動する WebUI／brief／AGENTS.md／validate／tests の一貫した鎖がある。解説側には対応する鎖が存在しない（`src/explainer-assist.ts` は存在しない。`src/` 内の `*assist*` は `mv-assist.ts` のみ）。

---

## 1. 項目別格差表

| # | 項目（検証ファイル） | MV側にあるもの | 解説側の現状 | 深刻度 |
|---|---|---|---|---|
| 1 | 専用入力支援モジュール（`src/`） | `src/mv-assist.ts`（177行）が単独モジュールとして存在。`directionAxes`（6軸）、`directionCandidates()`、`formatCandidate()`、`lyricStats()`、`mvQualityChecklist`（11件）を export し、`job.ts` と `App.tsx` の両方が import | 対応ファイルなし。解説向け関数は `job.ts` の汎用検証・`defaults` の文言に散在するのみで、支援ロジックを集約した場所がない | **高** |
| 2 | 方向性の発散支援 — 候補生成 UI（`src/App.tsx` 936–1025行付近、`direction-lab`） | 6軸（配色／タイポグラフィ／モーションの言語／構図／質感／テンポ感、各6–8択）から毎回 seed で組み替える候補3案をカード表示。「別の組み合わせ」で再生成、ボタン1つで `design` へ追記、軸ごとの hint を `<details>` で解説 | なし。解説側にあるのは `advanced` 折りたたみ内の select 群（tempo／energy／motionAmount／biimUsage／characterUsage／diagramPolicy／evidencePolicy）で、これは「既存パラメータの選択」であって候補の発散・組み合わせ提示ではない。しかも初期状態は折りたたまれて非表示（`advanced=false`） | **高** |
| 3 | 入力テキストのリアルタイム計測・警告（`mv-assist.ts: lyricStats`、`App.tsx` 744–773行） | 歌詞を入力すると即時に 行数／ブロック数／セクション見出し一覧／最長行 を表示し、20文字超の行は `warn` 表示＋「表示時は改行位置と文字サイズを設計する」と助言。`createBrief()` も同じ統計を brief に埋め込む | なし。台本の種になる `description`／`instructions`／`diagramPolicy` には文字数・推定尺・1文の長さ等の計測表示が一切ない。解説の成否を左右する「尺に対する情報量」の手がかりを入力時点で得られない | **高** |
| 4 | 差別化メモ（前作回避）フィールド（`job.ts: MotionForm.differentiation`、`createProject`、`createBrief`、`AGENTS.md` 22行） | MV専用フィールドとして定義→`project.direction.differentiation` に保存→brief に専用節→AGENTS.md で「方向性の決定で必ず考慮」と義務化、まで一貫して伝播 | フィールド自体がない。`createProject()` は `differentiation: mv? form.differentiation: ""` と明示的に空にする。前作との差別化は `instructions` 自由文に書くしかなく、エージェント側の考慮義務もない | **中** |
| 5 | 準備度（Readiness）表示（`App.tsx: mvReadiness`、export-card 内） | 6項目（タイトル・表現・視聴者／完成音源＝実測秒数表示／曲の雰囲気／歌詞＝行数表示／デザイン方向性／差別化メモ）を 必須・推奨・任意 付きチェックリストで export カードに常時表示 | なし。解説側の完了判定は `completed[]` の boolean（企画／資料／デザイン／キャラ／音声の5つの nav ドット）と `valid` の二値のみ。「何が推奨で何が不足か」を項目別に示す表示はない | **中** |
| 6 | 品質チェックリストの UI＋brief 埋め込み（`mv-assist.ts: mvQualityChecklist` 11件、`App.tsx` 1892行付近、`job.ts: createBrief` MV節末尾） | 同一の11件（静止画の並べ替えでない／フェードとズームだけの反復でない／歌詞と音のずれ／歌詞末尾の飛ばし／文字の可読性／改行位置／素材一貫性／かくつき／AI slop でない／強調と抑制／作品として面白い）が、①WebUI の「previewで確認する失敗パターン」`<details>` と ②MV brief の「品質チェック（previewを見て確認）」節 の両方に出現し、AGENTS.md の失敗パターン節と三重に対応 | brief にも UI にも解説版チェックリストがない。解説 brief（`createBrief` 解説分岐）の節は 目的／対象視聴者／優先指示／デザイン／キャラクター／音声とBGM／動画仕様／数式・図解・チャート／素材生成／調査・根拠／参考資料／成果物 で終わり、品質確認節がない。AGENTS.md 制作工程10. に確認観点の列挙（見切れ、字幕とキャラの衝突、誤ったグラフ等）はあるが、チェックリストとして UI／brief へは出てこない | **高** |
| 7 | AGENTS.md 制作原則の分量・具体度（`job-template/AGENTS.md`） | MV専用節は 17–95行＝**79行・約6,285字**、小節7つ：思想先的設計（制作原則4箇条）／方向性の複数案と多様性／歌詞の視覚化設計／素材とスタイルの一貫性／表現手法の選択肢／MVの制作工程（8ステップ）／失敗パターンのチェックリスト（11件）／レンダーゴースト再発防止（原因・対策・検証まで詳述） | 解説専用の原則節はない。「解説動画と共通の演出」は 96–113行＝**18行**で、内容は Biim／キャラ／字幕／レイアウトの運用規則が中心。「何を理解させるかが先」「誤解の先回り」「認知負荷の配分」「強調と抑制（解説版）」に相当する設計原則の言語化がない。解説の制作工程自体は 133行以降に12ステップあり、手順の分量では MV（8ステップ）に劣らない — 差は工程ではなく原則・失敗パターンの層 | **高** |
| 8 | 方向性3案→採用→スタイル定義 の設計ゲート（`AGENTS.md` 31–38行、`validate.mjs` final） | 楽曲分析後に `plan/direction.md` へ「少なくとも3軸で異なる3案→1案選択（理由と不採用案の要点を残す）→スタイル定義（HEX／書体規則／モーション語彙1–2種／構図規則／質感／使わないもの）」を必須化。前作・スターター既定値の踏襲も明示的に禁止 | 対応ゲートなし。解説では storyboard を直接作る工程（制作工程3.）で、教育設計の複数案（例示先行／誤解先回り／問い先行 等の構成案）比較も、スタイル定義の作成も要求されない。`plan/direction.md` は解説ジョブでは生成対象外 | **高** |
| 9 | 分析ドキュメントのゲート（`validate.mjs: completion records`） | final で必須の記録が MV は `plan/music-analysis.md`＋`plan/direction.md` の2件（各40字以上を機械検査）。曲のセクション・ビート・盛り上がり・重要語の発声時刻まで AGENTS.md 工程1. で記録内容を指定 | 解説で必須なのは `plan/script.md` の1件のみ（共通の `plan/storyboard.md`／`plan/sources.md`／`reports/visual-qa.md`／`reports/delivery.md` は両モード共通）。script.md の中身への指定は AGENTS.md 工程2. の1行（「専門用語の読み、対象視聴者の前提、結論を確認する」）のみで、主張→出典対応・誤解ポイント・前提知識の棚卸し等の分析様式がない | **中** |
| 10 | validate.mjs のモード別検証（`job-template/runtime/scripts/validate.mjs`） | MV固有の構造検証あり：fullscreen＋Biimなし強制、音声は完成音源のみ（Aivis／追加BGM禁止）、音源ファイル存在＋拡張子＋`music_duration_sec` の有限値検査（冒頭 `project.json` check 内） | 解説側が手薄なのではなく**逆に構造検証は解説側が厚い**：final で scene ごとに `script` または `dialogue` 必須、`note_top`／`note_bottom` が文字列であること、`sceneSegments` の話者検証、Aivis narration の生成済み検査がある。ただしこれは全て構造・型の検査で、MVの direction ゲートに相当する「設計が済んだか」の検査はない。ghost scan（advisory）は両モード共通で格差なし | **中**（構造は同等以上／設計ゲートのみ欠落） |
| 11 | plan／ テンプレート雛形（`job-template/plan/`） | `plan/` の実ファイルは両モード共通で `narration.json`（`{"segments":[]}`）と `sound-design.json`（`{"cues":[]}`）の空JSON 2件のみ。`music-analysis.md`／`direction.md`／`storyboard.md` の雛形は MV にも同梱されていない（ここは両モード共通の弱さ） | 左記に加え、解説は生成時の自動ファイルが1つ少ない：MVは `generateJob()` が `plan/lyrics.txt` を原文で自動生成するが、解説には `plan/script.md` 雛形の自動生成に相当するものがない（brief の内容からエージェントがゼロから起こす） | **低**（雛形欠落は共通課題／自動生成の差のみ） |
| 12 | scenes／ と motion-kit の専用部品（`job-template/scenes/`、`job-template/motion-kit/` 全14ファイル） | MV専用部品が3点ある：`LyricLine.tsx`（89行、行単位・秒指定・末尾保持）、`LyricPunch.tsx`（106行、語ごとタイムスタンプの巨大歌詞）、`lyric-fit.ts`（35行、`fitFontSize`）。AGENTS.md 歌詞設計節から参照され、`layers.ts` のレイヤー分離とも連動 | 解説専用部品は **0点**。`scenes/` は `Scene001.tsx`（Biim汎用スターター、104行）＋`index.tsx` のみで両モード共用（`index.tsx` は MV の尺だけ分岐）。motion-kit の残りは汎用部品（`KineticText`／`Pop`／`Slam`／`DrawArrow`／`Highlight`／`Stagger`／`CameraPunch`／`SpeedLines`／`Character3D`／`BiimOverlay`）で、図解・数式の段階提示、チャートの出現、比較分割、手順ステップ等の「説明のための部品」はない。`diagramPolicy` は文言として渡るだけで実装部品に接続していない | **高** |
| 13 | エージェントへの受け渡しプロンプト（`job.ts: agentPromptFor`） | MV文は長文で固有指示を含む：楽曲分析→方向性3案→スタイル定義→ストーリーボードの順序指定、ビート・フレーズ同期、実測尺での構成、imagegen 手順、AGENTS.md 失敗パターンの点検義務。末尾の ghost-check 指示は両モード共通 | 解説文は汎用指示（台本・ストーリーボード・Remotionシーン・Aivis音声・3Dキャラ同期を実装、BGM・SE制作、preview確認）＋共通 ghost-check 指示のみ。「方向性3案」「スタイル定義」「失敗パターンを点検」に相当する固有の駆動文がない | **中** |
| 14 | brief の設計情報量（`job.ts: createBrief`） | MV brief は専用節を多く持つ：曲の雰囲気（原文）／歌詞（原文＋`lyricStats` の概要統計と「見出しの時刻は音源で確認」）／差別化メモ節／完成音源（ファイル・実測尺・希望尺より実測優先の明記）／構成・同期（music-analysis と direction の作成指示）／品質チェック節 | 解説 brief はキャラ節が非常に詳しい（対照的にここは解説が厚い）一方、教材設計の節がない：前提知識、想定する誤解、結論までの段階構成、図解方針の具体化、出典の概要統計（資料件数・URL件数の集計表示）等は brief に構造化されない。`diagramPolicy` と `evidencePolicy` は1文ずつ渡るのみ | **中** |
| 15 | テスト（`tests/` 4ファイル、計29 test） | `tests/job.test.ts`（15 test）中に MV 専用が **5本**：モード切替の保持・復元／MV ZIP の音源バイト一致と fullscreen・無合成の強制／`directionCandidates` が全軸で異なり seed で変わること／`lyricStats` の集計／「MV brief と AGENTS に設計先行原則・多様性手順・素材方針が含まれる」ことの文字列検査。つまり支援モジュールと原則文書そのものが回帰テストで守られている | 解説の**インフラ**テストは充実（solo/duo プロファイル、Biim字幕とSVG枠の追従、duo ZIP の GLB 分離、fullscreen/縦の Biim 禁止、BGM/SE の決定性 WAV、voice.test.ts の Aivis パイプライン 1本）。しかし解説の**支援・品質層**のテストは 0本：チェックリストの存在、brief への原則含有、方向性候補の多様性に相当するテストがない。`ghost.test.ts`（10本）と `imagegen.test.ts`（3本）は両モード共通 | **中** |
| 16 | 実データ計測に基づく尺の決定（`App.tsx` 音源 useEffect、`job.ts` MV検証） | 完成音源を選ぶとブラウザが `Audio` で尺を実測して `musicDurationSec` に入れ、「この尺でMVを制作します」と表示。未実測では生成不可（validateForm がエラー）。制作時も実測尺が希望尺に優先すると brief／AGENTS で明記 | 尺は `durationSec` の希望値入力のみ。台本量からの推定尺、読み上げ速度での所要時間、情報密度（尺あたりの主張数）の事前警告はない。尺の確定は制作側で Aivis 実測後に初めて起こる（AGENTS.md 工程6.）ため、入力時点の設計には戻らない | **中** |
| 17 | 解説側だけにあるもの（公平のための記録） | MVでは潰される：`createProject()` は MV の tempo／energy を `"balanced"`、motion_amount を `"rich"` に固定し、`diagram_policy` を `""` にする | 解説側には キャラ詳細フォーム（2人分、役割・性格・口調・字幕色・Style ID・話速）、Aivis／BGM・SE フォーム、Biim レイアウト・プレビュー（schematic）、演出と調査の詳細（tempo／energy／motionAmount／biimUsage／characterUsage／diagramPolicy／allowWebResearch／evidencePolicy）、30秒サンプル入力（「虹はどうしてできる？」）がある。これらは移植対象ではなく、MV知見を足す際の土台として維持すべきもの | —（格差ではない） |

---

## 2. 補足の実測値

- `job-template/AGENTS.md`：MV専用節 79行（全体153行の約52%）に対し、解説と共通の演出節は18行、解説の制作工程は12ステップ。**工程手順は同等、原則・設計ゲート・失敗パターンは MV のみ**という非対称が全体像。
- `src/mv-assist.ts` の `directionAxes`：6軸・合計41択。候補3案は全軸で互いに異なることが `tests/job.test.ts` で保証されている。
- `mvQualityChecklist`：11件。同一リストが `src/mv-assist.ts`（定義）→`src/App.tsx`（UI表示）→`src/job.ts`（brief埋め込み）→`job-template/AGENTS.md`（失敗パターン節）と4箇所に連動する。解説側にこの連動はない。
- `validate.mjs` final の必須記録ファイル：MV＝`music-analysis.md`＋`direction.md`＋共通4件、解説＝`script.md`＋共通4件。
- `job-template/plan/` の実在ファイルは空JSON 2件のみ。`script.md`／`storyboard.md`／`direction.md`／`music-analysis.md`／`sources.md` の雛形はどちらのモードにも同梱されていない。

---

## 3. 解説側へ移植すべき MV 知見リスト（優先順・10件）

1. **`src/explainer-assist.ts` を新設し、支援モジュールの対称性を作る。** MV の `mv-assist.ts` と同位置に、解説用の軸・統計・チェックリストを集約する。以後の全移植の受け皿になるため最優先。
2. **解説版品質チェックリスト（`explainerQualityChecklist`）を作り、UI／brief／AGENTS.md の3箇所へ MV と同じ連動で出す。** 候補観点：静的スライドの並べ替えでない／読み上げと図解がずれていない／1場面1主張になっている／専門用語を初出で言い換えている／数値・グラフに出典があり装飾で作っていない／字幕が図解を隠していない／結論が冒頭の問いに応えている／作品として退屈でない（MV版の「slopでない」「強調と抑制」「面白い」を含む）。
3. **AGENTS.md に解説の制作原則節を MV と同密度で書く。** 「理解先的設計（何を理解させるかが先、手段は後）」「情報の構造的変化を映像の構造的変化へ（結論・転換・誤解の解消地点で構図規則を変える）」「密度と変化率の区別（解説版）」「強調と抑制（全部を強調しない）」の4箇条を MV 原則の翻訳として言語化する。
4. **方向性3案→採用→スタイル定義のゲートを解説にも課し、`plan/direction.md` を validate final の必須記録に加える。** 3案の差分軸は解説用に置き換える（構成戦略：結論先行／問い先行／誤解先回り、図解様式、例示の置き方 等）。スタイル定義には色・書体に加え図解の記法と note の書き分けを含める。
5. **WebUI に解説版 `direction-lab`（候補生成 UI）を実装する。** `directionCandidates` の仕組み（seed で全軸相異なる3案、design へ追記）を流用し、軸は解説用（図解様式／例示戦略／キャラの関わり方／テンポ感／質感／配色）に差し替える。現在折りたたまれている advanced 設定の手前に置く。
6. **台本・企画テキストの計測（`scriptStats` 相当）を追加する。** `lyricStats` の対として、description／instructions の文字数、想定台本量からの推定尺（読み上げ速度換算）、希望尺との差、資料件数・URL件数の集計を入力時に表示し、brief にも埋め込む。MV の「実測尺が希望尺に優先」に対応する「音声実測で尺を確定し理由を記録」を入力時点の警告として前倒しする。
7. **解説版 Readiness を export カードに表示する。** MV の6項目表の型で、必須（タイトル・説明・視聴者）／推奨（資料またはURL、図解方針、デザイン方向性）／任意（差別化メモ、BGM）を項目別に示す。あわせて `differentiation` をモード共通字段に昇格させ、解説 brief と AGENTS.md の方向性決定でも考慮義務を持たせる。
8. **`createBrief` 解説分岐と `agentPromptFor` 解説文へ、MV と同じ駆動構造を入れる。** brief 末尾に品質チェック節を追加し、プロンプトには「情報分析（plan/sources.md で主張と出典を対応付け）→方向性3案→スタイル定義→ストーリーボード」の順序と、失敗パターンの点検義務を明記する。
9. **motion-kit に解説専用部品と plan 雛形を足す。** 図解の段階提示・チャート出現・比較分割・手順ステップ等の部品を `LyricLine`／`LyricPunch` と同水準で用意し、`diagramPolicy` と接続する。あわせて `plan/script.md`／`plan/storyboard.md`／`plan/direction.md` の雛形（見出しだけでも）を job-template に同梱する（MV 側の music-analysis／direction 雛形欠落も同時に解消できる）。
10. **テストで支援・品質層を守る。** MV の5本と同型で、解説候補が全軸で異なること、台本統計の集計、brief と AGENTS.md に解説原則・チェックリストが含まれること、validate final が `plan/direction.md` 欠落で落ちることを `tests/job.test.ts` に追加する。移植が一過性で終わらず回帰で守られる状態にする。
