import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * 외부 glTF/glb 3D 모델을 불러와 "크기와 위치를 자동 정규화"해서 렌더링한다.
 * - 모델마다 원본 크기/원점이 제각각이므로, 바운딩 박스를 계산해
 *   → 가장 긴 변이 targetSize가 되도록 스케일
 *   → 좌우 중심을 맞추고, 바닥(min.y)이 y=0에 닿도록 정렬
 * - 덕분에 어떤 모델을 넣어도 일관된 크기로 표면에 선다 (개별 튜닝 불필요).
 * - useGLTF(url, true): DRACO 압축 모델도 지원 (디코더는 CDN에서 자동 로드)
 */
export default function GltfLandmark({ url, targetSize = 3 }) {
  const { scene } = useGLTF(url, true)

  // 복제 + 바운딩 박스 기반 정규화 값 계산
  const { object, scale, offset } = useMemo(() => {
    const obj = scene.clone(true)
    const box = new THREE.Box3().setFromObject(obj)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const s = targetSize / maxDim

    // 좌우(x,z) 중심 정렬, 바닥(min.y)을 0에 맞춤
    const off = new THREE.Vector3(-center.x, -box.min.y, -center.z)

    return { object: obj, scale: s, offset: off }
  }, [scene, targetSize])

  return (
    <group scale={scale}>
      <primitive object={object} position={offset.toArray()} />
    </group>
  )
}
