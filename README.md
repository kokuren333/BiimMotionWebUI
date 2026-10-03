# BiimMakerWebUI

企画・資料・映像方針をOpus 5.5に渡す**動画制作ジョブ生成WebUI**。ブラウザ内で `motion-job.zip` を作成する静的なReact / TypeScript / Viteアプリです。WebUI自身はAIや動画レンダラを実行しません。

```text
企画・資料・演出方針 → Motion Job ZIP → Opus → preview / build → final.mp4
```

## 起動

```sh
npm ci
npm run dev
```

http://127.0.0.1:5173 を開きます。`npm run build`は配信用のdist/を生成します。サブパスで配信する場合は`npm run build -- --base=/BiimMakerWebUI/`。バックエンド、アカウント、APIキーは不要です。

## 入力
動画タイトル、説明目的、対象視聴者、希望尺、参考URLとファイル、動画全体への指示、デザイン、3Dキャラクター（任意GLB）、Aivis設定、BGM（任意）、場面に合わせたBGM・SEの制作方針、出力解像度。Advancedでテンポ・派手さ・モーション量・Biim使用率・キャラ頻度・数式/図解/チャート・Web調査・根拠方針を設定します。

ファイルはメモリ内で処理し、外部には送信しません。URLも取得しません。再読み込みで入力は消えます。添付は合計500MB以内に制限しています。

## 生成するジョブ

```text
my-video/
├─ AGENTS.md          # ディレクター兼実装者への制作工程と自由度
├─ project.json      # 入力条件、scenes: []
├─ brief.md          # 原文の指示・資料目録・音響方針
├─ package.json      # runtimeをnpm workspaceで解決
├─ sources/
├─ assets/           # 任意GLB / BGM / 制作時に生成する音声
├─ runtime/          # Remotion / React / React Three Fiber / Aivis / SE合成
├─ motion-kit/       # 10個の小さなヘルパー（任意使用）
├─ scenes/           # 動作確認用シーン。Opusが自由に実装
├─ plan/
├─ reports/
└─ output/
```

ZIPを展開してエージェントでフォルダを開き、UIの「指示をコピー」を渡します。Opusが資料調査、台本、ストーリーボード、シーン実装、Aivis音声、3D同期、簡単なBGM・SE制作、映像/音声QA、最終レンダリングを行う指示になっています。細かい動画DSLやUI上でのシーン設計は設けていません。

ランタイムは**ソースコードと固定バージョンの依存指定**です。Node.js 22以上、初回npm installとレンダリング用ブラウザ取得、別途起動したAivisSpeechが必要です。オフラインのポータブル実行環境をバンドルする実装ではありません。各コマンドは生成ジョブ内のREADME.mdを参照してください。

BGM・SEは外部APIなしで短い手続き生成WAVを作れます。高度な作曲モデルは含みません。実モデルの口パクやモーションのリターゲットはエージェントがモデルに合わせて実装します。生成ジョブだけで最終映像の品質を保証するものではありません。

## Biim枠・文字・台本の標準

Biim場面ではBiimSlideMakerと同じ`note_top`（右上の要点）・`note_bottom`（右下の補足）・`script`（読み上げと字幕）を採用します。Opusがproject.jsonのscenesを記入し、`BiimScene`へ場面データを渡すだけでノートを共通枠へ配置できます。中央の映像領域は自由なRemotionコンポーネントです。`npm run voice`はscriptを発話単位に分割して音声・字幕を生成します。

`biim-standard-v1`の枠SVGとフォントを毎回ZIPに同梱します。1920×1080基準で主映像[16,16,1440,810]、note_top[1498,34,388,182]、note_bottom[1498,274,388,532]、キャラ[0,740,330,332]、字幕[350,870,1528,178]。枠はBiimSlideMakerと同じ背景#1e1e1e・枠線#cccccc、ノートは白系、字幕は赤字＋黒4px・白9pxの縁取りです。本文・ノートはNoto Sans JP、字幕はM PLUS Rounded 1c ExtraBoldです。レンダリング前にフォントの読み込み完了を待ち、フォントが読み込めない場合はレンダリングを失敗させます。UI側でもフォント取得時にSHA-256を検証します。

**標準コンポーネントを使う限り、枠とフォントは共通です。**エージェントが独自実装・設定変更を行った場合まで同じ見た目を強制するものではありません。指示ではBiim場面ごとに枠やフォントを変えないよう求め、場面に応じたフルスクリーン演出は許可します。

## 検証

```sh
npm test
npm run build
node --experimental-strip-types tools/make-fixture.ts
cd .verification/smoke-video/runtime
npm install
npm run validate
npm run preview
npm run build
```

テストはZIP内容・原文保持・パス安全性・添付のバイト一致・設定検証・音響生成を確認します。動作確認用シーンは6秒です。`validate --final`は本番の台本やQA記録がないテンプレートを拒否します。検証の実施結果と限界はVERIFICATION.mdに記録します。

## 参考
[BookOrderWebUI](https://github.com/kokuren333/BookOrderWebUI)の静的React入力フォーム・ブラウザ内ZIP生成・外部エージェントへの受け渡し構成を参考に、動画向けの最小構成に組み替えました。[BiimSlideMaker](https://github.com/kokuren333/BiimSlideMaker)のAivis API方式（audio_query → synthesis）、Style ID既定値、字幕とキャラ領域、BGM、preview/build/validateと目視確認の制作方針を参考にしています。参考元の画像・BGM・キャラクター素材はコピーしていません。標準フォントは同リポジトリからOFL全文を保持して同梱しています。

## GitHub Pages

公開先は [BiimMotionWebUI](https://github.com/kokuren333/BiimMotionWebUI)。mainへのpushでGitHub Actionsがテストとビルドを行い、GitHub Pagesへデプロイします。リポジトリのSettings → Pages → Sourceは「GitHub Actions」です。ビルド時にリポジトリ名のbaseパスを指定します。

公開URL: https://kokuren333.github.io/BiimMotionWebUI/

Remotionの利用条件: https://www.remotion.dev/license 。参考元をGitHub上でforkする操作は行っていません。
