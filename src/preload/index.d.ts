import { ElectronAPI } from '@electron-toolkit/preload'
import type { RendererSystemApi } from './api'
import type { ModusApi } from './modus'

declare global {
  interface Window {
    electron: ElectronAPI
    api: RendererSystemApi
    modus: ModusApi
  }
}
