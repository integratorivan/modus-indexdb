# Безопасность Electron приложения

Этот документ описывает реализованные меры безопасности для защиты от XSS атак и других угроз.

## Реализованные меры безопасности

### 1. Типизированные IPC схемы (`src/types/ipc.ts`)

- ✅ **Zod валидация**: Все IPC сообщения валидируются через zod схемы
- ✅ **Whitelist каналов**: Только разрешённые каналы могут быть использованы
- ✅ **Строгая типизация**: TypeScript типы выводятся автоматически из zod схем

```typescript
// Пример безопасного IPC канала
export const WorkspaceSelectRequestSchema = z.void()
export const WorkspaceSelectResponseSchema = z.object({
  canceled: z.boolean(),
  path: z.string().optional()
})
```

### 2. Тонкий API фасад в preload (`src/preload/index.ts`)

- ✅ **Ограниченный API**: Только узкие use-case методы доступны renderer'у
- ✅ **Нет прямого доступа к репозиториям**: БД операции инкапсулированы
- ✅ **Безопасные подписки**: Реактивные методы с автоматической отпиской

```typescript
// Доступно в renderer
window.modus.getActiveWorkspace()     // ✅ Безопасно
window.modus.saveActiveWorkspace()    // ✅ Безопасно
window.modus.subscribeToFiles()       // ✅ Безопасно

// НЕ доступно в renderer
window.modus.files.getAll()           // ❌ Не экспортируется
window.modus.database.query()         // ❌ Нет прямого доступа к БД
```

### 3. Валидация в main процессе (`src/main/secure-ipc.ts`)

- ✅ **SecureIPCManager**: Автоматическая валидация всех IPC запросов/ответов
- ✅ **Whitelist каналов**: Только предварительно определённые каналы принимаются
- ✅ **Безопасные ошибки**: Детали ошибок не передаются в renderer

```typescript
// Все обработчики автоматически валидируются
SecureIPCManager.handle(IPC_CHANNELS.WORKSPACE_SELECT, async () => {
  // data автоматически валидируется по схеме
  // response автоматически валидируется перед отправкой
})
```

### 4. Безопасность BrowserWindow (`src/main/index.ts`)

- ✅ **contextIsolation: true**: Изоляция контекста для предотвращения загрязнения
- ✅ **sandbox: true**: Песочница для ограничения возможностей renderer
- ✅ **nodeIntegration: false**: Node.js отключен в renderer процессе
- ✅ **webSecurity: true**: Включена веб-безопасность
- ✅ **Блокировка навигации**: Запрещены переходы на внешние URL

### 5. Content Security Policy (`src/renderer/index.html`)

- ✅ **Строгий CSP**: Запрещены eval, unsafe-inline, внешние ресурсы
- ✅ **default-src 'none'**: Минимальные разрешения по умолчанию
- ✅ **Мониторинг нарушений**: CSP нарушения логируются в main процессе

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'none'; 
               script-src 'self'; 
               style-src 'self'; 
               img-src 'self' data: blob:; 
               connect-src 'self';" />
```

## Архитектура безопасности

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Renderer      │    │    Preload      │    │   Main Process  │
│                 │    │                 │    │                 │
│ Ограниченный    │───▶│ Тонкий фасад    │───▶│ Валидация +     │
│ API доступ      │    │ API (whitelist) │    │ Бизнес логика   │
│                 │    │                 │    │                 │
│ CSP защита      │    │ SecureDBHandler │    │ SecureIPCManager│
│ Sandbox         │    │ Типизация       │    │ Zod валидация   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Защита от XSS

### До рефакторинга (уязвимо):
```typescript
// Широкий доступ к репозиториям
window.modus.files.save(maliciousData)      // ❌ Прямой доступ к БД
window.modus.workspace.clear()              // ❌ Может удалить данные
window.modus.subscriptions.filesAll(cb)     // ❌ Прямые подписки
```

### После рефакторинга (безопасно):
```typescript
// Только узкие, валидированные методы
window.modus.saveFile(validatedFile)        // ✅ Валидируется через zod
window.modus.getActiveWorkspace()           // ✅ Только чтение
window.modus.subscribeToFiles(callback)     // ✅ Безопасные подписки
```

## Преимущества новой архитектуры

1. **Принцип минимальных привилегий**: Renderer имеет доступ только к необходимому функционалу
2. **Валидация на всех уровнях**: Все данные проверяются перед обработкой
3. **Типизация**: TypeScript предотвращает ошибки типов на этапе компиляции
4. **Изоляция**: Песочница и контекстная изоляция ограничивают возможности вредоносного кода
5. **Мониторинг**: CSP и security events позволяют отслеживать попытки нарушения безопасности

## Проверка безопасности

Для тестирования безопасности можно использовать следующие проверки:

```javascript
// В devtools renderer процесса - должно быть недоступно:
window.modus.files?.getAll()              // undefined
window.modus.database?.query()            // undefined
eval('malicious code')                    // CSP блокирует
```

## Дополнительные рекомендации

1. **Регулярные аудиты**: Проверяйте код на уязвимости
2. **Обновления зависимостей**: Следите за безопасностью пакетов
3. **Логирование**: Мониторьте подозрительную активность
4. **Тестирование**: Автоматические тесты безопасности