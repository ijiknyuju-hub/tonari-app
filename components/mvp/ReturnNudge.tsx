'use client'

interface ReturnNudgeProps {
  dishName: string
  onRecord: () => void
  onDismiss: () => void
}

export function ReturnNudge({ dishName, onRecord, onDismiss }: ReturnNudgeProps) {
  return (
    <div
      className="mb-5 flex items-center justify-between rounded-2xl px-4 py-3"
      style={{
        background: 'var(--tn-surface)',
        border: '1px solid var(--tn-border)',
        boxShadow: 'var(--tn-shadow-soft)',
      }}
    >
      <p className="text-sm font-bold" style={{ color: 'var(--tn-text)' }}>
        昨日の{dishName}、作りましたか？
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onRecord}
          className="tn-primary-cta rounded-full px-3 py-1 text-xs font-bold"
        >
          作った!
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ color: 'var(--tn-text-sub)', background: 'var(--tn-surface)' }}
        >
          今度ね
        </button>
      </div>
    </div>
  )
}
