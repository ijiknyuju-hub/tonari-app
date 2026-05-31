'use client'

import { MouseEvent } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { RecipeNode as RecipeNodeData } from '@/lib/types'

const statusClassNames: Record<RecipeNodeData['status'], string> = {
  cooked: 'border-[#5C9E6E] bg-[#5C9E6E] text-white',
  want: 'border-[#A8D5B5] bg-[#A8D5B5] text-[#333]',
  suggested: 'border-dashed border-[#D1D5DB] bg-[#F3F4F6] text-[#999]',
}

export default function RecipeNode({ data, isConnectable }: NodeProps<RecipeNodeData>) {
  function handleEditClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    event.currentTarget.dispatchEvent(
      new CustomEvent('recipe-edit', { bubbles: true, detail: { nodeId: data.id } }),
    )
  }

  function handleReferenceClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()

    if (data.referenceUrl) {
      window.open(data.referenceUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      className={`relative w-[180px] min-h-[60px] rounded-lg border px-3 py-2 shadow-sm ${statusClassNames[data.status]}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="pointer-events-none opacity-0"
      />
      <button
        type="button"
        onClick={handleEditClick}
        className="absolute right-1 top-1 rounded px-1 text-xs leading-none opacity-80 transition hover:bg-white/40 hover:opacity-100"
        aria-label={`${data.name}を編集`}
      >
        ✏️
      </button>
      <div className="pr-5 text-sm font-bold leading-5">{data.name}</div>
      <div className="mt-1 line-clamp-2 overflow-hidden text-xs leading-4">{data.reason}</div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {data.status === 'suggested' ? (
          <button
            type="button"
            className="rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-[#5C9E6E] shadow-sm transition hover:bg-white"
            aria-label={`${data.name}を作った料理にする`}
          >
            + 作った
          </button>
        ) : (
          <span />
        )}
        {data.referenceUrl ? (
          <button
            type="button"
            onClick={handleReferenceClick}
            className="rounded-full bg-white/70 px-2 py-1 text-xs shadow-sm transition hover:bg-white"
            aria-label={`${data.name}の参考URLを開く`}
          >
            🔗
          </button>
        ) : null}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="pointer-events-none opacity-0"
      />
    </div>
  )
}
