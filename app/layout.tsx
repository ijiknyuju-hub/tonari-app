import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'となりごはん',
  description: '作れる料理が増える、パーソナル料理スキルツリー',
  openGraph: {
    title: 'となりごはん',
    description: '作れる料理が増える、パーソナル料理スキルツリー',
    url: 'https://tonari-app-fawn.vercel.app',
    siteName: 'となりごはん',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'となりごはん',
    description: '作れる料理が増える、パーソナル料理スキルツリー',
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
