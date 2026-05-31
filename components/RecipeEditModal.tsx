'use client'

import { FormEvent, MouseEvent, useState } from 'react'
import type { RecipeNode } from '@/lib/types'

interface RecipeEditModalProps {
  node: RecipeNode
  onSave: (
    nodeId: string,
    updates: Pick<RecipeNode, 'ingredients' | 'steps' | 'referenceUrl'>,
  ) => void
  onClose: () => void
}

export default function RecipeEditModal({ node, onSave, onClose }: RecipeEditModalProps) {
  const [ingredients, setIngredients] = useState(node.ingredients ?? '')
  const [steps, setSteps] = useState(node.steps ?? '')
  const [referenceUrl, setReferenceUrl] = useState(node.referenceUrl ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSave(node.id, {
      ingredients,
      steps,
      referenceUrl: referenceUrl.trim(),
    })
  }

  function stopPropagation(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
        onClick={stopPropagation}
      >
        <h2 className="text-xl font-bold text-[#315E3D]">{node.name}</h2>
        {node.category ? <p className="mt-1 text-xs text-zinc-400">{node.category}</p> : null}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-bold text-zinc-700">材料</span>
            <textarea
              value={ingredients}
              onChange={(event) => setIngredients(event.target.value)}
              placeholder={'鶏もも肉\n醤油\n生姜...'}
              className="mt-2 min-h-28 w-full resize-y rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#5C9E6E] focus:ring-2 focus:ring-[#A8D5B5]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-zinc-700">手順</span>
            <textarea
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
              placeholder="大まかな手順を書いてください"
              className="mt-2 min-h-28 w-full resize-y rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#5C9E6E] focus:ring-2 focus:ring-[#A8D5B5]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-zinc-700">参考URL</span>
            <input
              type="url"
              value={referenceUrl}
              onChange={(event) => setReferenceUrl(event.target.value)}
              placeholder="https://..."
              className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#5C9E6E] focus:ring-2 focus:ring-[#A8D5B5]"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#5C9E6E] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#4D865D]"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
