# 🌍 글로벌 3D 지구본 (Global 3D Globe)

세계 여행을 직접 가지 않아도 **3D 지구본으로 세계의 랜드마크를 간접 체험**하는 교육용 웹앱입니다.
나라별 유명 조형물·관광지를 3D 모델로 지구본 표면에 배치하고, 데이터만 바꿔 다양한 교육 자료를 만들 수 있습니다.

## ✨ 주요 기능

- 🌐 **고성능 3D 지구본** — Three.js 기반, 대기권 글로우 + 별빛 배경
- 🗿 **랜드마크 3D 모델** — 에펠탑·콜로세움·타지마할 등 표면에 배치 (줌에 따라 크기 자동 조절)
- 🗺️ **나라 경계선 + 국가/수도 라벨** — 가독성 좋은 라벨, 랜드마크와 겹치면 연장선으로 배치
- 🌏 **대륙 필터** + 🌐 **한국어/영어 전환**
- 🪟 **Glass UI** — 유려한 글래스모피즘 인터페이스

## 🛠️ 기술 스택

React · Vite · Three.js · @react-three/fiber · @react-three/drei · Tailwind CSS

## 🚀 개발

```bash
npm install      # 의존성 설치
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과 미리보기
```

## 📦 데이터

- `src/data/landmarks.js` — 랜드마크 (이 파일만 바꾸면 콘텐츠 교체 가능)
- `src/data/countryLabels.json` — 국가/수도 라벨 (한·영)
- `public/countries.geojson` — 나라 경계선 (Natural Earth)
- `public/models/*.glb` — 3D 모델 (출처: `public/models/CREDITS.md`)

## 📄 라이선스

3D 모델 및 지도 데이터의 출처/라이선스는 `public/models/CREDITS.md`를 참고하세요.
