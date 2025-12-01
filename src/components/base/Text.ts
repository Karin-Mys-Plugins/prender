import type { Element } from '@karin-mys/prender/types'
import type { CanvasRenderingContext2D } from 'skia-canvas'

import { drawRoundedRectPath, getBorderRadius } from '@karin-mys/prender/utils/border'
import { getFontString } from '@karin-mys/prender/utils/font'
import { collectFragments, layoutRichText, truncateLines, type StyledFragment } from '@karin-mys/prender/utils/textLayout'

import View from './View'

function drawFragment (ctx: CanvasRenderingContext2D, fragment: StyledFragment, x: number, y: number) {
  const { text, style } = fragment
  const { textDecoration, fontSize = 14, color } = style

  ctx.fillText(text, x, y)

  if (textDecoration === 'none' || !textDecoration) {
    return
  }

  const metrics = ctx.measureText(text)
  const lineWidth = metrics.width
  let lineY = y

  if (textDecoration === 'underline') {
    lineY = y + fontSize / 2 + 1
  } else if (textDecoration === 'line-through') {
    lineY = y
  }

  ctx.save()
  ctx.strokeStyle = color || 'black'
  ctx.lineWidth = Math.max(1, Math.floor(fontSize / 12))
  ctx.beginPath()
  ctx.moveTo(x, lineY)
  ctx.lineTo(x + lineWidth, lineY)
  ctx.stroke()
  ctx.restore()
}

function draw (ctx: CanvasRenderingContext2D, element: Element) {
  View.draw(ctx, element)

  const { layout, style } = element
  const fragments = collectFragments(element, style)
  if (fragments.length === 0) {
    return
  }

  ctx.save()

  const { left, top, width, height } = layout
  const radius = getBorderRadius(style)
  drawRoundedRectPath(ctx, left, top, width, height, radius)
  ctx.clip()

  const { paddingTop = 0, paddingBottom = 0, paddingLeft = 0, paddingRight = 0, textAlign, overflow } = style
  const maxContentWidth = width - (paddingLeft as number) - (paddingRight as number)

  let lines = layoutRichText(ctx, fragments, style, maxContentWidth)
  lines = truncateLines(lines, style.numberOfLines, maxContentWidth)

  const totalTextHeight = lines.reduce((acc, line) => acc + line.height, 0)
  const paddingBoxHeight = height - (paddingTop as number) - (paddingBottom as number)
  let startY

  // 如果设置了numberOfLines，应该从顶部开始显示，而不是居中
  if (overflow === 'hidden' || style.numberOfLines) {
    startY = top + (paddingTop as number)
  } else {
    startY = top + (paddingTop as number) + (paddingBoxHeight - totalTextHeight) / 2
  }

  ctx.textBaseline = 'middle'
  let currentY = startY

  for (const line of lines) {
    const lineY = currentY + line.height / 2
    const align = line.fragments[0]?.style.textAlign || textAlign || 'left'
    let startX

    if (align === 'center') {
      startX = left + (paddingLeft as number) + (maxContentWidth - line.width) / 2
    } else if (align === 'right') {
      startX = left + (paddingLeft as number) + maxContentWidth - line.width
    } else {
      startX = left + (paddingLeft as number)
    }

    let currentX = startX
    for (const fragment of line.fragments) {
      ctx.font = getFontString(fragment.style)
      ctx.fillStyle = fragment.style.color || 'black'

      ctx.shadowColor = 'rgba(0,0,0,0)'
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.shadowBlur = 0

      if (fragment.style.textShadow) {
        const shadowParts = fragment.style.textShadow.trim().split(/\s+/)
        const shadowColor = shadowParts.find(p => !p.endsWith('px')) || 'rgba(0,0,0,0)'
        const lengths = shadowParts.filter(p => p.endsWith('px'))
        ctx.shadowColor = shadowColor
        ctx.shadowOffsetX = parseFloat(lengths[0] || '0')
        ctx.shadowOffsetY = parseFloat(lengths[1] || '0')
        ctx.shadowBlur = parseFloat(lengths[2] || '0')
      }

      drawFragment(ctx, fragment, currentX, lineY)
      currentX += ctx.measureText(fragment.text).width
    }
    currentY += line.height
  }

  ctx.restore()
}

export default {
  draw,
}
