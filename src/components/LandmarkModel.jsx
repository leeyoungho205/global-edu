import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// 절차적(코드로 생성하는) 3D 랜드마크 모델 모음
// 외부 glTF 파일 없이 Three.js 기본 도형만 조합해 만든다 → 가볍고 즉시 로드.
// 새 모델을 추가하려면 아래 switch에 case를 하나 더 넣으면 된다.

// ── 에펠탑: 아래가 넓고 위로 갈수록 좁아지는 4단 철탑 ──
function Eiffel() {
  return (
    <group>
      {/* 4개의 다리 */}
      {[
        [-0.5, -0.5],
        [0.5, -0.5],
        [-0.5, 0.5],
        [0.5, 0.5],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x * 0.7, 0.4, z * 0.7]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.09, 1.2, 6]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* 중간 기둥 */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.06, 0.18, 0.9, 6]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* 첨탑 */}
      <mesh position={[0, 1.9, 0]}>
        <coneGeometry args={[0.08, 0.7, 6]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ── 피라미드 ──
function Pyramid() {
  return (
    <group>
      <mesh position={[0, 0.7, 0]}>
        <coneGeometry args={[1.2, 1.6, 4]} />
        <meshStandardMaterial color="#d4a85a" roughness={0.9} flatShading />
      </mesh>
      {/* 작은 옆 피라미드 */}
      <mesh position={[1.0, 0.35, 0.4]} scale={0.5}>
        <coneGeometry args={[1.0, 1.4, 4]} />
        <meshStandardMaterial color="#c69a4e" roughness={0.9} flatShading />
      </mesh>
    </group>
  )
}

// ── 만리장성: 계단처럼 이어진 성벽 + 망루 ──
function Wall() {
  return (
    <group position={[0, -0.2, 0]}>
      {[-1.2, -0.4, 0.4, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 0.3 + (i % 2) * 0.15, 0]}>
          <boxGeometry args={[0.85, 0.6 + (i % 2) * 0.3, 0.45]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.95} />
        </mesh>
      ))}
      {/* 망루 */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.7, 0]}>
          <boxGeometry args={[0.5, 0.8, 0.55]} />
          <meshStandardMaterial color="#8c8680" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

// ── 타지마할: 중앙 돔 + 4개의 첨탑 ──
function Taj() {
  return (
    <group position={[0, -0.2, 0]}>
      {/* 본관 */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.1, 1.0, 1.1]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
      {/* 중앙 돔 */}
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.45, 24, 24, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <coneGeometry args={[0.06, 0.25, 12]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      {/* 4개의 첨탑(미나렛) */}
      {[
        [-0.85, -0.85],
        [0.85, -0.85],
        [-0.85, 0.85],
        [0.85, 0.85],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.6, z]}>
          <cylinderGeometry args={[0.07, 0.09, 1.6, 12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ── 경복궁(전통 궁궐): 기단 + 몸체 + 팔작지붕 ──
function Palace() {
  return (
    <group position={[0, -0.3, 0]}>
      {/* 돌 기단 */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[2.0, 0.3, 1.2]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.9} />
      </mesh>
      {/* 붉은 기둥 몸체 */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.7, 0.8, 0.95]} />
        <meshStandardMaterial color="#9b3a3a" roughness={0.7} />
      </mesh>
      {/* 처마가 살짝 들린 지붕 (사다리꼴) */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.5, 1.3, 0.55, 4]} />
        <meshStandardMaterial color="#2f4858" roughness={0.6} flatShading />
      </mesh>
    </group>
  )
}

// ── 일반 시계탑/종탑 (빅벤 등) ──
function Tower() {
  return (
    <group position={[0, -0.4, 0]}>
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[0.5, 2.0, 0.5]} />
        <meshStandardMaterial color="#b08d57" roughness={0.7} />
      </mesh>
      {/* 시계 면 */}
      <mesh position={[0, 1.6, 0.26]}>
        <circleGeometry args={[0.18, 24]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fde68a" emissiveIntensity={0.4} />
      </mesh>
      {/* 첨탑 지붕 */}
      <mesh position={[0, 2.25, 0]}>
        <coneGeometry args={[0.4, 0.6, 4]} />
        <meshStandardMaterial color="#3f6212" roughness={0.6} flatShading />
      </mesh>
    </group>
  )
}

// ── 콜로세움: 타원형 아치 구조 ──
function Colosseum() {
  const arches = []
  const count = 16
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    arches.push(
      <mesh key={i} position={[Math.cos(a) * 1.1, 0.5, Math.sin(a) * 0.8]} rotation={[0, -a, 0]}>
        <boxGeometry args={[0.25, 1.0, 0.2]} />
        <meshStandardMaterial color="#d6c7a1" roughness={0.9} />
      </mesh>
    )
  }
  return (
    <group position={[0, -0.3, 0]}>
      {arches}
      <mesh position={[0, 0.05, 0]} scale={[1.1, 1, 0.8]}>
        <cylinderGeometry args={[1.15, 1.15, 0.15, 32]} />
        <meshStandardMaterial color="#bcaa82" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ── 산 (후지산/킬리만자로/마추픽추): 눈 덮인 봉우리 ──
function Mountain() {
  return (
    <group position={[0, -0.4, 0]}>
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[1.3, 1.8, 5]} />
        <meshStandardMaterial color="#4b5d52" roughness={1} flatShading />
      </mesh>
      {/* 정상 만년설 */}
      <mesh position={[0, 1.45, 0]}>
        <coneGeometry args={[0.45, 0.55, 5]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} flatShading />
      </mesh>
    </group>
  )
}

// ── 자유의 여신상: 받침 + 몸체 + 횃불 ──
function Statue() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* 받침대 */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.9} />
      </mesh>
      {/* 몸체(로브) */}
      <mesh position={[0, 1.1, 0]}>
        <coneGeometry args={[0.35, 1.2, 8]} />
        <meshStandardMaterial color="#5eead4" roughness={0.7} />
      </mesh>
      {/* 머리 */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#5eead4" roughness={0.7} />
      </mesh>
      {/* 횃불을 든 팔 */}
      <mesh position={[0.25, 1.9, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        <meshStandardMaterial color="#5eead4" />
      </mesh>
      <mesh position={[0.45, 2.15, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

// ── 예수상: 십자가 형태로 팔 벌린 형상 ──
function Christ() {
  return (
    <group position={[0, -0.3, 0]}>
      {/* 받침 */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.6]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.9} />
      </mesh>
      {/* 몸통 */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.18, 0.25, 1.4, 12]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.7} />
      </mesh>
      {/* 양팔 */}
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[1.5, 0.16, 0.16]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.7} />
      </mesh>
      {/* 머리 */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.7} />
      </mesh>
    </group>
  )
}

// ── 오페라 하우스: 조개껍데기 모양 지붕들 ──
function Opera() {
  return (
    <group position={[0, -0.3, 0]}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[2.0, 0.2, 1.0]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      {[-0.6, -0.1, 0.4, 0.9].map((x, i) => (
        <mesh
          key={i}
          position={[x, 0.5, 0]}
          rotation={[0.3, 0, 0]}
          scale={[1, 1.3 - i * 0.15, 1]}
        >
          <sphereGeometry args={[0.4, 20, 20, 0, Math.PI]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} side={2} />
        </mesh>
      ))}
    </group>
  )
}

// ── 기본 기념비 (모델이 지정되지 않은 랜드마크용) ──
function Monument({ color }) {
  return (
    <group position={[0, -0.3, 0]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.0, 0.4, 1.0]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.15, 0.3, 1.4, 6]} />
        <meshStandardMaterial color={color || '#cbd5e1'} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <octahedronGeometry args={[0.25]} />
        <meshStandardMaterial color={color || '#fbbf24'} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

/**
 * 랜드마크 종류에 맞는 절차적 3D 모델을 렌더링
 * @param {boolean} spin true면 천천히 자동 회전(미니뷰어용), false면 고정(지구본 표면용)
 */
export default function LandmarkModel({ type, color, spin = true }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (spin && ref.current) ref.current.rotation.y += delta * 0.5 // 자동 회전
  })

  let model
  switch (type) {
    case 'eiffel': model = <Eiffel />; break
    case 'pyramid': model = <Pyramid />; break
    case 'wall': model = <Wall />; break
    case 'taj': model = <Taj />; break
    case 'palace': model = <Palace />; break
    case 'tower': model = <Tower />; break
    case 'colosseum': model = <Colosseum />; break
    case 'mountain': model = <Mountain />; break
    case 'statue': model = <Statue />; break
    case 'christ': model = <Christ />; break
    case 'opera': model = <Opera />; break
    default: model = <Monument color={color} />
  }

  return <group ref={ref}>{model}</group>
}
