import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync } from 'fs'
import { join } from 'path'

export const config = { runtime: 'nodejs' }

const publicDir = join(process.cwd(), 'public')

const rubikRegularData = readFileSync(join(publicDir, 'Rubik-Regular.ttf')).buffer
const rubikSemiBoldData = readFileSync(join(publicDir, 'Rubik-SemiBold.ttf')).buffer

function svgToDataUrl(filename: string): string {
  const bytes = readFileSync(join(publicDir, filename))
  return `data:image/svg+xml;base64,${bytes.toString('base64')}`
}

const svgDataUrls: Record<string, string> = {
  'primary.svg': svgToDataUrl('primary.svg'),
  'primary-link.svg': svgToDataUrl('primary-link.svg'),
  'accent.svg': svgToDataUrl('accent.svg'),
  'accent-link.svg': svgToDataUrl('accent-link.svg'),
}

const app = new Hono().basePath('/')

app.get('/:reponame', async (c) => {
  try {
    const { reponame } = c.req.param()

    const variant = c.req.query('variant') || 'primary'
    const description = c.req.query('description') || 'No description provided.'
    const urlText = c.req.query('url') || ''

    const textColor = variant === 'accent' ? '#FDF1E8' : '#E8F2FB'
    const showLink = urlText.trim().length > 0

    let scale = parseFloat(c.req.query('scale') || '1')
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
    const pngData = new Uint8Array(resvg.render().asPng())

    return new Response(pngData, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error: any) {
    return c.text(`Error generating image: ${error.message}`, 500)
  }
})

export default handle(app)
