import { brandRenderColors } from "./brand.js";

export const appConfig = {
  files: {
    homepage: "index.html",
    favicon: "favicon.svg",
    fonts: {
      regular: {
        file: "Geist-Regular.ttf",
        family: "Geist",
      },
      bold: {
        file: "InstrumentSans-Medium.ttf",
        family: "Instrument Sans",
      },
    },
    variants: {
      primary: {
        label: "Primary",
        base: "primary.svg",
        link: "primary-link.svg",
      },
      accent: {
        label: "Accent",
        base: "accent.svg",
        link: "accent-link.svg",
      },
    },
  },
  og: {
    width: 1200,
    height: 630,
    defaultScale: 1,
    minScale: 0.1,
    maxScale: 3,
    fallbackVariant: "primary",
    colors: {
      primary: {
        backgroundColor: brandRenderColors.light.primary,
        textColor: brandRenderColors.light.background,
      },
      accent: {
        backgroundColor: brandRenderColors.dark.accent,
        textColor: brandRenderColors.dark.background,
      },
    },
    typography: {
      regularWeight: 400,
      boldWeight: 700,
      letterSpacing: "0px",
    },
    layout: {
      title: {
        left: "203px",
        top: "72px",
        fontSize: "72px",
        lineHeight: "88px",
      },
      description: {
        left: "72px",
        top: "196px",
        fontSize: "48px",
        lineHeight: "62px",
        width: "1056px",
      },
      link: {
        left: "138px",
        top: "503px",
        fontSize: "48px",
        lineHeight: "62px",
      },
    },
  },
} as const;

export type VariantName = keyof typeof appConfig.files.variants;
