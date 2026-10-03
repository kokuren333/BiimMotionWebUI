# Standard Biim fonts

These unmodified font files are bundled in every generated Motion Job.

- NotoSansJP-Variable.ttf: Noto Sans JP, weights 100–900. Copyright 2014–2021 Adobe. See OFL.txt.
- MPLUSRounded1c-ExtraBold.ttf: M PLUS Rounded 1c ExtraBold, weight 800. Copyright 2016 The Rounded M+ Project Authors. See MPLUSRounded1c-OFL.txt.

Copied from https://github.com/kokuren333/BiimSlideMaker/tree/main/assets/fonts on 2026-10-04, preserving the corresponding OFL licenses. Noto upstream: https://github.com/google/fonts/tree/main/ofl/notosansjp . Rounded upstream: https://github.com/google/fonts/tree/main/ofl/roundedmplus1c .

SHA-256:
NotoSansJP-Variable.ttf: c2f3b4d463500a2ddcd3849cded1fceeb9fd6d1c32e6cbecd568453ba50fc68f
MPLUSRounded1c-ExtraBold.ttf: 8e7c15901dca87f1451b356dda594f7d092ba252a5dcc47da74523a242493c36

runtime/src/Fonts.tsx explicitly loads these files and blocks rendering until ready. No installed system font or remote font CDN is required for these roles. The alias M PLUS Rounded 1c is registered explicitly; its internal legacy family name is Rounded Mplus 1c ExtraBold.
