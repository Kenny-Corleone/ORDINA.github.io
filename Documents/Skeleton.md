# Skeleton — Карта проекта и главный документ для AI

**Приоритет:** Skeleton.md имеет приоритет над кодом и остальной документацией. При противоречии — следовать Skeleton.md.

**Назначение:** Любой AI, прочитавший только этот файл, должен понять продукт, структуру проекта и знать, куда идти дальше без вопросов.

---

## 1. Продукт и цель

**ORDINA Svelte** — PWA для личных финансов и организации жизни (Life Order Assistant). Реализован на **Svelte 4 + TypeScript + Vite** (не SvelteKit). Полная функциональная совместимость с оригинальным ORDINA 1 (vanilla JS); те же Firebase-проект и схема Firestore.

**Цель продукта:** Единое приложение для учёта расходов, долгов, повторяющихся платежей, задач (дневных/месячных/годовых), календаря событий и дашборда с виджетами (погода, новости, радио, часы). Поддержка офлайн, мультиязычности (EN/RU/AZ/IT), темы (светлая/тёмная), валют (AZN/USD).

---

## 2. Ключевые подсистемы

| Подсистема | Назначение | Где искать |
|------------|------------|-------------|
| **Auth** | Вход/регистрация (email, Google), состояние пользователя | `src/lib/services/firebase/auth.ts`, `src/lib/stores/userStore.ts`, `src/components/auth/` |
| **Finance** | Расходы, долги, повторяющиеся расходы, категории, месяцы, валюта | `src/lib/stores/financeStore.ts`, `src/lib/services/firebase/{expenses,debts,recurring,categories}.ts`, табы Expenses/Debts/Recurring |
| **Tasks** | Дневные/месячные/годовые задачи, перенос (carry-over) | `src/lib/stores/tasksStore.ts`, `src/lib/services/firebase/tasks.ts`, `src/lib/services/carryOver.ts`, таб Tasks |
| **Calendar** | События календаря (типы: event, birthday, meeting, wedding) | `src/lib/stores/calendarStore.ts`, `src/lib/services/firebase/calendar.ts`, таб Calendar |
| **UI state** | Активная вкладка, модалки, тема, язык, офлайн, сайдбар | `src/lib/stores/uiStore.ts`, `src/components/layout/`, `src/components/modals/` |
| **Firebase listeners** | Real-time подписки Firestore → stores | `src/lib/services/firebase/listeners.ts`, инициализация в `App.svelte` |
| **External APIs** | Погода, новости, радио, экспорт CSV | `src/lib/services/{weather,news,radio,export}.ts` |
| **i18n** | Переводы EN/RU/AZ/IT | `src/lib/i18n/`, `src/locales/locale-*.json` |
| **PWA** | Офлайн, установка, манифест, SW | `public/manifest.webmanifest`, `public/sw.js`, регистрация в `main.ts` |

---

## 3. Архитектурная логика

- **Один SPA:** точка входа — `index.html` → `main.ts` → `App.svelte`. Роутинг только через табы (Dashboard, Expenses, Debts, Recurring, Tasks, Calendar), без файловых маршрутов SvelteKit.
- **Слои:** UI (Svelte-компоненты) → Stores (реактивное состояние) → Services (Firebase + внешние API). Прямых вызовов Firebase из компонентов нет — только через сервисы и слушатели, которые пишут в stores.
- **Данные по месяцам:** расходы, статусы повторяющихся расходов, месячные задачи привязаны к `monthId` (YYYY-MM). При смене месяца в `financeStore.selectedMonthId` отключаются слушатели старого месяца и подключаются нового (см. `App.svelte`).
- **Carry-over задач:** при смене дня/месяца (полночь или смена вкладки) незавершённые дневные/месячные задачи переносятся; логика в `carryOver.ts`, планировщик и visibility — в `App.svelte`.

---

## 4. Правила, которые нельзя нарушать

1. **Firestore-схема** совпадает с ORDINA 1. Менять коллекции/поля документов нельзя без синхронизации с ORDINA MAIN.
2. **Типы сущностей** определены в `src/lib/types/index.ts`. Новые поля в Firestore должны быть отражены в типах.
3. **Все побочные эффекты (Firebase, fetch)** — только в `src/lib/services/`. Компоненты не импортируют `firebase` напрямую (кроме `App.svelte` для `auth` и инициализации слушателей).
4. **Состояние приложения** живёт в stores (`src/lib/stores/`). Не вводить глобальные переменные для доменного состояния.
5. **Модалки** управляются через `uiStore.activeModal`; открытие — `uiStore.openModal('expense')`, `openModal('recurring')` и т.д.; закрытие — `uiStore.closeModal()` (или `openModal(null)`).
6. **Локализация** — только через i18n (`src/lib/i18n`), ключи из `src/locales/`. Не хардкодить строки интерфейса.
7. **Production base path:** в Vite задан `base: '/ORDINA.github.io/'` для продакшена; учёт при регистрации SW и ссылках.

---

## 5. Что AI может и не может менять

**Можно:**
- Исправлять баги в компонентах, stores, services, utils.
- Добавлять типы в `src/lib/types/index.ts` при добавлении полей, согласованных с Firestore.
- Добавлять ключи локализации в `src/locales/*.json` и использовать их.
- Улучшать доступность, тесты, стили (в рамках текущей структуры).
- Рефакторить код без изменения контрактов (сигнатуры store, сервисов, путей Firestore).

**Нельзя без явного решения:**
- Менять структуру коллекций/документов Firestore.
- Менять список вкладок или идентификаторы модалок (риск поломать `uiStore` и навигацию).
- Удалять или переименовывать stores или их основные поля.
- Подключать другой backend или менять способ аутентификации (Firebase Auth).
- Менять `base` в Vite или путь регистрации SW без учёта деплоя.

---

## 6. Навигация по документации (все файлы в `/Documents`)

| Документ | Содержание |
|----------|------------|
| **Skeleton.md** (этот файл) | Продукт, подсистемы, архитектура, правила, что можно/нельзя, навигация. |
| **Product_Overview.md** | Описание продукта, фичи, целевая аудитория, границы продукта. |
| **Product_Philosophy.md** | Принципы продукта, ценности, допущения. |
| **User_Guide.md** | Как пользоваться: вход, вкладки, модалки, экспорт, офлайн, настройки. |
| **UX_UI_Logic.md** | Логика интерфейса: вкладки, модалки, отзывчивость, темы, доступность. |
| **Technical_Architecture.md** | Стек, структура папок, потоки данных, Firebase, сервисы, сборка. |
| **Code_Standards.md** | Стиль кода, Svelte/TS практики, именование, тесты. |
| **Quality_and_Maintenance.md** | Тесты (unit, e2e, visual, a11y), поддержка, исправление ошибок. |
| **Security_and_Data.md** | Секреты, Firebase rules, персональные данные, офлайн-данные. |
| **Roadmap.md** | Планы, допущения по будущему, приоритеты. |

---

## 7. Навигация по проекту (файлы и папки)

| Путь | Ответственность |
|------|-----------------|
| `index.html` | HTML-оболочка: `#svelte-root`, подключение `src/main.ts`; манифест, favicon, particles.js. |
| `src/main.ts` | Точка входа: полифиллы, глобальный обработчик ошибок, a11y, i18n-валидация (dev), монтирование App, регистрация SW. |
| `src/App.svelte` | Корень UI: auth state → AuthContainer или AppContainer; инициализация/отписка Firebase listeners, carry-over по месяцу/дню, PWA shortcuts. |
| `src/components/auth/` | Экран входа/регистрации (AuthContainer). |
| `src/components/layout/` | AppContainer, Header, Sidebar, MainContent. |
| `src/components/tabs/` | DashboardTab, ExpensesTab, DebtsTab, RecurringExpensesTab, TasksTab, CalendarTab. |
| `src/components/modals/` | ModalSystem + ModalBase, все модалки (expense, debt, debtPayment, recurring, category, dailyTask, monthlyTask, yearlyTask, calendarEvent, calculator, shoppingList, settings, profile). |
| `src/components/dashboard/` | Виджеты: Clock, Weather, News, Radio, SummaryCards. |
| `src/components/expenses/`, `debts/`, `recurring/`, `tasks/`, `calendar/` | Таблицы и секции по фичам (ExpensesTable, DebtsTable, RecurringExpensesTable, Daily/Monthly/YearlyTasksSection, CalendarGrid). |
| `src/components/ui/` | MonthSelector, CurrencyToggle, ThemeToggle, LanguageSelector, VirtualList, EmptyState, ErrorBoundary, LoadingOverlay. |
| `src/lib/stores/` | userStore, financeStore, tasksStore, calendarStore, uiStore. |
| `src/lib/services/firebase/` | auth, expenses, debts, recurring, categories, tasks, calendar, listeners. |
| `src/lib/services/` | carryOver, export, weather, news, radio (вне Firebase). |
| `src/lib/types/index.ts` | Все интерфейсы и enum (Expense, Debt, Task, CalendarEvent, Store-типы и т.д.). |
| `src/lib/i18n/` | Инициализация и валидация переводов. |
| `src/lib/utils/` | formatting, validation, errorHandler, logger, accessibility, responsive, gestures, keyboard, performance, polyfills, themeValidator и др. |
| `src/locales/` | locale-en.json, locale-ru.json, locale-az.json, locale-it.json. |
| `src/styles/` | main.css, responsive, device-*, accessibility, dashboard-fixes, performance-optimizations. |
| `src/lib/firebase.ts` | Инициализация Firebase App, Firestore, Auth (env: VITE_FIREBASE_*). |
| `public/` | Статика: favicons, логотипы, скриншоты, manifest.webmanifest, sw.js. |
| `tests/` | E2E (Playwright), визуальные и a11y-тесты; unit/интеграция — рядом с кодом (*.test.ts). |
| `docs/` | Существующая техдокументация (ARCHITECTURE, COMPONENTS, PROGRESS и т.д.); не заменяет `/Documents`. |
| `vite.config.ts`, `svelte.config.js`, `tailwind.config.js` | Сборка, алиасы, chunking, Tailwind. |

---

## 8. Где искать информацию при ошибках

- **Ошибка в данных (расходы/долги/задачи/календарь):** типы в `Documents/Technical_Architecture.md` и `src/lib/types/index.ts`; сервисы в `src/lib/services/firebase/`; listeners в `listeners.ts` и `App.svelte`.
- **Ошибка отображения/вкладки/модалки:** `Documents/UX_UI_Logic.md`, `docs/COMPONENTS.md`, соответствующий компонент в `src/components/`.
- **Ошибка аутентификации:** `src/lib/services/firebase/auth.ts`, `userStore`, `Documents/Security_and_Data.md`.
- **Ошибка сборки/деплоя:** `vite.config.ts`, `Documents/Technical_Architecture.md`, base path и SW путь в `main.ts`.
- **Ошибка теста:** `Documents/Quality_and_Maintenance.md`, `tests/e2e/README.md`, соответствующий *.spec.ts или *.test.ts.
- **Что можно править без риска сломать контракты:** `Documents/Code_Standards.md`, раздел «Что AI может менять» выше.

---

## 9. Допущения при нехватке информации

При отсутствии информации в коде или в других документах делать разумные допущения и **явно помечать их** (в комментарии в коде или в соответствующем документе в `/Documents`). Пример: «*Допущение: правила Firestore настраиваются в консоли Firebase; в репозитории не хранятся.*»

---

*Документ создан как единая точка входа для AI. Обновлять при изменении структуры продукта или правил.*
