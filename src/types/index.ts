import type { Canvas, CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from 'skia-canvas'
import type { YogaNode } from 'yoga-layout-prebuilt'

import React from 'react'

export type CreateCanvas = ((width: number, height: number) => Canvas | HTMLCanvasElement)

// 定义一个通用的样式类型，可以是任何样式类型
export type StyleType = Style

export interface Props<S = StyleType> {
  style?: S
  children?: React.ReactNode
  [key: string]: unknown
}

// A base props interface for drawing components, which have different style types.
export interface DrawingProps<S> {
  style?: S
  children?: React.ReactNode
  [key: string]: unknown
}

// 导出组件特定样式类型
export * from './componentStyles'

// 基础布局属性
export interface LayoutStyle {
  width?: number | string
  height?: number | string
  flex?: number
  flexDirection?: 'row' | 'column'
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch'
  padding?: number
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  paddingHorizontal?: number
  paddingVertical?: number
  margin?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  marginHorizontal?: number
  marginVertical?: number
  position?: 'absolute' | 'relative'
  top?: number
  left?: number
  right?: number
  bottom?: number
  overflow?: 'hidden' | 'visible' | 'scroll'
}

// 背景相关属性
export interface BackgroundStyle {
  background?: string
  backgroundColor?: string
  backgroundImage?: string | Buffer
  backgroundSize?: 'cover' | 'contain' | 'auto' | string
  backgroundPosition?: string
  backgroundRepeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat'
}

// 边框相关属性
export interface BorderStyle {
  border?: string
  borderTop?: string
  borderRight?: string
  borderBottom?: string
  borderLeft?: string
  borderWidth?: number
  borderTopWidth?: number
  borderRightWidth?: number
  borderBottomWidth?: number
  borderLeftWidth?: number
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderTopStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderRightStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderBottomStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderLeftStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderColor?: string
  borderTopColor?: string
  borderRightColor?: string
  borderBottomColor?: string
  borderLeftColor?: string

  // 圆角属性
  borderRadius?: number | string
  borderTopLeftRadius?: number
  borderTopRightRadius?: number
  borderBottomLeftRadius?: number
  borderBottomRightRadius?: number
}

// 文本相关属性
export interface TextStyle {
  color?: string
  fontSize?: number
  fontFamily?: string | string[]
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  textAlign?: 'left' | 'center' | 'right'
  lineHeight?: number
  textShadow?: string
  numberOfLines?: number
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap'
  textDecoration?: 'none' | 'underline' | 'line-through'
}

// 图像相关属性
export interface ImageStyle {
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  objectPosition?: string
  tintColor?: string
}

// 渐变相关属性
export interface GradientStyle {
  startColor?: string
  endColor?: string
  colors?: string[]
  locations?: number[]
  start?: { x: number; y: number }
  end?: { x: number; y: number }
  angle?: number
}

// 特效相关属性
export interface EffectStyle {
  opacity?: number
  boxShadow?: string
  transform?: string | { [key: string]: string }[]
  transformOrigin?: string
  blurAmount?: number
  displacementScale?: number
  saturation?: number
  aberrationIntensity?: number
}

// 形状相关属性
export interface ShapeStyle {
  radius?: number | number[] // 支持数组形式的 radius
  innerRadius?: number
  outerRadius?: number
}

// 交互状态相关属性
export interface InteractionStyle {
  checked?: boolean
}

// 组合所有样式属性
export type Style = LayoutStyle &
  BackgroundStyle &
  BorderStyle &
  TextStyle &
  ImageStyle &
  GradientStyle &
  EffectStyle &
  ShapeStyle &
  InteractionStyle

export interface ComponentModule {
  draw: (ctx: NodeCanvasRenderingContext2D | CanvasRenderingContext2D, element: Element<Style>) => void
}

export type ComponentMap = {
  [key: string]: ComponentModule
}

export interface Element<S = Style> {
  type: string
  props: Props<S>
  children: Element[]
  yogaNode: YogaNode
  layout: {
    left: number
    top: number
    width: number
    height: number
  }
  style: S
  parent: Element | null
  draw: (ctx: NodeCanvasRenderingContext2D | CanvasRenderingContext2D, element: Element<S>) => void
}

export type Elements = {
  [key: string]: Element
}

export interface Container {
  canvas: Canvas | HTMLCanvasElement
  ctx: NodeCanvasRenderingContext2D | CanvasRenderingContext2D
  root: Element
  // 添加一个可选的回调函数
  onLayoutReady?: (container: Container) => void
  // 设备像素比，避免全局状态污染
  devicePixelRatio?: number
}
