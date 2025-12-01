import type { Element } from '@karin-mys/prender/types'
import type { CanvasGradient, CanvasRenderingContext2D } from 'skia-canvas'

// Extend the context type to include `createConicGradient` if it's missing
// from the standard `node-canvas` type definitions.
interface ConicGradientContext extends CanvasRenderingContext2D {
  createConicGradient (startAngle: number, x: number, y: number): CanvasGradient
}

function draw (ctx: CanvasRenderingContext2D, element: Element) {
  const { left, top, width, height } = element.layout
  const { colors, locations, start, angle = 0 } = element.style

  const x = left + (start?.x || width / 2)
  const y = top + (start?.y || height / 2)

  // Use the extended context type to access `createConicGradient`.
  const gradient = (ctx as ConicGradientContext).createConicGradient(angle, x, y)

  if (colors && locations) {
    colors.forEach((color, index) => {
      gradient.addColorStop(locations[index], color)
    })
  }

  ctx.fillStyle = gradient
  ctx.fillRect(left, top, width, height)
}

export default { draw }
