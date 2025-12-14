import { env } from '../config/env.js'

/**
 * Production 환경에서는 로그를 출력하지 않는 Logger
 * Development에서만 console.log/error 출력
 */
export const logger = {
  log: (...args: unknown[]): void => {
    if (!env.isProduction) {
      console.log(...args)
    }
  },

  error: (...args: unknown[]): void => {
    if (!env.isProduction) {
      console.error(...args)
    }
  },

  warn: (...args: unknown[]): void => {
    if (!env.isProduction) {
      console.warn(...args)
    }
  },

  info: (...args: unknown[]): void => {
    if (!env.isProduction) {
      console.info(...args)
    }
  },
}
