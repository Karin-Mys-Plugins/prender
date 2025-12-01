import type { CanvasRenderingContext2D } from 'skia-canvas'
import type { Element } from '../../types'

export type PathCommand =
  | { cmd: 'moveTo'; x: number; y: number }
  | { cmd: 'lineTo'; x: number; y: number }
  | { cmd: 'arc'; x: number; y: number; radius: number; startAngle: number; endAngle: number; anticlockwise?: boolean }
  | { cmd: 'arcTo'; x1: number; y1: number; x2: number; y2: number; radius: number }
  | { cmd: 'quadraticCurveTo'; cp1x: number; cp1y: number; x: number; y: number }
  | { cmd: 'bezierCurveTo'; cp1x: number; cp1y: number; cp2x: number; cp2y: number; x: number; y: number }
  | { cmd: 'closePath' }

// 简单的SVG路径解析器
function parseSVGPath (pathData: string): PathCommand[] {
  const commands: PathCommand[] = []
  const regex = /([MLHVCSQTAZ])\s*([^MLHVCSQTAZ]*)/gi
  let match
  let currentX = 0
  let currentY = 0

  while ((match = regex.exec(pathData)) !== null) {
    const command = match[1].toUpperCase()
    const params = match[2].trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n))

    switch (command) {
      case 'M': // moveTo
        if (params.length >= 2) {
          currentX = params[0]
          currentY = params[1]
          commands.push({ cmd: 'moveTo', x: currentX, y: currentY })
        }
        break
      case 'L': // lineTo
        if (params.length >= 2) {
          currentX = params[0]
          currentY = params[1]
          commands.push({ cmd: 'lineTo', x: currentX, y: currentY })
        }
        break
      case 'H': // horizontal lineTo
        if (params.length >= 1) {
          currentX = params[0]
          commands.push({ cmd: 'lineTo', x: currentX, y: currentY })
        }
        break
      case 'V': // vertical lineTo
        if (params.length >= 1) {
          currentY = params[0]
          commands.push({ cmd: 'lineTo', x: currentX, y: currentY })
        }
        break
      case 'Z': // closePath
        commands.push({ cmd: 'closePath' })
        break
    }
  }

  return commands
}

const Path = {
  draw: async (ctx: CanvasRenderingContext2D, element: Element) => {
    const {
      commands,
      d,
      fill,
      fillStyle,
      stroke,
      strokeStyle,
      lineWidth,
      shadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
    } = element.props

    // 设置阴影
    if (shadowColor) {
      ctx.shadowColor = shadowColor as string
      ctx.shadowBlur = (shadowBlur as number) || 0
      ctx.shadowOffsetX = (shadowOffsetX as number) || 0
      ctx.shadowOffsetY = (shadowOffsetY as number) || 0
    }

    ctx.beginPath()

    // 支持SVG路径字符串 (d) 和命令数组 (commands)
    let pathCommands: PathCommand[]
    if (d) {
      pathCommands = parseSVGPath(d as string)
    } else {
      pathCommands = commands as PathCommand[]
    }

    if (pathCommands) {
      pathCommands.forEach(command => {
        switch (command.cmd) {
          case 'moveTo':
            ctx.moveTo(command.x, command.y)
            break
          case 'lineTo':
            ctx.lineTo(command.x, command.y)
            break
          case 'arc':
            ctx.arc(command.x, command.y, command.radius, command.startAngle, command.endAngle, command.anticlockwise)
            break
          case 'arcTo':
            ctx.arcTo(command.x1, command.y1, command.x2, command.y2, command.radius)
            break
          case 'quadraticCurveTo':
            ctx.quadraticCurveTo(command.cp1x, command.cp1y, command.x, command.y)
            break
          case 'bezierCurveTo':
            ctx.bezierCurveTo(command.cp1x, command.cp1y, command.cp2x, command.cp2y, command.x, command.y)
            break
          case 'closePath':
            ctx.closePath()
            break
        }
      })
    }

    // 支持 fill 和 fillStyle 两种属性名
    const fillColor = (fill || fillStyle) as string
    if (fillColor) {
      ctx.fillStyle = fillColor
      ctx.fill()
    }

    // 支持 stroke 和 strokeStyle 两种属性名
    const strokeColor = (stroke || strokeStyle) as string
    if (strokeColor) {
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = (lineWidth as number) || 1
      ctx.stroke()
    }

    // 重置阴影设置
    if (shadowColor) {
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }
  },
}

export default Path
