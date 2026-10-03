# Motion Job

このフォルダをOpus 5.5等のファイル・コマンド実行ができるエージェントで開き、AGENTS.mdを読ませて制作を依頼してください。WebUI自身は動画を生成しません。

## 実行
Node.js 22以上が必要です。AivisSpeechは別途起動してください。初回セットアップにはネットワーク接続が必要です。依存パッケージ、Node.js本体、Remotionのレンダリング用ブラウザは同梱していません。

```sh
cd runtime
npm install
npm run studio         # インタラクティブなRemotion Studio
npm run voice          # plan/narration.json → WAV・発話単位の字幕・実測尺
npm run sound          # plan/sound-design.json → 簡単なBGM / SE WAV
npm run validate       # 設定・ファイル・音声タイミング・型チェック
npm run preview        # output/preview.mp4（低解像度・全尺）
npm run still -- --frame=30  # output/preview.png
npm run build          # output/final.mp4（指定解像度 H.264/AAC）
npm run validate -- --final # 成果物・シーン目録・QA記録の検査
```

`npm install`でpackage-lock.jsonが作られたら、以降は`npm ci`でその環境を再現できます。
最初の映像は6秒の動作確認用です。希望尺に水増ししていません。scenes/index.tsxと各Sceneを編集し、実際の音声尺に合わせてSequenceを組み直してください。project.jsonのscenesは未記入です。自動検査だけでは目視・聴取確認を代替できません。

## BiimSlideMaker互換の場面テキスト

project.jsonのscenesはOpusが記入します。枠の右上・右下・字幕と読み上げの役割をそのまま維持します。

```json
{"id":"scene001","note_top":"光は色ごとに曲がり方が違う","note_bottom":"雨粒に入った光は屈折し、色ごとに異なる方向へ進みます。これが分散です。","script":"虹は、太陽の光が色ごとに分かれて見える現象です。","duration_sec":6}
```

`runtime/src/BiimScene.tsx`にsceneを渡すとnote_top / note_bottomを配置します。そのchildrenが中央の自由なRemotion映像、characterが字幕を避けたキャラ領域です。plan/narration.jsonのsegmentsを空にして`npm run voice`を実行すると、scenes[].scriptから句点ごとの読み上げと字幕を生成します。音声出力のscene_idと実測秒を使って各Sequenceを同期してください。個別の開始時刻が必要ならnarration.jsonで上書きします。

同梱の`biim-standard-v1`（project.layout）、枠SVG、Noto Sans JP（本文・ノート）、M PLUS Rounded 1c ExtraBold（字幕）が標準です。枠は背景#1e1e1e・枠線#cccccc、ノートは白系、字幕は赤字＋黒4px・白9pxの縁取りです。Fontsコンポーネントが明示的にファイルを読み込み、完了までレンダリングを待ちます。フォント欠損はエラーにします。標準コンポーネントを使う限り同じ枠・書体を使えます。フォントの権利表示とOFL全文はassets/fonts/にあります。独自の演出を作る場合もBiim場面の枠・書体を揃えてください。

## ファイル
- project.json / brief.md: UIで指定した制作条件と原文の指示。
- sources/: 資料。ファイル名の重複は解消している。URLはproject.jsonに記録するだけで未取得。
- assets/: GLB、添付BGM、音声・SEなど。runtimeの各コマンドがruntime/public/assetsへ同期し、staticFile('assets/…')で使用する。編集元はassets/。public内のコピーは直接編集しない。
- scenes/: シーンのReact/TSX。設計は自由。index.tsでメイン映像と全体尺をexportする。
- motion-kit/: 任意使用の10コンポーネント。Character3DはGLBのフィット・アニメーションのフレーム同期を補助する。口パク・リターゲットはモデルに合わせて追加実装する。
- plan/: 台本、ストーリーボード、ナレーション、音響プラン、出典。
- reports/: 視覚・音響QAと納品レポート。output/: preview / final。

## ナレーション
plan/narration.jsonのsegmentsに`id / text / start_sec`を記入。start_secを省略すると前の発話の実測終了時刻から連続配置する。発話間の間を調整する場合は明示指定。idは半角英数字・ハイフン・アンダースコア。

```json
{"segments": [{"id": "intro", "text": "虹はどうしてできるのでしょうか。", "start_sec": 0}]}
```

`npm run voice`は/audio_queryと/synthesisを利用し、project.voiceのStyle ID・話速を適用。assets/audio/narration.jsonにWAVパス・開始秒・実測秒・字幕を出力する。SRTもassets/audio/narration.srtに保存。字幕は発話単位で、文字ごとの正確なアライメントではない。専門用語の読みや字幕の行長はエージェントが調整する。

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
Remotionの利用条件: https://www.remotion.dev/license 。Aivisエンジンや各音声モデル、添付素材の利用条件も確認する。
WebUI構成の参考: https://github.com/kokuren333/BookOrderWebUI
Aivis APIとBiim制作方針の参考: https://github.com/kokuren333/BiimSlideMaker
依存パッケージのライセンスはruntime/node_modules内の各LICENSEに保持される。参考元のBGM・画像・キャラクター素材は自動ではコピーしていない。
