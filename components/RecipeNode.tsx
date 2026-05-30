'use client'

import { Handle, Position, type NodeProps } from 'reactflow'
import type { RecipeNode as RecipeNodeData } from '@/lib/types'

const statusClassNames: Record<RecipeNodeData['status'], string> = {
  cooked: 'border-[#5C9E6E] bg-[#5C9E6E] text-white',
  want: 'border-[#A8D5B5] bg-[#A8D5B5] text-[#333]',
  suggested: 'border-dashed border-[#D1D5DB] bg-[#F3F4F6] text-[#999]',
}

export default function RecipeNode({ data, isConnectable }: NodeProps<RecipeNodeData>) {
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
      <div className="text-sm font-bold leading-5">{data.name}</div>
      <div className="mt-1 line-clamp-2 overflow-hidden text-xs leading-4">{data.reason}</div>
      {data.status === 'suggested' ? (
        <button
          type="button"
          className="mt-2 rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-[#5C9E6E] shadow-sm transition hover:bg-white"
          aria-label={`${data.name}を作った料理にする`}
        >
          + 作った
        </button>
      ) : null}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="pointer-events-none opacity-0"
      />
    </div>
  )
}
