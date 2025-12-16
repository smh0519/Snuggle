'use client'

import { useState, useEffect } from 'react'
import { useModal } from '@/components/common/Modal'
import { useToast } from '@/components/common/ToastProvider'
import { toggleLike } from '@/lib/api/posts'
import { useUserStore } from '@/lib/store/useUserStore'

interface PostActionsProps {
    postId: string
    initialLikeCount?: number
    initialIsLiked?: boolean
}

export default function PostActions({
    postId,
    initialLikeCount = 0,
    initialIsLiked = false,
}: PostActionsProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked)
    const [likeCount, setLikeCount] = useState(initialLikeCount)
    const [isAnimating, setIsAnimating] = useState(false)
    const { showAlert } = useModal()
    const { showToast } = useToast()
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

        // 애니메이션 시작
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
        } catch {
            setIsLiked(prevIsLiked)
            setLikeCount(prevCount)
            showToast('오류가 발생했습니다.', 'error')
        }
    }

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            showToast('링크가 복사되었습니다.')
        } catch {
            showToast('복사에 실패했습니다.', 'error')
        }
    }

    return (
        <div className="mt-10 flex items-center justify-center gap-2 border-y border-[var(--blog-border)] py-4">
            {/* 좋아요 */}
            <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                    isLiked
                        ? 'bg-red-50 text-red-500'
                        : 'bg-[var(--blog-fg)]/5 text-[var(--blog-muted)] hover:text-[var(--blog-fg)]'
                } ${isAnimating ? 'scale-95' : 'scale-100'}`}
            >
                <svg
                    className={`h-4 w-4 transition-transform duration-200 ${isLiked ? 'fill-current' : 'fill-none'} ${isAnimating ? 'scale-125' : 'scale-100'}`}
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
                공감 {likeCount > 0 && likeCount}
            </button>

            {/* 공유 */}
            <button
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-full bg-[var(--blog-fg)]/5 px-4 py-2 text-sm text-[var(--blog-muted)] transition-colors hover:text-[var(--blog-fg)]"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                공유
            </button>
        </div>
    )
}
