import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { createRendererApi } from './api'
import { createModusApi } from './modus'
import type { RendererApi } from './api'
import type { ModusApi } from './modus'

const api = createRendererApi()
const modus = createModusApi(api)

type WindowWithApis = typeof window & {
  electron: typeof electronAPI
  api: RendererApi
  modus: ModusApi
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('modus', modus)
  } catch (error) {
    console.error(error)
  }
} else {
  const targetWindow = window as WindowWithApis
  targetWindow.electron = electronAPI
  targetWindow.api = api
  targetWindow.modus = modus
}
