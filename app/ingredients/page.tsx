import BottomNav from '@/components/mvp/BottomNav'

export default function IngredientsPage() {
  return (
    <main className="tn-screen">
      <section className="tn-container tn-bottom-safe pt-6">
        <div className="tn-card p-5">
          <p className="text-sm font-extrabold text-[var(--tn-accent)]">となりごはん</p>
          <h1 className="mt-3 text-3xl font-black tracking-normal">食材から探す</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--tn-text-sub)]">
            冷蔵庫にある食材から次の一品を探す画面です。
          </p>
        </div>
      </section>
      <BottomNav />
    </main>
  )
}
