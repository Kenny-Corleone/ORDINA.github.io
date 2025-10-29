# Design Document

## Overview

Этот документ описывает архитектурное решение для полной модульной реорганизации приложения ORDINA. Дизайн фокусируется на создании чистой модульной структуры, исправлении всех ошибок, улучшении адаптивности и обеспечении безупречной работы на GitHub Pages.

### Ключевые принципы дизайна

1. **Модульность**: Каждый компонент - отдельный файл с четкой ответственностью
2. **Совместимость**: Полная поддержка GitHub Pages без дополнительной настройки
3. **Адаптивность**: Mobile-first подход с поддержкой всех размеров экранов
4. **Производительность**: Ленивая загрузка модулей и оптимизация ресурсов
5. **Сохранение**: Нулевые изменения в функционале и визуальном дизайне

## Architecture

### Текущая структура (проблемы)

```
ordina/
├── index.html (монолитный, 1000+ строк)
├── css/
│   ├── main.css
│   ├── header.css
│   ├── responsive.css
│   └── components/
│       ├── header.css
│       └── weather.css
├── js/
│   ├── app.js (точка входа)
│   ├── config.js
│   ├── translations.js
│   ├── utils.js
│   └── modules/
│       ├── auth.js
│       ├── dashboard.js
│       ├── expenses.js
│       ├── debts.js
│       ├── tasks.js
│       ├── news.js
│       └── weather.js
└── sort/ (устаревшие файлы)
```

**Проблемы:**
- Дублирование CSS (header.css в двух местах)
- Монолитный index.html
- Невалидный API ключ погоды
- Неполная адаптивность для малых экранов
- Отсутствие некоторых CSS компонентов для модулей

### Новая модульная структура

```
ordina/
├── index.html (минимальный, только структура)
├── assets/
│   ├── images/
│   │   └── logo.png
│   └── icons/
│       └── favicon.svg
├── css/
│   ├── core/
│   │   ├── variables.css (CSS переменные)
│   │   ├── reset.css (нормализация)
│   │   ├── typography.css (шрифты)
│   │   └── animations.css (анимации)
│   ├── layout/
│   │   ├── header.css
│   │   ├── navigation.css
│   │   ├── sidebar.css
│   │   └── footer.css
│   ├── components/
│   │   ├── buttons.css
│   │   ├── cards.css
│   │   ├── forms.css
│   │   ├── modals.css
│   │   ├── weather.css
│   │   ├── news.css
│   │   ├── tasks.css
│   │   ├── expenses.css
│   │   ├── debts.css
│   │   ├── calendar.css
│   │   └── dashboard.css
│   ├── themes/
│   │   ├── light.css
│   │   └── dark.css
│   ├── responsive/
│   │   ├── mobile.css (320px - 640px)
│   │   ├── tablet.css (641px - 1024px)
│   │   └── desktop.css (1025px+)
│   └── main.css (импорты всех стилей)
├── js/
│   ├── core/
│   │   ├── app.js (главная точка входа)
│   │   ├── config.js (конфигурация)
│   │   ├── firebase.js (Firebase инициализация)
│   │   └── router.js (управление вкладками)
│   ├── utils/
│   │   ├── helpers.js (вспомогательные функции)
│   │   ├── formatters.js (форматирование данных)
│   │   ├── validators.js (валидация)
│   │   └── storage.js (localStorage обертка)
│   ├── services/
│   │   ├── auth.service.js (аутентификация)
│   │   ├── weather.service.js (API погоды)
│   │   ├── news.service.js (API новостей)
│   │   └── firestore.service.js (Firestore операции)
│   ├── components/
│   │   ├── header/
│   │   │   ├── header.component.js
│   │   │   └── header.template.js
│   │   ├── weather/
│   │   │   ├── weather.component.js
│   │   │   └── weather.template.js
│   │   ├── news/
│   │   │   ├── news.component.js
│   │   │   └── news.template.js
│   │   └── toast/
│   │       ├── toast.component.js
│   │       └── toast.template.js
│   ├── modules/
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
│   ├── i18n/
│   │   ├── translations.js
│   │   ├── ru.js
│   │   ├── en.js
│   │   └── az.js
│   └── main.js (инициализация приложения)
└── README.md
```

## Components and Interfaces

### 1. Core System

#### App Core (`js/core/app.js`)

```javascript
/**
 * Главный класс приложения
 * Управляет жизненным циклом и координирует модули
 */
class OrdinaApp {
  constructor() {
    this.state = {
      user: null,
      currentModule: 'dashboard',
      currentMonth: null,
      theme: 'light',
      language: 'ru',
      currency: 'AZN'
    };
    this.modules = new Map();
    this.services = new Map();
  }

  async init() {
    // 1. Инициализация Firebase
    // 2. Загрузка конфигурации
    // 3. Регистрация сервисов
    // 4. Регистрация модулей
    // 5. Инициализация роутера
    // 6. Проверка аутентификации
    // 7. Загрузка начального модуля
  }

  registerModule(name, module) {
    this.modules.set(name, module);
  }

  registerService(name, service) {
    this.services.set(name, service);
  }

  getService(name) {
    return this.services.get(name);
  }

  async loadModule(name) {
    const module = this.modules.get(name);
    if (module) {
      await module.load();
      this.state.currentModule = name;
    }
  }
}
```

#### Router (`js/core/router.js`)

```javascript
/**
 * Управление навигацией между модулями
 */
class Router {
  constructor(app) {
    this.app = app;
    this.routes = new Map();
    this.currentRoute = null;
  }

  register(path, module) {
    this.routes.set(path, module);
  }

  navigate(path) {
    const module = this.routes.get(path);
    if (module) {
      this.app.loadModule(module);
      this.updateUI(path);
      this.currentRoute = path;
    }
  }

  updateUI(path) {
    // Обновление активной вкладки
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.toggle('tab-active', btn.dataset.route === path);
    });
  }
}
```

### 2. Module System

#### Base Module Interface

```javascript
/**
 * Базовый интерфейс для всех модулей
 */
class BaseModule {
  constructor(app) {
    this.app = app;
    this.container = null;
    this.state = {};
    this.isLoaded = false;
  }

  async load() {
    if (this.isLoaded) return;
    
    // 1. Получить контейнер
    this.container = document.getElementById(this.containerId);
    
    // 2. Загрузить данные
    await this.fetchData();
    
    // 3. Отрендерить UI
    this.render();
    
    // 4. Установить обработчики
    this.setupEventListeners();
    
    this.isLoaded = true;
  }

  async fetchData() {
    // Переопределяется в дочерних классах
  }

  render() {
    // Переопределяется в дочерних классах
  }

  setupEventListeners() {
    // Переопределяется в дочерних классах
  }

  unload() {
    // Очистка ресурсов
    this.isLoaded = false;
  }
}
```

#### Example: Dashboard Module

```javascript
/**
 * Модуль дашборда
 */
class DashboardModule extends BaseModule {
  constructor(app) {
    super(app);
    this.containerId = 'dashboard-content';
  }

  async fetchData() {
    const firestoreService = this.app.getService('firestore');
    const userId = this.app.state.user.uid;
    
    this.state.expenses = await firestoreService.getExpenses(userId);
    this.state.debts = await firestoreService.getDebts(userId);
    this.state.tasks = await firestoreService.getTasks(userId);
  }

  render() {
    const template = DashboardTemplate.render(this.state);
    this.container.innerHTML = template;
  }

  setupEventListeners() {
    // Обработчики событий дашборда
  }
}
```

### 3. Service Layer

#### Weather Service

```javascript
/**
 * Сервис для работы с API погоды
 */
class WeatherService {
  constructor() {
    // Используем рабочий API ключ OpenWeatherMap
    this.apiKey = 'YOUR_VALID_API_KEY';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 минут
  }

  async getWeather(city) {
    // Проверка кэша
    const cached = this.cache.get(city);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=ru`
      );
      
      if (!response.ok) {
        throw new Error('City not found');
      }

      const data = await response.json();
      
      // Кэширование
      this.cache.set(city, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Weather API error:', error);
      return this.getMockWeather(city);
    }
  }

  async getWeatherByCoords(lat, lon) {
    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=ru`
      );
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Weather API error:', error);
      return null;
    }
  }

  getMockWeather(city) {
    // Fallback данные если API недоступен
    return {
      name: city,
      main: {
        temp: 20,
        feels_like: 19,
        humidity: 60
      },
      weather: [{
        description: 'ясно',
        icon: '01d'
      }],
      wind: {
        speed: 3
      }
    };
  }
}
```

#### Firestore Service

```javascript
/**
 * Сервис для работы с Firestore
 */
class FirestoreService {
  constructor(db) {
    this.db = db;
  }

  async getExpenses(userId, monthId) {
    const q = query(
      collection(this.db, `users/${userId}/expenses`),
      where('monthId', '==', monthId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addExpense(userId, expense) {
    const docRef = await addDoc(
      collection(this.db, `users/${userId}/expenses`),
      expense
    );
    return docRef.id;
  }

  async updateExpense(userId, expenseId, updates) {
    await updateDoc(
      doc(this.db, `users/${userId}/expenses`, expenseId),
      updates
    );
  }

  async deleteExpense(userId, expenseId) {
    await deleteDoc(
      doc(this.db, `users/${userId}/expenses`, expenseId)
    );
  }

  // Аналогичные методы для debts, tasks, calendar
}
```

### 4. Component System

#### Weather Component

```javascript
/**
 * Компонент виджета погоды
 */
class WeatherComponent {
  constructor(weatherService) {
    this.weatherService = weatherService;
    this.container = null;
    this.currentCity = localStorage.getItem('weatherCity') || 'Baku';
  }

  mount(containerId) {
    this.container = document.getElementById(containerId);
    this.render();
    this.setupEventListeners();
    this.loadWeather();
  }

  render() {
    this.container.innerHTML = WeatherTemplate.skeleton();
  }

  async loadWeather() {
    try {
      const data = await this.weatherService.getWeather(this.currentCity);
      this.container.innerHTML = WeatherTemplate.render(data);
    } catch (error) {
      this.container.innerHTML = WeatherTemplate.error();
    }
  }

  setupEventListeners() {
    // Обработчики для смены города, геолокации, обновления
  }

  unmount() {
    this.container = null;
  }
}
```

## Data Models

### User State

```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  preferences: {
    theme: 'light' | 'dark',
    language: 'ru' | 'en' | 'az',
    currency: 'AZN' | 'USD',
    weatherCity: string
  }
}
```

### Expense Model

```javascript
{
  id: string,
  userId: string,
  monthId: string, // 'YYYY-MM'
  date: string, // 'YYYY-MM-DD'
  category: string,
  amount: number,
  comment: string,
  createdAt: Timestamp
}
```

### Debt Model

```javascript
{
  id: string,
  userId: string,
  name: string,
  totalAmount: number,
  paidAmount: number,
  lastPaymentDate: string,
  comment: string,
  createdAt: Timestamp
}
```

### Task Model

```javascript
{
  id: string,
  userId: string,
  type: 'daily' | 'monthly' | 'yearly',
  name: string,
  notes: string,
  deadline: string,
  done: boolean,
  monthId: string, // для monthly tasks
  date: string, // для daily tasks
  createdAt: Timestamp
}
```

## Error Handling

### Error Handling Strategy

1. **API Errors**: Graceful degradation с fallback данными
2. **Network Errors**: Retry механизм с экспоненциальной задержкой
3. **Firebase Errors**: Понятные сообщения пользователю
4. **Validation Errors**: Inline валидация с подсказками

```javascript
class ErrorHandler {
  static handle(error, context) {
    console.error(`Error in ${context}:`, error);
    
    // Логирование в сервис (опционально)
    // this.logToService(error, context);
    
    // Показ уведомления пользователю
    const message = this.getUserMessage(error);
    ToastComponent.show(message, 'error');
  }

  static getUserMessage(error) {
    const messages = {
      'auth/invalid-email': 'Неверный формат email',
      'auth/user-not-found': 'Пользователь не найден',
      'permission-denied': 'Недостаточно прав',
      'network-error': 'Проблемы с сетью'
    };
    
    return messages[error.code] || 'Произошла ошибка';
  }
}
```

## Testing Strategy

### Unit Testing

- Тестирование утилит и форматтеров
- Тестирование сервисов с моками
- Тестирование валидаторов

### Integration Testing

- Тестирование модулей с реальными сервисами
- Тестирование роутинга
- Тестирование Firebase интеграции

### E2E Testing

- Тестирование пользовательских сценариев
- Тестирование на разных устройствах
- Тестирование адаптивности

### Manual Testing Checklist

- [ ] Работа на iOS Safari
- [ ] Работа на Android Chrome
- [ ] Работа на Desktop Chrome/Firefox/Edge
- [ ] Адаптивность 320px, 480px, 768px, 1024px, 1440px
- [ ] Темная/светлая тема
- [ ] Все языки (ru, en, az)
- [ ] Все валюты (AZN, USD)
- [ ] GitHub Pages deployment

## Responsive Design Strategy

### Breakpoints

```css
/* Mobile First Approach */

/* Extra Small: 320px - 480px */
@media (max-width: 480px) {
  /* Одноколоночный layout */
  /* Увеличенные touch targets (44px) */
  /* Упрощенная навигация */
}

/* Small: 481px - 640px */
@media (min-width: 481px) and (max-width: 640px) {
  /* Двухколоночный layout для карточек */
}

/* Medium: 641px - 768px */
@media (min-width: 641px) and (max-width: 768px) {
  /* Планшетный layout */
  /* Sidebar опционально */
}

/* Large: 769px - 1024px */
@media (min-width: 769px) and (max-width: 1024px) {
  /* Полноценный desktop layout */
  /* Sidebar всегда видим */
}

/* Extra Large: 1025px+ */
@media (min-width: 1025px) {
  /* Максимальное использование пространства */
  /* Дополнительные панели */
}
```

### Touch Optimization

```css
/* Минимальный размер для touch targets */
.touchable {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* Предотвращение зума на iOS */
input, select, textarea {
  font-size: 16px; /* Минимум 16px */
}

/* Улучшенная прокрутка на мобильных */
.scrollable {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
```

## Performance Optimization

### Lazy Loading

```javascript
// Ленивая загрузка модулей
const loadModule = async (moduleName) => {
  const module = await import(`./modules/${moduleName}/${moduleName}.module.js`);
  return module.default;
};
```

### Code Splitting

- Разделение по модулям
- Загрузка только активного модуля
- Предзагрузка следующего вероятного модуля

### Asset Optimization

- Использование CDN для библиотек
- Минификация CSS/JS (опционально)
- Оптимизация изображений
- Кэширование API запросов

## GitHub Pages Compatibility

### Configuration

```javascript
// Определение базового пути
const BASE_PATH = window.location.hostname === 'localhost' 
  ? '' 
  : '/repository-name';

// Использование относительных путей
const getAssetPath = (path) => `${BASE_PATH}${path}`;
```

### Module Loading

```html
<!-- Использование type="module" -->
<script type="module" src="./js/main.js"></script>
```

### CORS Considerations

- Все внешние API через HTTPS
- Использование CDN с CORS поддержкой
- Fallback для недоступных API

## Migration Strategy

### Phase 1: Preparation
- Создание новой структуры папок
- Настройка импортов/экспортов
- Создание базовых классов

### Phase 2: Core Migration
- Миграция app.js в модульную систему
- Создание сервисов
- Настройка роутера

### Phase 3: Module Migration
- Миграция каждого модуля по отдельности
- Тестирование после каждого модуля
- Сохранение функционала

### Phase 4: CSS Reorganization
- Разделение CSS на компоненты
- Удаление дублирования
- Оптимизация медиа-запросов

### Phase 5: Testing & Deployment
- Полное тестирование
- Исправление багов
- Deployment на GitHub Pages

## Design Decisions

### Why ES6 Modules?
- Нативная поддержка в браузерах
- Работает на GitHub Pages без сборки
- Четкие зависимости
- Tree-shaking возможен

### Why Class-Based Components?
- Четкая структура
- Легко тестировать
- Переиспользуемость
- Понятный жизненный цикл

### Why Service Layer?
- Разделение логики и UI
- Легко мокировать для тестов
- Переиспользование между модулями
- Централизованная обработка ошибок

### Why Template Functions?
- Простота без фреймворка
- Полный контроль над HTML
- Легко понять и модифицировать
- Нет дополнительных зависимостей
