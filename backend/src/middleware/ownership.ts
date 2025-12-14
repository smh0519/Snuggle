import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from './auth.js'
import { supabase } from '../services/supabase.service.js'
import { ApiError, ErrorCodes } from '../types/database.types.js'
import { logger } from '../utils/logger.js'

/**
 * 블로그 소유권 검증 미들웨어
 * req.params.blogId 또는 req.body.blog_id를 사용하여 소유권 확인
 */
export async function checkBlogOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user
    if (!user) {
      const error: ApiError = {
        code: ErrorCodes.NO_TOKEN,
        message: 'Authentication required'
      }
      res.status(401).json(error)
      return
    }

    const blogId = req.params.blogId || req.body.blog_id
    if (!blogId) {
      const error: ApiError = {
        code: ErrorCodes.MISSING_REQUIRED_FIELD,
        message: 'Blog ID is required'
      }
      res.status(400).json(error)
      return
    }

    const { data: blog, error: dbError } = await supabase
      .from('blogs')
      .select('user_id')
      .eq('id', blogId)
      .single()

    if (dbError || !blog) {
      const error: ApiError = {
        code: ErrorCodes.NOT_FOUND,
        message: 'Blog not found'
      }
      res.status(404).json(error)
      return
    }

    if (blog.user_id !== user.id) {
      const error: ApiError = {
        code: ErrorCodes.NOT_OWNER,
        message: 'You are not the owner of this blog'
      }
      res.status(403).json(error)
      return
    }

    // 블로그 정보를 request에 첨부 (중복 조회 방지)
    req.blog = blog
    next()
  } catch (error) {
    logger.error('Blog ownership check error:', error)
    const apiError: ApiError = {
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'Failed to verify blog ownership'
    }
    res.status(500).json(apiError)
  }
}

/**
 * 게시글 소유권 검증 미들웨어
 * req.params.id를 사용하여 게시글 소유권 확인
 */
export async function checkPostOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user
    if (!user) {
      const error: ApiError = {
        code: ErrorCodes.NO_TOKEN,
        message: 'Authentication required'
      }
      res.status(401).json(error)
      return
    }

    const postId = req.params.id
    if (!postId) {
      const error: ApiError = {
        code: ErrorCodes.MISSING_REQUIRED_FIELD,
        message: 'Post ID is required'
      }
      res.status(400).json(error)
      return
    }

    const { data: post, error: dbError } = await supabase
      .from('posts')
      .select('user_id, blog_id')
      .eq('id', postId)
      .single()

    if (dbError || !post) {
      const error: ApiError = {
        code: ErrorCodes.NOT_FOUND,
        message: 'Post not found'
      }
      res.status(404).json(error)
      return
    }

    if (post.user_id !== user.id) {
      const error: ApiError = {
        code: ErrorCodes.NOT_OWNER,
        message: 'You are not the owner of this post'
      }
      res.status(403).json(error)
      return
    }

    // 게시글 정보를 request에 첨부
    req.post = post
    next()
  } catch (error) {
    logger.error('Post ownership check error:', error)
    const apiError: ApiError = {
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'Failed to verify post ownership'
    }
    res.status(500).json(apiError)
  }
}

/**
 * 포럼 소유권 검증 미들웨어
 */
export async function checkForumOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user
    if (!user) {
      const error: ApiError = {
        code: ErrorCodes.NO_TOKEN,
        message: 'Authentication required'
      }
      res.status(401).json(error)
      return
    }

    const forumId = req.params.id
    if (!forumId) {
      const error: ApiError = {
        code: ErrorCodes.MISSING_REQUIRED_FIELD,
        message: 'Forum ID is required'
      }
      res.status(400).json(error)
      return
    }

    const { data: forum, error: dbError } = await supabase
      .from('forums')
      .select('user_id')
      .eq('id', forumId)
      .single()

    if (dbError || !forum) {
      const error: ApiError = {
        code: ErrorCodes.NOT_FOUND,
        message: 'Forum not found'
      }
      res.status(404).json(error)
      return
    }

    if (forum.user_id !== user.id) {
      const error: ApiError = {
        code: ErrorCodes.NOT_OWNER,
        message: 'You are not the owner of this forum'
      }
      res.status(403).json(error)
      return
    }

    req.forum = forum
    next()
  } catch (error) {
    logger.error('Forum ownership check error:', error)
    const apiError: ApiError = {
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'Failed to verify forum ownership'
    }
    res.status(500).json(apiError)
  }
}

// Request 타입 확장
declare module './auth.js' {
  interface AuthenticatedRequest {
    blog?: { user_id: string }
    post?: { user_id: string; blog_id: string }
    forum?: { user_id: string }
  }
}
