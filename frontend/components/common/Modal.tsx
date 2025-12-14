'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ModalState {
  isOpen: boolean
  title?: string
  message: string
  type: 'alert' | 'confirm'
  onConfirm?: () => void
  onCancel?: () => void
}

interface ModalContextType {
  showAlert: (message: string, title?: string) => Promise<void>
  showConfirm: (message: string, title?: string) => Promise<boolean>
}

const ModalContext = createContext<ModalContextType | null>(null)

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within ModalProvider')
  }
  return context
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null)

  const showAlert = useCallback((message: string, title?: string): Promise<void> => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        title,
        message,
        type: 'alert',
        onConfirm: () => {
          setModal(null)
          resolve()
        },
      })
    })
  }, [])

  const showConfirm = useCallback((message: string, title?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        title,
        message,
        type: 'confirm',
        onConfirm: () => {
          setModal(null)
          resolve(true)
        },
        onCancel: () => {
          setModal(null)
          resolve(false)
        },
      })
    })
  }, [])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (modal?.type === 'alert') {
        modal.onConfirm?.()
      } else {
        modal?.onCancel?.()
      }
    }
  }

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modal?.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <div
            className="mx-4 w-full max-w-sm animate-in fade-in zoom-in-95 rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            {modal.title && (
              <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                {modal.title}
              </h3>
            )}
            <p className="text-sm text-black/70 dark:text-white/70 whitespace-pre-wrap">
              {modal.message}
            </p>
            <div className="mt-6 flex gap-3">
              {modal.type === 'confirm' && (
                <button
                  onClick={modal.onCancel}
                  className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-black transition-colors hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                >
                  취소
                </button>
              )}
              <button
                onClick={modal.onConfirm}
                className="flex-1 rounded-xl bg-black py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}
