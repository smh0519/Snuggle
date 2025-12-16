'use client'

import Link from 'next/link'

interface RelatedPost {
    id: string
    title: string
}

interface RelatedPostsProps {
    prevPost?: RelatedPost | null
    nextPost?: RelatedPost | null
}

export default function RelatedPosts({ prevPost, nextPost }: RelatedPostsProps) {
    if (!prevPost && !nextPost) return null

    return (
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {/* 이전 글 */}
            {prevPost ? (
                <Link
                    href={`/post/${prevPost.id}`}
                    className="group rounded-xl border border-[var(--blog-border)] p-4 transition-colors hover:bg-[var(--blog-fg)]/[0.02]"
                >
                    <span className="text-xs text-[var(--blog-muted)]">이전 글</span>
                    <p className="mt-1 line-clamp-1 text-sm font-medium text-[var(--blog-fg)] group-hover:underline">
                        {prevPost.title}
                    </p>
                </Link>
            ) : (
                <div className="rounded-xl border border-dashed border-[var(--blog-border)] p-4 opacity-50">
                    <span className="text-xs text-[var(--blog-muted)]">이전 글이 없습니다</span>
                </div>
            )}

            {/* 다음 글 */}
            {nextPost ? (
                <Link
                    href={`/post/${nextPost.id}`}
                    className="group rounded-xl border border-[var(--blog-border)] p-4 text-right transition-colors hover:bg-[var(--blog-fg)]/[0.02]"
                >
                    <span className="text-xs text-[var(--blog-muted)]">다음 글</span>
                    <p className="mt-1 line-clamp-1 text-sm font-medium text-[var(--blog-fg)] group-hover:underline">
                        {nextPost.title}
                    </p>
                </Link>
            ) : (
                <div className="rounded-xl border border-dashed border-[var(--blog-border)] p-4 text-right opacity-50">
                    <span className="text-xs text-[var(--blog-muted)]">다음 글이 없습니다</span>
                </div>
            )}
        </div>
    )
}
