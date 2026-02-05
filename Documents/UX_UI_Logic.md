# UX / UI Logic

Логика интерфейса: вкладки, модалки, отзывчивость, темы, доступность. Иерархия компонентов — в `docs/COMPONENTS.md`.

## Общая структура UI

- **До входа:** только экран входа (`AuthContainer`): форма входа/регистрации, кнопка Google.
- **После входа:** `AppContainer` = Header + Sidebar + MainContent + ModalSystem. Контент зависит от активной вкладки; модалки рендерятся поверх по `uiStore.activeModal`.

## Вкладки

Идентификаторы вкладок задаются в `uiStore` и Sidebar; отображение контента — в `MainContent.svelte` по `activeTab`:

| Tab ID | Компонент | Содержимое |
|--------|-----------|------------|
| dashboard | DashboardTab | SummaryCards, ClockWidget, WeatherWidget, NewsWidget, RadioWidget |
| expenses | ExpensesTab | MonthSelector, CurrencyToggle, ExpensesTable |
| debts | DebtsTab | DebtsTable |
| recurring | RecurringExpensesTab | RecurringExpensesTable (и при необходимости MonthSelector) |
| tasks | TasksTab | DailyTasksSection, MonthlyTasksSection, YearlyTasksSection (дата/месяц из stores) |
| calendar | CalendarTab | CalendarGrid |

Переключение вкладки — только через `uiStore.setActiveTab(id)`. На мобильных сайдбар может сворачиваться; состояние — `uiStore.isMobileSidebarOpen`.

## Модалки

Список модалок и их идентификаторы в `ModalSystem.svelte` и `uiStore.openModal(id)`:

- expense, debt, debtPayment, recurring, category  
- dailyTask, monthlyTask, yearlyTask  
- calendarEvent или calendar-event (оба принимаются)  
- calculator, shoppingList  
- settings, profile  

Открытие: вызов `uiStore.openModal('expense')`, `uiStore.openModal('recurring')` и т.д. Закрытие: `uiStore.closeModal()` (в коде используется именно он; эквивалентно `openModal(null)`). Модалка получает контекст через `uiStore.modalData` и пропсы (например, editId, debtId). Одна модалка активна в момент времени; закрытие по клику вне или по кнопке «Закрыть» вызывает `closeModal()`.

## Отзывчивость

- Breakpoints и стили устройств заданы в `src/styles/` (device-mobile, device-tablet, device-desktop, responsive.css). Инициализация responsive-системы — в `App.svelte` через `initResponsiveSystem()` из `src/lib/utils/responsive.ts`.
- На мобильных сайдбар скрывается/показывается; таблицы и списки могут менять раскладку. VirtualList используется для длинных списков (производительность).

## Темы и язык

- **Тема:** светлая/тёмная; значение в `uiStore.theme`; переключение — ThemeToggle в Header. Сохранение в localStorage; класс/атрибут на корне применяется через глобальные стили.
- **Язык:** EN/RU/AZ/IT; значение в `uiStore.language`; переключение — LanguageSelector в Header. Строки берутся из `src/locales/locale-*.json` через i18n; даты и числа форматируются с учётом локали (см. `src/lib/utils/formatting.ts`).

## Валюта

- Отображение сумм в AZN или USD; переключение — CurrencyToggle в Header. Значение и курс в `financeStore`; курс фиксированный (настраивается в приложении/конфиге).

## Доступность (a11y)

- Инициализация a11y-функций при старте — в `main.ts` (`initAccessibility()` из `src/lib/utils/accessibility.ts`).
- Фокус-ловушки в модалках, семантика (кнопки, ссылки, заголовки), контраст (проверки в themeValidator/contrastCheck). Клавиатурная навигация и жесты документированы в `src/lib/utils/keyboard.ts` и `gestures.ts`.
- E2E и unit-тесты на a11y — в `tests/accessibility.spec.ts`, `tests/e2e/accessibility.spec.ts`; axe-core используется для проверок.

## Ошибки и загрузка

- **Глобальные ошибки:** перехват в `main.ts` через `initGlobalErrorHandler()`; логирование и при необходимости уведомление пользователя.
- **Ошибки в компонентах:** ErrorBoundary в `App.svelte` оборачивает основной контент; при падении дочернего компонента показывается fallback (в dev — детали).
- **Загрузка:** при инициализации auth показывается LoadingOverlay до определения состояния входа.

## Пустые состояния

- Пустые списки (расходы, долги, задачи, события) отображаются через компонент EmptyState или аналогичный паттерн с призывом к действию (например, «Добавить первый расход»).

## Где искать в коде

- Вкладки: `src/components/tabs/*.svelte`, `src/components/layout/MainContent.svelte`, `src/components/layout/Sidebar.svelte`.
- Модалки: `src/components/modals/ModalSystem.svelte`, `src/components/modals/ModalBase.svelte`, отдельные модалки в той же папке.
- Stores UI: `src/lib/stores/uiStore.ts`, `src/lib/stores/financeStore.ts`.
- Стили: `src/styles/`, `tailwind.config.js`.
