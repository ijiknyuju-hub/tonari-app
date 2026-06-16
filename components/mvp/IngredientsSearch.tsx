'use client'

import { useMemo, useState } from 'react'
import BottomNav from '@/components/mvp/BottomNav'
import { allIngredients, relationsByIngredients, getDishName } from '@/lib/mvp/ingredientIndex'
import type { NearbyRelation } from '@/types/dish'

export default function IngredientsSearch() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])

  const frequentIngredients = useMemo(() => allIngredients().slice(0, 8), [])
  const matchingRelations = useMemo(() => relationsByIngredients(selectedIngredients), [selectedIngredients])

  function toggleIngredient(ingredient: string) {
    setSelectedIngredients((current) =>
      current.includes(ingredient)
        ? current.filter((item) => item !== ingredient)
        : [...current, ingredient],
    )
  }

  return (
    <main className="tn-screen">
      <section className="tn-container tn-bottom-safe pt-5">
        <header className="flex items-center justify-center">
          <p className="text-2xl font-black tracking-normal">となりごはん</p>
        </header>

        <section className="mt-6">
          <h1 className="text-2xl font-black tracking-normal">食材から探す</h1>
          <p className="mt-2 text-sm font-bold leading-6 text-[var(--tn-text-sub)]">
            冷蔵庫にある食材から、作れる料理を見つけよう
          </p>
        </section>

        {frequentIngredients.length > 0 ? (
          <section className="mt-7">
            <h2 className="text-base font-black">最近よく使う食材</h2>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {frequentIngredients.map((ingredient) => {
                const selected = selectedIngredients.includes(ingredient)
                return (
                  <button
                    key={ingredient}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleIngredient(ingredient)}
                    className={[
                      'min-h-12 shrink-0 rounded-2xl border bg-white px-4 text-sm font-black shadow-[var(--tn-shadow-soft)]',
                      selected
                        ? 'border-[var(--tn-accent)] bg-[var(--tn-accent-soft)] text-[var(--tn-accent)]'
                        : 'border-[var(--tn-border)]',
                    ].join(' ')}
                  >
                    {ingredient}
                  </button>
                )
              })}
            </div>
          </section>
        ) : null}

        {selectedIngredients.length > 0 && (
          <section className="mt-5 rounded-2xl bg-[var(--tn-surface-soft)] p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black">選択中の食材</h2>
              <button
                type="button"
                onClick={() => setSelectedIngredients([])}
                className="text-xs font-extrabold text-[var(--tn-text-sub)]"
              >
                クリア
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedIngredients.map((ingredient) => (
                <button
                  key={ingredient}
                  type="button"
                  onClick={() => toggleIngredient(ingredient)}
                  className="min-h-10 rounded-full border border-[var(--tn-border)] bg-white px-4 text-sm font-black"
                >
                  {ingredient} ×
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="tn-card mt-6 p-4">
          {matchingRelations.length > 0 ? (
            <div className="space-y-3">
              {matchingRelations.map((r) => (
                <RelationCard key={`${r.source}-${r.target}`} relation={r} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-[var(--tn-surface-soft)] p-4 text-sm font-bold leading-6 text-[var(--tn-text-sub)]">
              {frequentIngredients.length === 0
                ? 'まだ料理データがありません。データが追加されると、食材から料理を探せるようになります。'
                : 'この食材で表示できる料理がまだありません'}
            </p>
          )}
        </section>
      </section>
      <BottomNav />
    </main>
  )
}

function RelationCard({ relation }: { relation: NearbyRelation }) {
  return (
    <article className="rounded-2xl border border-[var(--tn-border)] bg-white p-3 shadow-[var(--tn-shadow-soft)]">
      <p className="text-lg font-black">{getDishName(relation.target)}</p>
      <p className="mt-1 text-sm font-bold text-[var(--tn-text-sub)]">
        {getDishName(relation.source)}から →
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--tn-text-sub)]">
        {relation.description_line1}
      </p>
      {relation.new_ingredients.length > 0 && (
        <p className="mt-1 text-xs text-[var(--tn-text-sub)]">
          新食材: {relation.new_ingredients.join('、')}
        </p>
      )}
    </article>
  )
}
