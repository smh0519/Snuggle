'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Blog {
  id: string
  user_id: string
  name: string
  description: string | null
  thumbnail_url: string | null
}

interface Category {
  id: string
  name: string
  blog_id: string
}

interface Post {
  id: string
  title: string
  published: boolean
  created_at: string
}

export default function BlogSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const blogId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<User | null>(null)
  const [blog, setBlog] = useState<Blog | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'categories' | 'posts'>('profile')

  // 프로필 수정 상태
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // 카테고리 추가 상태
  const [newCategory, setNewCategory] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)

      const { data: blogData, error: blogError } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', blogId)
        .single()

      if (blogError || !blogData || blogData.user_id !== user.id) {
        router.push('/')
        return
      }

      setBlog(blogData)
      setName(blogData.name)
      setDescription(blogData.description || '')
      if (blogData.thumbnail_url) {
        setImagePreview(blogData.thumbnail_url)
      }

      // 카테고리 로드
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('blog_id', blogId)
        .order('name')

      if (categoryData) {
        setCategories(categoryData)
      }

      // 글 목록 로드
      const { data: postData } = await supabase
        .from('posts')
        .select('id, title, published, created_at')
        .eq('blog_id', blogId)
        .order('created_at', { ascending: false })

      if (postData) {
        setPosts(postData)
      }

      setLoading(false)
    }

    fetchData()
  }, [blogId, router])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setMessage('JPG, PNG, WEBP 파일만 업로드할 수 있습니다')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('이미지 크기는 5MB 이하여야 합니다')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setMessage('')
  }

  const handleImageRemove = () => {
    setImageFile(null)
    setImagePreview(blog?.thumbnail_url || null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('이미지 업로드에 실패했습니다')
    }

    const data = await response.json()
    return data.url
  }

  const handleSaveProfile = async () => {
    if (!blog) return

    setSaving(true)
    setMessage('')

    try {
      let thumbnailUrl = blog.thumbnail_url

      if (imageFile) {
        thumbnailUrl = await uploadImage(imageFile)
      }

      const supabase = createClient()

      const { error } = await supabase
        .from('blogs')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          thumbnail_url: thumbnailUrl,
        })
        .eq('id', blog.id)

      if (error) throw error

      setBlog({ ...blog, name: name.trim(), description: description.trim() || null, thumbnail_url: thumbnailUrl })
      setImageFile(null)
      setMessage('저장되었습니다')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '저장에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return

    setAddingCategory(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('categories')
      .insert({
        blog_id: blogId,
        name: newCategory.trim(),
      })
      .select()
      .single()

    if (!error && data) {
      setCategories([...categories, data])
      setNewCategory('')
    }
    setAddingCategory(false)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (!error) {
      setCategories(categories.filter(c => c.id !== categoryId))
    }
  }

  const handleTogglePublish = async (postId: string, currentPublished: boolean) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('posts')
      .update({ published: !currentPublished })
      .eq('id', postId)

    if (!error) {
      setPosts(posts.map(p =>
        p.id === postId ? { ...p, published: !currentPublished } : p
      ))
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const supabase = createClient()

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (!error) {
      setPosts(posts.filter(p => p.id !== postId))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black dark:border-white/20 dark:border-t-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* 헤더 */}
      <header className="border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <a
              href={`/blog/${blogId}`}
              className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
            >
              ← 블로그로 돌아가기
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold text-black dark:text-white">블로그 설정</h1>

        {/* 탭 */}
        <div className="mt-8 flex gap-1 border-b border-black/10 dark:border-white/10">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-black text-black dark:border-white dark:text-white'
                : 'text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
            }`}
          >
            프로필
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'categories'
                ? 'border-b-2 border-black text-black dark:border-white dark:text-white'
                : 'text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
            }`}
          >
            카테고리
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'posts'
                ? 'border-b-2 border-black text-black dark:border-white dark:text-white'
                : 'text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
            }`}
          >
            글 관리
          </button>
        </div>

        {/* 프로필 탭 */}
        {activeTab === 'profile' && (
          <div className="mt-8 space-y-8">
            {/* 프로필 이미지 */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white">
                프로필 이미지
              </label>
              <div className="mt-3 flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-black/20 text-black/40 transition-colors hover:border-black/40 hover:text-black/60 dark:border-white/20 dark:text-white/40 dark:hover:border-white/40 dark:hover:text-white/60"
                  >
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="text-sm text-black/50 dark:text-white/50">
                  <p>JPG, PNG, WEBP (최대 5MB)</p>
                </div>
              </div>
            </div>

            {/* 블로그 이름 */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white">
                블로그 이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full border-b border-black/20 bg-transparent py-3 text-black outline-none focus:border-black dark:border-white/20 dark:text-white dark:focus:border-white"
              />
            </div>

            {/* 블로그 소개 */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white">
                블로그 소개
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-2 w-full resize-none border-b border-black/20 bg-transparent py-3 text-black outline-none focus:border-black dark:border-white/20 dark:text-white dark:focus:border-white"
              />
            </div>

            {message && (
              <p className={`text-sm ${message.includes('실패') ? 'text-red-500' : 'text-green-500'}`}>
                {message}
              </p>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={saving || !name.trim()}
              className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        )}

        {/* 카테고리 탭 */}
        {activeTab === 'categories' && (
          <div className="mt-8">
            {/* 카테고리 추가 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="새 카테고리 이름"
                className="flex-1 border-b border-black/20 bg-transparent py-2 text-black outline-none focus:border-black dark:border-white/20 dark:text-white dark:focus:border-white"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <button
                onClick={handleAddCategory}
                disabled={addingCategory || !newCategory.trim()}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
              >
                추가
              </button>
            </div>

            {/* 카테고리 목록 */}
            <div className="mt-6 space-y-2">
              {categories.length === 0 ? (
                <p className="py-8 text-center text-black/50 dark:text-white/50">
                  카테고리가 없습니다
                </p>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between border-b border-black/10 py-3 dark:border-white/10"
                  >
                    <span className="text-black dark:text-white">{category.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 글 관리 탭 */}
        {activeTab === 'posts' && (
          <div className="mt-8">
            {posts.length === 0 ? (
              <p className="py-8 text-center text-black/50 dark:text-white/50">
                작성된 글이 없습니다
              </p>
            ) : (
              <div className="space-y-2">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between border-b border-black/10 py-4 dark:border-white/10"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/post/${post.id}`}
                          className="truncate font-medium text-black hover:underline dark:text-white"
                        >
                          {post.title}
                        </a>
                        {!post.published && (
                          <span className="shrink-0 rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                            비공개
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-black/50 dark:text-white/50">
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePublish(post.id, post.published)}
                        className="rounded-lg px-3 py-1.5 text-sm text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/5"
                      >
                        {post.published ? '비공개로' : '공개로'}
                      </button>
                      <a
                        href={`/write?edit=${post.id}`}
                        className="rounded-lg px-3 py-1.5 text-sm text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/5"
                      >
                        수정
                      </a>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="rounded-lg px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
