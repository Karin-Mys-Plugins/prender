import type { Element } from '@karin-mys/prender/types'
import type { CanvasRenderingContext2D } from 'skia-canvas'

const Painter = {
  draw: (ctx: CanvasRenderingContext2D, element: Element) => {
    const { left, top } = element.layout
    const { actions } = element.props

    // Painter 组件为其子组件建立一个新的坐标系。
    // 所有子组件的绘制操作都将相对于 Painter 的左上角。
    ctx.save()
    ctx.translate(left, top)

    // 如果有 actions 函数，先执行它
    if (actions && typeof actions === 'function') {
      actions(ctx)
    }

    // 手动绘制每个子组件，因为主渲染循环将不会
    // 递归到 Painter 的子级中。
    for (const child of element.children) {
      // 调用子组件的完整绘制方法，这包括
      // createElement 中处理变换的包装器。
      child.draw(ctx, child)
    }

    ctx.restore()
  },
}

export default Painter
