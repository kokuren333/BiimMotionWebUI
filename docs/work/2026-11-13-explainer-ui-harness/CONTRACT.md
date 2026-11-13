# CONTRACT — 解説ジョブの契約（様式モードを含む）

| 項目 | 内容 |
| --- | --- |
| 作業ID | `2026-11-13-explainer-ui-harness` |
| タスク | T1（計画書 §5.1） |
| 書いた者 | L3 実働 A（Opus 5.5 / effort medium、Claude Code 非対話セッション） |
| 根拠 | Amendment 01（AM-1・AM-2）、Amendment 02（表示名 `BiimMotion`）、要件書 `docs/requirements/2026-11-13-explainer-ui-harness.md`、計画書 `docs/requirements/ORCHESTRATION_PLAN.md` §1.2・§5、監査3本 |
| 基準コミット | 本文中の行番号は `955fa5c`（main）＝`2a7d209` 時点のソース |
| 使う者 | T3（job-template 文書・ひな形）、T4（`caption-capacity.mjs`・`qc.mjs`・`validate.mjs`・フィクスチャ）、T5（`explainer-assist.ts`・`job.ts`・`App.tsx` の配線）、T5b（motion-kit の非 Biim 部品）、T9a（スペース引き渡し仕様） |

## 0. この文書の読み方

- **本書は T3・T4・T5・T5b・T9a の共通の正本**である。名前（ファイル名・見出し・JSON のキー・関数名・識別子）は本書のとおりに実装する。本書と実装が食い違ったら本書を直すか実装を直すかを L2 に申告し、黙ってずらさない。
- 「必須」は機械検査（`qc.mjs`・`validate.mjs`）またはテストで判定される。「推奨」は判定されない。
- 識別子（`style_mode` の値、JSON キー、ゲート ID）は ASCII。人が読む見出しは日本語。
- 表示名は `BiimMotion`（Amendment 02）。本書の対象（ジョブの契約）に表示名は出てこない。repo 名・base パス `/BiimMotionWebUI/`・package 名は識別子であり、本書では扱わない。
- 計画書 §1.2 の初期案から変えた点は、該当箇所に **「変更（理由）」** として書いた。一覧は §4.9。
- 要件書・Amendment に対する未決・確認事項は §9 にまとめた（`QUESTIONS.md` は本タスクの「触らない範囲」なので、L2 が転記する）。

---

## 1. ジョブ内のファイル名と必須見出し

### 1.1 ファイル一覧（解説ジョブ。パスはジョブのルートからの相対）

| パス | 作る工程（EX-10 の #） | 作る者 | 機械検査 | 備考 |
| --- | --- | --- | --- | --- |
| `project.json` | 生成時／5・8 で追記 | WebUI／制作エージェント | validate、qc 全般 | 追加項目は §3。**`scenes[]` の下書き（id・style・biim・script／dialogue）は工程5で書く**（§1.4） |
| `brief.md` | 生成時 | WebUI | — | |
| `plan/outline.txt` | 生成時 | WebUI | — | 構成メモを入力した場合のみ。原文のまま（§3.3） |
| `plan/sources.md` | 1 | 制作 | validate `--final`（40文字以上、現行） | 人が読む出典一覧。ID を `plan/evidence.json` の `sources[].id` と揃える |
| `plan/evidence.json` | 1・4 | 制作 | qc PRE-3、validate `--final` | §2.1 |
| `plan/explanation-map.md` | 2 | 制作 | qc PRE-1、validate `--final` | §1.2 |
| `plan/direction.md` | 3 | 制作 | qc PRE-2、validate `--final` | §1.3。MV も同じパスを使うが中身の様式は別（qc は解説だけを検査） |
| `plan/style-sheet.md` | 3（素材生成を使う場合） | 制作 | — | 現行の imagegen が自動で読む |
| `plan/script.md` | 4 | 制作 | validate `--final`（40文字以上、現行） | 推奨様式は §1.5 |
| `plan/storyboard.md` | 5 | 制作 | qc PRE-7、validate `--final` | §1.4 |
| `plan/narration.json` | 9（任意） | 制作 | qc PRE-6 | 既存。`segments` が空なら `project.scenes` から字幕単位を作る（現行の `aivis.mjs` と同じ） |
| `plan/sound-design.json` | 10 | 制作 | — | 既存 |
| `reports/qc-pre.json`・`reports/qc-pre.md` | 6 | `qc.mjs` | — | §2.2 |
| `reports/qc-review.md` | 6・13 | **台本を書いたのとは別のコンテキスト**（免除の節だけはオーナー） | qc（レビュー項目と免除の読み取り） | §1.6 |
| `reports/visual-qa.md` | 11・12 | 制作 | validate `--final`（40文字以上、現行）、qc POST-5・POST-6 | §1.7 |
| `reports/ghost-check-preview.md`・`.json` | 11 | `ghost-check.mjs` | qc POST-5 | 既存の出力。様式に関わらず全モード共通 |
| `reports/ghost-check.md`・`.json` | 13 | `ghost-check.mjs` | qc POST-5 | 既存の出力 |
| `reports/qc-post.json`・`reports/qc-post.md` | 13 | `qc.mjs` | — | §2.2 |
| `reports/delivery.md` | 14 | 制作 | validate `--final`（40文字以上、現行）、qc POST-8 | §1.8 |
| `output/preview.mp4`・`output/final.mp4` | 11・13 | Remotion | validate `--final`、qc POST-5 | 既存 |
| `assets/audio/narration.json`・`narration.srt` | 9 | `aivis.mjs` | qc POST-3・POST-4 | 既存 |

### 1.2 `plan/explanation-map.md`（PRE-1）

必須見出し（レベル2、この順を推奨。順序は検査しない）：

```markdown
## 理解ゴール
## 前提知識
## 想定される誤解
## 主張の一覧
## 山場
## 扱わない範囲
```

- 「主張の一覧」には依存順（どの主張がどの主張を前提にするか）を書く（EX-10 #2）。

### 1.3 `plan/direction.md`（解説、PRE-2）

必須見出し：

```markdown
## 方向性の3案
### 案1 <短い名前>
### 案2 <短い名前>
### 案3 <短い名前>
## 採用と理由
## スタイル定義
```

- 「方向性の3案」の下に `### 案` で始まる小見出しが**3つ以上**あり、各本文が空でないこと。
- 「スタイル定義」に書く項目（EX-06 を AM-2 で読み替えた版。小見出しは推奨で、機械検査しない）：色（HEX）と色の意味づけ／画面内テキストの階層と最小サイズ／図解の線・角・矢印の規則／モーションの語彙（1〜2種）／**様式モードと（`mixed` の場合）区間ごとの様式の割り当て規則**／キャラの演技語彙（待機・指す・驚く・移動の各型）／使わないもの。

### 1.4 `plan/storyboard.md`（PRE-7）

場面ごとに次のブロックを書く。場面の見出しは `## 場面 <id>`（`<id>` は `project.scenes[].id` と同じ文字列。`^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$`、`lib.mjs` の `validId` と同じ）。

```markdown
## 場面 s01
- 時刻の目安: 0:00–0:15
- 説明目的: 虹が太陽の反対側に出る理由が分かる
- 構造型: 因果
- 画面状態: 太陽と観測者だけ → 雨粒が入り光線が曲がる → 42°の円錐が残る
- ナレーション要旨: …
- 新規概念の数: 1
- キャラの演技: 指す → 驚く
- 様式: biim
- レイアウト: Biim枠
- 密度と変化率: 低密度・速い変化
- BGM・SE: …
- 必要素材: …
- 根拠ID: C01, C02
```

解析規則（`qc.mjs` が実装する）：

- 場面ブロックは `## 場面 ` で始まる行から、次の `## ` 行または EOF まで。
- 項目行は `- <ラベル>: <値>`（コロンは半角・全角どちらも可）。**ラベルの比較は空白（半角・全角）を除いて行う**（`根拠 ID` と `根拠ID` は同じ）。値は1行。字下げした補足行は無視する。
- 13項目（上の例のラベルすべて）は T3 のひな形に置く。**機械で合否に使うのは次だけ**（PRE-7）。残りの項目の欠落は助言 `ADV-PRE-5`。
  - `説明目的`：空でない。
  - `構造型`：要件書 EX-03 の11語（`因果`／`手順`／`比較対照`／`分類・階層`／`定義`／`量・規模`／`時系列・変遷`／`論証`／`抽象→具体`／`数式`／`誤解の訂正`）のいずれか、または `その他：<説明>`（説明が空でない）。複数は `、` または `,` で区切る。
  - `根拠ID`：`plan/evidence.json` の `claims[].id` に存在する ID の列（`、` または `,` 区切り）、または `なし`。
  - `様式`：`biim`／`anime`／`motion` のいずれかで、`project.scenes` の同じ場面の**実効様式**（§4.3）と一致する。
  - `レイアウト`：`Biim枠` または `全画面`。`Biim枠` は、その場面で Biim 枠が実際に描かれる（§4.3 の `sceneUsesBiimFrame` が真）場合に限る。
  - 場面 ID の集合が `project.scenes[].id` の集合と一致する（順序は検査しない）。1場面以上あること。
- `<id>` が `EXAMPLE` で始まる場面が残っていれば不合格（ひな形の写し忘れ）。

**`project.scenes` の下書き（契約上の追加）**：PRE-6（字幕帯域）と PRE-7（様式の整合）を事前ゲートで機械判定するため、工程5（ストーリーボード）の時点で `project.json` の `scenes[]` に各場面の `id`・`style`・`biim`・`script` または `dialogue`（`mixed` では `style` 必須）を書く。`duration_sec` は目安値でよい。工程8（実装）以降で実測値・`note_top`・`note_bottom` などを確定させる。T3 は AGENTS.md の工程5と8をこの順で書く。理由と確認事項は §9 の Q-T1-1。

### 1.5 `plan/script.md`（推奨様式。機械検査は現行の40文字以上のみ）

- 場面ごとに `## 場面 <id>`、本文に読み上げ文、事実主張の末尾に根拠 ID を `[C01]` の形で付ける。
- `## 読み` の見出しで専門用語・固有名詞の読みを列挙する。見出しが無ければ助言 `ADV-PRE-6`（読みの未指定）。

### 1.6 `reports/qc-review.md`（レビュー行と免除）

```markdown
# QC レビュー記録

review_mode: independent
reviewer: 台本を書いたのとは別のサブエージェント（同一モデル）

## 事前
- [x] PRE-4: 台本の事実主張12件が台帳に全件ある。C07 の出典は主張を支えていないため hedged に変更済み（確認者: レビュー用サブエージェント、根拠: plan/script.md と plan/evidence.json の突き合わせ）
- [x] PRE-5: …

## 事後
- [x] POST-4R: …
- [x] POST-5R: …
- [x] POST-6: …
- [x] POST-7: …

## 助言（任意・合否に入らない）
- 3案の差の実質、導入の強さ、山場の設定、キャラの演技密度など

## 免除（オーナー記入）
<!-- この節はオーナーだけが書く。エージェントは書かない（EX-16） -->
- WAIVE POST-5: ffmpeg が使えず走査できない（オーナー: <名前>、2026-11-20）
```

解析規則：

- `review_mode`：正規表現 `^review_mode:(?:\s*)(independent|self)\s*$` に一致する最初の行（`(?:\s*)` は `\s*` と同じ意味で、空白クラスは `\s`。コロン直後にバックスラッシュを置かない書き方にしたのは、計画書 C-6 のパス検査がこれをドライブ文字と誤検出するのを避けるためだけである。次の `reviewer` も同じ）。無ければ `self` として扱い、助言 `ADV-REVIEW-1` を出す。`independent` は「台本を書いたのとは別のコンテキスト（サブエージェント・別セッション・オーナー）」の意味（要件書 2.6、HN-16）。
- `reviewer`：`^reviewer:(?:\s*)(\S.*)$`。人が読むための記録で、合否に使わない。
- チェック行：`^- \[([ xX])\] ((?:PRE|POST)-[0-9]+R?)[:：]\s*(\S.*)$`。ファイル内のどこにあってもよい（節の見出しは目印で、解析に使わない）。**レビュー項目のゲートは、その ID のチェック済み行（`[x]` または `[X]`、コロンの後が空でない）が1行以上あれば合格**。無い、または未チェックなら不合格（EX-15）。
- 免除行：見出し `## 免除（オーナー記入）` の節（次の `## ` まで）の中の `^- WAIVE ((?:PRE|POST)-[0-9]+R?)[:：]\s*(\S.*)$` だけを読む。節の外の WAIVE 行は無視する。免除された ID のゲートが不合格なら状態を `waived` にし、`waivers[]` に載せる（EX-16）。合格しているゲートへの免除行は `waivers[]` に載せない。
- `qc.mjs` はこのファイルを**書かない**（EX-15）。書き手がオーナーかどうかは機械で判定できない。エージェントがこの節に書かない規則は T3 が AGENTS.md に書き、G3／交差レビューで確かめる。
- レビュー項目の ID：事前は `PRE-4`・`PRE-5`、事後は `POST-4R`・`POST-5R`・`POST-6`・`POST-7`（§2.2.3）。

### 1.7 `reports/visual-qa.md`（POST-5・POST-6 が読む部分）

- 孤立フラッシュの照合行：`^- GHOST (final|preview) f?([0-9]+)[:：]\s*(ゴースト|意図した表示|誤検出)(\s.*)?$`。例：`- GHOST final f412: 意図した表示 — 場面転換の1フレーム白フラッシュ（演出）`。
- 「未確認」という文字列が残っていないこと（POST-6 の機械的前提。要件書 POST-6）。
- それ以外の記録様式（時刻・問題・期待する改善・対応結果）は現行どおり自由。

### 1.8 `reports/delivery.md`（POST-8）

必須見出し（レベル2）：

```markdown
## 実際の尺
## 出典リスト
## チャプター
## 未生成素材
```

- 「未生成素材」は無ければ `なし` と書く（本文が空だと不合格）。
- 推奨見出し（検査しない）：`## 成果物`、`## 実行コマンド`、`## 採用素材と利用条件`、`## 制約`、`## 制作モデル`（T11・SP-05 で制作モデルを残すため）。
- 「チャプター」は概要欄にそのまま貼れる `0:00 タイトル` 形式の行を推奨。1行目が `0:00` で始まらない場合は助言 `ADV-POST-3`。

### 1.9 見出しの判定規則（§1.2・1.3・1.8 共通）

- 見出し行は `^## <名前>(\s*[（(].*[)）])?\s*$`（名前の後に括弧書きを付けてよい。例：`## 理解ゴール（1〜3文）`）。小見出しは `### `。
- 本文は見出しの次の行から、同じかそれより上のレベルの次の見出しまで。**HTML コメント（`<!-- … -->`）と空白を除いて空なら「空」**。ひな形（§1.10）の説明はすべて HTML コメントで書くので、写しただけでは合格しない。

### 1.10 ひな形（EX-28）

- 置き場所：`job-template/plan/templates/`。ファイル：`explanation-map.md`、`direction-explainer.md`、`storyboard-explainer.md`、`evidence.example.json`、`qc-review.md`（いずれも T3）。
- **検査対象のパスにひな形を置かない**：`plan/direction.md`、`plan/explanation-map.md`、`plan/evidence.json`、`plan/script.md`、`plan/storyboard.md`、`plan/sources.md`、`plan/music-analysis.md`、`reports/*.md`。生成 ZIP（MV・解説とも）にこれらが存在しないことを T3 のテストで表明する（計画書 T3）。
- ひな形の中の例の ID は `EXAMPLE` で始める（`EXAMPLE-S1`、`EXAMPLE-C1`、場面 `EXAMPLE-01`）。`qc.mjs` は `EXAMPLE` で始まる source・claim・場面 ID が残っていれば該当ゲート（PRE-3・PRE-7）を不合格にする。`evidence.example.json` は §2.1 のスキーマに合う正しい例にする（例として読めること）。

---

## 2. `plan/evidence.json` スキーマ（EX-18）と `reports/qc-<stage>.json` スキーマ（EX-14）

### 2.1 `plan/evidence.json`（EX-18）

```json
{
  "schema_version": "1",
  "sources": [
    {
      "id": "S01",
      "kind": "file",
      "ref": "sources/textbook.pdf",
      "title": "高校物理 教科書 第5章",
      "accessed": "2026-11-14",
      "note": "p.112 の図5-3"
    }
  ],
  "claims": [
    {
      "id": "C01",
      "text": "虹は太陽と反対側の約42°の方向に見える",
      "kind": "number",
      "scene_ids": ["s01"],
      "source_ids": ["S01"],
      "locator": "p.112 図5-3",
      "status": "verified",
      "check": "屈折率1.333で最小偏角を再計算し 137.5°（=180°−42.5°）を確認",
      "note": ""
    }
  ]
}
```

| キー | 型 | 規則 |
| --- | --- | --- |
| `schema_version` | string | `"1"` |
| `sources[].id` | string | 一意。`validId` と同じ文字種 |
| `sources[].kind` | `"file"`／`"url"`／`"web"`／`"common"` | `file`＝ジョブの `sources/` にあるファイル、`url`＝提供 URL（`project.sources` にあるもの）、`web`＝追加 Web 調査で得たもの、`common`＝一般知識 |
| `sources[].ref` | string | `file`：`sources/` で始まるジョブ内パス。`url`・`web`：`http(s)://` の URL。`common`：空文字可 |
| `sources[].title`・`note` | string | 空文字可 |
| `sources[].accessed` | string | `YYYY-MM-DD`。`common`・`file` は空文字可 |
| `claims[].id` | string | 一意 |
| `claims[].text` | string | 空でない |
| `claims[].kind` | `"fact"`／`"number"`／`"formula"`／`"definition"`／`"quote"`／`"chart"` | |
| `claims[].scene_ids` | string[] | 空配列可。存在しない場面 ID は助言 `ADV-PRE-4` |
| `claims[].source_ids` | string[] | |
| `claims[].locator`・`note` | string | 空文字可 |
| `claims[].status` | `"verified"`／`"hedged"` | |
| `claims[].check` | string | 再計算・原典照合の内容 |

PRE-3 の機械判定（要件書 PRE-3 を具体化）：

1. JSON として読め、上表のキーと型がそろう。ID が一意。`EXAMPLE` で始まる ID が無い。
2. 全 claim の `status` が `verified` か `hedged`。
3. `verified` の claim は `source_ids` を1つ以上持ち、全 ID が `sources[]` に存在する（解決可能）。`file` の `ref` はジョブ内に実在する。
4. `kind` が `number`・`formula`・`chart`・`quote` の claim は、**`status` によらず**（`verified`・`hedged` のどちらでも）、`common` 以外の source を1つ以上持ち、`check` が空でない（要件書 PRE-3 は status で条件付けていない）。規則3が `verified` の claim だけに課すのと違い、この規則は kind だけで適用する。例：`common` の source だけを参照し、`kind: "number"`・`status: "hedged"`・`check: ""` の claim は不合格。
5. `project.research.evidence_policy` が `supplied-only` のとき、使える source は `file`（`project.sources` に載っているファイル）・`url`（`project.sources` に載っている URL）・`common` だけ（`web` は不可）。
6. **（契約上の追加）** `project.research.allow_web_research` が `false` のとき、`web` の source があれば不合格。理由：brief が「追加Web調査: 禁止」と指示しており、`web` は定義上その指示への違反の記録だから。

### 2.2 `reports/qc-<stage>.json`（EX-14、AM-2 の `style_mode`・`scope` を追加）

```json
{
  "schema_version": "1",
  "kind": "biim-explainer-qc",
  "stage": "pre",
  "mode": "explanation",
  "style_mode": "mixed",
  "verdict": "fail",
  "gates": [
    {
      "id": "PRE-6",
      "title": "字幕帯域",
      "kind": "machine",
      "scope": "all",
      "status": "fail",
      "detail": "2件が字幕領域を超える: s03-2（全画面、32文字×1行に対し41文字）…",
      "scene_ids": ["s03"]
    }
  ],
  "advisories": [
    { "id": "ADV-PRE-1", "scope": "all", "detail": "推定尺 212 秒は希望尺 120 秒より 77% 長い（目安）" }
  ],
  "review_mode": "self",
  "waivers": [
    { "gate_id": "POST-5", "reason": "ffmpeg が使えず走査できない（オーナー: <名前>、2026-11-20）" }
  ],
  "inputs": {
    "project.json": "9f2c…（SHA-256 の16進64文字）",
    "plan/evidence.json": "…",
    "plan/narration.json": null
  },
  "rule_versions": { "caption_capacity": "1" },
  "generated_at": "2026-11-14T03:21:09.000Z"
}
```

#### 2.2.1 キー

| キー | 型 | 規則 |
| --- | --- | --- |
| `schema_version` | string | `"1"` |
| `kind` | string | `"biim-explainer-qc"`（固定。スペースが他の JSON と取り違えないため。ghost-check の `"biim-ghost-check"` と同じ流儀） |
| `stage` | `"pre"`／`"post"` | |
| `mode` | string | `"explanation"`（MV では JSON を書かない。EX-19） |
| `style_mode` | `"biim"`／`"anime"`／`"motion"`／`"mixed"` | `project.direction.style_mode`。キーが無い旧ジョブは `"biim"`（§4.3） |
| `verdict` | `"pass"`／`"fail"` | `gates[]` に `status: "fail"` が1つでもあれば `fail` |
| `gates[].id` | string | §2.2.3 の ID |
| `gates[].title` | string | §2.2.3 の名称 |
| `gates[].kind` | `"machine"`／`"review"` | 要件書の「機械＋レビュー」は ID を分けて2件にする（`POST-4` と `POST-4R` など） |
| `gates[].scope` | `"all"`／`"biim-scenes"` | `all`＝全様式・全場面に適用。`biim-scenes`＝実効様式が `biim` の場面だけに適用（§5） |
| `gates[].status` | `"pass"`／`"fail"`／`"waived"`／`"not-applicable"` | `not-applicable`：対象が無い（`biim-scenes` で該当場面が0、音声なしで発話検査が無い等）。`waived`：不合格だがオーナーの免除行がある |
| `gates[].detail` | string | 人が読む説明。不合格なら直し方が分かる文 |
| `gates[].scene_ids` | string[] | 任意。不合格の原因になった場面 |
| `gates[].items` | `{id, status, detail}[]` | 任意。POST-2 の再検査結果（`PRE-1` 等）を入れる |
| `advisories[]` | `{id, scope, detail, scene_ids?}` | 合否に入らない（§2.2.4） |
| `review_mode` | `"independent"`／`"self"` | `reports/qc-review.md` から読む（§1.6） |
| `waivers[]` | `{gate_id, reason}` | §1.6 |
| `inputs` | object | 検査で読んだ各ファイルのジョブ相対パス（`/` 区切り）→ SHA-256（小文字16進）。存在しなかったファイルは `null` |
| `rule_versions` | object | `caption_capacity`：`caption-capacity.mjs` の `CAPTION_RULE_VERSION`。係数を変えたら上げる |
| `generated_at` | string | ISO 8601（`new Date().toISOString()`） |

`reports/qc-<stage>.md` は同じ内容を人が読む形にしたもの。1行目の見出しの次に `判定: pass` または `判定: fail` の行を置き、ゲートの表（ID・名称・種別・適用範囲・状態・説明）、助言、免除、`review_mode` を載せる。それ以外の書式は自由。

#### 2.2.2 コマンド

- `npm run qc -- --stage=pre|post`（ジョブのルート。`package.json` の `"qc": "npm --workspace runtime run qc --"`）、`runtime` では `"qc": "node scripts/qc.mjs"`。
- 終了コード：`verdict` が `pass` なら 0、`fail` なら 1。`--stage` が無い・不正、または `project.json` が読めない場合は使い方を表示して 2（JSON は書かない）。
- `project.mode === "mv"`：`この版に MV の規則は無い。MV は AGENTS.md の MV 制作工程に従う` と表示して終了コード 0。`reports/qc-*.json`・`.md` を書かない（EX-19）。
- 毎回 `reports/qc-<stage>.json` と `.md` を上書きする。
- `inputs` に載せるファイル：事前は `project.json`、`plan/explanation-map.md`、`plan/direction.md`、`plan/evidence.json`、`plan/storyboard.md`、`plan/script.md`、`plan/narration.json`、`reports/qc-review.md`。事後はそれに加えて `assets/audio/narration.json`、`reports/visual-qa.md`、`reports/delivery.md`、`reports/ghost-check-preview.json`、`reports/ghost-check.json`、`output/final.mp4`。

#### 2.2.3 ゲート一覧

| ID | 名称 | kind | scope | 段階 | 判定（§1・§2.1・§6 の規則で） |
| --- | --- | --- | --- | --- | --- |
| PRE-1 | 理解設計の記録 | machine | all | pre | §1.2 の6見出しがあり本文が空でない |
| PRE-2 | 方向性の記録 | machine | all | pre | §1.3 |
| PRE-3 | 根拠台帳の構造 | machine | all | pre | §2.1 の1〜6 |
| PRE-4 | 台本と根拠の整合 | review | all | pre | §1.6 |
| PRE-5 | 数式・数値・図解の正確さ | review | all | pre | §1.6 |
| PRE-6 | 字幕帯域 | machine | all | pre | §6.4。音声なし（`voice.engine === "none"`）は `not-applicable` |
| PRE-7 | ストーリーボードの様式 | machine | all | pre | §1.4 の解析規則。加えて §4.3 の様式の整合規則（実効様式が決まる、非 Biim 場面は `biim: false`、`style_mode` と `layout` の整合） |
| PRE-8 | Biim 場面の標準 | machine | biim-scenes | pre | §5.3。Biim 枠が描かれる場面が0なら `not-applicable` |
| POST-1 | 構造 | machine | all | post | `node scripts/validate.mjs --final` を子プロセスで実行し終了コード0 |
| POST-2 | 事前項目の再検査 | machine | all | post | PRE-1・2・3・6・7・8 を最終状態のファイルで再実行し、`not-applicable` 以外がすべて合格。結果は `items` に入れる |
| POST-3 | ナレーション同期 | machine | all | post | 音声ありの場合：script／dialogue を持つ全場面に `scene_id` の一致する発話クリップがある／場面ごとの発話実測合計 ≤ `duration_sec` + 0.1 秒／最後の発話の終了 ≤ `project.scenes[].duration_sec` の合計／発話の重なりが無い。音声なしは `not-applicable` |
| POST-4 | 字幕の実表示（機械） | machine | all | post | `assets/audio/narration.json` の全クリップの `text` を §6.4 で検査。音声なしは `not-applicable` |
| POST-4R | 字幕の実表示（レビュー） | review | all | post | 最も長い字幕の上位3件と、ジョブに存在する字幕領域の種類（Biim 枠／全画面）ごとに1件以上を still で確認し、はみ出し・衝突が無いことを記録 |
| POST-5 | ゴースト走査の実施と照合（機械） | machine | all | post | `reports/ghost-check-preview.json` と `reports/ghost-check.json` が存在し `kind` が `"biim-ghost-check"`／後者のファイル更新時刻 ≥ `output/final.mp4` の更新時刻／後者の `isolated[]` の全フレームについて `reports/visual-qa.md` に `- GHOST final f<frame>: <判定>` 行がある／前者の `isolated[]` の全フレームについて `reports/visual-qa.md` に `- GHOST preview f<frame>: <判定>` 行がある／判定が `ゴースト` の行が残っていない |
| POST-5R | ゴースト走査の照合（レビュー） | review | all | post | 照合の判定を静止画（`reports/ghost-stills/`）で確認したことの記録 |
| POST-6 | 通し視聴 | review | all | post | レビュー行に加え、`reports/visual-qa.md` に「未確認」が残っていない（残っていればレビュー行があっても不合格） |
| POST-7 | 図と読み上げの一致 | review | all | post | §1.6 |
| POST-8 | 納品記録 | machine | all | post | §1.8 の4見出し |

- 検出件数そのものでは不合格にしない（要件書 2.6、N2）。POST-5 で不合格になるのは「走査していない」「照合を記録していない」「ゴーストと判定したものが残っている」の3つだけ。「照合を記録していない」は preview・final の両方を指す。
- POST-5 は preview・final 両方の `isolated[]` 全件の照合行をゲートとして要求する（要件書 2.6／POST-5／EX-10 工程11）。

#### 2.2.4 助言（`advisories[]`、合否に入らない）

| ID | 段階 | 内容 |
| --- | --- | --- |
| `ADV-PRE-1` | pre | 字幕単位の全文から §6.5 で推定した尺が `video.target_duration_sec` と 30% 以上ずれる |
| `ADV-PRE-2` | pre | `新規概念の数` が2以上の場面 |
| `ADV-PRE-3` | pre | 全場面の `構造型` が同じ（EX-04：スライドの並べ替えを疑う） |
| `ADV-PRE-4` | pre | `claims[].scene_ids` に存在しない場面 ID |
| `ADV-PRE-5` | pre | ストーリーボードの13項目のうち PRE-7 で使わない項目の欠落 |
| `ADV-PRE-6` | pre | `plan/script.md` に `## 読み` が無い |
| `ADV-REVIEW-1` | 両方 | `reports/qc-review.md` に `review_mode` 行が無く `self` として扱った |
| `ADV-POST-1` | post | ゴースト走査の件数（final と preview の孤立・連続クラスタ） |
| `ADV-POST-2` | post | ffmpeg が使える場合、`final.mp4` の音量（`volumedetect` の平均・最大）。使えなければ「測定できず」 |
| `ADV-POST-3` | post | チャプターの1行目が `0:00` で始まらない |

`ADV-POST-4` は欠番（preview の照合行は POST-5 のゲートに含めたため。ID は振り直さない）。

主観的な助言（3案の差の実質、導入の強さ、山場、キャラの演技密度、fade とズームの反復、スロップ感）は `qc.mjs` では計算しない。`reports/qc-review.md` の「助言」節に任意で書く。

---

## 3. `MotionForm` の追加項目と `project.json` の追加項目、`schema_version` の新値

### 3.1 `MotionForm` の追加項目（`src/job.ts`）

| キー | 型 | 既定値 | 入力欄（EX-22） | 保存先 |
| --- | --- | --- | --- | --- |
| `styleMode` | `StyleMode`（`"biim" \| "anime" \| "motion" \| "mixed"`） | `"biim"` | 様式モードの選択（§4） | `direction.style_mode` |
| `takeaway` | string | `""` | 01：理解ゴール（視聴後に言えること・できること） | `direction.takeaway` |
| `priorKnowledge` | string | `""` | 01：前提知識と想定される誤解（1欄） | `direction.prior_knowledge` |
| `outline` | string | `""` | 01：構成メモ・台本の下書き（改行を保持） | `direction.outline`、`plan/outline.txt` |
| `explainerDifferentiation` | string | `""` | 03：解説用の差別化メモ | `direction.differentiation`（解説時） |

- 既存の `differentiation` は **MV 用のまま**（キー名・意味・保存先を変えない）。差別化メモは MV と解説で別々に保持する（EX-22）。
- 必須項目は現行の3つ（タイトル・説明・視聴者）から増やさない（EX-22）。`validateForm(defaults)` のエラー数は 3 のまま（`tests/job.test.ts:216`）。
- 新しい5項目は `modeKeys`（`src/job.ts:322`）に**加えない**。解説専用の値なので、MV へ切り替えても `musicMood` 等と同じく保持され、MV の生成物には使われない。`ModeSettings` 型は変わらない。
- `validateForm` に加えるエラー（文言はこのまま実装し、テストで表明してよい）：
  - `styleMode` が4値以外：`様式モードが不正です。`
  - 解説で `styleMode === "mixed"` かつ縦（`height > width`）：`縦向きの出力ではBiim枠を置けないため、様式「混在」は選べません。横向きにするか、別の様式を選んでください。`
  - 解説で `styleMode === "mixed"` かつ（`fullScreen === true` または `biimUsage === "never"`）：`様式「混在」ではBiim区間が必要なため、全画面モードとBiim使用率「使わない」は選べません。`
  - MV（`videoMode === "mv"`）では `styleMode` を検査しない。

### 3.2 `project.json` の追加項目

**解説（`mode: "explanation"`）**：`direction` の既存キーの後ろに、次の順で追加する。キーは常に出力する（未入力は空文字）。

| キー | 値 |
| --- | --- |
| `direction.differentiation` | （既存キー）解説では `form.explainerDifferentiation`。現行は `""` 固定（`src/job.ts:631`） |
| `direction.style_mode` | `form.styleMode` |
| `direction.takeaway` | `form.takeaway` |
| `direction.prior_knowledge` | `form.priorKnowledge` |
| `direction.outline` | `form.outline`（原文） |

`scenes[]` の各要素に追加するキー（制作エージェントが書く。生成時の `scenes` は現行どおり `[]`、`tests/job.test.ts:65`）：

| キー | 値 |
| --- | --- |
| `scenes[].style` | `"biim"`／`"anime"`／`"motion"`。`style_mode` が `mixed` のときは必須。それ以外は省略可（§4.3） |

**MV（`mode: "mv"`）**：上の新キー（`style_mode`・`takeaway`・`prior_knowledge`・`outline`）を**出力しない**（キー自体を省く）。`direction.differentiation` は現行どおり `form.differentiation`。これにより MV の `project.json` の差分は `schema_version` の値だけになる（§7）。

**`schema_version`**：`"0.3"` → **`"0.4"`**（全モード共通の値。EX-25、計画書 D-13・Q2）。

### 3.3 生成物への反映（EX-25 の残り）

- `plan/outline.txt`：解説で `form.outline.trim()` が空でないとき、`form.outline` を原文のまま書く（`src/job.ts:880-881` の `plan/lyrics.txt` と同じ条件・同じ書き方）。
- `brief.md`（解説）：理解ゴール、前提と誤解、構成メモ（原文と `scriptStats` の統計）、差別化メモ、**様式モード**（§4.6）、品質チェック（23項目）、成果物（EX-10 の一覧）を追加する。様式ごとの禁止語は §4.6。
- `agentPromptFor("explanation")`：EX-25 の順の1段落。様式モードは引数で受け、非 Biim 様式では Biim レイアウトの指示を含めない（§4.6）。`agentPromptFor("mv")` の文字列はバイト単位で変えない。シグネチャを変える場合は第2引数を任意にし、`agentPromptFor("mv")` の呼び方を壊さない。

---

## 4. 様式モード契約（AM-2）

### 4.1 4つの様式モード

| 値 | 表示ラベル（WebUI） | 平易な説明（WebUI の選択肢に添える文） | 主役 | 字幕領域 |
| --- | --- | --- | --- | --- |
| `biim`（既定） | Biim 形式 | 黒い枠の中に映像、右上と右下に要点と補足、下に字幕を置く従来の形式。 | Biim 枠の構成＋図解＋キャラ | Biim 枠の字幕領域（Biim 様式の全画面場面は全画面の字幕領域） |
| `anime` | アニメ解説 | 枠を使わず画面全体で、キャラクターの演技と掛け合いを中心に説明する。 | キャラの演技とアニメ的な演出（カット割り・寄り引き・リアクション） | 全画面の字幕領域（標準字幕） |
| `motion` | モーション解説 | 枠を使わず画面全体で、図形・文字・図解の動きを中心に説明する。キャラクターは任意。 | 図形・タイポグラフィ・図解のモーション。キャラは任意 | 全画面の字幕領域（標準字幕） |
| `mixed` | 混在 | Biim 形式の場面と、アニメ解説・モーション解説の場面を1本の中で切り替える。横向きのみ。 | 場面ごとに上のいずれか | 場面の様式に従う |

- 識別子の型：`StyleMode = "biim" | "anime" | "motion" | "mixed"`（ジョブ全体）、`SceneStyle = "biim" | "anime" | "motion"`（場面）。
- `biim` は既定だが固定・ロックしない（AM-2 の5）。MV は対象外（AM-2 の7）。
- 「標準字幕」＝現行の全画面字幕領域 `project.layout.fullscreen_regions.subtitle` に、現行の `runtime/src/Captions.tsx` が描く字幕（全画面時のフォント 52px 横／54px 縦、話者の字幕色＋白ふち）。新しい字幕の見た目は作らない。

### 4.2 対応表（確定版）

| style_mode | `project.layout.mode` | `direction.biim_usage` | 場面ごとの様式（`scenes[].style`） | Biim 固有検査 |
| --- | --- | --- | --- | --- |
| `biim` | 現行どおり：`biim`。全画面設定（`fullScreen`）・縦・`biimUsage: never` なら `fullscreen` | 現行どおり：`sometimes`／`mostly`（全画面になる条件では `never`） | 全場面 `biim`（省略可）。`biim: false` の場面は「Biim 様式の全画面場面」（現行の挙動） | 適用（Biim 枠が描かれる場面には枠の幾何も） |
| `anime` | `fullscreen` | `never` | `anime` または `motion`（省略時 `anime`） | 適用しない |
| `motion` | `fullscreen` | `never` | `anime` または `motion`（省略時 `motion`） | 適用しない |
| `mixed` | `biim` | `sometimes`／`mostly`（`never` は不可） | 全場面で明記：`biim`／`anime`／`motion` | 実効様式が `biim` の場面だけ |

`createProject` の実装規則（T5）：

- `usesFullScreen(form)`（`src/job.ts:192`）は現行条件に「解説で `styleMode` が `anime` または `motion`」を加える。MV の判定は変えない。
- `anime`／`motion` ではフォームの `fullScreen`・`biimUsage` の値を読まずに `layout.mode: "fullscreen"`・`biim_usage: "never"` にする（フォームの値は書き換えない。`biim`／`mixed` に戻したとき元の値が生きる）。
- `mixed` は `validateForm` が縦・全画面・`never` を拒否するので、`createProject` は現行の `biim` レイアウト計算をそのまま使う。

**変更（理由）**：

1. **`anime`／`motion` の場面に `anime` と `motion` の両方を許す**（初期案は「全場面 anime」「全場面 motion」）。理由：両者の違いは主役の違いだけで、適用する検査は同一（どちらも非 Biim）。縦動画は `mixed` を選べないので、縦でアニメ的な場面とモーション的な場面を混ぜる手段がこれしか無い。AM-2 の「自由度」を狭めない。省略時の既定は `style_mode` と同じ値。
2. **縦出力で `biim` を選べる（`mixed` だけを選べなくする）**（初期案と DIRECTION は「縦では biim／mixed を選べない」）。理由：(a) 既存テスト `tests/job.test.ts:603-607` が既定フォーム（`styleMode` 既定 `biim`）の縦 1080×1920 で `generateJob` の成功を表明しており、`validateForm` が縦＋`biim` を拒否すると既存テストの変更が必要になる（計画書 §5.2：`tests/job.test.ts` の既存行は変えない）。(b) 計画書 §1.2 の対応表自身が `biim` 行に「縦なら `fullscreen`」と書いており、縦＋`biim` は現行の「Biim 様式の全画面（枠なし）」として成立している。(c) `mixed` は Biim 枠の区間を置くことが目的なので、縦では幾何的に成立しない。これは「固定・ロック」ではなく既存の幾何制約である（現行の「縦は Biim 枠なし」、`validate.mjs:74-80`）。WebUI の扱いは §4.4。

### 4.3 `scenes[].style` と `scenes[].biim` の整合規則

実効値の決め方（`caption-capacity.mjs` に関数として置き、`validate.mjs`・`qc.mjs` が使う。§6.2）：

- `effectiveStyleMode(project)`：`project.direction.style_mode` があればその値、無ければ `"biim"`（`schema_version` 0.3 以前の旧ジョブの互換）。MV では使わない。
- `effectiveSceneStyle(project, scene)`：`scene.style` があればその値。無ければ `style_mode` が `biim`／`anime`／`motion` ならその値、`mixed` なら未定（＝エラー）。
- `sceneUsesBiimFrame(project, scene)`：現行 `runtime/src/Presentation.ts:3-7` の `biimEnabled(scene)` と同じ式（`layout.mode !== "fullscreen"` かつ横向き かつ `biim_usage !== "never"` かつ `scene?.biim !== false`）。**実行時の描画は今後も `scene.biim` で切り替わる**（`runtime/src/` は MV の ZIP に入るので変更しない。§7）。

規則（`validate.mjs`（`--final` の場面検査）と `qc.mjs` PRE-7 の両方で検査する。不合格の文言は実装者が決めてよい）：

| # | 規則 |
| --- | --- |
| R1 | `direction.style_mode` があれば4値のいずれか。`scenes[].style` があれば3値のいずれか |
| R2 | `style_mode` が `mixed` なら全場面に `style` がある |
| R3 | `style_mode` が `biim` なら全場面の実効様式が `biim`（`anime`・`motion` の場面を置くなら `mixed` にする） |
| R4 | `style_mode` が `anime`／`motion` なら全場面の実効様式が `anime` か `motion` |
| R5 | 実効様式が `anime`／`motion` の場面は `biim: false` を明記する（`mixed` で Biim 枠が描かれないようにするため。`anime`／`motion` ジョブでも同じ書き方に揃える） |
| R6 | `biim: true` の場面は `layout.mode` が `fullscreen` のジョブに置けない（現行 `validate.mjs:197-198` のまま） |
| R7 | `style_mode` が `anime`／`motion` なら `layout.mode === "fullscreen"` かつ `biim_usage === "never"`。`mixed` なら `layout.mode === "biim"`・横向き・`biim_usage !== "never"` |

場面の描かれ方のまとめ：

| 実効様式 | `biim` | `layout.mode` | 描かれ方 | 字幕領域 |
| --- | --- | --- | --- | --- |
| `biim` | `true` または省略 | `biim` | Biim 枠＋ノート | `layout.regions.subtitle` |
| `biim` | `false` | `biim` | Biim 様式の全画面場面（現行） | `layout.fullscreen_regions.subtitle` |
| `biim` | 省略または `false` | `fullscreen` | 全画面（現行の全画面・縦） | `layout.fullscreen_regions.subtitle` |
| `anime`／`motion` | `false`（必須） | どちらでも | 全画面、Biim 部品なしでよい | `layout.fullscreen_regions.subtitle`（標準字幕） |

### 4.4 縦（portrait）出力の扱い

- 縦では `mixed` を選べない。WebUI は `mixed` の選択肢を無効化し、選択肢のそばに理由「縦向きの出力ではBiim枠を置けないため選べません」を表示する。`validateForm` も拒否する（§3.1 の文言）。
- 縦で `biim` を選んでいる場合、WebUI は選択肢のそばに「縦向きではBiim枠を使えないため、Biim様式の全画面（枠なし）になります」を表示する（選択は無効化しない。§4.2 変更2）。
- 縦で `anime`／`motion` は制約なし。
- 縦に切り替えた時点で `mixed` が選ばれていた場合、WebUI は**様式を自動で変えない**（黙って変えると利用者の選択を上書きするため）。理由の表示と、生成時の `validateForm` のエラーで知らせる。
- `anime`／`motion` を選んでいる間、WebUI は「全画面モード」と「Biim 使用率」の入力を無効化し、「この様式では常に全画面・枠なし」と表示する（値は保持）。

### 4.5 様式ごとの既定デザイン文

- `src/job.ts` に `explainerDesignDefaults: Record<StyleMode, string>` を置く。`defaults.design === explainerDesignDefaults.biim`（**現行の文をバイト単位で保つ**）。
- 切り替え関数 `switchStyleMode(form: MotionForm, mode: StyleMode): MotionForm`：`form.design === explainerDesignDefaults[form.styleMode]`（完全一致＝未編集）なら `design` を `explainerDesignDefaults[mode]` に差し替える。一致しなければ（編集済み・たたき台を追記済みを含む）`design` を保持する。どちらでも `styleMode` を更新する。
- MV から解説へ戻るとき、保存済みの設定が無ければ `design` は `explainerDesignDefaults[form.styleMode]`（現行の `modeSettingsFor(defaults)` の `design` だけをこれにする）。保存済みの設定があれば現行どおりそれを使う。
- 既定文（T5 はこの文をそのまま使う。`anime`・`motion` の文には §4.6 の禁止語を入れない）：
  - `biim`：現行 `src/job.ts:91-92` の文（変更しない）。
  - `anime`：`通常のアニメ解説として、キャラクターの演技と掛け合いを主役に説明する。枠やノート欄は使わず画面全体を使い、カット割り・寄り引き・リアクションで場面を見せる。字幕は画面下の標準字幕にする。\nドパガキ向けに最後まで飽きずに見られるように、テンポのよい掛け合いとわかりやすいアニメーションを挿入するように努める。各キャラクターの3Dモデルは必要に応じてサイズや位置を変更・移動できるようにする。`
  - `motion`：`通常のモーション解説として、図形・タイポグラフィ・図解の動きを主役に説明する。枠やノート欄は使わず画面全体を使い、説明の構造を図の変化へ翻訳する。字幕は画面下の標準字幕にする。キャラクターは必要な場面だけ登場させてよい。\nドパガキ向けに最後まで飽きずに見られるように、凝った演出やわかりやすいアニメーションを挿入するように努める。`
  - `mixed`：`Biim形式の区間と、通常のアニメ解説・モーション解説の区間を1本の中で織り交ぜる。区間ごとの様式はストーリーボードで場面単位に決め、Biim区間では枠・ノート・字幕の標準を守り、それ以外の区間では画面全体と標準字幕を使う。\nドパガキ向けに最後まで飽きずに見られるように、様式の切り替えを説明の転換点に合わせ、凝った演出やわかりやすいアニメーションを挿入するように努める。各キャラクターの3Dモデルは必要に応じてサイズや位置を変更・移動できるようにする。`

### 4.6 brief・依頼文・ハンドオフの様式別規則

- 解説の brief に `## 様式モード` 節を置き、表示ラベル・平易な説明・その様式の規則（§4.2・§4.3 の要点）を書く。`mixed` では「場面ごとの様式を `plan/storyboard.md` の `様式` と `project.json` の `scenes[].style` に記入し、`anime`／`motion` の場面は `biim: false` にする」を含める。
- **`anime`／`motion` の brief（WebUI が生成する部分）と依頼文に、次の語を含めない**（利用者の原文を写す節＝「動画全体への優先指示（原文）」と、利用者が編集した「デザイン方向性」は除く）：`note_top`、`note_bottom`、`BiimScene`、`BiimOverlay`、`biim-standard`、`biim_usage`、`Biim枠`、`Biimレイアウト`、`Biim使用率`。T5 は既定のデザイン文を使った `anime`・`motion` の brief と依頼文でこれをテストする。
  - 現行の brief でこの対象になる箇所：`src/job.ts:789` のキャラ節（「Biim枠や他の領域をまたぐ演出」「BiimSceneのcharacterStyle」）、`src/job.ts:806-807` の `layoutBrief`、`src/job.ts:855` の「全画面の演出」「場面テキストと字幕」節。非 Biim 様式ではこれらを非 Biim の版（`FullscreenStage` の `characterStyle`、標準字幕、`scenes[].script`／`dialogue` の記入）に差し替える。
- `biim` の brief は現行の文を保つ（新しい節の追加は可）。既存テスト `tests/job.test.ts:543` の `/Biim枠・固定ノート欄を使わず/`（既定フォーム＝`biim` の全画面・縦）と `tests/job.test.ts:626` の `/全画面の演出/` が引き続き通ること。
- スペース版のハンドオフ（T9a・S2）にも同じ禁止語の規則を適用する（AM-2 の6）。

### 4.7 `mixed` の区間上書きの書き方

- 区間＝場面（`project.scenes[]` の1要素）。区間ごとの様式は次の2箇所に同じ値で書く：`plan/storyboard.md` の各場面の `様式:` 行と、`project.json` の `scenes[].style`。一致は PRE-7 で検査する。
- `anime`／`motion` の場面は `biim: false`。`biim` の場面は `biim` を省略（Biim 枠）するか `false`（Biim 様式の全画面）。
- `plan/narration.json` の `segments` で発話を上書きする場合も `scene_id` を付ける（字幕の領域は `scene_id` の場面で決まる。現行 `runtime/src/MainVideo.tsx:63`）。
- 方向性の記録（`plan/direction.md` のスタイル定義）に、どの種類の区間をどの様式にするかの規則を書く（§1.3）。

### 4.8 motion-kit の非 Biim 提示部品（T5b）

AM-2 の4。名前と API はこのとおりにする（T3 は AGENTS.md でこの名前を使う）。3つとも文字を出す層は `motion-kit/layers.ts` の `textLayerStyle` を既定で使う（ゴースト対策、`tests/ghost.test.ts` を無変更で通す）。`runtime/src/` と既存の motion-kit ファイルは変更しない。

| ファイル | export | Props | 役割 |
| --- | --- | --- | --- |
| `motion-kit/FullscreenStage.tsx` | `FullscreenStage` | `children: ReactNode`、`character?: ReactNode`、`secondCharacter?: ReactNode`、`characterStyle?: CSSProperties`、`secondCharacterStyle?: CSSProperties`、`background?: string` | 全面シーン。Biim 枠・ノートを描かず画面全体を使い、キャラを `layout.fullscreen_regions.character`／`character_second` に置く（`BiimOverlay` の `enabled={false}` 相当を Biim の名前なしで提供） |
| `motion-kit/StandardCaption.tsx` | `StandardCaption` | `text: string`、`speakerId?: string`、`style?: CSSProperties` | 標準字幕。`layout.fullscreen_regions.subtitle` に現行 `Captions` の全画面時と同じ見た目で描く。**音声クリップの字幕は `MainVideo` が自動で描く**ので、これは音声なしのジョブや手動の文字表示に使う（二重表示しない旨を部品のコメントに書く） |
| `motion-kit/DiagramStage.tsx` | `DiagramStage` | `children: ReactNode`、`reserveCaption?: boolean`（既定 `true`）、`reserveCharacters?: boolean`（既定 `direction.character_usage !== "none"`）、`padding?: number`（基準座標の px、既定 48） | 図解の全面表示。字幕帯（と必要ならキャラ領域）を避けた矩形に図解を置く |

- motion-kit の `.tsx` は 12 → 15 になる。`tests/job.test.ts:378` の `12` を `15` に変える1行が、`tests/job.test.ts` の既存行で唯一許される変更（計画書 T5b）。
- 非 Biim のスターターシーンは必須にしない。現行の `scenes/Scene001.tsx` は `anime`／`motion`（`layout.mode: "fullscreen"`）では `biimEnabled` が偽になり全画面で描かれる。追加する場合は新規ファイルにし、`scenes/index.tsx` の MV の挙動を変えない（§7）。

### 4.9 計画書 §1.2 からの変更点の一覧

| # | 初期案 | 確定 | 理由 |
| --- | --- | --- | --- |
| 1 | `anime` は全場面 `anime`、`motion` は全場面 `motion` | どちらのモードでも場面は `anime`／`motion` を選べる（省略時はモードと同じ） | §4.2 変更1 |
| 2 | 縦では `biim`／`mixed` を選べない | 縦で選べないのは `mixed` だけ。縦＋`biim` は現行の Biim 様式の全画面 | §4.2 変更2 |
| 3 | （初期案に無い）| 非 Biim 場面は `biim: false` を明記（R5） | `runtime/src/` を変えずに `mixed` の描画を正しくするため |
| 4 | （初期案に無い）| 様式の判定関数を `caption-capacity.mjs` に置く | §6.2 |

---

## 5. Biim 固有検査の棚卸し表

分類：**共通**＝全モード（`biim`／`anime`／`motion`／`mixed`）の全場面に適用。**Biim**＝実効様式が `biim` の場面だけ（`mixed` の Biim 区間を含む）。**Biim 枠**＝Biim 枠が実際に描かれる場面だけ（`sceneUsesBiimFrame` が真）。**MV**＝MV モードだけ（変更しない）。

### 5.1 `validate.mjs`（行番号は現行）

| # | 行 | 検査 | 分類 | T4 での扱い |
| --- | --- | --- | --- | --- |
| V1 | 43-44 | `mode` が explanation／mv | 共通 | 変えない |
| V2 | 45-64 | MV は全画面・Biim なし・完成音源のみ・音源の存在と尺 | MV | 変えない |
| V3 | 65-73 | タイトル、解像度、fps、希望尺 | 共通 | 変えない |
| V4 | 74-80 | 縦は全画面・枠なし・`biim_usage: never` | 共通（幾何の制約） | 変えない |
| V5 | 81-85 | 全画面なら `biim_usage: never`・枠なし | 共通（レイアウトの整合） | 変えない |
| V6 | 86 | キャラ設定 | 共通 | 変えない |
| V7 | 87-100 | 音声エンジン・URL・Style ID・話速 | 共通 | 変えない |
| V8 | 103-129 | 資料・素材（`layout.frame` とフォントの存在を含む。`frame` が `null` なら対象外） | 共通 | 変えない |
| V9 | 130-170 | 音声マニフェスト（尺・重なり・字幕文の有無） | 共通 | 変えない |
| V10 | 172-182 | 公開素材の同期、TypeScript | 共通 | 変えない |
| V11 | 185-188 | `scenes` が空でない | 共通 | 変えない |
| V12 | 190・205 | 場面 ID、`duration_sec` | 共通 | 変えない |
| V13 | 191-196 | 解説の場面は `script` か `dialogue` を持つ | 共通（解説の全様式） | 変えない |
| V14 | 197-198 | `biim: true` の場面は全画面ジョブに置けない | Biim 枠（枠の幾何） | 変えない（R6） |
| V15 | 199-204 | `note_top`／`note_bottom` が文字列 | **Biim** | **実効様式が `biim` の場面だけに適用するよう変更**。`biim` モードでは全場面が `biim` なので現行と同じ結果 |
| V16 | 207-208 | 発話区間の話者 | 共通 | 変えない |
| V17 | 209-221 | 完了記録（40文字以上） | 共通（解説）／MV | 解説に `plan/explanation-map.md`・`plan/direction.md`・`plan/evidence.json` を追加（EX-29）。`plan/evidence.json` は加えて JSON として読め `sources`・`claims` が配列であること（構造の詳細は qc PRE-3）。MV の一覧は変えない |
| V18 | 222-226 | Aivis 音声の生成済み | 共通 | 変えない |
| V19 | 228-241 | preview／final が MP4 | 共通 | 変えない |
| V20 | 249-281 | ゴースト走査（助言） | 共通 | 変えない（N2、`tests/ghost.test.ts:85`） |
| V21 | 新規（`--final` の場面検査） | §4.3 の R1〜R5・R7 | 共通（様式の整合） | 追加。`project.mode === "mv"` では行わない。`style_mode` の無い旧ジョブは `biim` として扱い、R1〜R7 は現行と同じ結果になる |

### 5.2 `qc.mjs`（§2.2.3）

| ゲート | 分類 |
| --- | --- |
| PRE-1〜PRE-7、POST-1〜POST-8（POST-4R・POST-5R を含む） | 共通（`scope: "all"`）。理解設計・方向性・根拠台帳・台本と根拠・ストーリーボード・字幕帯域・ナレーション同期・ゴースト走査・通し視聴・図と読み上げ・納品記録は様式に依存しない |
| PRE-6・POST-4 の**字幕領域の選び方** | 共通の検査だが、領域は場面ごとに §6.3 で決まる（Biim 枠の場面は Biim の字幕領域、それ以外は全画面の字幕領域） |
| POST-4R の「字幕領域の種類ごとに1件以上」 | 共通。ジョブに Biim 枠の場面が無ければ Biim 枠の still は求めない |
| PRE-8（POST-2 で再実行） | **Biim**（`scope: "biim-scenes"`） |

### 5.3 PRE-8「Biim 場面の標準」（EX-07 の機械検査、契約上の追加）

Biim 枠が描かれる場面（`sceneUsesBiimFrame`）が1つ以上あるとき、`project.layout` が `src/biim-standard.json`（biim-standard-v1）の次の値を保っていること：`preset`、`frame`（`assets/biim-frame.svg`）、`colors.background`・`colors.border`・`colors.note`、`fonts.note_top`・`fonts.note_bottom`・`fonts.subtitle` の `family`・`weight`・`size`、`regions.main`・`regions.note_top`・`regions.note_bottom`。比較しないもの：`colors.subtitle`（利用者の字幕色）、`regions.subtitle`・`regions.character`・`regions.character_second`（キャラ配置で生成時に変わる）、`subtitle_frame`。該当場面が無ければ `not-applicable`。

- 基準値は `qc.mjs` に定数として持つ（`src/biim-standard.json` は ZIP に入らないため）。`src/biim-standard.json` と定数の一致は T4 のテストで表明する。
- 理由：EX-07（Biim 場面では枠・ノート・字幕の標準を維持）は MUST だが、現行は機械で確かめていない。AM-2 の3が「Biim 固有検査（枠の幾何、Biim 字幕仕様、レイアウト定数）は Biim の場面にだけ適用」と書いており、その検査の置き場所として PRE-8 を設けた。

### 5.4 brief・依頼文（`src/job.ts`）

| # | 箇所 | 内容 | 分類 |
| --- | --- | --- | --- |
| B1 | `createBrief` 解説の目的〜参考資料（808） | 目的、視聴者、優先指示、デザイン、音声、動画仕様、図解、素材生成、調査・根拠、資料、成果物 | 共通 |
| B2 | 789 | キャラ節の「Biim枠や他の領域をまたぐ演出」「BiimSceneのcharacterStyle」 | **Biim**（非 Biim では `FullscreenStage` の `characterStyle` に差し替え） |
| B3 | 806-807 | `layoutBrief`（全画面の文／`Biimレイアウト使用率`） | **Biim**（非 Biim では標準字幕・全画面の文に差し替え。§4.6 の禁止語） |
| B4 | 855 | 「全画面の演出」節（BiimScene／BiimOverlay への言及） | **Biim** |
| B5 | 855 | 「場面テキストと字幕」節（枠・ノート標準座標、`note_top`／`note_bottom`、BiimScene） | **Biim**（非 Biim では `scenes[].script`／`dialogue`、`speaker_id`、`spoken_text`、標準字幕の説明だけを残す） |
| B6 | 855 | 「場面に合わせたBGM・SE制作」節 | 共通 |
| B7 | 204-205 | `agentPromptFor("explanation")` | 共通（現行文に Biim の語は無い）。EX-25 の順の文に改める |
| B8 | 91-92 | 既定デザイン文 | 様式ごと（§4.5） |
| B9 | 新規 | 品質チェック（23項目）、理解設計、様式モード節 | 共通（様式モード節の中身は様式ごと） |

### 5.5 `job-template/AGENTS.md`（T3 の参考。行番号は現行）

| 行 | 内容 | 分類 |
| --- | --- | --- |
| 96-101、103-104、106 | 静的スライドにしない、自由な実装、キャラは演者、メリハリ、発話と図の同期、2人モードの掛け合い・字幕色・声 | 共通 |
| 100 | `scenes` に `note_top`／`note_bottom` を記録 | **Biim**（非 Biim の場面は `script`／`dialogue` と `style`・`biim: false`） |
| 105、107 | 全画面・縦での Biim 不使用、`biim=false` の場面の扱い | Biim（R5 の書き方と合わせて様式モードの節へ統合） |
| 108-109 | キャラの自由な移動・`Character3D` の使い方 | 共通（`BiimScene` の `characterStyle` への言及は、非 Biim では `FullscreenStage` を併記） |
| 110 | biim-standard-v1 を標準にする、字幕位置の固定 | **Biim**（EX-07。「Biim 様式の場面にだけ適用」と明記） |
| 84-94 | レンダーゴースト | 共通（両モード共通の章へ移す。EX-27） |

---

## 6. 字幕帯域の算出規則（EX-17）

### 6.1 置き場所（単一モジュール）

- **`job-template/runtime/scripts/caption-capacity.mjs`**（T4-1）。式・係数・様式の判定関数はここにだけ書く。`qc.mjs`・`validate.mjs`・`src/explainer-assist.ts`（と WebUI）がこれを import する。他の場所に係数を複製しない。
- **import を持たない純粋な ES モジュールにする**（`node:` モジュールも `lib.mjs` も import しない）。理由：Vite がブラウザ向けに同梱するため。
- 型：同じフォルダに **`caption-capacity.d.mts`** を置く。`src/explainer-assist.ts` からは `import { … } from "../job-template/runtime/scripts/caption-capacity.mjs";` と書く。ルートの `tsconfig.json` は `allowJs` なし・`strict`・`moduleResolution: "bundler"` で、TypeScript はこの指定を同名の `.d.mts` に解決する。`include` は `src` のままでよい（import 経由で読まれる）。
- 条件：`npm run build`（`tsc -b && vite build`）と `npm run build -- --base=/BiimMotionWebUI/` が通る。`npm test`（`node --experimental-strip-types`）からは `.mjs` を直接 import できる。
- `src/templates.ts` の glob により `.mjs` と `.d.mts` は全モードの ZIP に入る。これは §7 の許容差分に含まれる。ジョブ側の `runtime/tsconfig.json` の `include` は `scripts/` を含まないので、ジョブの TypeScript 検査（V10）に影響しない。
- 発話の分割規則（句点・感嘆符・疑問符）は `runtime/scripts/aivis.mjs:42` と同じ正規表現を `caption-capacity.mjs` に持つ（`aivis.mjs` は変更しない。§7）。`qc.mjs` は字幕単位の抽出に `aivis.mjs` の `sceneSegments` をそのまま使う（`validate.mjs:18` と同じ import）。

### 6.2 export（名前と型の契約）

```ts
// caption-capacity.d.mts（要旨。実装時に型を細かくしてよいが、名前と意味は変えない）
export type StyleMode = "biim" | "anime" | "motion" | "mixed";
export type SceneStyle = "biim" | "anime" | "motion";
export interface CaptionProject {
  mode?: string;
  video: { width: number; height: number };
  layout: {
    mode: string;
    base_width: number;
    base_height: number;
    regions: Record<string, number[]>;
    fullscreen_regions: Record<string, number[]>;
    fonts: { subtitle: { size: number } };
  };
  direction: { biim_usage: string; character_usage: string; style_mode?: string };
  scenes?: { id: string; biim?: boolean; style?: string }[];
}
export interface CaptionBox {
  kind: "biim-frame" | "fullscreen";
  width: number; height: number;        // 字幕領域（基準座標）
  fontSize: number;
  charsPerLine: number; lines: number; capacity: number;
}
export interface CaptionFit { width: number; lines: number; fits: boolean }
export const CAPTION_RULE_VERSION: string;          // "1"
export const CAPTION_PADDING: { x: number; y: number };   // 12, 4（片側、基準座標）
export const CAPTION_LINE_HEIGHT: number;           // 1.2
export const FULLSCREEN_CAPTION_FONT: { landscape: number; portrait: number }; // 52, 54
export const BIIM_NO_CHARACTER_WIDTH_RATIO: number; // 0.94
export const SPEECH_CHARS_PER_SEC: number;          // 6.0（暫定。§6.5）
export function effectiveStyleMode(project: CaptionProject): StyleMode;
export function effectiveSceneStyle(project: CaptionProject, scene?: { style?: string }): SceneStyle | undefined;
export function sceneUsesBiimFrame(project: CaptionProject, scene?: { biim?: boolean }): boolean;
export function captionBox(project: CaptionProject, biimFrame: boolean): CaptionBox;
export function candidateCaptionBoxes(project: CaptionProject): CaptionBox[];
export function charWidth(ch: string): number;      // 0.5 または 1
export function textWidth(text: string): number;
export function fitCaption(text: string, box: CaptionBox): CaptionFit;
export function splitCaptionUnits(text: string): string[];
export function estimateSpeechSeconds(text: string, speed?: number): number;
```

### 6.3 式（現行 `runtime/src/Captions.tsx` と `MainVideo.tsx` の描画を写したもの）

場面の字幕領域（`captionBox(project, biimFrame)`、`biimFrame = sceneUsesBiimFrame(project, scene)`。発話クリップの場面は `scene_id` で引き、見つからなければ `scene` 未指定として扱う＝`MainVideo.tsx:63` と同じ）：

1. `[x, y, w, h] = biimFrame ? layout.regions.subtitle : layout.fullscreen_regions.subtitle`（`Captions.tsx:22`、`Presentation.ts:14-15`）
2. 幅 `W = (biimFrame && direction.character_usage === "none") ? 0.94 × layout.base_width : w`（`Captions.tsx:24, 34-40`。`reserveCharacterSpace` は `character_usage !== "none"`、`MainVideo.tsx:64-66`）
3. 文字サイズ `F = biimFrame ? layout.fonts.subtitle.size : (video.height > video.width ? 54 : 52)`（`Captions.tsx:46-51`。Biim レイアウトのジョブでも全画面場面は 52 を使う）
4. 内寸 `innerW = W − 2 × 12`、`innerH = h − 2 × 4`（`Captions.tsx:42`）
5. `charsPerLine = floor(innerW ÷ F)`、`lines = floor(innerH ÷ (F × 1.2))`（`Captions.tsx:52`）、`capacity = charsPerLine × lines`

すべて基準座標（`base_width` 系）で計算する（`unit` は相殺される）。

文字幅と収まりの判定（`fitCaption`）：

- 半角（0.5）：U+0020〜U+007E と U+FF61〜U+FF9F。それ以外は全角（1）。
- 字幕文を改行（`\n`）で分け、各行は前後の空白を除き、連続する空白を1つにまとめる（`whiteSpace: "pre-line"` と同じ扱い）。
- 折り返し後の行数 `L = Σ max(1, ceil(textWidth(行) ÷ charsPerLine))`。**`L ≤ lines` なら収まる**。改行を含まない字幕では「`textWidth ≤ charsPerLine × lines`」と同じ（要件書の「1行の全角文字数 × 行数」）。
- **超過したら字幕単位を分割して直す。字幕ごとにフォントサイズを変える自動縮小は入れない**（EX-17、D7）。

`candidateCaptionBoxes(project)`：ジョブで使われうる字幕領域の一覧。`layout.mode === "biim"` なら `[Biim 枠の領域, 全画面の領域]`（`biim: false` の場面がありうるため）、`fullscreen` なら `[全画面の領域]`。WebUI の `scriptStats` は場面が未定なので「いずれかの領域に収まらない文」を超過として数える（様式に関わらず同じ規則）。

テンプレートの既定値での計算結果（暫定。係数の実測確定は T11 または G4-α で still を撮って行い `VERIFICATION.md` に記録する。係数を変えたら `CAPTION_RULE_VERSION` を上げる）：

| 条件 | 領域 [x,y,w,h] | F | 1行 × 行数 | 容量 | 要件書 EX-17 の試算 |
| --- | --- | --- | --- | --- | --- |
| Biim 枠・1人・左 | [350,870,1528,178] | 64 | 23 × 2 | 46 | 約46 |
| Biim 枠・1人・右 | [42,870,1568,178] | 64 | 24 × 2 | 48 | — |
| Biim 枠・2人 | [310,870,1300,178] | 64 | 19 × 2 | 38 | 約38 |
| Biim 枠・キャラなし | 幅 0.94×1920 | 64 | 27 × 2 | 54 | — |
| 全画面・横（Biim 様式の全画面場面、`anime`、`motion`） | [96,950,1728,110] | 52 | 32 × 1 | 32 | 約32 |
| 全画面・縦 | [54,1715,972,170]（基準 1080×1920） | 54 | 17 × 2 | 34 | 約34 |

### 6.4 PRE-6・POST-4 で検査する字幕単位

- PRE-6（事前）：`plan/narration.json` の `segments` が空でなければその `text`、空なら `sceneSegments(project)`（`aivis.mjs:17`）の各 `text`。どちらも0件なら不合格（「台本を `project.json` の `scenes[].script`／`dialogue`（または `plan/narration.json` の `segments`）に書いてから事前ゲートを実行する」）。`sceneSegments` が例外を投げた場合（2人モードで話者が無い等）もその文言で不合格。
- POST-4（事後）：`assets/audio/narration.json` の `clips[].text`。
- いずれも `scene_id` の場面で §6.3 の領域を選び、`fitCaption` が `fits: false` の単位を `detail` と `scene_ids` に挙げる。
- 様式に関わらず全モードで検査する（AM-2 の3、`scope: "all"`）。音声なし（`voice.engine === "none"`）のジョブは runtime が字幕を自動表示しないので `not-applicable`（手動の字幕は POST-4R のレビューで見る）。

### 6.5 推定読み上げ秒数（ADV-PRE-1、WebUI の `scriptStats`・準備度の警告）

- `estimateSpeechSeconds(text, speed = 1) = 空白以外の文字数 ÷ (SPEECH_CHARS_PER_SEC × speed)`、`SPEECH_CHARS_PER_SEC = 6.0`（暫定の目安。T11 で `assets/audio/narration.json` の実測から確定して `VERIFICATION.md` に記録）。
- 「目安」であることを UI・`detail` に明記する（EX-21）。

---

## 7. MV の不変条件と、MV 生成物の許容差分一覧

### 7.1 不変条件

1. MV の制作原則・工程・検証の仕様を変えない（N1）。許すのは `job-template/AGENTS.md` の章の移動・共通化・案内の追加と、F9 の11文言を残す範囲の文言整理だけ。
2. ghost-check の検出ロジック・しきい値・「検出件数は助言」の位置づけを変えない（N2）。
3. MV に `npm run qc` の規則を足さない（N10）。MV で `qc` を実行すると EX-19 の文を表示して終了コード0、JSON を書かない。
4. MV の入力・表示・生成物は前後で同一（EX-26）：
   - `agentPromptFor("mv")` の文字列がバイト単位で同一（T5 のテストで表明）。
   - MV の `brief.md` がバイト単位で同一。
   - MV の `project.json` は `schema_version` の値（`"0.3"` → `"0.4"`）以外同一。§3.2 の新キーを出力しない。
   - `plan/lyrics.txt` の条件と中身が同一。
   - MV のフォームの既存項目・`switchVideoMode` の MV 側の値・`modeKeys` が同一。
5. `validate.mjs` の MV 分岐の検査内容を変えない（V2・V17 の MV 一覧）。MV フィクスチャ（`tools/make-fixture.ts --mv`）で `validate` が合格する。
6. `runtime/src/`（`Captions.tsx`・`Presentation.ts`・`MainVideo.tsx`・`BiimScene.tsx` など）と既存の `runtime/scripts/`（`validate.mjs` 以外）、既存の motion-kit ファイル、`scenes/index.tsx` の挙動を変えない。
7. 既存の MV 関連テスト（`tests/job.test.ts` の MV 5件、`tests/ghost.test.ts` 全件、`tests/imagegen.test.ts` 全件）がテスト側の変更なしで通る（計画書 §5.0 C-4）。`tests/job.test.ts` の既存行で変えてよいのは motion-kit 数の1行だけ（T5b）。

### 7.2 MV 生成物の許容差分一覧（計画書 §5.3 と同一。これ以外の差分があれば G4 不合格）

- `project.json` の `schema_version` の値のみ（Q2）
- `AGENTS.md`（N1 の範囲：章の移動・共通化・案内の追加。MV 章の本文は削らない）、`README.md`（job-template 側）
- `package.json`・`runtime/package.json` の `qc` スクリプトの追加
- `runtime/scripts/` の新規ファイル（`qc.mjs`、`caption-capacity.mjs` とその型宣言 `caption-capacity.d.mts`）と `validate.mjs`（MV 分岐の挙動不変は MV フィクスチャの `validate` 合格で確認）
- `plan/templates/` の新規ファイル、`motion-kit/` の新規ファイル（§4.8 の3つ）、`scenes/` の新規ファイル（MV の `scenes/index.tsx` の挙動が変わらないこと）
- `brief.md` は**完全一致**

確認手順は計画書 §5.3「MV 生成物の差分検査の手順」による。

---

## 8. AM-2 による要件書記述の読み替え一覧

要件書は書き換えない。T3（job-template 文書）・T5（brief）・T9a（引き渡し仕様）は次の読み替えを反映する。

| # | 要件書の箇所 | 原文（要旨） | 読み替え |
| --- | --- | --- | --- |
| 1 | 2.1「移植しない」表 | 「全場面で Biim 枠・解説字幕・キャラ自動配置を使わない」の理由欄「解説は Biim 枠とキャラが標準」 | 「解説では **Biim は既定であって必須ではない**。様式モード（`biim`／`anime`／`motion`／`mixed`）で選ぶ」 |
| 2 | EX-06 スタイル定義の必須項目 | 「Biim 場面と全画面場面の使い分け規則」 | 「**様式モードと（`mixed` の場合）区間ごとの様式の割り当て規則**」（§1.3）。Biim 様式内の Biim 枠／全画面の使い分けは、`biim`・`mixed` のときこの規則の一部として書く |
| 3 | EX-07 | Biim 場面では枠・ノート・字幕の標準を維持し、視覚様式は主映像領域と全画面場面に適用 | **実効様式が `biim` の場面にだけ適用**（Biim 枠が描かれる場面の機械検査は PRE-8）。`anime`／`motion` の場面には Biim の標準を求めない |
| 4 | EX-11 ストーリーボードの必須欄 | 「レイアウト（Biim・全画面）」 | 「**様式（`biim`／`anime`／`motion`）とレイアウト（`Biim枠`／`全画面`）**」の2欄（§1.4） |
| 5 | 2.4「視覚様式」軸 | 黒板とチョーク／設計図…の見た目の型 | **様式モードを含む軸**。候補は「様式モード」と「その様式内の見た目の型」の組。`explainerCandidates` は様式モードを4つ同格に選んでから型を選ぶ（計画書 T5、A21） |
| 6 | 2.4 決定の理由(2) | 「Biim 枠を使う場面は枠・書体・字幕色が標準で固定」 | Biim 様式の場面に限った説明として読む。`anime`／`motion` の場面では配色・書体の自由度は MV と同等（字幕は標準字幕） |
| 7 | 2.2 原則6「キャラクターは演者」 | 現行規則を維持 | 維持。`motion` ではキャラは任意（登場しない動画もありうる。EX-09 の `character_usage: none` と同じ扱い） |
| 8 | 2.7 失敗チェックリスト 19 | 「Biim 枠・書体・字幕位置が場面ごとにばらつく」 | 文言は変えず（23項目の一致を保つ）、Biim 様式の場面についての項目として読む |
| 9 | POST-4 | 「各レイアウト（Biim・全画面）1件以上を still で確認」 | 「ジョブに存在する字幕領域の種類（Biim 枠／全画面）ごとに1件以上」（§2.2.3 POST-4R） |
| 10 | SP-02・SP-04・SP-05（スペース版） | 解説ジョブの入力・設計パッケージ・ハンドオフ | 入力と設計パッケージに `style_mode` を持ち、`mixed` は区間ごとの様式を持つ。非 Biim 様式のハンドオフ文に Biim レイアウトの指示を入れない（§4.6、AM-2 の6） |

**AM-2 と関係しない解釈（契約で決めた点）**：

- EX-10 の工程8「`project.scenes` の記録」は「確定」と読み、下書きは工程5で書く（§1.4）。
- 要件書の「3.10」は 2.10 の誤記（計画書 D-12）。

---

## 9. 未決・確認事項（`QUESTIONS.md` への転記候補）

本タスクの DIRECTION は `QUESTIONS.md` を「触らない範囲」にしているため、ここに書く。L2 が `QUESTIONS.md` に転記するかを判断する。Q-T1-5 は L2 決定により解決済み（ブロッキング・ゲート）。Q-T1-5 を除く他の項目は非ブロッキングで、本書の既定で進められる。

| ID | 宛先 | 内容 | 本書の既定 |
| --- | --- | --- | --- |
| Q-T1-1 | PM | 事前ゲート（工程6）で PRE-6・PRE-7 を機械判定するには、工程5の時点で `project.json` の `scenes[]` に場面の下書き（id・style・biim・script／dialogue）が要る。EX-10 は `project.scenes` の記録を工程8に置いている。工程5で下書き、工程8で確定と読んでよいか | 読む（§1.4） |
| Q-T1-2 | L2（計画） | 計画書 §1.2 と T1 の DIRECTION は「縦では biim／mixed を選べない」としているが、既存テスト `tests/job.test.ts:603-607`（既定フォームの縦 duo ZIP の生成）と両立しない。縦で選べないのは `mixed` だけにした | §4.2 変更2 |
| Q-T1-3 | PM | PRE-3 に「追加 Web 調査が禁止なのに `web` の source がある場合は不合格」を加えた（要件書 PRE-3 は supplied-only のときだけを書いている） | 加える（§2.1 の6） |
| Q-T1-4 | PM | PRE-8（Biim 場面の標準、EX-07 の機械検査）を新しいゲートとして設けた。要件書 2.6 のゲート表には無い | 設ける（§5.3）。不要なら PRE-8 を外しても他の節は変わらない |
| Q-T1-5 | PM | **解決済み・ブロッキング（ゲート）**（L2 決定 `L2-Q-T1-5.md`、2026-11-13）。preview の孤立フラッシュ全件の照合記録はゲートであり、助言への格下げはしない（要件書 2.6／POST-5／EX-10 工程11）。T3・T4 をブロックする問題として解決済み | §2.2.3 POST-5（preview・final 両方の全件照合行をゲートとして要求） |
