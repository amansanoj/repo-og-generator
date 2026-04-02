import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { brandRenderColors, brandSvgPlaceholders } from './brand.js'
import { appConfig } from './config.js'

export type OgAssets = {
  regularFont: ArrayBuffer
  boldFont: ArrayBuffer
  svgDataUrls: Record<string, string>
}

export function resolvePublicDir(): string {
  const candidates = [
    join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public'),
    join(dirname(fileURLToPath(import.meta.url)), '..', 'public'),
    join(process.cwd(), 'public'),
  ]

  const publicDir = candidates.find((dir) => existsSync(join(dir, appConfig.files.fonts.regular)))
  if (!publicDir) {
    throw new Error(`public/ not found. Tried:\n${candidates.join('\n')}`)
  }

  return publicDir
}

function applyBrandColors(svg: string): string {
  return svg
    .replaceAll(brandSvgPlaceholders.primary, brandRenderColors.light.primary)
    .replaceAll(brandSvgPlaceholders.secondary, brandRenderColors.light.secondary)
    .replaceAll(brandSvgPlaceholders.surface, brandRenderColors.light.background)
}

function svgDataUrl(publicDir: string, file: string): string {
  const svg = readFileSync(join(publicDir, file), 'utf8')
  return `data:image/svg+xml;base64,${Buffer.from(applyBrandColors(svg)).toString('base64')}`
}

export function loadOgAssets(publicDir: string): OgAssets {
  const svgDataUrls: Record<string, string> = {}
  for (const [variant, files] of Object.entries(appConfig.files.variants)) {
    svgDataUrls[`${variant}.svg`] = svgDataUrl(publicDir, files.base)
    svgDataUrls[`${variant}-link.svg`] = svgDataUrl(publicDir, files.link)
  }

  return {
    regularFont: readFileSync(join(publicDir, appConfig.files.fonts.regular)).buffer,
    boldFont: readFileSync(join(publicDir, appConfig.files.fonts.bold)).buffer,
    svgDataUrls,
  }
}

export function loadHomepageHtml(publicDir: string): string {
  return readFileSync(join(publicDir, appConfig.files.homepage), 'utf8')
}

export function loadFaviconSvg(publicDir: string): string {
  return applyBrandColors(readFileSync(join(publicDir, appConfig.files.favicon), 'utf8'))
}
