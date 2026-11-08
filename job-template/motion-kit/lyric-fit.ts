// Text-fitting helpers for lyric typography. They estimate glyph widths without
// DOM measurement so every frame renders deterministically.

const isWide = (char: string) =>
  /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/.test(
    char,
  ) || (char.codePointAt(0) ?? 0) > 0xffff;

/** Approximate width of text in em units (CJK ≈ 1em, Latin ≈ 0.6em, space ≈ 0.3em). */
export const textWidthEm = (text: string, letterSpacingEm = 0) =>
  Array.from(text).reduce(
    (sum, char) =>
      sum +
      letterSpacingEm +
      (char === " " ? 0.3 : isWide(char) ? 1 : /[MWmw@%]/.test(char) ? 0.85 : 0.6),
    0,
  );

/**
 * Largest font size (≤ base) whose longest line fits maxWidth.
 * Lines are split only at "\n": design line breaks yourself instead of letting
 * the browser wrap lyrics at arbitrary characters.
 */
export const fitFontSize = (
  text: string,
  maxWidth: number,
  base: number,
  { letterSpacingEm = 0, min = 8 }: { letterSpacingEm?: number; min?: number } = {},
) => {
  const widest = Math.max(
    0.001,
    ...text.split("\n").map((line) => textWidthEm(line, letterSpacingEm)),
  );
  return Math.max(min, Math.min(base, maxWidth / widest));
};
