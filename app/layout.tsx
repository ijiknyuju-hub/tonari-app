import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { VisitTracker } from '@/components/mvp/VisitTracker'
import './globals.css'

export const metadata: Metadata = {
  title: 'となりごはん',
  description: '作れる料理を選ぶだけ。少し変えれば作れそうな料理を提案する試作版です。',
  openGraph: {
    title: 'となりごはん',
    description: '作れる料理を選ぶだけ。少し変えれば作れそうな料理を提案する試作版です。',
    url: 'https://tonari-app-fawn.vercel.app',
    siteName: 'となりごはん',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'となりごはん',
    description: '作れる料理を選ぶだけ。少し変えれば作れそうな料理を提案する試作版です。',
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
        <VisitTracker />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
