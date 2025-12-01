import { View } from '@karin-mys/prender/components/base'
import { ContainerComponentStyle } from '@karin-mys/prender/types'
import React from 'react'

export interface ListProps<T extends { id?: string | number }> {
  data: T[]
  renderItem: (item: T) => React.ReactElement
  style?: ContainerComponentStyle
  itemStyle?: ContainerComponentStyle
}

export function List<T extends { id?: string | number }> ({ data, renderItem, style, itemStyle }: ListProps<T>) {
  return (
    <View style={style}>
      {data.map((item, index) => (
        <View key={item.id || index} style={itemStyle}>
          {renderItem(item)}
        </View>
      ))}
    </View>
  )
}
