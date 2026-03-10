'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      const json = await res.json()
      setError(json.error ?? 'Ошибка входа')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1A6B4A] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">Д</span>
          </div>
          <h1 className="text-xl font-bold text-[#1C1917]">Панель управления</h1>
          <p className="text-sm text-[#78716C] mt-1">ДентаМед</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#78716C] block mb-1.5">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full border border-[#E8E4DC] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A6B4A]"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#78716C] block mb-1.5">ПАРОЛЬ</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[#E8E4DC] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A6B4A]"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && (
            <div className="text-sm text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full bg-[#1A6B4A] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#155C3E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </div>
      </div>
    </div>
  )
}
