# BiimMakerWebUI

企画・資料・演出方針を、Opus 5.5などのファイル・コマンド実行ができるエージェントへ渡す**動画制作ジョブ生成WebUI**です。React / TypeScript / Viteで動く静的アプリで、ブラウザ内で制作に必要なソースコードと設定をZIPにまとめます。

```text
WebUIで企画・素材・設定を入力
  → Motion Job ZIPを生成・展開
  → エージェントが調査・台本・Remotionシーン・音声・音響を制作
  → previewで確認 → build → final.mp4
```

## ローカル起動

このリポジトリの開発環境にはNode.js 22.12以上とnpmが必要です。初回は依存パッケージをインストールします。

```sh
npm ci
npm run dev -- --port 5173
```

[http://127.0.0.1:5173](http://127.0.0.1:5173)を開きます。インストール済みなら、次回からは`npm run dev -- --port 5173`で起動できます。

```sh
npm run build                                     # 配信用のdist/を生成
npm run build -- --base=/BiimMotionWebUI/           # GitHub Pages用
npm run preview                                   # ビルドしたWebUIを確認
```

WebUIにはバックエンド、アカウント、APIキーは不要です。Aivisへの接続や動画レンダリングは、生成ジョブを実行するPCで行います。

## WebUIで設定できること

- **企画・資料**: 動画タイトル、説明目的、対象視聴者、希望尺、参考URL、参考ファイル、動画全体への指示。
- **演出**: デザイン方向性、全画面モード、テンポ、派手さ、モーショングラフィックス量、Biim使用率、数式・図解・チャート方針。
- **キャラクター**: 1人解説 / 2人の掛け合い、名前・読み仮名、性格、口調、役割、表情・動きへの指示、左右の基本配置、各人のGLB、字幕色。
- **音声・音響**: Aivis Engine URL、話者ごとのStyle ID・話速・読み方への指示、添付BGM、簡単なBGM・SEの制作方針。音声合成なしも選択できます。
- **出力・調査**: 横16:9 / 縦9:16、解像度、fps、3Dキャラ登場頻度、追加Web調査の可否、根拠方針。

動画タイトル・説明目的・対象視聴者は必須です。既定は1人解説、横1920×1080、30fps、希望尺300秒、Biimは場面に応じて使用、キャラは頻繁に登場、Aivis音声合成とBGM・SE制作を有効にしています。希望尺は制作目標であり、完成動画の尺は内容と音声の実測値から調整します。

参考ファイルと素材はブラウザのメモリ内で処理し、外部へアップロードしません。参考URLはHTTP / HTTPSのURLを記録し、WebUIでは取得しません。再読み込みすると入力と添付は消えます。使用する添付ファイルの合計は500MB以内です。3DモデルはGLB、BGMはMP3 / WAV / OGG / M4A / AACに対応します。

デザイン方向性の既定文は次のとおりです。入力欄で変更できます。

> Biim形式を軸に、タイポグラフィと図解の動きで理解を助ける。落ち着いた配色に、要所で大胆なアクセント。
>
> ドパガキ向けに最後まで飽きずに見られるように、凝った演出やわかりやすいアニメーションを挿入するように努める。
>
> Biim枠での説明と、画面全体を使ったアニメーションはバランスよくどちらも取り入れる。各キャラクターの3Dモデルは必要に応じてサイズや位置を変更・移動できるようにする。

## キャラクター・字幕・音声

1人モードではキャラ1を使い、2人モードでは別々のGLBと性格・口調・役割を割り当てて掛け合いを作ります。名前は任意で、各人を`character1` / `character2`で識別します。1人へ切り替えても2人目の入力は保持し、ZIPには使用中のキャラだけを含めます。GLB未添付でもジョブを作成できます。

| 既定設定 | キャラ1 | キャラ2（2人モード） |
| --- | --- | --- |
| 基本配置 | 左 | 右 |
| 役割 | 解説役 | 聞き手・質問役 |
| 字幕色 | 青 `#0000ff`＋白ふち | 赤 `#ff0000`＋白ふち |
| Aivis音声 | kokuren_3rd（ノーマル） | natto-z（ノーマル） |
| Style ID | `1069147200` | `1566366592` |
| 話速 | 1.0 | 1.0 |

字幕色は各人のカラーピッカーまたはHEX入力で変更できます。1人モードでも色を選べます。白ふちは共通です。Style IDと話速も話者ごとに変更でき、同じStyle IDを指定すると同じ声になります。

Aivis Engine URLの既定は`http://127.0.0.1:10101`です。制作するPCでAivisSpeechを起動し、使用する音声モデル・Style IDをそのエンジンで利用できるようにしてください。WebUIは設定をZIPへ保存し、生成ジョブの`npm run voice`が音声を合成します。名前が台本に登場したときは読み仮名を音声へ適用し、字幕の表記を維持します。

### 基本配置と自由なキャラ演出

Biimの2人モードは、既定で**左キャラ1・中央字幕枠・右キャラ2**です。左右の入れ替えや同じ側への配置も選べます。字幕の位置・幅と枠SVGは初期配置から生成し、**各レイアウトの字幕位置は固定します。キャラの移動には追従させません。**

**1人・2人とも、普段は基本位置を保ち、必要な場面では各キャラを独立して自由に移動・拡大縮小・回転できます。** キャラ領域は待機位置の目安であり、移動範囲やサイズの上限ではありません。Biim枠や他の領域をまたぐ演出も使えます。演出後は基本位置へ戻すことを基本とし、キャラ側の配置・サイズ・重なり順で字幕の読みやすさを保ちます。

UIで基本配置と演出方針を指定し、実際の動きは生成ジョブのRemotionシーンに実装します。`Character3D`の`translateX / translateY / scale / rotation`をフレームに同期して変更でき、`BiimScene`の`characterStyle / secondCharacterStyle`で各人の配置や重なり順も調整できます。モデルは初期領域を大きく使うようにフィットし、キャンバスの高さは既定で領域の1.2倍です。具体例は[生成ジョブのREADME](job-template/README.md)にあります。

## Biim・全画面・縦動画

「全画面アニメーション・モーショングラフィックス」をオンにすると、全場面でBiim枠と固定ノート欄を外し、画面全体を映像に使います。Biim使用率を「使わない」にした場合も全画面モードになります。

縦9:16では全画面モードを自動で有効にし、Biim枠は使いません。デザイン文にBiimへの言及があっても、このレイアウト指定を優先します。

| 解像度 | 横16:9 | 縦9:16 |
| --- | --- | --- |
| HD | 1280×720 | 720×1280 |
| Full HD | 1920×1080 | 1080×1920 |
| 4K | 3840×2160 | 2160×3840 |

fpsは24 / 25 / 30 / 60から選択できます。設定は`project.video`とRemotionの出力へ反映し、字幕・キャラの基本配置も向きに合わせます。

Biimを使う動画でも、一部の場面だけ全画面にできます。制作時に`scenes[].biim=false`を記録して`BiimScene`へ渡すと、その場面の映像と、音声の`scene_id`に対応する字幕が全画面レイアウトへ切り替わります。字幕は切り替え先のレイアウトでも固定です。

## 生成ジョブと制作手順

```text
my-video/
├─ AGENTS.md         # 制作工程と演出方針
├─ project.json      # 入力条件、キャラ・音声・レイアウト設定、scenes: []
├─ brief.md          # 原文の指示・資料目録・音響方針
├─ package.json      # runtimeをnpm workspaceで解決
├─ sources/          # 参考ファイル
├─ assets/           # GLB・BGM・枠・フォント・制作時に生成する音声
├─ runtime/          # Remotion / React Three Fiber / Aivis / SE合成
├─ motion-kit/       # 10個の小さなヘルパー（任意使用）
├─ scenes/           # 動作確認用シーンとタイムライン
├─ plan/             # 台本・構成・音声・音響・出典の計画
├─ reports/          # QA・納品記録
└─ output/           # preview / final
```

1. WebUIで入力し、制作ジョブZIPをダウンロードします。
2. ZIPを展開し、エージェントでフォルダを開いて、UIの「指示をコピー」を渡します。
3. エージェントが`AGENTS.md`・`brief.md`・`project.json`・資料を読み、調査、台本、ストーリーボード、シーン、音声、BGM・SEを制作します。
4. 構造検査とプレビューを行い、映像・音声を確認して修正した後、最終MP4を出力します。

生成ジョブはソースコードと固定バージョンの依存指定を含みます。実行にはNode.js 22以上、npm依存パッケージ、Remotionのレンダリング用ブラウザが必要です。初回セットアップにはネットワーク接続を使います。Aivisを使う場合は別途エンジンを起動します。

生成ジョブ内では次のコマンドを使います。**このリポジトリの`npm run build`はWebUI、生成ジョブの`npm run build`は動画をビルドします。**

```sh
# 展開したジョブのルートで実行
npm install
cd runtime
npm run studio                  # Remotion Studio
npm run voice                   # Aivis音声と発話単位の字幕
npm run sound                   # 簡単なBGM・SEのWAV生成
npm run validate                # 設定・素材・音声タイミング・型チェック
npm run preview                 # output/preview.mp4（半分の解像度）
npm run still -- --frame=30      # output/preview.png
npm run build                   # output/final.mp4
npm run validate -- --final      # 最終成果物と制作記録の検査
```

同梱シーンは6秒の動作確認用で、`project.scenes`は意図的に空です。制作時にエージェントが場面の目録と`scenes/index.tsx`を編集し、内容と音声の実測尺に合わせて構成します。掛け合いは`scenes[].dialogue`または`plan/narration.json`に発話ごとの`speaker_id`を明記し、話者の音声・字幕色を適用します。

BGM・SEは短い手続き生成WAVを作成でき、添付BGMを優先します。実モデルの口パクやモーションのリターゲットは、モデルのリグに合わせて制作時に実装します。新しい設定やヘルパーを既存の制作ジョブへ反映するには、ZIPを再生成するか該当ファイルを更新してください。

詳しい設定・シーン例・音響例は[生成ジョブのREADME](job-template/README.md)、制作工程は[AGENTS.md](job-template/AGENTS.md)を参照してください。

## Biim枠・書体の標準

Biim場面では`note_top`が右上の要点、`note_bottom`が右下の補足、`script`が読み上げ・字幕です。掛け合いでは`dialogue`を使います。主映像は自由なRemotionコンポーネントで実装します。

`biim-standard-v1`の枠SVGとフォントを毎回ZIPに同梱します。以下は横1920×1080基準・1人モード・左配置・キャラ表示ありの場合の`[x, y, width, height]`です。

| 領域 | 基準座標 |
| --- | --- |
| 主映像 | `[16, 16, 1440, 810]` |
| 右上ノート | `[1498, 34, 388, 182]` |
| 右下ノート | `[1498, 274, 388, 532]` |
| キャラの基本位置 | `[0, 740, 330, 332]` |
| 字幕 | `[350, 870, 1528, 178]` |

2人モードや配置変更時のキャラ・字幕座標は`project.layout.regions`を使用します。背景は`#1e1e1e`、枠線は`#cccccc`、本文・ノートはNoto Sans JP、字幕はM PLUS Rounded 1c ExtraBoldです。字幕の白ふちは基準幅で9pxです。

標準フォントは同梱ファイルから読み込み、完了までレンダリングを待ちます。欠損時はエラーにし、ZIP生成時にもフォントのSHA-256を確認します。標準コンポーネントを使うと枠と書体を共通化できます。フォントの権利表示とOFL全文は`assets/fonts/`に含めます。

## 開発・検証

```sh
npm test
npm run build -- --base=/BiimMotionWebUI/
node --experimental-strip-types tools/make-fixture.ts --duo
cd .verification/smoke-video
npm install
cd runtime
npm run validate
npm run preview
```

`tools/make-fixture.ts`は`--duo`、`--fullscreen`、`--portrait`に対応します。指定なしでは横・1人・Biimのジョブを生成します。テストはZIP内容、入力条件、独立したモデル・音声・字幕、レイアウト、添付データ、パス、安全な音声タイミング、音響生成を確認します。

検証結果は[VERIFICATION.md](VERIFICATION.md)に記録しています。`validate`は構造検査であり、完成映像の目視・音声確認は制作工程で行います。`validate --final`は本番の制作記録と成果物がない動作確認用ジョブを拒否します。

## GitHub Pages・参考

公開リポジトリは[BiimMotionWebUI](https://github.com/kokuren333/BiimMotionWebUI)、公開先は[GitHub Pages](https://kokuren333.github.io/BiimMotionWebUI/)です。[Pagesワークフロー](.github/workflows/pages.yml)がmainへのpushでテスト・ビルド・デプロイを行います。PRではテストとビルドを行います。PagesのSourceには「GitHub Actions」を指定します。

[BookOrderWebUI](https://github.com/kokuren333/BookOrderWebUI)のブラウザ内ZIP生成と外部エージェントへ渡す構成、[BiimSlideMaker](https://github.com/kokuren333/BiimSlideMaker)のAivis API方式とBiim制作方針を参考にしています。参考元の画像・BGM・キャラクター素材はコピーしていません。

Remotionの[利用条件](https://www.remotion.dev/license)と、使用するAivis音声モデル・添付素材の利用条件に従って制作してください。
