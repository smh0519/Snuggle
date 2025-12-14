'use client'

interface FeedHeaderProps {
    followingCount: number
    followersCount: number
}

export default function FeedHeader({ followingCount, followersCount }: FeedHeaderProps) {
    return (
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-black dark:text-white">
                피드
            </h1>
            <p className="mt-1 text-sm text-black/50 dark:text-white/50">
                구독한 블로그의 새로운 글
            </p>

            {/* Stats */}
            <div className="mt-4 flex gap-6">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-black dark:text-white">
                        {followingCount}
                    </span>
                    <span className="text-sm text-black/50 dark:text-white/50">
                        구독중
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-black dark:text-white">
                        {followersCount}
                    </span>
                    <span className="text-sm text-black/50 dark:text-white/50">
                        구독자
                    </span>
                </div>
            </div>
        </div>
    )
}
