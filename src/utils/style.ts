import { Style } from '@karin-mys/prender/types'
import Yoga, { YogaNode } from 'yoga-layout-prebuilt'

export function applyStyle (node: YogaNode, style: Style) {
  if (style.width !== undefined) {
    if (typeof style.width === 'string' && style.width.endsWith('%')) {
      node.setWidthPercent(parseFloat(style.width))
    } else {
      node.setWidth(style.width as number)
    }
  }
  if (style.height !== undefined) {
    if (typeof style.height === 'string' && style.height.endsWith('%')) {
      node.setHeightPercent(parseFloat(style.height))
    } else {
      node.setHeight(style.height as number)
    }
  }

  if (style.overflow) {
    const overflowMap = {
      'hidden': Yoga.OVERFLOW_HIDDEN,
      'visible': Yoga.OVERFLOW_VISIBLE,
      'scroll': Yoga.OVERFLOW_SCROLL,
    }
    if (overflowMap[style.overflow]) {
      node.setOverflow(overflowMap[style.overflow])
    }
  }

  if (style.flex !== undefined) node.setFlex(style.flex)
  if (style.flexDirection !== undefined) {
    const direction = {
      'row': Yoga.FLEX_DIRECTION_ROW,
      'column': Yoga.FLEX_DIRECTION_COLUMN,
    }[style.flexDirection]
    if (direction !== undefined) {
      node.setFlexDirection(direction)
    }
  }

  if (style.justifyContent !== undefined) {
    const justification = {
      'flex-start': Yoga.JUSTIFY_FLEX_START,
      'center': Yoga.JUSTIFY_CENTER,
      'flex-end': Yoga.JUSTIFY_FLEX_END,
      'space-between': Yoga.JUSTIFY_SPACE_BETWEEN,
      'space-around': Yoga.JUSTIFY_SPACE_AROUND,
    }[style.justifyContent]
    if (justification !== undefined) {
      node.setJustifyContent(justification)
    }
  }

  if (style.alignItems !== undefined) {
    const alignment = {
      'flex-start': Yoga.ALIGN_FLEX_START,
      'center': Yoga.ALIGN_CENTER,
      'flex-end': Yoga.ALIGN_FLEX_END,
      'stretch': Yoga.ALIGN_STRETCH,
    }[style.alignItems]
    if (alignment !== undefined) {
      node.setAlignItems(alignment)
    }
  }

  if (style.padding !== undefined) node.setPadding(Yoga.EDGE_ALL, style.padding)
  if (style.paddingTop !== undefined) node.setPadding(Yoga.EDGE_TOP, style.paddingTop)
  if (style.paddingBottom !== undefined) node.setPadding(Yoga.EDGE_BOTTOM, style.paddingBottom)
  if (style.paddingLeft !== undefined) node.setPadding(Yoga.EDGE_LEFT, style.paddingLeft)
  if (style.paddingRight !== undefined) node.setPadding(Yoga.EDGE_RIGHT, style.paddingRight)

  // 便捷属性：paddingHorizontal 和 paddingVertical
  if (style.paddingHorizontal !== undefined) {
    node.setPadding(Yoga.EDGE_LEFT, style.paddingHorizontal)
    node.setPadding(Yoga.EDGE_RIGHT, style.paddingHorizontal)
  }
  if (style.paddingVertical !== undefined) {
    node.setPadding(Yoga.EDGE_TOP, style.paddingVertical)
    node.setPadding(Yoga.EDGE_BOTTOM, style.paddingVertical)
  }

  if (style.margin !== undefined) node.setMargin(Yoga.EDGE_ALL, style.margin)
  if (style.marginTop !== undefined) node.setMargin(Yoga.EDGE_TOP, style.marginTop)
  if (style.marginBottom !== undefined) node.setMargin(Yoga.EDGE_BOTTOM, style.marginBottom)
  if (style.marginLeft !== undefined) node.setMargin(Yoga.EDGE_LEFT, style.marginLeft)
  if (style.marginRight !== undefined) node.setMargin(Yoga.EDGE_RIGHT, style.marginRight)

  // 便捷属性：marginHorizontal 和 marginVertical
  if (style.marginHorizontal !== undefined) {
    node.setMargin(Yoga.EDGE_LEFT, style.marginHorizontal)
    node.setMargin(Yoga.EDGE_RIGHT, style.marginHorizontal)
  }
  if (style.marginVertical !== undefined) {
    node.setMargin(Yoga.EDGE_TOP, style.marginVertical)
    node.setMargin(Yoga.EDGE_BOTTOM, style.marginVertical)
  }

  if (style.position === 'absolute') {
    node.setPositionType(Yoga.POSITION_TYPE_ABSOLUTE)
    if (style.top !== undefined) node.setPosition(Yoga.EDGE_TOP, style.top)
    if (style.left !== undefined) node.setPosition(Yoga.EDGE_LEFT, style.left)
    if (style.right !== undefined) node.setPosition(Yoga.EDGE_RIGHT, style.right)
    if (style.bottom !== undefined) node.setPosition(Yoga.EDGE_BOTTOM, style.bottom)
  }
}
