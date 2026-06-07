import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'となりごはん',
  description: 'よく作る料理から、今週試したいごはんを見つけよう',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <div className="max-w-[430px] mx-auto min-h-screen shadow-xl">
          {children}
        </div>
      </body>
    </html>
  )
}
