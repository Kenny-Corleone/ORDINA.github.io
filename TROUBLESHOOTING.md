# Устранение проблем с деплоем

## Текущая ситуация

Вы видите ошибки Angular приложения (`main-es2015.c87f503ef7a5d2d31768.js`), но в вашем проекте **нет Angular** - это обычный JavaScript с Vite.

## Причина

На GitHub Pages все еще показывается **старая версия** сайта (Angular приложение).

## Решение

### Шаг 1: Проверьте GitHub Actions

1. Откройте https://github.com/Kenny-Corleone/ORDINA.github.io/actions
2. Проверьте, что последний workflow "Deploy to GitHub Pages" **успешно завершился** (зеленая галочка ✅)
3. Если есть красный крестик ❌ - откройте его и посмотрите ошибку

### Шаг 2: Проверьте настройки GitHub Pages

1. Откройте https://github.com/Kenny-Corleone/ORDINA.github.io/settings/pages
2. Убедитесь, что:
   - **Source**: GitHub Actions (НЕ "Deploy from a branch")
   - Если там "Deploy from a branch" - измените на "GitHub Actions"

### Шаг 3: Очистите кэш браузера

После того как GitHub Actions отработает:

1. Откройте сайт https://kenny-corleone.github.io/ORDINA.github.io/
2. Нажмите **Ctrl + Shift + R** (Windows) или **Cmd + Shift + R** (Mac) для жесткой перезагрузки
3. Или откройте в режиме инкогнито

### Шаг 4: Если не помогло - принудительный деплой

Если GitHub Actions не запустился автоматически:

1. Сделайте любое небольшое изменение (например, добавьте пробел в README.md)
2. Закоммитьте и запушьте через GitHub Desktop
3. Это запустит GitHub Actions заново

### Шаг 5: Проверка через GitHub Desktop

1. Откройте GitHub Desktop
2. Убедитесь, что вы на ветке `main`
3. Нажмите "Fetch origin" чтобы проверить, что все синхронизировано
4. Если есть изменения для push - сделайте push

## Ожидаемый результат

После успешного деплоя вы должны увидеть:
- ✅ Файлы `index-DA2yLrfZ.js` вместо `main-es2015.c87f503ef7a5d2d31768.js`
- ✅ Экран авторизации ORDINA
- ✅ Нет ошибок Angular

## Если все еще не работает

Возможно, на GitHub есть старая ветка `gh-pages`. Проверьте:

1. Откройте https://github.com/Kenny-Corleone/ORDINA.github.io/branches
2. Если есть ветка `gh-pages` - удалите её
3. В настройках Pages убедитесь, что используется "GitHub Actions", а не ветка

## Контрольный список

- [ ] GitHub Actions успешно завершился
- [ ] В настройках Pages выбран "GitHub Actions"
- [ ] Очищен кэш браузера (Ctrl+Shift+R)
- [ ] Нет старой ветки gh-pages
- [ ] Все изменения запушены в main

## Примечание

Ошибки `ERR_BLOCKED_BY_CLIENT` для hotjar, facebook, adroll - это **нормально**. Это блокировщик рекламы в браузере.
