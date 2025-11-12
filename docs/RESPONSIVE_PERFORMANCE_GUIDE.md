# ORDINA Responsive & Performance System
## Staff Frontend - Production Ready Implementation Guide

---

## 📋 Содержание

1. [Система брейкпоинтов](#система-брейкпоинтов)
2. [Интеграция в проект](#интеграция-в-проект)
3. [Конкретные правки классов](#конкретные-правки-классов)
4. [Патчи HTML/CSS/JS](#патчи-htmlcssjs)
5. [Чек-лист Lighthouse/AXE](#чек-лист-lighthouseaxe)
6. [Целевые метрики](#целевые-метрики)

---

## 🎯 Система брейкпоинтов

### Детальный план брейкпоинтов

| Брейкпоинт | Размер | Устройства | Контейнер Max-Width |
|------------|--------|------------|---------------------|
| `xs` | 320px | Узкие смартфоны (iPhone SE, Galaxy Fold) | 100% |
| `sm` | 480px | Малые смартфоны | 540px |
| `md` | 640px | Средние смартфоны | 720px |
| `lg` | 768px | Планшеты (портрет) | 960px |
| `xl` | 1024px | Планшеты (ландшафт) / Малые ноутбуки | 1140px |
| `2xl` | 1280px | Ноутбуки | 1320px |
| `3xl` | 1440px | Десктопы | 1600px |
| `4xl` | 1920px | Большие десктопы / Full HD | 1800px |
| `5xl` | 2560px | Ultra-wide / 4K | 2000px |

### Container Queries

```css
/* Использование container queries для компонентов */
.component-wrapper {
    container-type: inline-size;
}

@container (min-width: 320px) {
    .component { /* стили для маленьких контейнеров */ }
}

@container (min-width: 768px) {
    .component { /* стили для больших контейнеров */ }
}
```

---

## 🔧 Интеграция в проект

### Шаг 1: Подключение CSS файла

Добавьте в `<head>` файла `index.html` **ПЕРЕД** существующими стилями:

```html
<!-- Responsive System CSS -->
<link rel="stylesheet" href="responsive-system.css">
```

### Шаг 2: Подключение JavaScript модуля

Добавьте перед закрывающим тегом `</body>`:

```html
<!-- Performance & Accessibility Module -->
<script src="performance-module.js"></script>
```

### Шаг 3: Обновление viewport meta tag

Убедитесь, что в `<head>` есть:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover">
```

---

## 🎨 Конкретные правки классов

### 1. Замена существующих медиа-запросов

**Найти и заменить:**

```css
/* СТАРОЕ */
@media (max-width: 480px) { ... }

/* НОВОЕ - использовать переменные */
@media (max-width: 480px) {
    /* Использовать CSS переменные из responsive-system.css */
    font-size: var(--font-size-fluid-base);
    padding: var(--spacing-responsive);
}
```

### 2. Обновление Grid контейнеров

**Было:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

**Стало:**
```html
<div class="grid-responsive">
<!-- Автоматически адаптируется под все экраны -->
```

### 3. Обновление Flex контейнеров

**Было:**
```html
<div class="flex gap-4">
```

**Стало:**
```html
<div class="flex-responsive">
<!-- Автоматически адаптируется под все экраны -->
```

### 4. Обновление типографики

**Было:**
```css
h1 { font-size: 2rem; }
@media (min-width: 768px) { h1 { font-size: 3rem; } }
```

**Стало:**
```css
h1 { font-size: var(--font-size-fluid-4xl); }
/* Автоматически адаптируется через clamp() */
```

### 5. Обновление таблиц

**Было:**
```html
<table class="table">
```

**Стало:**
```html
<div class="table-wrapper">
    <table class="responsive-table">
        <thead>
            <tr>
                <th>Column 1</th>
                <th>Column 2</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td data-label="Column 1">Value 1</td>
                <td data-label="Column 2">Value 2</td>
            </tr>
        </tbody>
    </table>
</div>
```

### 6. Обновление кнопок для hit-targets

**Было:**
```html
<button class="premium-btn">Click</button>
```

**Стало:**
```html
<button class="premium-btn" aria-label="Click button">
    Click
</button>
<!-- Минимальный размер 44x44px уже применен через CSS -->
```

### 7. Lazy Loading изображений

**Было:**
```html
<img src="image.jpg" alt="Description">
```

**Стало:**
```html
<img data-src="image.jpg" src="placeholder.jpg" alt="Description" class="lazy" loading="lazy">
```

---

## 🔨 Патчи HTML/CSS/JS

### Патч 1: Добавление Skip Link

Добавьте сразу после открывающего тега `<body>`:

```html
<a href="#main-content" class="skip-link">Перейти к основному содержимому</a>
```

И оберните основной контент:

```html
<main id="main-content" role="main">
    <!-- Ваш контент -->
</main>
```

### Патч 2: Обновление контейнера #app

**Найти в CSS:**
```css
#app {
    padding: 1rem;
}
```

**Заменить на:**
```css
#app {
    padding: clamp(0.5rem, 2vw, 1.5rem);
    max-width: 100vw;
    overflow-x: hidden;
    width: 100%;
}
```

### Патч 3: Safe Area для notch устройств

**Добавить в CSS:**
```css
body {
    padding-top: env(safe-area-inset-top, 0px);
    padding-right: env(safe-area-inset-right, 0px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    padding-left: env(safe-area-inset-left, 0px);
}
```

### Патч 4: Предотвращение горизонтального скролла

**Добавить в начало CSS:**
```css
html, body {
    overflow-x: hidden;
    max-width: 100vw;
    position: relative;
}

* {
    max-width: 100%;
    box-sizing: border-box;
}
```

### Патч 5: ARIA атрибуты для интерактивных элементов

**Для кнопок:**
```html
<button aria-label="Описание действия" aria-pressed="false">
    Текст кнопки
</button>
```

**Для модальных окон:**
```html
<dialog role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 id="modal-title">Заголовок модального окна</h2>
    <!-- Контент -->
</dialog>
```

**Для навигации:**
```html
<nav role="navigation" aria-label="Основная навигация">
    <!-- Навигационные элементы -->
</nav>
```

### Патч 6: Focus Visible стили

**Добавить в CSS:**
```css
*:focus-visible {
    outline: 3px solid var(--color-primary, #6366f1);
    outline-offset: 2px;
    border-radius: 4px;
}

/* Убрать outline для мыши */
*:focus:not(:focus-visible) {
    outline: none;
}
```

### Патч 7: Content Visibility для производительности

**Добавить класс к секциям:**
```html
<section class="content-visibility-auto">
    <!-- Контент, который может быть вне viewport -->
</section>
```

### Патч 8: Resource Hints в head

**Добавить перед другими ссылками:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
```

---

## ✅ Чек-лист Lighthouse/AXE

### Lighthouse Performance Checklist

#### Core Web Vitals

- [ ] **LCP (Largest Contentful Paint) < 2.5s**
  - Оптимизировать изображения (WebP, AVIF)
  - Использовать preload для критических ресурсов
  - Минимизировать render-blocking ресурсы
  - Использовать CDN для статических ресурсов

- [ ] **CLS (Cumulative Layout Shift) < 0.1**
  - Указать размеры для изображений (width/height или aspect-ratio)
  - Резервировать место для рекламы/виджетов
  - Избегать вставки контента поверх существующего

- [ ] **FID (First Input Delay) / TBT (Total Blocking Time) < 200ms**
  - Минимизировать JavaScript
  - Использовать code splitting
  - Оптимизировать third-party скрипты
  - Использовать Web Workers для тяжелых вычислений

#### Performance Score Targets

- [ ] **Performance Score: 90+**
- [ ] **First Contentful Paint (FCP) < 1.8s**
- [ ] **Speed Index < 3.4s**
- [ ] **Time to Interactive (TTI) < 3.8s**

#### Optimization Checklist

- [ ] Изображения оптимизированы (WebP/AVIF, responsive sizes)
- [ ] Критический CSS инлайнится
- [ ] Неиспользуемый CSS удален
- [ ] JavaScript минифицирован и сжат
- [ ] Используется HTTP/2 или HTTP/3
- [ ] Включено кеширование (Cache-Control headers)
- [ ] Используется CDN для статических ресурсов
- [ ] Включен Gzip/Brotli compression
- [ ] Предзагрузка критических ресурсов (preload)
- [ ] Lazy loading для изображений и iframes

### AXE Accessibility Checklist

#### WCAG 2.1 Level AA Compliance

- [ ] **Все изображения имеют alt атрибуты**
  ```html
  <img src="..." alt="Описание изображения">
  ```

- [ ] **Все интерактивные элементы доступны с клавиатуры**
  - Tab order логичен
  - Все элементы фокусируемы
  - Нет keyboard traps

- [ ] **Цветовой контраст ≥ 4.5:1 для текста**
  - Проверить через axe DevTools
  - Использовать достаточный контраст

- [ ] **Hit targets ≥ 44x44px**
  - Все кнопки и ссылки соответствуют
  - Проверено на мобильных устройствах

- [ ] **ARIA атрибуты корректны**
  - `role` атрибуты используются правильно
  - `aria-label` для иконок без текста
  - `aria-expanded` для раскрывающихся элементов
  - `aria-hidden` для декоративных элементов

- [ ] **Формы доступны**
  - Все поля имеют `<label>`
  - Ошибки валидации объявлены через `aria-describedby`
  - Обязательные поля помечены `aria-required`

- [ ] **Навигация доступна**
  - Skip links присутствуют
  - Логическая структура заголовков (h1-h6)
  - Landmarks используются (`<nav>`, `<main>`, `<aside>`)

- [ ] **Фокус видим**
  - Все фокусируемые элементы имеют видимый focus ring
  - Focus order логичен

- [ ] **Анимации уважают prefers-reduced-motion**
  - Проверено через `@media (prefers-reduced-motion: reduce)`

### Mobile Usability Checklist

- [ ] Viewport настроен корректно
- [ ] Контент не требует горизонтального скролла
- [ ] Текст читаем без зума (≥16px базовый размер)
- [ ] Touch targets ≥44x44px
- [ ] Нет плагинов (Flash и т.д.)
- [ ] Safe area insets учтены для notch устройств

---

## 🎯 Целевые метрики

### Performance Targets

| Метрика | Цель | Критично |
|---------|------|----------|
| LCP | < 2.5s | < 4.0s |
| CLS | < 0.1 | < 0.25 |
| TBT | < 200ms | < 600ms |
| FCP | < 1.8s | < 3.0s |
| TTI | < 3.8s | < 7.3s |
| Speed Index | < 3.4s | < 5.8s |

### Accessibility Targets

- [ ] **WCAG 2.1 Level AA**: 100% соответствие
- [ ] **AXE Score**: 0 ошибок
- [ ] **Keyboard Navigation**: 100% функциональность
- [ ] **Screen Reader**: Полная совместимость

### Responsive Targets

- [ ] **320px - 480px**: Полная функциональность
- [ ] **481px - 768px**: Оптимизированный layout
- [ ] **769px - 1024px**: Tablet-optimized
- [ ] **1025px - 1920px**: Desktop experience
- [ ] **1921px+**: Ultra-wide optimization

---

## 📝 Инструкции "Вставь и работай"

### Быстрый старт (5 минут)

1. **Скопируйте файлы** `responsive-system.css` и `performance-module.js` в корень проекта

2. **Добавьте в `<head>` index.html:**
```html
<link rel="stylesheet" href="responsive-system.css">
```

3. **Добавьте перед `</body>`:**
```html
<script src="performance-module.js"></script>
```

4. **Обновите основной контейнер:**
```html
<div id="app" class="container-responsive">
```

5. **Замените таблицы:**
```html
<div class="table-wrapper">
    <table class="responsive-table">
        <!-- с data-label атрибутами -->
    </table>
</div>
```

### Постепенная миграция (рекомендуется)

1. Начните с подключения CSS файла
2. Постепенно заменяйте классы на новые
3. Обновляйте таблицы по одной секции
4. Тестируйте на каждом этапе
5. Подключите JavaScript модуль в конце

---

## 🔍 Тестирование

### Ручное тестирование

1. **Размеры экрана:**
   - iPhone SE (320px)
   - iPhone 12/13 (390px)
   - iPad (768px)
   - Desktop (1920px)
   - Ultra-wide (2560px)

2. **Ориентация:**
   - Portrait
   - Landscape

3. **Устройства:**
   - Touch devices
   - Mouse/keyboard
   - Screen readers

### Автоматизированное тестирование

```bash
# Lighthouse CLI
npx lighthouse https://your-site.com --view

# AXE CLI
npx @axe-core/cli https://your-site.com

# WebPageTest
# Используйте https://www.webpagetest.org/
```

---

## 📚 Дополнительные ресурсы

- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev: Core Web Vitals](https://web.dev/vitals/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)

---

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте консоль браузера на ошибки
2. Убедитесь, что файлы подключены корректно
3. Проверьте порядок подключения CSS (responsive-system.css должен быть первым)
4. Убедитесь, что viewport meta tag настроен правильно

---

**Версия:** 1.0.0  
**Дата:** 2024  
**Автор:** Staff Frontend Team

