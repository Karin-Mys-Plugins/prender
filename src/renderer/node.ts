import type { Container, Element, Style } from '@karin-mys/prender/types'
import type { ReactNode } from 'react'

import fs from 'fs'
import path from 'path'
import ReactReconciler from 'react-reconciler'
import { Canvas, type CanvasRenderingContext2D } from 'skia-canvas'
import { promisify } from 'util'

import hostConfig from '@karin-mys/prender/hostConfig'
import { normalizeBorderRadiusForCanvas } from '@karin-mys/prender/utils/borderRadius'
import createElement from '@karin-mys/prender/utils/createElement/node'
import { getSafeDPR } from '@karin-mys/prender/utils/dpr'
import { imageCache } from '@karin-mys/prender/utils/image'
import { CanvasExporter, type ExportOptions } from '@karin-mys/prender/utils/skia'

const createCanvas = (width: number, height: number) => new Canvas(width, height)

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

// 简化的 Canvas 池
class CanvasPool {
  private canvases: Canvas[] = [];
  private maxSize: number = 10;

  getCanvas (width: number, height: number): Canvas {
    if (this.canvases.length > 0) {
      const canvas = this.canvases.pop()!
      canvas.width = width
      canvas.height = height
      // 清空canvas内容，确保干净的绘制表面
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, width, height)
      return canvas
    }
    return createCanvas(width, height)
  }

  releaseCanvas (canvas: Canvas): void {
    if (this.canvases.length < this.maxSize) {
      this.canvases.push(canvas)
    }
  }
}

const canvasPool = new CanvasPool()

// Reconciler 实例
const reconciler = ReactReconciler(hostConfig)

function drawElement (el: Element<Style>, drawCtx: CanvasRenderingContext2D): void {
  // 传递imageCache给draw方法，如果组件支持的话
  el.draw(drawCtx, el)

  const style = el.style || {}
  const hasOverflowHidden = style.overflow === 'hidden'

  if (hasOverflowHidden) {
    drawCtx.save()
    drawCtx.beginPath()

    const { left, top, width, height } = el.layout
    const borderRadius = style.borderRadius || 0
    const radius = normalizeBorderRadiusForCanvas(borderRadius)

    if (typeof radius === 'number' && radius > 0) {
      drawCtx.roundRect(left, top, width, height, radius)
    } else {
      drawCtx.rect(left, top, width, height)
    }
    drawCtx.clip()
  }

  if (el.type !== 'PAINTER') {
    for (const child of el.children) {
      drawElement(child, drawCtx)
    }
  }

  if (hasOverflowHidden) {
    drawCtx.restore()
  }
}

/**
 * 直接渲染函数 - 移除复杂的批处理逻辑
 */

// 添加输出选项类型
interface OutputOptions {
  format?: 'png' | 'jpeg' | 'jpg' | 'webp' | 'pdf' | 'svg'
  quality?: number
  devicePixelRatio?: number
  createDir?: boolean
  // PDF 特定选项
  pages?: {
    width?: number
    height?: number
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number }
  }
  // SVG 特定选项
  background?: string
  // PDF 压缩选项
  compress?: boolean
}

// 基础渲染选项
interface BaseRenderOptions extends OutputOptions {
  filePath?: string
}

// 文件输出选项
interface FileRenderOptions extends BaseRenderOptions {
  output: 'file'
  filePath: string // 文件输出时必须提供路径
}

// Buffer 输出选项
interface BufferRenderOptions extends BaseRenderOptions {
  output: 'buffer'
}

// Base64 输出选项
interface Base64RenderOptions extends BaseRenderOptions {
  output: 'base64'
}

// 联合类型
type RenderOptions = FileRenderOptions | BufferRenderOptions | Base64RenderOptions

// 函数重载定义
export async function render (
  element: ReactNode,
  width: number,
  height: number | null,
  options: FileRenderOptions,
): Promise<void>

export async function render (
  element: ReactNode,
  width: number,
  height: number | null,
  options: BufferRenderOptions,
): Promise<Buffer>

export async function render (
  element: ReactNode,
  width: number,
  height: number | null,
  options: Base64RenderOptions,
): Promise<string>

// 修改 render 方法实现
export async function render (
  element: ReactNode,
  width: number,
  height: number | null = null,
  options: RenderOptions,
): Promise<void | Buffer | string> {
  return new Promise((resolve, reject) => {
    try {
      const {
        output,
        format = 'png',
        quality,
        devicePixelRatio: customDPR,
        createDir = false,
        filePath
      } = options

      // 验证文件输出模式的参数
      if (output === 'file' && !filePath) {
        throw new Error('文件输出模式需要提供文件路径')
      }

      // 使用临时 canvas 进行布局计算
      const tempCanvas = createCanvas(1, 1)
      const tempCtx = tempCanvas.getContext('2d')
      const devicePixelRatio = customDPR ?? getSafeDPR(tempCtx)

      // 创建根元素
      const rootStyle: Style = { width }
      if (height !== null) {
        rootStyle.height = height
      }
      const rootElement = createElement('VIEW', { style: rootStyle })

      // 布局完成回调
      const onLayoutReady = async (container: Container) => {
        try {
          const calculatedHeight = container.root.layout.height
          const finalHeight = height ?? calculatedHeight

          if (finalHeight <= 0 || width <= 0) {
            throw new Error('画布尺寸无效')
          }

          // 预加载所有图片
          await imageCache.preloadImages(container.root)

          // 从池中获取 canvas
          const finalCanvas = canvasPool.getCanvas(
            width * devicePixelRatio,
            finalHeight * devicePixelRatio
          )
          const finalCtx = finalCanvas.getContext('2d')

          // 完全重置 Canvas 状态
          finalCtx.save()
          finalCtx.resetTransform()
          finalCtx.clearRect(0, 0, finalCanvas.width, finalCanvas.height)
          finalCtx.restore()
          finalCtx.scale(devicePixelRatio, devicePixelRatio)

          drawElement(container.root, finalCtx)

          // 生成输出 - 使用新的 CanvasExporter
          const exportOptions: ExportOptions = {
            format: format as any,
            quality,
            density: devicePixelRatio,
          }

          let buffer: Buffer

          switch (format) {
            case 'jpeg':
            case 'webp':
            case 'pdf':
            case 'svg':
              buffer = await CanvasExporter.toBuffer(finalCanvas, exportOptions)
              break
            case 'png':
            default:
              buffer = await CanvasExporter.toBuffer(finalCanvas, { ...exportOptions, format: 'png' })
              break
          }

          // 根据输出类型处理结果
          switch (output) {
            case 'file':
              if (!filePath) {
                throw new Error('文件输出模式需要提供文件路径')
              }

              // 准备保存目录
              if (createDir) {
                const dirPath = path.dirname(filePath)
                await mkdir(dirPath, { recursive: true }).catch(() => { })
              }

              await writeFile(filePath, buffer)
              canvasPool.releaseCanvas(finalCanvas)
              resolve()
              break

            case 'buffer':
              canvasPool.releaseCanvas(finalCanvas)
              resolve(buffer)
              break

            case 'base64':
              const mimeType = format === 'jpeg' ? 'image/jpeg' :
                format === 'webp' ? 'image/webp' :
                  format === 'pdf' ? 'application/pdf' : 'image/png'
              const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`
              canvasPool.releaseCanvas(finalCanvas)
              resolve(base64)
              break

            default:
              canvasPool.releaseCanvas(finalCanvas)
              reject(new Error(`不支持的输出类型: ${output}`))
          }

        } catch (error) {
          reject(error)
        }
      }

      // 创建容器
      const container: Container = {
        canvas: tempCanvas,
        ctx: tempCtx,
        root: rootElement,
        onLayoutReady,
        devicePixelRatio,
      }

      // 创建并更新容器
      const root = reconciler.createContainer(
        container,
        0,
        null,
        false,
        false,
        '',
        (error: Error) => reject(error),
        null,
        null,
        null,
        null
      )

      reconciler.updateContainer(element, root, null, () => { })

    } catch (error) {
      reject(error)
    }
  })
}

// 添加便捷方法
export async function renderToBuffer (
  element: ReactNode,
  width: number,
  height: number | null = null,
  options?: Omit<BufferRenderOptions, 'output'>,
): Promise<Buffer> {
  return render(element, width, height, { output: 'buffer', ...options } as BufferRenderOptions)
}

export async function renderToBase64 (
  element: ReactNode,
  width: number,
  height: number | null = null,
  options?: Omit<Base64RenderOptions, 'output'>,
): Promise<string> {
  return render(element, width, height, { output: 'base64', ...options } as Base64RenderOptions)
}

export async function renderToFile (
  element: ReactNode,
  filePath: string,
  width: number,
  height: number | null = null,
  options?: Omit<FileRenderOptions, 'output' | 'filePath'>,
): Promise<void> {
  return render(element, width, height, { output: 'file', filePath, ...options } as FileRenderOptions)
}
