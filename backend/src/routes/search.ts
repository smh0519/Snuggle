import { Router, Request, Response } from 'express'
import { supabase } from '../services/supabase.service.js'
import { logger } from '../utils/logger.js'

const router = Router()

// Types for search results
interface BlogSearchResult {
  id: string
  name: string
  description: string | null
  thumbnail_url: string | null
  user_id: string
  created_at: string | null
}

interface ProfileBasic {
  id: string
  nickname: string | null
  profile_image_url: string | null
}

// 글 검색 - N+1 문제 해결
router.get('/posts', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string) || ''
    const limit = parseInt(req.query.limit as string) || 20
    const offset = parseInt(req.query.offset as string) || 0

    if (!query.trim()) {
      res.json([])
      return
    }

    const searchQuery = `%${query.trim()}%`

    // relation join으로 N+1 문제 해결
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id, title, content, thumbnail_url, created_at, blog_id,
        blog:blogs ( id, name, thumbnail_url )
      `)
      .eq('is_private', false)
      .or(`title.ilike.${searchQuery},content.ilike.${searchQuery}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    // Transform response
    const result = (posts || []).map((post: Record<string, unknown>) => {
      const blogData = post.blog as Record<string, unknown> | null
      return {
        id: post.id,
        title: post.title,
        content: post.content,
        thumbnail_url: post.thumbnail_url,
        created_at: post.created_at,
        blog_id: post.blog_id,
        blog: blogData ? {
          id: blogData.id,
          name: blogData.name,
          thumbnail_url: blogData.thumbnail_url,
        } : null,
      }
    })

    res.json(result)
  } catch (error) {
    logger.error('Search posts error:', error)
    res.status(500).json({ error: 'Failed to search posts' })
  }
})

// 블로그 검색
router.get('/blogs', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string) || ''
    const limit = parseInt(req.query.limit as string) || 20
    const offset = parseInt(req.query.offset as string) || 0

    if (!query.trim()) {
      res.json([])
      return
    }

    const searchQuery = `%${query.trim()}%`

    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('id, name, description, thumbnail_url, user_id, created_at')
      .or(`name.ilike.${searchQuery},description.ilike.${searchQuery}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    // 프로필 정보 가져오기 (단일 쿼리로 최적화)
    const userIds = ((blogs as BlogSearchResult[]) || []).map((b) => b.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nickname, profile_image_url')
      .in('id', userIds)

    const profileMap = new Map<string, ProfileBasic>(
      ((profiles as ProfileBasic[]) || []).map((p) => [p.id, p])
    )

    const blogsWithProfiles = ((blogs as BlogSearchResult[]) || []).map((blog) => ({
      ...blog,
      profile: profileMap.get(blog.user_id) || null,
    }))

    res.json(blogsWithProfiles)
  } catch (error) {
    logger.error('Search blogs error:', error)
    res.status(500).json({ error: 'Failed to search blogs' })
  }
})

// 검색어 자동완성 추천
router.get('/suggest', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string) || ''

    if (!query.trim() || query.trim().length < 2) {
      res.json({ posts: [], blogs: [], categories: [] })
      return
    }

    const searchQuery = `%${query.trim()}%`

    // 병렬로 3개 테이블 조회
    const [postsResult, blogsResult, categoriesResult] = await Promise.all([
      supabase
        .from('posts')
        .select('id, title, blog_id')
        .eq('is_private', false)
        .ilike('title', searchQuery)
        .order('created_at', { ascending: false })
        .limit(5),

      supabase
        .from('blogs')
        .select('id, name, thumbnail_url')
        .ilike('name', searchQuery)
        .order('created_at', { ascending: false })
        .limit(3),

      supabase
        .from('categories')
        .select('id, name, blog_id')
        .ilike('name', searchQuery)
        .limit(3),
    ])

    res.json({
      posts: postsResult.data || [],
      blogs: blogsResult.data || [],
      categories: categoriesResult.data || [],
    })
  } catch (error) {
    logger.error('Search suggest error:', error)
    res.status(500).json({ error: 'Failed to get suggestions' })
  }
})

export default router
