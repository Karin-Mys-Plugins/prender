import { Style } from '@karin-mys/prender/types'

export function getFontString (style: Style): string {
  const { fontSize = 14, fontFamily = 'sans-serif', fontWeight = 'normal' } = style

  const family = Array.isArray(fontFamily)
    ? fontFamily.map(f => f.includes(' ') ? `"${f}"` : f).join(', ')
    : fontFamily

  return `${fontWeight} ${fontSize}px ${family}`
}
