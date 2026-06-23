import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import LandmarkModel from './LandmarkModel'
import GltfLandmark from './GltfLandmark'

// 미니뷰어용 외부 모델 — 천천히 자동 회전하며 화면 중앙에 정렬
function SpinningGltf({ url }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5
  })
  // 자동 정규화 모델(바닥이 y=0)을 중앙으로 끌어내림
  return (
    <group ref={ref} position={[0, -1.3, 0]}>
      <GltfLandmark url={url} targetSize={2.8} />
    </group>
  )
}

/**
 * 정보 패널 안에 들어가는 작은 3D 랜드마크 뷰어
 * - 직접 드래그로 돌려볼 수 있다 (인터랙티브)
 * - data에 modelUrl이 있으면 외부 glTF, 없으면 절차적 모델
 */
export default function MiniViewer({ data }) {
  const { model: type, color } = data
  return (
    <div
      style={{
        width: '100%',
        height: '180px',
        borderRadius: '14px',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.08), rgba(0,0,0,0.2))',
        border: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '16px',
      }}
    >
      <Canvas camera={{ position: [0, 1.2, 4.5], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 2]} intensity={1.4} />
        <directionalLight position={[-3, 2, -2]} intensity={0.5} color={color} />
        <Suspense fallback={null}>
          {data.modelUrl ? (
            // 외부 모델 — 자동 정규화되어 일정 크기로 렌더링
            <SpinningGltf url={data.modelUrl} />
          ) : (
            <LandmarkModel type={type} color={color} />
          )}
          {/* 바닥 그림자로 입체감 강조 */}
          <ContactShadows
            position={[0, -0.85, 0]}
            opacity={0.4}
            scale={6}
            blur={2.5}
            far={3}
          />
        </Suspense>
        {/* 마우스로 직접 회전/확대 */}
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={7}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}
