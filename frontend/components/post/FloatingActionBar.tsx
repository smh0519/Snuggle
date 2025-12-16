'use client'

import { useState, useEffect } from 'react'
import { useModal } from '@/components/common/Modal'
import { toggleLike } from '@/lib/api/posts'
import { useUserStore } from '@/lib/store/useUserStore'

interface FloatingActionBarProps {
    show: boolean
    postId: string
    initialLikeCount?: number
    initialIsLiked?: boolean
}

export default function FloatingActionBar({
    show,
    postId,
    initialLikeCount = 0,
    initialIsLiked = false,
}: FloatingActionBarProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked)
    const [likeCount, setLikeCount] = useState(initialLikeCount)
    const [isAnimating, setIsAnimating] = useState(false)
    const { showAlert } = useModal()
    const { user } = useUserStore()

    useEffect(() => {
        setIsLiked(initialIsLiked)
        setLikeCount(initialLikeCount)
    }, [initialIsLiked, initialLikeCount])

    const handleLike = async () => {
        if (!user) {
            await showAlert('로그인이 필요합니다.')
            return
        }

        // 애니메이션 트리거
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 300)

        const prevIsLiked = isLiked
        const prevCount = likeCount
        setIsLiked(!prevIsLiked)
        setLikeCount(prev => prevIsLiked ? prev - 1 : prev + 1)

        try {
            const result = await toggleLike(postId)
            setIsLiked(result.is_liked)
            setLikeCount(result.like_count)
        } catch (error) {
            setIsLiked(prevIsLiked)
            setLikeCount(prevCount)
            await showAlert('오류가 발생했습니다.')
        }
    }

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            await showAlert('링크가 복사되었습니다.')
        } catch {
            await showAlert('복사에 실패했습니다.')
        }
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const scrollToComments = () => {
        const commentsSection = document.querySelector('section.mt-16')
        if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <div
            className={`fixed bottom-8 left-1/2 z-40 -translate-x-1/2 transition-all duration-500 ease-out ${
                show
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-20 opacity-0 pointer-events-none'
            }`}
        >
            <div className="flex items-center gap-1 rounded-full bg-[var(--blog-card-bg,#ffffff)] px-2 py-2 shadow-xl shadow-black/10 ring-1 ring-black/[0.04] backdrop-blur-xl">
                {/* 좋아요 버튼 */}
                <button
                    onClick={handleLike}
                    className={`group relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isLiked
                            ? 'bg-red-500/10 text-red-500'
                            : 'text-[var(--blog-fg)]/60 hover:bg-[var(--blog-fg)]/5 hover:text-[var(--blog-fg)]'
                    }`}
                >
                    <svg
                        className={`h-5 w-5 transition-transform duration-200 ${
                            isAnimating ? 'scale-125' : 'scale-100'
                        } ${isLiked ? 'fill-current' : 'fill-none'}`}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                    {likeCount > 0 && (
                        <span className="tabular-nums">{likeCount}</span>
                    )}
                </button>

                {/* 구분선 */}
                <div className="h-6 w-px bg-[var(--blog-border,rgba(0,0,0,0.08))]" />

                {/* 댓글로 이동 */}
                <button
                    onClick={scrollToComments}
                    className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-[var(--blog-fg)]/60 transition-all hover:bg-[var(--blog-fg)]/5 hover:text-[var(--blog-fg)]"
                    title="댓글로 이동"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </button>

                {/* 구분선 */}
                <div className="h-6 w-px bg-[var(--blog-border,rgba(0,0,0,0.08))]" />

                {/* 공유 버튼 */}
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-[var(--blog-fg)]/60 transition-all hover:bg-[var(--blog-fg)]/5 hover:text-[var(--blog-fg)]"
                    title="공유하기"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                    </svg>
                </button>

                {/* 구분선 */}
                <div className="h-6 w-px bg-[var(--blog-border,rgba(0,0,0,0.08))]" />

                {/* 맨 위로 버튼 */}
                <button
                    onClick={scrollToTop}
                    className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-[var(--blog-fg)]/60 transition-all hover:bg-[var(--blog-fg)]/5 hover:text-[var(--blog-fg)]"
                    title="맨 위로"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                    </svg>
                </button>
            </div>
        </div>
    )
}
