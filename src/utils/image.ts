import { Element, Style } from '@karin-mys/prender/types'
import { loadImage, type Image } from 'skia-canvas'

// 图片源类型，支持 string 和 Buffer
type ImageSource = string | Buffer

// 图片缓存管理
export class ImageCache {
  private cache: Map<string, Image> = new Map();
  private count: Map<string, number> = new Map();

  // 为图片源生成缓存键
  private generateCacheKey (src: ImageSource): string {
    if (typeof src === 'string') {
      return src
    } else if (Buffer.isBuffer(src)) {
      // 使用 Buffer 的哈希值作为键
      return `buffer:${src.toString('base64').slice(0, 32)}`
    }
    return 'unknown'
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

    console.log(`预加载 ${uniqueSources.length} 张图片...`)

    // 并行加载所有图片
    const loadPromises = sources.map(async (src) => {
      try {
        const cacheKey = this.generateCacheKey(src)
        if (!this.cache.has(cacheKey)) {
          const image = await loadImage(src)
          this.cache.set(cacheKey, image)
        }
        this.count.set(cacheKey, (this.count.get(cacheKey) || 0) + 1)
      } catch (error) {
        console.error(`加载图片失败:`, src, error)
      }
    })

    await Promise.all(loadPromises)
    console.log(`图片预加载完成`)
  }

  // 获取缓存的图片
  getImage (src: ImageSource): Image | undefined {
    const cacheKey = this.generateCacheKey(src)
    const image = this.cache.get(cacheKey)

    if (image) {
      // 减少引用计数
      this.count.set(cacheKey, (this.count.get(cacheKey) || 0) - 1)

      // 如果引用计数为0，删除缓存
      if (this.count.get(cacheKey) === 0) {
        this.cache.delete(cacheKey)
        this.count.delete(cacheKey)
      }
    }

    return image
  }
}

export const imageCache = new ImageCache()
