module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#165DFF',
        secondary: '#36CFC9',
        neutral: '#86909C',
        success: '#52C41A',
        warning: '#FAAD14',
        danger: '#FF4D4F',
        light: '#F2F3F5',
        dark: '#1D2129',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}; 