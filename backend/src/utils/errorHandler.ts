import { Response } from 'express'
import { ApiError, ErrorCodes, ErrorCode } from '../types/database.types.js'

/**
 * 표준화된 에러 응답 헬퍼
 */
export function sendError(
  res: Response,
  statusCode: number,
  code: ErrorCode,
  message: string,
  details?: unknown
): void {
  const error: ApiError = {
    code,
    message,
    details
  }
  res.status(statusCode).json(error)
}

/**
 * 400 Bad Request
 */
export function badRequest(res: Response, message: string, details?: unknown): void {
  sendError(res, 400, ErrorCodes.MISSING_REQUIRED_FIELD, message, details)
}

/**
 * 401 Unauthorized
 */
export function unauthorized(res: Response, message = 'Authentication required'): void {
  sendError(res, 401, ErrorCodes.NO_TOKEN, message)
}

/**
 * 403 Forbidden
 */
export function forbidden(res: Response, message = 'Access denied'): void {
  sendError(res, 403, ErrorCodes.NOT_AUTHORIZED, message)
}

/**
 * 404 Not Found
 */
export function notFound(res: Response, resource = 'Resource'): void {
  sendError(res, 404, ErrorCodes.NOT_FOUND, `${resource} not found`)
}

/**
 * 409 Conflict (중복)
 */
export function conflict(res: Response, message: string): void {
  sendError(res, 409, ErrorCodes.ALREADY_EXISTS, message)
}

/**
 * 500 Internal Server Error
 */
export function serverError(res: Response, message = 'Internal server error', details?: unknown): void {
  sendError(res, 500, ErrorCodes.INTERNAL_ERROR, message, details)
}

/**
 * Supabase 에러 처리
 */
export function handleSupabaseError(res: Response, error: { message: string; code?: string }): void {
  // Supabase 에러 코드에 따른 처리
  if (error.code === 'PGRST116') {
    // 결과 없음
    notFound(res)
    return
  }

  if (error.code === '23505') {
    // Unique constraint violation
    conflict(res, 'Duplicate entry')
    return
  }

  if (error.code === '23503') {
    // Foreign key violation
    badRequest(res, 'Invalid reference')
    return
  }

  // 기본 서버 에러
  serverError(res, error.message)
}

/**
 * 성공 응답 헬퍼
 */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json(data)
}

/**
 * 생성 성공 응답 (201)
 */
export function created<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201)
}

/**
 * 삭제 성공 응답
 */
export function deleted(res: Response): void {
  sendSuccess(res, { success: true })
}
