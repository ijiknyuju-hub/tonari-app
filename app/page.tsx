const lineFriendUrl =
  process.env.NEXT_PUBLIC_LINE_FRIEND_URL ??
  // TODO: set NEXT_PUBLIC_LINE_FRIEND_URL
  'https://lin.ee/PLACEHOLDER'

const ctaLabel = '縲鍬INE縺ｧ隧ｦ縺励※縺ｿ繧九・'

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
        <p className="mb-5 text-sm font-bold text-[#6d6a5f]">縺ｨ縺ｪ繧翫＃縺ｯ繧・</p>
        <h1 className="text-balance text-4xl font-black leading-[1.15] tracking-normal text-[#252018] sm:text-6xl">
          縺・▽繧ゅ・譁咏炊縺九ｉ縲∵ｬ｡縺ｮ荳蜩√∈縲・
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#4d463b]">
          蜚先恕縺偵′菴懊ｌ繧九↑繧峨∵ｬ｡縺ｯ豐ｹ豺矩ｶ上・繧ｫ繝ｬ繝ｼ縺御ｽ懊ｌ繧九↑繧峨∵ｬ｡縺ｯ繝峨Λ繧､繧ｫ繝ｬ繝ｼ縲・繝√Ε繝ｼ繝上Φ縺御ｽ懊ｌ繧九↑繧峨∵ｬ｡縺ｯ螟ｩ豢･鬟ｯ縲・
        </p>
        <div className="mt-9">
          <LineCta />
        </div>
      </section>

      <section className="border-y border-[#e7dfcf] bg-[#f8f0df] px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-6 text-base leading-8 text-[#3f382f] sm:text-lg sm:leading-9">
          <p>
            蜚先恕縺偵′菴懊ｌ繧九↑繧峨∵ｬ｡縺ｯ豐ｹ豺矩ｶ上・繧ｫ繝ｬ繝ｼ縺御ｽ懊ｌ繧九↑繧峨∵ｬ｡縺ｯ繝峨Λ繧､繧ｫ繝ｬ繝ｼ縲・繝√Ε繝ｼ繝上Φ縺御ｽ懊ｌ繧九↑繧峨∵ｬ｡縺ｯ螟ｩ豢･鬟ｯ縲・
          </p>
          <p>
            菴懊ｌ繧区侭逅・ｒ逋ｻ骭ｲ縺吶ｋ縺ｨ縲・蟆代＠螟峨∴繧後・菴懊ｌ縺昴≧縺ｪ蛟呵｣懊ｒ謠先｡医＠縺ｾ縺吶・
          </p>
          <p>
            菴懊ｊ縺溘＞譁咏炊縺ｯ菫晏ｭ倥・謨ｰ譌･蠕後↓荳蠎ｦ縺縺第昴＞蜃ｺ縺励∪縺吶・菴懊▲縺溘ｉ縲√≠縺ｪ縺溘・繝ｬ繝代・繝医Μ繝ｼ縺悟｢励∴縺ｦ縺・″縺ｾ縺吶・
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
          {['縲瑚ｦ壹∴縺ｦ縺・※縺上ｌ繧・', '諤昴＞蜃ｺ縺輔○縺ｦ縺上ｌ繧・', '菴懊▲縺溘ｉ闢・ｩ阪＠縺ｦ縺上ｌ繧九・'].map(
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
          縲檎樟蝨ｨ縺ｯ蜈郁｡御ｽ馴ｨ鍋沿縺ｧ縺吶ょ・逹10蜷咲ｨ句ｺｦ繝ｻ謇句虚縺ｧ縺疲｡亥・縺励∪縺吶ゅ・
        </p>
      </section>

      <section className="px-5 pb-16 pt-6 text-center sm:px-8">
        <LineCta />
      </section>
    </main>
  )
}
