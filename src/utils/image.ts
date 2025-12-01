import { Element, Style } from '@karin-mys/prender/types'
import crypto from 'crypto'
import { loadImage, type Image } from 'skia-canvas'

// 图片源类型，支持 string 和 Buffer
type ImageSource = string | Buffer

interface CacheEntry {
  image: Image
  lastUsed: number
  size: number // 图片大小（宽 * 高）
}

// 图片缓存管理 - 使用 LRU 策略
export class ImageCache {
  private cache: Map<string, CacheEntry> = new Map()
  private maxCacheSize: number = 100 * 1024 * 1024 // 100MB (估算)
  private currentCacheSize: number = 0
  private maxEntries: number = 100 // 最多缓存100张图片

  // 为图片源生成缓存键
  private generateCacheKey (src: ImageSource): string {
    if (typeof src === 'string') {
      return src
    } else if (Buffer.isBuffer(src)) {
      // 使用 MD5 哈希提高性能
      return `buffer:${crypto.createHash('md5').update(src).digest('hex')}`
    }
    return 'unknown'
  }

  // LRU 淘汰策略
  private evictLRU (): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastUsed < oldestTime) {
        oldestTime = entry.lastUsed
        oldestKey = key
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey)!
      this.currentCacheSize -= entry.size
      this.cache.delete(oldestKey)
    }
  }

  // 收集元素树中所有的图片源
  private collectImageSources (element: Element<Style>): ImageSource[] {
    const sources: ImageSource[] = []

    // 检查 Image 组件的 src
    if (element.type === 'IMAGE' && element.props.src) {
      const src = element.props.src as ImageSource
      if (typeof src === 'string' || Buffer.isBuffer(src)) {
        sources.push(src)
      }
    }

    // 检查 View 组件的 backgroundImage
    if (element.type === 'VIEW' && element.style.backgroundImage) {
      const bgImage = element.style.backgroundImage
      if (typeof bgImage === 'string' && !bgImage.startsWith('linear-gradient') && !bgImage.startsWith('radial-gradient') && !bgImage.startsWith('repeating-linear-gradient') && !bgImage.startsWith('repeating-radial-gradient')) {
        sources.push(bgImage)
      }
    }

    // 递归检查子元素
    for (const child of element.children) {
      sources.push(...this.collectImageSources(child))
    }

    return sources
  }

  // 预加载所有图片
  async preloadImages (rootElement: Element<Style>): Promise<void> {
    const sources = this.collectImageSources(rootElement)
    const uniqueSources = Array.from(new Set(sources.map(src => this.generateCacheKey(src)))) // 去重

    if (uniqueSources.length === 0) return

    // 并行加载所有图片
    const loadPromises = sources.map(async (src) => {
      try {
        const cacheKey = this.generateCacheKey(src)
        if (!this.cache.has(cacheKey)) {
          const image = await loadImage(src)
          const imageSize = image.width * image.height * 4 // 估算 RGBA 大小

          // 确保有足够空间
          while (
            (this.currentCacheSize + imageSize > this.maxCacheSize ||
              this.cache.size >= this.maxEntries) &&
            this.cache.size > 0
          ) {
            this.evictLRU()
          }

          this.cache.set(cacheKey, {
            image,
            lastUsed: Date.now(),
            size: imageSize
          })
          this.currentCacheSize += imageSize
        } else {
          // 更新最后使用时间
          const entry = this.cache.get(cacheKey)!
          entry.lastUsed = Date.now()
        }
      } catch (error) {
        console.error(`加载图片失败:`, src, error)
      }
    })

    await Promise.all(loadPromises)
  }

  // 获取缓存的图片
  getImage (src: ImageSource): Image | undefined {
    const cacheKey = this.generateCacheKey(src)
    const entry = this.cache.get(cacheKey)

    if (entry) {
      // 更新最后使用时间
      entry.lastUsed = Date.now()

      return entry.image
    }

    return undefined
  }

  // 清空缓存
  clear (): void {
    this.cache.clear()
    this.currentCacheSize = 0
  }
}

export const imageCache = new ImageCache()
