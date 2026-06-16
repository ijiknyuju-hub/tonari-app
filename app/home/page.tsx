import HomeScreen from '@/components/mvp/HomeScreen'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const dateISO = new Date().toISOString().slice(0, 10)

  return <HomeScreen dateISO={dateISO} />
}
