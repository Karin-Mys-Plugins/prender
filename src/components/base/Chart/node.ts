import type { Element } from '@karin-mys/prender/types'
import { type CanvasRenderingContext2D, Canvas } from 'skia-canvas'

import drawChart from './draw'

const createCanvas = (width: number, height: number) => new Canvas(width, height)

const draw = (ctx: CanvasRenderingContext2D, element: Element) => {
  return drawChart(createCanvas, ctx, element)
}

export default { draw }
