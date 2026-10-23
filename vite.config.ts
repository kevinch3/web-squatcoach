import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the static build works from any subpath (e.g. GitHub Pages).
  base: './',
  plugins: [tailwindcss(), svelte()],
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
