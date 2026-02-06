# Quality and Maintenance

## Тестирование

### Unit и интеграционные тесты (Vitest)

- **Расположение:** Файлы `*.test.ts` рядом с исходным кодом (например, `src/lib/services/carryOver.test.ts`, `src/lib/stores/stores.test.ts`) или в том же каталоге компонента.
- **Запуск:** `npm run test` (run once), `npm run test:watch`, `npm run test:ui`.
- **Конфиг:** `vitest.config.ts`, `vitest.setup.ts`; окружение jsdom.
- **Покрытие:** Критические утилиты (formatting, validation, helpers), сервисы (carryOver, export, firebase CRUD), stores, i18n/validator. Property-based тесты — для инвариантов (carry-over, конвертация валют, responsive).

### E2E (Playwright)

- **Расположение:** `tests/e2e/*.spec.ts` (auth, expenses, debts, tasks, calendar, navigation, offline, accessibility).
- **Запуск:** `npm run test:e2e`. Перед тестами поднимается dev-сервер (см. `playwright.config.ts`).
- **Хелперы:** `tests/e2e/helpers.ts` — login, создание тестовых сущностей, навигация по вкладкам. Учётные данные — через `TEST_USER_EMAIL`, `TEST_USER_PASSWORD` (или значения по умолчанию в хелпере).
- **Селекторы:** Предпочитать `data-testid` для стабильных селекторов; при добавлении фич добавлять testid где нужно для E2E.
- **Документация:** Подробности в `tests/e2e/README.md`.

> Виджеты Weather/News/Radio имеют внешние API и браузерные зависимости; их unit-тесты помечены как skipped в `src/components/dashboard/widgets.test.ts` и покрываются ручной/интеграционной проверкой.

### Текущее состояние проверок (последний прогон)

<!-- last-run:start -->
- **Unit (Vitest):** update after latest test run.
- **Build (Vite):** update after latest build.
- **Lint:** update after latest lint run.
<!-- last-run:end -->

Обновление блока выполняется через `npm run docs:last-run` (см. `scripts/update-last-run.js`).

### Визуальные и a11y тесты

- **Визуальные:** `tests/visual/` — базовые сценарии, захват скриншотов, визуальная регрессия. Могут требовать авторизации и тестовых данных.
- **Доступность:** `tests/accessibility.spec.ts`, `tests/e2e/accessibility.spec.ts`; использование axe-core. Цель — соответствие WCAG 2.1 AA.

### Performance

- **Тесты:** `tests/performance.spec.ts`, `tests/performance-basic.spec.ts` — базовые проверки производительности при необходимости.

## Исправление ошибок без полного аудита

1. **Определить область:** По сообщению/стеку ошибки определить подсистему (auth, finance, tasks, calendar, UI, сборка). Навигация по коду — в `Skeleton.md`, раздел 7.
2. **Типы и контракты:** Проверить `src/lib/types/index.ts` и соответствующий store/service; при несоответствии данных Firestore обновить типы и маппинг в listeners/services.
3. **Поток данных:** Убедиться, что обновление идёт по цепочке: Firestore → listener → store → компонент; или действие пользователя → сервис → Firestore → listener → store. Не обходить stores.
4. **Локализация:** Если ошибка связана с отсутствующей строкой — добавить ключ в `src/locales/*.json` и использовать через i18n.
5. **Регрессия:** После правки запустить затронутые тесты: `npm run test`, при необходимости `npm run test:e2e` для сценария. При изменении UI — проверить визуальные/a11y тесты если они есть для этого экрана.

## Поддержка и обновления

- **Зависимости:** Регулярно обновлять зависимости (`npm update`); при мажорных обновлениях Svelte/Vite/Firebase — проверять breaking changes и тесты.
- **Документация:** При изменении архитектуры или правил обновлять `Documents/` и при необходимости `docs/`. Главная точка входа для AI — `Skeleton.md`.
- **Логи и мониторинг:** В production логи через logger не выводятся в консоль (drop_console); при необходимости добавить отправку ошибок во внешний сервис через глобальный error handler в `main.ts`.

## Чек-лист перед релизом

- [ ] `npm run build` без ошибок.
- [ ] `npm run test` проходит.
- [ ] Критичные E2E сценарии проходят (`npm run test:e2e`).
- [ ] Проверка base path и регистрации SW для целевого деплоя.
- [ ] Переменные окружения (Firebase, при необходимости OpenWeather) заданы для production.
- [ ] Документация в `Documents/` актуальна при изменении продукта или правил.

Дополнительно: `Code_Standards.md`, `Technical_Architecture.md`, `Skeleton.md` (раздел 8 — где искать при ошибках).
