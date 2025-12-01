/**
 * AdvancedText 组件
 * 利用 skia-canvas 的高级文本渲染特性
 * 支持更好的字体渲染、文本装饰、文本转换等
 */

import type { Element } from '@karin-mys/prender/types'
import type { CanvasRenderingContext2D } from 'skia-canvas'

import { drawRoundedRectPath, getBorderRadius } from '@karin-mys/prender/utils/border'
import View from './View'

export interface AdvancedTextStyle {
  // 文本内容和字体
  fontFamily?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  fontStyle?: 'normal' | 'italic' | 'oblique'

  // 文本颜色和装饰
  color?: string
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline'
  textDecorationColor?: string
  textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy'
  textDecorationThickness?: number

  // 文本转换
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'

  // 文本对齐和布局
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  lineHeight?: number
  letterSpacing?: number
  wordSpacing?: number

  // 文本阴影
  textShadow?: string

  // 描边
  textStroke?: string
  textStrokeWidth?: number

  // 文本方向
  direction?: 'ltr' | 'rtl'

  // 文本渲染质量 (skia-canvas 特有)
  textRendering?: 'auto' | 'optimizeSpeed' | 'optimizeLegibility' | 'geometricPrecision'

  // 字距调整
  fontKerning?: 'auto' | 'normal' | 'none'

  // 文本溢出
  textOverflow?: 'clip' | 'ellipsis'
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line'
  wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word'

  // 最大行数
  maxLines?: number

  // 背景和边框
  backgroundColor?: string
  borderRadius?: number
  padding?: number
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
}

function applyTextTransform (text: string, transform?: string): string {
  if (!transform || transform === 'none') return text

  switch (transform) {
    case 'uppercase':
      return text.toUpperCase()
    case 'lowercase':
      return text.toLowerCase()
    case 'capitalize':
      return text.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    default:
      return text
  }
}

function parseTextShadow (textShadow: string): Array<{
  offsetX: number
  offsetY: number
  blur: number
  color: string
}> {
  // 简单的解析，支持 "2px 2px 4px rgba(0,0,0,0.5)" 格式
  const parts = textShadow.split(/\s+/)
  const shadows = []

  let i = 0
  while (i < parts.length) {
    const offsetX = parseFloat(parts[i]) || 0
    const offsetY = parseFloat(parts[i + 1]) || 0
    const blur = parseFloat(parts[i + 2]) || 0
    let color = parts[i + 3] || 'rgba(0,0,0,0.5)'

    // 处理 rgba 或 rgb
    if (color.startsWith('rgba') || color.startsWith('rgb')) {
      let depth = 1
      let colorEnd = i + 3
      while (depth > 0 && colorEnd < parts.length) {
        const part = parts[colorEnd]
        depth += (part.match(/\(/g) || []).length
        depth -= (part.match(/\)/g) || []).length
        if (depth > 0) {
          colorEnd++
          color += ' ' + parts[colorEnd]
        }
      }
      i = colorEnd + 1
    } else {
      i += 4
    }

    shadows.push({ offsetX, offsetY, blur, color })
  }

  return shadows
}

function draw (ctx: CanvasRenderingContext2D, element: Element) {
  View.draw(ctx, element)

  const { layout, style, props } = element
  let text = ''

  // 收集文本内容
  element.children.forEach(child => {
    if (child.type === 'RAW_TEXT' && child.props.text) {
      text += child.props.text
    }
  })

  if (!text) return

  const {
    fontFamily,
    fontSize = 14,
    fontWeight = 'normal',
    fontStyle = 'normal',
    color = 'black',
    textDecoration = 'none',
    textDecorationColor,
    textDecorationStyle = 'solid',
    textDecorationThickness = 1,
    textTransform,
    textAlign = 'left',
    lineHeight,
    letterSpacing = 0,
    wordSpacing = 0,
    textShadow,
    textStroke,
    textStrokeWidth = 1,
    direction = 'ltr',
    textRendering,
    fontKerning,
    textOverflow = 'clip',
    whiteSpace = 'normal',
    wordBreak = 'normal',
    maxLines,
    paddingTop = 0,
    paddingBottom = 0,
    paddingLeft = 0,
    paddingRight = 0,
  } = style as AdvancedTextStyle

  ctx.save()

  const { left, top, width, height } = layout

  // 裁剪区域
  const radius = getBorderRadius(style)
  drawRoundedRectPath(ctx, left, top, width, height, radius)
  ctx.clip()

  // 应用文本转换
  text = applyTextTransform(text, textTransform)

  // 设置字体
  const font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily || 'sans-serif'}`
  ctx.font = font

  // 设置文本渲染质量
  if (textRendering) {
    (ctx as any).textRendering = textRendering
  }

  // 设置字距调整
  if (fontKerning) {
    (ctx as any).fontKerning = fontKerning
  }

  // 设置方向
  ctx.direction = direction

  // 设置字符间距
  if (letterSpacing !== 0) {
    (ctx as any).letterSpacing = `${letterSpacing}px`
  }

  // 设置单词间距
  if (wordSpacing !== 0) {
    (ctx as any).wordSpacing = `${wordSpacing}px`
  }

  const maxWidth = width - paddingLeft - paddingRight
  const contentLeft = left + paddingLeft
  const contentTop = top + paddingTop
  const contentHeight = height - paddingTop - paddingBottom

  // 分行
  let lines: string[] = []
  if (whiteSpace === 'nowrap' || whiteSpace === 'pre') {
    lines = [text]
  } else {
    const words = text.split(/\s+/)
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }

    if (currentLine) {
      lines.push(currentLine)
    }
  }

  // 限制最大行数
  if (maxLines && lines.length > maxLines) {
    lines = lines.slice(0, maxLines)
    if (textOverflow === 'ellipsis') {
      const lastLine = lines[lines.length - 1]
      let truncated = lastLine
      while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1)
      }
      lines[lines.length - 1] = truncated + '...'
    }
  }

  const actualLineHeight = lineHeight || fontSize * 1.2
  const totalHeight = lines.length * actualLineHeight
  let startY = contentTop + (contentHeight - totalHeight) / 2

  ctx.textBaseline = 'middle'
  ctx.fillStyle = color

  // 绘制每一行
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineY = startY + i * actualLineHeight + actualLineHeight / 2
    const metrics = ctx.measureText(line)
    let lineX = contentLeft

    // 应用文本对齐
    if (textAlign === 'center') {
      lineX = contentLeft + (maxWidth - metrics.width) / 2
    } else if (textAlign === 'right') {
      lineX = contentLeft + maxWidth - metrics.width
    }

    // 应用文本阴影
    if (textShadow) {
      const shadows = parseTextShadow(textShadow)
      for (const shadow of shadows) {
        ctx.shadowColor = shadow.color
        ctx.shadowOffsetX = shadow.offsetX
        ctx.shadowOffsetY = shadow.offsetY
        ctx.shadowBlur = shadow.blur
        ctx.fillText(line, lineX, lineY)
      }
      // 重置阴影
      ctx.shadowColor = 'transparent'
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.shadowBlur = 0
    }

    // 绘制描边
    if (textStroke) {
      ctx.strokeStyle = textStroke
      ctx.lineWidth = textStrokeWidth
      ctx.strokeText(line, lineX, lineY)
    }

    // 绘制文本
    ctx.fillText(line, lineX, lineY)

    // 绘制文本装饰
    if (textDecoration !== 'none') {
      ctx.save()
      ctx.strokeStyle = textDecorationColor || color
      ctx.lineWidth = textDecorationThickness

      let decorY = lineY
      if (textDecoration === 'underline') {
        decorY = lineY + fontSize / 2 + 1
      } else if (textDecoration === 'overline') {
        decorY = lineY - fontSize / 2 - 1
      }

      ctx.beginPath()
      if (textDecorationStyle === 'dotted') {
        ctx.setLineDash([2, 2])
      } else if (textDecorationStyle === 'dashed') {
        ctx.setLineDash([5, 3])
      } else if (textDecorationStyle === 'double') {
        ctx.moveTo(lineX, decorY - 2)
        ctx.lineTo(lineX + metrics.width, decorY - 2)
        ctx.moveTo(lineX, decorY + 2)
        ctx.lineTo(lineX + metrics.width, decorY + 2)
      }

      if (textDecorationStyle !== 'double') {
        ctx.moveTo(lineX, decorY)
        ctx.lineTo(lineX + metrics.width, decorY)
      }

      ctx.stroke()
      ctx.restore()
    }
  }

  ctx.restore()
}

export default { draw }
