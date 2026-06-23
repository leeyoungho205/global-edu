/** @type {import('tailwindcss').Config} */
// Tailwind CSS 설정
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Glass UI에서 자주 쓰는 블러/색상 확장
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
