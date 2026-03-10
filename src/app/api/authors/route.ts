import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const authors = await prisma.author.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ data: authors })
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req)
  if (authError) return authError

  const { name, specialty, bio, avatarUrl, diplomaPhotoUrl, slug } = await req.json()

  if (!name || !specialty || !slug) {
    return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 })
  }

  const author = await prisma.author.create({
    data: { name, specialty, bio, avatarUrl, diplomaPhotoUrl, slug },
  })

  return NextResponse.json({ data: author }, { status: 201 })
}
