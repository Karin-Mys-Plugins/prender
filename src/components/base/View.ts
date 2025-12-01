import type { Element } from '@karin-mys/prender/types'
import type { CanvasRenderingContext2D, Image } from 'skia-canvas'

import { drawPartialBorder, drawRoundedRectPath, getBorderRadius, getPartialBorder } from '@karin-mys/prender/utils/border'
import { imageCache } from '@karin-mys/prender/utils/image'
import { applyTransform } from '@karin-mys/prender/utils/transform'

function parseBoxShadow (shadowValue: string) {
  const parts = shadowValue.trim().split(/\s+/)
  const result = { offsetX: 0, offsetY: 0, blur: 0, color: 'rgba(0,0,0,0)' }
  const lengths = parts.filter(p => p.endsWith('px'))
  const colorPart = parts.find(p => !p.endsWith('px') && p)
  if (lengths.length > 0) result.offsetX = parseFloat(lengths[0])
  if (lengths.length > 1) result.offsetY = parseFloat(lengths[1])
  if (lengths.length > 2) result.blur = parseFloat(lengths[2])
  if (colorPart) result.color = colorPart
  return result
}

function createGradient (ctx: CanvasRenderingContext2D, gradientStr: string, width: number, height: number) {
  const match = gradientStr.match(/linear-gradient\((.+)\)/)
  if (!match) return null

  const params = match[1].split(/,(?=\s*#|rgb|hsl)/) // Split by comma before a color
  const anglePart = params.shift()?.trim() || '180deg'
  const colorStops = params

  let angle = 180 // Default: to bottom
  if (anglePart.includes('deg')) {
    angle = parseFloat(anglePart)
  } else {
    const directions = { 'to top': 0, 'to right': 90, 'to bottom': 180, 'to left': 270 }
    angle = directions[anglePart] ?? 180
  }

  const rad = (angle * Math.PI) / 180
  const x1 = Math.round(width * (Math.sin(rad) + 1) / 2)
  const y1 = Math.round(height * (Math.cos(rad) + 1) / 2)
  const x2 = width - x1
  const y2 = height - y1

  const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
  const stopCount = colorStops.length
  colorStops.forEach((stop, i) => {
    gradient.addColorStop(i / (stopCount - 1), stop.trim())
  })

  return gradient
}

function draw (ctx: CanvasRenderingContext2D, element: Element) {
  const { left, top, width, height } = element.layout
  const { background, backgroundColor, backgroundImage, backgroundSize, backgroundPosition, backgroundRepeat, boxShadow, transform } = element.style

  const radius = getBorderRadius(element.style)
  const needsSaveRestore = transform || boxShadow || backgroundImage

  if (needsSaveRestore) ctx.save()

  // Apply transformations
  if (transform) {
    applyTransform(ctx, transform, element)
  }

  if (boxShadow) {
    const shadow = parseBoxShadow(boxShadow)
    ctx.shadowColor = shadow.color
    ctx.shadowBlur = shadow.blur
    ctx.shadowOffsetX = shadow.offsetX
    ctx.shadowOffsetY = shadow.offsetY
    drawRoundedRectPath(ctx, left, top, width, height, radius)
    ctx.fillStyle = 'rgba(0,0,0,1)'
    ctx.fill()
    // 重置阴影
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  // 只在需要裁剪时才使用 clip
  const needsClip = backgroundImage || (radius && (radius[0] > 0 || radius[1] > 0 || radius[2] > 0 || radius[3] > 0))

  if (needsClip) {
    drawRoundedRectPath(ctx, left, top, width, height, radius)
    ctx.clip()
  }

  const bg = background || backgroundColor
  if (bg && typeof bg === 'string' && bg.startsWith('linear-gradient')) {
    const gradient = createGradient(ctx, bg, width, height)
    if (gradient) {
      ctx.fillStyle = gradient
      ctx.fillRect(left, top, width, height)
    }
  } else if (backgroundColor) {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(left, top, width, height)
  }

  if (backgroundImage && (typeof backgroundImage === 'string' || Buffer.isBuffer(backgroundImage))) {
    try {
      // 优先使用缓存的图片
      const image: Image | undefined = imageCache.getImage(backgroundImage)

      if (!image) {
        console.warn('背景图片未预加载:', backgroundImage)
      } else {
        let imgWidth = image.width, imgHeight = image.height
        let drawX = left, drawY = top, drawWidth = width, drawHeight = height

        if (backgroundSize === 'cover') {
          const scale = Math.max(width / imgWidth, height / imgHeight)
          drawWidth = imgWidth * scale
          drawHeight = imgHeight * scale
          drawX = left + (width - drawWidth) / 2
          drawY = top + (height - drawHeight) / 2
        } else if (backgroundSize === 'contain') {
          const scale = Math.min(width / imgWidth, height / imgHeight)
          drawWidth = imgWidth * scale
          drawHeight = imgHeight * scale
          drawX = left + (width - drawWidth) / 2
          drawY = top + (height - drawHeight) / 2
        }

        if (backgroundPosition) {
          const [xPos, yPos] = backgroundPosition.split(' ')
          if (xPos === 'center') drawX = left + (width - drawWidth) / 2
          else if (xPos === 'right') drawX = left + width - drawWidth
          if (yPos === 'center') drawY = top + (height - drawHeight) / 2
          else if (yPos === 'bottom') drawY = top + height - drawHeight
        }

        if (backgroundRepeat && backgroundRepeat !== 'no-repeat') {
          const pattern = ctx.createPattern(image, backgroundRepeat)
          if (pattern) {
            ctx.fillStyle = pattern
            ctx.fillRect(left, top, width, height)
          }
        } else {
          ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
        }
      }
    } catch (error) {
      console.error('Failed to load background image:', error)
    }
  }

  if (needsSaveRestore) ctx.restore()

  const borders = getPartialBorder(element.style)
  if (Object.values(borders).some(b => b)) {
    drawPartialBorder(ctx, left, top, width, height, radius, borders)
  }
}

export default { draw }
