import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/articles — список статей (публичный + фильтры для админки)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10')
  const categorySlug = searchParams.get('category')
  const isAdmin = searchParams.get('admin') === 'true'
  const search = searchParams.get('search') ?? ''

  const where = {
    ...(!isAdmin && { isPublished: true }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { excerpt: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        ogImageUrl: true,
        isPublished: true,
        publishedAt: true,
        viewCount: true,
        createdAt: true,
        category: { select: { id: true, title: true, slug: true, color: true } },
        author: { select: { id: true, name: true, specialty: true, avatarUrl: true } },
      },
    }),
    prisma.article.count({ where }),
  ])

  return NextResponse.json({
    data: articles,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

// POST /api/articles — создать статью (только для админа)
export async function POST(req: NextRequest) {
  const authError = await requireAuth(req)
  if (authError) return authError

  const body = await req.json()
  const {
    title, slug, content, excerpt,
    metaTitle, metaDescription, ogImageUrl,
    authorId, categoryId, tagIds,
    isPublished,
  } = body

  if (!title || !slug || !content || !authorId || !categoryId) {
    return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 })
  }

  // Проверка уникальности slug
  const existing = await prisma.article.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Статья с таким slug уже существует' }, { status: 400 })
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      metaTitle,
      metaDescription,
      ogImageUrl,
      authorId,
      categoryId,
      isPublished: isPublished ?? false,
      publishedAt: isPublished ? new Date() : null,
      tags: tagIds?.length
        ? { create: tagIds.map((tagId: string) => ({ tagId })) }
        : undefined,
    },
    include: { author: true, category: true, tags: { include: { tag: true } } },
  })

  return NextResponse.json({ data: article }, { status: 201 })
}
