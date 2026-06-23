import { useRef, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
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

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      {/* 조명 */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 3, 5]} intensity={1.6} />

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

      {/* 마우스 드래그 회전 + 핀치 줌 */}
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        rotateSpeed={0.5}
        autoRotate={false}
      />
    </Canvas>
  )
}

/**
 * 회전 그룹 안에 지구 + 마커를 함께 배치 (마커가 지구와 같이 회전)
 */
function RotatingGlobe({ groupRef, targetRot, selected, onSelect, landmarks, lang, showBorders, showLabels }) {
  // 선택 시 목표 회전 계산
  if (selected) {
    targetRot.current = {
      x: THREE.MathUtils.degToRad(selected.lat),
      y: -THREE.MathUtils.degToRad(selected.lng) - Math.PI / 2,
    }
  }

  useFrame((_, delta) => {
    if (!groupRef.current) return
    if (selected) {
      // 선택된 랜드마크 정면 정렬 (부드러운 보간)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRot.current.x,
        0.06
      )
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
          bumpScale={0.05}
          specularMap={specMap}
          specular={new THREE.Color('#333355')}
          shininess={12}
        />
      </mesh>
      <mesh scale={1.18} material={atmosphereMaterial}>
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>
    </>
  )
}
