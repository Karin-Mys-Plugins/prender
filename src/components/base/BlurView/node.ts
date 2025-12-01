import type { Element } from '@karin-mys/prender/types'
import { type CanvasRenderingContext2D, Canvas } from 'skia-canvas'

import drawBlurView from './draw'

const createCanvas = (width: number, height: number) => new Canvas(width, height)

function draw (ctx: CanvasRenderingContext2D, element: Element) {
  return drawBlurView(createCanvas, ctx, element)
}

export default { draw }
