import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { OgAssets } from "./assets.js";
import { appConfig } from "./config.js";

const notoEmojiBaseUrl =
  "https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg";
const emojiAssetCache = new Map<string, string>();

function toNotoEmojiUrl(grapheme: string): string {
  const codePoints = Array.from(grapheme)
    .map((character) => character.codePointAt(0))
    .filter(
      (codePoint): codePoint is number =>
        codePoint !== undefined && codePoint !== 0xfe0f,
    )
    .map((codePoint) => codePoint.toString(16))
    .filter((codePoint): codePoint is string => Boolean(codePoint));

  return `${notoEmojiBaseUrl}/emoji_u${codePoints.join("_")}.svg`;
}

async function toNotoEmojiDataUrl(grapheme: string): Promise<string> {
  const cached = emojiAssetCache.get(grapheme);
  if (cached) {
    return cached;
  }

  const response = await fetch(toNotoEmojiUrl(grapheme));
  if (!response.ok) {
    throw new Error(`Failed to load emoji asset for ${grapheme}`);
  }

  const svg = await response.text();
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  emojiAssetCache.set(grapheme, dataUrl);
  return dataUrl;
}

export type OgParams = {
  reponame: string;
  description: string;
  urlText: string;
  variant: string;
  scale: number;
};

export async function renderOgImagePng(
  params: OgParams,
  assets: OgAssets,
): Promise<Uint8Array> {
  const { reponame, description, urlText, variant, scale } = params;
  const showLink = urlText.trim().length > 0;
  const variantColors =
    appConfig.og.colors[variant as keyof typeof appConfig.og.colors] ||
    appConfig.og.colors[appConfig.og.fallbackVariant];
  const textColor = variantColors.textColor;

  const bgFilename = `${variant}${showLink ? "-link" : ""}.svg`;
  const bgUrl =
    assets.svgDataUrls[bgFilename] ||
    assets.svgDataUrls[`${appConfig.og.fallbackVariant}.svg`];

  const children: any[] = [
    {
      type: "img",
      props: {
        src: bgUrl,
        width: appConfig.og.width,
        height: appConfig.og.height,
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: `${appConfig.og.width}px`,
          height: `${appConfig.og.height}px`,
        },
      },
    },
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          left: appConfig.og.layout.title.left,
          top: appConfig.og.layout.title.top,
          fontSize: appConfig.og.layout.title.fontSize,
          lineHeight: appConfig.og.layout.title.lineHeight,
          letterSpacing: appConfig.og.typography.letterSpacing,
          fontFamily: appConfig.files.fonts.bold.family,
          fontWeight: appConfig.og.typography.boldWeight,
          color: textColor,
          display: "flex",
        },
        children: reponame,
      },
    },
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          left: appConfig.og.layout.description.left,
          top: appConfig.og.layout.description.top,
          fontSize: appConfig.og.layout.description.fontSize,
          lineHeight: appConfig.og.layout.description.lineHeight,
          letterSpacing: appConfig.og.typography.letterSpacing,
          fontFamily: appConfig.files.fonts.regular.family,
          fontWeight: appConfig.og.typography.regularWeight,
          color: textColor,
          width: appConfig.og.layout.description.width,
          display: "flex",
          flexWrap: "wrap",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        },
        children: description,
      },
    },
  ];

  if (showLink) {
    children.push({
      type: "div",
      props: {
        style: {
          position: "absolute",
          left: appConfig.og.layout.link.left,
          top: appConfig.og.layout.link.top,
          fontSize: appConfig.og.layout.link.fontSize,
          lineHeight: appConfig.og.layout.link.lineHeight,
          letterSpacing: appConfig.og.typography.letterSpacing,
          fontFamily: appConfig.files.fonts.bold.family,
          fontWeight: appConfig.og.typography.boldWeight,
          color: textColor,
          display: "flex",
        },
        children: urlText,
      },
    });
  }

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          width: `${appConfig.og.width}px`,
          height: `${appConfig.og.height}px`,
          backgroundColor: variantColors.backgroundColor,
        },
        children,
      },
    },
    {
      width: appConfig.og.width,
      height: appConfig.og.height,
      fonts: [
        {
          name: appConfig.files.fonts.regular.family,
          data: assets.regularFont,
          weight: appConfig.og.typography.regularWeight,
          style: "normal",
        },
        {
          name: appConfig.files.fonts.bold.family,
          data: assets.boldFont,
          weight: appConfig.og.typography.boldWeight,
          style: "normal",
        },
      ],
      loadAdditionalAsset: async (languageCode, segment) => {
        if (languageCode === "emoji") {
          return toNotoEmojiDataUrl(segment);
        }

        return [];
      },
    },
  );

  const resvg = new Resvg(svg, { fitTo: { mode: "zoom", value: scale } });
  return resvg.render().asPng();
}
