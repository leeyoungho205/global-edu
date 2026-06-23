// 위도/경도를 3D 구면 좌표(Vector3)로 변환하는 유틸
import * as THREE from 'three'

/**
 * 위도(lat), 경도(lng)를 반지름 radius의 구 위 3D 좌표로 변환
 * @param {number} lat 위도 (-90 ~ 90)
 * @param {number} lng 경도 (-180 ~ 180)
 * @param {number} radius 구의 반지름
 * @returns {THREE.Vector3}
 */
export function latLngToVector3(lat, lng, radius = 1) {
  // 위도/경도를 라디안으로 변환
  const phi = (90 - lat) * (Math.PI / 180) // 극각
  const theta = (lng + 180) * (Math.PI / 180) // 방위각

  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

/**
 * 두 위경도 지점 사이의 각거리(도 단위) — 대원(great-circle) 거리.
 * 라벨이 랜드마크와 겹치는지 판단할 때 사용.
 */
export function angularDistanceDeg(lat1, lng1, lat2, lng2) {
  const toRad = Math.PI / 180
  const a1 = lat1 * toRad
  const a2 = lat2 * toRad
  const dLng = (lng2 - lng1) * toRad
  const cos =
    Math.sin(a1) * Math.sin(a2) +
    Math.cos(a1) * Math.cos(a2) * Math.cos(dLng)
  return Math.acos(Math.min(1, Math.max(-1, cos))) / toRad
}
