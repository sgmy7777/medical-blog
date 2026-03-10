import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { title: 'asc' },
    include: { _count: { select: { articles: { where: { isPublished: true } } } } },
  })
  return NextResponse.json({ data: categories })
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req)
  if (authError) return authError

  const { title, slug, description, color } = await req.json()

  if (!title || !slug) {
    return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 })
  }

  const category = await prisma.category.create({
    data: { title, slug, description, color },
  })

  return NextResponse.json({ data: category }, { status: 201 })
}
