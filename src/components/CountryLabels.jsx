import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { latLngToVector3, angularDistanceDeg } from '../utils/geo'
import countryLabels from '../data/countryLabels.json'

// 재사용 임시 벡터 (프레임마다 새로 만들지 않도록)
const _wp = new THREE.Vector3()

/**
 * 라벨 하나 — 국가명 + 수도
 * - 뒷면(지구 반대편)으로 가면 자연스럽게 사라짐 (가독성)
 * - 랜드마크에 가려질 위치면 바깥으로 띄우고 연장선(leader line)으로 연결
 */
function LabelItem({ item, lang, radius, offset }) {
  const groupRef = useRef()
  const divRef = useRef()

  // 표면 기준점 / 라벨 위치(겹치면 바깥으로 띄움)
  const base = useMemo(() => latLngToVector3(item.lat, item.lng, radius), [item, radius])
  const labelPos = useMemo(
    () => (offset ? base.clone().multiplyScalar(1.22) : base.clone().multiplyScalar(1.02)),
    [base, offset]
  )

  // 매 프레임: 카메라를 향하는 면이면 보이고, 뒤로 돌면 페이드 아웃
  useFrame((state) => {
    if (!groupRef.current || !divRef.current) return
    groupRef.current.getWorldPosition(_wp)
    const facing = _wp.clone().normalize().dot(state.camera.position.clone().normalize())
    // facing: 1(정면) ~ -1(뒷면)
    const op = THREE.MathUtils.clamp((facing - 0.1) / 0.35, 0, 1)
    divRef.current.style.opacity = String(op)
    divRef.current.style.pointerEvents = 'none'
  })

  const name = lang === 'en' ? item.nameEn : item.nameKo
  const capital = lang === 'en' ? item.capEn : item.capKo
  // 중요도(rank)에 따라 글자 크기 차등 → 큰 나라가 더 또렷하게
  const big = item.rank <= 2

  return (
    <group>
      {/* 연장선 (겹칠 때만) */}
      {offset && (
        <Line
          points={[base.clone().multiplyScalar(1.005), labelPos]}
          color="#e2e8f0"
          opacity={0.5}
          transparent
          lineWidth={1}
        />
      )}

      <group ref={groupRef} position={labelPos.toArray()}>
        <Html center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div
            ref={divRef}
            style={{
              transition: 'opacity 0.2s',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {/* 국가명 */}
            <div
              style={{
                fontSize: big ? '7px' : '5px',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '0.02em',
                // 가독성: 어두운 외곽선(text-shadow)으로 어떤 배경에서도 또렷하게
                textShadow:
                  '0 0 4px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)',
              }}
            >
              {name}
            </div>
            {/* 수도 */}
            {capital && (
              <div
                style={{
                  fontSize: big ? '5px' : '4px',
                  fontWeight: 500,
                  color: '#7dd3fc',
                  marginTop: '1px',
                  textShadow: '0 0 4px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,0.9)',
                }}
              >
                ★ {capital}
              </div>
            )}
          </div>
        </Html>
      </group>
    </group>
  )
}

/**
 * 모든 국가 라벨을 렌더링.
 * landmarks와 가까운(겹치는) 국가는 라벨을 바깥으로 띄워 연장선으로 연결.
 */
export default function CountryLabels({ lang = 'ko', radius = 2, landmarks = [] }) {
  // 각 라벨이 랜드마크와 겹치는지 미리 계산
  const items = useMemo(
    () =>
      countryLabels.map((c) => {
        const overlap = landmarks.some(
          (lm) => angularDistanceDeg(c.lat, c.lng, lm.lat, lm.lng) < 9
        )
        return { ...c, offset: overlap }
      }),
    [landmarks]
  )

  return (
    <>
      {items.map((item) => (
        <LabelItem
          key={item.a3}
          item={item}
          lang={lang}
          radius={radius}
          offset={item.offset}
        />
      ))}
    </>
  )
}
