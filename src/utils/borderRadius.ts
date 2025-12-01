/**
 * 将 borderRadius 值转换为 Canvas API 可接受的格式
 * @param borderRadius - 边框圆角值，可以是字符串或数字
 * @returns 转换后的数字值
 */
export function normalizeBorderRadius (borderRadius: string | number | undefined): number {
  if (!borderRadius) return 0
  if (typeof borderRadius === 'string') {
    const parsed = parseFloat(borderRadius)
    return isNaN(parsed) ? 0 : parsed
  }
  return borderRadius
}

/**
 * 将 borderRadius 值转换为 Canvas roundRect API 可接受的格式
 * @param borderRadius - 边框圆角值，可以是字符串或数字
 * @returns 转换后的数字或数字数组
 */
export function normalizeBorderRadiusForCanvas (borderRadius: string | number | undefined): number | number[] {
  const normalized = normalizeBorderRadius(borderRadius)
  return normalized
}
