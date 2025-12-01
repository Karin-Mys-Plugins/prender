import { BlurView, Image, Text, View } from '@karin-mys/prender/components/base'
import { ContainerComponentStyle, ImageComponentStyle, TextComponentStyle } from '@karin-mys/prender/types'
import React from 'react'

export interface CardProps {
  title?: string
  description?: string
  cover?: string
  style?: ContainerComponentStyle
  children?: React.ReactNode
}

const defaultCardStyle: ContainerComponentStyle = {
  borderRadius: 15,
  border: '1px solid rgba(0, 0, 0, 0.1)', // 模拟阴影
  backgroundColor: '#ffffff', // 无封面时的默认背景
  overflow: 'hidden', // 确保子元素不会超出圆角范围
}

const coverStyle: ImageComponentStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
}

const contentContainerStyle: ContainerComponentStyle = {
  flex: 1,
  padding: 15,
  justifyContent: 'flex-end', // 将内容推到底部
}

const titleStyle: TextComponentStyle = {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#ffffff',
  marginBottom: 5,
}

const descriptionStyle: TextComponentStyle = {
  fontSize: 14,
  color: '#f0f0f0',
}

export const Card: React.FC<CardProps> = ({ title, description, cover, style, ...rest }) => {
  const cardStyle = { ...defaultCardStyle, ...style }

  return (
    <View style={cardStyle} {...rest}>
      {cover && <Image style={coverStyle} src={cover} />}
      <BlurView
        style={{ flex: 1 }}
        blurAmount={cover ? 15 : 0}
        tintColor={cover ? 'rgba(0, 0, 0, 0.3)' : 'transparent'}
      >
        <View style={contentContainerStyle}>
          {title && <Text style={titleStyle}>{title}</Text>}
          {description && <Text style={descriptionStyle}>{description}</Text>}
        </View>
      </BlurView>
    </View>
  )
}
