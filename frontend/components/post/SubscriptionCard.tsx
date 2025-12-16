'use client'

import Link from 'next/link'
import SubscriptionButton from '@/components/common/SubscriptionButton'

interface SubscriptionCardProps {
    blogId: string
    blogName: string
    blogDescription: string | null
    authorId: string
    thumbnailUrl: string | null
    profileImageUrl: string | null
}

export default function SubscriptionCard({
    blogId,
    blogName,
    blogDescription,
    authorId,
    thumbnailUrl,
    profileImageUrl
}: SubscriptionCardProps) {
    return (
        <div className="mt-10 rounded-2xl bg-[var(--blog-fg)]/[0.03] p-5">
            <div className="flex items-center gap-4">
                {/* 프로필 */}
                <Link href={`/blog/${blogId}`} className="shrink-0">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-[var(--blog-fg)]/10">
                        {(thumbnailUrl || profileImageUrl) ? (
                            <img
                                src={thumbnailUrl || profileImageUrl || ''}
                                alt={blogName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg font-medium text-[var(--blog-muted)]">
                                {blogName.charAt(0)}
                            </div>
                        )}
                    </div>
                </Link>

                {/* 정보 */}
                <div className="min-w-0 flex-1">
                    <Link href={`/blog/${blogId}`} className="font-medium text-[var(--blog-fg)] hover:underline">
                        {blogName}
                    </Link>
                    <p className="mt-0.5 truncate text-sm text-[var(--blog-muted)]">
                        {blogDescription || '블로그 소개가 없습니다'}
                    </p>
                </div>

                {/* 구독 버튼 */}
                <SubscriptionButton
                    targetId={authorId}
                    variant="blog"
                    className="!rounded-full !px-4 !py-2 !text-sm"
                />
            </div>
        </div>
    )
}
