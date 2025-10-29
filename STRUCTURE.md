# ORDINA - Новая модульная структура проекта

## Обзор

Проект полностью реорганизован в модульную архитектуру для улучшения поддерживаемости, масштабируемости и совместимости с GitHub Pages.

## Структура проекта

```
ordina/
├── assets/                    # Статические ресурсы
│   ├── images/               # Изображения
│   └── icons/                # Иконки
│
├── css/                      # Стили
│   ├── core/                 # Базовые стили
│   │   ├── variables.css     # CSS переменные
│   │   ├── reset.css         # Нормализация
│   │   ├── typography.css    # Типографика
│   │   └── animations.css    # Анимации
│   │
│   ├── layout/               # Структура страницы
│   │   ├── header.css        # Верхняя панель
│   │   ├── navigation.css    # Навигация
│   │   ├── sidebar.css       # Боковая панель
│   │   └── footer.css        # Футер
│   │
│   ├── components/           # Компоненты
│   │   ├── buttons.css
│   │   ├── cards.css
│   │   ├── forms.css
│   │   ├── modals.css
│   │   ├── weather.css
│   │   ├── dashboard.css
│   │   ├── expenses.css
│   │   ├── debts.css
│   │   ├── tasks.css
│   │   ├── calendar.css
│   │   └── news.css
│   │
│   ├── themes/               # Темы
│   │   ├── light.css         # Светлая тема
│   │   └── dark.css          # Темная тема
│   │
│   ├── responsive/           # Адаптивность
│   │   ├── mobile.css        # 320px - 640px
│   │   ├── tablet.css        # 641px - 1024px
│   │   └── desktop.css       # 1025px+
│   │
│   └── main-new.css          # Главный файл (импорты)
│
├── js/                       # JavaScript
│   ├── core/                 # Ядро приложения
│   │   ├── app.js            # Главный класс OrdinaApp
│   │   ├── firebase.js       # Firebase инициализация
│   │   └── router.js         # Роутер
│   │
│   ├── services/             # Сервисы
│   │   ├── auth.service.js   # Аутентификация
│   │   ├── weather.service.js # API погоды
│   │   ├── news.service.js   # API новостей
│   │   └── firestore.service.js # Firestore операции
│   │
│   ├── components/           # Переиспользуемые компоненты
│   │   ├── header/
│   │   │   ├── header.component.js
│   │   │   └── header.template.js
│   │   ├── weather/
│   │   │   ├── weather.component.js
│   │   │   └── weather.template.js
│   │   ├── toast/
│   │   │   ├── toast.component.js
│   │   │   └── toast.template.js
│   │   └── modal/
│   │       └── modal.component.js
│   │
│   ├── modules/              # Модули приложения
│   │   ├── dashboard/
│   │   │   ├── dashboard.module.js
│   │   │   ├── dashboard.controller.js
│   │   │   └── dashboard.template.js
│   │   ├── expenses/
│   │   │   ├── expenses.module.js
│   │   │   ├── expenses.controller.js
│   │   │   └── expenses.template.js
│   │   ├── debts/
│   │   │   ├── debts.module.js
│   │   │   ├── debts.controller.js
│   │   │   └── debts.template.js
│   │   ├── tasks/
│   │   │   ├── tasks.module.js
│   │   │   ├── tasks.controller.js
│   │   │   └── tasks.template.js
│   │   ├── calendar/
│   │   │   ├── calendar.module.js
│   │   │   ├── calendar.controller.js
│   │   │   └── calendar.template.js
│   │   └── news/
│   │       ├── news.module.js
│   │       ├── news.controller.js
│   │       └── news.template.js
│   │
│   ├── utils/                # Утилиты
│   │   ├── helpers.js        # Вспомогательные функции
│   │   ├── formatters.js     # Форматирование данных
│   │   ├── validators.js     # Валидация
│   │   └── storage.js        # localStorage обертка
│   │
│   ├── i18n/                 # Интернационализация
│   │   ├── translations.js   # Система переводов
│   │   ├── ru.js             # Русский
│   │   ├── en.js             # English
│   │   └── az.js             # Azərbaycan
│   │
│   └── main.js               # Точка входа
│
└── index.html                # HTML (будет минимизирован)
```

## Ключевые принципы

### 1. Модульность
- Каждый модуль - отдельная папка с module, controller, template
- Четкое разделение ответственности
- Легко добавлять новые модули

### 2. ES6 Modules
- Использование import/export
- Нативная поддержка браузерами
- Работает на GitHub Pages без сборки

### 3. Service Layer
- Вся бизнес-логика в сервисах
- Легко тестировать
- Переиспользование между модулями

### 4. Component System
- Переиспользуемые UI компоненты
- Разделение логики и шаблонов
- Четкий жизненный цикл

### 5. CSS Architecture
- Mobile-first подход
- Модульные стили
- CSS переменные для тем
- Адаптивность на всех breakpoints

## Следующие шаги

Структура создана. Следующие задачи:
1. Создание Core системы (app.js, router.js, firebase.js)
2. Создание Service Layer
3. Создание Utils и Helpers
4. Миграция модулей
5. Реорганизация CSS
6. Обновление index.html

## Статус

✅ Задача 1: Подготовка проекта и создание структуры - ЗАВЕРШЕНА

Созданы:
- 📁 Полная структура папок
- 📄 Базовые файлы для всех модулей
- 📄 Базовые файлы для всех сервисов
- 📄 Базовые файлы для всех компонентов
- 📄 Базовые файлы для всех утилит
- 📄 Полная CSS структура
- 📄 Система интернационализации
- 📄 Главный файл инициализации

Все файлы содержат заглушки с комментариями "Будет реализовано в следующих задачах".
