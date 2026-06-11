import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'となりごはん — いつもの料理から、次の一品へ。',
  description: '作れる料理を登録すると、少し変えれば作れそうな次の一品を提案します。',
  openGraph: {
    title: 'となりごはん — いつもの料理から、次の一品へ。',
    description: '作れる料理を登録すると、少し変えれば作れそうな次の一品を提案します。',
    url: 'https://tonari-app-fawn.vercel.app',
    siteName: 'となりごはん',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'となりごはん — いつもの料理から、次の一品へ。',
    description: '作れる料理を登録すると、少し変えれば作れそうな次の一品を提案します。',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
