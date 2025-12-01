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

  ctx.save()

  // Apply transformations
  if (transform) {
    applyTransform(ctx, transform, element)
  }
  const radius = getBorderRadius(element.style)

  if (boxShadow) {
    ctx.save()
    const shadow = parseBoxShadow(boxShadow)
    ctx.shadowColor = shadow.color
    ctx.shadowBlur = shadow.blur
    ctx.shadowOffsetX = shadow.offsetX
    ctx.shadowOffsetY = shadow.offsetY
    drawRoundedRectPath(ctx, left, top, width, height, radius)
    ctx.fillStyle = 'rgba(0,0,0,1)'
    ctx.fill()
    ctx.restore()
  }

  ctx.save()
  drawRoundedRectPath(ctx, left, top, width, height, radius)
  ctx.clip()

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
      // 优先使用缓存的图片，如果没有则尝试加载
      let image: Image | undefined
      const cachedImage = imageCache.getImage(backgroundImage)
      if (cachedImage) {
        image = cachedImage
      }

      if (!image) {
        console.error('无法加载背景图片:', backgroundImage)
        ctx.restore()
        return
      }

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
    } catch (error) {
      console.error('Failed to load background image:', error)
    }
  }
  ctx.restore()

  const borders = getPartialBorder(element.style)
  if (Object.values(borders).some(b => b)) {
    drawPartialBorder(ctx, left, top, width, height, radius, borders)
  }

  ctx.restore()
}

export default { draw }
