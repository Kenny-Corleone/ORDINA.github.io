# 🚀 Деплой ORDINA на GitHub Pages

## Шаг 1: Создай репозиторий на GitHub

1. Зайди на [github.com](https://github.com)
2. Нажми **"New repository"** (зеленая кнопка)
3. Заполни:
   - **Repository name:** `ordina` (или любое другое имя)
   - **Description:** "ORDINA - Personal Finance & Life Management Suite"
   - **Public** (обязательно для бесплатного GitHub Pages)
   - ❌ НЕ добавляй README, .gitignore, license (у нас уже есть)
4. Нажми **"Create repository"**

## Шаг 2: Инициализируй Git локально

Открой терминал в папке проекта и выполни:

```bash
# Инициализация Git (если еще не сделано)
git init

# Добавь все файлы
git add .

# Первый коммит
git commit -m "Initial commit: ORDINA v1.0 - Modular Architecture"

# Переименуй ветку в main (если нужно)
git branch -M main
```

## Шаг 3: Подключи удаленный репозиторий

Замени `YOUR_USERNAME` и `YOUR_REPO_NAME` на свои:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Отправь код на GitHub
git push -u origin main
```

**Пример:**
```bash
git remote add origin https://github.com/ivanov/ordina.git
git push -u origin main
```

## Шаг 4: Настрой GitHub Pages

1. Зайди в свой репозиторий на GitHub
2. Перейди в **Settings** (вкладка вверху)
3. В левом меню найди **Pages**
4. В разделе **"Source"**:
   - **Branch:** выбери `main`
   - **Folder:** выбери `/ (root)`
5. Нажми **Save**

## Шаг 5: Дождись деплоя

- GitHub Pages начнет деплой автоматически
- Это займет 1-3 минуты
- Твой сайт будет доступен по адресу:
  ```
  https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
  ```

**Пример:**
```
https://ivanov.github.io/ordina/
```

## Шаг 6: Проверь деплой

1. Перейди в **Actions** (вкладка в репозитории)
2. Увидишь процесс деплоя "pages build and deployment"
3. Когда появится зеленая галочка ✅ - сайт готов!
4. Открой свой URL в браузере

---

## 🔧 Настройка Firebase (важно!)

После деплоя нужно настроить Firebase:

### 1. Добавь домен в Firebase Console

1. Зайди в [Firebase Console](https://console.firebase.google.com/)
2. Выбери свой проект
3. **Authentication** → **Settings** → **Authorized domains**
4. Добавь свой GitHub Pages домен:
   ```
   YOUR_USERNAME.github.io
   ```

### 2. Обнови конфиг Firebase (если нужно)

Файл `js/core/firebase.js` уже настроен, но проверь что твои ключи там есть.

---

## 📝 Последующие обновления

Когда вносишь изменения в код:

```bash
# Добавь измененные файлы
git add .

# Сделай коммит с описанием
git commit -m "Описание изменений"

# Отправь на GitHub
git push
```

GitHub Pages автоматически обновит сайт через 1-3 минуты.

---

## ✅ Проверочный список

- [ ] Репозиторий создан на GitHub
- [ ] Код загружен (`git push`)
- [ ] GitHub Pages включен в Settings
- [ ] Деплой завершен (зеленая галочка в Actions)
- [ ] Сайт открывается по URL
- [ ] Firebase домен добавлен
- [ ] Все модули работают

---

## 🐛 Возможные проблемы

### Проблема: 404 ошибка на GitHub Pages

**Решение:** Проверь что:
- В Settings → Pages выбрана ветка `main` и папка `/ (root)`
- Файл `index.html` находится в корне репозитория
- Подожди 5 минут после первого деплоя

### Проблема: CSS/JS не загружаются

**Решение:** Все пути уже относительные (`./css/`, `./js/`), должно работать.

### Проблема: Firebase не работает

**Решение:**
1. Проверь что домен добавлен в Firebase Console
2. Проверь что API ключи в `js/config.js` корректны
3. Открой консоль браузера (F12) для деталей ошибки

---

## 🎉 Готово!

Твое приложение ORDINA теперь доступно онлайн!

Поделись ссылкой:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

---

## 📚 Дополнительные ресурсы

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
