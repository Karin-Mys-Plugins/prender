import type { CanvasRenderingContext2D } from 'skia-canvas'

export interface BorderRadius {
  topLeft: number
  topRight: number
  bottomRight: number
  bottomLeft: number
}

export interface BorderStyle {
  width: number
  style: 'solid' | 'dashed' | 'dotted'
  color: string
}

export interface PartialBorder {
  top?: BorderStyle
  right?: BorderStyle
  bottom?: BorderStyle
  left?: BorderStyle
}

interface BorderStyleProps {
  borderRadius?: number | string
  borderTopLeftRadius?: number
  borderTopRightRadius?: number
  borderBottomRightRadius?: number
  borderBottomLeftRadius?: number
  border?: string
  borderTop?: string
  borderRight?: string
  borderBottom?: string
  borderLeft?: string
  borderWidth?: number
  borderColor?: string
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderTopWidth?: number
  borderTopColor?: string
  borderTopStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderRightWidth?: number
  borderRightColor?: string
  borderRightStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderBottomWidth?: number
  borderBottomColor?: string
  borderBottomStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderLeftWidth?: number
  borderLeftColor?: string
  borderLeftStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
}

export function getBorderRadius (style: BorderStyleProps): BorderRadius {
  const {
    borderRadius,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomRightRadius,
    borderBottomLeftRadius,
  } = style

  if (typeof borderRadius === 'number') {
    return {
      topLeft: borderRadius,
      topRight: borderRadius,
      bottomRight: borderRadius,
      bottomLeft: borderRadius,
    }
  }

  if (typeof borderRadius === 'string') {
    const parsedRadius = parseFloat(borderRadius)
    if (!isNaN(parsedRadius)) {
      return {
        topLeft: parsedRadius,
        topRight: parsedRadius,
        bottomRight: parsedRadius,
        bottomLeft: parsedRadius,
      }
    }
  }

  return {
    topLeft: borderTopLeftRadius || 0,
    topRight: borderTopRightRadius || 0,
    bottomRight: borderBottomRightRadius || 0,
    bottomLeft: borderBottomLeftRadius || 0,
  }
}

export function getPartialBorder (style: BorderStyleProps): PartialBorder {
  const result: PartialBorder = {}

  const parseBorderString = (str: string): BorderStyle | null => {
    if (!str || str.trim() === 'none') return null
    const parts = str.trim().split(/\s+/)
    const width = parseFloat(parts[0])
    if (isNaN(width) || width <= 0) return null
    return {
      width: width,
      style: (parts[1] as BorderStyle['style']) || 'solid',
      color: parts.slice(2).join(' ') || '#000000',
    }
  }

  const border = parseBorderString(style.border)
  if (border) {
    return { top: border, right: border, bottom: border, left: border }
  }

  const sides = ['Top', 'Right', 'Bottom', 'Left']
  sides.forEach(side => {
    const sideLower = side.toLowerCase()
    const borderSide = parseBorderString(style[`border${side}`])
    if (borderSide) {
      result[sideLower] = borderSide
    } else {
      const width = style[`border${side}Width`] ?? style.borderWidth
      const color = style[`border${side}Color`] ?? style.borderColor
      const borderStyle = style[`border${side}Style`] ?? style.borderStyle

      if (width > 0 && borderStyle !== 'none') {
        result[sideLower] = {
          width: width,
          style: borderStyle || 'solid',
          color: color || '#000000',
        }
      }
    }
  })

  return result
}

export function drawRoundedRectPath (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: BorderRadius
) {
  const scaleX = width < 2 * Math.max(radius.topLeft, radius.bottomLeft) ? width / (2 * Math.max(radius.topLeft, radius.bottomLeft)) : 1
  const scaleY = height < 2 * Math.max(radius.topLeft, radius.topRight) ? height / (2 * Math.max(radius.topLeft, radius.topRight)) : 1

  const r = {
    tl: Math.min(radius.topLeft, width / 2, height / 2),
    tr: Math.min(radius.topRight, width / 2, height / 2),
    br: Math.min(radius.bottomRight, width / 2, height / 2),
    bl: Math.min(radius.bottomLeft, width / 2, height / 2),
  }

  ctx.beginPath()
  ctx.moveTo(x + r.tl, y)
  ctx.lineTo(x + width - r.tr, y)
  if (r.tr > 0) ctx.arcTo(x + width, y, x + width, y + r.tr, r.tr)
  ctx.lineTo(x + width, y + height - r.br)
  if (r.br > 0) ctx.arcTo(x + width, y + height, x + width - r.br, y + height, r.br)
  ctx.lineTo(x + r.bl, y + height)
  if (r.bl > 0) ctx.arcTo(x, y + height, x, y + height - r.bl, r.bl)
  ctx.lineTo(x, y + r.tl)
  if (r.tl > 0) ctx.arcTo(x, y, x + r.tl, y, r.tl)
  ctx.closePath()
}

export function drawPartialBorder (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: BorderRadius,
  borders: PartialBorder
) {
  const uniformBorder =
    borders.top && borders.right && borders.bottom && borders.left &&
    borders.top.width === borders.right.width &&
    borders.top.width === borders.bottom.width &&
    borders.top.width === borders.left.width &&
    borders.top.style === borders.right.style &&
    borders.top.style === borders.bottom.style &&
    borders.top.style === borders.left.style &&
    borders.top.color === borders.right.color &&
    borders.top.color === borders.bottom.color &&
    borders.top.color === borders.left.color

  if (uniformBorder && borders.top) {
    ctx.save()
    ctx.strokeStyle = borders.top.color
    ctx.lineWidth = borders.top.width

    if (borders.top.style === 'dashed') ctx.setLineDash([5, 5])
    else if (borders.top.style === 'dotted') ctx.setLineDash([2, 2])

    const offset = borders.top.width / 2
    drawRoundedRectPath(ctx, x + offset, y + offset, width - borders.top.width, height - borders.top.width, {
      topLeft: Math.max(0, radius.topLeft - offset),
      topRight: Math.max(0, radius.topRight - offset),
      bottomRight: Math.max(0, radius.bottomRight - offset),
      bottomLeft: Math.max(0, radius.bottomLeft - offset),
    })

    ctx.stroke()
    ctx.restore()
    return
  }

  // Fallback for non-uniform borders (can be improved)
  Object.entries(borders).forEach(([side, borderStyle]) => {
    if (!borderStyle) return
    ctx.save()
    ctx.strokeStyle = borderStyle.color
    ctx.lineWidth = borderStyle.width
    if (borderStyle.style === 'dashed') ctx.setLineDash([5, 5])
    else if (borderStyle.style === 'dotted') ctx.setLineDash([2, 2])

    ctx.beginPath()
    if (side === 'top') {
      ctx.moveTo(x + radius.topLeft, y + borderStyle.width / 2)
      ctx.lineTo(x + width - radius.topRight, y + borderStyle.width / 2)
    } else if (side === 'right') {
      ctx.moveTo(x + width - borderStyle.width / 2, y + radius.topRight)
      ctx.lineTo(x + width - borderStyle.width / 2, y + height - radius.bottomRight)
    } else if (side === 'bottom') {
      ctx.moveTo(x + width - radius.bottomRight, y + height - borderStyle.width / 2)
      ctx.lineTo(x + radius.bottomLeft, y + height - borderStyle.width / 2)
    } else if (side === 'left') {
      ctx.moveTo(x + borderStyle.width / 2, y + height - radius.bottomLeft)
      ctx.lineTo(x + borderStyle.width / 2, y + radius.topLeft)
    }
    ctx.stroke()
    ctx.restore()
  })
}
