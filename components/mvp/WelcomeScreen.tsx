'use client'

interface WelcomeScreenProps {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <main className="tn-screen">
      <div className="tn-container flex min-h-screen flex-col items-center justify-center py-10">
        {/* Large emoji */}
        <div className="mb-6 text-6xl">🍳</div>

        {/* Title */}
        <h1
          className="mb-3 text-center text-2xl font-black"
          style={{ color: 'var(--tn-text)' }}
        >
          となりごはんへようこそ
        </h1>

        {/* Subtitle */}
        <p
          className="mb-8 whitespace-pre-line text-center text-sm font-bold leading-7"
          style={{ color: 'var(--tn-text-sub)' }}
        >
          {'いつもの料理から「ちょっと広げる」\n新しいレシピに出会えるアプリです。'}
        </p>

        {/* 3-step explanation box */}
        <div
          className="tn-surface-soft mb-8 w-full space-y-3 px-5 py-5"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">🧑‍🍳</span>
            <span
              className="text-sm font-bold leading-6"
              style={{ color: 'var(--tn-text)' }}
            >
              よく作る料理を選ぶ
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">→</span>
            <span
              className="text-sm font-bold leading-6"
              style={{ color: 'var(--tn-text)' }}
            >
              あなたに近い料理が見つかる
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">♡</span>
            <span
              className="text-sm font-bold leading-6"
              style={{ color: 'var(--tn-text)' }}
            >
              少しずつレパートリーが広がる
            </span>
          </div>
        </div>

        {/* Start button */}
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-2xl py-4 text-base font-black text-white shadow-md transition active:opacity-80"
          style={{ background: 'var(--tn-accent)' }}
        >
          はじめる
        </button>
      </div>
    </main>
  )
}
