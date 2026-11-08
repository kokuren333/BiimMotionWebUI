// Input helpers for MV mode: varied direction starting points, lyric checks,
// and the shared quality checklist. Nothing here restricts the agent's methods.

export interface DirectionAxis {
  key: string;
  label: string;
  hint: string;
  options: string[];
}

/** Axes along which each piece should differ from previous works. */
export const directionAxes: DirectionAxis[] = [
  {
    key: "palette",
    label: "配色",
    hint: "主役の色と、使わない色を決める。",
    options: [
      "墨と蛍光ピンクの2色刷り",
      "褪せたシアンとクリーム。黒は使わない",
      "モノクロに警告色を1点だけ",
      "夜の青紫と白抜き",
      "紙の上のパステル3色",
      "曲の進行で彩度が上がり、最後に色が抜ける",
      "資料・歌詞の固有モチーフから抽出した色だけ",
      "補色の衝突をサビの一瞬だけ",
    ],
  },
  {
    key: "typography",
    label: "タイポグラフィ",
    hint: "字幕的な表示と巨大文字の使い分けを決める。",
    options: [
      "極太ゴシックを画面端ぎりぎりまで",
      "明朝の縦組みと広い余白",
      "手書き風のラフな線の文字",
      "等幅の端末・ログ風",
      "一語だけを巨大化する一語主義",
      "字幕サイズと巨大文字の2段階を厳密に切替",
      "伸縮・歪みで語感を見せる変形文字",
    ],
  },
  {
    key: "motion",
    label: "モーションの言語",
    hint: "動きの文法を1〜2種に絞ると統一感が出る。",
    options: [
      "ビートでカットし、動きは最小限",
      "スプリングで弾むオーバーシュート",
      "マスク・ワイプで情報が剥がれる",
      "1ショット風の連続カメラ移動",
      "グリッチ・コマ落ち・ズレ",
      "線が描かれていくドローイング",
      "落下・衝突・散乱の擬似物理",
    ],
  },
  {
    key: "composition",
    label: "構図",
    hint: "歌詞・キャラ・背景の居場所を先に決める。",
    options: [
      "キャラ右・歌詞左の分割",
      "中央一点集中と大きな余白",
      "2〜4分割の画面が並走",
      "前景・中景・背景の奥行きレイヤー",
      "情報パネルが集積するブルータリズム",
      "縦にスクロールする連続空間",
      "被写体を画面端で切る大胆なトリミング",
    ],
  },
  {
    key: "texture",
    label: "質感",
    hint: "画面全体の素材感を1つ決める。",
    options: [
      "紙・リソグラフの粒子と版ズレ",
      "フィルムグレインとハレーション",
      "エッジの立ったフラットなベクター",
      "ブラウン管の走査線とにじみ",
      "切り抜き・テープ・スキャンのコラージュ",
      "光沢のないマットな塗り",
      "3Dの陰影と被写界深度",
    ],
  },
  {
    key: "tempo",
    label: "テンポ感",
    hint: "強調する区間と抑える区間を決める。",
    options: [
      "序盤は静止に近く、サビで情報量を解放",
      "全編ハイテンポ、ブレイクだけ完全停止",
      "フレーズ単位のゆったりした呼吸",
      "一部区間だけ音の役割で割当（キック=ズーム等）",
      "徐々に加速し、最後の一撃で止める",
      "反復フレーズごとに同じ構図を変奏",
    ],
  },
];

export type DirectionCandidate = Record<string, string>;

function random(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let x = Math.imul(state ^ (state >>> 15), 1 | state);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Starting points that differ from each other on every axis.
 * They are combinations to choose from or ignore, not fixed presets.
 */
export function directionCandidates(seed: number, count = 3): DirectionCandidate[] {
  const next = random(seed);
  const shuffled = directionAxes.map((axis) => {
    const options = [...axis.options];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  });
  return Array.from({ length: count }, (_, i) =>
    Object.fromEntries(
      directionAxes.map((axis, a) => [axis.key, shuffled[a][i % shuffled[a].length]]),
    ),
  );
}

export const formatCandidate = (candidate: DirectionCandidate) =>
  `方向性のたたき台（曲に合わせて取捨選択する）: ${directionAxes
    .map((axis) => `${axis.label}=${candidate[axis.key]}`)
    .join(" / ")}`;

const sectionPattern = /^\s*[[【(（<〈].{1,24}[\]】)）>〉]\s*$/;

export interface LyricStats {
  lines: number;
  sections: string[];
  longest: number;
  longLines: number;
  blocks: number;
}

/** Counts lyric lines, section tags and long lines (which need designed breaks). */
export function lyricStats(text: string, longLine = 20): LyricStats {
  const rows = text.split(/\r?\n/);
  const lyricRows = rows.filter((row) => row.trim() && !sectionPattern.test(row));
  const lengths = lyricRows.map((row) => Array.from(row.trim()).length);
  return {
    lines: lyricRows.length,
    sections: rows.filter((row) => sectionPattern.test(row)).map((row) => row.trim()),
    longest: Math.max(0, ...lengths),
    longLines: lengths.filter((length) => length > longLine).length,
    blocks: text
      .split(/\r?\n\s*\r?\n/)
      .filter((block) => block.split(/\r?\n/).some((row) => row.trim() && !sectionPattern.test(row)))
      .length,
  };
}

/** Failure patterns to check while watching the preview (note article ch. 9 + common agent mistakes). */
export const mvQualityChecklist = [
  "静止画を並べ替えただけになっていない",
  "フェードとズームだけの反復になっていない",
  "歌詞・カットが音とずれていない（音と一緒に再生して確認）",
  "歌詞の末尾が場面転換で飛ばされていない",
  "文字が読める（表示時間・サイズ・コントラスト）、画面外へはみ出していない",
  "歌詞の改行位置が自然",
  "キャラクター・素材の見た目が場面ごとに変わっていない",
  "文字やモデルのかくつき・ちらつきがない",
  "凡庸なAI slop風のデザインになっていない",
  "全編がクライマックスになっておらず、強調と抑制がある",
  "技術的に完成しているだけでなく、作品として面白い",
];
