import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Se estiver rodando local ('serve'), usa raiz '/'. Se for build de produção, usa '/MD-System/'
  base: command === 'serve' ? '/' : '/MD-System/',
}));