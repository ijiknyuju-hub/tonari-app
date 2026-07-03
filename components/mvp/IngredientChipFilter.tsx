'use client'

interface IngredientChipFilterProps {
  ingredients: string[]
  active: string[]
  onToggle: (ingredient: string) => void
}

export function IngredientChipFilter({
  ingredients,
  active,
  onToggle,
}: IngredientChipFilterProps) {
  if (ingredients.length === 0) return null

  return (
    <div className="mt-6">
      <p
        className="mb-2 text-sm font-bold"
        style={{ color: 'var(--tn-text-sub)' }}
      >
        持っている食材で絞る
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {ingredients.map((ingredient) => {
          const isActive = active.includes(ingredient)
          return (
            <button
              key={ingredient}
              type="button"
              onClick={() => onToggle(ingredient)}
              className="shrink-0 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors"
              style={
                isActive
                  ? {
                      background: 'var(--tn-tag-bg)',
                      color: 'var(--tn-text)',
                      borderColor: 'var(--tn-text)',
                    }
                  : {
                      background: 'var(--tn-surface)',
                      color: 'var(--tn-text-sub)',
                      borderColor: 'var(--tn-border)',
                    }
              }
            >
              {ingredient}
            </button>
          )
        })}
      </div>
    </div>
  )
}
