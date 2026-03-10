'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  FileText, Eye, TrendingUp, PenSquare,
  Plus, Search, ExternalLink, LogOut,
  Pencil, Trash2, Stethoscope
} from 'lucide-react'

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

  useEffect(() => { fetchArticles() }, [page, search])

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

  const published = articles.filter(a => a.isPublished).length
  const drafts = articles.filter(a => !a.isPublished).length
  const totalViews = articles.reduce((s, a) => s + a.viewCount, 0)

  const stats = [
    { label: 'Всего статей', value: total, icon: FileText, color: 'text-blue-600' },
    { label: 'Опубликовано', value: published, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Черновики', value: drafts, icon: PenSquare, color: 'text-orange-600' },
    { label: 'Просмотров', value: totalViews.toLocaleString('ru-RU'), icon: Eye, color: 'text-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar + main layout */}
      <div className="flex h-screen overflow-hidden">

        {/* Sidebar */}
        <aside className="hidden md:flex w-60 flex-col bg-card border-r border-border">
          <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">ДентаМед</p>
              <p className="text-xs text-muted-foreground">Панель управления</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-accent text-accent-foreground"
            >
              <FileText className="h-4 w-4" />
              Статьи
            </Link>
          </nav>

          <div className="px-3 py-4 border-t border-border space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Открыть сайт
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {/* Top bar */}
          <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
            <h1 className="text-lg font-semibold">Статьи</h1>
            <Button asChild size="sm">
              <Link href="/admin/articles/new">
                <Plus className="h-4 w-4" />
                Новая статья
              </Link>
            </Button>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map(stat => (
                <Card key={stat.label}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold mt-0.5">{stat.value}</p>
                      </div>
                      <div className={`rounded-lg p-2.5 bg-muted ${stat.color}`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск статьи..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>

            {/* Table */}
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Все статьи</CardTitle>
              </CardHeader>
              <Separator className="mt-4" />
              {loading ? (
                <CardContent className="py-20 text-center text-muted-foreground">
                  <div className="animate-pulse">Загрузка...</div>
                </CardContent>
              ) : articles.length === 0 ? (
                <CardContent className="py-20 text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-3">Статей пока нет</p>
                  <Button asChild size="sm">
                    <Link href="/admin/articles/new">Создать первую</Link>
                  </Button>
                </CardContent>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Заголовок</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Категория</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Статус</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Просмотры</th>
                        <th className="text-right text-xs font-medium text-muted-foreground px-6 py-3">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {articles.map(article => (
                        <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-sm line-clamp-1">{article.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{article.slug}</p>
                          </td>
                          <td className="px-4 py-4 hidden md:table-cell">
                            {article.category && (
                              <Badge variant="secondary">{article.category.title}</Badge>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <button onClick={() => togglePublish(article.slug, article.isPublished)}>
                              <Badge variant={article.isPublished ? 'success' : 'secondary'}>
                                {article.isPublished ? 'Опубликовано' : 'Черновик'}
                              </Badge>
                            </button>
                          </td>
                          <td className="px-4 py-4 hidden lg:table-cell text-sm text-muted-foreground">
                            {article.viewCount.toLocaleString('ru-RU')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/admin/articles/${article.slug}`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => deleteArticle(article.slug)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {total > 15 && (
                <CardContent className="pt-4 flex justify-center gap-1">
                  {Array.from({ length: Math.ceil(total / 15) }, (_, i) => i + 1).map(p => (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setPage(p)}
                      className="h-9 w-9 text-sm"
                    >
                      {p}
                    </Button>
                  ))}
                </CardContent>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
