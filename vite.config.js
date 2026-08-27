import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // colleges.js / majors.js 為自動生成的大資料檔 (2,600+ 校 / 1,000 科系)
    // 屬刻意保留的全量資料, 提高 chunk 警告上限避免誤報
    chunkSizeWarningLimit: 3200,
  },
});
