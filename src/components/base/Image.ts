import type { Element } from "@karin-mys/prender/types"
import type { CanvasRenderingContext2D } from 'skia-canvas'
import type { ImageProps } from "."

import { normalizeBorderRadiusForCanvas } from "@karin-mys/prender/utils/borderRadius"
import { imageCache } from "@karin-mys/prender/utils/image"

function draw (
  ctx: CanvasRenderingContext2D,
  element: Element
) {
  const { left, top, width, height } = element.layout

  const {
    objectFit = "fill",
    objectPosition = "50% 50%",
    borderRadius,
  } = element.style
  const { src } = element.props as unknown as ImageProps

  if (!src || width <= 0 || height <= 0) return

  try {
    // 优先使用缓存的图片
    const image = imageCache.getImage(src)

    ctx.save()

    // 应用 borderRadius 作为裁剪区域
    ctx.beginPath()
    if (borderRadius) {
      const radius = normalizeBorderRadiusForCanvas(borderRadius)
      ctx.roundRect(left, top, width, height, radius)
    } else {
      ctx.rect(left, top, width, height)
    }
    ctx.clip()

    const imgWidth = image?.width || 0
    const imgHeight = image?.height || 0
    const aspectRatio = imgWidth / imgHeight
    const containerAspectRatio = width / height

    let sx = 0,
      sy = 0,
      sWidth = imgWidth,
      sHeight = imgHeight
    let dx = left,
      dy = top,
      dWidth = width,
      dHeight = height

    if (objectFit === "cover") {
      if (aspectRatio > containerAspectRatio) {
        sWidth = imgHeight * containerAspectRatio
        sx = (imgWidth - sWidth) / 2
      } else {
        sHeight = imgWidth / containerAspectRatio
        sy = (imgHeight - sHeight) / 2
      }
    } else if (objectFit === "contain") {
      if (aspectRatio > containerAspectRatio) {
        dHeight = width / aspectRatio
        dy = top + (height - dHeight) / 2
      } else {
        dWidth = height * aspectRatio
        dx = left + (width - dWidth) / 2
      }
    } else if (objectFit === "none") {
      dWidth = imgWidth
      dHeight = imgHeight
      dx = left + (width - dWidth) / 2
      dy = top + (height - dHeight) / 2
    } else if (objectFit === "scale-down") {
      if (imgWidth <= width && imgHeight <= height) {
        // 'none' a
        dWidth = imgWidth
        dHeight = imgHeight
        dx = left + (width - dWidth) / 2
        dy = top + (height - dHeight) / 2
      } else {
        // 'contain'
        if (aspectRatio > containerAspectRatio) {
          dHeight = width / aspectRatio
          dy = top + (height - dHeight) / 2
        } else {
          dWidth = height * aspectRatio
          dx = left + (width - dWidth) / 2
        }
      }
    }
    // 'fill' 是默认行为，不需要额外处理

    // 解析 object-position
    const [xPos, yPos] = objectPosition.split(" ")
    const xPercent = parseFloat(xPos) / 100
    const yPercent = parseFloat(yPos) / 100

    if (objectFit === "cover") {
      sx = (imgWidth - sWidth) * xPercent
      sy = (imgHeight - sHeight) * yPercent
    } else if (
      objectFit === "contain" ||
      objectFit === "none" ||
      objectFit === "scale-down"
    ) {
      dx = left + (width - dWidth) * xPercent
      dy = top + (height - dHeight) * yPercent
    }

    ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

    ctx.restore()
  } catch (error) {
    console.error("加载或绘制图片失败:", error)
  }
}

export default { draw }
