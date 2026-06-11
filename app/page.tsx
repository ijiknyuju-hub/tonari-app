const lineFriendUrl =
  process.env.NEXT_PUBLIC_LINE_FRIEND_URL ??
  // TODO: set NEXT_PUBLIC_LINE_FRIEND_URL
  'https://lin.ee/PLACEHOLDER'

const ctaLabel = 'LINEで試してみる'

function LineCta() {
  return (
    <a
      href={lineFriendUrl}
      className="inline-flex min-h-12 w-full max-w-[22rem] items-center justify-center rounded-full bg-[#06C755] px-6 py-3 text-center text-base font-bold leading-tight text-white shadow-[0_10px_24px_rgba(6,199,85,0.24)] transition hover:bg-[#05b94f] focus:outline-none focus:ring-4 focus:ring-[#06C755]/25"
      rel="noreferrer"
    >
      {ctaLabel}
    </a>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffdf7] text-[#252018]">
      <section className="mx-auto flex min-h-[76vh] w-full max-w-3xl flex-col justify-center px-5 py-14 sm:px-8">
        <p className="mb-5 text-sm font-bold text-[#6d6a5f]">となりごはん</p>
        <h1 className="text-balance text-4xl font-black leading-[1.15] tracking-normal text-[#252018] sm:text-6xl">
          いつもの料理から、次の一品へ。
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#4d463b]">
          唐揚げが作れるなら、次は油淋鶏。
          <br />
          カレーが作れるなら、次はドライカレー。
          <br />
          チャーハンが作れるなら、次は天津飯。
        </p>
        <div className="mt-9">
          <LineCta />
        </div>
      </section>

      <section className="border-y border-[#e7dfcf] bg-[#f8f0df] px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-6 text-base leading-8 text-[#3f382f] sm:text-lg sm:leading-9">
          <p>
            唐揚げが作れるなら、次は油淋鶏。
            <br />
            カレーが作れるなら、次はドライカレー。
            <br />
            チャーハンが作れるなら、次は天津飯。
          </p>
          <p>
            作れる料理を登録すると、
            <br />
            少し変えれば作れそうな候補を提案します。
          </p>
          <p>
            作りたい料理は保存。
            <br />
            数日後に一度だけ思い出します。
            <br />
            作ったら、あなたのレパートリーが増えていきます。
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
          {['覚えていてくれる', '思い出させてくれる', '作ったら記録してくれる'].map(
            (step, index) => (
              <div key={step} className="rounded-lg border border-[#e7dfcf] bg-white px-5 py-5">
                <p className="text-sm font-bold text-[#9b6b26]">0{index + 1}</p>
                <p className="mt-3 text-base font-bold leading-7 text-[#252018]">{step}</p>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="px-5 pb-8 sm:px-8">
        <p className="mx-auto max-w-3xl rounded-lg bg-[#eef7ee] px-5 py-4 text-sm font-bold leading-7 text-[#2d5b35]">
          現在は先行体験版です。先着10名程度・手動でご案内します。
        </p>
      </section>

      <section className="px-5 pb-16 pt-6 text-center sm:px-8">
        <LineCta />
      </section>
    </main>
  )
}
