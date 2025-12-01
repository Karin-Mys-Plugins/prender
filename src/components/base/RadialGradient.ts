import type { Element } from '@karin-mys/prender/types'
import type { CanvasRenderingContext2D } from 'skia-canvas'

function draw (ctx: CanvasRenderingContext2D, element: Element) {
  const { left, top, width, height } = element.layout
  const { colors, locations, start, end, innerRadius, outerRadius } = element.style

  const x0 = left + (start?.x || width / 2)
  const y0 = top + (start?.y || height / 2)
  const r0 = innerRadius || 0

  const x1 = left + (end?.x || width / 2)
  const y1 = top + (end?.y || height / 2)
  const r1 = outerRadius || Math.max(width, height) / 2

  const gradient = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1)

  if (colors && locations) {
    colors.forEach((color, index) => {
      gradient.addColorStop(locations[index], color)
    })
  }

  ctx.fillStyle = gradient
  ctx.fillRect(left, top, width, height)
}

export default { draw }
