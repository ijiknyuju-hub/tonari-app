<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# となりごはん — Codex 実装ガイド

自分のレパートリー起点で「近い料理」を提案し、作れる料理が増えていくアプリ。

## スタック
- Next.js 16 (App Router) + React 19
- Tailwind CSS v4
- TypeScript strict
- localStorage で永続化（バックエンドなし）
- Anthropic SDK（`app/api/suggest/route.ts` に封じ込め済み）

## ブランチ運用
- `main` = となりごはん本体（このブランチで作業する）
- `sekaishi-chizu` = 別アプリ（世界史マップ、触れない）

## ファイル構成（重要なもの）

```
app/
  page.tsx         ← ホーム（タブ型に改修中）
  layout.tsx       ← Next.js RootLayout（そのまま）
  api/suggest/     ← Anthropic提案API（触らない）
  api/og/          ← OGP（触らない）
  share/           ← シェアページ（触らない）
components/
  AddDishPanel.tsx     ← 旧サイドバー（統合 or 廃止の方向）
  RecipeEditModal.tsx  ← 料理カード編集（新スキーマへ更新）
  RecipeFlow.tsx       ← 旧グラフ（フローマップ保留用、削除しない）
  RecipeNode.tsx       ← 旧グラフノード（削除しない）
  ─── 新規コンポーネントはここに追加 ───
lib/
  types.ts     ← 型定義（新モデルへ刷新）
  storage.ts   ← localStorage操作（型変更に追従）
  presets.ts   ← プリセットデータ（新スキーマへ再構成）
  layout.ts    ← dagre（フローマップ保留用、触らない）
  ─── 新規ユーティリティはここに追加 ───
```

## 新データモデル（lib/types.ts の目標形）

```ts
export type Effort = 1 | 2 | 3

export interface DishAxes {
  seasoning: string   // 味付け
  ingredient: string  // 食材
  method: string      // 調理方法
}

export type Arrangement = {
  id: string
  name: string
  reason: string
  type: 'generic' | 'specific'
}

export type DishStatus = 'cooked' | 'want'

export interface Dish {
  id: string
  name: string
  category: string
  axes: DishAxes
  effort: Effort
  summary?: string
  fromDishId?: string | null
  changePoint?: string
  newIngredients?: string
  ingredients?: string
  steps?: string
  referenceUrl?: string
  note?: string
  photoUri?: string
  arrangements: Arrangement[]
  status: DishStatus
  cookedAt?: string
  createdAt: string
}

export interface AppState {
  dishes: Dish[]
  lastUpdated: string
}
```

## コーディングルール
- コメントは書かない（型と名前で自明にする）
- `console.log` は残さない
- localStorage 操作は必ず try/catch で囲む
- Tailwind CSS v4 のクラスを使う（CSS modules 不要）
- `any` 型は使わない
