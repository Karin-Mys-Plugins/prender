import type {
  ArcStyle, CircleStyle, DrawingProps, DrawingStyle,
  DrawingTextStyle, EllipseStyle, LineStyle,
  PathStyle, RectStyle
} from '@karin-mys/prender/types'
import React from 'react'

import type { PathCommand } from './Path'

// 为每个绘图组件定义专门的类型接口

export interface ArcProps extends DrawingProps<ArcStyle> {
  x?: number
  y?: number
  cx?: number
  cy?: number
  radius?: number
  r?: number
  startAngle?: number
  endAngle?: number
  anticlockwise?: boolean
  fill?: string
  fillStyle?: string
  stroke?: string
  strokeStyle?: string
  lineWidth?: number
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
}

export interface RectProps extends DrawingProps<RectStyle> {
  x: number
  y: number
  width: number
  height: number
  radius?: number | number[]
  fill?: string
  fillStyle?: string
  stroke?: string
  strokeStyle?: string
  lineWidth?: number
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
}

export interface LineProps extends DrawingProps<LineStyle> {
  x1: number
  y1: number
  x2: number
  y2: number
  stroke?: string
  strokeStyle?: string
  lineWidth?: number
  lineCap?: 'butt' | 'round' | 'square'
  lineDash?: number[]
}

export interface PathProps extends DrawingProps<PathStyle> {
  commands?: PathCommand[]
  d?: string
  fill?: string
  fillStyle?: string
  stroke?: string
  strokeStyle?: string
  lineWidth?: number
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
}

export interface CircleProps extends DrawingProps<CircleStyle> {
  cx: number
  cy: number
  r: number
  fill?: string
  fillStyle?: string
  stroke?: string
  strokeStyle?: string
  lineWidth?: number
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
}

export interface EllipseProps extends DrawingProps<EllipseStyle> {
  x: number
  y: number
  radiusX: number
  radiusY: number
  rotation?: number
  startAngle?: number
  endAngle?: number
  anticlockwise?: boolean
  fill?: string
  fillStyle?: string
  stroke?: string
  strokeStyle?: string
  lineWidth?: number
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
}

export interface DrawingTextProps extends DrawingProps<DrawingTextStyle> {
  text: string
  x: number
  y: number
  font?: string
  textAlign?: 'left' | 'right' | 'center' | 'start' | 'end'
  textBaseline?: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom'
  maxWidth?: number
  fill?: string
  fillStyle?: string
  stroke?: string
  strokeStyle?: string
}


// 创建组件的工厂函数
const createDrawingComponent = <P extends DrawingProps<DrawingStyle>> (type: string) => {
  return (props: P) => {
    // 绘图组件是数据组件，不渲染子节点
    return React.createElement(type, props)
  }
}

// 创建并导出绘图组件
export const Arc = createDrawingComponent<ArcProps>('ARC')
export const Circle = createDrawingComponent<CircleProps>('CIRCLE')
export const Rect = createDrawingComponent<RectProps>('RECT')
export const Line = createDrawingComponent<LineProps>('LINE')
export const Path = createDrawingComponent<PathProps>('PATH')
export const Ellipse = createDrawingComponent<EllipseProps>('ELLIPSE')
export const DrawingText = createDrawingComponent<DrawingTextProps>('DRAWINGTEXT')
