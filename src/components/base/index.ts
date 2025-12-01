import {
  ButtonComponentStyle,
  ContainerComponentStyle,
  GradientComponentStyle,
  ImageComponentStyle,
  Props,
  TextComponentStyle,
} from '@karin-mys/prender/types'
import * as echarts from 'echarts'
import React from 'react'
import { FontLibrary } from 'skia-canvas'

export const registerFont = FontLibrary.use

// 导出 skia-canvas 字体管理功能
export { FontManager, ImageLoader } from '@karin-mys/prender/utils/skia'

// 为每个组件定义专门的类型接口
export interface ViewProps extends Props {
  style?: ContainerComponentStyle
  children?: React.ReactNode
}

export interface TextProps extends Props {
  style?: TextComponentStyle
  children?: React.ReactNode
}

export interface AdvancedTextProps {
  style?: ContainerComponentStyle & {
    fontFamily?: string
    fontSize?: number
    fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
    fontStyle?: 'normal' | 'italic' | 'oblique'
    color?: string
    textDecoration?: 'none' | 'underline' | 'line-through' | 'overline'
    textDecorationColor?: string
    textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy'
    textDecorationThickness?: number
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
    textAlign?: 'left' | 'center' | 'right' | 'justify'
    lineHeight?: number
    letterSpacing?: number
    wordSpacing?: number
    textShadow?: string
    textStroke?: string
    textStrokeWidth?: number
    direction?: 'ltr' | 'rtl'
    textRendering?: 'auto' | 'optimizeSpeed' | 'optimizeLegibility' | 'geometricPrecision'
    fontKerning?: 'auto' | 'normal' | 'none'
    textOverflow?: 'clip' | 'ellipsis'
    whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line'
    wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word'
    maxLines?: number
  }
  children?: React.ReactNode
}

export interface ImageProps extends Props {
  src: string | Buffer
  style?: ImageComponentStyle
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  objectPosition?: string
  children?: React.ReactNode
}

export interface LinearGradientProps extends Props {
  style?: GradientComponentStyle
  children?: React.ReactNode
}

export interface RadialGradientProps extends Props {
  style?: GradientComponentStyle
  children?: React.ReactNode
}

export interface ConicGradientProps extends Props {
  style?: GradientComponentStyle
  children?: React.ReactNode
}

export interface ButtonProps extends Props {
  title?: string
  style?: ButtonComponentStyle
  children?: React.ReactNode
}

export interface SwitchProps extends Props {
  checked?: boolean
  style?: ButtonComponentStyle
  children?: React.ReactNode
}

export interface CheckboxProps extends Props {
  checked?: boolean
  style?: ButtonComponentStyle
  children?: React.ReactNode
}

export interface BlurViewProps extends Props {
  style?: ContainerComponentStyle & {
    blurAmount?: number
    tintColor?: string
  }
  children?: React.ReactNode
}

// Use the actual ECharts type for better compatibility when the real library is passed in.
export type EChartsApi = typeof echarts

export interface ChartProps extends Props {
  style?: ContainerComponentStyle
  option?: object
  children?: React.ReactNode
  echarts?: EChartsApi
}

export interface PainterProps extends Props {
  style?: ContainerComponentStyle
  children?: React.ReactNode
}

// 创建组件的工厂函数，现在接受一个泛型参数
const createComponent = <P extends Props> (type: string) => {
  // 返回一个带有明确类型的 React 组件
  return (props: P) => {
    return React.createElement(type, props, props.children)
  }
}

// 使用明确的类型创建并导出组件
export const View = createComponent<ViewProps>('VIEW')
export const Text = createComponent<TextProps>('TEXT')
export const AdvancedText = (props: AdvancedTextProps) => React.createElement('ADVANCEDTEXT', props, props.children)
export const Image = createComponent<ImageProps>('IMAGE')
export const LinearGradient = createComponent<LinearGradientProps>('LINEARGRADIENT')
export const RadialGradient = createComponent<RadialGradientProps>('RADIALGRADIENT')
export const ConicGradient = createComponent<ConicGradientProps>('CONICGRADIENT')
export const Button = createComponent<ButtonProps>('BUTTON')
export const Switch = createComponent<SwitchProps>('SWITCH')
export const Checkbox = createComponent<CheckboxProps>('CHECKBOX')
export const BlurView = createComponent<BlurViewProps>('BLURVIEW')
export const Chart = createComponent<ChartProps>('CHART')
export const Painter = createComponent<PainterProps>('PAINTER')
