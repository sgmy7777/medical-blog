import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Заполняем базу данных...')

  // Создаём администратора
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@yourdomain.ru' },
    update: {},
    create: { email: 'admin@yourdomain.ru', password: hashedPassword },
  })
  console.log('✅ Администратор:', admin.email)
  console.log('   Пароль: admin123 (смените после первого входа!)')

  // Создаём автора
  const author = await prisma.author.upsert({
    where: { slug: 'doktor-ivanov' },
    update: {},
    create: {
      name: 'Иванов Иван Иванович',
      specialty: 'Врач-стоматолог, стаж 12 лет',
      bio: 'Окончил стоматологический факультет. Специализируюсь на профилактике и лечении заболеваний полости рта. Веду этот блог, чтобы помочь людям сохранить здоровые зубы.',
      slug: 'doktor-ivanov',
    },
  })
  console.log('✅ Автор:', author.name)

  // Создаём категории
  const categoryData = [
    { title: 'Стоматология', slug: 'stomatologiya', color: '#1A6B4A', description: 'Болезни зубов и их лечение' },
    { title: 'Болезни дёсен', slug: 'bolezni-dyosen', color: '#7C3AED', description: 'Пародонтоз, гингивит и другие' },
    { title: 'Профилактика', slug: 'profilaktika', color: '#0369A1', description: 'Уход за полостью рта' },
    { title: 'Детская стоматология', slug: 'detskaya', color: '#B45309', description: 'Здоровье зубов у детей' },
    { title: 'Запах изо рта', slug: 'zapah-izo-rta', color: '#BE185D', description: 'Причины и лечение галитоза' },
  ]

  for (const cat of categoryData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Категории созданы')

  // Создаём теги
  const tags = ['зубная боль', 'кариес', 'дёсны', 'профилактика', 'детские зубы', 'галитоз', 'брекеты']
  for (const title of tags) {
    const slug = title.replace(/\s+/g, '-').replace(/[^a-zA-Zа-яёА-ЯЁ0-9-]/g, '')
    await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { title, slug },
    })
  }
  console.log('✅ Теги созданы')

  const category = await prisma.category.findUnique({ where: { slug: 'stomatologiya' } })

  // Создаём тестовую статью
  await prisma.article.upsert({
    where: { slug: 'pochemu-bolyat-desny' },
    update: {},
    create: {
      title: 'Почему болят дёсны: 7 главных причин и что делать',
      slug: 'pochemu-bolyat-desny',
      excerpt: 'Боль в дёснах — один из самых частых поводов обращения к стоматологу. Разбираем причины и рассказываем, когда нужна срочная помощь.',
      content: `
        <h2>Почему болят дёсны?</h2>
        <p>Боль в дёснах может быть признаком серьёзного заболевания или временной реакцией на внешнее воздействие. Важно понять причину вовремя.</p>
        <h2>Основные причины</h2>
        <h3>1. Гингивит</h3>
        <p>Воспаление дёсен, вызванное бактериальным налётом. Дёсны краснеют, отекают и кровоточат при чистке зубов.</p>
        <h3>2. Пародонтит</h3>
        <p>Более серьёзное заболевание, при котором воспаление распространяется на костную ткань. Без лечения приводит к потере зубов.</p>
        <h3>3. Травма</h3>
        <p>Жёсткая зубная щётка, острая пища или стоматологические манипуляции могут травмировать дёсны.</p>
        <h2>Когда обратиться к врачу</h2>
        <p>Обязательно запишитесь к стоматологу, если боль не проходит более 3 дней или сопровождается температурой.</p>
      `,
      metaTitle: 'Почему болят дёсны: причины и лечение | ДентаМед',
      metaDescription: 'Боль в дёснах может указывать на гингивит, пародонтит или травму. Узнайте причины и когда нужна помощь стоматолога.',
      authorId: author.id,
      categoryId: category!.id,
      isPublished: true,
      publishedAt: new Date(),
    },
  })
  console.log('✅ Тестовая статья создана')

  console.log('\n🚀 База данных готова!')
  console.log('   Войдите в админку: /admin/login')
  console.log('   Email: admin@yourdomain.ru')
  console.log('   Пароль: admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
