'use client'

import { SubscribedBlog } from '@/lib/api/subscribe'
import { getBlogImageUrl } from '@/lib/utils/image'

interface SubscribedBlogsProps {
    blogs: SubscribedBlog[]
    loading?: boolean
}

export default function SubscribedBlogs({ blogs, loading }: SubscribedBlogsProps) {
    if (loading) {
        return (
            <div className="rounded-xl border border-black/10 dark:border-white/10">
                <h3 className="px-4 pt-4 pb-2 text-sm font-semibold text-black/50 dark:text-white/50">
                    구독중인 블로그
                </h3>
                <div className="divide-y divide-black/10 dark:divide-white/10">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                            <div className="h-10 w-10 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
                            <div className="flex-1">
                                <div className="h-4 w-24 animate-pulse rounded bg-black/10 dark:bg-white/10" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (blogs.length === 0) {
        return (
            <div className="rounded-xl border border-black/10 p-6 dark:border-white/10">
                <h3 className="text-sm font-semibold text-black/50 dark:text-white/50">
                    구독중인 블로그
                </h3>
                <p className="mt-3 text-sm text-black/40 dark:text-white/40">
                    아직 구독한 블로그가 없습니다
                </p>
                <a
                    href="/"
                    className="mt-4 block text-center text-sm text-black/60 underline hover:text-black dark:text-white/60 dark:hover:text-white"
                >
                    새로운 블로그 찾아보기
                </a>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-black/10 dark:border-white/10">
            <h3 className="px-4 pt-4 pb-2 text-sm font-semibold text-black/50 dark:text-white/50">
                구독중인 블로그
            </h3>
            <div className="divide-y divide-black/10 dark:divide-white/10">
                {blogs.map((blog) => {
                    const imageUrl = getBlogImageUrl(blog.thumbnail_url, blog.profile_image_url)

                    return (
                        <a
                            key={blog.id}
                            href={`/blog/${blog.id}`}
                            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                        >
                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={blog.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-medium text-black/40 dark:text-white/40">
                                        {blog.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-black dark:text-white">
                                    {blog.name}
                                </p>
                                {blog.description && (
                                    <p className="mt-0.5 truncate text-xs text-black/50 dark:text-white/50">
                                        {blog.description}
                                    </p>
                                )}
                            </div>
                        </a>
                    )
                })}
            </div>
        </div>
    )
}
