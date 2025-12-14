import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

// 캐시 설정: 1년 (immutable - 파일명에 해시가 포함된 경우)
const CACHE_MAX_AGE = 31536000
const CACHE_CONTROL_PERMANENT = `public, max-age=${CACHE_MAX_AGE}, immutable`
const CACHE_CONTROL_TEMP = 'public, max-age=3600' // temp 파일은 1시간

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.r2.accessKeyId,
    secretAccessKey: env.r2.secretAccessKey,
  },
})

export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  // temp 폴더 파일은 짧은 캐시, 그 외는 영구 캐시
  const cacheControl = key.startsWith('temp/') ? CACHE_CONTROL_TEMP : CACHE_CONTROL_PERMANENT

  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.r2.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: cacheControl,
    })
  )

  return `${env.r2.publicUrl}/${key}`
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: env.r2.bucketName,
      Key: key,
    })
  )
}

export function getKeyFromUrl(url: string): string | null {
  if (!url.startsWith(env.r2.publicUrl)) {
    return null
  }
  return url.replace(`${env.r2.publicUrl}/`, '')
}

/**
 * temp 폴더의 오래된 파일 목록 조회
 * @param maxAgeHours 삭제 기준 시간 (기본 24시간)
 */
export async function listOldTempFiles(maxAgeHours = 24): Promise<string[]> {
  const oldKeys: string[] = []
  const cutoffTime = Date.now() - maxAgeHours * 60 * 60 * 1000

  let continuationToken: string | undefined

  do {
    const response = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: env.r2.bucketName,
        Prefix: 'temp/',
        ContinuationToken: continuationToken,
      })
    )

    if (response.Contents) {
      for (const obj of response.Contents) {
        if (obj.Key && obj.LastModified) {
          const fileTime = obj.LastModified.getTime()
          if (fileTime < cutoffTime) {
            oldKeys.push(obj.Key)
          }
        }
      }
    }

    continuationToken = response.NextContinuationToken
  } while (continuationToken)

  return oldKeys
}

/**
 * 여러 파일 일괄 삭제
 */
export async function deleteMultipleFromR2(keys: string[]): Promise<{ deleted: number; failed: number }> {
  let deleted = 0
  let failed = 0

  // 10개씩 병렬 처리
  const batchSize = 10
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize)
    const results = await Promise.allSettled(
      batch.map((key) => deleteFromR2(key))
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        deleted++
      } else {
        failed++
      }
    }
  }

  return { deleted, failed }
}

/**
 * 오래된 임시 파일 정리 실행
 */
export async function cleanupOldTempFiles(maxAgeHours = 24): Promise<{ deleted: number; failed: number }> {
  try {
    logger.log(`[Cleanup] Starting temp file cleanup (files older than ${maxAgeHours} hours)...`)

    const oldKeys = await listOldTempFiles(maxAgeHours)

    if (oldKeys.length === 0) {
      logger.log('[Cleanup] No old temp files found')
      return { deleted: 0, failed: 0 }
    }

    logger.log(`[Cleanup] Found ${oldKeys.length} old temp files to delete`)

    const result = await deleteMultipleFromR2(oldKeys)

    logger.log(`[Cleanup] Completed: ${result.deleted} deleted, ${result.failed} failed`)

    return result
  } catch (error) {
    logger.error('[Cleanup] Error during cleanup:', error)
    return { deleted: 0, failed: 0 }
  }
}
