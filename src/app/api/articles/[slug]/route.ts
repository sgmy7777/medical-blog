import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

type RouteContext = { params: Promise<{ slug: string }> }

// GET /api/articles/[slug]
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { slug } = await params

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: true,
      category: true,
      tags: { include: { tag: true } },
    },
  })

  if (!article) {
    return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 })
  }

  if (article.isPublished) {
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    })
  }

  return NextResponse.json({ data: article })
}

// PUT /api/articles/[slug]
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const authError = await requireAuth(req)
  if (authError) return authError

  const { slug } = await params
  const body = await req.json()
  const {
    title, slug: newSlug, content, excerpt,
    metaTitle, metaDescription, ogImageUrl,
    authorId, categoryId, tagIds,
    isPublished,
  } = body

  const existing = await prisma.article.findUnique({ where: { slug } })
  if (!existing) {
    return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 })
  }

  await prisma.articleTag.deleteMany({ where: { articleId: existing.id } })

  const article = await prisma.article.update({
    where: { slug },
    data: {
      title,
      slug: newSlug,
      content,
      excerpt,
      metaTitle,
      metaDescription,
      ogImageUrl,
      authorId,
      categoryId,
      isPublished,
      publishedAt: isPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
      tags: tagIds?.length
        ? { create: tagIds.map((tagId: string) => ({ tagId })) }
        : undefined,
    },
    include: { author: true, category: true, tags: { include: { tag: true } } },
  })

  return NextResponse.json({ data: article })
}

// DELETE /api/articles/[slug]
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const authError = await requireAuth(req)
  if (authError) return authError

  const { slug } = await params
  await prisma.article.delete({ where: { slug } })
  return NextResponse.json({ data: { success: true } })
}
