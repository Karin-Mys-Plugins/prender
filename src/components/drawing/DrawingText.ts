import type { CanvasRenderingContext2D } from 'skia-canvas'
import type { Element } from '../../types'

const DrawingText = {
  draw: async (ctx: CanvasRenderingContext2D, element: Element) => {
    const {
      text,
      x,
      y,
      font,
      fill,
      fillStyle,
      stroke,
      strokeStyle,
      textAlign,
      textBaseline,
      maxWidth,
    } = element.props

    if (font) {
      ctx.font = font as string
    }
    if (textAlign) {
      ctx.textAlign = textAlign as CanvasTextAlign
    }
    if (textBaseline) {
      ctx.textBaseline = textBaseline as CanvasTextBaseline
    }

    // 支持 fill 和 fillStyle 两种属性名
    const fillColor = (fill || fillStyle) as string
    if (fillColor) {
      ctx.fillStyle = fillColor
      ctx.fillText(text as string, x as number, y as number, maxWidth as number | undefined)
    }

    // 支持 stroke 和 strokeStyle 两种属性名
    const strokeColor = (stroke || strokeStyle) as string
    if (strokeColor) {
      ctx.strokeStyle = strokeColor
      ctx.strokeText(text as string, x as number, y as number, maxWidth as number | undefined)
    }
  },
}

export default DrawingText
