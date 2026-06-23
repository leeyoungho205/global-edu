import { useRef, useState, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { latLngToVector3 } from '../utils/geo'
import LandmarkModel from './LandmarkModel'
import GltfLandmark from './GltfLandmark'

const UP = new THREE.Vector3(0, 1, 0)

/**
 * 지구본 표면에 3D 랜드마크 모델을 "수직으로 세워" 배치한다.
 * - 위경도 → 표면 좌표로 위치
 * - 모델의 +Y축이 표면 법선(바깥 방향)을 향하도록 회전
 * - data.modelUrl 이 있으면 외부 glTF, 없으면 절차적 모델 (로딩 중에도 절차적 모델로 대체)
 * - 호버/클릭 인터랙션 + 활성 시 빛나는 받침 링
 */
export default function SurfaceMarker({ data, radius = 2, onSelect, isActive }) {
  const innerRef = useRef()
  const [hovered, setHovered] = useState(false)

  // 표면 위치와 "바깥을 향하도록" 세우는 회전(쿼터니언) 계산
  const { position, quaternion } = useMemo(() => {
    const pos = latLngToVector3(data.lat, data.lng, radius)
    const normal = pos.clone().normalize()
    const q = new THREE.Quaternion().setFromUnitVectors(UP, normal)
    return { position: pos.toArray(), quaternion: q.toArray() }
  }, [data.lat, data.lng, radius])

  // 절차적 모델은 약 2~4 유닛 → 지구본 표면 크기에 맞게 축소
  const baseScale = 0.065

  // 카메라가 가까울수록(확대할수록) 모델을 크게, 멀면 거의 안 보이게 축소한다.
  // → 충분히 확대했을 때만 적당한 크기로 보이고, 멀리서는 받침 링만 보인다.
  useFrame((state) => {
    if (!innerRef.current) return
    const t = state.clock.elapsedTime

    // 카메라~지구중심 거리 (OrbitControls min 3 ~ max 10)
    const camDist = state.camera.position.length()
    // 가까울수록 1, 멀수록 0 (3.2에서 거의 1, 7.5에서 거의 0)
    let zoom = THREE.MathUtils.clamp((7.5 - camDist) / (7.5 - 3.2), 0, 1)
    zoom = Math.pow(zoom, 1.6) // 충분히 가까워질 때까지 작게 유지
    const zoomScale = THREE.MathUtils.lerp(0.12, 1.0, zoom)

    // 호버/활성 시 강조 + 활성 시 pulse
    const interact = isActive || hovered ? 1.3 : 1
    const pulse = isActive ? Math.sin(t * 4) * 0.06 : 0

    const target = baseScale * zoomScale * interact + pulse * baseScale
    const next = THREE.MathUtils.lerp(innerRef.current.scale.x, target, 0.18)
    innerRef.current.scale.setScalar(next)
  })

  return (
    <group
      position={position}
      quaternion={quaternion}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(data)
      }}
    >
      {/* 빛나는 받침 링 (위치 강조) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0.06, 0.09, 24]} />
        <meshBasicMaterial
          color={data.color}
          transparent
          opacity={isActive || hovered ? 0.9 : 0.45}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* 넓은 투명 클릭 영역 (히트 스피어) — 줌과 무관하게 일정한 큰 반경으로 선택을 쉽게 */}
      <mesh position={[0, 0.13, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 3D 모델 (클릭 이벤트는 부모 그룹에서 처리) */}
      <group ref={innerRef} scale={baseScale}>
        {data.modelUrl ? (
          // 외부 glTF 모델 — 로딩 중에는 절차적 모델로 대체 표시
          <Suspense
            fallback={<LandmarkModel type={data.model} color={data.color} spin={false} />}
          >
            <GltfLandmark url={data.modelUrl} targetSize={3} />
          </Suspense>
        ) : (
          <LandmarkModel type={data.model} color={data.color} spin={false} />
        )}
      </group>

      {/* 호버/활성 시 이름표 (Glass 미니 라벨) */}
      {(hovered || isActive) && (
        <Html distanceFactor={8} center position={[0, 0.32, 0]} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              whiteSpace: 'nowrap',
              padding: '2px 6px',
              borderRadius: '7px',
              fontSize: '5.5px',
              fontWeight: 600,
              color: '#fff',
              background: 'rgba(10,15,30,0.7)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${data.color}`,
              boxShadow: `0 0 12px ${data.color}66`,
            }}
          >
            {data.emoji} {data.name}
          </div>
        </Html>
      )}
    </group>
  )
}
