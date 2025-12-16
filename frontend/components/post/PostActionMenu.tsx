'use client'

import { useState, useRef, useEffect } from 'react'
import { useModal } from '@/components/common/Modal'

interface PostActionMenuProps {
    isPrivate: boolean
    onEdit: () => void
    onDelete: () => void
    onToggleVisibility: () => void
    isAuthor: boolean
}

export default function PostActionMenu({
    isPrivate,
    onEdit,
    onDelete,
    onToggleVisibility,
    isAuthor,
}: PostActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const { showConfirm } = useModal()

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!isAuthor) return null

    const handleDelete = async () => {
        setIsOpen(false)
        const confirmed = await showConfirm('이 게시글을 삭제하시겠습니까?', '게시글 삭제')
        if (confirmed) {
            onDelete()
        }
    }

    const handleToggleVisibility = () => {
        setIsOpen(false)
        onToggleVisibility()
    }

    const handleEdit = () => {
        setIsOpen(false)
        onEdit()
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--blog-muted)] transition-colors hover:bg-[var(--blog-fg)]/5 hover:text-[var(--blog-fg)]"
                aria-label="게시글 메뉴"
            >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="6" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="18" r="1.5" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* 백드롭 */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    {/* 메뉴 */}
                    <div className="absolute right-0 top-full z-50 mt-2 w-44 origin-top-right animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="overflow-hidden rounded-xl border border-[var(--blog-border)] bg-[var(--blog-card-bg,#fff)] shadow-lg">
                            {/* 수정 */}
                            <button
                                onClick={handleEdit}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[var(--blog-fg)] transition-colors hover:bg-[var(--blog-fg)]/5"
                            >
                                <svg className="h-4 w-4 text-[var(--blog-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                수정하기
                            </button>

                            {/* 공개/비공개 전환 */}
                            <button
                                onClick={handleToggleVisibility}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[var(--blog-fg)] transition-colors hover:bg-[var(--blog-fg)]/5"
                            >
                                {isPrivate ? (
                                    <>
                                        <svg className="h-4 w-4 text-[var(--blog-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        공개로 전환
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-4 w-4 text-[var(--blog-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                        비공개로 전환
                                    </>
                                )}
                            </button>

                            {/* 구분선 */}
                            <div className="my-1 h-px bg-[var(--blog-border)]" />

                            {/* 삭제 */}
                            <button
                                onClick={handleDelete}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                삭제하기
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
