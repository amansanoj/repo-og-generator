import { Hono } from 'hono'
import satori from 'satori'
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

const svgMap: Record<string, ArrayBuffer> = {
  'primary.svg': primarySvg,
  'primary-link.svg': primaryLinkSvg,
  'accent.svg': accentSvg,
  'accent-link.svg': accentLinkSvg,
}

const app = new Hono()


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

    const bgFilename = `${variant}${showLink ? '-link' : ''}.svg`
    const bgSvgBuffer = svgMap[bgFilename]
    const bytes = new Uint8Array(bgSvgBuffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    const bgUrl = `data:image/svg+xml;base64,${btoa(binary)}`

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

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error: any) {
    return c.text(`Error generating image: ${error.message}`, 500)
  }
})

export default app