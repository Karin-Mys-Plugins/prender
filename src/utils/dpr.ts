import type { CanvasRenderingContext2D } from 'skia-canvas'

// 保留全局 DPR 以向后兼容，但不推荐使用
let DPR: number | null = null

export function setDPR (dpr: number) {
  DPR = dpr
}

/**
 * 安全地获取设备像素比（DPR）
 * 
 * 在无屏幕环境中也能正常工作，会返回默认值而不是抛出错误
 * 
 * @param ctx 画布上下文，用于获取当前的变换矩阵
 * @param defaultDPR 如果无法获取真实DPR时使用的默认值
 * @param taskDPR 任务级别的设备像素比，优先级最高
 * @returns 设备像素比
 */
export function getSafeDPR (
  ctx?: CanvasRenderingContext2D | null,
  defaultDPR: number = 1,
  taskDPR?: number
): number {
  // 优先使用任务级别的 DPR
  if (taskDPR !== undefined && taskDPR > 0) {
    return taskDPR
  }

  // 其次使用全局 DPR（向后兼容）
  if (DPR !== null) {
    return DPR
  }

  // 如果没有提供上下文，直接返回默认值
  if (!ctx) {
    return defaultDPR
  }

  try {
    // 尝试从上下文的变换矩阵中获取DPR
    const transform = ctx.getTransform()
    if (transform && typeof transform.a === 'number') {
      return transform.a
    }
  } catch (error) {
    console.warn('无法获取变换矩阵，使用默认DPR值', error)
  }

  // 如果无法获取或发生错误，返回默认值
  return defaultDPR
}
