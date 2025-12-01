import type { CanvasRenderingContext2D } from 'skia-canvas'
import type { Element } from '../../types'

const Rect = {
  draw: async (ctx: CanvasRenderingContext2D, element: Element) => {
    const {
      x,
      y,
      width,
      height,
      radius, // 用于圆角矩形
      fill,
      fillStyle,
      stroke,
      strokeStyle,
      lineWidth,
      shadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
    } = element.props

    // 设置阴影
    if (shadowColor) {
      ctx.shadowColor = shadowColor as string
      ctx.shadowBlur = (shadowBlur as number) || 0
      ctx.shadowOffsetX = (shadowOffsetX as number) || 0
      ctx.shadowOffsetY = (shadowOffsetY as number) || 0
    }

    ctx.beginPath()
    if (radius) {
      // 检查浏览器是否支持 roundRect，如果不支持则手动绘制圆角矩形
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x as number, y as number, width as number, height as number, radius as number | number[])
      } else {
        // 手动绘制圆角矩形
        const r = typeof radius === 'number' ? radius : radius[0]
        const rectX = x as number
        const rectY = y as number
        const rectWidth = width as number
        const rectHeight = height as number

        ctx.moveTo(rectX + r, rectY)
        ctx.arcTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + rectHeight, r)
        ctx.arcTo(rectX + rectWidth, rectY + rectHeight, rectX, rectY + rectHeight, r)
        ctx.arcTo(rectX, rectY + rectHeight, rectX, rectY, r)
        ctx.arcTo(rectX, rectY, rectX + rectWidth, rectY, r)
        ctx.closePath()
      }
    } else {
      ctx.rect(x as number, y as number, width as number, height as number)
    }

    // 支持 fill 和 fillStyle 两种属性名
    const fillColor = (fill || fillStyle) as string
    if (fillColor) {
      ctx.fillStyle = fillColor
      ctx.fill()
    }

    // 支持 stroke 和 strokeStyle 两种属性名
    const strokeColor = (stroke || strokeStyle) as string
    if (strokeColor) {
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = (lineWidth as number) || 1
      ctx.stroke()
    }

    // 重置阴影设置
    if (shadowColor) {
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }
  },
}

export default Rect
