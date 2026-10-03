import { useEffect, useState, type ReactNode } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";
import project from "../../project.json";

export const Fonts = ({ children }: { children: ReactNode }) => {
  const [handle] = useState(() =>
    delayRender("Loading bundled standard Biim fonts"),
  );
  useEffect(() => {
    const roles = project.layout.fonts;
    const definitions = [
      { family: roles.body.family, path: roles.body.path, weight: "100 900" },
      {
        family: roles.subtitle.family,
        path: roles.subtitle.path,
        weight: "800",
      },
    ];
    Promise.all(
      definitions.map(async (definition) => {
        const font = new FontFace(
          definition.family,
          `url("${staticFile(definition.path)}")`,
          { weight: definition.weight, style: "normal" },
        );
        await font.load();
        document.fonts.add(font);
      }),
    )
      .then(() => continueRender(handle))
      .catch((error) => cancelRender(error));
    return () => continueRender(handle);
  }, [handle]);
  return <>{children}</>;
};
