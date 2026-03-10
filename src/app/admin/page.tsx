'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  slug: string
  isPublished: boolean
  publishedAt: string | null
  viewCount: number
  category: { title: string; color?: string }
  createdAt: string
}

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchArticles()
  }, [page, search])

  async function fetchArticles() {
    setLoading(true)
    const params = new URLSearchParams({
      admin: 'true',
      page: page.toString(),
      pageSize: '15',
      ...(search && { search }),
    })
    const res = await fetch(`/api/articles?${params}`)
    const json = await res.json()
    setArticles(json.data ?? [])
    setTotal(json.total ?? 0)
    setLoading(false)
  }

  async function togglePublish(slug: string, current: boolean) {
    await fetch(`/api/articles/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !current }),
    })
    fetchArticles()
  }

  async function deleteArticle(slug: string) {
    if (!confirm('Удалить статью?')) return
    await fetch(`/api/articles/${slug}`, { method: 'DELETE' })
    fetchArticles()
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Admin header */}
      <header className="bg-[#1C1917] text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#1A6B4A] rounded-lg flex items-center justify-center text-sm font-bold">
              Д
            </div>
            <span className="font-semibold">Панель управления</span>
            <nav className="hidden md:flex items-center gap-4 text-sm text-[#A8A29E] ml-4">
              <Link href="/admin" className="text-white">Статьи</Link>
              <Link href="/admin/categories" className="hover:text-white transition-colors">Категории</Link>
              <Link href="/" target="_blank" className="hover:text-white transition-colors">
                ↗ Сайт
              </Link>
            </nav>
          </div>
          <button
            onClick={logout}
            className="text-sm text-[#A8A29E] hover:text-white transition-colors"
          >
            Выйти
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Всего статей', value: total },
            { label: 'Опубликовано', value: articles.filter(a => a.isPublished).length },
            { label: 'Черновики', value: articles.filter(a => !a.isPublished).length },
            { label: 'Просмотров', value: articles.reduce((s, a) => s + a.viewCount, 0).toLocaleString('ru-RU') },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E8E4DC] p-4">
              <div className="text-2xl font-bold text-[#1C1917]">{stat.value}</div>
              <div className="text-sm text-[#78716C]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          <input
            type="text"
            placeholder="Поиск статьи..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="flex-1 bg-white border border-[#E8E4DC] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A6B4A]"
          />
          <Link
            href="/admin/articles/new"
            className="bg-[#1A6B4A] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#155C3E] transition-colors whitespace-nowrap"
          >
            + Новая статья
          </Link>
        </div>

        {/* Articles table */}
        <div className="bg-white rounded-xl border border-[#E8E4DC] overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-[#A8A29E]">Загрузка...</div>
          ) : articles.length === 0 ? (
            <div className="py-20 text-center text-[#A8A29E]">
              <div className="text-4xl mb-3">📝</div>
              <div>Статей пока нет</div>
              <Link href="/admin/articles/new" className="text-[#1A6B4A] text-sm mt-2 inline-block hover:underline">
                Создать первую статью →
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#F7F5F0] border-b border-[#E8E4DC]">
                <tr>
                  <th className="text-left text-xs font-semibold text-[#78716C] px-5 py-3">Заголовок</th>
                  <th className="text-left text-xs font-semibold text-[#78716C] px-3 py-3 hidden md:table-cell">Категория</th>
                  <th className="text-left text-xs font-semibold text-[#78716C] px-3 py-3">Статус</th>
                  <th className="text-left text-xs font-semibold text-[#78716C] px-3 py-3 hidden md:table-cell">Просмотры</th>
                  <th className="text-left text-xs font-semibold text-[#78716C] px-3 py-3">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F5F0]">
                {articles.map(article => (
                  <tr key={article.id} className="hover:bg-[#FAFAF9] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-[#1C1917] text-sm line-clamp-1">{article.title}</div>
                      <div className="text-xs text-[#A8A29E] mt-0.5">{article.slug}</div>
                    </td>
                    <td className="px-3 py-4 hidden md:table-cell">
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: article.category?.color ? `${article.category.color}20` : '#DCFCE7',
                          color: article.category?.color ?? '#166534',
                        }}
                      >
                        {article.category?.title}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <button
                        onClick={() => togglePublish(article.slug, article.isPublished)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                          article.isPublished
                            ? 'bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]'
                            : 'bg-[#F7F5F0] text-[#78716C] hover:bg-[#E8E4DC]'
                        }`}
                      >
                        {article.isPublished ? '● Опубликовано' : '○ Черновик'}
                      </button>
                    </td>
                    <td className="px-3 py-4 hidden md:table-cell text-sm text-[#78716C]">
                      {article.viewCount.toLocaleString('ru-RU')}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/articles/${article.slug}`}
                          className="text-xs text-[#1A6B4A] hover:underline"
                        >
                          Редакт.
                        </Link>
                        <button
                          onClick={() => deleteArticle(article.slug)}
                          className="text-xs text-[#DC2626] hover:underline"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div className="flex justify-center gap-2 mt-5">
            {Array.from({ length: Math.ceil(total / 15) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-[#1A6B4A] text-white'
                    : 'bg-white border border-[#E8E4DC] text-[#57534E] hover:bg-[#F7F5F0]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
