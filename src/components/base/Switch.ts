import type { Element } from '@karin-mys/prender/types'
import type { CanvasRenderingContext2D } from 'skia-canvas'

function draw (ctx: CanvasRenderingContext2D, element: Element) {
  const { left, top, width, height } = element.layout
  const { checked } = element.props
  const { color = '#007BFF' } = element.style

  const trackWidth = width
  const trackHeight = height
  const trackRadius = trackHeight / 2
  const thumbRadius = trackHeight / 2 - 2

  ctx.save()

  // Draw track
  ctx.beginPath()
  ctx.moveTo(left + trackRadius, top)
  ctx.lineTo(left + trackWidth - trackRadius, top)
  ctx.arcTo(left + trackWidth, top, left + trackWidth, top + trackRadius, trackRadius)
  ctx.lineTo(left + trackWidth, top + trackHeight - trackRadius)
  ctx.arcTo(left + trackWidth, top + trackHeight, left + trackWidth - trackRadius, top + trackHeight, trackRadius)
  ctx.lineTo(left + trackRadius, top + trackHeight)
  ctx.arcTo(left, top + trackHeight, left, top + trackHeight - trackRadius, trackRadius)
  ctx.lineTo(left, top + trackRadius)
  ctx.arcTo(left, top, left + trackRadius, top, trackRadius)
  ctx.closePath()

  ctx.fillStyle = checked ? color : '#E9E9EA'
  ctx.fill()

  // Draw thumb
  const thumbX = checked ? left + trackWidth - trackRadius : left + trackRadius
  const thumbY = top + trackRadius

  ctx.beginPath()
  ctx.arc(thumbX, thumbY, thumbRadius, 0, 2 * Math.PI)
  ctx.closePath()
  ctx.fillStyle = 'white'
  ctx.fill()
  ctx.strokeStyle = '#E9E9EA'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.restore()
}

export default { draw }
