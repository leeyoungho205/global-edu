import { useState, useEffect } from 'react'
import MiniViewer from './MiniViewer'

// 정보 패널 탭 정의
const TABS = [
  { id: 'desc', label: '소개', icon: '📖' },
  { id: 'culture', label: '문화', icon: '🎎' },
  { id: 'food', label: '음식', icon: '🍽️' },
  { id: 'language', label: '언어', icon: '💬' },
]

/**
 * 선택된 랜드마크 정보를 보여주는 Glass UI 패널
 * - 상단: 인터랙티브 3D 미니 뷰어
 * - 탭: 소개 / 문화 / 음식 / 언어
 */
export default function InfoPanel({ data, onClose }) {
  const [tab, setTab] = useState('desc')

  // 랜드마크가 바뀌면 첫 탭으로 초기화
  useEffect(() => {
    setTab('desc')
  }, [data?.id])

  if (!data) return null

  // 현재 탭에 해당하는 본문 + 재미있는 사실
  const content = {
    desc: data.desc,
    culture: data.culture,
    food: data.food,
    language: data.language,
  }[tab]

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        top: '50%',
        right: '32px',
        transform: 'translateY(-50%)',
        width: '340px',
        maxHeight: '88vh',
        overflowY: 'auto',
        padding: '20px',
        borderRadius: '22px',
        borderColor: data.color + '55',
        boxShadow: `0 8px 40px ${data.color}33, 0 8px 32px rgba(0,0,0,0.4)`,
        animation: 'slideIn 0.4s ease',
      }}
    >
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.08)',
          color: '#cbd5e1',
          cursor: 'pointer',
          fontSize: '14px',
          zIndex: 2,
        }}
      >
        ✕
      </button>

      {/* 3D 미니 뷰어 */}
      <MiniViewer data={data} />

      {/* 나라 / 제목 */}
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          color: data.color,
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
      >
        {data.emoji} {data.country}
      </div>
      <h2 style={{ fontSize: '23px', fontWeight: 700, marginBottom: '14px' }}>
        {data.name}
      </h2>

      {/* 탭 버튼 */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: '7px 0',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '10px',
              cursor: 'pointer',
              border:
                tab === t.id
                  ? `1px solid ${data.color}`
                  : '1px solid rgba(255,255,255,0.1)',
              background:
                tab === t.id ? `${data.color}22` : 'rgba(255,255,255,0.04)',
              color: tab === t.id ? '#fff' : '#94a3b8',
              transition: 'all 0.2s',
            }}
          >
            {t.icon}
            <br />
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭 본문 */}
      <p
        style={{
          fontSize: '14px',
          lineHeight: 1.7,
          color: '#e2e8f0',
          minHeight: '60px',
        }}
      >
        {content}
      </p>

      {/* 재미있는 사실 */}
      <div
        style={{
          marginTop: '14px',
          padding: '12px 14px',
          borderRadius: '12px',
          background: `${data.color}15`,
          border: `1px dashed ${data.color}55`,
          fontSize: '13px',
          lineHeight: 1.6,
          color: '#cbd5e1',
        }}
      >
        💡 <strong>알고 있나요?</strong>
        <br />
        {data.funFact}
      </div>

      {/* 위치 정보 */}
      <div style={{ marginTop: '14px', fontSize: '12px', color: '#64748b' }}>
        📍 위도 {data.lat.toFixed(2)}, 경도 {data.lng.toFixed(2)}
      </div>
    </div>
  )
}
