import { ComponentMap, Element, Props, Style } from '@karin-mys/prender/types'
import Yoga from 'yoga-layout-prebuilt'

export function createElement (components: ComponentMap, type: string, props: Props<Style>): Element<Style> {
  const yogaNode = Yoga.Node.create()
  const component = components[type.toUpperCase()]

  if (!component) {
    throw new Error(`Unknown component type: ${type}`)
  }

  // 对于特定组件，需要将特殊属性合并到样式中
  let style = props.style || {}

  // TEXT 组件的 numberOfLines 属性
  if (type.toUpperCase() === 'TEXT' && props.numberOfLines !== undefined) {
    style = { ...style, numberOfLines: props.numberOfLines as number }
  }

  // IMAGE 组件的 objectFit 和 objectPosition 属性
  if (type.toUpperCase() === 'IMAGE') {
    if (props.objectFit !== undefined) {
      style = { ...style, objectFit: props.objectFit as 'fill' | 'contain' | 'cover' | 'none' | 'scale-down' }
    }
    if (props.objectPosition !== undefined) {
      style = { ...style, objectPosition: props.objectPosition as string }
    }
  }

  // 对于绘图组件，将 style 中的绘图属性合并到 props 中
  const drawingComponents = ['ARC', 'CIRCLE', 'RECT', 'LINE', 'PATH', 'ELLIPSE', 'DRAWINGTEXT']
  if (drawingComponents.includes(type.toUpperCase()) && props.style) {
    // 将 style 中的绘图相关属性提取到 props 中
    const drawingProps: Props<Style> = { ...props }
    const styleProps = props.style as { [key: string]: unknown }
    Object.keys(styleProps).forEach(key => {
      if (key !== 'width' && key !== 'height' && key !== 'left' && key !== 'top') {
        (drawingProps as { [key: string]: unknown })[key] = styleProps[key]
      }
    })
    props = drawingProps
  }

  const element: Element<Style> = {
    type,
    props,
    children: [],
    yogaNode,
    layout: {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    },
    style,
    parent: null,
    draw: (ctx, el) => {
      const { transform, opacity } = element.style

      ctx.save()

      // 应用透明度
      if (typeof opacity === 'number') {
        ctx.globalAlpha = (ctx.globalAlpha ?? 1) * opacity
      }

      if (transform && Array.isArray(transform)) {
        const { left, top, width, height } = element.layout
        const originX = left + width / 2
        const originY = top + height / 2

        let translateX = 0
        let translateY = 0

        // 1. 移动到变换原点 (元素中心)
        ctx.translate(originX, originY)

        // 2. 应用所有与原点相关的变换 (旋转、缩放)
        transform.forEach(t => {
          const key = Object.keys(t)[0]
          const value = t[key]

          if (key === 'rotate' && typeof value === 'string') {
            const angle = parseFloat(value.replace('deg', ''))
            ctx.rotate(angle * Math.PI / 180)
          } else if (key === 'scale' && typeof value === 'number') {
            ctx.scale(value, value)
          } else if (key === 'scaleX' && typeof value === 'number') {
            ctx.scale(value, 1)
          } else if (key === 'scaleY' && typeof value === 'number') {
            ctx.scale(1, value)
          } else if (key === 'translateX' && typeof value === 'number') {
            translateX += value
          } else if (key === 'translateY' && typeof value === 'number') {
            translateY += value
          }
        })

        // 3. 移回画布原点
        ctx.translate(-originX, -originY)

        // 4. 应用平移变换
        ctx.translate(translateX, translateY)
      }

      // 在变换后的坐标系中执行组件自身的绘制逻辑
      component.draw(ctx, el)

      // 恢复坐标系，确保不影响其他组件
      ctx.restore()
    },
  }

  return element
}
