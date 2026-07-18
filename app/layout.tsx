import type { Metadata, Viewport } from 'next'
import { VisitTracker } from '@/components/mvp/VisitTracker'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://tonari-gohan.pages.dev'),
  title: 'となりごはん',
  description: '作れる料理を選ぶだけ。少し変えれば作れそうな料理を提案する試作版です。',
  applicationName: 'となりごはん',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'となりごはん',
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: 'となりごはん',
    description: '作れる料理を選ぶだけ。少し変えれば作れそうな料理を提案する試作版です。',
    url: 'https://tonari-gohan.pages.dev',
    siteName: 'となりごはん',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'となりごはん',
    description: '作れる料理を選ぶだけ。少し変えれば作れそうな料理を提案する試作版です。',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800;900&family=Zen+Maru+Gothic:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <VisitTracker />
        {children}
      </body>
    </html>
  )
}
