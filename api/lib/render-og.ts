import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import type { OgAssets } from './assets.js'
import { appConfig } from './config.js'

export type OgParams = {
  reponame: string
  description: string
  urlText: string
  variant: string
  scale: number
}

export async function renderOgImagePng(params: OgParams, assets: OgAssets): Promise<Uint8Array> {
  const { reponame, description, urlText, variant, scale } = params
  const textColor = appConfig.og.textColor
  const showLink = urlText.trim().length > 0

  const bgFilename = `${variant}${showLink ? '-link' : ''}.svg`
  const bgUrl = assets.svgDataUrls[bgFilename] || assets.svgDataUrls[`${appConfig.og.fallbackVariant}.svg`]

  const children: any[] = [
    {
      type: 'img',
      props: {
        src: bgUrl,
        width: appConfig.og.width,
        height: appConfig.og.height,
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${appConfig.og.width}px`,
          height: `${appConfig.og.height}px`,
        },
      },
    },
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          left: appConfig.og.layout.title.left,
          top: appConfig.og.layout.title.top,
          fontSize: appConfig.og.layout.title.fontSize,
          lineHeight: appConfig.og.layout.title.lineHeight,
          letterSpacing: appConfig.og.typography.letterSpacing,
          fontFamily: appConfig.og.typography.family,
          fontWeight: appConfig.og.typography.boldWeight,
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
          left: appConfig.og.layout.description.left,
          top: appConfig.og.layout.description.top,
          fontSize: appConfig.og.layout.description.fontSize,
          lineHeight: appConfig.og.layout.description.lineHeight,
          letterSpacing: appConfig.og.typography.letterSpacing,
          fontFamily: appConfig.og.typography.family,
          fontWeight: appConfig.og.typography.regularWeight,
          color: textColor,
          width: appConfig.og.layout.description.width,
          display: 'flex',
          flexWrap: 'wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
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
          left: appConfig.og.layout.link.left,
          top: appConfig.og.layout.link.top,
          fontSize: appConfig.og.layout.link.fontSize,
          lineHeight: appConfig.og.layout.link.lineHeight,
          letterSpacing: appConfig.og.typography.letterSpacing,
          fontFamily: appConfig.og.typography.family,
          fontWeight: appConfig.og.typography.boldWeight,
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
        style: {
          display: 'flex',
          width: `${appConfig.og.width}px`,
          height: `${appConfig.og.height}px`,
          backgroundColor: appConfig.og.backgroundColor,
        },
        children,
      },
    },
    {
      width: appConfig.og.width,
      height: appConfig.og.height,
      fonts: [
        {
          name: appConfig.og.typography.family,
          data: assets.regularFont,
          weight: appConfig.og.typography.regularWeight,
          style: 'normal',
        },
        {
          name: appConfig.og.typography.family,
          data: assets.boldFont,
          weight: appConfig.og.typography.boldWeight,
          style: 'normal',
        },
      ],
    }
  )

  const resvg = new Resvg(svg, { fitTo: { mode: 'zoom', value: scale } })
  return resvg.render().asPng()
}
