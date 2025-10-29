# 💎 ORDINA - Personal Finance & Life Management Suite

<div align="center">

![ORDINA Logo](logo%20ORDINA.png)

**Управляй своей жизнью с легкостью**

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?style=for-the-badge&logo=github)](https://github.com)
[![Firebase](https://img.shields.io/badge/Firebase-Ready-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[🚀 Быстрый Старт](#-быстрый-старт) • [📖 Документация](#-документация) • [✨ Функции](#-функции) • [🛠️ Технологии](#️-технологии) • [🏗️ Архитектура](#️-архитектура)

</div>

---

## 🎯 О Проекте

**ORDINA** - это современное модульное веб-приложение для управления личными финансами и жизнью. Построено на чистой архитектуре с использованием ES6 модулей, полностью адаптивный интерфейс, темная тема, поддержка 3 языков и интеграция с Firebase.

### 🏆 Ключевые Преимущества

- 🎨 **Модульная архитектура** - Чистый, поддерживаемый код
- 📱 **100% адаптивность** - От 320px до 4K экранов
- ⚡ **Высокая производительность** - Ленивая загрузка модулей
- 🔒 **Безопасность** - Firebase Authentication + Firestore
- 🌐 **Без сборки** - Работает на GitHub Pages из коробки
- ♿ **Доступность** - WCAG 2.1 совместимость

### ⚡ Главные Особенности

- 🔐 **Безопасная аутентификация** - Email/Password + Google Sign-In
- 💰 **Управление финансами** - Долги, расходы, бюджет
- ✅ **Система задач** - Дневные, месячные, годовые
- 📅 **Умный календарь** - События, дни рождения, встречи
- 🌤️ **Виджет погоды** - Актуальная информация
- 📰 **Лента новостей** - Мировые новости
- 🧮 **Калькулятор** - Встроенный калькулятор
- 🛒 **Список покупок** - С подсчетом суммы
- 🎵 **Радио плеер** - AzerbaiJazz Radio
- 🌓 **Темная тема** - Комфорт для глаз
- 🌍 **3 языка** - Русский, English, Azərbaycan

---

## 🚀 Быстрый Старт

### Предварительные Требования

- Современный браузер с поддержкой ES6 модулей (Chrome 61+, Firefox 60+, Safari 11+, Edge 16+)
- Firebase проект (для аутентификации и базы данных)
- API ключи для погоды и новостей (опционально)

### Вариант 1: GitHub Pages (Рекомендуется)

1. **Форкните репозиторий**
   ```bash
   git clone https://github.com/ваш-username/ORDINA.git
   cd ORDINA
   ```

2. **Настройте Firebase**
   - Создайте проект на [Firebase Console](https://console.firebase.google.com)
   - Включите Authentication (Email/Password и Google)
   - Создайте Firestore Database
   - Скопируйте конфигурацию в `js/config.js`

3. **Настройте API ключи** (опционально)
   - OpenWeatherMap API для погоды
   - Currents API для новостей
   - Обновите ключи в `js/config.js`

4. **Активируйте GitHub Pages**
   - Settings → Pages
   - Source: Deploy from branch
   - Branch: `main` → `/ (root)`
   - Save

5. **Готово!** Ваш сайт доступен через 2-5 минут

### Вариант 2: Локальный Запуск

```bash
# Клонируйте репозиторий
git clone https://github.com/ваш-username/ORDINA.git
cd ORDINA

# Запустите локальный сервер (необходимо для ES6 модулей)
# Python 3
python -m http.server 8000

# Или Node.js
npx http-server -p 8000

# Или PHP
php -S localhost:8000

# Откройте http://localhost:8000
```

### Вариант 3: Быстрый Тест

Для быстрого тестирования без настройки Firebase:
1. Откройте `index.html` через локальный сервер
2. Приложение будет работать с mock данными
3. Некоторые функции будут ограничены без Firebase

---

## ✨ Функции

### 💰 Финансовый Менеджмент

#### Управление Долгами
- ➕ Добавление долгов с деталями
- 💳 Отслеживание платежей
- 📊 Визуализация остатков
- 📝 Комментарии и заметки

#### Ежемесячные Расходы
- 📋 Шаблоны регулярных платежей
- ✅ Отметка оплаченных
- 🔔 Напоминания о сроках
- 📈 Статистика по месяцам

#### Расходы
- 🏷️ Категории расходов
- 📅 Отслеживание по датам
- 📊 Графики и аналитика
- 💱 Поддержка валют (AZN/USD)

### ✅ Управление Задачами

#### Дневные Задачи
- 📝 Список на сегодня
- ✔️ Отметка выполнения
- 🔄 Автоперенос незавершенных
- 📌 Заметки к задачам

#### Месячные Задачи
- 📆 Задачи с дедлайнами
- 🎯 Приоритеты
- 📊 Прогресс выполнения
- 🔗 Связь с событиями

#### Годовые Задачи
- 🎯 Долгосрочные цели
- 📈 Отслеживание прогресса
- 📝 Детальные заметки
- ✨ Мотивация

### 📅 Календарь

#### Типы Событий
- 🎉 Обычные события
- 🎂 Дни рождения (с возрастом)
- 🤝 Встречи (время и место)
- 💒 Свадьбы

#### Функции
- 📱 Автосоздание задач
- 🔔 Напоминания
- 📊 Обзор месяца
- 🎨 Цветовая кодировка

### 🌐 Виджеты

#### Погода
- 🌤️ Текущая температура
- 📍 Определение местоположения
- 🌍 Любой город мира
- 🕐 Местное время

#### Новости
- 📰 Мировые новости
- 🌍 Фильтр по странам
- 🏷️ Категории
- 🔄 Автообновление

#### Калькулятор
- ➕ Базовые операции
- 🎨 Красивый интерфейс
- ⌨️ Поддержка клавиатуры
- 📱 Адаптивный

#### Список Покупок
- 🛒 Добавление товаров
- 💰 Подсчет суммы
- ✅ Отметка купленных
- 📋 Экспорт списка

---

## 🛠️ Технологии

### Frontend
- **HTML5** - Семантическая разметка
- **CSS3** - Современные стили с CSS Grid и Flexbox
- **JavaScript ES6+** - Модульный код с классами
- **ES6 Modules** - Нативные модули без сборщиков

### Backend & Database
- **Firebase Authentication** - Email/Password + Google Sign-In
- **Cloud Firestore** - NoSQL база данных в реальном времени
- **Firebase Security Rules** - Защита данных на уровне базы

### Библиотеки
- **Chart.js 4.x** - Графики и диаграммы
- **Font Awesome 6.x** - Иконки
- **Firebase SDK 10.x** - Firebase интеграция

### APIs
- **OpenWeatherMap API** - Актуальная погода
- **Currents API** - Мировые новости
- **Geolocation API** - Определение местоположения

### Инструменты Разработки
- **ESLint** - Линтинг кода (опционально)
- **Prettier** - Форматирование кода (опционально)
- **Git** - Контроль версий
- **GitHub Pages** - Хостинг без настройки

---

## 🏗️ Архитектура

### Модульная Структура

ORDINA построен на чистой модульной архитектуре с четким разделением ответственности:

```
ORDINA/
├── index.html                    # Точка входа приложения
├── assets/                       # Статические ресурсы
│   ├── images/                   # Изображения
│   └── icons/                    # Иконки
├── css/                          # Стили
│   ├── core/                     # Базовые стили
│   │   ├── variables.css         # CSS переменные
│   │   ├── reset.css             # Нормализация
│   │   ├── typography.css        # Типографика
│   │   └── animations.css        # Анимации
│   ├── layout/                   # Структурные элементы
│   │   ├── header.css            # Верхняя панель
│   │   ├── navigation.css        # Навигация
│   │   ├── sidebar.css           # Боковая панель
│   │   └── footer.css            # Подвал
│   ├── components/               # Компоненты
│   │   ├── buttons.css           # Кнопки
│   │   ├── cards.css             # Карточки
│   │   ├── forms.css             # Формы
│   │   ├── modals.css            # Модальные окна
│   │   ├── weather.css           # Виджет погоды
│   │   ├── news.css              # Виджет новостей
│   │   ├── tasks.css             # Задачи
│   │   ├── expenses.css          # Расходы
│   │   ├── debts.css             # Долги
│   │   ├── calendar.css          # Календарь
│   │   └── dashboard.css         # Дашборд
│   ├── themes/                   # Темы
│   │   ├── light.css             # Светлая тема
│   │   └── dark.css              # Темная тема
│   ├── responsive/               # Адаптивность
│   │   ├── mobile.css            # 320px - 640px
│   │   ├── tablet.css            # 641px - 1024px
│   │   └── desktop.css           # 1025px+
│   └── main.css                  # Главный файл стилей
├── js/                           # JavaScript модули
│   ├── core/                     # Ядро приложения
│   │   ├── app.js                # Главный класс приложения
│   │   ├── router.js             # Роутер
│   │   ├── firebase.js           # Firebase инициализация
│   │   └── config.js             # Конфигурация
│   ├── services/                 # Сервисный слой
│   │   ├── auth.service.js       # Аутентификация
│   │   ├── firestore.service.js  # База данных
│   │   ├── weather.service.js    # API погоды
│   │   └── news.service.js       # API новостей
│   ├── modules/                  # Функциональные модули
│   │   ├── dashboard/            # Дашборд
│   │   │   ├── dashboard.module.js
│   │   │   ├── dashboard.controller.js
│   │   │   └── dashboard.template.js
│   │   ├── expenses/             # Расходы
│   │   │   ├── expenses.module.js
│   │   │   ├── expenses.controller.js
│   │   │   └── expenses.template.js
│   │   ├── debts/                # Долги
│   │   │   ├── debts.module.js
│   │   │   ├── debts.controller.js
│   │   │   └── debts.template.js
│   │   ├── tasks/                # Задачи
│   │   │   ├── tasks.module.js
│   │   │   ├── tasks.controller.js
│   │   │   └── tasks.template.js
│   │   ├── calendar/             # Календарь
│   │   │   ├── calendar.module.js
│   │   │   ├── calendar.controller.js
│   │   │   └── calendar.template.js
│   │   └── news/                 # Новости
│   │       ├── news.module.js
│   │       ├── news.controller.js
│   │       └── news.template.js
│   ├── components/               # UI компоненты
│   │   ├── header/               # Верхняя панель
│   │   │   ├── header.component.js
│   │   │   └── header.template.js
│   │   ├── weather/              # Виджет погоды
│   │   │   ├── weather.component.js
│   │   │   └── weather.template.js
│   │   ├── toast/                # Уведомления
│   │   │   ├── toast.component.js
│   │   │   └── toast.template.js
│   │   └── modal/                # Модальные окна
│   │       ├── modal.component.js
│   │       └── modal.template.js
│   ├── utils/                    # Утилиты
│   │   ├── helpers.js            # Вспомогательные функции
│   │   ├── formatters.js         # Форматирование данных
│   │   ├── validators.js         # Валидация
│   │   ├── storage.js            # LocalStorage обертка
│   │   └── performance.js        # Оптимизация производительности
│   ├── i18n/                     # Интернационализация
│   │   ├── translations.js       # Система переводов
│   │   ├── ru.js                 # Русский
│   │   ├── en.js                 # English
│   │   └── az.js                 # Azərbaycan
│   └── main.js                   # Точка входа
└── README.md                     # Документация
```

### Архитектурные Принципы

#### 1. Модульность
- Каждый модуль - независимая единица с четкой ответственностью
- ES6 import/export для явных зависимостей
- Ленивая загрузка модулей для оптимизации

#### 2. Разделение Слоев
- **Core Layer**: Управление жизненным циклом приложения
- **Service Layer**: Бизнес-логика и внешние API
- **Module Layer**: Функциональные модули (Dashboard, Expenses, etc.)
- **Component Layer**: Переиспользуемые UI компоненты
- **Utils Layer**: Вспомогательные функции

#### 3. Паттерны Проектирования
- **Module Pattern**: Инкапсуляция функционала
- **Service Pattern**: Централизованная бизнес-логика
- **Template Pattern**: Разделение логики и представления
- **Observer Pattern**: Реактивное обновление UI

#### 4. Производительность
- Ленивая загрузка модулей
- Кэширование API запросов
- Оптимизация перерисовок DOM
- Debounce/Throttle для событий

## 📖 Документация

### Основные Концепции

#### Жизненный Цикл Приложения

```javascript
// 1. Инициализация
OrdinaApp.init()
  → Firebase инициализация
  → Регистрация сервисов
  → Регистрация модулей
  → Настройка роутера
  → Проверка аутентификации
  → Загрузка начального модуля

// 2. Навигация
Router.navigate('expenses')
  → Выгрузка текущего модуля
  → Загрузка нового модуля
  → Обновление UI

// 3. Модуль
Module.load()
  → Получение контейнера
  → Загрузка данных (fetchData)
  → Рендеринг UI (render)
  → Установка обработчиков (setupEventListeners)
```

#### Работа с Сервисами

```javascript
// Получение сервиса
const firestoreService = app.getService('firestore');

// Использование сервиса
const expenses = await firestoreService.getExpenses(userId, monthId);
await firestoreService.addExpense(userId, expenseData);
```

#### Создание Нового Модуля

```javascript
// 1. Создайте структуру
js/modules/mymodule/
  ├── mymodule.module.js
  ├── mymodule.controller.js
  └── mymodule.template.js

// 2. Реализуйте BaseModule
class MyModule extends BaseModule {
  async fetchData() { /* ... */ }
  render() { /* ... */ }
  setupEventListeners() { /* ... */ }
}

// 3. Зарегистрируйте в main.js
app.registerModule('mymodule', new MyModule(app));
```

### API Документация

#### OrdinaApp API

```javascript
// Регистрация модуля
app.registerModule(name: string, module: BaseModule): void

// Регистрация сервиса
app.registerService(name: string, service: any): void

// Получение сервиса
app.getService(name: string): any

// Загрузка модуля
app.loadModule(name: string): Promise<void>

// Состояние приложения
app.state: {
  user: User | null,
  currentModule: string,
  currentMonth: string,
  theme: 'light' | 'dark',
  language: 'ru' | 'en' | 'az',
  currency: 'AZN' | 'USD'
}
```

#### FirestoreService API

```javascript
// Расходы
getExpenses(userId, monthId): Promise<Expense[]>
addExpense(userId, expense): Promise<string>
updateExpense(userId, expenseId, updates): Promise<void>
deleteExpense(userId, expenseId): Promise<void>

// Долги
getDebts(userId): Promise<Debt[]>
addDebt(userId, debt): Promise<string>
updateDebt(userId, debtId, updates): Promise<void>
deleteDebt(userId, debtId): Promise<void>

// Задачи
getTasks(userId, type, date): Promise<Task[]>
addTask(userId, task): Promise<string>
updateTask(userId, taskId, updates): Promise<void>
deleteTask(userId, taskId): Promise<void>

// События календаря
getEvents(userId, monthId): Promise<Event[]>
addEvent(userId, event): Promise<string>
updateEvent(userId, eventId, updates): Promise<void>
deleteEvent(userId, eventId): Promise<void>
```

#### WeatherService API

```javascript
// Получить погоду по городу
getWeather(city: string): Promise<WeatherData>

// Получить погоду по координатам
getWeatherByCoords(lat: number, lon: number): Promise<WeatherData>

// Fallback данные
getMockWeather(city: string): WeatherData
```

---

## ⌨️ Горячие Клавиши

| Комбинация | Действие |
|------------|----------|
| `Ctrl + E` | Добавить расход |
| `Ctrl + T` | Добавить задачу |
| `Ctrl + D` | Добавить долг |
| `Ctrl + R` | Добавить шаблон |
| `Esc` | Закрыть модальное окно |

---

## 📱 Поддержка Устройств

### Адаптивные Breakpoints

| Размер | Диапазон | Устройства | Особенности |
|--------|----------|------------|-------------|
| **Mobile** | 320px - 640px | Смартфоны | Одноколоночный layout, увеличенные touch targets |
| **Tablet** | 641px - 1024px | Планшеты | Двухколоночный layout, адаптивная навигация |
| **Desktop** | 1025px+ | Ноутбуки, ПК | Полноценный layout, все панели видимы |

### Тестирование Совместимости

#### Смартфоны
- ✅ iPhone 6+ (iOS 11+)
- ✅ iPhone X/11/12/13/14 (iOS 14+)
- ✅ Android (Chrome 90+)
- ✅ Samsung Galaxy (Internet 14+)
- ✅ Huawei (Chrome 90+)

#### Планшеты
- ✅ iPad (iPadOS 14+)
- ✅ iPad Pro (iPadOS 14+)
- ✅ Android Tablets (Chrome 90+)
- ✅ Samsung Galaxy Tab

#### Компьютеры
- ✅ Windows 10/11 (Chrome 90+, Edge 90+, Firefox 88+)
- ✅ macOS (Safari 11+, Chrome 90+, Firefox 88+)
- ✅ Linux (Chrome 90+, Firefox 88+)

### Минимальные Требования

- **Браузер**: Поддержка ES6 модулей
- **Разрешение**: Минимум 320px ширина
- **JavaScript**: Включен
- **Cookies**: Включены для аутентификации
- **LocalStorage**: Доступен для настроек

---

## ⚙️ Конфигурация

### Firebase Setup

1. **Создайте Firebase проект**
   - Перейдите на [Firebase Console](https://console.firebase.google.com)
   - Нажмите "Add project"
   - Следуйте инструкциям

2. **Настройте Authentication**
   ```
   Authentication → Sign-in method
   - Enable Email/Password
   - Enable Google
   ```

3. **Создайте Firestore Database**
   ```
   Firestore Database → Create database
   - Start in production mode
   - Choose location
   ```

4. **Настройте Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

5. **Получите конфигурацию**
   ```
   Project Settings → General → Your apps
   - Add web app
   - Copy configuration
   ```

6. **Обновите js/config.js**
   ```javascript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### API Keys Setup

#### OpenWeatherMap (Погода)
1. Зарегистрируйтесь на [OpenWeatherMap](https://openweathermap.org/api)
2. Получите бесплатный API ключ
3. Обновите в `js/services/weather.service.js`:
   ```javascript
   this.apiKey = 'YOUR_OPENWEATHERMAP_KEY';
   ```

#### Currents API (Новости)
1. Зарегистрируйтесь на [Currents API](https://currentsapi.services)
2. Получите бесплатный API ключ
3. Обновите в `js/services/news.service.js`:
   ```javascript
   this.apiKey = 'YOUR_CURRENTS_API_KEY';
   ```

### Настройки Приложения

Все настройки хранятся в `localStorage`:

```javascript
// Тема
localStorage.setItem('theme', 'dark'); // 'light' | 'dark'

// Язык
localStorage.setItem('language', 'ru'); // 'ru' | 'en' | 'az'

// Валюта
localStorage.setItem('currency', 'AZN'); // 'AZN' | 'USD'

// Город для погоды
localStorage.setItem('weatherCity', 'Baku');
```

## 🔐 Безопасность

### Реализованные Меры

- 🔒 **Firebase Security Rules** - Доступ только к своим данным
- 🔐 **Изолированные данные** - Каждый пользователь видит только свои данные
- 🌐 **HTTPS по умолчанию** - Все запросы через защищенное соединение
- 🔑 **Безопасное хранение паролей** - Firebase Authentication
- 🛡️ **XSS защита** - Санитизация пользовательского ввода
- 🚫 **CSRF защита** - Firebase токены

### Рекомендации

1. **Не коммитьте секреты**
   - Добавьте `config.js` в `.gitignore` для production
   - Используйте environment variables

2. **Регулярно обновляйте зависимости**
   ```bash
   # Проверка устаревших пакетов
   npm outdated
   ```

3. **Мониторьте Firebase Usage**
   - Проверяйте квоты в Firebase Console
   - Настройте алерты для необычной активности

4. **Используйте сильные пароли**
   - Минимум 8 символов
   - Комбинация букв, цифр, символов

---

## 🌍 Языки

- 🇷🇺 Русский (Russian)
- 🇬🇧 English (Английский)
- 🇦🇿 Azərbaycan (Азербайджанский)

---

## 🐛 Troubleshooting

### Частые Проблемы

#### Модули не загружаются

**Проблема**: `Failed to load module script`

**Решение**:
```bash
# Используйте локальный сервер, не открывайте file://
python -m http.server 8000
# или
npx http-server -p 8000
```

#### Firebase ошибки

**Проблема**: `Firebase: Error (auth/configuration-not-found)`

**Решение**:
1. Проверьте `js/config.js`
2. Убедитесь что все поля заполнены
3. Проверьте что Authentication включен в Firebase Console

#### API погоды не работает

**Проблема**: `Weather API error: 401`

**Решение**:
1. Проверьте API ключ в `js/services/weather.service.js`
2. Убедитесь что ключ активирован (может занять до 2 часов)
3. Проверьте квоты на OpenWeatherMap

#### Стили не применяются

**Проблема**: Неправильное отображение

**Решение**:
1. Очистите кэш браузера (Ctrl+Shift+Delete)
2. Проверьте что `css/main.css` загружается
3. Откройте DevTools → Console для ошибок

#### GitHub Pages не работает

**Проблема**: 404 ошибка на GitHub Pages

**Решение**:
1. Убедитесь что `index.html` в корне репозитория
2. Проверьте Settings → Pages → Source
3. Подождите 5-10 минут после активации
4. Проверьте относительные пути в коде

### Отладка

#### Включить подробное логирование

```javascript
// В js/main.js добавьте
window.DEBUG = true;

// Теперь все сервисы будут логировать действия
```

#### Проверка состояния приложения

```javascript
// В консоли браузера
console.log(window.ordinaApp.state);
console.log(window.ordinaApp.modules);
console.log(window.ordinaApp.services);
```

#### Тестирование модулей

```javascript
// Загрузить конкретный модуль
await window.ordinaApp.loadModule('expenses');

// Проверить сервис
const weatherService = window.ordinaApp.getService('weather');
const weather = await weatherService.getWeather('Baku');
console.log(weather);
```

## ⚡ Производительность

### Оптимизации

- ✅ **Ленивая загрузка модулей** - Модули загружаются только при необходимости
- ✅ **Кэширование API** - Погода кэшируется на 10 минут
- ✅ **Debounce/Throttle** - Оптимизация событий прокрутки и ресайза
- ✅ **Минимальные перерисовки** - Обновляется только измененный DOM
- ✅ **CSS оптимизация** - Использование CSS переменных и Grid/Flexbox
- ✅ **Оптимизация изображений** - Сжатие и правильные форматы

### Метрики

Типичные показатели на Desktop (Chrome):

| Метрика | Значение |
|---------|----------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3.0s |
| Total Bundle Size | ~200KB |
| Lighthouse Score | 90+ |

### Советы по Оптимизации

1. **Используйте CDN для библиотек**
   ```html
   <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
   ```

2. **Включите кэширование**
   ```javascript
   // В WeatherService уже реализовано
   this.cacheTimeout = 10 * 60 * 1000; // 10 минут
   ```

3. **Оптимизируйте изображения**
   ```bash
   # Используйте WebP формат
   # Сжимайте PNG/JPG
   ```

4. **Мониторьте производительность**
   ```javascript
   // Chrome DevTools → Performance
   // Lighthouse → Generate report
   ```

## 🤝 Вклад в Проект

Мы приветствуем вклад в развитие проекта!

### Как Внести Вклад

1. **Форкните репозиторий**
   ```bash
   git clone https://github.com/ваш-username/ORDINA.git
   ```

2. **Создайте ветку для фичи**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Следуйте стилю кода**
   - Используйте JSDoc комментарии
   - Следуйте существующим паттернам
   - Пишите понятные commit сообщения

4. **Тестируйте изменения**
   - Проверьте на разных устройствах
   - Убедитесь что ничего не сломалось
   - Проверьте консоль на ошибки

5. **Закоммитьте изменения**
   ```bash
   git commit -m 'feat: Add amazing feature'
   ```

6. **Запушьте в ветку**
   ```bash
   git push origin feature/AmazingFeature
   ```

7. **Откройте Pull Request**
   - Опишите изменения
   - Приложите скриншоты если нужно
   - Ссылайтесь на issues

### Стиль Commit Сообщений

```
feat: Добавлена новая функция
fix: Исправлена ошибка
docs: Обновлена документация
style: Изменения стилей
refactor: Рефакторинг кода
perf: Улучшение производительности
test: Добавлены тесты
chore: Обновление зависимостей
```

### Области для Вклада

- 🐛 Исправление багов
- ✨ Новые функции
- 📝 Улучшение документации
- 🌍 Добавление переводов
- 🎨 Улучшение UI/UX
- ⚡ Оптимизация производительности
- ♿ Улучшение доступности

---

## 📝 Лицензия

Распространяется под лицензией MIT. См. `LICENSE` для дополнительной информации.

---

## 📊 Roadmap

### Версия 2.0 (В Разработке)

- [ ] PWA поддержка (оффлайн режим)
- [ ] Push уведомления
- [ ] Экспорт данных (CSV, PDF)
- [ ] Импорт данных из других приложений
- [ ] Темы оформления (кастомизация)
- [ ] Виджеты на главном экране
- [ ] Интеграция с банковскими API
- [ ] Машинное обучение для прогнозов

### Версия 2.1

- [ ] Мобильное приложение (React Native)
- [ ] Совместный доступ к бюджету
- [ ] Категории расходов с иконками
- [ ] Рекуррентные задачи
- [ ] Интеграция с календарями (Google, Apple)
- [ ] Голосовой ввод
- [ ] Сканирование чеков

## 📞 Контакты

**Автор:** Kenny Corleone

**GitHub:** [@Kenny-Corleone](https://github.com/Kenny-Corleone)

**Проект:** [ORDINA](https://github.com/Kenny-Corleone/ORDINA.github.io)

**Issues:** [Сообщить о проблеме](https://github.com/Kenny-Corleone/ORDINA.github.io/issues)

**Discussions:** [Обсуждения](https://github.com/Kenny-Corleone/ORDINA.github.io/discussions)

---

## 🙏 Благодарности

- [Firebase](https://firebase.google.com) - Backend и аутентификация
- [Chart.js](https://www.chartjs.org) - Графики и диаграммы
- [Font Awesome](https://fontawesome.com) - Иконки
- [OpenWeatherMap](https://openweathermap.org) - API погоды
- [Currents API](https://currentsapi.services) - API новостей
- Всем контрибьюторам проекта

---

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл [LICENSE](LICENSE) для подробностей.

```
MIT License

Copyright (c) 2024 Kenny Corleone

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**Создано с ❤️ для управления вашей жизнью**

⭐ Поставьте звезду, если проект вам понравился!

[⬆ Вернуться к началу](#-ordina---personal-finance--life-management-suite)

</div>
