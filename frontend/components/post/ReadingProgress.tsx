'use client'

import { useEffect, useState, RefObject } from 'react'

interface ReadingProgressProps {
    targetRef: RefObject<HTMLElement | null>
}

export default function ReadingProgress({ targetRef }: ReadingProgressProps) {
    const [progress, setProgress] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const updateProgress = () => {
            if (!targetRef.current) return

            const element = targetRef.current
            const rect = element.getBoundingClientRect()
            const elementTop = rect.top + window.scrollY
            const elementHeight = element.offsetHeight
            const windowHeight = window.innerHeight
            const scrollY = window.scrollY

            // 글 시작 전이면 0%
            if (scrollY < elementTop - windowHeight * 0.2) {
                setProgress(0)
                setIsVisible(false)
                return
            }

            // 스크롤이 시작되면 표시
            setIsVisible(scrollY > 100)

            // 글 끝에 도달하면 100%
            const scrollableDistance = elementHeight - windowHeight * 0.3
            const scrolled = scrollY - elementTop + windowHeight * 0.2
            const percentage = Math.min(Math.max((scrolled / scrollableDistance) * 100, 0), 100)

            setProgress(percentage)
        }

        updateProgress()
        window.addEventListener('scroll', updateProgress, { passive: true })
        window.addEventListener('resize', updateProgress, { passive: true })

        return () => {
            window.removeEventListener('scroll', updateProgress)
            window.removeEventListener('resize', updateProgress)
        }
    }, [targetRef])

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-50 h-1 transition-opacity duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            {/* 배경 트랙 */}
            <div className="absolute inset-0 bg-[var(--blog-fg)]/5" />

            {/* 진행률 바 */}
            <div
                className="h-full bg-gradient-to-r from-[var(--blog-accent,#e07a5f)] via-[var(--blog-accent,#e07a5f)] to-[var(--blog-accent,#e07a5f)]/80 transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
            >
                {/* 빛나는 효과 */}
                <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-white/30" />
            </div>
        </div>
    )
}
