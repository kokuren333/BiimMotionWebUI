# FIX-REPORT — T1 契約の G3 差し戻し修正

| 項目 | 内容 |
| --- | --- |
| 作業ID | `2026-11-13-explainer-ui-harness` |
| タスク | T1 修正（G3 差し戻し対応、`tasks/T1/FIX-DIRECTION.md`） |
| 実装者 | L3 実働 A（Claude Code 非対話セッション、Opus 5.5、effort medium） |
| ブランチ | `task/T1-contract`（`<BASE>` = `5f59d79`）。push はしていない |
| 合否 | **本書は合否を判定しない**（再レビューは Codex が別コンテキスト・新しい review 用ブランチで行う） |

## 1. 起動時チェック（計画書 §8.1）

| 項目 | 結果 |
| --- | --- |
| 層 | L3 実働 A（FIX-DIRECTION.md の記載から判定） |
| エージェント製品・モデル・effort | Claude Code（非対話）、`claude-opus-5-5`、medium |
| サブエージェント | 起動可能（Agent ツールあり）。本タスクでは使っていない |
| コマンド実行 | 可。`node -v` → v24.15.0。`node_modules/` は worktree に既にあった（`npm ci` は実行していない） |
| 対話 | 不可（非対話実行）。承認カードは発生していない |
| ネットワーク | 本タスクでは使っていない（未確認） |
| 縮退レベル | **0（標準）**。割り当てどおりの製品・モデルでコマンド実行ができる。自己判定になるゲート：なし（再レビューは Codex） |

`ENVIRONMENT.md` は「触らない範囲」のため、起動時チェックは本書にだけ記録した。

## 2. 変更したファイル

- `docs/work/2026-11-13-explainer-ui-harness/CONTRACT.md`（修正）
- `docs/work/2026-11-13-explainer-ui-harness/tasks/T1/FIX-REPORT.md`（本書、新設）

コミット前の `git diff --stat 5f59d79`（本書の作成前に取得）：

```text
 .../2026-11-13-explainer-ui-harness/CONTRACT.md    |  19 ++--
 .../tasks/T1/FIX-DIRECTION.md                      | 115 +++++++++++++++++++++
 2 files changed, 125 insertions(+), 9 deletions(-)
```

`FIX-DIRECTION.md` は L2 の発注コミット `6bdbc09` によるもの（`<BASE>` = `5f59d79` の後に L2 が追加した）。本タスクでは変更していない。本タスクが変更したのは CONTRACT.md（10行追加・9行削除）と本書だけ。

## 3. 修正内容と根拠の対応表

| 指摘 | CONTRACT の箇所 | 修正内容 | 根拠 |
| --- | --- | --- | --- |
| F1 | §2.1 規則4（247行） | `verified` 限定を外し、`kind` が `number`・`formula`・`chart`・`quote` の claim は **status によらず** `common` 以外の source を1つ以上持ち `check` が空でない、とした。規則3（`verified` だけ）との違いを本文に書き、反例（`common` のみ・`kind: "number"`・`status: "hedged"`・`check: ""` → 不合格）を載せた。規則3は変えていない。番号は変えていないので PRE-3 行（「§2.1 の1〜6」）はそのまま | 要件書 PRE-3（status で条件付けていない）、L2 決定 指示1 |
| F2 | §2.2.3 POST-5 行（341行） | 判定に「前者（`ghost-check-preview.json`）の `isolated[]` の全フレームについて `reports/visual-qa.md` に `- GHOST preview f<frame>: <判定>` 行がある」を加えた。他の条件（両 JSON の存在と `kind`、更新時刻、`ゴースト` 行が残っていないこと）は変えていない | 要件書 2.6・POST-5・EX-10 工程11、L2 決定 指示2 |
| F2 | §2.2.3 表の下の注記（347〜348行） | final 限定の注記とその理由（「preview は制作途中の版で…」）を削除し、「preview・final 両方の `isolated[]` 全件の照合行をゲートとして要求する」と書いた。不合格の3条件の文に「『照合を記録していない』は preview・final の両方を指す」を補った。件数で不合格にしない方針は変えていない | 同上 |
| F2 | §2.2.4 `ADV-POST-4` 行（`5f59d79` の364行） | 削除。表の直後に「`ADV-POST-4` は欠番（ID は振り直さない）」と注記した。`ADV-POST-1`〜`3` は変えていない | L2 決定 指示2、FIX-DIRECTION §2 F2-3 |
| N1 | §1.6 `review_mode`・`reviewer` 行（151〜152行） | 空白クラスを `\s` に戻した。書き方は `^review_mode:(?:\s*)(independent|self)\s*$`・`^reviewer:(?:\s*)(\S.*)$`。CONTRACT に理由を明記した（下記） | L2 決定 指示3、G3-REVIEW N1 |
| Q-T1-5 | §9 冒頭（修正後775行）と Q-T1-5 行（修正後783行） | Q-T1-5 行を「**解決済み・ブロッキング（ゲート）**」に書き換え、L2 決定（`L2-Q-T1-5.md`、2026-11-13）と要件書の根拠を転記した。既定は「§2.2.3 POST-5（preview・final 両方の全件照合行をゲートとして要求）」。冒頭は「Q-T1-5 は解決済み（ブロッキング・ゲート）。Q-T1-5 を除く他の項目は非ブロッキング」とした。Q-T1-1〜4 は変えていない。`QUESTIONS.md` には転記していない | L2 決定 指示4、FIX-DIRECTION §2 §9 |

### N1 の補足（`(?:\s*)` にした理由）

初回 REPORT.md §C-6 によると、`[ \t]` に変えた理由は、計画書 C-6 の1本目の検査（`[A-Za-z]:[\\]`）が、キー名末尾の英字・コロン・`\s` のバックスラッシュの並びをドライブ文字として誤検出したことだった。本修正でコロンの直後に `\s*` を素直に戻すと、この誤検出が再発する（本セッションで確認：`git diff 5f59d79 | grep -nE …` が151・152行の2件で一致し、終了コード0）。

そこで、空白クラスは `\s` のままにし、コロンの直後にバックスラッシュが来ないよう `(?:\s*)` で囲んだ。`(?:\s*)` は捕獲しないグループで、`\s*` と同じ意味である。CONTRACT の151行に、この書き方は C-6 の誤検出を避けるためだけである旨を明記した。

旧版（`\s*`）と新版（`(?:\s*)`）が同じ結果になることを Node で確認した（`exec` 結果の JSON を比較）：

```text
review_mode 行（コロンの後の入力）  結果
半角空白＋independent               same
タブ＋self＋末尾空白                same
全角空白＋self                      same   ← [ \t] 版では旧版と結果が違った入力
NBSP＋self＋CR                      same   ← 同上
改行＋self                          same   ← 同上
reviewer 行（コロンの後の入力）
半角空白＋X                         same
全角空白＋X                         same
改行＋X                             same
値なし                              same
```

CONTRACT にはほかに `[ \t]` は無い（`grep -nF '[ \t]'` で151・152行だけだった）。

## 4. 検証コマンドと出力

C-1・C-2 と C-3〜C-6 は、修正後・コミット前の作業ツリーに対して実行した（`<BASE>` = `5f59d79` と作業ツリーの差分）。コミット後にも同じ検査を `5f59d79...HEAD` で再実行した（§4.2）。

### 4.1 コミット前

- **C-1** `npm test` → 終了コード0。

  ```text
  ℹ tests 29
  ℹ pass 29
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ```

- **C-2** `npm run build -- --base=/BiimMotionWebUI/` → 終了コード0（`✓ built in 2.45s`。既存の chunk サイズ警告のみ）。
- **C-3** `git diff --check 5f59d79` → 出力なし、終了コード0。
- **C-4** `git diff --exit-code 955fa5c -- tests/ghost.test.ts tests/imagegen.test.ts` → 終了コード0。`git diff -U0 955fa5c -- tests/job.test.ts | grep '^-[^-]'` → 出力なし（grep 終了コード1）。テストは変更していない。
- **C-5** 変更は CONTRACT.md と本書だけ（§2）。`FIX-DIRECTION.md` の差分は L2 のコミット `6bdbc09` のもの。`review/T1-contract`・`REPORT.md`・`REVIEW-DIRECTION.md`・`G3-REVIEW.md`・`QUESTIONS.md`・`ENVIRONMENT.md` は変更していない。
- **C-6** 1本目（パス・メールアドレス）：N1 の書き方を `(?:\s*)` にした後で出力なし（終了コード1）。2本目（認証情報の語）：出力なし（終了コード1）。
- **C-7** `node_modules/`・`dist/`・`.verification/`・`package-lock.json` の中身は読んでいない。
- **C-8** `cmp docs/work/2026-11-13-explainer-ui-harness/PLAN.md docs/requirements/ORCHESTRATION_PLAN.md` → 終了コード0（計画は変えていない）。

### 4.2 コミット後

コミット後の再実行結果はこの節に追記せず、コミット後に実行したコマンドの出力を最終報告（セッションの出力）に書く（本書を書き換えると2コミット目が要るため）。再レビューでは `5f59d79...HEAD` で再実行すること。

## 5. 修正しなかった事項とその理由

- G3-REVIEW で妥当とされた R4（様式モード契約・縦＋biim の解決）、R5（棚卸し表）、R6（字幕帯域と型）、R7（MV の不変条件）、R8（AM-2 読み替え）の記述、R9 の Q-T1-1〜Q-T1-4 の記述：修正対象外（FIX-DIRECTION §3）。
- §5.5 のソース行参照ずれ：軽微な指摘であり、今回は触れない（FIX-DIRECTION §3）。
- 初回 REPORT.md：修正の記録は本書に書く（FIX-DIRECTION の「触らない範囲」）。
- 修正箇所以外の文言：変更していない。行数は782行から783行に1行増えた（`ADV-POST-4` 行1行を削除し、空行と欠番の注記の2行を足したため）。364行までの行番号は `5f59d79` と同じで、365行以降は1行ずつ後ろにずれる（§9 の Q-T1-5 行は782行から783行へ）。

## 6. 異議・質問

- F1・F2 の修正方針への異議：なし。要件書 PRE-3・2.6・POST-5・EX-10 工程11 の読みは L2 決定と同じ。
- 質問：なし。N1 で `(?:\s*)` の書き方を採ったことは L2 決定 指示3（`\s` に戻す）の範囲内と判断した。再レビューで `:\s*` と書くべきとされた場合は、C-6 の1本目が誤検出で2件一致することを受け入れる必要がある。
