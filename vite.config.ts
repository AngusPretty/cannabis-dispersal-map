import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const isSingleFile = process.env.VITE_SINGLEFILE === '1'

// https://vite.dev/config/
export default defineConfig({
  plugins: isSingleFile ? [react(), viteSingleFile()] : [react()],
  base: isSingleFile ? './' : '/cannabis-dispersal-map/',
  build: isSingleFile
    ? {
        outDir: 'dist-map',
        assetsInlineLimit: 100_000_000,
        cssCodeSplit: false,
      }
    : {},
})
