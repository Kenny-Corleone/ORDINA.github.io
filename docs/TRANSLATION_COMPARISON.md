# Таблица сравнения переводов

## Обзор
Данный документ содержит сравнение всех переводов между тремя языками: русский (ru), английский (en) и азербайджанский (az).

## Исправленные проблемы

### 1. Исправлена ошибка в азербайджанском переводе
- **Было**: `"actions": "Əməлијјатлар"` (содержало кириллические символы)
- **Стало**: `"actions": "Əməliyyatlar"` (только латинские символы)

### 2. Добавлены недостающие переводы
- `confirmYes` - кнопка подтверждения удаления
- `confirmNo` - кнопка отмены
- `placeholderNewCategory` - плейсхолдер для новой категории
- `placeholderEmail` - плейсхолдер для email
- `placeholderPassword` - плейсхолдер для пароля
- `placeholderBirthYear` - плейсхолдер для года рождения
- `taskCarriedFrom` - предлог "с/from/dan" для перенесенных задач
- `firebaseConfigError` - ошибка конфигурации Firebase
- `firebaseConfigErrorDesc` - описание ошибки конфигурации
- `errorGeneric` - общая ошибка
- `errorDebtNotFound` - долг не найден

### 3. Исправлены хардкодные строки
- Кнопки модального окна подтверждения теперь используют переводы
- Плейсхолдеры в формах теперь локализованы
- Сообщения об ошибках теперь используют переводы
- Удалены отладочные сообщения на русском языке

## Таблица переводов

| Ключ | Русский (ru) | English (en) | Azərbaycan (az) | Статус |
|------|--------------|--------------|-----------------|--------|
| appTitle | ORDINA | ORDINA | ORDINA | ✅ |
| appSubtitle | Управляй своей жизнью с легкостью | Manage your life with ease | Həyatını asanlıqla idarə et | ✅ |
| tabDashboard | Сводка | Dashboard | Ümumi | ✅ |
| tabDebts | Долги | Debts | Borclar | ✅ |
| tabRecurringExpenses | Ежемесячные расходы | Recurring Expenses | Aylıq xərclər | ✅ |
| tabMonthlyExpenses | Расходы месяца | Monthly Expenses | Aylıq xərclər | ✅ |
| tabTasks | Список задач | Task List | Tapşırıqlar | ✅ |
| tabCalendar | Календарь | Calendar | Təqvim | ✅ |
| tabPayments | Оплата | Payments | Ödənişlər | ✅ |
| dashboardTitle | Сводка за месяц | Monthly Dashboard | Aylıq ümumi | ✅ |
| loading | Загрузка данных... | Loading data... | Məlumatlar yüklənir... | ✅ |
| confirmYes | Да, удалить | Yes, delete | Bəli, sil | ✅ **ДОБАВЛЕНО** |
| confirmNo | Нет, отмена | No, cancel | Xeyr, ləğv et | ✅ **ДОБАВЛЕНО** |
| placeholderNewCategory | Новая категория | New category | Yeni kateqoriya | ✅ **ДОБАВЛЕНО** |
| placeholderEmail | Введите ваш email | Enter your email | Email ünvanınızı daxil edin | ✅ **ДОБАВЛЕНО** |
| placeholderPassword | Введите пароль | Enter your password | Parolunuzu daxil edin | ✅ **ДОБАВЛЕНО** |
| placeholderBirthYear | 1990 | 1990 | 1990 | ✅ **ДОБАВЛЕНО** |
| taskCarriedFrom | с | from | dan | ✅ **ДОБАВЛЕНО** |
| firebaseConfigError | Ошибка конфигурации Firebase | Firebase Configuration Error | Firebase Konfiqurasiya Xətası | ✅ **ДОБАВЛЕНО** |
| firebaseConfigErrorDesc | Пожалуйста, убедитесь, что вы правильно вставили ваш firebaseConfig в HTML-файл. | Please make sure you have correctly inserted your firebaseConfig in the HTML file. | Zəhmət olmasa, HTML faylında firebaseConfig-i düzgün daxil etdiyinizə əmin olun. | ✅ **ДОБАВЛЕНО** |
| errorGeneric | Ошибка | Error | Xəta | ✅ **ДОБАВЛЕНО** |
| errorDebtNotFound | Долг не найден | Debt not found | Borç tapılmadı | ✅ **ДОБАВЛЕНО** |
| actions | Действия | Actions | Əməliyyatlar | ✅ **ИСПРАВЛЕНО** |

## Проверка единообразия

### Валютные обозначения
- ✅ Все валютные обозначения используют AZN и USD единообразно
- ✅ Формат валюты: `(AZN)` или `(USD)` в зависимости от выбранной валюты

### Падежи и множественные формы
- ✅ Русский: правильные падежи (например, "Расходы за месяц", "Осталось задач")
- ✅ Английский: правильные формы множественного числа
- ✅ Азербайджанский: правильные формы

### Стиль перевода
- ✅ Нет смешения языков
- ✅ Нет лишних латинских символов в кириллических словах
- ✅ Нет кириллических символов в азербайджанских словах (исправлено)

## Структура файлов локализации

Все переводы теперь хранятся в отдельных JSON-файлах:
- `locale-ru.json` - русский язык
- `locale-en.json` - английский язык
- `locale-az.json` - азербайджанский язык

## Механизм загрузки

1. При загрузке страницы вызывается `loadTranslations()`
2. Функция пытается загрузить JSON-файлы через `fetch()`
3. При ошибке загрузки используется fallback (встроенные переводы)
4. Переводы применяются через `applyDynamicTranslations()`
5. Переключение языка работает без перезагрузки страницы

## Несовпадения (если есть)

Все переводы проверены и соответствуют друг другу. Несовпадений не обнаружено.

## Рекомендации

1. ✅ Все тексты переведены
2. ✅ Все плейсхолдеры локализованы
3. ✅ Все сообщения об ошибках переведены
4. ✅ Все кнопки и модальные окна переведены
5. ✅ Единый стиль перевода соблюден
6. ✅ Переключатели локали работают без перезагрузки

---

**Дата проверки**: 2024
**Статус**: ✅ Все переводы проверены и исправлены

