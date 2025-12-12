'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function CreateBlogPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      // 이미 블로그가 있는지 확인
      const { data: blog } = await supabase
        .from('blogs')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (blog) {
        router.push('/')
        return
      }

      setUser(user)
      setCheckingAuth(false)
    }

    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('블로그 이름을 입력해주세요')
      return
    }

    if (!user) return

    setLoading(true)
    setError('')

    const supabase = createClient()

    const { error: insertError } = await supabase
      .from('blogs')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
      })

    if (insertError) {
      setError('블로그 생성에 실패했습니다')
      setLoading(false)
      return
    }

    router.push('/')
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black dark:border-white/20 dark:border-t-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="mx-auto max-w-lg px-6 py-20">
        <button
          onClick={() => router.back()}
          className="mb-8 text-sm text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
        >
          ← 돌아가기
        </button>

        <h1 className="text-3xl font-bold text-black dark:text-white">
          블로그 만들기
        </h1>
        <p className="mt-2 text-black/50 dark:text-white/50">
          나만의 블로그를 시작해보세요
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white">
              블로그 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="나의 블로그"
              className="mt-2 w-full border-b border-black/20 bg-transparent py-3 text-lg text-black outline-none focus:border-black dark:border-white/20 dark:text-white dark:focus:border-white"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white">
              블로그 소개
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="블로그를 소개해주세요 (선택)"
              rows={3}
              className="mt-2 w-full resize-none border-b border-black/20 bg-transparent py-3 text-black outline-none focus:border-black dark:border-white/20 dark:text-white dark:focus:border-white"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-black py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {loading ? '생성 중...' : '블로그 만들기'}
          </button>
        </form>
      </div>
    </div>
  )
}
