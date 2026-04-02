import type { VercelRequest, VercelResponse } from '@vercel/node'
import { appConfig } from './lib/config.js'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.send({
    fallbackVariant: appConfig.og.fallbackVariant,
    variants: Object.entries(appConfig.files.variants).map(([value, config]) => ({
      value,
      label: config.label,
    })),
  })
}