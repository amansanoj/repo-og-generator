import type { VercelRequest, VercelResponse } from '@vercel/node'
import { brandCss } from './lib/brand.js'
import { clampScale, decodeQueryText, normalizeVariant } from './lib/query.js'
import { loadFaviconSvg, loadHomepageHtml, loadOgAssets, resolvePublicDir } from './lib/assets.js'
import { renderOgImagePng } from './lib/render-og.js'

const publicDir = resolvePublicDir()
const homepageHtml = loadHomepageHtml(publicDir)
const faviconSvg = loadFaviconSvg(publicDir)
const ogAssets = loadOgAssets(publicDir)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlPath = req.url?.split('?')[0] ?? '/'

  if (urlPath === '/api/brand-css' || urlPath === '/api/globals.css') {
    res.setHeader('Content-Type', 'text/css; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=604800')
    return res.send(brandCss)
  }

  if (urlPath === '/' || urlPath === '') {
    res.setHeader('Content-Type', 'text/html')
    return res.send(homepageHtml)
  }

  if (urlPath === '/favicon.svg' || urlPath === '/favicon.ico') {
    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Cache-Control', 'public, max-age=604800')
    return res.send(faviconSvg)
  }

  try {
    const rawRepoName = (req.query.reponame as string) || (req.url?.split('/').pop()?.split('?')[0] ?? 'repo')
    const reponame = decodeQueryText(rawRepoName)
    const variant = normalizeVariant(req.query.variant)
    const description = decodeQueryText(req.query.description)
    const urlText = decodeQueryText(req.query.url)
    const scale = clampScale(req.query.scale)

    const pngData = await renderOgImagePng(
      { reponame, variant, description, urlText, scale },
      ogAssets
    )

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    return res.send(pngData)
  } catch (error: any) {
    console.error('[og-generator]', error)
    return res.status(500).send(`Error: ${error?.message ?? String(error)}`)
  }
}
