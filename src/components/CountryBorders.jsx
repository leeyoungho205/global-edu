import { useEffect, useState, useMemo } from 'react'
import { latLngToVector3 } from '../utils/geo'

// GeoJSON을 한 번만 받아 캐시 (여러 번 마운트돼도 재요청 안 함)
let geoCache = null

/**
 * 나라별 경계선을 지구본 표면에 그린다.
 * - public/countries.geojson (Natural Earth 110m)을 불러와
 * - 모든 폴리곤 외곽선을 LineSegments 하나로 합쳐 렌더링 (가벼움)
 */
export default function CountryBorders({ radius = 2.004, color = '#7dd3fc', opacity = 0.32 }) {
  const [geo, setGeo] = useState(geoCache)

  useEffect(() => {
    if (geoCache) return
    fetch('/countries.geojson')
      .then((r) => r.json())
      .then((d) => {
        geoCache = d
        setGeo(d)
      })
      .catch((e) => console.warn('경계선 로드 실패:', e))
  }, [])

  // GeoJSON → 선분 좌표 배열 (꼭짓점 쌍)
  const positions = useMemo(() => {
    if (!geo) return null
    const pts = []
    for (const f of geo.features) {
      const g = f.geometry
      if (!g) continue
      const polys = g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates]
      for (const poly of polys) {
        for (const ring of poly) {
          for (let i = 0; i < ring.length - 1; i++) {
            const a = latLngToVector3(ring[i][1], ring[i][0], radius)
            const b = latLngToVector3(ring[i + 1][1], ring[i + 1][0], radius)
            pts.push(a.x, a.y, a.z, b.x, b.y, b.z)
          }
        }
      }
    }
    return new Float32Array(pts)
  }, [geo, radius])

  if (!positions) return null

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </lineSegments>
  )
}
