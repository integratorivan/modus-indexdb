import { ElectronAPI } from '@electron-toolkit/preload'
import type { RendererApi } from './api'
import type { ModusApi } from './modus'

declare global {
  interface Window {
    electron: ElectronAPI
    api: RendererApi
    modus: ModusApi
  }
}
