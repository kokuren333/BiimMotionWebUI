# UI-V7-CHECK — T7 刷新後の操作記録

- 作業ID: `2026-11-13-explainer-ui-harness`、タスク T7（UI 刷新 第2段）
- 記録者: L3 実働 A（実装者本人）。**これは操作の記録であり、合否の判定ではない**（判定は G3 のレビュー者）
- 対象: コミット `5f46d28` の Pages 用ビルド（`MSYS_NO_PATHCONV=1 npm run build -- --base=/BiimMotionWebUI/`）。`/BiimMotionWebUI/` 配下でローカル配信し、ヘッドレス Chrome（`Chrome/157.0.8103.40`）で操作した
- 操作の手段: 同じフォルダの `ui-v7-check.mjs`。CDP 経由で実際にクリック・入力・ファイル選択・ドラッグ＆ドロップのイベント送出・Tab キー入力を行い、DOM と computed style を読む。生の出力は `ui-v7-result.json`（44項目）。再現手順はスクリプト冒頭のコメントにある
- 人の目での確認: CP-A2 の9枚（`screenshots/after/`）を実装者が目で見た。主観の評価はしていない

## 1. UI-11 の機能一覧

「結果」は `ui-v7-result.json` の値の要約。キーは同ファイルの項目名。

| # | UI-11 の機能 | 操作 | 結果 | キー |
| --- | --- | --- | --- | --- |
| 1 | 制作モードの切り替えとモード別の指示・デザイン文の保持 | 解説でデザイン文「解説のデザイン文」→ MV へ → 「MVのデザイン文」→ 解説へ → MV へ | 解説に戻すと「解説のデザイン文」、MV に戻すと「MVのデザイン文」。MV に切り替えた直後は MV の既定文。指示文は `motion`／`mv` に応じて変わる（#11 参照） | `A2-mode` |
| 2 | 01〜05 と「演出と調査の詳細」の全入力欄 | 01 の4項目を入力、詳細を開く | 右上ノートのタイトル・尺に反映、目次 01 に完了の印。詳細は select 6・入力 2（数式方針・Web 調査）。Tab 順（§5）で全入力欄に到達 | `A4-fields`、`A13-advanced`、`tab-order-*` |
| 3 | MV での 04・05・詳細の非表示 | MV に切り替え | 目次 3 項目、`#character`・`#voice`・詳細の各要素が DOM に無い | `A2-mode` |
| 4 | 参考資料のドラッグ＆ドロップ・選択・削除・件数と容量 | ファイル選択で `paper.pdf`、ドロップで `dropped.txt`、先頭を削除、URL 2 行 | ドラッグ中に `dragging` の表示、一覧 2 件→削除で 1 件（ボタンは「削除」の文字と `aria-label="dropped.txtを削除"`）、件数表示「1件の資料 · 0.0 KB / 添付は合計500MBまで」、右上ノート「ファイル 1件 / URL 2件」 | `A7-sources` |
| 5 | 完成音源・BGM・GLB の添付と音源尺の確認 | MV で 12 秒の WAV、解説で BGM、1人目・2人目の GLB | 「完成音源の尺: 12.00秒。この尺でMVを制作します。」、字幕帯「音源 12.00秒」、BGM 一覧に `song.wav`、同梱ファイル表示に `character.glb`・`character2.glb` | `A6-music`、`A12-voice-output`、`A11-character` |
| 6 | 方向性のたたき台・差別化メモ（両モード） | MV・解説それぞれで「別の組み合わせ」→「この案を追記」 | 候補が入れ替わり、デザイン方向性に追記、ボタンが「追記しました」。軸の説明 6 項目。差別化メモ欄は両モードにある | `A9-mv-direction`、`explainer-direction` |
| 7 | 歌詞統計・台本統計 | 歌詞 2 ブロック（27 字の行を含む）、構成メモ 2 見出し | 「2行 2ブロック 見出し [Verse] [Chorus] 最長 27文字（20文字超 1行）」、「42文字 推定読み上げ 7.0秒（目安）見出し 2 / 2ブロック …」 | `A5-lyrics`、`script-stats` |
| 8 | 準備度一覧（両モード） | 入力の前後で読む | MV 6 項目、解説 10 項目（キャラ登場ありの時）。入力に応じて完了の印が付く | `readiness-mv`、`readiness-explainer` |
| 9 | 素材生成の2設定 | 動画生成 AI のチェックを入れる | `[true,false]`→`[true,true]`、JSON 表示に `"video_generation": true` | `A10-asset` |
| 10 | キャラ1人・2人・配置・字幕色の選択と HEX 入力 | 2人に切替、HEX に `#00aa00`、ピッカーに `#123456`、配置を右 | カード 2 枚とレイアウト図の 2 人目。字幕見本・字幕帯の `--caption-color`・字幕帯の文字色がすべて `#00aa00` に即時反映。ピッカーの値が HEX 欄に入る。配置でレイアウト図のキャラ位置が `84.375%` に移る | `A11-character` |
| 11 | Aivis 設定 | 音声エンジンを「なし」→「AivisSpeech」、2 人では各キャラの Style ID | 「なし」で URL 欄が消え、Aivis で URL・Style ID（`kokuren_3rd（ノーマル）`）が出る。2 人＋Aivis で各キャラに Style ID 欄 | `A12-voice-output`、`A11-character` |
| 12 | 解像度・向き・fps | 縦 9:16 → 横に戻す、fps 60 | 縦で解像度が `1080x1920`、様式「混在」が選べなくなり（`disabled`）、レイアウト図が縦・全画面に。右上ノート「横16:9 · 1920 × 1080 / 60 fps」 | `A12-voice-output` |
| 13 | レイアウト図・同梱ファイル・JSON の3表示 | 3 つのタブを順に押す | 押したタブが `aria-selected="true"`、`tabpanel` の id が `panel-files`／`panel-json`／`panel-layout` に切り替わり中身が出る | `A14-preview` |
| 14 | 必須項目のエラー表示とフォーカス移動 | 空のまま「ジョブのZIPを生成」 | 3 件（タイトル・目的・視聴者）を列挙、`role="alert"`、フォーカスがエラー要約（`.errors`）へ移る、全件が画面内（字幕帯がエラー表示中だけ伸びる）。入力すると消える | `A16-errors`、`A16-clear` |
| 15 | ZIP 生成と進捗 | サンプル入力後に生成 | 生成中に `fieldset` が無効、`progress` 表示、ボタン「ZIPを生成中… 0%」。完了で「虹はどうしてできる？-motion-job.zip を生成しました。展開したフォルダを制作エージェントに渡してください。」 | `A15-zip` |
| 16 | 指示のコピー | 「指示をコピー」 | 「コピーしました」（クリップボード権限を与えた状態）。指示の本文は右下ノートに表示 | `A17-copy` |
| 17 | 失敗パターン一覧（両モード） | 開いて件数を数える | MV 11 件、解説 23 件 | `checklist-mv`、`checklist-explainer` |
| 18 | ゴースト検査結果の読み込みと静止画表示 | 壊れた JSON → 正しい JSON と PNG 1 枚 | 読み込みエラーの文、判定文「要注意：孤立フラッシュ 1 件…」、件数 5 行、静止画 1 枚と未選択の 1 枚（「（未選択）」） | `A18-ghost` |
| 19 | サンプル入力 | 「30秒のサンプルを入力」 | タイトル「虹はどうしてできる？」、尺 30 | `A3-sample` |
| 20 | 情報ダイアログ | アプリバー「BiimMotion について」→「閉じる」、フッター「同梱物とデータの扱い」→ Esc | 開閉どれも動く。見出しは「同梱するもの／データの扱い／制作環境と参考元」 | `A19-dialog` |
| AM-2-5 | 様式モード選択（平易な説明つき、既定 biim、固定しない） | 一覧を読む、`motion` を選ぶ、`biim` に戻す | 4 様式すべての説明を一覧表示し、選択中の行に「選択中」、Biim の行に「既定」。`motion` で全画面スイッチが無効になり、右上ノート「様式：モーション解説」、指示文に `motion`。選択のロジックは T5 のまま | `A8-style-layout` |

## 2. UI 監査 §(2) の21項目

| # | 監査の項目 | 操作と結果（上の表の番号、または追加の記録） |
| --- | --- | --- |
| 1 | 5 セクション構成＋詳細、スクロール連動の現在地と完了チェック | 目次 5 項目、完了の印 ✓（読み上げ用に「（入力済み）」）。目次のリンクで 01→02→03→04→05→01 と移動し、各回で `aria-current` が移動先と一致、見出しは目次の下（見出し上端 109〜110px、目次の下端 88〜96px）（`A1-toc`、`A1-toc-jump`）。§6 の注を参照 |
| 2 | MV／解説の切替とドラフト保持 | UI-11 #1・#3 |
| 3 | サンプル入力 | UI-11 #19 |
| 4 | タイトル／目的（MV でラベル変化）／視聴者／希望尺 | UI-11 #2。MV のラベル「MVで表現したいこと」を Tab 順の記録（§5）で確認 |
| 5 | MV：雰囲気・歌詞＋統計・差別化メモ | UI-11 #6・#7 |
| 6 | MV：完成音源と尺の実測 | UI-11 #5 |
| 7 | 参考 URL・ドロップ区域・添付一覧・件数・全体指示 | UI-11 #4。全体指示の欄は Tab 順に含まれる |
| 8 | デザイン方向性・レイアウト切替・現在値のタグ | 全画面スイッチでレイアウト図が `full-screen` になり、`aria-label`「画面配置の概形：横16:9、全画面、キャラ1人、字幕は下」に変わる（`A8-style-layout`）。**現在値のタグ（`Full screen`・`Motion graphics` 等）は、要件書 3.1「飾りの部品」により削除した**。同じ情報はレイアウト図とその `aria-label`、右上ノートの「様式」「出力」で読める |
| 9 | MV のたたき台（3 案・引き直し・追記・軸の説明・差別化メモ） | UI-11 #6 |
| 10 | 素材生成オプション | UI-11 #9 |
| 11 | キャラクター | UI-11 #10・#11 |
| 12 | 音声と出力 | UI-11 #5・#11・#12 |
| 13 | 詳細設定 | 「開く」で `aria-expanded="true"`・`hidden` 解除、文字表示が「閉じる」に変わる（`A13-advanced`） |
| 14 | プレビューカード（3 タブ、概形の入力連動、ジョブ名と仕様） | UI-11 #13、レイアウト図の連動は #10・#12 と上の #8。ジョブ名と仕様は右上ノート（`A4-fields`） |
| 15 | 書き出し（ready 状態・添付合計・ZIP・進捗・成功、MV の準備度） | 字幕帯の状態の一文（`validate-ok`／`warning` アイコンと文）、「添付 187.5 KB」等、UI-11 #15・#8 |
| 16 | 入力バリデーション表示（全件列挙・スクロール＋フォーカス） | UI-11 #14。S4 にも写る |
| 17 | ハンドオフ（指示文の表示とコピー、runtime タグ、失敗パターン） | 指示文は右下ノート「制作エージェントへの指示」、コピーは UI-11 #16、失敗パターンは #17。**runtime タグ（`Remotion`・`React Three Fiber`・`Aivis`）は要件書 3.1「飾りの部品」により削除した**。同梱する実行環境の内容は情報ダイアログ「同梱するもの」と 03 の注記に文で書いてある |
| 18 | ghost-check 結果表示 | UI-11 #18。S5 にも写る |
| 19 | 情報ダイアログ | UI-11 #20。S6 |
| 20 | ローカル完結の明示 | アプリバー「入力と添付はブラウザ内で処理し、送信しません」、主領域末尾「入力と添付ファイルはブラウザのメモリ内で処理されます。再読み込みすると消えます。」（`A20-local`）。盾アイコンは装飾なので削除し、文だけ残した |
| 21 | busy 時の無効化・フォーカス可視化・reduced-motion | 生成中に `fieldset.form-body` が `disabled`（`A15-zip`）。フォーカスは §5 の全到達先で見える。`prefers-reduced-motion: reduce` を与えると `scroll-behavior: auto`・`transition-duration: 0s`（`reduced-motion`） |

## 3. 骨格と画面の条件

| 要件 | 確認したこと | 結果 |
| --- | --- | --- |
| UI-12 冒頭 | 1440×900 の初期表示で、制作モード・タイトル・説明目的・対象視聴者・希望尺の下端が字幕帯の上端より上 | 満たす（`UI-12`。S1） |
| UI-13 主操作の常時表示 | 1440×900 で最下部までスクロールし、ZIP 生成ボタン・状態の一文・右上ノートの矩形が画面内 | 満たす（`UI-13`。S1-scrolled） |
| UI-14 両モードで同じ骨格 | 解説と MV で、主領域・右上ノート・右下ノート・字幕帯の位置と寸法（主領域は高さを除く）を比較 | 一致（主領域 10,54 幅 1021／右上 1041,54 389×339／右下 1041,403 389×389／字幕帯 10,802 1420×88）（`UI-14`） |
| UI-15 狭い画面 | 幅 900 と 390 で、主領域→右上ノート→右下ノートの上端の順、字幕帯の `position` と下端、横幅 | 900：上端 54 < 4859 < 5383、字幕帯 `fixed`・下端 900、`scrollWidth` 900。390：54 < 6583 < 7108、`fixed`・下端 844、`scrollWidth` 390。最下部までスクロールしても字幕帯の下端は同じ（`UI-15-*`。S7・S8） |
| 字幕書体 | 解説の字幕帯の書体と、同梱フォントの読み込み | `BiimMotion Caption`（`public/job-assets/fonts/MPLUSRounded1c-ExtraBold.ttf`、`font-display: swap`）が `/BiimMotionWebUI/job-assets/fonts/…` から読まれ、`document.fonts.check` が真。MV の字幕帯は通常書体（`font-caption`、`band-caption-font`、`band-mv-plain`） |
| favicon | `link[rel=icon]` | SVG のデータ URI（`favicon`） |

## 4. UI-16 コントラスト比

`src/style.css` で文字に使う色と、その文字が載る地色の全組。値はトークン（`:root`）の実値、計算は WCAG 2.x の相対輝度による。

| 文字色 | 地色 | 比 | 4.5:1 | 使う場所 |
| --- | --- | --- | --- | --- |
| `ink` #0B2A3A | `panel` #FFFFFF | 14.93:1 | 以上 | 本文・ラベル・入力欄・領域見出し・ダイアログ・アプリバー・目次の番号 |
| `ink` #0B2A3A | `board` #EEF6F8 | 13.63:1 | 以上 | 地の上のリンク |
| `ink` #0B2A3A | `pad` #EAF6F9 | 13.54:1 | 以上 | ボタン（パッド）・全画面スイッチ・指示文・`code`・ドロップ区域 |
| `ink` #0B2A3A | `pad-hover` #DDF2F8 | 12.89:1 | 以上 | ボタン・目次・詳細の hover |
| `ink` #0B2A3A | `pad-on-bg` #CDEFF7 | 12.29:1 | 以上 | ZIP 生成ボタン・準備度の完了印・ドロップ中 |
| `ink` #0B2A3A | `trace` #19C3E6 | 7.10:1 | 以上 | 目次の現在地・選択中のタブ（`--ui-ph-bg-on`） |
| `ink` #0B2A3A | `trace-soft` #BFEFF9 | 12.04:1 | 以上 | 文字選択（`::selection`） |
| `ink` #0B2A3A | `error-bg` #FDECEC | 13.07:1 | 以上 | 「必須」の印・ghost-check 読み込みエラー |
| `ink` #0B2A3A | `warn-bg` #FDF4E1 | 13.65:1 | 以上 | 解説の注意・ゴースト判定の要注意・統計の警告 |
| `ink` #0B2A3A | `sel-bg` #E3F5FA | 13.30:1 | 以上 | 様式モードの選択中の行 |
| `ink-soft` #43606E | `panel` #FFFFFF | 6.69:1 | 以上 | 補足の文・placeholder・無効ボタン |
| `ink-soft` #43606E | `board` #EEF6F8 | 6.11:1 | 以上 | 無効の入力欄の文字 |
| `ink-soft` #43606E | `pad` #EAF6F9 | 6.07:1 | 以上 | ドロップ区域の補足 |
| `ink-soft` #43606E | `sel-bg` #E3F5FA | 5.96:1 | 以上 | 選択中の様式モードの説明 |
| `ink-soft` #43606E | `warn-bg` #FDF4E1 | 6.12:1 | 以上 | 解説の注意の補足 |
| `biim-text` #f4f4f4 | `biim-bg` #1e1e1e | 15.16:1 | 以上 | 字幕帯の字幕表示部（MV の状態・成功表示） |
| `biim-line` #cccccc | `biim-bg` #1e1e1e | 10.38:1 | 以上 | 字幕帯の補足（添付容量・音源の尺） |
| 白ふち #FFFFFF | `biim-bg` #1e1e1e | 16.67:1 | 以上 | 字幕様式の文字の外形（解説の状態の一文・エラー・字幕見本） |
| 既定のキャラ1字幕色 #0000ff | 白ふち #FFFFFF | 8.59:1 | 以上 | 字幕様式の塗り（利用者のデータ） |
| 既定のキャラ2字幕色 #ff0000 | 白ふち #FFFFFF | 4.00:1 | **未満** | 字幕様式の塗り（利用者のデータ）。解説のエラー要約に使う |

- 途中で見つけた未満：目次の番号は当初 `trace-deep` #0A86A8 の文字で、白地で 4.21:1（hover 地で 3.63:1）だった。コミット `a57c169` で文字を `ink` にし、`trace-deep` は番号の下線（文字ではない）に移した。
- 字幕様式の文字（UI-04）は、出力映像の字幕と同じく「利用者が選んだ色の塗り＋白ふち＋黒地」で描く。字形の外形は白ふちと黒地の 16.67:1 で読める。塗りと白ふちの比は利用者の色に依存し、既定のキャラ2の赤では 4.00:1 になる。状態の一文は 22px・太さ 800（WCAG の大きな文字に当たり、基準 3:1）だが、エラー要約は 15px・太さ 800 で大きな文字に当たらない。同じ内容は通常の DOM テキストとしてあり、読み上げられる（`role="alert"`）。字幕色は UI-03 で「ユーザーのデータ」として扱う色なので、この組は判定をレビュー者に委ねる（REPORT の質問 Q-T7-2）。
- 参考（文字ではない部品）：入力欄の枠 #6F8A97 と白地 3.65:1、フォーカスの輪郭 `ink` と白地 14.93:1・`trace` 地 7.10:1、領域の枠線 `trace` と地 1.92:1（領域の境界はファミリーの正本どおり）。

## 5. UI-16 Tab キーで到達した順序

各モードの初期状態で、フォーカスを外して先頭から Tab を押し、最初の到達先に戻るまで記録した（解説は詳細を開いた状態）。「フォーカス」は、その要素（ファイル入力は覆っているラベル）に `:focus-visible`／`:focus-within` の輪郭が描かれているか。`div` の到達先は、Chrome が中身のあふれるスクロール領域（右上ノートの本文、指示文の枠）をキーボード操作の対象にしたもの。

### 解説（71 か所）

| # | 領域 | 要素 | ラベル（先頭 40 字） | フォーカス |
| --- | --- | --- | --- | --- |
| 1 | bar | `a` | BiimMotion トップ | visible |
| 2 | bar | `button[button]` | BiimMotion について | visible |
| 3 | main | `a` | 01動画の企画 | visible |
| 4 | main | `a` | 02参考資料と指示 | visible |
| 5 | main | `a` | 03デザイン方向性✓（入力済み） | visible |
| 6 | main | `a` | 04キャラクター✓（入力済み） | visible |
| 7 | main | `a` | 05音声と出力✓（入力済み） | visible |
| 8 | main | `button[button]` | 30秒のサンプルを入力 | visible |
| 9 | main | `select[select-one]` | 制作モード解説動画MV — 完成音源から制作企画・資料を基に、音声と映像を制作し | visible |
| 10 | main | `input[text]` | 動画タイトル 必須 | visible |
| 11 | main | `textarea[textarea]` | 何を説明する動画か 必須 | visible |
| 12 | main | `input[text]` | 対象視聴者 必須 | visible |
| 13 | main | `input[number]` | 希望尺（秒） | visible |
| 14 | main | `textarea[textarea]` | 理解ゴールbrief.md の「理解ゴール」と project.json の d | visible |
| 15 | main | `textarea[textarea]` | 前提知識と想定される誤解brief.md の「前提知識と想定される誤解」に入りま | visible |
| 16 | main | `textarea[textarea]` | 構成メモ・台本の下書き0文字推定読み上げ 0.0秒（目安）見出し 0 / 0ブロ | visible |
| 17 | main | `textarea[textarea]` | 参考URL1行に1件。内容は制作エージェントが確認します。このWebUIはURL | visible |
| 18 | main | `input[file]` | 参考資料を選択 | visible |
| 19 | main | `textarea[textarea]` | 動画全体への指示原文のまま brief.md の「動画全体への優先指示」に入りま | visible |
| 20 | main | `select[select-one]` | 様式モードBiim 形式アニメ解説モーション解説混在Biim 形式選択中既定黒い | visible |
| 21 | main | `input[checkbox]` | 全画面アニメーション・モーショングラフィックスオンにするとBiim枠を外し、映像 | visible |
| 22 | main | `textarea[textarea]` | デザイン方向性Biim形式を軸に、タイポグラフィと図解の動きで理解を助ける。落ち | visible |
| 23 | main | `button[button]` | 別の組み合わせ | visible |
| 24 | main | `button[button]` | この案を追記 | visible |
| 25 | main | `button[button]` | この案を追記 | visible |
| 26 | main | `button[button]` | この案を追記 | visible |
| 27 | main | `summary` | 変化の軸と考え方 | visible |
| 28 | main | `textarea[textarea]` | 差別化メモ | visible |
| 29 | main | `input[checkbox]` | 画像素材をCodex CLI + imagegenで生成する背景・透過素材・キャ | visible |
| 30 | main | `input[checkbox]` | 動画生成AI（Seedance等）の使用を許可する既定はオフ。オンにした場合だけ | visible |
| 31 | main | `select[select-one]` | キャラクターモード1人で解説2人の掛け合い | visible |
| 32 | main | `input[text]` | 1人目の名前（表記） | visible |
| 33 | main | `input[text]` | 1人目の読み仮名 | visible |
| 34 | main | `input[text]` | 1人目の役割 | visible |
| 35 | main | `select[select-one]` | 1人目の配置 | visible |
| 36 | main | `textarea[textarea]` | 1人目の性格 | visible |
| 37 | main | `textarea[textarea]` | 1人目の口調 | visible |
| 38 | main | `textarea[textarea]` | 1人目の動きへの指示 | visible |
| 39 | main | `input[color]` | 1人目の字幕色 | visible |
| 40 | main | `input[text]` | 1人目の字幕色（HEX） | visible |
| 41 | main | `input[file]` | 1人目の3Dモデルを選択 | visible |
| 42 | main | `select[select-one]` | 音声エンジンAivisSpeech — ローカル音声合成音声合成なし | visible |
| 43 | main | `input[url]` | Aivis Engine URL制作するPCで起動するエンジンのURLです。We | visible |
| 44 | main | `input[number]` | Style IDkokuren_3rd（ノーマル） | visible |
| 45 | main | `input[number]` | 話速 | visible |
| 46 | main | `textarea[textarea]` | 声・読み方への指示自然な日本語。専門用語の読みと、図解を理解するための間を調整す | visible |
| 47 | main | `input[file]` | BGMを選択 | visible |
| 48 | main | `input[checkbox]` | 場面に合う簡単なBGM・SEを制作エージェントに作らせる添付BGMを優先し、必要 | visible |
| 49 | main | `textarea[textarea]` | BGM・SEへの指示場面に合う簡単なBGMとSEを作成する。説明中は控えめなルー | visible |
| 50 | main | `select[select-one]` | 画面の向き横16:9縦9:16（Biim枠なし） | visible |
| 51 | main | `select[select-one]` | 出力解像度Full HD · 1920 × 1080HD · 1280 × 72 | visible |
| 52 | main | `select[select-one]` | フレームレート24 fps25 fps30 fps60 fps | visible |
| 53 | main | `button[button]` | 演出と調査の詳細閉じる | visible |
| 54 | main | `select[select-one]` | テンポゆっくり、理解を優先緩急をつけるテンポよく進める | visible |
| 55 | main | `select[select-one]` | 派手さ控えめ要所で強調大胆で華やか | visible |
| 56 | main | `select[select-one]` | モーショングラフィックス量必要なところにバランスよく豊富に使う | visible |
| 57 | main | `select[select-one]` | Biimレイアウト使用率使わない場面に応じて主なレイアウトにする | visible |
| 58 | main | `select[select-one]` | 3Dキャラ登場頻度登場させないときどき登場頻繁に登場 | visible |
| 59 | main | `textarea[textarea]` | 数式・図解・チャート方針数式は段階的に導入。図解は関係や因果を動きで説明。チャー | visible |
| 60 | main | `input[checkbox]` | 追加のWeb調査を許可するオフでも、提供した参考URLの直接参照は許可します。 | visible |
| 61 | main | `select[select-one]` | 根拠資料の扱い一次資料を優先、出典を記録提供資料の範囲で説明提供資料と追加資料を | visible |
| 62 | main | `button[button]` | 同梱物とデータの扱い | visible |
| 63 | note-top | `div` | タイトル未入力モード解説動画様式Biim 形式尺の目安300秒出力横16:9 · | visible |
| 64 | note-bottom | `button[button]` | イメージ | visible |
| 65 | note-bottom | `button[button]` | 同梱ファイル | visible |
| 66 | note-bottom | `button[button]` | JSON | visible |
| 67 | note-bottom | `div` | AGENTS.mdを読み、brief.mdとsourcesを基に動画を制作してく | visible |
| 68 | note-bottom | `summary` | previewで確認する失敗パターン | visible |
| 69 | note-bottom | `input[file]` | ghost-checkのJSONと静止画を選択 | visible |
| 70 | band | `button[submit]` | ジョブのZIPを生成 | visible |
| 71 | band | `button[button]` | 指示をコピー | visible |

### MV（36 か所）

| # | 領域 | 要素 | ラベル（先頭 40 字） | フォーカス |
| --- | --- | --- | --- | --- |
| 1 | bar | `a` | BiimMotion トップ | visible |
| 2 | bar | `button[button]` | BiimMotion について | visible |
| 3 | main | `a` | 01動画の企画 | visible |
| 4 | main | `a` | 02参考資料と指示✓（入力済み） | visible |
| 5 | main | `a` | 03デザイン方向性✓（入力済み） | visible |
| 6 | main | `button[button]` | 30秒のサンプルを入力 | visible |
| 7 | main | `select[select-one]` | 制作モード解説動画MV — 完成音源から制作完成音源と資料を使い、曲の雰囲気に合 | visible |
| 8 | main | `input[text]` | 動画タイトル 必須 | visible |
| 9 | main | `textarea[textarea]` | MVで表現したいこと 必須brief.md の「表現したいこと」に入り、制作エー | visible |
| 10 | main | `input[text]` | 対象視聴者 必須 | visible |
| 11 | main | `input[number]` | 希望尺（秒） | visible |
| 12 | main | `textarea[textarea]` | 曲の雰囲気・世界観 | visible |
| 13 | main | `textarea[textarea]` | 歌詞（任意）原文と改行のまま plan/lyrics.txt と brief.m | visible |
| 14 | main | `input[file]` | MVの完成音源を選択 | visible |
| 15 | main | `textarea[textarea]` | 参考URL1行に1件。内容は制作エージェントが確認します。このWebUIはURL | visible |
| 16 | main | `input[file]` | 参考資料を選択 | visible |
| 17 | main | `textarea[textarea]` | 動画全体への指示アップロードした完成音源と参考資料を基に、曲の雰囲気に合うモーシ | visible |
| 18 | main | `textarea[textarea]` | デザイン方向性完成音源の曲調・感情・世界観に合ったモーショングラフィックスのMV | visible |
| 19 | main | `button[button]` | 別の組み合わせ | visible |
| 20 | main | `button[button]` | この案を追記 | visible |
| 21 | main | `button[button]` | この案を追記 | visible |
| 22 | main | `button[button]` | この案を追記 | visible |
| 23 | main | `summary` | 変化の軸と考え方 | visible |
| 24 | main | `textarea[textarea]` | 差別化メモ（任意） | visible |
| 25 | main | `input[checkbox]` | 画像素材をCodex CLI + imagegenで生成する背景・透過素材・キャ | visible |
| 26 | main | `input[checkbox]` | 動画生成AI（Seedance等）の使用を許可する既定はオフ。オンにした場合だけ | visible |
| 27 | main | `button[button]` | 同梱物とデータの扱い | visible |
| 28 | note-top | `div` | タイトル未入力モードMV尺の目安音源を選択出力横16:9 · 1920 × 10 | visible |
| 29 | note-bottom | `button[button]` | イメージ | visible |
| 30 | note-bottom | `button[button]` | 同梱ファイル | visible |
| 31 | note-bottom | `button[button]` | JSON | visible |
| 32 | note-bottom | `div` | AGENTS.mdを読み、brief.md、曲の雰囲気、歌詞入力、完成音源とso | visible |
| 33 | note-bottom | `summary` | previewで確認する失敗パターン | visible |
| 34 | note-bottom | `input[file]` | ghost-checkのJSONと静止画を選択 | visible |
| 35 | band | `button[submit]` | ジョブのZIPを生成 | visible |
| 36 | band | `button[button]` | 指示をコピー | visible |

- どちらのモードも、アプリバー → 主領域（目次 → フォーム → フッター）→ 右上ノート → 右下ノート（タブ → 指示文 → 失敗パターン → 検査結果を開く）→ 字幕帯（ZIP 生成 → 指示をコピー）の順に、全操作へ到達した。フォーカスが見えない到達先は 0 件。
- 添付の「削除」、ゴースト検査の表示部品、情報ダイアログの中のリンクと「閉じる」は、初期状態では DOM に無いので上の順序に出ない。それぞれ表示した後に操作して確認した（UI-11 #4・#18・#20）。

## 6. UI-16 `aria-*`・`role` の付与数

`src/App.tsx` の出現数（`grep -o 'aria-[a-z]*'`、`grep -o 'role='`）。

| 時点 | `aria-*` | `role=` |
| --- | --- | --- |
| 刷新前（`955fa5c`） | 39 | 10 |
| T6 後（`15dbbb4`、本タスクの `<BASE>`） | 45 | 13 |
| T7 後（`5f46d28`） | 46 | 14 |

- T7 の内訳：`aria-label` 34、`aria-hidden` 6、`aria-controls` 2、`aria-current`・`aria-expanded`・`aria-labelledby`・`aria-selected` 各1。`role`：`status` 6、`alert` 2、`img`・`region`・`switch`・`tab`・`tablist`・`tabpanel` 各1。
- 本タスクで消えたもの：自作線画アイコン `Icon` の `aria-hidden`（部品ごと削除）、飾りタグの `aria-hidden`（タグごと削除）。足したもの：レイアウト図の `role="img"` と `aria-label`、準備度の ✓ の `aria-hidden`、様式モードの説明一覧の `aria-label`。
- 注：目次の現在地の判定（`IntersectionObserver`、`rootMargin` 上 100px）は App.tsx のロジックで、変えていない。T6 の CSS では、ページの `scroll-padding-top` とセクションの `scroll-margin-top` が足し合わさり、03 へ移動すると 02 の末尾が判定の帯に残って 02 が現在地になっていた。コミット `5f46d28` で CSS の余白を 96px の1つにして直した（上の `A1-toc-jump`）。

## 7. UI-09 動き

- `src/style.css` に `transition`・`animation`・`@keyframes` の指定は無い（`grep -nE "transition|animation|@keyframes" src/style.css` は `prefers-reduced-motion` の打ち消し行だけ）。
- 実行中の全要素の computed `transition-duration`・`animation-duration` を走査し、100ms を超えるものは 0 件（`UI-09`）。
- 状態の切り替え（タブ、詳細の開閉、hover、字幕色）は即時。
- 参考：エラー時の `scrollIntoView({ behavior: "smooth" })` は App.tsx の `submit` のロジックで、CSS の `transition`・`animation` ではない（本タスクでは変えない）。
