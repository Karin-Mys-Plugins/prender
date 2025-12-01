import type { CanvasRenderingContext2D } from 'skia-canvas'
import type { Element } from '../../types'

const Circle = {
  draw: async (ctx: CanvasRenderingContext2D, element: Element) => {
    const {
      cx,
      cy,
      r,
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
    ctx.arc(
      cx as number,
      cy as number,
      r as number,
      0,
      2 * Math.PI
    )

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

export default Circle
