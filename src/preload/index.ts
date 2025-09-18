import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { createRendererSystemApi } from './api'
import { createModusApi } from './modus'
import type { RendererSystemApi } from './api'
import type { ModusApi } from './modus'

const systemApi = createRendererSystemApi()
const modus = createModusApi(systemApi)

type WindowWithApis = typeof window & {
  electron: typeof electronAPI
  api: RendererSystemApi
  modus: ModusApi
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', systemApi)
    contextBridge.exposeInMainWorld('modus', modus)
  } catch (error) {
    console.error(error)
  }
} else {
  const targetWindow = window as WindowWithApis
  targetWindow.electron = electronAPI
  targetWindow.api = systemApi
  targetWindow.modus = modus
}
