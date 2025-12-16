'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ToastItem {
    id: number
    message: string
    type: 'success' | 'error'
    leaving: boolean
}

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error') => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ToastItem[]>([])

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now()
        setItems(prev => [...prev, { id, message, type, leaving: false }])

        // 2.5초 후 leaving 상태로
        setTimeout(() => {
            setItems(prev => prev.map(item =>
                item.id === id ? { ...item, leaving: true } : item
            ))
        }, 2500)

        // 3초 후 제거
        setTimeout(() => {
            setItems(prev => prev.filter(item => item.id !== id))
        }, 3000)
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {items.length > 0 && (
                <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
                    {items.map(item => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-2 rounded-full px-5 py-3 shadow-lg transition-all duration-300 ${
                                item.type === 'success'
                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                    : 'bg-red-500 text-white'
                            } ${item.leaving ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}`}
                            style={{
                                animation: !item.leaving ? 'toastIn 0.3s ease-out forwards' : undefined
                            }}
                        >
                            {item.type === 'success' ? (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                            <span className="text-sm font-medium">{item.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </ToastContext.Provider>
    )
}
