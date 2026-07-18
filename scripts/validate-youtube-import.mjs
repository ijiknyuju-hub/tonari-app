import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { performance } from 'node:perf_hooks'

const ROOT = process.cwd()
const INPUT_PATH = path.join(ROOT, 'docs', 'validations', 'youtube-recipe-import-cases.csv')
const OUTPUT_JSON_PATH = path.join(ROOT, 'docs', 'validations', 'youtube-recipe-import-results.json')
const OUTPUT_CSV_PATH = path.join(ROOT, 'docs', 'validations', 'youtube-recipe-import-results.csv')
const DEFAULT_MODEL = 'gemini-3.5-flash'

const EXTRACTION_PROMPT = `
この公開YouTube動画を、家庭料理レシピの参考情報として解析してください。
映像と音声で明示された情報だけを使い、推測した分量を事実のように補わないでください。
料理動画でなければ is_recipe_video=false とし、料理情報は空配列にしてください。

次のJSONだけを返してください。
{
  "is_recipe_video": true,
  "confidence": 0.0,
  "dishes": [
    {
      "name": "料理名",
      "ingredients": [{"name":"材料名","amount":"明示された分量。不明なら不明","evidence":"audio|visual|text|unknown"}],
      "steps": [{"order":1,"text":"手順","timestamp":"MM:SSまたは不明"}],
      "tips": ["明示されたコツ"],
      "uncertainties": ["省略・不明・矛盾している点"]
    }
  ],
  "summary": "短い要約",
  "failure_reason": null
}`.trim()

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell)
      if (row.some((value) => value !== '')) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }

  const [headers, ...dataRows] = rows
  return dataRows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
}

function csvCell(value) {
  const text = value == null ? '' : String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function toCsv(rows, columns) {
  return [columns.join(','), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(','))].join('\n') + '\n'
}

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

function parseJsonResponse(text) {
  const trimmed = text.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(trimmed)
}

async function fetchOEmbed(url) {
  const startedAt = performance.now()
  const endpoint = new URL('https://www.youtube.com/oembed')
  endpoint.searchParams.set('url', url)
  endpoint.searchParams.set('format', 'json')

  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(15_000) })
    const latencyMs = Math.round(performance.now() - startedAt)
    if (!response.ok) {
      return { status: 'failed', http_status: response.status, latency_ms: latencyMs, error: `HTTP ${response.status}` }
    }
    const payload = await response.json()
    return {
      status: 'ok',
      http_status: response.status,
      latency_ms: latencyMs,
      title: payload.title ?? '',
      author_name: payload.author_name ?? '',
      author_url: payload.author_url ?? '',
      thumbnail_url: payload.thumbnail_url ?? '',
    }
  } catch (error) {
    return {
      status: 'failed',
      http_status: '',
      latency_ms: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function extractWithGemini({ url, apiKey, model }) {
  if (!apiKey) return { status: 'skipped_missing_key', model, latency_ms: 0 }

  const startedAt = performance.now()
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { file_data: { file_uri: url } },
            { text: EXTRACTION_PROMPT },
          ],
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
      signal: AbortSignal.timeout(180_000),
    })
    const latencyMs = Math.round(performance.now() - startedAt)
    const payload = await response.json()

    if (!response.ok) {
      return {
        status: 'failed',
        model,
        http_status: response.status,
        latency_ms: latencyMs,
        error: payload?.error?.message ?? `HTTP ${response.status}`,
      }
    }

    const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? ''
    return {
      status: 'ok',
      model,
      http_status: response.status,
      latency_ms: latencyMs,
      usage: payload.usageMetadata ?? null,
      extraction: parseJsonResponse(text),
    }
  } catch (error) {
    return {
      status: 'failed',
      model,
      http_status: '',
      latency_ms: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function main() {
  const input = await fs.readFile(INPUT_PATH, 'utf8')
  const cases = parseCsv(input).filter((testCase) => testCase.case_id && testCase.url)
  const selectedCaseId = process.argv.find((argument) => argument.startsWith('--case='))?.slice('--case='.length)
  const selectedCases = selectedCaseId ? cases.filter((testCase) => testCase.case_id === selectedCaseId) : cases
  if (selectedCaseId && selectedCases.length === 0) throw new Error(`case not found: ${selectedCaseId}`)

  const localEnv = await loadLocalEnv()
  const apiKey = process.env.GEMINI_API_KEY || localEnv.GEMINI_API_KEY || ''
  const model = process.env.GEMINI_VIDEO_MODEL || localEnv.GEMINI_VIDEO_MODEL || DEFAULT_MODEL
  const results = []

  console.log(`YouTube import validation: ${selectedCases.length} cases, Gemini ${apiKey ? 'enabled' : 'skipped (GEMINI_API_KEY missing)'}`)
  for (const testCase of selectedCases) {
    const oembed = await fetchOEmbed(testCase.url)
    const gemini = oembed.status === 'ok'
      ? await extractWithGemini({ url: testCase.url, apiKey, model })
      : { status: 'skipped_oembed_failed', model, latency_ms: 0 }
    results.push({ ...testCase, measured_at: new Date().toISOString(), oembed, gemini })
    console.log(`${testCase.case_id}: oEmbed=${oembed.status} (${oembed.latency_ms}ms), Gemini=${gemini.status}${gemini.latency_ms ? ` (${gemini.latency_ms}ms)` : ''}`)
  }

  await fs.writeFile(OUTPUT_JSON_PATH, JSON.stringify({
    generated_at: new Date().toISOString(),
    gemini_enabled: Boolean(apiKey),
    gemini_model: model,
    results,
  }, null, 2) + '\n')

  const csvRows = results.map((result) => ({
    case_id: result.case_id,
    category: result.category,
    url: result.url,
    expected_dish_names: result.expected_dish_names,
    oembed_status: result.oembed.status,
    oembed_http_status: result.oembed.http_status,
    oembed_latency_ms: result.oembed.latency_ms,
    oembed_title: result.oembed.title,
    oembed_author: result.oembed.author_name,
    gemini_status: result.gemini.status,
    gemini_model: result.gemini.model,
    gemini_latency_ms: result.gemini.latency_ms,
    detected_recipe: result.gemini.extraction?.is_recipe_video,
    detected_dishes: result.gemini.extraction?.dishes?.map((dish) => dish.name).join(' / '),
    failure_reason: result.oembed.error || result.gemini.error || result.gemini.extraction?.failure_reason || '',
  }))
  await fs.writeFile(OUTPUT_CSV_PATH, toCsv(csvRows, [
    'case_id', 'category', 'url', 'expected_dish_names', 'oembed_status', 'oembed_http_status',
    'oembed_latency_ms', 'oembed_title', 'oembed_author', 'gemini_status', 'gemini_model',
    'gemini_latency_ms', 'detected_recipe', 'detected_dishes', 'failure_reason',
  ]))

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON_PATH)} and ${path.relative(ROOT, OUTPUT_CSV_PATH)}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
