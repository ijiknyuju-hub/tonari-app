import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { performance } from 'node:perf_hooks'

const ROOT = process.cwd()
const INPUT_PATH = path.join(ROOT, 'docs', 'validations', 'gemini-dish-prompt-cases.json')
const OUTPUT_DIR = path.join(ROOT, 'design', 'gemini-dish-style-test')
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json')
const DEFAULT_MODEL = 'gemini-3.1-flash-image'

async function loadLocalEnv() {
  try {
    const text = await fs.readFile(path.join(ROOT, '.env.local'), 'utf8')
    return Object.fromEntries(text.split(/\r?\n/).flatMap((line) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!match) return []
      const value = match[2].replace(/^(['"])(.*)\1$/, '$2')
      return [[match[1], value]]
    }))
  } catch {
    return {}
  }
}

function findImageBlock(payload) {
  for (const step of payload?.steps ?? []) {
    for (const block of step?.content ?? []) {
      if (block?.type === 'image' && block?.data) return block
    }
  }
  return null
}

async function generateImage({ apiKey, model, prompt }) {
  const startedAt = performance.now()
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      model,
      input: [{ type: 'text', text: prompt }],
      response_format: {
        type: 'image',
        mime_type: 'image/png',
        aspect_ratio: '4:3',
        image_size: '1K',
      },
    }),
    signal: AbortSignal.timeout(240_000),
  })
  const payload = await response.json()
  const latencyMs = Math.round(performance.now() - startedAt)
  if (!response.ok) throw new Error(payload?.error?.message ?? `HTTP ${response.status}`)

  const image = findImageBlock(payload)
  if (!image) throw new Error('Gemini response did not contain an image block')
  return {
    bytes: Buffer.from(image.data, 'base64'),
    mimeType: image.mime_type ?? image.mimeType ?? 'image/png',
    latencyMs,
    interactionId: payload.id ?? '',
    usage: payload.usage ?? payload.usage_metadata ?? null,
  }
}

async function main() {
  const config = JSON.parse(await fs.readFile(INPUT_PATH, 'utf8'))
  const localEnv = await loadLocalEnv()
  const apiKey = process.env.GEMINI_API_KEY || localEnv.GEMINI_API_KEY || ''
  const model = process.env.GEMINI_IMAGE_MODEL || localEnv.GEMINI_IMAGE_MODEL || DEFAULT_MODEL
  const selectedDishId = process.argv.find((argument) => argument.startsWith('--dish='))?.slice('--dish='.length)
  const candidateArgument = process.argv.find((argument) => argument.startsWith('--candidates='))?.slice('--candidates='.length)
  const candidateCount = Math.min(3, Math.max(1, Number.parseInt(candidateArgument || '1', 10) || 1))
  const cases = selectedDishId ? config.cases.filter((item) => item.dish_id === selectedDishId) : config.cases

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Set it in .env.local or the process environment; never commit the value.')
  }
  if (selectedDishId && cases.length === 0) throw new Error(`dish not found: ${selectedDishId}`)

  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  const records = []
  console.log(`Gemini illustration validation: ${cases.length} dishes x ${candidateCount} candidate(s), model=${model}`)

  for (const dish of cases) {
    const prompt = [
      config.base_style,
      `Dish: ${dish.dish_name}.`,
      `Required visual facts: ${dish.must_include}`,
      `Dish-specific exclusions: ${dish.must_avoid}`,
      'Create one finished illustration only.',
    ].join('\n\n')

    for (let index = 1; index <= candidateCount; index += 1) {
      const generated = await generateImage({ apiKey, model, prompt })
      const extension = generated.mimeType.includes('jpeg') ? 'jpg' : 'png'
      const fileName = `${dish.dish_id}-${String(index).padStart(2, '0')}.${extension}`
      await fs.writeFile(path.join(OUTPUT_DIR, fileName), generated.bytes)
      records.push({
        dish_id: dish.dish_id,
        dish_name: dish.dish_name,
        candidate_id: index,
        file: fileName,
        prompt_version: config.prompt_version,
        prompt,
        diagnostic: dish.diagnostic,
        model,
        generated_at: new Date().toISOString(),
        latency_ms: generated.latencyMs,
        interaction_id: generated.interactionId,
        usage: generated.usage,
      })
      console.log(`${dish.dish_id} candidate ${index}: ${fileName} (${generated.latencyMs}ms)`)
    }
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify({
    generated_at: new Date().toISOString(),
    model,
    prompt_version: config.prompt_version,
    records,
  }, null, 2) + '\n')
  console.log(`Wrote ${path.relative(ROOT, MANIFEST_PATH)}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
