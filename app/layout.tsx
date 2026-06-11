import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '縲後→縺ｪ繧翫＃縺ｯ繧・窶・縺・▽繧ゅ・譁咏炊縺九ｉ縲∵ｬ｡縺ｮ荳蜩√∈縲・',
  description: '菴懊ｌ繧区侭逅・ｒ逋ｻ骭ｲ縺吶ｋ縺ｨ縲∵ｬ｡縺ｮ荳蜩√ｒ謠先｡医＠縺ｾ縺吶・',
  openGraph: {
    title: '縲後→縺ｪ繧翫＃縺ｯ繧・窶・縺・▽繧ゅ・譁咏炊縺九ｉ縲∵ｬ｡縺ｮ荳蜩√∈縲・',
    description: '菴懊ｌ繧区侭逅・ｒ逋ｻ骭ｲ縺吶ｋ縺ｨ縲∵ｬ｡縺ｮ荳蜩√ｒ謠先｡医＠縺ｾ縺吶・',
    url: 'https://tonari-app-fawn.vercel.app',
    siteName: '縺ｨ縺ｪ繧翫＃縺ｯ繧・',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '縲後→縺ｪ繧翫＃縺ｯ繧・窶・縺・▽繧ゅ・譁咏炊縺九ｉ縲∵ｬ｡縺ｮ荳蜩√∈縲・',
    description: '菴懊ｌ繧区侭逅・ｒ逋ｻ骭ｲ縺吶ｋ縺ｨ縲∵ｬ｡縺ｮ荳蜩√ｒ謠先｡医＠縺ｾ縺吶・',
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
