import { appConfig } from './config.js'

export function decodeQueryText(value: unknown): string {
  if (typeof value !== 'string') return ''
  try {
    return decodeURIComponent(value.replace(/\+/g, '%20'))
  } catch {
    return value.replace(/\+/g, ' ')
  }
}

export function clampScale(input: unknown): number {
  const scale = typeof input === 'string' ? parseFloat(input) : NaN
  if (isNaN(scale) || scale < appConfig.og.minScale || scale > appConfig.og.maxScale) {
    return appConfig.og.defaultScale
  }
  return scale
}

export function normalizeVariant(input: unknown): string {
  const value = typeof input === 'string' ? input : appConfig.og.fallbackVariant
  if (value in appConfig.files.variants) return value
  return appConfig.og.fallbackVariant
}
