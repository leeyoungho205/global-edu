import { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import SurfaceMarker from './SurfaceMarker'
import CountryBorders from './CountryBorders'
import CountryLabels from './CountryLabels'

const RADIUS = 2

/**
 * 전체 3D 씬 — Canvas, 조명, 별, 컨트롤
 */
export default function Scene({ selected, onSelect, landmarks, lang, showBorders, showLabels }) {
  const groupRef = useRef()
  const targetRot = useRef({ x: 0, y: 0 })
  const controlsRef = useRef()

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      {/* 조명 — 환경광을 높여 밤(그림자) 쪽도 은은하게 보이도록 */}
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 3, 5]} intensity={1.3} />

      {/* 별빛 배경 */}
      <Stars radius={100} depth={50} count={4000} factor={4} fade speed={1} />

      <Suspense fallback={null}>
        <RotatingGlobe
          groupRef={groupRef}
          targetRot={targetRot}
          selected={selected}
          onSelect={onSelect}
          landmarks={landmarks}
          lang={lang}
          showBorders={showBorders}
          showLabels={showLabels}
        />
      </Suspense>

      {/* 마우스 드래그 회전 + 핀치 줌 — 조작을 시작하면 선택 해제(패널 닫힘 + 자유 회전) */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        rotateSpeed={0.5}
        autoRotate={false}
        onStart={() => onSelect(null)}
      />

      {/* 모델 선택 시 카메라를 부드럽게 확대(선택 해제 시 원위치) */}
      <CameraRig selected={selected} controlsRef={controlsRef} />
    </Canvas>
  )
}

/**
 * 모델 선택 시 카메라 거리(줌)를 부드럽게 보간한다.
 * - 선택: 가까이 확대 / 해제: 원래 거리로 복귀
 * - 애니메이션이 끝나면 멈춰 사용자의 휠 줌과 충돌하지 않게 함
 */
function CameraRig({ selected, controlsRef }) {
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3(0, 0, 6))
  const animating = useRef(false)

  // 선택 시에만 카메라를 정면(+Z)에서 위도만큼 올려 확대(한 번만 실행).
  // 선택 해제 시에는 카메라를 건드리지 않아 사용자가 언제든 자유롭게 회전 가능.
  useEffect(() => {
    if (selected) {
      const d = 3.4
      const lat = THREE.MathUtils.degToRad(selected.lat)
      target.current.set(0, Math.sin(lat) * d, Math.cos(lat) * d)
      animating.current = true
    } else {
      animating.current = false // 드래그와 충돌하지 않도록 즉시 중단
    }
  }, [selected])

  useFrame(() => {
    if (!animating.current) return
    camera.position.lerp(target.current, 0.07)
    controlsRef.current?.update()
    if (camera.position.distanceTo(target.current) < 0.02) animating.current = false
  })

  return null
}

/**
 * 회전 그룹 안에 지구 + 마커를 함께 배치 (마커가 지구와 같이 회전)
 */
function RotatingGlobe({ groupRef, targetRot, selected, onSelect, landmarks, lang, showBorders, showLabels }) {
  // 선택 시 목표 회전 계산 — 경도(Y축)만 정렬해 자전축은 항상 수직 유지.
  // 현재 회전값에서 "최단 경로"로만 돌도록 해 불필요한 한 바퀴 회전을 방지.
  if (selected && groupRef.current) {
    const desired = -THREE.MathUtils.degToRad(selected.lng) - Math.PI / 2
    const cur = groupRef.current.rotation.y
    // cur → desired 사이의 최단 각도 차이(-π~π)
    const delta = Math.atan2(Math.sin(desired - cur), Math.cos(desired - cur))
    targetRot.current.y = cur + delta
  }

  useFrame((_, delta) => {
    if (!groupRef.current) return
    // 자전축이 기울지 않도록 X/Z 회전은 항상 0으로 고정
    groupRef.current.rotation.x = 0
    groupRef.current.rotation.z = 0
    if (selected) {
      // 선택된 랜드마크 경도를 정면으로 (부드러운 보간) — 위도는 카메라가 담당
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRot.current.y,
        0.06
      )
    } else {
      // 자동 회전 (속도 절반)
      groupRef.current.rotation.y += delta * 0.025
    }
  })

  return (
    <group ref={groupRef}>
      {/* 지구 본체 (자동 회전은 그룹에서 처리하므로 false) */}
      <EarthBody radius={RADIUS} />

      {/* 나라 경계선 */}
      {showBorders && <CountryBorders radius={RADIUS + 0.004} />}

      {/* 국가명 + 수도 라벨 (랜드마크와 겹치면 연장선으로 배치) */}
      {showLabels && (
        <CountryLabels lang={lang} radius={RADIUS} landmarks={landmarks} />
      )}

      {/* 랜드마크 — 표면에 세워진 3D 모델 마커 */}
      {landmarks.map((lm) => (
        <SurfaceMarker
          key={lm.id}
          data={lm}
          radius={RADIUS}
          onSelect={onSelect}
          isActive={selected?.id === lm.id}
        />
      ))}
    </group>
  )
}

// 지구 본체 + 대기권 글로우 (회전은 부모 그룹에서 처리)
function EarthBody({ radius }) {
  const [dayMap, bumpMap, specMap] = useLoader(THREE.TextureLoader, [
    'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png',
    'https://unpkg.com/three-globe@2.31.0/example/img/earth-water.png',
  ])

  const atmosphereMaterial = useRef(
    new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    })
  ).current

  return (
    <>
      {/* 지구 표면 — 클릭을 가로막아(occluder) 반대편 마커가 잘못 선택되는 것을 방지 */}
      <mesh onClick={(e) => e.stopPropagation()}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhongMaterial
          map={dayMap}
          bumpMap={bumpMap}
          bumpScale={0.04}
          specularMap={specMap}
          specular={new THREE.Color('#2a3550')}
          shininess={8}
          // 낮 텍스처를 약하게 자체발광시켜 밤(그림자) 쪽에서도 땅·바다가 보이게
          emissive={new THREE.Color('#ffffff')}
          emissiveMap={dayMap}
          emissiveIntensity={0.45}
        />
      </mesh>
      <mesh scale={1.18} material={atmosphereMaterial}>
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>
    </>
  )
}
