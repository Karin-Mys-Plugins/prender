import type { Element } from '@karin-mys/prender/types'
import type { CanvasRenderingContext2D } from 'skia-canvas'

import { normalizeBorderRadius } from '@karin-mys/prender/utils/borderRadius'

function draw (ctx: CanvasRenderingContext2D, element: Element) {
  const { left, top, width, height } = element.layout
  const { checked } = element.props
  const { color = '#007BFF', borderRadius = 4 } = element.style
  const radius = normalizeBorderRadius(borderRadius)

  ctx.save()

  // Draw box
  ctx.beginPath()
  ctx.moveTo(left + radius, top)
  ctx.lineTo(left + width - radius, top)
  ctx.arcTo(left + width, top, left + width, top + radius, radius)
  ctx.lineTo(left + width, top + height - radius)
  ctx.arcTo(left + width, top + height, left + width - radius, top + height, radius)
  ctx.lineTo(left + radius, top + height)
  ctx.arcTo(left, top + height, left, top + height - radius, radius)
  ctx.lineTo(left, top + radius)
  ctx.arcTo(left, top, left + radius, top, radius)
  ctx.closePath()

  ctx.fillStyle = checked ? color : 'white'
  ctx.fill()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw checkmark
  if (checked) {
    ctx.beginPath()
    ctx.moveTo(left + width * 0.2, top + height * 0.5)
    ctx.lineTo(left + width * 0.4, top + height * 0.7)
    ctx.lineTo(left + width * 0.8, top + height * 0.3)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  ctx.restore()
}

export default { draw }
