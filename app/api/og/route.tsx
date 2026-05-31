import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const count = Number(searchParams.get('count') ?? '0')
  const dishesParam = searchParams.get('dishes') ?? ''
  const dishes = dishesParam
    ? dishesParam
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean)
        .slice(0, 8)
    : []

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #F7F8F5 0%, #E8F4EC 100%)',
          fontFamily: 'sans-serif',
          padding: 60,
        }}
      >
        {/* タイトル */}
        <div
          style={{
            fontSize: 28,
            color: '#315E3D',
            fontWeight: 'bold',
            letterSpacing: '0.05em',
            marginBottom: 12,
          }}
        >
          となりごはん
        </div>

        {/* メイン数字 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 96, color: '#5C9E6E', fontWeight: 'bold', lineHeight: 1 }}>
            {count}
          </span>
          <span style={{ fontSize: 36, color: '#5C9E6E', fontWeight: 'bold' }}>品</span>
        </div>

        <div style={{ fontSize: 22, color: '#666', marginBottom: 40 }}>
          作れる料理が増えました🌿
        </div>

        {/* 料理タグ */}
        {dishes.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'center',
              maxWidth: 900,
            }}
          >
            {dishes.map((dish, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#5C9E6E',
                  color: 'white',
                  padding: '10px 22px',
                  borderRadius: 9999,
                  fontSize: 22,
                  fontWeight: 'bold',
                }}
              >
                {dish}
              </div>
            ))}
          </div>
        ) : null}

        {/* フッター */}
        <div style={{ fontSize: 18, color: '#999', marginTop: 48 }}>
          tonari-app-fawn.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
