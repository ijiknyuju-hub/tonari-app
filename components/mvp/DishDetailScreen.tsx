'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { CustomDish, NearbyRelation } from '@/types/dish'
import { trackEvent } from '@/lib/mvp/analytics'
import { useDishLibrary } from '@/lib/mvp/useDishLibrary'
import { useUserState } from '@/lib/mvp/useUserState'

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'かんたん',
  stretch: '少し広げる',
  full: 'しっかり作る',
}

interface DishDetailScreenProps {
  relation?: NearbyRelation
  dishId: string
  targetName: string
  sourceName?: string
}

export default function DishDetailScreen({ relation, dishId, targetName, sourceName }: DishDetailScreenProps) {
  const { isBookmarked, bookmark, unbookmark, madeRecordsFor, recordMade } = useUserState()
  const { overrides, customDishes, saveDishOverride, resetDishOverride } = useDishLibrary()
  const [editing, setEditing] = useState(false)

  const customDish = customDishes.find((dish) => dish.id === dishId)
  const override = overrides[dishId]
  const saved = isBookmarked(dishId)
  const madeCount = madeRecordsFor(dishId).length

  const content = useMemo(() => {
    return mergedDishContent(relation, customDish, override)
  }, [customDish, override, relation])

  const displayName = customDish?.name ?? targetName

  useEffect(() => {
    trackEvent('open_dish_card', { dishId })
  }, [dishId])

  function handleMadeIt() {
    recordMade({
      dish_id: dishId,
      made_at: new Date().toISOString(),
      rating: 'ok',
    })
  }

  if (!relation && !customDish) {
    return (
      <main className="tn-screen">
        <div className="tn-container pt-6">
          <Link href="/repertoire" className="text-sm font-bold text-[var(--tn-accent)]">
            ← 戻る
          </Link>
          <p className="mt-8 text-sm font-bold text-[var(--tn-text-sub)]">
            この料理はこの端末には保存されていません。
          </p>
        </div>
      </main>
    )
  }

  if (editing) {
    return (
      <DishEditForm
        dishId={dishId}
        title={displayName}
        initialIngredients={content.ingredients}
        initialSteps={content.steps}
        initialMemo={content.memo}
        onCancel={() => setEditing(false)}
        onSave={(ingredients, steps, memo) => {
          saveDishOverride(dishId, {
            ingredients_override: cleanLines(ingredients),
            steps_override: cleanLines(steps),
            memo: memo.trim(),
          })
          trackEvent('dish_edit_save', { dishId })
          setEditing(false)
        }}
        onReset={() => {
          resetDishOverride(dishId)
          setEditing(false)
        }}
      />
    )
  }

  return (
    <main className="tn-screen">
      <div className="tn-container tn-bottom-safe pt-4">
        <div className="flex items-center justify-between">
          <Link href="/repertoire" className="inline-flex items-center gap-1 text-sm font-bold text-[var(--tn-accent)]">
            ← 戻る
          </Link>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--tn-border)] bg-white text-[var(--tn-accent)]"
            aria-label="編集"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
              <path d="m14 6 4 4" />
            </svg>
          </button>
        </div>

        <div className="mt-4">
          {relation && <DifficultyTag difficulty={relation.tab} />}
          {customDish && <span className="tn-tag tn-tag-easy">自作</span>}
          {override && (
            <span className="ml-2 rounded-full bg-[var(--tn-accent-soft)] px-3 py-1 text-xs font-black text-[var(--tn-accent)]">
              自分流に編集済み
            </span>
          )}
          <h1 className="mt-2 text-[1.625rem] font-black leading-snug text-[var(--tn-text)]">{displayName}</h1>
          {sourceName && <p className="mt-1 text-sm font-bold text-[var(--tn-text-sub)]">{sourceName} から広げる</p>}
        </div>

        {relation && (
          <div className="tn-card mt-5 p-4">
            <p className="text-sm leading-6 text-[var(--tn-text)]">{relation.description_line1}</p>
            <p className="text-sm leading-6 text-[var(--tn-text)]">{relation.description_line2}</p>
          </div>
        )}

        {content.ingredients.length > 0 && (
          <section className="mt-5">
            <h2 className="text-sm font-black text-[var(--tn-text)]">材料</h2>
            <ul className="mt-2 space-y-2">
              {content.ingredients.map((ingredient) => (
                <li
                  key={ingredient}
                  className="flex items-center gap-2 rounded-2xl bg-[var(--tn-accent-soft)] px-4 py-2 text-sm font-bold text-[var(--tn-accent)]"
                >
                  <span>•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {content.steps.length > 0 && (
          <section className="mt-5">
            <h2 className="text-sm font-black text-[var(--tn-text)]">ざっくり手順</h2>
            <ol className="mt-2 space-y-2">
              {content.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 rounded-2xl bg-[var(--tn-surface-soft)] px-4 py-2 text-sm text-[var(--tn-text)]">
                  <span className="shrink-0 font-black text-[var(--tn-accent)]">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {content.memo && (
          <section className="tn-card mt-5 p-4">
            <h2 className="text-sm font-black text-[var(--tn-text)]">メモ</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--tn-text)]">{content.memo}</p>
          </section>
        )}

        {relation?.cooking_time_minutes != null && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--tn-surface-soft)] px-4 py-1.5 text-sm font-bold text-[var(--tn-text-sub)]">
            調理時間 約{relation.cooking_time_minutes}分
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          {!customDish && (
            <button
              type="button"
              onClick={() => {
                if (saved) {
                  unbookmark(dishId)
                } else {
                  bookmark(dishId)
                  trackEvent('bookmark', { dishId })
                }
              }}
              className="tn-pill-button flex items-center justify-center gap-2 py-3 text-sm font-bold"
              style={saved ? { background: 'var(--tn-accent-soft)', borderColor: 'var(--tn-accent)' } : undefined}
            >
              {saved ? '保存済み' : '作りたい'}
            </button>
          )}
          <button
            type="button"
            onClick={handleMadeIt}
            className={customDish ? 'col-span-2 rounded-2xl py-3 text-sm font-bold text-white' : 'rounded-2xl py-3 text-sm font-bold text-white'}
            style={{ background: madeCount > 0 ? '#6aab40' : 'var(--tn-accent)' }}
          >
            {madeCount > 0 ? `${madeCount}回作った` : '作った'}
          </button>
        </div>
      </div>
    </main>
  )
}

function DifficultyTag({ difficulty }: { difficulty: string }) {
  const className =
    difficulty === 'easy'
      ? 'tn-tag tn-tag-easy'
      : difficulty === 'stretch'
        ? 'tn-tag tn-tag-stretch'
        : 'tn-tag tn-tag-full'
  return <span className={className}>{DIFFICULTY_LABEL[difficulty] ?? difficulty}</span>
}

function DishEditForm({
  dishId,
  title,
  initialIngredients,
  initialSteps,
  initialMemo,
  onCancel,
  onSave,
  onReset,
}: {
  dishId: string
  title: string
  initialIngredients: string[]
  initialSteps: string[]
  initialMemo: string
  onCancel: () => void
  onSave: (ingredients: string[], steps: string[], memo: string) => void
  onReset: () => void
}) {
  const [ingredients, setIngredients] = useState(initialIngredients.length > 0 ? initialIngredients : [''])
  const [steps, setSteps] = useState(initialSteps.length > 0 ? initialSteps : [''])
  const [memo, setMemo] = useState(initialMemo)

  return (
    <main className="tn-screen">
      <form
        className="tn-container tn-bottom-safe space-y-5 pt-4"
        onSubmit={(e) => {
          e.preventDefault()
          onSave(ingredients, steps, memo)
        }}
      >
        <div className="flex items-center justify-between">
          <button type="button" onClick={onCancel} className="text-sm font-bold text-[var(--tn-accent)]">
            ← 戻る
          </button>
          <button type="submit" className="rounded-full bg-[var(--tn-accent)] px-4 py-2 text-sm font-black text-white">
            保存
          </button>
        </div>
        <div>
          <p className="text-xs font-bold text-[var(--tn-text-sub)]">編集中</p>
          <h1 className="text-2xl font-black text-[var(--tn-text)]">{title}</h1>
        </div>
        <EditableLines title="材料" values={ingredients} onChange={setIngredients} />
        <EditableLines title="手順" values={steps} onChange={setSteps} />
        <label className="block">
          <span className="text-sm font-black text-[var(--tn-text)]">メモ</span>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="mt-2 min-h-28 w-full rounded-2xl border border-[var(--tn-border)] bg-white px-4 py-3 text-sm text-[var(--tn-text)]"
            placeholder="自分用のコツや分量メモ"
          />
        </label>
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-2xl border border-[var(--tn-border)] bg-white py-3 text-sm font-black text-[var(--tn-text-sub)]"
        >
          元に戻す
        </button>
        <input type="hidden" value={dishId} readOnly />
      </form>
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

function mergedDishContent(relation?: NearbyRelation, customDish?: CustomDish, override?: { ingredients_override?: string[]; steps_override?: string[]; memo?: string }) {
  return {
    ingredients: override?.ingredients_override ?? customDish?.ingredients ?? relation?.new_ingredients ?? [],
    steps: override?.steps_override ?? customDish?.steps ?? relation?.rough_steps ?? [],
    memo: override?.memo ?? '',
  }
}

function cleanLines(lines: string[]) {
  return lines.map((line) => line.trim()).filter(Boolean)
}
