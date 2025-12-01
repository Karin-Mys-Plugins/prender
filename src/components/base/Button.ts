import type { Element } from '@karin-mys/prender/types'
import { getFontString } from '@karin-mys/prender/utils/font'
import type { CanvasRenderingContext2D } from 'skia-canvas'

import View from './View'

function draw (ctx: CanvasRenderingContext2D, element: Element) {
  View.draw(ctx, element)

  const { left, top, width, height } = element.layout
  const { color } = element.style
  const titleValue = element.props.title
  const title = typeof titleValue === 'string' ? titleValue : ''

  if (title) {
    ctx.save()
    ctx.fillStyle = color || 'black'
    ctx.font = getFontString(element.style)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const textX = left + width / 2
    const textY = top + height / 2

    ctx.fillText(title, textX, textY, width)
    ctx.restore()
  }
}

export default { draw }
