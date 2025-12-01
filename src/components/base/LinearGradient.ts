import type { Element } from '@karin-mys/prender/types'
import type { CanvasRenderingContext2D } from 'skia-canvas'

function draw (ctx: CanvasRenderingContext2D, element: Element) {
  const { left, top, width, height } = element.layout
  const { startColor, endColor, colors, locations, start, end } = element.style

  const gradient = ctx.createLinearGradient(
    left + (start?.x || 0),
    top + (start?.y || 0),
    left + (end?.x || width),
    top + (end?.y || height)
  )

  if (colors && locations) {
    colors.forEach((color, index) => {
      gradient.addColorStop(locations[index], color)
    })
  } else if (startColor && endColor) {
    gradient.addColorStop(0, startColor)
    gradient.addColorStop(1, endColor)
  }

  ctx.fillStyle = gradient
  ctx.fillRect(left, top, width, height)
}

export default { draw }
