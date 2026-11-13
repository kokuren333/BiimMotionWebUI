# Motion Job

このフォルダをOpus 5.5等のファイル・コマンド実行ができるエージェントで開き、AGENTS.mdを読ませて制作を依頼してください。WebUI自身は動画を生成しません。

## 実行

Node.js 22以上が必要です。AivisSpeechは別途起動してください。初回セットアップにはネットワーク接続が必要です。依存パッケージ、Node.js本体、Remotionのレンダリング用ブラウザは同梱していません。

```sh
# 展開したジョブのルートで実行
npm install
cd runtime
npm run studio         # インタラクティブなRemotion Studio
npm run voice          # plan/narration.json → WAV・発話単位の字幕・実測尺
npm run sound          # plan/sound-design.json → 簡単なBGM / SE WAV
npm run imagegen -- --name bg --prompt "…"  # Codex CLI + imagegen → assets/generated/bg.png
npm run validate       # 設定・ファイル・音声タイミング・型チェック
npm run preview        # output/preview.mp4（低解像度・全尺）
npm run still -- --frame=30  # output/preview.png
npm run build          # output/final.mp4（指定解像度 H.264/AAC）
npm run validate -- --final # 成果物・シーン目録・QA記録の検査
npm run ghost-check    # final.mp4のレンダーゴースト走査（1フレーム要素の検出）
npm run ghost-check -- --target=preview # preview.mp4にも同じ走査（final前の早期検出）
npm run ghost-check -- --double-render # 同一コードでもう1本レンダーして全フレーム照合
npm run qc -- --stage=pre   # 解説動画の事前ゲート（実装・音声合成の前）
npm run qc -- --stage=post  # 解説動画の事後ゲート（final・納品記録の後）
```

ghost-checkの結果はreports/ghost-check(-preview).md（人用）・.json（機械可読、WebUIで開ける）と、指摘フレーム前後の静止画reports/ghost-stills/に出力されます。検出は「孤立フラッシュ（ゴースト嫌疑、全部を静止画で照合）」と「連続クラスタ（転換・高速動作に多く、代表確認で可）」に分類されます。

`npm install`でジョブルートにpackage-lock.jsonが作られたら、以降はそのルートで`npm ci`を実行して環境を再現できます。Aivisを使う場合は、project.jsonで指定したエンジンURLとStyle IDを制作するPCで利用できるようにします。「音声合成なし」のジョブでは音声合成工程を省略します。
最初の映像は6秒の動作確認用です。希望尺に水増ししていません。scenes/index.tsxと各Sceneを編集し、実際の音声尺に合わせてSequenceを組み直してください。project.jsonのscenesは未記入です。自動検査だけでは目視・聴取確認を代替できません。WebUI更新後の設定・ヘルパーを既存ジョブに反映する場合は、ZIPを再生成するか該当ファイルを更新します。

## MV制作（project.mode="mv"）

MVでは`audio.music`の完成音源、`direction.music_mood`の曲の雰囲気、`direction.music_lyrics` / `plan/lyrics.txt`の歌詞入力、brief.md、sourcesの歌詞・画像・資料・データを基に、曲に合うモーショングラフィックスを画面全体へ構成します。Biim枠・固定ノート欄・解説字幕・キャラの自動配置は使用しません。Aivisと追加BGM・SE生成も無効です。`npm run voice`と`npm run sound`の制作工程は省略します。

完成音源は0秒から最後まで音量1・ループなしで再生します。Rootが実ファイルの尺を取得し、動画の尺をその長さに合わせます。希望尺より音源の実測尺を優先し、勝手なカットや音源置換は行いません。MainVideoに再生処理があるため、Scene内へ音声を重複追加しないでください。

`plan/music-analysis.md`に曲の展開・ビート・フレーズ・感情・演出方針を記録し、`plan/storyboard.md`に時刻ごとの映像構成を記録します。project.scenesには場面のid・duration_sec・summaryを記録し、scenes/index.tsxを実際のMV構成に変更します。MVではscript・dialogue・note_top・note_bottomは必須ではありません。歌詞は提供された内容だけを使用し、表示する場合は楽曲の時刻に合わせて独自に実装します。

MVの制作原則（思想先的設計、歌詞の視覚化、密度と変化率、強調と抑制、スタイルの一貫性、検証ループ、失敗パターン）と、方向性3案→スタイル定義の手順はAGENTS.mdにあります。`plan/direction.md`に方向性の3案・採用案・スタイル定義を記録し、`direction.differentiation`の差別化メモを考慮します。最終検査ではMVの`plan/direction.md`も確認します。

WebUIでは01〜03で入力し、04・05・演出と調査の詳細は非表示です。追加Web調査は無効で、提供資料と参考URLを利用します。完成後は通常動画と同じくvalidate・preview・映像音響QA・build・validate --finalを実行します。最終検査の台本記録はMVではplan/music-analysis.mdになります。

## 解説動画の制作（project.mode="explanation"）

解説動画は、視聴者に何かを理解させるための動画です。brief.md、sources、`direction.takeaway`（理解ゴール）・`direction.prior_knowledge`（前提知識と想定される誤解）・`direction.outline` / `plan/outline.txt`（構成メモ）があればそれらを基に、台本・根拠・図解・キャラの演技・音声を組み立てます。Aivis音声と、設定に応じた簡単なBGM・SEの生成が有効です。

制作原則（理解先的設計、説明構造の翻訳、方向性3案と6軸、スタイルと演者の一貫性、制作工程14ステップ、事前・事後QC、失敗パターン23項目）はAGENTS.mdの「解説動画モード」章にあります。`direction.differentiation`の差別化メモも方向性の決定で考慮します。

### 様式モード

`direction.style_mode`で動画の様式を選びます。既定は`biim`ですが必須ではありません。

| style_mode | 様式 |
| --- | --- |
| `biim` | 黒い枠の中に映像、右上と右下に要点と補足、下に字幕を置く従来の形式（biim-standard-v1） |
| `anime` | 枠を使わず画面全体で、キャラクターの演技と掛け合いを中心に説明する |
| `motion` | 枠を使わず画面全体で、図形・文字・図解の動きを中心に説明する。キャラクターは任意 |
| `mixed` | Biim形式の場面とアニメ解説・モーション解説の場面を1本の中で切り替える（横向きのみ）。場面ごとの様式を`plan/storyboard.md`の`様式:`と`project.json`の`scenes[].style`に同じ値で書く |

Biimの枠・ノート・字幕の標準はBiim様式の場面にだけ適用します。`anime`／`motion`の場面は`scenes[].biim=false`とし、字幕は全画面の字幕領域の標準字幕になります。motion-kitの`FullscreenStage`・`StandardCaption`・`DiagramStage`は非Biimの場面向けの任意の部品です。

### 記録ファイル

| パス | 内容 | 工程 |
| --- | --- | --- |
| `plan/sources.md`・`plan/evidence.json` | 出典一覧と根拠台帳（`sources`と`claims`、IDを揃える） | 1・4 |
| `plan/explanation-map.md` | 理解ゴール・前提知識・想定される誤解・主張の一覧・山場・扱わない範囲 | 2 |
| `plan/direction.md` | 方向性の3案・採用と理由・スタイル定義 | 3 |
| `plan/script.md` | 台本（事実主張に根拠ID、`## 読み`） | 4 |
| `plan/storyboard.md` | 場面ごとの説明目的・構造型・画面状態・様式・レイアウト・根拠IDなど | 5 |
| `reports/qc-pre.*`・`reports/qc-post.*` | `npm run qc`の判定（JSONと人が読むMarkdown） | 6・13 |
| `reports/qc-review.md` | 台本を書いたのとは別のコンテキストによるレビュー行と`review_mode` | 6・13 |
| `reports/visual-qa.md` | 指摘と修正の記録、ゴースト走査の照合行（`- GHOST final f412: 意図した表示 — …`） | 11〜13 |
| `reports/delivery.md` | 実際の尺・出典リスト・チャプター・未生成素材 | 14 |

書き方の例は`plan/templates/`にあります（`explanation-map.md`、`direction-explainer.md`、`storyboard-explainer.md`、`evidence.example.json`、`qc-review.md`）。ひな形は検査対象のパスに置いていないので、写して使います。`EXAMPLE`で始まるIDが残っていると事前ゲートは不合格になります。

### QCコマンドとゲートの意味

`npm run qc -- --stage=pre`はシーン実装・音声合成の前に、`npm run qc -- --stage=post`はfinal・納品記録の後に実行します。結果は`reports/qc-<stage>.json`と`.md`に出力され、不合格なら終了コード1です。

ゲート（合否）にするのは、客観的に判定でき、外すと視聴者に実害が出るもの（誤情報、読めない字幕、切れる音声、未確認のままの納品、記録の欠落）だけです。機械判定（記録の構造、根拠台帳、字幕帯域、ストーリーボードの様式、Biim場面の標準、ナレーション同期、ゴースト走査の実施と照合、納品記録）と、`reports/qc-review.md`のレビュー判定（台本と根拠の整合、数値・数式の正確さ、字幕の実表示、通し視聴、図と読み上げの一致）の両方が合格して`verdict`が`pass`になります。面白さ・演出の巧拙・テンポなどの主観的な質は助言で、合否に入りません。ゴースト走査の検出件数も助言です。免除はオーナーだけが`reports/qc-review.md`の免除節に書けます。MVジョブで`npm run qc`を実行しても検査は行いません。

## 解説動画のBiimSlideMaker互換の場面テキスト

project.jsonのscenesはOpusが記入します。この節はBiim様式の場面（`biim`、`mixed`のBiim区間）の書き方です。枠の右上・右下・字幕と読み上げの役割をそのまま維持します。

```json
{"id":"scene001","note_top":"光は色ごとに曲がり方が違う","note_bottom":"雨粒に入った光は屈折し、色ごとに異なる方向へ進みます。これが分散です。","script":"虹は、太陽の光が色ごとに分かれて見える現象です。","duration_sec":6}
```

`runtime/src/BiimScene.tsx`にsceneを渡すとnote_top / note_bottomを配置します。そのchildrenが中央の自由なRemotion映像、characterがキャラの初期配置です。キャラはこの領域を越えて動かせます。plan/narration.jsonのsegmentsを空にして`npm run voice`を実行すると、scenes[].scriptから句点ごとの読み上げと字幕を生成します。音声出力のscene_idと実測秒を使って各Sequenceを同期してください。個別の開始時刻が必要ならnarration.jsonで上書きします。

同梱の`biim-standard-v1`（project.layout）、枠SVG、Noto Sans JP（本文・ノート）、M PLUS Rounded 1c ExtraBold（字幕）が標準です。枠は背景#1e1e1e・枠線#cccccc、ノートは白系、字幕は1人目が青、2人目が赤＋白9pxの縁取りを既定とし、話者ごとの指定色を使用します。Fontsコンポーネントが明示的にファイルを読み込み、完了までレンダリングを待ちます。フォント欠損はエラーにします。標準コンポーネントを使う限り同じ枠・書体を使えます。フォントの権利表示とOFL全文はassets/fonts/にあります。独自の演出を作る場合もBiim場面の枠・書体を揃えてください。

## 画像素材の生成（Codex CLI + imagegen）

`project.asset_generation.image`が`"codex-imagegen"`なら、背景・透過素材・キャラシート・モーション素材などを次のように生成できます。runtimeでは`npm run imagegen -- …`、ジョブのルートでも同じコマンドが使えます。

```sh
npm run imagegen -- --name hero-sheet --kind character-sheet --prompt "主人公のキャラシート"
npm run imagegen -- --name hero-run --kind motion --ref assets/generated/hero-sheet.png --prompt "走る4ポーズ"
npm run imagegen -- --help
```

`codex exec`をサブプロセスで起動してimagegen skillで生成させ、`assets/generated/<name>.png`（既存なら`-v2`等）に保存したPNGを確認して`assets/generated/manifest.json`に記録します。`plan/style-sheet.md`があればプロンプトに含めます。Codexがない・失敗した場合は終了コード0で素材なしのまま続行し、manifestに理由を残します（`--strict`で失敗扱い）。`CODEX_BIN`で実行ファイルを変更できます。動画生成AIは`asset_generation.video_generation`がtrueか、ユーザーが明示的に希望した場合だけ使います。

## キャラクター・全画面・縦動画

`project.characters`に1人または2人の設定を保存します。`character_mode`は`solo` / `duo`。各人の`id / name / reading / personality / speaking_style / role / notes / position / model / subtitle_color / subtitle_outline / voice`を制作に反映してください。`project.character`は1人目の互換コピーです。新規シーンは`characters`を参照し、変更もこちらへ反映します。

### 音声・字幕の既定

| 設定 | character1 | character2（2人モード） |
| --- | --- | --- |
| 基本配置 | 左 | 右 |
| 字幕色 | 青 `#0000ff`＋白ふち | 赤 `#ff0000`＋白ふち |
| Aivis音声 | kokuren_3rd（ノーマル） | natto-z（ノーマル） |
| Style ID | `1069147200` | `1566366592` |
| 話速 | 1.0 | 1.0 |

エンジンURLは`http://127.0.0.1:10101`。1人モードでも1人目の声と青字幕を使います。各人の色・Style ID・話速は変更できます。音声名は確認用の表示で、合成にはStyle IDを使用します。WebUIはAivisに接続せず、設定をジョブへ保存します。

### 掛け合いの台本

掛け合いは次のように記入します。`plan/narration.json`のsegmentsでも`speaker_id`を必ず指定します。

```json
{"id":"scene001","script":"掛け合いの概要（任意）","note_top":"要点","note_bottom":"補足","duration_sec":6,"dialogue":[
  {"speaker_id":"character1","text":"葵さん、虹のしくみを説明します。"},
  {"speaker_id":"character2","text":"なぜ色が分かれるの？"}
]}
```

segmentsが空なら`npm run voice`はdialogueを優先し、1人解説では従来通りscriptを句点などで分割します。話者のStyle ID・話速を適用し、出力の各clipにspeaker_idを保存して字幕色へ反映します。同じStyle IDは同じ声です。字幕は1人目が青・2人目が赤＋白ふちを既定とし、指定色を使います。textは字幕の表記を保持し、名前のreadingは音声だけに適用します。`spoken_text`は読み上げ原稿だけを上書きします。開始時刻は従来通りstart_secで調整できます。

### 基本配置とキャラの動き

`BiimScene`の`character`と`secondCharacter`へ各モデルの`Character3D`を渡します。Biimの既定配置はキャラ1が左・字幕枠が中央・キャラ2が右。positionに応じて初期キャラ領域・字幕領域・同梱SVGの字幕枠を調整済みです。左右の入れ替えや同じ側への配置にも対応します。**1人・2人とも、通常は基本位置を保ちます。この領域は待機位置の目安であり、必要な場面では各キャラを独立して画面全体へ移動・拡大縮小・回転でき、Biim枠や他の領域をまたいで表示できます。** 演出後は基本位置へ戻すことを基本とし、字幕はレイアウトごとの既定位置に固定します。

Character3Dはキャンバスの上端を20%せり出させます。`sizeMultiplier`（既定1.2）は初期キャンバスの高さです。画面上の演出には`translateX / translateY`（出力ピクセル）、`scale`（既定1）、`rotation`（度、既定0）を使います。キャンバスごと変形するので、拡大時の自動フィットでサイズ変更が打ち消されたり、移動したモデルが初期領域で切れたりしません。`style`で追加のCSSも指定できます。口パクは実モデルのリグに合わせて実装してください。

例えば次のシーンでは、1秒間は基本位置を保ち、2秒目までに移動・拡大し、4〜5秒目に基本位置へ戻ります。キャラの描画寸法は現在の領域と出力サイズから計算します。1人の場合は2人目を表示しません。シーンの尺とモデルに合わせて演出量を調整してください。

```tsx
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import project from "../project.json";
import { Character3D } from "../motion-kit/Character3D";
import { BiimScene, type BiimSceneData } from "../runtime/src/BiimScene";
import { biimEnabled, regionsFor } from "../runtime/src/Presentation";

export const CharacterMotionExample = ({ scene }: { scene: BiimSceneData }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const regions = regionsFor(biimEnabled(scene));
  const progress = interpolate(frame, [fps, fps * 2, fps * 4, fps * 5], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const renderCharacter = (index: number) => {
    const character = project.characters[index];
    if (!character) return undefined;
    const region = index === 0 ? regions.character : regions.character_second;
    return (
      <Character3D
        model={character.model}
        width={Math.round(width * region[2] / project.layout.base_width)}
        height={Math.round(height * region[3] / project.layout.base_height)}
        translateX={width * (index === 0 ? 0.28 : -0.18) * progress}
        translateY={-height * (index === 0 ? 0.15 : 0.1) * progress}
        scale={1 + (index === 0 ? 0.8 : 0.3) * progress}
        rotation={(index === 0 ? -8 : 8) * progress}
      />
    );
  };
  return (
    <BiimScene scene={scene}
      character={renderCharacter(0)} secondCharacter={renderCharacter(1)}>
      <div>ここに説明図などを実装します。</div>
    </BiimScene>
  );
};
```

`BiimScene / BiimOverlay`の`characterStyle / secondCharacterStyle`で配置のleft / top / width / heightや重なり順も変更できます。キャラのラッパーは初期領域でクリップしません。字幕は既定でキャラより前面に描画し、キャラの動きに追従させず位置を固定します。キャラ側の演出で字幕の可読性を保ちます。ユーザーが別の字幕配置を指定した場合は、MainVideoの`Captions`へ`style`を渡して変更できます。

### 全画面・縦動画

`project.layout.mode="fullscreen"`では映像領域がキャンバス全体となり、Biim枠・固定ノート欄を表示しません。WebUIで全画面トグルを有効にした場合、Biim使用率を「使わない」にした場合、縦9:16の場合に適用します。縦動画ではデザイン文にBiimへの言及が残っていても全画面指定を優先します。

寸法・fpsは`project.video`に従い、字幕とキャラは縦横別の領域へ配置します。Biim設定中の一部を全画面にする場合は`scene.biim=false`を記録し、そのsceneをBiimSceneに渡します。字幕は音声のscene_idから場面のレイアウトを判定し、切り替え先の既定位置に固定します。キャラの移動には追従しません。

## ファイル一覧

- project.json / brief.md: UIで指定した制作条件と原文の指示。
- sources/: 資料。ファイル名の重複は解消している。URLはproject.jsonに記録するだけで未取得。
- assets/: GLB、添付BGM、音声・SEなど。runtimeの各コマンドがruntime/public/assetsへ同期し、staticFile('assets/…')で使用する。編集元はassets/。public内のコピーは直接編集しない。
- scenes/: シーンのReact/TSX。設計は自由。index.tsxでメイン映像と全体尺をexportする。
- motion-kit/: 任意使用の12コンポーネント（lyric-fit.tsの補助関数を含む）。LyricLineは秒指定の行単位歌詞（末尾まで保持・幅に収める）、LyricPunchは語ごとのタイムスタンプで打ち込む巨大歌詞（構図領域を指定）。既定値のまま作品の見た目にせず調整する。Character3DはGLBのフィット・アニメーションのフレーム同期を補助する。口パク・リターゲットはモデルに合わせて追加実装する。
- plan/: 台本、ストーリーボード、ナレーション、音響プラン、出典。解説動画では理解設計・方向性・根拠台帳も置く。plan/templates/は記録のひな形（検査対象ではない）。
- reports/: 視覚・音響QAと納品レポート。output/: preview / final。

## ナレーション

plan/narration.jsonのsegmentsに`id / text / start_sec`を記入。start_secを省略すると前の発話の実測終了時刻から連続配置する。発話間の間を調整する場合は明示指定。idは半角英数字・ハイフン・アンダースコア。

```json
{"segments": [{"id": "intro", "text": "虹はどうしてできるのでしょうか。", "start_sec": 0}]}
```

`npm run voice`は/audio_queryと/synthesisを利用し、project.charactersの話者ごとのStyle ID・話速を適用します。旧形式の1人ジョブではproject.voiceを参照します。assets/audio/narration.jsonにWAVパス・開始秒・実測秒・字幕・speaker_idを出力し、SRTもassets/audio/narration.srtに保存します。字幕は発話単位で、文字ごとの正確なアライメントではありません。専門用語の読みや字幕の行長はエージェントが調整してください。

## BGM・SE

generate_bgm_seがtrueなら、場面に合う簡単な音を制作。添付BGMを優先。例:

```json
{"cues": [
  {"id": "bed", "kind": "bgm", "start_sec": 0, "duration_sec": 12, "bpm": 100, "notes": [261.63, 329.63, 392, 329.63], "volume": 0.09},
  {"id": "reveal", "kind": "chime", "start_sec": 1, "duration_sec": 0.7, "frequency": 880, "volume": 0.2},
  {"id": "transition", "kind": "whoosh", "start_sec": 4, "duration_sec": 0.35, "volume": 0.12},
  {"id": "emphasis", "kind": "impact", "start_sec": 8, "duration_sec": 0.3, "frequency": 90, "volume": 0.12}
]}
```

`npm run sound`でassets/audio/sound-design.jsonと各WAVを生成し、MainVideoがシーンに同期して再生する。時間単位は秒、volumeは0〜1。音は決定的な手続き生成で、外部APIは不要。高度な作曲・音声生成モデルを同梱するものではない。BGMのnotesはHz。短いBGMを`loop: true`と`play_duration_sec`で指定秒数まで繰り返せる。添付BGMは全体にループ。ナレーションありでも動くがダッキングは必要に応じてエージェントが追加する。

## 条件と参考元

Copyright 2026 kokuren333

同梱するBiimMakerWebUI由来の独自コード・ドキュメント・ジョブテンプレートは、[Apache License 2.0](LICENSE)で提供する。同梱フォントはSIL Open Font License 1.1で提供し、権利表示とライセンス全文はassets/fonts/に保持する。依存パッケージ、音声モデル、ユーザーが添付する素材にはそれぞれのライセンス・利用条件が適用される。

Remotionの利用条件: https://www.remotion.dev/license 。Aivisエンジンや各音声モデル、添付素材の利用条件も確認する。
WebUI構成の参考: https://github.com/kokuren333/BookOrderWebUI
Aivis APIとBiim制作方針の参考: https://github.com/kokuren333/BiimSlideMaker
依存パッケージのライセンスはnpm workspaceでインストールしたnode_modules内の各LICENSEに保持される。参考元のBGM・画像・キャラクター素材は自動ではコピーしていない。
