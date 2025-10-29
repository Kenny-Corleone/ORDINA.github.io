# News Module

## Overview
Модуль новостей с фильтрацией по странам и категориям, пагинацией и интеграцией с NewsService.

## Structure
```
news/
├── news.module.js      - Module wrapper (loads controller)
├── news.controller.js  - Business logic and state management
└── news.template.js    - HTML templates
```

## Features
- ✅ Фильтрация по странам (US, RU, GB, DE, FR, IT, ES, TR)
- ✅ Фильтрация по категориям (general, business, technology, entertainment, sports, science, health)
- ✅ Пагинация (prev/next)
- ✅ Кэширование через NewsService
- ✅ Сохранение настроек в localStorage
- ✅ Состояния загрузки и ошибок
- ✅ Адаптивная верстка
- ✅ Lazy loading изображений
- ✅ HTML escaping для безопасности

## Integration

### 1. Register the module in your app initialization:
```javascript
import { NewsModule } from './modules/news/news.module.js';

const newsModule = new NewsModule(app);
app.registerModule('news', newsModule);
```

### 2. Register the route:
```javascript
router.register('news', 'news', {
  title: 'Новости',
  requiresAuth: true
});
```

### 3. Ensure NewsService is registered:
```javascript
import { NewsService } from './services/news.service.js';
import { NEWSAPI_KEY } from './config.js';

const newsService = new NewsService(NEWSAPI_KEY);
app.registerService('news', newsService);
```

### 4. HTML structure required:
```html
<div id="news-content" data-module-content="news" class="hidden">
  <!-- Content will be rendered here -->
</div>
```

### 5. Tab button:
```html
<button data-route="news" class="tab-button">
  📰 Новости
</button>
```

## Dependencies
- NewsService (js/services/news.service.js)
- NEWSAPI_KEY from config.js

## State Management
The controller maintains:
- `articles` - Current news articles
- `currentPage` - Current pagination page
- `currentCountry` - Selected country filter
- `currentCategory` - Selected category filter
- `isLoading` - Loading state
- `hasNextPage` - Whether more pages are available

## API
The module uses NewsData.io API through NewsService:
- Endpoint: `https://newsdata.io/api/1/news`
- Caching: 15 minutes
- Fallback: Mock data on API errors

## Styling
CSS classes used (need to be defined in css/components/news.css):
- `.news-container`
- `.news-controls`
- `.news-filters`
- `.filter-group`
- `.filter-label`
- `.filter-select`
- `.btn-refresh`
- `.news-grid`
- `.news-card`
- `.news-image-wrapper`
- `.news-image`
- `.news-content`
- `.news-title`
- `.news-description`
- `.news-meta`
- `.news-source`
- `.news-date`
- `.news-link`
- `.news-pagination`
- `.pagination-btn`
- `.pagination-info`
- `.news-empty`
- `.news-loading`
- `.loading-spinner`
- `.loading-text`
- `.news-error`

## Migration Notes
All functionality from the old `js/modules/news.js` has been migrated and improved:
- Better error handling
- Persistent settings
- Refresh functionality
- Better loading states
- Security improvements (HTML escaping)
- Performance improvements (lazy loading)
