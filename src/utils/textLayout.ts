import type { CanvasRenderingContext2D } from 'skia-canvas'
import type { Element, Style } from '../types'

import { getFontString } from './font'

export interface StyledFragment {
  text: string
  style: Style
}

export interface Line {
  fragments: StyledFragment[]
  width: number
  height: number
}

export function collectFragments (element: Element, defaultStyle: Style): StyledFragment[] {
  const fragments: StyledFragment[] = []

  function recurse (children: Element[], parentStyle: Style) {
    for (const child of children) {
      if (child.type === 'RAW_TEXT') {
        const text = (Array.isArray(child.props.children) ? child.props.children.join('') : String(child.props.children)) || ''
        if (text) {
          fragments.push({ text, style: parentStyle })
        }
      } else if (child.type === 'TEXT') {
        const mergedStyle = { ...parentStyle, ...child.style }
        recurse(child.children, mergedStyle)
      }
    }
  }

  recurse(element.children, defaultStyle)
  return fragments
}

export function layoutRichText (ctx: CanvasRenderingContext2D, fragments: StyledFragment[], style: Style, maxContentWidth: number): Line[] {
  const lines: Line[] = []
  let currentLine: StyledFragment[] = []
  let currentLineWidth = 0
  let maxLineHeight = 0

  const flushLine = () => {
    if (currentLine.length > 0) {
      const lastFrag = currentLine[currentLine.length - 1]
      if (lastFrag && lastFrag.text.trim() === '') {
        ctx.font = getFontString(lastFrag.style)
        currentLineWidth -= ctx.measureText(lastFrag.text).width
        currentLine.pop()
      }
      if (currentLine.length > 0) {
        lines.push({ fragments: currentLine, width: currentLineWidth, height: maxLineHeight })
      }
    }
    currentLine = []
    currentLineWidth = 0
    maxLineHeight = 0
  }

  const addToLine = (frag: StyledFragment) => {
    currentLine.push(frag)
    ctx.font = getFontString(frag.style)
    currentLineWidth += ctx.measureText(frag.text).width
    const { fontSize = 14, lineHeight } = frag.style
    maxLineHeight = Math.max(maxLineHeight, lineHeight || fontSize * 1.4)
  }

  // 逐个fragment和字符处理
  for (const fragment of fragments) {
    ctx.font = getFontString(fragment.style)
    let textToProcess = fragment.text

    while (textToProcess.length > 0) {
      let canFitChars = 0
      let accumulatedWidth = 0

      // 使用二分查找优化字符数查找
      let left = 0
      let right = textToProcess.length

      while (left <= right) {
        const mid = Math.floor((left + right) / 2)
        const testText = textToProcess.substring(0, mid)
        const testWidth = ctx.measureText(testText).width

        if (currentLineWidth + testWidth <= maxContentWidth) {
          canFitChars = mid
          accumulatedWidth = testWidth
          left = mid + 1
        } else {
          right = mid - 1
        }
      }

      if (canFitChars === 0 && currentLine.length > 0) {
        // 当前行已经有内容，但一个字符都放不下了，换行
        flushLine()
        // 重新尝试当前字符
        continue
      }

      if (canFitChars === 0) {
        // 当前行是空的，但一个字符都放不下，强制放一个字符
        canFitChars = 1
        accumulatedWidth = ctx.measureText(textToProcess[0]).width
      }

      // 添加能放下的文本到当前行
      const textToAdd = textToProcess.substring(0, canFitChars)
      if (textToAdd) {
        currentLine.push({ text: textToAdd, style: fragment.style })
        currentLineWidth += accumulatedWidth
        const { fontSize = 14, lineHeight } = fragment.style
        maxLineHeight = Math.max(maxLineHeight, lineHeight || fontSize * 1.4)
      }

      // 更新剩余文本
      textToProcess = textToProcess.substring(canFitChars)

      // 如果还有剩余文本，换行
      if (textToProcess.length > 0) {
        flushLine()
      }
    }
  }

  flushLine()
  return lines
}
// 改进的 truncateLines 函数，使用预渲染测量
export function truncateLines (
  lines: Line[],
  numberOfLines?: number,
  maxContentWidth?: number
): Line[] {
  // 如果numberOfLines是对象，说明调用方式错误，需要提取真正的numberOfLines
  let actualNumberOfLines: number | undefined
  if (typeof numberOfLines === 'object' && numberOfLines !== null) {
    actualNumberOfLines = (numberOfLines as any).numberOfLines
  } else {
    actualNumberOfLines = numberOfLines
  }

  if (!actualNumberOfLines || lines.length <= actualNumberOfLines) {
    return lines
  }

  // 检查是否有超出 numberOfLines 的内容
  const hasMoreContent = lines.length > actualNumberOfLines
  if (!hasMoreContent) {
    return lines
  }

  // 获取前 numberOfLines 行
  const truncatedLines = lines.slice(0, actualNumberOfLines)
  const lastLine = truncatedLines[truncatedLines.length - 1]

  // 计算当前最后一行的宽度
  const currentWidth = lastLine.fragments.reduce((width, fragment) => {
    const canvas = typeof window !== 'undefined'
      ? document.createElement('canvas')
      : new (require('skia-canvas')).Canvas(100, 100)
    const ctx = canvas.getContext('2d')
    ctx.font = getFontString(fragment.style)
    return width + ctx.measureText(fragment.text).width
  }, 0)

  if (maxContentWidth) {
    // 计算省略号的宽度
    const canvas = typeof window !== 'undefined'
      ? document.createElement('canvas')
      : new (require('skia-canvas')).Canvas(100, 100)
    const ctx = canvas.getContext('2d')

    // 使用最后一个fragment的样式来计算省略号宽度
    const lastFragment = lastLine.fragments[lastLine.fragments.length - 1]
    ctx.font = getFontString(lastFragment.style)
    const ellipsisWidth = ctx.measureText('...').width

    // 如果当前行加上省略号超出宽度，需要截断
    if (currentWidth + ellipsisWidth > maxContentWidth) {
      const targetWidth = maxContentWidth - ellipsisWidth

      // 使用二分查找来找到合适的截断位置
      const newFragments: StyledFragment[] = []
      let currentTotalWidth = 0

      for (const fragment of lastLine.fragments) {
        ctx.font = getFontString(fragment.style)
        const fragmentWidth = ctx.measureText(fragment.text).width

        if (currentTotalWidth + fragmentWidth <= targetWidth) {
          // 整个fragment都能放下
          newFragments.push(fragment)
          currentTotalWidth += fragmentWidth
        } else {
          // 需要截断这个fragment
          const remainingWidth = targetWidth - currentTotalWidth
          if (remainingWidth > 0) {
            // 使用二分查找找到合适的字符数
            let left = 0
            let right = fragment.text.length
            let bestFit = 0

            while (left <= right) {
              const mid = Math.floor((left + right) / 2)
              const testText = fragment.text.substring(0, mid)
              const testWidth = ctx.measureText(testText).width

              if (testWidth <= remainingWidth) {
                bestFit = mid
                left = mid + 1
              } else {
                right = mid - 1
              }
            }

            if (bestFit > 0) {
              newFragments.push({
                ...fragment,
                text: fragment.text.substring(0, bestFit)
              })
            }
          }
          break
        }
      }

      // 添加省略号
      if (newFragments.length > 0) {
        const lastFragment = newFragments[newFragments.length - 1]
        newFragments.push({
          ...lastFragment,
          text: '...'
        })
      } else if (lastLine.fragments.length > 0) {
        // 如果没有任何内容能放下，至少显示省略号
        newFragments.push({
          ...lastLine.fragments[0],
          text: '...'
        })
      }

      // 更新最后一行
      truncatedLines[truncatedLines.length - 1] = {
        ...lastLine,
        fragments: newFragments
      }
    } else {
      // 当前行能放下，直接在末尾添加省略号
      const lastFragment = lastLine.fragments[lastLine.fragments.length - 1]
      truncatedLines[truncatedLines.length - 1] = {
        ...lastLine,
        fragments: [
          ...lastLine.fragments,
          {
            ...lastFragment,
            text: '...'
          }
        ]
      }
    }
  } else {
    // 没有 maxContentWidth，简单地在最后添加省略号
    const lastFragment = lastLine.fragments[lastLine.fragments.length - 1]
    truncatedLines[truncatedLines.length - 1] = {
      ...lastLine,
      fragments: [
        ...lastLine.fragments,
        {
          ...lastFragment,
          text: '...'
        }
      ]
    }
  }

  return truncatedLines
}
