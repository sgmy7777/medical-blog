import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'

async function getArticle(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/articles/${slug}`,
    { next: { revalidate: 300 } }
  )
  if (!res.ok) return null
  const json = await res.json()
  return json.data
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'Статья не найдена' }

  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt,
    openGraph: {
      title: article.metaTitle ?? article.title,
      description: article.metaDescription ?? article.excerpt,
      images: article.ogImageUrl ? [article.ogImageUrl] : [],
      type: 'article',
      publishedTime: article.publishedAt,
    },
    // JSON-LD structured data для врача-автора
    other: {
      'script:ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        name: article.title,
        description: article.excerpt,
        author: {
          '@type': 'Person',
          name: article.author?.name,
          jobTitle: article.author?.specialty,
        },
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        reviewedBy: {
          '@type': 'Person',
          name: article.author?.name,
        },
      }),
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article || !article.isPublished) notFound()

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
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          {/* Article */}
          <article className="bg-white rounded-xl border border-[#E8E4DC] overflow-hidden">
            {article.ogImageUrl && (
              <img
                src={article.ogImageUrl}
                alt={article.title}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-8">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-[#A8A29E] mb-4">
                <Link href="/" className="hover:text-[#1A6B4A]">Главная</Link>
                <span>/</span>
                <Link href={`/category/${article.category?.slug}`} className="hover:text-[#1A6B4A]">
                  {article.category?.title}
                </Link>
              </div>

              <h1 className="text-3xl font-bold text-[#1C1917] leading-tight mb-6">
                {article.title}
              </h1>

              {/* Author block - важно для E-E-A-T */}
              <div className="flex items-center gap-4 p-4 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0] mb-8">
                {article.author?.avatarUrl && (
                  <img
                    src={article.author.avatarUrl}
                    alt={article.author.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="font-semibold text-[#1C1917]">{article.author?.name}</div>
                  <div className="text-sm text-[#57534E]">{article.author?.specialty}</div>
                  <div className="text-xs text-[#A8A29E] mt-0.5">
                    ✓ Статья проверена автором
                    {article.publishedAt && ` · ${new Date(article.publishedAt).toLocaleDateString('ru-RU')}`}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div
                className="prose prose-stone max-w-none prose-headings:text-[#1C1917] prose-a:text-[#1A6B4A]"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              {article.tags?.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-8 pt-6 border-t border-[#E8E4DC]">
                  {article.tags.map((at: any) => (
                    <span
                      key={at.tag.id}
                      className="bg-[#F7F5F0] text-[#78716C] text-xs px-3 py-1 rounded-full"
                    >
                      #{at.tag.title}
                    </span>
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-8 p-4 bg-[#FEF9C3] border border-[#FDE047] rounded-lg text-sm text-[#713F12]">
                ⚠️ Статья носит информационный характер. Перед лечением обязательно проконсультируйтесь с врачом.
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Реклама - блок для Яндекс РСЯ */}
            <div className="bg-white rounded-xl border border-[#E8E4DC] p-4">
              <div className="text-xs text-[#A8A29E] mb-2">Реклама</div>
              <div
                id="yandex_rtb_sidebar"
                className="min-h-[250px] bg-[#F7F5F0] rounded-lg flex items-center justify-center text-[#A8A29E] text-sm"
              >
                Здесь будет реклама Яндекс РСЯ
              </div>
            </div>

            {/* Об авторе */}
            <div className="bg-white rounded-xl border border-[#E8E4DC] p-5">
              <h3 className="font-semibold text-[#1C1917] mb-3">Об авторе</h3>
              {article.author?.avatarUrl && (
                <img
                  src={article.author.avatarUrl}
                  alt={article.author.name}
                  className="w-16 h-16 rounded-full object-cover mb-3"
                />
              )}
              <div className="font-medium text-[#1C1917] text-sm">{article.author?.name}</div>
              <div className="text-xs text-[#78716C] mb-3">{article.author?.specialty}</div>
              <p className="text-xs text-[#A8A29E] line-clamp-4">{article.author?.bio}</p>
              <Link
                href="/author"
                className="mt-3 text-xs text-[#1A6B4A] hover:underline block"
              >
                Подробнее об авторе →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
