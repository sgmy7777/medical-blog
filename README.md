# ДентаМед — Медицинский блог

Next.js 14 + PostgreSQL + Tailwind CSS

## Быстрый старт

### 1. Установить зависимости
```bash
npm install
```

### 2. Настроить переменные окружения
```bash
cp .env.example .env
# Заполните DATABASE_URL и JWT_SECRET
```

### 3. Создать базу данных
```bash
npm run db:push    # Применить схему
npm run db:seed    # Заполнить тестовыми данными
```

### 4. Запустить в режиме разработки
```bash
npm run dev
# → http://localhost:3000
# → http://localhost:3000/admin/login
```

---

## Структура проекта

```
src/
├── app/
│   ├── (public)/           # Публичный сайт
│   │   ├── page.tsx        # Главная
│   │   ├── article/[slug]  # Страница статьи
│   │   └── category/[slug] # Страница категории
│   ├── admin/              # Панель управления
│   │   ├── page.tsx        # Список статей
│   │   ├── login/          # Вход
│   │   └── articles/[slug] # Редактор статьи
│   └── api/                # API endpoints
│       ├── articles/       # CRUD статей
│       ├── categories/     # CRUD категорий
│       └── auth/           # Авторизация
├── lib/
│   ├── prisma.ts           # Клиент БД
│   └── auth.ts             # JWT утилиты
└── types/                  # TypeScript типы

prisma/
├── schema.prisma           # Схема БД
└── seed.ts                 # Тестовые данные
```

---

## Деплой на Vercel (бесплатно)

1. Загрузить код на GitHub
2. Подключить репозиторий на vercel.com
3. Добавить переменные окружения в Vercel Dashboard
4. Деплой произойдёт автоматически

---

## Добавить Яндекс РСЯ

1. Зарегистрироваться на partner.yandex.ru
2. Создать рекламный блок
3. Вставить код в `src/app/(public)/article/[slug]/page.tsx`
   в место с `id="yandex_rtb_sidebar"`

---

## Первые шаги после запуска

- [ ] Сменить пароль администратора
- [ ] Заполнить профиль автора (фото, диплом)
- [ ] Создать категории
- [ ] Написать первые 3 статьи
- [ ] Подключить Яндекс.Метрику
- [ ] Добавить в Яндекс.Вебмастер
