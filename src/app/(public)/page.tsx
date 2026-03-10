import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getArticles() {
  try {
    return await prisma.article.findMany({
      where: { isPublished: true },
      take: 6,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true, title: true, slug: true, excerpt: true,
        ogImageUrl: true, viewCount: true, publishedAt: true,
        category: { select: { title: true, slug: true, color: true } },
        author: { select: { name: true } },
      },
    })
  } catch { return [] }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true, slug: true, _count: { select: { articles: true } } },
    })
  } catch { return [] }
}

export default async function HomePage() {
  const [articles, categories] = await Promise.all([getArticles(), getCategories()])

  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E4DC]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1A6B4A] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Д</span>
            </div>
            <div>
              <div className="font-bold text-[#1C1917] text-lg leading-tight">ДентаМед</div>
              <div className="text-xs text-[#78716C]">Советы стоматолога</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#57534E]">
            <Link href="/category/stomatologiya" className="hover:text-[#1A6B4A] transition-colors">Стоматология</Link>
            <Link href="/category/profilaktika" className="hover:text-[#1A6B4A] transition-colors">Профилактика</Link>
            <Link href="/category/detskaya-stomatologiya" className="hover:text-[#1A6B4A] transition-colors">Детям</Link>
            <Link href="/author" className="hover:text-[#1A6B4A] transition-colors">Об авторе</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-[#E8E4DC]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="max-w-2xl">
            <span className="inline-block bg-[#DCFCE7] text-[#166534] text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Проверено врачом-стоматологом
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1C1917] leading-tight mb-4">
              Всё о здоровье<br />полости рта
            </h1>
            <p className="text-[#78716C] text-lg mb-8">
              Статьи написаны и проверены практикующим стоматологом.
              Только достоверная информация без рекламы лекарств.
            </p>
            <div className="flex gap-3">
              <Link
                href="#articles"
                className="bg-[#1A6B4A] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#155C3E] transition-colors"
              >
                Читать статьи
              </Link>
              <Link
                href="/author"
                className="border border-[#D6D3CD] text-[#57534E] px-6 py-3 rounded-lg font-medium hover:bg-[#F7F5F0] transition-colors"
              >
                Об авторе
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="bg-white border border-[#E8E4DC] text-[#57534E] text-sm px-4 py-2 rounded-full hover:border-[#1A6B4A] hover:text-[#1A6B4A] transition-colors"
              >
                {cat.title}
                <span className="ml-1 text-xs text-[#A8A29E]">({cat._count?.articles ?? 0})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Articles grid */}
      <section id="articles" className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold text-[#1C1917] mb-6">Последние статьи</h2>
        {articles.length === 0 ? (
          <div className="text-center py-20 text-[#A8A29E]">
            <div className="text-5xl mb-4">🦷</div>
            <p>Статьи скоро появятся</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article: any) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="bg-white rounded-xl border border-[#E8E4DC] overflow-hidden hover:shadow-md transition-shadow group"
              >
                {article.ogImageUrl ? (
                  <img
                    src={article.ogImageUrl}
                    alt={article.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-[#DCFCE7] to-[#BBF7D0] flex items-center justify-center">
                    <span className="text-4xl">🦷</span>
                  </div>
                )}
                <div className="p-5">
                  {article.category && (
                    <span
                      className="inline-block text-xs font-semibold px-2 py-0.5 rounded mb-2"
                      style={{
                        backgroundColor: article.category?.color ? `${article.category.color}20` : '#DCFCE7',
                        color: article.category?.color ?? '#166534',
                      }}
                    >
                      {article.category.title}
                    </span>
                  )}
                  <h3 className="font-bold text-[#1C1917] leading-snug mb-2 group-hover:text-[#1A6B4A] transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-[#78716C] line-clamp-2">{article.excerpt}</p>
                  )}
                  <div className="flex items-center gap-2 mt-4 text-xs text-[#A8A29E]">
                    {article.author?.name && <span>{article.author.name}</span>}
                    {article.author?.name && <span>·</span>}
                    <span>{article.viewCount} просмотров</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[#1C1917] text-[#A8A29E] text-sm">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="text-white font-bold mb-1">ДентаМед</div>
            <div>Информационный ресурс. Не заменяет консультацию врача.</div>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Конфиденциальность</Link>
            <Link href="/author" className="hover:text-white transition-colors">Об авторе</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
