import type { CreateCanvas, Element } from '@karin-mys/prender/types'
import type { Canvas, CanvasRenderingContext2D, ImageData } from 'skia-canvas'

import { normalizeBorderRadius } from '@karin-mys/prender/utils/borderRadius'
import { getSafeDPR } from '@karin-mys/prender/utils/dpr'

/**
 * 执行高斯模糊算法的快速近似实现，使用多次盒子模糊实现。
 * 多次应用盒子模糊可以近似高斯模糊效果，得到更自然的模糊效果。
 * @param imageData - 要进行模糊处理的 ImageData 对象。
 * @param radius - 模糊半径。
 */
function gaussianBlur (imageData: ImageData, radius: number) {
  // 为获得近似高斯模糊效果，我们进行三次盒子模糊
  // 这是标准技术：三次盒子模糊能很好地近似高斯模糊
  const boxRadius = Math.floor(radius * 0.5)
  if (boxRadius < 1) return

  // 分离水平和垂直方向的模糊，提高性能
  boxBlurHorizontal(imageData, boxRadius)
  boxBlurVertical(imageData, boxRadius)

  // 第二次盒子模糊
  boxBlurHorizontal(imageData, boxRadius)
  boxBlurVertical(imageData, boxRadius)

  // 第三次盒子模糊
  boxBlurHorizontal(imageData, boxRadius)
  boxBlurVertical(imageData, boxRadius)
}

/**
 * 水平方向盒子模糊
 */
function boxBlurHorizontal (imageData: ImageData, radius: number) {
  const pixels = imageData.data
  const width = imageData.width
  const height = imageData.height
  const tempPixels = new Uint8ClampedArray(pixels)

  for (let y = 0; y < height; y++) {
    let red = 0, green = 0, blue = 0, alpha = 0

    // 初始化滑动窗口
    for (let i = -radius; i <= radius; i++) {
      const x = Math.min(width - 1, Math.max(0, i))
      const index = (y * width + x) * 4
      red += tempPixels[index]
      green += tempPixels[index + 1]
      blue += tempPixels[index + 2]
      alpha += tempPixels[index + 3]
    }

    // 滑动窗口遍历每个像素
    for (let x = 0; x < width; x++) {
      // 设置当前像素的值
      const destIndex = (y * width + x) * 4
      const windowSize = 2 * radius + 1
      pixels[destIndex] = red / windowSize
      pixels[destIndex + 1] = green / windowSize
      pixels[destIndex + 2] = blue / windowSize
      pixels[destIndex + 3] = alpha / windowSize

      // 移除窗口左侧像素
      const removeX = Math.max(0, x - radius)
      const removeIndex = (y * width + removeX) * 4
      red -= tempPixels[removeIndex]
      green -= tempPixels[removeIndex + 1]
      blue -= tempPixels[removeIndex + 2]
      alpha -= tempPixels[removeIndex + 3]

      // 添加窗口右侧新像素
      const addX = Math.min(width - 1, x + radius + 1)
      const addIndex = (y * width + addX) * 4
      red += tempPixels[addIndex]
      green += tempPixels[addIndex + 1]
      blue += tempPixels[addIndex + 2]
      alpha += tempPixels[addIndex + 3]
    }
  }
}

/**
 * 垂直方向盒子模糊
 */
function boxBlurVertical (imageData: ImageData, radius: number) {
  const pixels = imageData.data
  const width = imageData.width
  const height = imageData.height
  const tempPixels = new Uint8ClampedArray(pixels)

  for (let x = 0; x < width; x++) {
    let red = 0, green = 0, blue = 0, alpha = 0

    // 初始化滑动窗口
    for (let i = -radius; i <= radius; i++) {
      const y = Math.min(height - 1, Math.max(0, i))
      const index = (y * width + x) * 4
      red += tempPixels[index]
      green += tempPixels[index + 1]
      blue += tempPixels[index + 2]
      alpha += tempPixels[index + 3]
    }

    // 滑动窗口遍历每个像素
    for (let y = 0; y < height; y++) {
      // 设置当前像素的值
      const destIndex = (y * width + x) * 4
      const windowSize = 2 * radius + 1
      pixels[destIndex] = red / windowSize
      pixels[destIndex + 1] = green / windowSize
      pixels[destIndex + 2] = blue / windowSize
      pixels[destIndex + 3] = alpha / windowSize

      // 移除窗口上方像素
      const removeY = Math.max(0, y - radius)
      const removeIndex = (removeY * width + x) * 4
      red -= tempPixels[removeIndex]
      green -= tempPixels[removeIndex + 1]
      blue -= tempPixels[removeIndex + 2]
      alpha -= tempPixels[removeIndex + 3]

      // 添加窗口下方新像素
      const addY = Math.min(height - 1, y + radius + 1)
      const addIndex = (addY * width + x) * 4
      red += tempPixels[addIndex]
      green += tempPixels[addIndex + 1]
      blue += tempPixels[addIndex + 2]
      alpha += tempPixels[addIndex + 3]
    }
  }
}

// 辅助函数：创建圆角矩形路径
function createRoundedRectPath (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

async function drawBlurView (createCanvas: CreateCanvas, ctx: CanvasRenderingContext2D, element: Element) {
  const { left, top, width, height } = element.layout
  const { blurAmount = 10, tintColor, borderRadius = 0 } = element.style

  if (width <= 0 || height <= 0) {
    return
  }

  // 安全地获取设备像素比（DPR）
  const dpr = getSafeDPR(ctx)

  if (blurAmount <= 0) {
    if (tintColor) {
      ctx.save()
      ctx.fillStyle = tintColor
      const radius = normalizeBorderRadius(borderRadius)
      if (radius > 0) {
        createRoundedRectPath(ctx, left, top, width, height, radius)
        ctx.fill()
      } else {
        ctx.fillRect(left, top, width, height)
      }
      ctx.restore()
    }
    return
  }

  // 扩展采样区域以获得更好的边缘模糊效果
  const expansion = Math.ceil(blurAmount * 3 * dpr)
  const p_left = left * dpr
  const p_top = top * dpr
  const p_width = width * dpr
  const p_height = height * dpr
  const p_canvasWidth = ctx.canvas.width
  const p_canvasHeight = ctx.canvas.height
  const p_expandedLeft = Math.max(0, p_left - expansion)
  const p_expandedTop = Math.max(0, p_top - expansion)
  const p_expandedWidth = Math.min(p_canvasWidth, p_left + p_width + expansion) - p_expandedLeft
  const p_expandedHeight = Math.min(p_canvasHeight, p_top + p_height + expansion) - p_expandedTop

  if (p_expandedWidth <= 0 || p_expandedHeight <= 0) {
    return
  }

  // 1. 截取背景区域的像素数据
  let backgroundData: ImageData
  try {
    backgroundData = ctx.getImageData(p_expandedLeft, p_expandedTop, p_expandedWidth, p_expandedHeight)
  } catch (e) {
    console.error(
      "无法在 'CanvasRenderingContext2D' 上执行 'getImageData'：画布已被跨源数据污染。 " +
      "当从不同来源加载图像而没有正确的 CORS 配置时，可能会发生这种情况。 " +
      "对于图像，请确保将 'crossOrigin' 属性设置为 'anonymous'。",
      e
    )
    // 如果 getImageData 失败，回退到绘制 tintColor
    if (tintColor) {
      ctx.save()
      ctx.fillStyle = tintColor
      const radius = normalizeBorderRadius(borderRadius)
      if (radius > 0) {
        createRoundedRectPath(ctx, left, top, width, height, radius)
        ctx.fill()
      } else {
        ctx.fillRect(left, top, width, height)
      }
      ctx.restore()
    }
    return
  }

  // 2. 应用改进的高斯模糊算法
  gaussianBlur(backgroundData, blurAmount * dpr)

  // 3. 创建一个新画布，并将处理过的像素数据放上去
  // This code is specific to the node-canvas environment, so we cast the created
  // canvas to the `Canvas` type from `node-canvas`.
  const blurCanvas = createCanvas(p_expandedWidth, p_expandedHeight) as Canvas
  const blurCtx = blurCanvas.getContext('2d')
  blurCtx.putImageData(backgroundData, 0, 0)

  // 4. 将最终模糊后的画布绘制回主画布
  ctx.save()

  const radius = normalizeBorderRadius(borderRadius)
  if (radius > 0) {
    createRoundedRectPath(ctx, left, top, width, height, radius)
    ctx.clip()
  }

  const sx = p_left - p_expandedLeft
  const sy = p_top - p_expandedTop
  // With blurCanvas correctly typed as a node-canvas Canvas, no cast is needed here.
  ctx.drawImage(blurCanvas, sx, sy, p_width, p_height, left, top, width, height)

  // 5. 叠加半透明着色层
  if (tintColor) {
    ctx.fillStyle = tintColor
    const radius = normalizeBorderRadius(borderRadius)
    if (radius > 0) {
      // 不需要再次创建路径，因为当前路径仍然是圆角矩形
      ctx.fill()
    } else {
      ctx.fillRect(left, top, width, height)
    }
  }

  ctx.restore()
}

export default drawBlurView
