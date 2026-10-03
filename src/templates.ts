const entries = import.meta.glob("../job-template/**/*", {
  eager: true,
  query: "?raw",
  import: "default",
});
import fontAssets from "./font-assets.json";
import type { TemplateFiles } from "./job";
export const templates = Object.fromEntries(
  Object.entries(entries).map(([path, value]) => [
    path.replace("../job-template/", ""),
    value as string,
  ]),
);
export async function loadTemplates(): Promise<TemplateFiles> {
  const output: TemplateFiles = { ...templates };
  for (const asset of fontAssets) {
    const response = await fetch(
      `${import.meta.env.BASE_URL}job-assets/fonts/${asset.name}`,
    );
    if (!response.ok)
      throw new Error(`標準フォントを取得できません: ${asset.name}`);
    const data = new Uint8Array(await response.arrayBuffer());
    const hash = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", data)),
      (byte) => byte.toString(16).padStart(2, "0"),
    ).join("");
    if (hash !== asset.sha256)
      throw new Error(`標準フォントの整合性を確認できません: ${asset.name}`);
    output[`assets/fonts/${asset.name}`] = data;
  }
  return output;
}
