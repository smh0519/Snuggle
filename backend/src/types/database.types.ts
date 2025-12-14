// Supabase Database Types

export interface Profile {
  id: string
  email: string | null
  kakao_id: string | null
  nickname: string | null
  profile_image_url: string | null
  created_at: string | null
  updated_at: string | null
  sub_total_count: number
  kakao_profile_url: string | null
  deleted_at: string | null
}

export interface Blog {
  id: string
  user_id: string
  name: string
  description: string | null
  thumbnail_url: string | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

export interface Post {
  id: string
  blog_id: string
  user_id: string
  title: string
  content: string | null
  thumbnail_url: string | null
  published: boolean
  created_at: string | null
  updated_at: string | null
  category_id: string | null
  is_private: boolean
  is_allow_comment: boolean
  like_count: number
  view_count: number
}

export interface Category {
  id: string
  blog_id: string | null
  name: string
  created_at: string | null
}

export interface PostCategory {
  id: string
  post_id: string
  category_id: string
  created_at: string | null
}

export interface BlogSkin {
  id: string
  name: string
  description: string | null
  thumbnail_url: string | null
  creator_id: string | null
  is_system: boolean
  is_public: boolean
  css_variables: Record<string, unknown>
  layout_config: Record<string, unknown> | null
  created_at: string | null
  is_default: boolean
}

export interface BlogSkinApplication {
  id: string
  blog_id: string | null
  skin_id: string | null
  custom_css_variables: Record<string, unknown> | null
  custom_layout_config: Record<string, unknown> | null
  updated_at: string | null
}

export interface Subscribe {
  subed_id: string
  sub_id: string
  sub_date: string
}

export interface UserSkinLibrary {
  id: string
  user_id: string | null
  skin_id: string | null
  downloaded_at: string | null
}

export interface Forum {
  id: string
  title: string
  description: string
  user_id: string
  blog_id: string
  category_id: string | null
  created_at: string
  updated_at: string
  view_count: number
}

export interface ForumComment {
  id: string
  forum_id: string
  user_id: string
  blog_id: string
  content: string
  parent_id: string | null
  created_at: string
  updated_at: string
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  comment_text: string
  created_at: string
  parent_id: string | null
}

// API Response Types
export interface PostWithBlog extends Post {
  blog: Pick<Blog, 'name' | 'thumbnail_url'> | null
}

export interface PostWithDetails extends Post {
  blog: Pick<Blog, 'id' | 'user_id' | 'name' | 'thumbnail_url'> | null
  category: Pick<Category, 'id' | 'name'> | null
  profile: Pick<Profile, 'id' | 'nickname' | 'profile_image_url'> | null
}

export interface ForumWithDetails extends Forum {
  blog: Pick<Blog, 'name' | 'thumbnail_url'> | null
  comment_count: number
}

export interface BlogWithProfile extends Blog {
  profile: Pick<Profile, 'id' | 'nickname' | 'profile_image_url'> | null
}

// API Error Response
export interface ApiError {
  code: string
  message: string
  details?: unknown
}

// API Error Codes
export const ErrorCodes = {
  // Authentication Errors (1xxx)
  NO_TOKEN: 'AUTH_1001',
  INVALID_TOKEN: 'AUTH_1002',
  TOKEN_EXPIRED: 'AUTH_1003',

  // Authorization Errors (2xxx)
  NOT_AUTHORIZED: 'AUTH_2001',
  NOT_OWNER: 'AUTH_2002',

  // Validation Errors (3xxx)
  MISSING_REQUIRED_FIELD: 'VAL_3001',
  INVALID_FORMAT: 'VAL_3002',
  DUPLICATE_ENTRY: 'VAL_3003',

  // Resource Errors (4xxx)
  NOT_FOUND: 'RES_4001',
  ALREADY_EXISTS: 'RES_4002',

  // Server Errors (5xxx)
  INTERNAL_ERROR: 'SRV_5001',
  DATABASE_ERROR: 'SRV_5002',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]
