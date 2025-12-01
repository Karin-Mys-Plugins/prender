import type { ChartProps } from '@karin-mys/prender/components/base'
import type { CreateCanvas, Element } from '@karin-mys/prender/types'
import type { EChartsOption } from 'echarts'
import type { Canvas, CanvasRenderingContext2D } from 'skia-canvas'

const drawChart = (createCanvas: CreateCanvas, ctx: CanvasRenderingContext2D, element: Element) => {
  // 将 props 转换为更具体的 ChartProps 类型以获得正确的类型定义
  const { option, echarts } = element.props as ChartProps

  // 最终的尺寸和位置由 Yoga 布局引擎计算得出
  const { left, top, width, height } = element.layout

  // 如果没有空间或没有图表数据，则不渲染
  if (!option || width <= 0 || height <= 0) {
    return
  }

  // 确保 echarts 实例已提供
  if (!echarts) {
    console.error('ECharts API 对象未提供给 Chart 组件。')
    return
  }

  let finalOption = {
    ...(option ?? {}),
    animation: false,
  }

  const chartCanvas = createCanvas(width, height)

  const chart = echarts.init(chartCanvas as HTMLCanvasElement)
  chart.setOption(finalOption as EChartsOption)

  // 将渲染完成的图表画布绘制到我们的主画布上的正确位置
  // getDom() 的返回类型是 HTMLCanvasElement | HTMLDivElement，所以我们在这里进行类型转换
  ctx.drawImage(chart.getDom() as unknown as Canvas, left, top, width, height)

  // 清理 ECharts 实例以防止内存泄漏
  chart.dispose()
}

export default drawChart
