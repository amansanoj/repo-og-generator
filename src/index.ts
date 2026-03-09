import { Hono } from 'hono'
import satori from 'satori'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
// @ts-expect-error - TypeScript doesn't natively understand .wasm imports
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm'
// @ts-expect-error - Imported as raw binary via Wrangler Data rule
import rubikRegularData from '../public/Rubik-Regular.ttf'
// @ts-expect-error - Imported as raw binary via Wrangler Data rule
import rubikSemiBoldData from '../public/Rubik-SemiBold.ttf'
// @ts-expect-error - Imported as raw binary via Wrangler Data rule
import primarySvg from '../public/primary.svg'
// @ts-expect-error - Imported as raw binary via Wrangler Data rule
import primaryLinkSvg from '../public/primary-link.svg'
// @ts-expect-error - Imported as raw binary via Wrangler Data rule
import accentSvg from '../public/accent.svg'
// @ts-expect-error - Imported as raw binary via Wrangler Data rule
import accentLinkSvg from '../public/accent-link.svg'

function toDataUrl(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return `data:image/svg+xml;base64,${btoa(binary)}`
}

const svgDataUrls: Record<string, string> = {
  'primary.svg': toDataUrl(primarySvg),
  'primary-link.svg': toDataUrl(primaryLinkSvg),
  'accent.svg': toDataUrl(accentSvg),
  'accent-link.svg': toDataUrl(accentLinkSvg),
}

const app = new Hono()

let wasmInitPromise: Promise<void> | null = null

function getWasmInit(): Promise<void> {
  if (!wasmInitPromise) {
    wasmInitPromise = initWasm(resvgWasm).catch((e) => {
      wasmInitPromise = null
      throw e
    })
  }
  return wasmInitPromise
}

app.get('/:reponame', async (c) => {
  try {
    const { reponame } = c.req.param()
    
    const variant = c.req.query('variant') || 'primary'
    const description = c.req.query('description') || 'No description provided.'
    const urlText = c.req.query('url') || ''

    // Determine text color based on variant
    const textColor = variant === 'accent' ? '#FDF1E8' : '#E8F2FB'

    // Smart logic: Only show the link version if the URL parameter actually has text
    const showLink = urlText.trim().length > 0

    let scale = parseFloat(c.req.query('scale') || '1')
    if (isNaN(scale) || scale <= 0 || scale > 1) scale = 1

    await getWasmInit()

    const bgFilename = `${variant}${showLink ? '-link' : ''}.svg`
    const bgUrl = svgDataUrls[bgFilename]

    const children: any[] = [
      {
        type: 'img',
        props: {
          src: bgUrl,
          width: 1200,
          height: 630,
          style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '630px' }
        }
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
            display: 'flex' 
          },
          children: reponame
        }
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
            display: 'flex' 
          },
          children: description
        }
      }
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
            display: 'flex' 
          },
          children: urlText
        }
      })
    }

    const svg = await satori(
      {
        type: 'div',
        props: {
          style: { display: 'flex', width: '1200px', height: '630px' },
          children: children
        }
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

export default app