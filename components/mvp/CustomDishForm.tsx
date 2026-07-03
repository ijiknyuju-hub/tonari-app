'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { dishes } from '@/data/v3'
import { trackEvent } from '@/lib/mvp/analytics'
import { useDishLibrary } from '@/lib/mvp/useDishLibrary'
import BottomNav from './BottomNav'

export default function CustomDishForm() {
  const router = useRouter()
  const { addCustomDish } = useDishLibrary()
  const [name, setName] = useState('')
  const [ingredients, setIngredients] = useState([''])
  const [steps, setSteps] = useState([''])
  const [baseDishId, setBaseDishId] = useState('')

  const baseOptions = useMemo(() => dishes.slice(0, 15), [])

  return (
    <main className="tn-screen">
      <form
        className="tn-container tn-bottom-safe space-y-5 pt-4"
        onSubmit={(e) => {
          e.preventDefault()
          const trimmedName = name.trim()
          if (!trimmedName) return
          const customDish = addCustomDish({
            name: trimmedName,
            ingredients: cleanLines(ingredients),
            steps: cleanLines(steps),
            ...(baseDishId ? { attached_base_dish_id: baseDishId } : {}),
          })
          trackEvent('custom_dish_create', { dishId: customDish.id })
          router.push('/repertoire')
        }}
      >
        <Link href="/repertoire" className="text-sm font-bold text-[var(--tn-accent)]">
          ← 戻る
        </Link>
        <div>
          <p className="text-xs font-bold text-[var(--tn-text-sub)]">料理帳</p>
          <h1 className="text-2xl font-black text-[var(--tn-text)]">自分の料理を追加</h1>
        </div>
        <label className="block">
          <span className="text-sm font-black text-[var(--tn-text)]">料理名 *</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--tn-border)] bg-white px-4 py-3 text-sm text-[var(--tn-text)]"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-black text-[var(--tn-text)]">近いベース料理（任意）</span>
          <select
            value={baseDishId}
            onChange={(e) => setBaseDishId(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--tn-border)] bg-white px-4 py-3 text-sm text-[var(--tn-text)]"
          >
            <option value="">選ばない</option>
            {baseOptions.map((dish) => (
              <option key={dish.id} value={dish.id}>
                {dish.name}
              </option>
            ))}
          </select>
        </label>
        <EditableLines title="材料" values={ingredients} onChange={setIngredients} />
        <EditableLines title="手順" values={steps} onChange={setSteps} />
        <button type="submit" className="w-full rounded-2xl bg-[var(--tn-accent)] py-3 text-sm font-black text-white">
          作成する
        </button>
      </form>
      <BottomNav />
    </main>
  )
}

function EditableLines({
  title,
  values,
  onChange,
}: {
  title: string
  values: string[]
  onChange: (values: string[]) => void
}) {
  return (
    <section>
      <p className="text-sm font-black text-[var(--tn-text)]">{title}</p>
      <div className="mt-2 space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={value}
              onChange={(e) => onChange(values.map((item, i) => (i === index ? e.target.value : item)))}
              className="min-w-0 flex-1 rounded-2xl border border-[var(--tn-border)] bg-white px-4 py-3 text-sm text-[var(--tn-text)]"
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="h-12 w-12 rounded-2xl border border-[var(--tn-border)] bg-white text-sm font-black text-[var(--tn-text-sub)]"
              aria-label={`${title}を削除`}
            >
              x
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...values, ''])}
        className="mt-2 rounded-full border border-[var(--tn-border)] bg-white px-4 py-2 text-xs font-black text-[var(--tn-accent)]"
      >
        + 追加
      </button>
    </section>
  )
}

function cleanLines(lines: string[]) {
  return lines.map((line) => line.trim()).filter(Boolean)
}
