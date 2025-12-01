import type { Element } from '@karin-mys/prender/types'
import type { CanvasRenderingContext2D } from 'skia-canvas'

/**
 * Parses a transform string (e.g., "translateX(10px) rotate(45deg)") or transform array
 * and applies the transformations to the canvas context.
 * @param ctx The canvas rendering context.
 * @param transform The transform string or array from the style.
 * @param element The element being drawn, used to get dimensions for transform-origin.
 */
export function applyTransform (ctx: CanvasRenderingContext2D, transform: string | { [key: string]: string }[], element: Element) {
  if (!transform) return

  // Convert array format to string format if needed
  let transformString: string
  if (Array.isArray(transform)) {
    transformString = transform.map(t => {
      const key = Object.keys(t)[0]
      const value = t[key]
      return `${key}(${value})`
    }).join(' ')
  } else {
    transformString = transform
  }

  const { layout, style } = element
  const { width, height } = layout
  const transformOrigin = style.transformOrigin || '50% 50%'

  // 1. Calculate the origin point in pixels
  const [originXStr, originYStr] = transformOrigin.split(' ')
  const originX = originXStr.includes('%')
    ? (parseFloat(originXStr) / 100) * width
    : parseFloat(originXStr)
  const originY = originYStr.includes('%')
    ? (parseFloat(originYStr) / 100) * height
    : parseFloat(originYStr)

  // 2. Translate the canvas to the origin point
  ctx.translate(layout.left + originX, layout.top + originY)

  // 3. Apply transformations
  const regex = /(\w+)\(([^)]+)\)/g
  let match
  while ((match = regex.exec(transformString)) !== null) {
    const func = match[1]
    const args = match[2].split(',').map(s => s.trim())

    switch (func) {
      case 'translateX':
        ctx.translate(parseFloat(args[0]), 0)
        break
      case 'translateY':
        ctx.translate(0, parseFloat(args[0]))
        break
      case 'translate':
        ctx.translate(parseFloat(args[0]), parseFloat(args[1] || '0'))
        break
      case 'rotate':
        const angle = args[0].includes('deg')
          ? parseFloat(args[0]) * (Math.PI / 180)
          : parseFloat(args[0])
        ctx.rotate(angle)
        break
      case 'scaleX':
        ctx.scale(parseFloat(args[0]), 1)
        break
      case 'scaleY':
        ctx.scale(1, parseFloat(args[0]))
        break
      case 'scale':
        ctx.scale(parseFloat(args[0]), parseFloat(args[1] || args[0]))
        break
      case 'skewX':
        ctx.transform(1, 0, Math.tan(parseFloat(args[0]) * (Math.PI / 180)), 1, 0, 0)
        break
      case 'skewY':
        ctx.transform(1, Math.tan(parseFloat(args[0]) * (Math.PI / 180)), 0, 1, 0, 0)
        break
      case 'skew':
        ctx.transform(
          1,
          Math.tan(parseFloat(args[1] || '0') * (Math.PI / 180)),
          Math.tan(parseFloat(args[0]) * (Math.PI / 180)),
          1,
          0,
          0
        )
        break
    }
  }

  // 4. Translate the canvas back
  ctx.translate(-(layout.left + originX), -(layout.top + originY))
}
