import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // يخلّي السيرفر يسمع على كل كروت الشبكة، مش على localhost بس - عشان أي جهاز في نفس الشبكة يقدر يوصله
  },
});
