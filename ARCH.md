# Архитектура приложения

## Обзор
- Приложение построено на `Electron` с React-интерфейсом и управлением состоянием через `@reatom`.
- Основные слои: main-процесс (`src/main`), preload-скрипт (`src/preload`), renderer (`src/renderer`).
- Взаимодействие между слоями реализовано через IPC-каналы и обёртку `window.modus`, которая объединяет вызовы в main-процесс и доступ к локальному IndexedDB (`Dexie`).
- Локальное хранилище IndexedDB служит промежуточным кешем для проиндексированных файлов и выбранного workspace.

## Слои и их ответственность

### Main-процесс (`src/main/index.ts`)
- Создаёт главное окно `BrowserWindow` и управляет жизненным циклом приложения.
- Подключает оптимизации из `@electron-toolkit/utils` (ускоренный DevTools, блокировка `Cmd/Ctrl+R` в продакшене и т.д.).
- Обрабатывает IPC-запросы:
  - `workspace:select` — открывает системный диалог выбора директории и возвращает путь.
  - `workspace:index` — рекурсивно сканирует выбранную директорию.
- Реализует функции `scanFileSystem` и `indexWorkspace`, которые обходят файловую систему (с ограничением глубины и фильтрацией скрытых директорий/`node_modules`).
- Планирует расширение: заготовка IPC-обработчика `fs:event` для будущих уведомлений о внешних изменениях.

### Preload (`src/preload/*`)
- Изолированный слой между main и renderer.
- `index.ts` экспортирует в renderer три объекта через `contextBridge`:
  - `electron` — стандартные утилиты из `@electron-toolkit/preload`.
  - `api` — прямые IPC-обёртки (`selectWorkspaceDirectory`, `indexWorkspace`).
  - `modus` — комбинированный API, включающий IPC-вызовы и репозитории IndexedDB.
- `db.ts` настраивает IndexedDB через `Dexie`:
  - Таблица `files` c индексами `id`, `parentId`, `type`, `updatedAt`.
  - Таблица `workspace` с единичной записью (`key = 'active'`).
  - `filesRepo`, `workspaceRepo` — CRUD-методы; `subscriptions` — `liveQuery`-наблюдатели за изменениями в IndexedDB.
- Все вызовы из renderer к данным или IPC проходят через `window.modus`.

### Renderer (`src/renderer`)
- React-приложение с `@reatom/react` для связывания атомов с компонентами.
- `main.tsx` монтирует `App` внутри `IntegrationProvider`, который запускает интеграционные эффекты.
- `providers/IntegrationProvider.tsx` инициализирует:
  1. Подписку на активный workspace (`initWorkspaceAction`).
  2. Подписку на изменения в списке файлов (`initFilesAction`).
  3. Реакцию на смену workspace и запуск индексации (`initFileSystemWatcherAction`).
- `entities/workspace`:
  - `currentWorkspaceAtom` хранит выбранный путь.
  - `setWorkspaceAction` обновляет его и синхронизирует с IndexedDB.
  - `initWorkspaceAction` подписывает атом на `window.modus.subscriptions.workspaceActive`.
  - `requestWorkspaceSelectionAction` инициирует IPC-запросы на выбор директории и сохранение результата.
- `entities/file`:
  - `fileListAtom` хранит текущее отражение таблицы `files`.
  - `initFilesAction` подписывает атом на `filesAll`.
  - `indexWorkspaceAction` очищает локальный кеш, вызывает `workspace:index` в main, раскладывает результаты в IndexedDB.
  - `initFileSystemWatcherAction` отслеживает смену `currentWorkspaceAtom` и перезапускает индексацию.
- `components/FileTree` и `components/Node` визуализируют содержимое `fileListAtom` (пока без иерархии; отображается плоский список).

## IPC-контракты и формат данных
- `workspace:select` → `{ canceled: boolean; path?: string }`.
- `workspace:index` → `{ success: boolean; items: FileSystemItem[]; count: number; error?: string }`, где `FileSystemItem` повторяет структуру `files` из IndexedDB.
- `fs:event` (подписка) предусмотрен, но пока не используется.
- Со стороны renderer все IPC-вызовы идут через `window.modus.selectWorkspaceDirectory` и `window.modus.indexWorkspace`.

## Локальное хранилище (IndexedDB)
- Управляется `Dexie` в preload-слое, чтобы обеспечить единое место доступа.
- `filesRepo`/`workspaceRepo` предоставляют CRUD-операции, а `subscriptions` транслируют изменения в Reatom-атомы через `liveQuery`.
- Renderer не обращается к IndexedDB напрямую, а вызывает методы `window.modus`, что изолирует доступ и упрощает тестирование main-процесса.

## Типовой поток выполнения
1. **Старт приложения**
   - `IntegrationProvider` запускает три `init*`-действия.
   - `initWorkspaceAction` вытягивает последнюю запись из IndexedDB и выставляет `currentWorkspaceAtom`.
   - `initFilesAction` синхронизирует `fileListAtom` с локальной базой.
2. **Выбор workspace**
   - Пользователь нажимает кнопку в `App` → `requestWorkspaceSelectionAction`.
   - Через IPC открывается диалог, выбранный путь сохраняется в IndexedDB и устанавливается в `currentWorkspaceAtom`.
3. **Индексация**
   - `initFileSystemWatcherAction` реагирует на обновление `currentWorkspaceAtom`, вызывает `indexWorkspaceAction`.
   - Main-процесс сканирует файловую систему и возвращает список `FileSystemItem`.
   - Renderer очищает IndexedDB и перезаписывает таблицу `files` полученными записями.
   - `liveQuery` из `initFilesAction` обновляет `fileListAtom`, что перерисовывает UI.
4. **Обновления в реальном времени** (планируются)
   - `onFsEvent` в preload готов принимать события `fs:event` из main (пока генерация не реализована).

## Ключевые зависимости и их назначение
- `@electron-toolkit/utils` — утилиты для интеграции Electron и оптимизаций в dev/prod.
- `@reatom/core`, `@reatom/react` — декларативное состояние с экшенами и атомами.
- `Dexie`, `dexie-react-hooks` — слой IndexedDB, liveQuery-подписки.
- `electron-updater` — подготовлено для обновлений приложения (пока не задействовано в коде).

## Структура импортов и взаимодействия
- `App.tsx` ← зависит от `entities/workspace`, `entities/file`, `components/FileTree`.
- `IntegrationProvider` ← вызывает `entities/workspace` и `entities/file` для инициализации.
- `entities/file` ↔ `entities/workspace` через `currentWorkspaceAtom` и совместные действия.
- Renderer → (`window.modus.*`) → Preload → IPC (`workspace:*`) → Main.
- Preload → IndexedDB (Dexie) ↔ Renderer через `liveQuery`.

## Возможные точки расширения
- Добавить наблюдение за файловой системой в main (например, через `chokidar`) и отправлять события по каналу `fs:event` в renderer.
- Строить древовидную структуру для `FileTree`, используя `parentId` и ленивую подгрузку контента файлов.
- Сохранять дополнительные метаданные по файлам (размер, хеш) в IndexedDB без изменения протокола IPC.

