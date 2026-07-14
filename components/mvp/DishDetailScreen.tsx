'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { dishes } from '@/data/v3'
import type { NearbyRelation } from '@/types/dish'
import { deriveRank, madeCountForDish, type DishRank } from '@/lib/mvp/rank'
import { useDishLibrary } from '@/lib/mvp/useDishLibrary'
import { sourceHostname, useRecipeSources, type RecipeSource } from '@/lib/mvp/useRecipeSources'
import { useUserState } from '@/lib/mvp/useUserState'
import CharTile from './CharTile'
import DishArt from './DishArt'
import RankChip from './RankChip'

type Ingredient = { name: string; amount: string }

type DishDetailScreenProps = {
  relation?: NearbyRelation
  dishId: string
  targetName: string
  sourceName?: string
}

export default function DishDetailScreen({ relation, dishId, targetName }: DishDetailScreenProps) {
  const router = useRouter()
  const { state, recordMade } = useUserState()
  const { overrides, customDishes, saveDishOverride } = useDishLibrary()
  const { sourcesByDish, addSource, removeSource } = useRecipeSources()
  const [showUrlForm, setShowUrlForm] = useState(false)
  const [draftUrl, setDraftUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [editingDraft, setEditingDraft] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)

  const customDish = customDishes.find((dish) => dish.id === dishId)
  const displayName = customDish?.name ?? targetName
  const override = overrides[dishId]
  const sources = sourcesByDish[dishId] ?? []
  const videos = sources.filter((source) => source.kind === 'youtube')
  const sites = sources.filter((source) => source.kind === 'site')
  const activeVideo = videos.find((source) => source.id === selectedVideoId) ?? videos[0]
  const sourceState: 'none' | 'youtube' | 'site' = videos.length ? 'youtube' : sites.length ? 'site' : 'none'
  const madeCount = madeCountForDish(state.made_records, dishId)
  const rank = deriveRank(madeCount)
  const ingredients = useMemo(() => recipeIngredients(relation, override?.ingredients_override, customDish?.ingredients), [customDish?.ingredients, override?.ingredients_override, relation])
  const steps = useMemo(() => recipeSteps(relation, override?.steps_override, customDish?.steps), [customDish?.steps, override?.steps_override, relation])
  const sideDishes = useMemo(() => dishes.filter((dish) => dish.id !== dishId && /soup|side/.test(dish.id)).slice(0, 3), [dishId])

  function saveUrl(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!addSource(dishId, draftUrl)) {
      setUrlError('https:// から始まるURLを入力してください。')
      return
    }
    setDraftUrl('')
    setUrlError('')
    setShowUrlForm(false)
  }

  return (
    <main className="tn-screen">
      <header className="mx-auto flex max-w-[402px] items-center justify-between px-4 pb-2 pt-[56px]">
        <button type="button" onClick={() => router.back()} aria-label="戻る" className="flex h-[38px] w-[38px] items-center justify-center rounded-full border bg-white text-[26px] leading-none text-[#1A1A1A]" style={{ borderColor: 'rgba(26,26,26,.10)' }}>‹</button>
        <button type="button" onClick={() => setEditingDraft((current) => !current)} className="rounded-full border bg-white px-[13px] py-2 text-[13px] font-bold text-[#5A554F]" style={{ borderColor: 'rgba(26,26,26,.14)' }}>{editingDraft ? '閉じる' : '下書きを整える'}</button>
      </header>

      <div className="mx-auto max-w-[402px] px-5 pb-[106px] pt-1">
        {sourceState === 'youtube' ? <VideoHero name={displayName} activeVideo={activeVideo} /> : <PhotoHero name={displayName} source={sites[0]} />}
        <h1 className="mt-4 text-[25px] font-bold leading-snug tracking-[.3px] text-[#1A1A1A]" style={{ fontFamily: 'var(--font-heading)' }}>{displayName}</h1>
        <p className="mt-[9px] text-[14px] leading-[1.75] text-[#7A7570]">{relation?.description_line1 ?? 'いつもの材料で、気負わずつくれる一皿です。'}</p>

        <RecipeCard
          ingredients={ingredients}
          steps={steps}
          source={sourceState === 'site' ? sites[0] : undefined}
          showNotice={sourceState === 'none'}
          editing={editingDraft}
          onSave={(nextIngredients, nextSteps) => {
            saveDishOverride(dishId, { ingredients_override: nextIngredients, steps_override: nextSteps, memo: override?.memo ?? '' })
            setEditingDraft(false)
          }}
        />

        {sourceState === 'youtube' ? (
          <VideoSources videos={videos} activeVideo={activeVideo} onSelect={setSelectedVideoId} onRemove={(source) => removeSource(dishId, source.id)} />
        ) : (
          <SavedSourceSection sites={sites} onRemove={(source) => removeSource(dishId, source.id)} />
        )}

        <UrlForm open={showUrlForm} value={draftUrl} error={urlError} onOpen={() => setShowUrlForm(true)} onCancel={() => { setShowUrlForm(false); setUrlError('') }} onChange={setDraftUrl} onSubmit={saveUrl} label={sourceState === 'youtube' ? '＋動画・URLを追加' : '＋URLを追加'} />

        <SideDishes dishes={sideDishes} />
        <RankAndRecord rank={rank} madeCount={madeCount} onMade={() => recordMade({ dish_id: dishId, made_at: new Date().toISOString(), rating: 'ok' })} />
      </div>
    </main>
  )
}

function PhotoHero({ name, source }: { name: string; source?: RecipeSource }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[12px]">
      <DishArt dish={name} seed={name} radius={12} />
      {source ? <a href={source.url} target="_blank" rel="noreferrer" className="absolute bottom-3 right-3 rounded-full bg-[#1A1A1A]/70 px-[10px] py-[5px] text-[11px] font-bold text-white">{sourceHostname(source.url)} を開く</a> : null}
    </div>
  )
}

function VideoHero({ name, activeVideo }: { name: string; activeVideo?: RecipeSource }) {
  return (
    <div className="flex snap-x snap-mandatory overflow-x-auto rounded-[12px] [scrollbar-width:none]">
      <div className="relative aspect-[16/10] w-full shrink-0 snap-center overflow-hidden"><DishArt dish={name} seed={name} radius={0} /><span className="absolute bottom-3 right-3 rounded-full bg-[#1A1A1A]/70 px-[10px] py-[5px] text-[11px] font-bold text-white">動画へスワイプ</span></div>
      <a href={activeVideo?.url} target="_blank" rel="noreferrer" className="relative aspect-[16/10] w-full shrink-0 snap-center overflow-hidden bg-[#1A1A1A]" aria-label="メイン動画を開く">
        <DishArt dish={`${name}-video`} seed={activeVideo?.id} radius={0} style={{ opacity: .62 }} />
        <span className="absolute left-3 top-3 rounded-full bg-[#1A1A1A]/70 px-[9px] py-1 text-[11px] font-bold text-white">作り方の動画</span>
        <span className="absolute inset-0 flex items-center justify-center text-[34px] text-white">▶</span>
        <span className="absolute bottom-3 left-3 right-3 text-[13px] font-bold text-white">{activeVideo ? sourceHostname(activeVideo.url) : 'メイン動画'}</span>
      </a>
    </div>
  )
}

function RecipeCard({ ingredients, steps, source, showNotice, editing, onSave }: { ingredients: Ingredient[]; steps: string[]; source?: RecipeSource; showNotice: boolean; editing: boolean; onSave: (ingredients: string[], steps: string[]) => void }) {
  return (
    <section className="mt-[20px] rounded-[12px] border p-4" style={{ borderColor: 'rgba(26,26,26,.12)' }}>
      <div className="flex items-center gap-2"><h2 className="m-0 text-[13px] font-bold text-[#1A1A1A]">レシピ（下書き）</h2>{source ? <a href={source.url} target="_blank" rel="noreferrer" className="ml-auto text-[11px] font-bold text-[#DE5528]">出典: {sourceHostname(source.url)} ↗</a> : null}</div>
      {editing ? <DraftEditor key={`${ingredients.map((item) => item.name).join('|')}-${steps.join('|')}`} ingredients={ingredients} steps={steps} onSave={onSave} /> : (
        <>
          {showNotice ? <p className="mt-3 rounded-[10px] bg-[#F7F5F2] p-[10px_12px] text-[11.5px] leading-[1.55] text-[#7A7570]">動画やレシピURLを貼って、あなたのレシピに育てましょう。作り方はいつでも整えられます。</p> : source ? <p className="mt-3 rounded-[10px] bg-[#F7F5F2] p-[10px_12px] text-[11.5px] leading-[1.55] text-[#7A7570]">要点を自分用の下書きにまとめています。分量やコツは出典のページも確認できます。</p> : null}
          <p className="mt-4 text-[12.5px] font-bold text-[#1A1A1A]">材料 <span className="ml-1 text-[11px] font-normal text-[#B7B2AC]">2人分</span></p>
          <div className="mt-[10px] space-y-2">{ingredients.map((ingredient) => <div key={`${ingredient.name}-${ingredient.amount}`} className="flex items-baseline gap-2 text-[12.5px]"><span className="font-semibold text-[#1A1A1A]">{ingredient.name}</span><span className="relative top-[-3px] flex-1 border-b border-dotted" style={{ borderColor: 'rgba(26,26,26,.22)' }} /><span className="whitespace-nowrap text-[#7A7570]">{ingredient.amount}</span></div>)}</div>
          <p className="mt-4 text-[12.5px] font-bold text-[#1A1A1A]">作り方</p>
          <ol className="mt-[11px] space-y-[11px]">{steps.map((step, index) => <li key={`${step}-${index}`} className="flex gap-[10px]"><span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FBEBDD] text-[11px] font-bold text-[#C25A20]">{index + 1}</span><p className="m-0 text-[12.5px] leading-[1.65] text-[#5A554F]">{step}</p></li>)}</ol>
        </>
      )}
    </section>
  )
}

function DraftEditor({ ingredients, steps, onSave }: { ingredients: Ingredient[]; steps: string[]; onSave: (ingredients: string[], steps: string[]) => void }) {
  const [ingredientText, setIngredientText] = useState(() => ingredients.map((item) => `${item.name} ${item.amount}`).join('\n'))
  const [stepText, setStepText] = useState(() => steps.join('\n'))

  return <form className="mt-3" onSubmit={(event) => { event.preventDefault(); onSave(lines(ingredientText), lines(stepText)) }}>
    <label className="block text-[12px] font-bold text-[#1A1A1A]">材料（1行ずつ）<textarea value={ingredientText} onChange={(event) => setIngredientText(event.target.value)} className="mt-1 min-h-24 w-full rounded-[9px] border p-2 text-[12px] text-[#1A1A1A]" style={{ borderColor: 'rgba(26,26,26,.16)' }} /></label>
    <label className="mt-3 block text-[12px] font-bold text-[#1A1A1A]">作り方（1行ずつ）<textarea value={stepText} onChange={(event) => setStepText(event.target.value)} className="mt-1 min-h-24 w-full rounded-[9px] border p-2 text-[12px] text-[#1A1A1A]" style={{ borderColor: 'rgba(26,26,26,.16)' }} /></label>
    <button type="submit" className="mt-3 rounded-[9px] border bg-white px-[14px] py-2 text-[12px] font-bold text-[#5A554F]" style={{ borderColor: 'rgba(26,26,26,.16)' }}>下書きを保存</button>
  </form>
}

function SavedSourceSection({ sites, onRemove }: { sites: RecipeSource[]; onRemove: (source: RecipeSource) => void }) {
  return (
    <section className="mt-[22px]"><SectionHeading>保存したレシピURL</SectionHeading>{sites.length ? <div className="mt-3 space-y-[9px]">{sites.map((source) => <div key={source.id} className="flex items-center gap-[11px] rounded-[11px] border p-[9px_11px]" style={{ borderColor: 'rgba(26,26,26,.12)' }}><CharTile name={sourceHostname(source.url)} size={38} radius={7} /><a href={source.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1"><div className="truncate text-[13px] font-bold text-[#1A1A1A]">{sourceHostname(source.url)}</div><div className="mt-0.5 truncate text-[11px] text-[#7A7570]">レシピサイトを開く ↗</div></a><button type="button" onClick={() => onRemove(source)} className="text-[11px] font-bold text-[#7A7570]">削除</button></div>)}</div> : <div className="mt-3 flex flex-col items-center gap-[6px] rounded-[12px] border border-dashed bg-[#FBFAF8] p-[18px] text-center" style={{ borderColor: 'rgba(26,26,26,.20)' }}><p className="m-0 text-[13px] font-bold text-[#7A7570]">まだURLはありません</p><p className="m-0 text-[11.5px] leading-[1.5] text-[#B7B2AC]">YouTubeやレシピサイトのURLを残すと、いつもの料理ページにまとまります。</p></div>}</section>
  )
}

function VideoSources({ videos, activeVideo, onSelect, onRemove }: { videos: RecipeSource[]; activeVideo?: RecipeSource; onSelect: (id: string) => void; onRemove: (source: RecipeSource) => void }) {
  return (
    <section className="mt-[22px]"><SectionHeading>作り方の動画</SectionHeading><p className="mt-2 text-[11.5px] text-[#7A7570]">タップしてメイン動画を切り替えられます。</p><div className="mt-3 space-y-[9px]">{videos.map((source) => { const active = activeVideo?.id === source.id; return <div key={source.id} className="flex items-center gap-[11px] rounded-[11px] border p-[9px_11px]" style={{ background: active ? '#FFF6F2' : '#FFFFFF', borderColor: active ? '#DE5528' : 'rgba(26,26,26,.12)', borderWidth: active ? 1.5 : 1 }}><button type="button" onClick={() => onSelect(source.id)} className="flex min-w-0 flex-1 items-center gap-[11px] text-left"><div className="relative h-[42px] w-[66px] shrink-0 overflow-hidden rounded-[7px] bg-[#1A1A1A]"><DishArt dish={source.url} seed={source.id} radius={7} style={{ opacity: .7 }} /><span className="absolute inset-0 flex items-center justify-center text-white">▶</span></div><span className="min-w-0"><span className="block truncate text-[13px] font-bold text-[#1A1A1A]">{sourceHostname(source.url)}</span><span className="mt-0.5 block text-[11px] text-[#7A7570]">YouTube</span></span></button><a href={source.url} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-[#DE5528]">開く</a><button type="button" onClick={() => onRemove(source)} className="text-[11px] font-bold text-[#7A7570]">削除</button></div> })}</div></section>
  )
}

function UrlForm({ open, value, error, onOpen, onCancel, onChange, onSubmit, label }: { open: boolean; value: string; error: string; onOpen: () => void; onCancel: () => void; onChange: (value: string) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; label: string }) {
  if (!open) return <button type="button" onClick={onOpen} className="mt-3 flex w-full items-center justify-center rounded-[12px] border border-dashed bg-[#FFF6F2] py-3 text-[13px] font-bold text-[#DE5528]" style={{ borderColor: 'rgba(222,85,40,.50)' }}>{label}</button>
  return <form onSubmit={onSubmit} className="mt-3 rounded-[12px] border p-3" style={{ borderColor: 'rgba(26,26,26,.12)' }}><label className="block text-[12px] font-bold text-[#1A1A1A]">URL<input autoFocus value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://..." inputMode="url" className="mt-2 w-full rounded-[9px] border px-3 py-2 text-[13px] outline-none" style={{ borderColor: 'rgba(26,26,26,.16)' }} /></label>{error ? <p className="mt-2 text-[11px] text-[#DE5528]">{error}</p> : null}<div className="mt-3 flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-[9px] px-3 py-2 text-[12px] font-bold text-[#7A7570]">キャンセル</button><button type="submit" className="rounded-[9px] bg-[#DE5528] px-3 py-2 text-[12px] font-bold text-white">保存</button></div></form>
}

function SideDishes({ dishes: sideDishes }: { dishes: typeof dishes }) {
  return <section className="mt-[22px]"><div className="flex items-baseline gap-2"><h2 className="m-0 text-[14px] font-bold text-[#1A1A1A]">あと一品</h2><span className="text-[12px] text-[#B7B2AC]">副菜・汁もの</span></div><div className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">{sideDishes.map((dish) => <Link key={dish.id} href={`/dish/${dish.id}`} className="w-[116px] shrink-0"><div className="aspect-[4/3] overflow-hidden rounded-[10px]"><DishArt dish={dish.name} seed={dish.id} radius={10} /></div><div className="mt-2 line-clamp-2 text-[13px] font-bold leading-[1.3] text-[#1A1A1A]">{dish.name}</div></Link>)}</div></section>
}

function RankAndRecord({ rank, madeCount, onMade }: { rank: DishRank; madeCount: number; onMade: () => void }) {
  return <section className="mb-2 mt-6 border-t pt-[18px]" style={{ borderColor: 'rgba(26,26,26,.09)' }}><div className="mb-[14px] flex items-center justify-between"><span className="text-[12px] text-[#7A7570]">いまのランク</span>{rank ? <span className="inline-flex overflow-hidden rounded-full border" style={{ borderColor: rank === 'regular' ? 'rgba(138,90,22,.22)' : 'rgba(26,26,26,.14)', background: rank === 'regular' ? '#FCF6EC' : '#FFFFFF' }}><RankChip rank={rank} style={{ border: 0, borderRadius: 0, padding: '5px 11px 5px 12px', width: 'auto', height: 'auto', transform: 'none', fontSize: 12.5 }} /><span className="border-l px-3 py-[5px] text-[12.5px] font-bold" style={{ borderColor: 'rgba(26,26,26,.12)', color: '#7A7570' }}>{madeCount}回</span></span> : <span className="rounded-full border px-3 py-[5px] text-[12px] font-bold text-[#7A7570]" style={{ borderColor: 'rgba(26,26,26,.14)' }}>はじめて</span>}</div><button type="button" onClick={onMade} className="w-full rounded-[12px] bg-[#DE5528] py-4 text-[17px] font-bold tracking-[1px] text-white" style={{ boxShadow: '0 6px 16px rgba(222,85,40,.28)' }}>作った</button></section>
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2"><h2 className="m-0 text-[13px] font-bold text-[#1A1A1A]">{children}</h2><span className="h-px flex-1 bg-[rgba(26,26,26,.1)]" /></div>
}

function recipeIngredients(relation?: NearbyRelation, override?: string[], custom?: string[]): Ingredient[] {
  const stored = override ?? custom
  if (stored?.length) return stored.map((value) => ({ name: value, amount: '適量' }))
  const names = relation?.new_ingredients?.length ? relation.new_ingredients : ['主な材料', '野菜', 'にんにく', '油', '塩', 'こしょう']
  return names.map((name, index) => ({ name, amount: index === 0 ? '2人分' : '適量' }))
}

function recipeSteps(relation?: NearbyRelation, override?: string[], custom?: string[]) {
  const stored = override ?? custom
  if (stored?.length) return stored
  return relation?.rough_steps?.length ? relation.rough_steps : ['材料を食べやすい大きさに切る。', 'フライパンで香りが立つまで炒める。', '味をととのえて、温かいうちに盛りつける。']
}

function lines(value: string) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean)
}
