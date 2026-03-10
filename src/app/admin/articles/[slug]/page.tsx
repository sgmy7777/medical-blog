'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  ArrowLeft, Save, Send, ExternalLink, CheckCircle2,
  FileText, Search, Stethoscope, AlertCircle
} from 'lucide-react'

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
  const [saveError, setSaveError] = useState('')

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

  const charCount = form.metaDescription.length

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
    setSaveError('')
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
      setTimeout(() => setSaved(false), 3000)
      if (isNew && json.data?.slug) {
        router.push(`/admin/articles/${json.data.slug}`)
      }
      if (publish !== undefined) {
        setForm(f => ({ ...f, isPublished: publish }))
      }
    } else {
      const json = await res.json()
      setSaveError(json.error ?? 'Ошибка сохранения')
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Stethoscope className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {isNew ? 'Новая статья' : 'Редактирование'}
              </span>
            </div>
            {saved && (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Сохранено
              </Badge>
            )}
            {saveError && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {saveError}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => save()} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button size="sm" onClick={() => save(true)} disabled={saving}>
              <Send className="h-4 w-4" />
              Опубликовать
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

          {/* Main editor */}
          <div className="space-y-5">
            {/* Title card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Заголовок статьи..."
                    value={form.title}
                    onChange={e => handleTitle(e.target.value)}
                    className="w-full text-2xl font-bold bg-transparent placeholder:text-muted-foreground/40 focus:outline-none"
                  />
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">Slug:</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    className="text-xs text-muted-foreground bg-muted rounded px-2 py-1 focus:outline-none flex-1 font-mono"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="content">
              <TabsList className="w-full">
                <TabsTrigger value="content" className="flex-1 gap-2">
                  <FileText className="h-4 w-4" />
                  Контент
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex-1 gap-2">
                  <Search className="h-4 w-4" />
                  SEO
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Краткое описание
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="2–3 предложения для превью статьи..."
                      value={form.excerpt}
                      onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                      rows={3}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Содержание статьи
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder={"Вставьте текст и отредактируйте как эксперт...\n\nПоддерживается HTML разметка."}
                      value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      rows={28}
                      className="font-mono text-sm leading-relaxed"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo" className="mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="metaTitle">SEO заголовок (meta title)</Label>
                      <Input
                        id="metaTitle"
                        placeholder="Заголовок для поисковиков..."
                        value={form.metaTitle}
                        onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))}
                      />
                      <p className={`text-xs ${form.metaTitle.length > 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {form.metaTitle.length}/60 символов
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="metaDesc">SEO описание (meta description)</Label>
                      <Textarea
                        id="metaDesc"
                        placeholder="Описание для поисковиков..."
                        value={form.metaDescription}
                        onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                        rows={3}
                      />
                      <p className={`text-xs ${charCount > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {charCount}/160 символов
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogImage">OG изображение (URL)</Label>
                      <Input
                        id="ogImage"
                        type="url"
                        placeholder="https://..."
                        value={form.ogImageUrl}
                        onChange={e => setForm(f => ({ ...f, ogImageUrl: e.target.value }))}
                      />
                    </div>

                    <Separator />

                    {/* SEO Preview */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
                        Предпросмотр в Яндексе
                      </p>
                      <div className="rounded-lg border border-border bg-white p-4 space-y-1">
                        <p className="text-[#1A0DAB] text-base font-medium line-clamp-1">
                          {form.metaTitle || form.title || 'Заголовок статьи'}
                        </p>
                        <p className="text-[#006621] text-xs">
                          yourdomain.ru/article/{form.slug || 'url-stati'}
                        </p>
                        <p className="text-[#545454] text-sm line-clamp-2">
                          {form.metaDescription || form.excerpt || 'Описание статьи появится здесь...'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Publish */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Публикация</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="published" className="text-sm font-normal text-foreground cursor-pointer">
                    Опубликовать статью
                  </Label>
                  <Switch
                    id="published"
                    checked={form.isPublished}
                    onCheckedChange={v => setForm(f => ({ ...f, isPublished: v }))}
                  />
                </div>
                {!isNew && (
                  <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                    <a href={`/article/${form.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                      Открыть статью
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Категория</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Select
                  value={form.categoryId}
                  onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Author */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Автор</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Select
                  value={form.authorId}
                  onValueChange={v => setForm(f => ({ ...f, authorId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите автора" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map(author => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
