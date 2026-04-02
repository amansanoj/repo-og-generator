import { tokens } from '@amansanoj/brand'

export const brandTokens = tokens

export const brandColors = {
  light: brandTokens.color.light.base,
  dark: brandTokens.color.dark.base,
} as const

type OklchColor = {
  l: number
  c: number
  h: number
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function parseOklch(color: string): OklchColor {
  const match = color.match(/oklch\(([^%]+)%\s+([^\s]+)\s+([^\s)]+)\)/i)
  if (!match) {
    throw new Error(`Unsupported OKLCH color: ${color}`)
  }

  return {
    l: Number.parseFloat(match[1]) / 100,
    c: Number.parseFloat(match[2]),
    h: Number.parseFloat(match[3]),
  }
}

function oklchToRgb(color: string): [number, number, number] {
  const { l, c, h } = parseOklch(color)
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const b = c * Math.sin(hRad)

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b

  const l3 = l_ * l_ * l_
  const m3 = m_ * m_ * m_
  const s3 = s_ * s_ * s_

  const r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
  const bRgb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3

  return [
    Math.round(clamp01(r) * 255),
    Math.round(clamp01(g) * 255),
    Math.round(clamp01(bRgb) * 255),
  ]
}

export function oklchToHex(color: string): string {
  const [red, green, blue] = oklchToRgb(color)
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, '0')).join('')}`
}

export const brandRenderColors = {
  light: {
    background: oklchToHex(brandTokens.color.light.base.background),
    text: oklchToHex(brandTokens.color.light.base.text),
    primary: oklchToHex(brandTokens.color.light.base.primary),
    secondary: oklchToHex(brandTokens.color.light.base.secondary),
    accent: oklchToHex(brandTokens.color.light.base.accent),
    primaryLight: oklchToHex(brandTokens.color.light.primary['400']),
    primaryDark: oklchToHex(brandTokens.color.light.primary['700']),
    muted: oklchToHex(brandTokens.color.light.background['100']),
    mutedForeground: oklchToHex(brandTokens.color.light.text['600']),
    border: oklchToHex(brandTokens.color.light.background['200']),
  },
  dark: {
    background: oklchToHex(brandTokens.color.dark.base.background),
    text: oklchToHex(brandTokens.color.dark.base.text),
    primary: oklchToHex(brandTokens.color.dark.base.primary),
    secondary: oklchToHex(brandTokens.color.dark.base.secondary),
    accent: oklchToHex(brandTokens.color.dark.base.accent),
    primaryLight: oklchToHex(brandTokens.color.dark.primary['400']),
    primaryDark: oklchToHex(brandTokens.color.dark.primary['700']),
    muted: oklchToHex(brandTokens.color.dark.background['100']),
    mutedForeground: oklchToHex(brandTokens.color.dark.text['600']),
    border: oklchToHex(brandTokens.color.dark.background['200']),
  },
} as const

const generateCssVariables = (scheme: 'light' | 'dark') => {
  const colors = scheme === 'light' ? brandTokens.color.light : brandTokens.color.dark
  const bgScale = scheme === 'light' ? brandTokens.color.light.background : brandTokens.color.dark.background
  const textScale = scheme === 'light' ? brandTokens.color.light.text : brandTokens.color.dark.text
  const primaryScale = scheme === 'light' ? brandTokens.color.light.primary : brandTokens.color.dark.primary

  return `
  --background: ${colors.base.background};
  --foreground: ${colors.base.text};
  --card: ${colors.base.background};
  --card-foreground: ${colors.base.text};
  --popover: ${colors.base.background};
  --popover-foreground: ${colors.base.text};
  --primary: ${colors.base.primary};
  --primary-foreground: ${scheme === 'light' ? colors.base.background : colors.base.text};
  --primary-light: ${primaryScale['400']};
  --primary-dark: ${primaryScale['700']};
  --secondary: ${colors.base.secondary};
  --secondary-foreground: ${colors.base.text};
  --muted: ${bgScale['100']};
  --muted-foreground: ${textScale['600']};
  --accent: ${colors.base.accent};
  --accent-foreground: ${colors.base.text};
  --border: ${bgScale['200']};
  --input: ${bgScale['200']};
  --ring: ${colors.base.primary};
  --radius: 0.5rem;
  --font-sans: 'Open Sans', sans-serif;
  --font-serif: 'Open Sans', serif;
  --font-mono: 'Open Sans', monospace;
  `
}

export const brandCss = `:root {${generateCssVariables('light')}}
.dark {${generateCssVariables('dark')}}`

export const brandSvgPlaceholders = {
  primary: '__BRAND_PRIMARY__',
  secondary: '__BRAND_SECONDARY__',
  surface: '__BRAND_SURFACE__',
} as const
