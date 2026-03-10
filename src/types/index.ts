export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  metaTitle?: string
  metaDescription?: string
  ogImageUrl?: string
  authorId: string
  author?: Author
  categoryId: string
  category?: Category
  tags?: Tag[]
  isPublished: boolean
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  viewCount: number
}

export interface Author {
  id: string
  name: string
  specialty: string
  bio?: string
  avatarUrl?: string
  diplomaPhotoUrl?: string
  slug: string
}

export interface Category {
  id: string
  title: string
  slug: string
  description?: string
  color?: string
}

export interface Tag {
  id: string
  title: string
  slug: string
}

export interface ArticleListItem {
  id: string
  title: string
  slug: string
  excerpt?: string
  ogImageUrl?: string
  category: Category
  author: Author
  publishedAt?: Date | null
  viewCount: number
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
