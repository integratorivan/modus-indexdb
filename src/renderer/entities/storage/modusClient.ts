import type { ModusApi } from '$preload/modus'
import { createBrowserModus } from './browserModus'

let cachedModus: ModusApi | null = null

const hasStorageFacade = (api: Partial<ModusApi> | null | undefined): api is ModusApi =>
  typeof api?.storage?.syncWorkspace === 'function'

const isElectronRenderer = (): boolean => {
  return Boolean(window.process?.versions?.electron)
}

const setModus = (api: ModusApi): ModusApi => {
  window.modus = api
  cachedModus = api
  return api
}

const ensureModus = (factory?: () => ModusApi): ModusApi => {
  if (cachedModus) {
    return cachedModus
  }

  if (window.modus) {
    if (hasStorageFacade(window.modus)) {
      cachedModus = window.modus
      return cachedModus
    }

    if (!isElectronRenderer()) {
      const fallback = factory ? factory() : createBrowserModus()
      const patched = {
        ...(window.modus as Record<string, unknown>),
        storage: fallback.storage
      } as ModusApi
      return setModus(patched)
    }

    throw new Error('Modus storage facade is missing. Check preload configuration.')
  }

  if (!isElectronRenderer()) {
    const browserModus = factory ? factory() : createBrowserModus()
    return setModus(browserModus)
  }

  if (factory) {
    return setModus(factory())
  }

  throw new Error('Modus API is not available. Ensure preload configuration exposes it.')
}

const getModus = (): ModusApi => {
  if (!cachedModus) {
    ensureModus()
  }

  if (!cachedModus) {
    throw new Error('Failed to initialise Modus API.')
  }

  return cachedModus
}

const getStorage = (): ModusApi['storage'] => {
  const api = getModus()
  if (!api.storage) {
    throw new Error('Modus storage facade is not available. Check preload configuration.')
  }
  return api.storage
}

const getWorkspace = (): ModusApi['workspace'] => getModus().workspace
const getFilesRepo = (): ModusApi['files'] => getModus().files
const getSubscriptions = (): ModusApi['subscriptions'] => getModus().subscriptions
const selectWorkspaceDirectory = (): ReturnType<ModusApi['selectWorkspaceDirectory']> =>
  getModus().selectWorkspaceDirectory()

export const modusClient = {
  ensure: ensureModus,
  get: getModus,
  getStorage,
  getWorkspace,
  getFilesRepo,
  getSubscriptions,
  selectWorkspaceDirectory,
  isElectronRenderer
}
