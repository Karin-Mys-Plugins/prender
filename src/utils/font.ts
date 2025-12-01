import { Style } from '@karin-mys/prender/types'

// 字体字符串缓存
const fontStringCache = new Map<string, string>()

export function getFontString (style: Style): string {
  const { fontSize = 14, fontFamily = 'sans-serif', fontWeight = 'normal' } = style

  // 生成缓存键
  const familyKey = Array.isArray(fontFamily) ? fontFamily.join(',') : fontFamily
  const cacheKey = `${fontWeight}:${fontSize}:${familyKey}`

  // 查找缓存
  const cached = fontStringCache.get(cacheKey)
  if (cached) return cached

  // 生成字体字符串
  const family = Array.isArray(fontFamily)
    ? fontFamily.map(f => f.includes(' ') ? `"${f}"` : f).join(', ')
    : fontFamily

  const fontString = `${fontWeight} ${fontSize}px ${family}`

  // 缓存结果（限制缓存大小）
  if (fontStringCache.size > 1000) {
    // 清除最早的缓存项
    const firstKey = fontStringCache.keys().next().value
    fontStringCache.delete(firstKey)
  }

  fontStringCache.set(cacheKey, fontString)
  return fontString
}
