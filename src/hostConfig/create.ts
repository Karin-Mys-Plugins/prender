import type { Container, Element, Props } from "@karin-mys/prender/types"
import type { HostConfig } from "react-reconciler"
import type { CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from 'skia-canvas'

import { applyStyle } from "@karin-mys/prender/utils/style"
import { collectFragments, layoutRichText, truncateLines } from "@karin-mys/prender/utils/textLayout"

type Type = string
type TextInstance = Element
type Instance = Element
type PublicInstance = Instance
type HostContext = object
type UpdatePayload = object
type ChildSet = unknown
type TimeoutHandle = NodeJS.Timeout
type NoTimeout = -1
type TransitionStatus = unknown

const createHostConfig = (
  createElement: (type: string, props: Props) => Element,
) => {
  const hostConfig: HostConfig<
    Type,
    Props,
    Container,
    Instance,
    TextInstance,
    never,
    never,
    PublicInstance,
    HostContext,
    UpdatePayload,
    ChildSet,
    TimeoutHandle,
    NoTimeout,
    TransitionStatus
  > = {
    getPublicInstance (instance: Instance): PublicInstance {
      return instance
    },

    getRootHostContext (rootContainerInstance: Container): HostContext {
      return {}
    },

    getChildHostContext (
      parentHostContext: HostContext,
      type: Type,
      rootContainerInstance: Container
    ): HostContext {
      return {}
    },

    prepareForCommit (containerInfo: Container): null {
      return null
    },

    resetAfterCommit (containerInfo: Container): void {
      const { root, onLayoutReady } = containerInfo

      // 确保传递给 calculateLayout 的是 number 或 undefined
      const layoutWidth =
        typeof root.style.width === "number" ? root.style.width : undefined
      const layoutHeight =
        typeof root.style.height === "number" ? root.style.height : undefined
      root.yogaNode.calculateLayout(layoutWidth, layoutHeight)

      function setAbsoluteLayout (
        element: Element,
        parentLeft: number,
        parentTop: number
      ) {
        const { yogaNode } = element
        element.layout = {
          left: yogaNode.getComputedLeft() + parentLeft,
          top: yogaNode.getComputedTop() + parentTop,
          width: yogaNode.getComputedWidth(),
          height: yogaNode.getComputedHeight(),
        }
        element.children.forEach((child) =>
          setAbsoluteLayout(child, element.layout.left, element.layout.top)
        )
      }

      setAbsoluteLayout(root, 0, 0)

      // 布局计算完成后，如果存在回调，则执行它
      if (onLayoutReady) {
        onLayoutReady(containerInfo)
      }
    },

    createInstance (
      type: Type,
      props: Props,
      rootContainerInstance: Container,
      hostContext: HostContext,
      internalInstanceHandle: object
    ): Instance {
      const element = createElement(type, props)
      applyStyle(element.yogaNode, element.style)

      if (type === "TEXT") {
        const { ctx } = rootContainerInstance
        element.yogaNode.setMeasureFunc(
          (width, widthMode, height, heightMode) => {
            const fragments = collectFragments(element, element.style)
            if (fragments.length === 0) {
              return { width: 0, height: 0 }
            }

            const maxWidth = widthMode === 0 ? Infinity : width
            const measureCtx = ctx.canvas.getContext("2d") as NodeCanvasRenderingContext2D
            let lines = layoutRichText(
              measureCtx,
              fragments,
              element.style,
              maxWidth
            )
            lines = truncateLines(lines, element.style.numberOfLines, maxWidth)

            const totalHeight = lines.reduce((acc, line) => acc + line.height, 0)
            const maxWidthOfLines = Math.max(0, ...lines.map(line => line.width))

            return {
              width: maxWidthOfLines,
              height: totalHeight,
            }
          }
        )
      }

      return element
    },

    createTextInstance (
      text: string,
      rootContainerInstance: Container,
      hostContext: HostContext,
      internalInstanceHandle: object
    ): TextInstance {
      // RAW_TEXT 元素现在只是一个数据容器。
      // 绘图由父级 TEXT 组件处理，测量也是。
      const element = createElement("RAW_TEXT", { children: text })
      return element
    },

    appendInitialChild (
      parentInstance: Instance,
      child: Instance | TextInstance
    ): void {
      parentInstance.children.push(child)
      child.parent = parentInstance
      // TEXT 和 PAINTER 类型的子节点不参与 Yoga 布局
      if (parentInstance.type !== "PAINTER" && parentInstance.type !== "TEXT") {
        parentInstance.yogaNode.insertChild(
          child.yogaNode,
          parentInstance.yogaNode.getChildCount()
        )
      }
    },

    finalizeInitialChildren (
      parentInstance: Instance,
      type: Type,
      props: Props,
      rootContainerInstance: Container,
      hostContext: HostContext
    ): boolean {
      return false
    },

    shouldSetTextContent (type: Type, props: Props): boolean {
      return false
    },

    // @ts-ignore
    now: Date.now,

    supportsMutation: true,

    appendChild (
      parentInstance: Instance,
      child: Instance | TextInstance
    ): void {
      this.appendInitialChild(parentInstance, child)
    },

    appendChildToContainer (
      container: Container,
      child: Instance | TextInstance
    ): void {
      container.root.children.push(child)
      child.parent = container.root
      container.root.yogaNode.insertChild(
        child.yogaNode,
        container.root.yogaNode.getChildCount()
      )
    },

    insertBefore (
      parentInstance: Instance,
      child: Instance | TextInstance,
      beforeChild: Instance | TextInstance
    ): void {
      const index = parentInstance.children.indexOf(beforeChild)
      if (index !== -1) {
        parentInstance.children.splice(index, 0, child)
        child.parent = parentInstance
        // TEXT 和 PAINTER 类型的子节点不参与 Yoga 布局
        if (parentInstance.type !== "PAINTER" && parentInstance.type !== "TEXT") {
          parentInstance.yogaNode.insertChild(child.yogaNode, index)
        }
      }
    },

    removeChild (
      parentInstance: Instance,
      child: Instance | TextInstance
    ): void {
      const index = parentInstance.children.indexOf(child)
      if (index !== -1) {
        parentInstance.children.splice(index, 1)
        child.parent = null
        // TEXT 和 PAINTER 类型的子节点不参与 Yoga 布局
        if (parentInstance.type !== "PAINTER" && parentInstance.type !== "TEXT") {
          parentInstance.yogaNode.removeChild(child.yogaNode)
        }
      }
    },

    removeChildFromContainer (
      container: Container,
      child: Instance | TextInstance
    ): void {
      const index = container.root.children.indexOf(child)
      if (index !== -1) {
        container.root.children.splice(index, 1)
        child.parent = null
        container.root.yogaNode.removeChild(child.yogaNode)
      }
    },

    commitTextUpdate (
      textInstance: TextInstance,
      prevText: string,
      nextText: string
    ): void {
      textInstance.props.children = nextText
    },

    commitUpdate (
      instance: Instance,
      type: Type,
      prevProps: Props,
      nextProps: Props,
      internalHandle: object
    ): void {
      instance.props = nextProps
      instance.style = nextProps.style || {}
      applyStyle(instance.yogaNode, instance.style)
    },

    clearContainer (container: Container): void {
      container.ctx.clearRect(
        0,
        0,
        container.canvas.width,
        container.canvas.height
      )
    },

    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,
    noTimeout: -1,
    supportsPersistence: false,
    isPrimaryRenderer: true,
    supportsHydration: false,
  }
  return hostConfig
}

export default createHostConfig
