'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Category { id: string; title: string }
interface Author { id: string; name: string }

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[а-яё]/g, char => {
      const map: Record<string, string> = {
        а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',
        и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',
        с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',
        ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'
      }
      return map[char] ?? char
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function ArticleEditor() {
  const router = useRouter()
  const params = useParams()
  const isNew = params?.slug === 'new'

  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content')

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    ogImageUrl: '',
    authorId: '',
    categoryId: '',
    isPublished: false,
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/authors').then(r => r.json()),
    ]).then(([cats, auths]) => {
      setCategories(cats.data ?? [])
      setAuthors(auths.data ?? [])
    })

    if (!isNew) {
      fetch(`/api/articles/${params?.slug}?admin=true`)
        .then(r => r.json())
        .then(json => {
          if (json.data) setForm({ ...json.data, isPublished: json.data.isPublished })
        })
    }
  }, [])

  function handleTitle(value: string) {
    setForm(f => ({
      ...f,
      title: value,
      slug: isNew ? slugify(value) : f.slug,
      metaTitle: isNew ? value : f.metaTitle,
    }))
  }

  async function save(publish?: boolean) {
    setSaving(true)
    const body = { ...form, isPublished: publish ?? form.isPublished }
    const method = isNew ? 'POST' : 'PUT'
    const url = isNew ? '/api/articles' : `/api/articles/${params?.slug}`

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const json = await res.json()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      if (isNew) router.push(`/admin/articles/${json.data.slug}`)
    }
    setSaving(false)
  }

  const charCount = form.metaDescription.length

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Admin header */}
      <header className="bg-[#1C1917] text-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="text-[#A8A29E] hover:text-white text-sm transition-colors"
            >
              ← Назад
            </button>
            <span className="text-[#57534E]">/</span>
            <span className="text-sm">{isNew ? 'Новая статья' : 'Редактирование'}</span>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-[#4ADE80] text-sm">✓ Сохранено</span>
            )}
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="text-sm bg-[#292524] hover:bg-[#44403C] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Черновик
            </button>
            <button
              onClick={() => save(true)}
              disabled={saving}
              className="text-sm bg-[#1A6B4A] hover:bg-[#155C3E] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Опубликовать'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main editor */}
          <div className="space-y-5">
            {/* Title */}
            <div className="bg-white rounded-xl border border-[#E8E4DC] p-6">
              <input
                type="text"
                placeholder="Заголовок статьи..."
                value={form.title}
                onChange={e => handleTitle(e.target.value)}
                className="w-full text-2xl font-bold text-[#1C1917] placeholder-[#D6D3CD] focus:outline-none"
              />
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F7F5F0]">
                <span className="text-xs text-[#A8A29E]">Slug:</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="text-xs text-[#78716C] bg-[#F7F5F0] px-2 py-1 rounded focus:outline-none flex-1 font-mono"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl border border-[#E8E4DC] p-1">
              {(['content', 'seo'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab
                      ? 'bg-[#1A6B4A] text-white'
                      : 'text-[#78716C] hover:bg-[#F7F5F0]'
                  }`}
                >
                  {tab === 'content' ? '📝 Контент' : '🔍 SEO'}
                </button>
              ))}
            </div>

            {activeTab === 'content' && (
              <>
                {/* Excerpt */}
                <div className="bg-white rounded-xl border border-[#E8E4DC] p-5">
                  <label className="text-xs font-semibold text-[#78716C] block mb-2">КРАТКОЕ ОПИСАНИЕ</label>
                  <textarea
                    placeholder="2-3 предложения для превью статьи..."
                    value={form.excerpt}
                    onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                    rows={3}
                    className="w-full text-sm text-[#1C1917] placeholder-[#D6D3CD] focus:outline-none resize-none"
                  />
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl border border-[#E8E4DC] p-5">
                  <label className="text-xs font-semibold text-[#78716C] block mb-2">СОДЕРЖАНИЕ СТАТЬИ</label>
                  <textarea
                    placeholder="Вставьте текст от ИИ и отредактируйте как эксперт...&#10;&#10;Поддерживается HTML разметка."
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    rows={25}
                    className="w-full text-sm text-[#1C1917] placeholder-[#D6D3CD] focus:outline-none resize-none font-mono leading-relaxed"
                  />
                </div>
              </>
            )}

            {activeTab === 'seo' && (
              <div className="bg-white rounded-xl border border-[#E8E4DC] p-5 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-[#78716C] block mb-2">SEO ЗАГОЛОВОК (meta title)</label>
                  <input
                    type="text"
                    placeholder="Заголовок для поисковиков..."
                    value={form.metaTitle}
                    onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))}
                    className="w-full border border-[#E8E4DC] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A6B4A]"
                  />
                  <div className={`text-xs mt-1 ${form.metaTitle.length > 60 ? 'text-[#DC2626]' : 'text-[#A8A29E]'}`}>
                    {form.metaTitle.length}/60 символов (рекомендовано)
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#78716C] block mb-2">SEO ОПИСАНИЕ (meta description)</label>
                  <textarea
                    placeholder="Описание для поисковиков..."
                    value={form.metaDescription}
                    onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                    rows={3}
                    className="w-full border border-[#E8E4DC] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A6B4A] resize-none"
                  />
                  <div className={`text-xs mt-1 ${charCount > 160 ? 'text-[#DC2626]' : 'text-[#A8A29E]'}`}>
                    {charCount}/160 символов (рекомендовано)
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#78716C] block mb-2">ИЗОБРАЖЕНИЕ (URL для OG)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.ogImageUrl}
                    onChange={e => setForm(f => ({ ...f, ogImageUrl: e.target.value }))}
                    className="w-full border border-[#E8E4DC] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A6B4A]"
                  />
                </div>

                {/* SEO Preview */}
                <div className="border border-[#E8E4DC] rounded-lg p-4 bg-[#F7F5F0]">
                  <div className="text-xs text-[#A8A29E] mb-2">Предпросмотр в Яндексе:</div>
                  <div className="text-[#1A0DAB] text-base font-medium line-clamp-1">
                    {form.metaTitle || form.title || 'Заголовок статьи'}
                  </div>
                  <div className="text-[#006621] text-xs">yourdomain.ru/article/{form.slug || 'url-stati'}</div>
                  <div className="text-[#545454] text-sm mt-1 line-clamp-2">
                    {form.metaDescription || form.excerpt || 'Описание статьи появится здесь...'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar settings */}
          <div className="space-y-4">
            {/* Publish settings */}
            <div className="bg-white rounded-xl border border-[#E8E4DC] p-5">
              <h3 className="text-sm font-semibold text-[#1C1917] mb-4">Публикация</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#57534E]">Опубликовать</span>
                <button
                  onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    form.isPublished ? 'bg-[#1A6B4A]' : 'bg-[#D6D3CD]'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form.isPublished ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl border border-[#E8E4DC] p-5">
              <label className="text-xs font-semibold text-[#78716C] block mb-2">КАТЕГОРИЯ</label>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full border border-[#E8E4DC] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A6B4A] bg-white"
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div className="bg-white rounded-xl border border-[#E8E4DC] p-5">
              <label className="text-xs font-semibold text-[#78716C] block mb-2">АВТОР</label>
              <select
                value={form.authorId}
                onChange={e => setForm(f => ({ ...f, authorId: e.target.value }))}
                className="w-full border border-[#E8E4DC] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A6B4A] bg-white"
              >
                <option value="">Выберите автора</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>{author.name}</option>
                ))}
              </select>
            </div>

            {/* Preview link */}
            {!isNew && (
              <a
                href={`/article/${form.slug}`}
                target="_blank"
                className="block w-full text-center border border-[#E8E4DC] text-[#57534E] py-2.5 rounded-xl text-sm hover:bg-[#F7F5F0] transition-colors"
              >
                ↗ Открыть статью
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
