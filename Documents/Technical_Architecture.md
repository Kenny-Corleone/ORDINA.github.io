# Technical Architecture

## Стек

| Слой    | Технология                                                                  |
| ------- | --------------------------------------------------------------------------- |
| UI      | Svelte 4                                                                    |
| Язык    | TypeScript (strict)                                                         |
| Сборка  | Vite 5                                                                      |
| Стили   | Tailwind CSS 3 + кастомный CSS (`src/styles/`)                              |
| Backend | Firebase (Auth + Firestore); внешние API: OpenWeatherMap, RSS, Zeno.FM      |
| Тесты   | Vitest (unit/property), Playwright (e2e), axe-core (a11y), визуальные тесты |
| Node    | 20.x (см. `.nvmrc`)                                                         |

Примечание: проект на **Svelte + Vite**, не SvelteKit. Роутинг — только через вкладки (stores), без файловых маршрутов.

## Структура каталогов (ключевое)

```
src/
├── main.ts                 # Точка входа: полифиллы, error handler, a11y, i18n (dev), App, SW
├── App.svelte              # Auth → AuthContainer | AppContainer; listeners, carry-over, PWA shortcuts
├── app.css                 # Точка входа стилей (импорт в main.ts); импортирует styles/main.css и др. (responsive, device-*, accessibility и т.д.) + Tailwind
├── components/
│   ├── auth/               # AuthContainer
│   ├── layout/             # AppContainer, Header, Footer, Sidebar, MainContent
│   │   └── mobile/         # MobileLayout, MobileHeader, MobileBottomNav, MobileSheet
│   ├── tabs/               # DashboardTab, ExpensesTab, DebtsTab, RecurringExpensesTab, TasksTab, CalendarTab
│   ├── modals/             # ModalSystem, ModalBase, все модалки
│   ├── dashboard/         # Виджеты: Clock, Weather, News, Radio, SummaryCards
│   ├── expenses/, debts/, recurring/, tasks/, calendar/  # Таблицы и секции
│   └── ui/                 # MonthSelector, CurrencyToggle, ThemeToggle, LanguageSelector, VirtualList, EmptyState, ErrorBoundary, LoadingOverlay
├── lib/
│   ├── firebase.ts         # Инициализация Firebase (env: VITE_FIREBASE_*)
│   ├── types/index.ts     # Все интерфейсы и enum
│   ├── stores/            # userStore, financeStore, tasksStore, calendarStore, uiStore, mobileStore, radioStore, clockStore, weatherStore
│   ├── services/
│   │   ├── firebase/       # auth, expenses, debts, recurring, categories, tasks, calendar, listeners
│   │   └── *.ts            # carryOver, export, weather, news, radio
│   ├── i18n/              # Инициализация и валидация переводов
│   └── utils/             # formatting, validation, errorHandler, logger, accessibility, responsive, gestures, keyboard, performance, polyfills, themeValidator и др.
├── locales/               # locale-en.json, locale-ru.json, locale-az.json, locale-it.json
└── styles/                # main.css, responsive, device-*, accessibility, dashboard-fixes, performance-optimizations

public/                    # Статика: favicons, логотипы, скриншоты, manifest.webmanifest, sw.js
tests/                     # E2E (e2e/), визуальные (visual/), a11y, performance
docs/                      # Существующая техдокументация (ARCHITECTURE, COMPONENTS, PROGRESS)
Documents/                  # Продуктовая и техдокументация (этот набор документов)
```

## Потоки данных

1. **Auth:** Firebase Auth → `onAuthStateChanged` в `App.svelte` → `userStore.setUser` / `clearUser`. При входе вызывается `initializeListeners(userId)`.
2. **Firestore → UI:** Подписки в `listeners.ts` (ListenerManager) привязаны к коллекциям; при изменении данных callback вызывает методы stores (`financeStore.setExpenses`, `tasksStore.setDailyTasks` и т.д.). Компоненты подписаны на stores через `$store`.
3. **UI → Firestore:** Действия пользователя в компонентах вызывают сервисы (`src/lib/services/firebase/*.ts`: create, update, delete). Сервисы пишут в Firestore; listeners обновляют stores, UI реагирует через подписки.
4. **Месяц:** При смене `financeStore.selectedMonthId` (MonthSelector) в `App.svelte` срабатывает подписка на financeStore: вызывается `detachMonthListeners()` и `attachMonthListeners(userId, newMonthId)`.
5. **Carry-over:** В полночь или при `visibilitychange` вызываются `checkForNewDay` / `checkForNewMonth` из `carryOver.ts`; при смене дня/месяца выполняются переносы задач и обновление stores/listeners при необходимости.

## Firebase

- **Конфиг:** `src/lib/firebase.ts`; переменные `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`. Пример — `.env.example`.
- **Коллекции (логическая структура):** users/{userId}/debts, users/{userId}/monthlyData/{monthId}/expenses, users/{userId}/monthlyData/{monthId}/tasks, users/{userId}/recurringExpenses, users/{userId}/categories, users/{userId}/calendarEvents, users/{userId}/dailyTasks, users/{userId}/yearlyTasks и т.д. Точное дерево — в `docs/ARCHITECTURE.md` и ORDINA 1; схема не должна меняться без согласования.
- **Слушатели:** Создаются в `App.svelte` через `createListenerManager()`; при logout вызывается `listenerManager.detachAll()`. Месячные слушатели переключаются при смене месяца (см. выше).

## Сборка и деплой

- **Dev:** `npm run dev` (Vite dev server, по умолчанию порт 3002).
- **Build:** `npm run build` (Vite build; выход — `dist/`). В production: `base: '/ORDINA.github.io/'`, минификация (terser), `drop_console: true`, ручное разбиение чанков (Firebase в `vendor-firebase`, остальные node_modules в `vendor`).
- **Preview:** `npm run preview` — локальный просмотр production-сборки.
- **Service Worker:** В production регистрируется `/ORDINA.github.io/sw.js` (см. `main.ts`); при другом base path путь SW нужно скорректировать.

## Алиасы и конфиги

- Vite: `@` → `./src` (см. `vite.config.ts`).
- TypeScript: `tsconfig.json`, `tsconfig.node.json`; Svelte — `svelte.config.js` (vitePreprocess).
- Tailwind: `tailwind.config.js`; PostCSS — `postcss.config.js`.

## Зависимости

- **Production:** firebase.
- **Dev/build/test:** svelte, @sveltejs/vite-plugin-svelte, vite, typescript, tailwindcss, postcss, autoprefixer; vitest, @playwright/test, @testing-library/svelte, jsdom, axe-core, fast-check и др. См. `package.json`.

Детали компонентов и stores — в `docs/COMPONENTS.md` и `docs/ARCHITECTURE.md`. Правила и ограничения — в `Skeleton.md`.
