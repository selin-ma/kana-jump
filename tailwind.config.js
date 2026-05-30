/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        leaf: {
          text: '#3A4A3C',
          muted: '#A8B4A8',
          dim: '#B8C4B8',
          faint: '#C0CAC0',
          gray: '#8A9A8A',
          dark: '#607060',
          secondary: '#6A8070',
          DEFAULT: '#7A9E82',
          deep: '#5A8870',
          medium: '#6A9070',
          accent: '#4A7058',
          hover: '#628070',
          note: '#B0C0B0',
          noteText: '#9AAA9A',
          bg: '#EEF4EF',
          bg2: '#EEF4EE',
          bg3: '#F0F4F0',
          bg4: '#F0F6F0',
          border: '#D8E4D8',
          border2: '#E4EAE4',
          border3: '#E4E8E0',
          border4: '#E0E8E0',
          border5: '#C8DCC8',
          progress: '#DDE8DD',
        },
        card: {
          DEFAULT: '#FEFCF8',
          back: '#F8FAF8',
          white: '#F8FCF8',
        },
        kata: {
          DEFAULT: '#7A7A9A',
        },
        roma: {
          DEFAULT: '#A8C0AA',
        },
        again: {
          DEFAULT: '#C08878',
          text: '#AA6868',
          bg: '#F5EDEC',
          variant: '#EADAD8',
        },
        good: {
          DEFAULT: '#7AAA7A',
          text: '#4A7A50',
          bg: '#E8F2EA',
        },
        hard: {
          DEFAULT: '#A89060',
          text: '#C0A878',
          bg: '#F5F0E4',
        },
        easy: {
          DEFAULT: '#5A7A9A',
          bg: '#E4EEF2',
        },
      },
    },
  },
  plugins: [],
}
