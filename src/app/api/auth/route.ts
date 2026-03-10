import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Введите email и пароль' }, { status: 400 })
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } })
  if (!admin) {
    return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
  }

  const isValid = await bcrypt.compare(password, admin.password)
  if (!isValid) {
    return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
  }

  const token = await signToken({ adminId: admin.id, email: admin.email })

  const response = NextResponse.json({ data: { success: true } })
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 дней
    path: '/',
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ data: { success: true } })
  response.cookies.delete('admin_token')
  return response
}
