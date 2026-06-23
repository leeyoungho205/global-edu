import { useState, useMemo } from 'react'
import Scene from './components/Scene'
import InfoPanel from './components/InfoPanel'
import { landmarks, continents } from './data/landmarks'

// UI 문구 다국어 (한/영)
const STR = {
  ko: {
    title: '글로벌 3D 지구본',
    subtitle: '세계 여행 간접 체험 학습',
    borders: '나라 경계선',
    labels: '국가·수도 이름',
    language: '언어',
    hintDrag: '드래그: 회전 · 휠: 확대/축소',
    hintClick: '마커 클릭: 랜드마크 탐험',
  },
  en: {
    title: 'Global 3D Globe',
    subtitle: 'Explore the world from your screen',
    borders: 'Country borders',
    labels: 'Country & capital',
    language: 'Language',
    hintDrag: 'Drag: rotate · Wheel: zoom',
    hintClick: 'Click a marker to explore',
  },
}

/**
 * 앱 루트 — 3D 지구본 씬 + Glass UI 오버레이
 */
export default function App() {
  const [selected, setSelected] = useState(null) // 선택된 랜드마크
  const [continent, setContinent] = useState('all') // 대륙 필터
  const [lang, setLang] = useState('ko') // 언어
  const [showBorders, setShowBorders] = useState(true) // 경계선 표시
  const [showLabels, setShowLabels] = useState(true) // 라벨 표시

  const t = STR[lang]

  // 대륙 필터에 맞는 랜드마크만 표시
  const visibleLandmarks = useMemo(
    () =>
      continent === 'all'
        ? landmarks
        : landmarks.filter((lm) => lm.continent === continent),
    [continent]
  )

  const handleContinent = (id) => {
    setContinent(id)
    setSelected(null)
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translate(20px, -50%); }
          to { opacity: 1; transform: translate(0, -50%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
        .ui-btn { transition: all 0.22s cubic-bezier(.4,0,.2,1); }
        .ui-btn:hover { transform: translateY(-1px); filter: brightness(1.15); }
        /* 화면 가장자리 비네팅 (몰입감) */
        .vignette {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(circle at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%);
        }
      `}</style>

      {/* 3D 지구본 */}
      <Scene
        selected={selected}
        onSelect={setSelected}
        landmarks={visibleLandmarks}
        lang={lang}
        showBorders={showBorders}
        showLabels={showLabels}
      />
      <div className="vignette" />

      {/* 좌측 컨트롤 컬럼 — 타이틀 · 설정(언어/레이어) · 대륙 필터를 한곳에 모음 */}
      <div
        style={{
          position: 'absolute', top: '24px', left: '24px', bottom: '24px',
          display: 'flex', flexDirection: 'column', gap: '12px',
          width: '210px', overflowY: 'auto', paddingRight: '4px',
        }}
      >
        {/* 타이틀 */}
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '16px', flexShrink: 0 }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#93c5fd', textShadow: '0 0 14px rgba(96,165,250,0.6)' }}>
            🌍 {t.title}
          </h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{t.subtitle}</p>
        </div>

        {/* 설정: 언어 + 레이어 토글 (지구본 박스 아래 배치) */}
        <div
          className="glass-panel"
          style={{ padding: '14px 16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}
        >
          {/* 언어 토글 */}
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>
              🌐 {t.language}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                ['ko', '한국어'],
                ['en', 'English'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  className="ui-btn"
                  onClick={() => setLang(id)}
                  style={{
                    flex: 1, padding: '7px 0', fontSize: '12px', fontWeight: 600, borderRadius: '9px', cursor: 'pointer',
                    border: lang === id ? '1px solid #93c5fd' : '1px solid rgba(255,255,255,0.1)',
                    background: lang === id ? 'rgba(147,197,253,0.2)' : 'rgba(255,255,255,0.04)',
                    color: lang === id ? '#fff' : '#94a3b8',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 레이어 토글 */}
          <Toggle label={t.borders} on={showBorders} onClick={() => setShowBorders((v) => !v)} />
          <Toggle label={t.labels} on={showLabels} onClick={() => setShowLabels((v) => !v)} />
        </div>

        {/* 대륙 필터 */}
        <div
          className="glass-panel"
          style={{ padding: '10px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}
        >
          {continents.map((c) => (
            <button
              key={c.id}
              className="ui-btn"
              onClick={() => handleContinent(c.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px',
                fontSize: '13px', fontWeight: 600, borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                border: continent === c.id ? '1px solid #93c5fd' : '1px solid transparent',
                background: continent === c.id ? 'rgba(147,197,253,0.18)' : 'rgba(255,255,255,0.04)',
                color: continent === c.id ? '#fff' : '#94a3b8',
                boxShadow: continent === c.id ? '0 0 14px rgba(147,197,253,0.35)' : 'none',
              }}
            >
              <span style={{ fontSize: '16px' }}>{c.emoji}</span>{' '}
              {lang === 'en' ? c.nameEn : c.name}
            </button>
          ))}
        </div>
      </div>

      {/* 하단 랜드마크 빠른 선택 바 */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          padding: '10px 14px', borderRadius: '18px', display: 'flex', gap: '8px',
          maxWidth: '55vw', overflowX: 'auto',
        }}
      >
        {visibleLandmarks.map((lm) => (
          <button
            key={lm.id}
            className="ui-btn"
            onClick={() => setSelected(lm)}
            title={`${lm.country} · ${lm.name}`}
            style={{
              flexShrink: 0, width: '44px', height: '44px', fontSize: '22px', borderRadius: '12px', cursor: 'pointer',
              border: selected?.id === lm.id ? `2px solid ${lm.color}` : '1px solid rgba(255,255,255,0.1)',
              background: selected?.id === lm.id ? `${lm.color}22` : 'rgba(255,255,255,0.05)',
              boxShadow: selected?.id === lm.id ? `0 0 16px ${lm.color}66` : 'none',
            }}
          >
            {lm.emoji}
          </button>
        ))}
      </div>

      {/* 우측 정보 패널 */}
      <InfoPanel data={selected} onClose={() => setSelected(null)} />

      {/* 우측 하단 조작 안내 */}
      <div
        style={{
          position: 'absolute', bottom: '24px', right: '24px', fontSize: '11px',
          color: '#64748b', textAlign: 'right', lineHeight: 1.6, pointerEvents: 'none',
        }}
      >
        🖱️ {t.hintDrag}
        <br />
        📍 {t.hintClick}
      </div>
    </div>
  )
}

// 작은 온/오프 토글 스위치 (Glass)
function Toggle({ label, on, onClick }) {
  return (
    <button
      className="ui-btn"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 4px', background: 'transparent', border: 'none', cursor: 'pointer',
        fontSize: '12px', fontWeight: 600, color: on ? '#e2e8f0' : '#64748b',
      }}
    >
      <span>{label}</span>
      <span
        style={{
          width: '36px', height: '20px', borderRadius: '20px', position: 'relative',
          background: on ? 'rgba(147,197,253,0.6)' : 'rgba(255,255,255,0.12)',
          transition: 'background 0.22s', flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute', top: '2px', left: on ? '18px' : '2px', width: '16px', height: '16px',
            borderRadius: '50%', background: '#fff', transition: 'left 0.22s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        />
      </span>
    </button>
  )
}
