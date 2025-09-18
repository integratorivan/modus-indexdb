import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const sharedAliases = {
  '@src': resolve('src'),
  '$types': resolve('src/types'),
  '$core': resolve('src/core'),
  '$main': resolve('src/main'),
  '$preload': resolve('src/preload'),
  '$renderer': resolve('src/renderer'),
  '$entities': resolve('src/renderer/entities'),
  '$features': resolve('src/renderer/features'),
  '$components': resolve('src/renderer/components'),
  '$providers': resolve('src/renderer/providers'),
  '$web': resolve('src/web')
}

export default defineConfig({
  main: {
    resolve: {
      alias: sharedAliases
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    resolve: {
      alias: sharedAliases
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        ...sharedAliases,
        '@renderer': resolve('src/renderer')
      }
    },
    plugins: [react()]
  }
})
