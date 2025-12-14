import { cleanupOldTempFiles } from './r2.service.js'
import { logger } from '../utils/logger.js'

// 스케줄러 인터벌 ID
let cleanupIntervalId: NodeJS.Timeout | null = null

/**
 * 임시 파일 정리 스케줄러 시작
 * @param intervalHours 실행 간격 (시간 단위, 기본 6시간)
 * @param maxAgeHours 삭제 기준 시간 (기본 24시간)
 */
export function startCleanupScheduler(intervalHours = 6, maxAgeHours = 24): void {
  if (cleanupIntervalId) {
    logger.log('[Scheduler] Cleanup scheduler already running')
    return
  }

  const intervalMs = intervalHours * 60 * 60 * 1000

  logger.log(`[Scheduler] Starting temp file cleanup scheduler (every ${intervalHours} hours)`)

  // 서버 시작 후 1분 뒤에 첫 번째 정리 실행
  setTimeout(() => {
    cleanupOldTempFiles(maxAgeHours)
  }, 60 * 1000)

  // 이후 정기적으로 실행
  cleanupIntervalId = setInterval(() => {
    cleanupOldTempFiles(maxAgeHours)
  }, intervalMs)

  logger.log('[Scheduler] Cleanup scheduler started')
}

/**
 * 스케줄러 중지
 */
export function stopCleanupScheduler(): void {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId)
    cleanupIntervalId = null
    logger.log('[Scheduler] Cleanup scheduler stopped')
  }
}

/**
 * 수동으로 정리 실행
 */
export async function runCleanupNow(maxAgeHours = 24): Promise<{ deleted: number; failed: number }> {
  return cleanupOldTempFiles(maxAgeHours)
}
