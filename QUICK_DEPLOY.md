# ⚡ Быстрый деплой на GitHub Pages

## Вариант 1: Автоматический (рекомендуется)

### Windows:
```bash
deploy.bat
```

### Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Вариант 2: Ручной (5 команд)

```bash
# 1. Инициализация (только первый раз)
git init
git branch -M main

# 2. Добавить файлы
git add .

# 3. Коммит
git commit -m "Initial commit: ORDINA v1.0"

# 4. Подключить репозиторий (замени на свой URL)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# 5. Отправить на GitHub
git push -u origin main
```

---

## После первой загрузки

### Настрой GitHub Pages:
1. Открой репозиторий на GitHub
2. **Settings** → **Pages**
3. **Source:** `main` branch, `/ (root)` folder
4. **Save**

### Твой сайт будет доступен через 2-3 минуты:
```
https://USERNAME.github.io/REPO_NAME/
```

---

## Последующие обновления (3 команды)

```bash
git add .
git commit -m "Описание изменений"
git push
```

Или просто запусти `deploy.bat` / `deploy.sh` снова!

---

## 🔥 Важно для Firebase!

После деплоя добавь домен в Firebase Console:
1. [Firebase Console](https://console.firebase.google.com/)
2. **Authentication** → **Settings** → **Authorized domains**
3. Добавь: `USERNAME.github.io`

---

## ✅ Готово!

Полная инструкция: `GITHUB_PAGES_DEPLOY.md`
