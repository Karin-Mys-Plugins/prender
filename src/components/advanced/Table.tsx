import React from 'react'
import { Style } from '../../types'
import { Text, View } from '../base/index'

// Custom cell object with span properties
interface CellWithSpan {
  children: React.ReactNode
  props: {
    rowSpan?: number
    colSpan?: number
  }
}

// Type guard to check for our custom cell object
function isCellWithSpan (obj: any): obj is CellWithSpan {
  return (
    obj &&
    typeof obj === 'object' &&
    !React.isValidElement(obj) &&
    'props' in obj &&
    'children' in obj
  )
}

export type KeyType = string | number | symbol

// 列定义
export interface TableColumn<T = any> {
  title: string
  dataIndex: keyof T
  key: string
  width?: number
  render?: (
    value: T[keyof T],
    record: T,
    index: number
  ) => React.ReactNode | CellWithSpan
}

// 表格属性
export interface TableProps<T = any> {
  columns: TableColumn<T>[]
  dataSource: T[]
  style?: Style
  headerStyle?: Style
  rowStyle?: Style
  cellStyle?: Style
}

const defaultHeaderStyle: Style = {
  flexDirection: 'row',
  backgroundColor: '#fafafa',
  borderBottomWidth: 1,
  borderColor: '#d9d9d9',
}

const defaultRowStyle: Style = {
  flexDirection: 'row',
  borderBottomWidth: 1,
  borderColor: '#d9d9d9',
}

const defaultCellStyle: Style = {
  padding: 8,
  flex: 1,
  justifyContent: 'center',
}

export const Table = <T = any> ({
  columns,
  dataSource,
  style,
  headerStyle,
  rowStyle,
  cellStyle,
}: TableProps<T>) => {
  const renderHeader = () => (
    <View style={{ ...defaultHeaderStyle, ...headerStyle }}>
      {columns.map(col => (
        <View key={col.key} style={{ ...defaultCellStyle, ...cellStyle, flex: col.width ? undefined : 1, width: col.width }}>
          <Text>{col.title}</Text>
        </View>
      ))}
    </View>
  )

  const processedRows = React.useMemo(() => {
    const skippedCells = new Set<string>()
    const rows: React.ReactNode[] = []

    for (let rowIndex = 0; rowIndex < dataSource.length; rowIndex++) {
      const record = dataSource[rowIndex]
      const cells: React.ReactNode[] = []

      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const cellKey = `${rowIndex}-${colIndex}`
        if (skippedCells.has(cellKey)) {
          continue
        }

        const col = columns[colIndex]
        const value = record[col.dataIndex]

        let cellContent: React.ReactNode = <Text>{String(value)}</Text>
        let rowSpan = 1
        let colSpan = 1

        if (col.render) {
          const renderResult = col.render(value, record, rowIndex)
          if (isCellWithSpan(renderResult)) {
            cellContent = renderResult.children
            rowSpan = renderResult.props.rowSpan ?? 1
            colSpan = renderResult.props.colSpan ?? 1
          } else {
            cellContent = renderResult
          }
        }

        if (rowSpan > 1 || colSpan > 1) {
          for (let i = 0; i < rowSpan; i++) {
            for (let j = 0; j < colSpan; j++) {
              if (i === 0 && j === 0) continue
              skippedCells.add(`${rowIndex + i}-${colIndex + j}`)
            }
          }
        }

        const cellStyleWithSpan = { ...defaultCellStyle, ...cellStyle }
        if (colSpan > 1) {
          const spannedCols = columns.slice(colIndex, colIndex + colSpan)
          const totalWidth = spannedCols.reduce((sum, c) => sum + (c.width || 0), 0)

          if (totalWidth > 0) {
            cellStyleWithSpan.width = totalWidth
            cellStyleWithSpan.flex = undefined
          } else {
            const totalFlex = spannedCols.reduce((sum, c) => sum + (c.width === undefined ? 1 : 0), 0)
            cellStyleWithSpan.flex = totalFlex
            cellStyleWithSpan.width = undefined
          }
        } else {
          cellStyleWithSpan.flex = col.width ? undefined : 1
          cellStyleWithSpan.width = col.width
        }

        // 注意：rowSpan 在当前基于 Flexbox 的布局中未完全支持。
        // 它会正确地跳过后续行中的单元格，但合并单元格本身不会自动拉伸高度，
        // 这可能会导致视觉上的空白。
        // 完美的 rowSpan 需要基于 Grid 或绝对定位的布局。

        if (rowSpan > 0 && colSpan > 0) {
          cells.push(
            <View key={col.key} style={cellStyleWithSpan}>
              {cellContent}
            </View>
          )
        }
      }

      if (cells.length > 0) {
        rows.push(
          <View key={rowIndex} style={{ ...defaultRowStyle, ...rowStyle }}>
            {cells}
          </View>
        )
      }
    }
    return rows
  }, [dataSource, columns, cellStyle, rowStyle])

  return (
    <View style={style}>
      {renderHeader()}
      {processedRows}
    </View>
  )
}
