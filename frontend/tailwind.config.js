/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // هوية بصرية خاصة بنظام الخزينة: تيل غامق (ثقة/أمان) + ذهبي دافئ (خزينة/قيمة)
        vault: {
          50: '#EAF2F1',
          100: '#CFE3E1',
          300: '#7DA8A4',
          500: '#2E6D68',
          700: '#154240', // اللون الأساسي
          900: '#0B2524',
        },
        gold: {
          100: '#F6EBC8',
          300: '#E5C877',
          500: '#C9A227', // لون التأكيد (الذهبي)
          700: '#96751A',
        },
        paper: '#F7F5F0', // خلفية دافئة
        ink: '#1F2A2A', // لون النص الأساسي
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
