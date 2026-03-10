import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ДентаМед — Советы стоматолога',
  description: 'Статьи о здоровье полости рта, проверенные практикующим стоматологом.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
