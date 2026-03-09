import type { VercelRequest, VercelResponse } from '@vercel/node'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const candidates = [
  join(dirname(fileURLToPath(import.meta.url)), '..', 'public'),
  join(dirname(fileURLToPath(import.meta.url)), 'public'),
  join(process.cwd(), 'public'),
]
const publicDir = candidates.find(d => existsSync(join(d, 'Rubik-Regular.ttf')))
if (!publicDir) throw new Error(`public/ not found. Tried:\n${candidates.join('\n')}`)

const rubikRegularData: ArrayBuffer = readFileSync(join(publicDir, 'Rubik-Regular.ttf')).buffer
const rubikSemiBoldData: ArrayBuffer = readFileSync(join(publicDir, 'Rubik-SemiBold.ttf')).buffer

function svgDataUrl(file: string) {
  return `data:image/svg+xml;base64,${readFileSync(join(publicDir!, file)).toString('base64')}`
}

const svgDataUrls: Record<string, string> = {
  'primary.svg': svgDataUrl('primary.svg'),
  'primary-link.svg': svgDataUrl('primary-link.svg'),
  'accent.svg': svgDataUrl('accent.svg'),
  'accent-link.svg': svgDataUrl('accent-link.svg'),
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const reponame = (req.query.reponame as string) || (req.url?.split('/').pop()?.split('?')[0] ?? 'repo')
    const variant = (req.query.variant as string) || 'primary'
    const description = (req.query.description as string) || 'No description provided.'
    const urlText = (req.query.url as string) || ''

    const textColor = variant === 'accent' ? '#FDF1E8' : '#E8F2FB'
    const showLink = urlText.trim().length > 0

    let scale = parseFloat((req.query.scale as string) || '1')
    if (isNaN(scale) || scale <= 0 || scale > 3) scale = 1

    const bgFilename = `${variant}${showLink ? '-link' : ''}.svg`
    const bgUrl = svgDataUrls[bgFilename]

    const children: any[] = [
      {
        type: 'img',
        props: {
          src: bgUrl,
          width: 1200,
          height: 630,
          style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '630px' },
        },
      },
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            left: '210px',
            top: '75px',
            fontSize: '72px',
            lineHeight: '85px',
            fontFamily: 'Rubik',
            fontWeight: 600,
            color: textColor,
            display: 'flex',
          },
          children: reponame,
        },
      },
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            left: '75px',
            top: '210px',
            fontSize: '48px',
            lineHeight: '57px',
            fontFamily: 'Rubik',
            fontWeight: 400,
            color: textColor,
            width: '1050px',
            display: 'flex',
          },
          children: description,
        },
      },
    ]

    if (showLink) {
      children.push({
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            left: '139px',
            top: '502px',
            fontSize: '48px',
            lineHeight: '57px',
            fontFamily: 'Rubik',
            fontWeight: 600,
            color: textColor,
            display: 'flex',
          },
          children: urlText,
        },
      })
    }

    const svg = await satori(
      {
        type: 'div',
        props: {
          style: { display: 'flex', width: '1200px', height: '630px' },
          children,
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Rubik', data: rubikRegularData, weight: 400, style: 'normal' },
          { name: 'Rubik', data: rubikSemiBoldData, weight: 600, style: 'normal' },
        ],
      }
    )

    const resvg = new Resvg(svg, { fitTo: { mode: 'zoom', value: scale } })
    const pngData = resvg.render().asPng()

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(pngData)
  } catch (error: any) {
    console.error('[og-generator]', error)
    res.status(500).send(`Error: ${error?.message ?? String(error)}`)
  }
}
