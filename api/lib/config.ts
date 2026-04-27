import { brandRenderColors } from './brand.js'

export const appConfig = {
  files: {
    homepage: 'index.html',
    favicon: 'favicon.svg',
    fonts: {
      regular: 'Geist-Regular.ttf',
      bold: 'InstrumentSans-Medium.ttf',
    },
    variants: {
      primary: {
        label: 'Primary',
        base: 'primary.svg',
        link: 'primary-link.svg',
      },
      secondary: {
        label: 'Secondary',
        base: 'secondary.svg',
        link: 'secondary-link.svg',
      },
    },
  },
  og: {
    width: 1200,
    height: 630,
    defaultScale: 1,
    minScale: 0.1,
    maxScale: 3,
    fallbackVariant: 'primary',
    backgroundColor: brandRenderColors.dark.background,
    textColor: brandRenderColors.dark.text,
    typography: {
      family: 'Open Sans',
      regularWeight: 400,
      boldWeight: 700,
      letterSpacing: '0px',
    },
    layout: {
      title: {
        left: '203px',
        top: '72px',
        fontSize: '72px',
        lineHeight: '88px',
      },
      description: {
        left: '72px',
        top: '196px',
        fontSize: '48px',
        lineHeight: '62px',
        width: '1056px',
      },
      link: {
        left: '138px',
        top: '503px',
        fontSize: '48px',
        lineHeight: '62px',
      },
    },
  },
} as const

export type VariantName = keyof typeof appConfig.files.variants
