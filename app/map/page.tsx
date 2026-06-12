import BottomNav from '@/components/mvp/BottomNav'

export default function MapPage() {
  return (
    <main className="tn-screen">
      <section className="tn-container tn-bottom-safe pt-6">
        <div className="tn-card p-5">
          <p className="text-sm font-extrabold text-[var(--tn-accent)]">となりごはん</p>
          <h1 className="mt-3 text-3xl font-black tracking-normal">広がりマップ</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--tn-text-sub)]">
            作った料理が島の領土として広がる画面です。実装は後続 goal で追加します。
          </p>
        </div>
      </section>
      <BottomNav />
    </main>
  )
}
