import BottomNav from '@/components/mvp/BottomNav'
import IslandMap from '@/components/mvp/IslandMap'

export default function MapPage() {
  return (
    <main className="tn-screen">
      <IslandMap />
      <BottomNav />
    </main>
  )
}
