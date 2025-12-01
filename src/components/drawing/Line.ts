import type { CanvasRenderingContext2D } from 'skia-canvas'
import type { Element } from '../../types'

const Line = {
  draw: async (ctx: CanvasRenderingContext2D, element: Element) => {
    const {
      x1,
      y1,
      x2,
      y2,
      stroke,
      strokeStyle,
      lineWidth,
      lineCap,
      lineDash,
    } = element.props

    ctx.beginPath()
    ctx.moveTo(x1 as number, y1 as number)
    ctx.lineTo(x2 as number, y2 as number)

    // 支持 stroke 和 strokeStyle 两种属性名
    const strokeColor = (stroke || strokeStyle) as string

    if (strokeColor) {
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = (lineWidth as number) || 1
      if (lineCap) {
        ctx.lineCap = lineCap as CanvasLineCap
      }
      if (lineDash && Array.isArray(lineDash)) {
        ctx.setLineDash(lineDash)
      } else {
        ctx.setLineDash([])
      }
      ctx.stroke()
    }
  },
}

export default Line
