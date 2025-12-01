import type {
  BackgroundStyle,
  BorderStyle,
  EffectStyle,
  GradientStyle,
  ImageStyle,
  InteractionStyle,
  LayoutStyle,
  ShapeStyle,
  TextStyle
} from './index'

// 文本组件样式
export type TextComponentStyle = LayoutStyle & TextStyle & EffectStyle & BorderStyle & BackgroundStyle

// 图像组件样式
export type ImageComponentStyle = LayoutStyle & ImageStyle & BorderStyle & BackgroundStyle & EffectStyle

// 容器组件样式
export type ContainerComponentStyle = LayoutStyle & BackgroundStyle & BorderStyle & EffectStyle

// 按钮组件样式
export type ButtonComponentStyle = LayoutStyle & BackgroundStyle & BorderStyle & TextStyle & EffectStyle & InteractionStyle

// 渐变组件样式
export type GradientComponentStyle = LayoutStyle & GradientStyle & EffectStyle

// 形状组件样式
export type ShapeComponentStyle = LayoutStyle & ShapeStyle & BackgroundStyle & BorderStyle & EffectStyle

// 绘图组件样式
export interface DrawingStyle {
  fill?: string
  fillStyle?: string
  stroke?: string
  strokeStyle?: string
  lineWidth?: number
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  lineCap?: 'butt' | 'round' | 'square'
  lineDash?: number[]
}

// 绘图文本组件样式
export interface DrawingTextStyle extends DrawingStyle {
  font?: string
  textAlign?: 'left' | 'right' | 'center' // 与 TextStyle 保持一致
  textBaseline?: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom'
  maxWidth?: number
}

// 圆形组件样式
export interface CircleStyle extends DrawingStyle {
  cx?: number
  cy?: number
  r?: number
  radius?: number
}

// 矩形组件样式
export interface RectStyle extends DrawingStyle {
  x?: number
  y?: number
  width?: number
  height?: number
  radius?: number | number[]
}

// 线条组件样式
export interface LineStyle extends DrawingStyle {
  x1?: number
  y1?: number
  x2?: number
  y2?: number
}

// 定义路径命令的类型，它是一个由字符串（命令）和数字（坐标）组成的数组
export type PathCommand = (string | number)[]

// 路径组件样式
export interface PathStyle extends DrawingStyle {
  commands?: PathCommand[]
  d?: string
}

// 椭圆组件样式
export interface EllipseStyle extends DrawingStyle {
  x?: number
  y?: number
  radiusX?: number
  radiusY?: number
  rotation?: number
  startAngle?: number
  endAngle?: number
  anticlockwise?: boolean
}

// 弧形组件样式
export interface ArcStyle extends DrawingStyle {
  x?: number
  y?: number
  radius?: number
  startAngle?: number
  endAngle?: number
  anticlockwise?: boolean
}
