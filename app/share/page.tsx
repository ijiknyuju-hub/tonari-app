import type { Metadata } from 'next'
import Link from 'next/link'

const APP_URL = 'https://tonari-app-fawn.vercel.app'

interface Props {
  searchParams: Promise<{
    count?: string
    dishes?: string
  }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { count = '0', dishes = '' } = await searchParams
  const ogImageUrl = `${APP_URL}/api/og?count=${encodeURIComponent(count)}&dishes=${encodeURIComponent(dishes)}`

  return {
    title: `${count}品達成 - となりごはん`,
    description: '作れる料理が増える、パーソナル料理スキルツリー',
    openGraph: {
      title: `料理スキルツリー ${count}品達成`,
      description: '作れる料理が増える、パーソナル料理スキルツリー',
      url: `${APP_URL}/share?count=${encodeURIComponent(count)}&dishes=${encodeURIComponent(dishes)}`,
      siteName: 'となりごはん',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `となりごはん ${count}品達成`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `料理スキルツリー ${count}品達成`,
      description: '作れる料理が増える、パーソナル料理スキルツリー',
      images: [ogImageUrl],
    },
  }
}

export default async function SharePage({ searchParams }: Props) {
  const { count = '0', dishes = '' } = await searchParams
  const dishNames = dishes
    .split(',')
    .map((dish) => dish.trim())
    .filter(Boolean)
    .slice(0, 8)

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8F5] px-6 text-zinc-900">
      <section className="max-w-xl text-center">
        <p className="text-sm font-bold tracking-[0.18em] text-[#5C9E6E]">となりごはん</p>
        <h1 className="mt-4 text-3xl font-bold text-[#315E3D] sm:text-4xl">
          料理スキルツリー {count}品達成
        </h1>
        <p className="mt-4 text-sm leading-7 text-zinc-600">
          作れる料理が増える、パーソナル料理スキルツリー。
          あなたも自分の「となりの料理」を広げてみましょう。
        </p>
        {dishNames.length > 0 ? (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {dishNames.map((dish) => (
              <span
                key={dish}
                className="rounded-full bg-[#E5F2EA] px-3 py-1 text-xs font-bold text-[#315E3D]"
              >
                {dish}
              </span>
            ))}
          </div>
        ) : null}
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-[#5C9E6E] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4D865D]"
        >
          自分の系統図を作る
        </Link>
      </section>
    </main>
  )
}
