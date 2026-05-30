import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

type Suggestion = {
  name: string
  reason: string
}

type SuggestResponse = {
  variations: Suggestion[]
  adjacent: Suggestion[]
}

type SuggestRequest = {
  dish?: unknown
  existingDishes?: unknown
}

function isSuggestion(value: unknown): value is Suggestion {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'reason' in value &&
    typeof value.name === 'string' &&
    typeof value.reason === 'string'
  )
}

function isSuggestResponse(value: unknown): value is SuggestResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'variations' in value &&
    'adjacent' in value &&
    Array.isArray(value.variations) &&
    Array.isArray(value.adjacent) &&
    value.variations.every(isSuggestion) &&
    value.adjacent.every(isSuggestion)
  )
}

function parseJsonResponse(text: string): SuggestResponse {
  try {
    const parsed = JSON.parse(text)

    if (isSuggestResponse(parsed)) {
      return parsed
    }
  } catch {
    const match = text.match(/\{[\s\S]*\}/)

    if (match) {
      const parsed = JSON.parse(match[0])

      if (isSuggestResponse(parsed)) {
        return parsed
      }
    }
  }

  throw new Error('Claude API returned an unexpected response format.')
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured.' },
        { status: 500 },
      )
    }

    const body = (await request.json()) as SuggestRequest
    const dish = typeof body.dish === 'string' ? body.dish.trim() : ''
    const existingDishes = Array.isArray(body.existingDishes)
      ? body.existingDishes.filter((item): item is string => typeof item === 'string')
      : []

    if (!dish) {
      return NextResponse.json({ error: 'dish is required.' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey })
    const prompt = `あなたは日本の家庭料理アドバイザーです。

ユーザーが「${dish}」を作れます。
以下を提案してください。

【バリエーション（5つ）】
同じ料理の調味料・仕上げ・風味違い。調理技術はほぼ同じ。

【隣の料理（3つ）】
似た調理技術を使う別の料理。少しだけ難しくなる。

制約：
- 既に作れる料理は除外: ${existingDishes.join(', ')}
- 一文で理由を説明すること（例：「醤油ベースを塩に変えるだけ」）
- 難しすぎない提案にすること

必ずJSON形式のみで返してください（前後の説明不要）：
{
  "variations": [{"name": "...", "reason": "..."}],
  "adjacent": [{"name": "...", "reason": "..."}]
}`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')

    return NextResponse.json(parseJsonResponse(text))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
