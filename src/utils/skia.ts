/**
 * Skia-Canvas 特性工具
 * 提供对 skia-canvas@3.0.8 特有功能的支持
 */

import { FontLibrary, loadImage, type Canvas } from 'skia-canvas'

/**
 * 字体管理器
 * skia-canvas 提供了全局的 FontLibrary 用于管理字体
 */
export class FontManager {
  private static instance: FontManager
  private registeredFonts = new Set<string>();

  private constructor () { }

  static getInstance (): FontManager {
    if (!FontManager.instance) {
      FontManager.instance = new FontManager()
    }
    return FontManager.instance
  }

  /**
   * 注册字体文件或目录
   * @param pathOrPaths 字体文件路径或目录路径
   */
  registerFont (pathOrPaths: string | string[]): void {
    const paths = Array.isArray(pathOrPaths) ? pathOrPaths : [pathOrPaths]

    for (const path of paths) {
      if (!this.registeredFonts.has(path)) {
        FontLibrary.use(path)
        this.registeredFonts.add(path)
      }
    }
  }

  /**
   * 获取所有已安装的字体家族
   */
  getFamilies (): readonly string[] {
    return FontLibrary.families
  }

  /**
   * 检查字体是否存在
   */
  hasFamily (family: string): boolean {
    return FontLibrary.has(family)
  }

  /**
   * 重置字体库
   */
  reset (): void {
    FontLibrary.reset()
    this.registeredFonts.clear()
  }
}

/**
 * 图片加载器
 * 使用 skia-canvas 的原生图片加载功能
 */
export class ImageLoader {
  private static cache = new Map<string, any>();

  /**
   * 加载图片（支持 URL 和本地路径）
   * @param source 图片源（URL、本地路径或 Buffer）
   * @param useCache 是否使用缓存
   */
  static async load (source: string | Buffer, useCache = true): Promise<any> {
    if (typeof source === 'string' && useCache && this.cache.has(source)) {
      return this.cache.get(source)
    }

    const image = await loadImage(source)

    if (typeof source === 'string' && useCache) {
      this.cache.set(source, image)
    }

    return image
  }

  /**
   * 清除缓存
   */
  static clearCache (): void {
    this.cache.clear()
  }

  /**
   * 预加载图片
   */
  static async preload (sources: string[]): Promise<void> {
    await Promise.all(sources.map(src => this.load(src, true)))
  }
}

/**
 * Canvas 导出选项
 */
export interface ExportOptions {
  /** 输出格式 */
  format?: 'png' | 'jpeg' | 'jpg' | 'webp' | 'pdf' | 'svg'
  /** 图片质量 (0-1)，仅对 jpeg/webp 有效 */
  quality?: number
  /** 设备像素比 */
  density?: number
  /** 页面配置（PDF 专用） */
  pages?: {
    width?: number
    height?: number
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number }
  }
  /** 是否包含背景色（SVG 专用） */
  background?: string
  /** 是否压缩（PDF 专用） */
  compress?: boolean
}

/**
 * Canvas 导出工具
 */
export class CanvasExporter {
  /**
   * 导出为 Buffer
   */
  static async toBuffer (canvas: Canvas, options: ExportOptions = {}): Promise<Buffer> {
    const {
      format = 'png',
      quality,
      density,
      pages,
      background,
      compress,
    } = options

    let mimeType = `image/${format}`
    const exportOptions: any = {}

    if (quality !== undefined && (format === 'jpeg' || format === 'jpg' || format === 'webp')) {
      exportOptions.quality = quality
    }

    if (density !== undefined) {
      exportOptions.density = density
    }

    if (format === 'pdf' && pages) {
      exportOptions.pages = pages
      if (compress !== undefined) {
        exportOptions.compress = compress
      }
    }

    if (format === 'svg' && background) {
      exportOptions.background = background
    }

    return await canvas.toBuffer(format, exportOptions)
  }

  /**
   * 导出为 Base64
   */
  static async toDataURL (canvas: Canvas, options: ExportOptions = {}): Promise<string> {
    const buffer = await this.toBuffer(canvas, options)
    const format = options.format || 'png'
    const base64 = buffer.toString('base64')
    return `data:image/${format};base64,${base64}`
  }

  /**
   * 导出为 SVG 字符串
   */
  static async toSVG (canvas: Canvas, options: Omit<ExportOptions, 'format'> = {}): Promise<string> {
    const buffer = await this.toBuffer(canvas, { ...options, format: 'svg' })
    return buffer.toString('utf-8')
  }

  /**
   * 导出为 PDF
   */
  static async toPDF (canvas: Canvas, options: Omit<ExportOptions, 'format'> = {}): Promise<Buffer> {
    return await this.toBuffer(canvas, { ...options, format: 'pdf' })
  }
}

/**
 * Path2D 工具
 * skia-canvas 支持原生 Path2D API
 */
export { Path2D } from 'skia-canvas'

/**
 * 导出所有 skia-canvas 特性
 */
export { FontLibrary, loadImage } from 'skia-canvas'
