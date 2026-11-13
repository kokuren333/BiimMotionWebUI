import {
  candidateCaptionBoxes,
  estimateSpeechSeconds,
  fitCaption,
  splitCaptionUnits,
  type CaptionProject,
  type StyleMode,
} from "../job-template/runtime/scripts/caption-capacity.mjs";
import type { DirectionAxis } from "./mv-assist.ts";

export const explainerStyles: Record<StyleMode, { label: string; hint: string; options: string[] }> = {
  biim: {
    label: "Biim 形式",
    hint: "黒い枠の中に映像、右上と右下に要点と補足、下に字幕を置く従来の形式。",
    options: ["黒板とチョーク", "設計図・青焼き", "誌面・新聞", "端末・ログ", "切り紙・コラージュ", "フラットな図形と2色", "実験ノート"],
  },
  anime: {
    label: "アニメ解説",
    hint: "枠を使わず画面全体で、キャラクターの演技と掛け合いを中心に説明する。",
    options: ["手描き線とセル画", "切り紙の舞台", "淡い水彩と余白", "漫画のコマ割り", "実験室の寸劇", "影絵とスポットライト"],
  },
  motion: {
    label: "モーション解説",
    hint: "枠を使わず画面全体で、図形・文字・図解の動きを中心に説明する。キャラクターは任意。",
    options: ["フラットな図形と2色", "設計図を描き起こす", "巨大文字と余白", "実データの変形", "紙の模型と断面", "端末のログが図になる"],
  },
  mixed: {
    label: "混在",
    hint: "Biim 形式の場面と、アニメ解説・モーション解説の場面を1本の中で切り替える。横向きのみ。",
    options: ["枠内の問いから寸劇へ", "ノートから全面の設計図へ", "比較は枠内、因果は全面へ", "調査ログからアニメの再現へ", "実験ノートから動く模型へ", "枠内の要約と全面の文字演出"],
  },
};

const soloRoles = ["図に直接介入する語り手", "自問自答", "実況風", "要所だけ登場", "実験する案内人", "視聴者に問いかける探求者"];
const duoRoles = ["先生と生徒", "懐疑派と説明役", "実況と解説", "一緒に調べる", "実験役と観察役", "誤解する役と確かめる役"];

export const explainerAxes: DirectionAxis[] = [
  { key: "opening", label: "導入の型", hint: "最初の15秒で、何が分かるかを示す。", options: ["素朴な疑問から", "よくある誤解を見せて壊す", "結論を先に言い切る", "具体的な一場面から", "数字ひとつの衝撃から", "完成図を先に見せて分解する", "失敗例から"] },
  { key: "structure", label: "説明の骨格", hint: "主張の依存順を、画面の変化へ翻訳する。", options: ["因果の連鎖", "手順の積み上げ", "比較対照", "分類と階層", "問題→原因→解決", "問い→仮説→検証", "時系列", "全体→部分→全体"] },
  { key: "diagram", label: "図解の核", hint: "説明を進める主役の視覚を決める。", options: ["1枚の図を最後まで育てる", "比喩モデル", "実データのチャート", "数式を項ごとに組む", "断面・地図・空間をカメラが動く", "実物・画面の再現に注釈", "キーワードのタイポグラフィ"] },
  { key: "character", label: "キャラの役回り", hint: "人数に合わせ、説明への介入の仕方を変える。", options: soloRoles },
  { key: "visualStyle", label: "視覚様式", hint: "4つの様式を同格に比較し、その様式内の見た目を考える。選択中の様式は自動で変えない。", options: Object.entries(explainerStyles).flatMap(([, style]) => style.options.map((option) => `${style.label}：${option}`)) },
  { key: "tempo", label: "テンポと緩急", hint: "認知負荷と変化率を分け、理解の山場に演出の頂点を置く。", options: ["前半で前提を固め後半で畳みかける", "短い章の連打と章間の一拍", "山場の前で情報量を落とす", "一定のリズムで山場だけ長回し", "問いの後に間を置く", "冒頭で全体像、以降は深掘り"] },
];

export interface ExplainerContext {
  characterMode?: "solo" | "duo";
  characterUsage?: "none" | "occasional" | "frequent";
  width?: number;
  height?: number;
}

export function explainerAxesForContext(context: ExplainerContext = {}): DirectionAxis[] {
  return explainerAxes.flatMap((axis) => axis.key !== "character" ? [axis] :
    context.characterUsage === "none" ? [] : [{ ...axis, options: context.characterMode === "duo" ? duoRoles : soloRoles }]);
}

export type ExplainerCandidate = Record<string, string> & { styleMode: StyleMode };

function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let x = Math.imul(state ^ (state >>> 15), 1 | state);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Each axis uses a shuffled bag. Choose modes before appearances so larger bags cannot bias modes. */
export function explainerCandidates(seed: number, count = 3, context: ExplainerContext = {}): ExplainerCandidate[] {
  const next = random(seed);
  function shuffle<T>(values: T[]): T[] {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  const modes = shuffle<StyleMode>((context.height ?? 1080) > (context.width ?? 1920)
    ? ["anime", "motion"] : ["biim", "anime", "motion", "mixed"]);
  const appearances = Object.fromEntries(Object.entries(explainerStyles).map(([mode, style]) => [mode, shuffle(style.options)]));
  const axes = explainerAxesForContext(context);
  const options = axes.map((axis) => shuffle(axis.options));
  return Array.from({ length: count }, (_, i) => {
    const mode = modes[i % modes.length];
    const appearance = appearances[mode];
    return {
      ...Object.fromEntries(axes.map((axis, a) => [axis.key, axis.key === "visualStyle"
        ? `${explainerStyles[mode].label}：${appearance[Math.floor(i / modes.length) % appearance.length]}`
        : options[a][i % options[a].length]])),
      styleMode: mode,
    };
  });
}

export const formatExplainerCandidate = (candidate: ExplainerCandidate) =>
  `解説の方向性候補（固定の正解ではなく、取捨選択するたたき台。様式モードは選択欄で指定）: ${explainerAxes
    .filter((axis) => candidate[axis.key])
    .map((axis) => `${axis.label}=${candidate[axis.key]}`).join(" / ")}`;

export interface ScriptStatsOptions { project: CaptionProject; speed?: number }

/** Draft statistics are advice. Caption geometry and speech coefficients live in the shared runtime rule. */
export function scriptStats(text: string, options: ScriptStatsOptions) {
  const rows = text.split(/\r?\n/);
  const heading = (row: string) => /^\s*(?:#{1,6}\s+.+|[【\[].+[】\]])\s*$/.test(row);
  const sentences = splitCaptionUnits(rows.filter((row) => !heading(row)).join("\n"));
  const captionBoxes = candidateCaptionBoxes(options.project);
  return {
    characters: Array.from(text.replace(/\s/g, "")).length,
    estimatedSeconds: estimateSpeechSeconds(text, options.speed),
    headings: rows.filter(heading).length,
    blocks: text.split(/\r?\n\s*\r?\n/).filter((block) => block.trim()).length,
    longestSentence: Math.max(0, ...sentences.map((sentence) => Array.from(sentence.replace(/\s/g, "")).length)),
    overCapacitySentences: sentences.filter((sentence) => captionBoxes.some((box) => !fitCaption(sentence, box).fits)).length,
    numericLines: rows.filter((row) => /[0-9０-９=＝≠≤≥<>＋+×÷∑∫√]/u.test(row)).length,
    captionBoxes,
  };
}

/** Failure descriptions shared with brief and UI; these are advice, not export gates. */
export const explainerQualityChecklist = [
  "静止した図と読み上げを並べただけ（スライドの並べ替え）",
  "理解ゴールに寄与しない場面がある",
  "最初の15秒で何が分かる動画かが伝わらない",
  "1場面に新しい概念を詰め込みすぎ",
  "全編が同じテンションで山場が無い、または全部が山場",
  "読み上げと図の変化がずれている（音と一緒に確認）",
  "発話や字幕が場面転換で途中で切れる",
  "根拠のない断定、出典のない数値",
  "数式・単位・グラフの軸や値の誤り、装飾のために作った数値",
  "資料と台本の食い違い、資料内の指示文の実行",
  "固有名詞・専門用語の読み間違い",
  "字幕が領域からはみ出す・長すぎて読み切れない",
  "画面内の文字が小さい・コントラスト不足・表示時間不足",
  "字幕とキャラ・図の衝突、見切れ",
  "キャラがただ立っているだけ（視線・指差し・リアクションが無い）",
  "話者と字幕色・声の取り違え、口調・役割の崩れ",
  "モデルの未読込・かくつき",
  "fade とズームだけの反復、説明にならない飾りの動き",
  "Biim 枠・書体・字幕位置が場面ごとにばらつく（Biim様式の場面についての項目）",
  "汎用AIスライド風（ストック的アイコン、意味のないグラデーション、箇条書き3点の反復）、前作の焼き直し",
  "消えた字幕・文字が単フレームだけ再出現する（レンダーゴースト）",
  "ナレーションが BGM・SE に埋もれる、クリッピング、BGM の継ぎ目",
  "技術的には完成しているが、分かりやすくも面白くもない",
];
