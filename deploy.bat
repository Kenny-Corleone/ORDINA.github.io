@echo off
REM 🚀 ORDINA - Quick Deploy Script for GitHub Pages (Windows)

echo ╔════════════════════════════════════════════════════════════╗
echo ║          🚀 ORDINA GitHub Pages Deploy Script             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if git is initialized
if not exist .git (
    echo 📦 Initializing Git repository...
    git init
    git branch -M main
)

REM Add all files
echo 📝 Adding files to Git...
git add .

REM Commit
echo 💾 Creating commit...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Update: %date% %time%
git commit -m "%commit_msg%"

REM Check if remote exists
git remote | findstr origin >nul
if errorlevel 1 (
    echo.
    echo 🔗 No remote repository found.
    echo Please enter your GitHub repository URL:
    echo Example: https://github.com/username/ordina.git
    set /p repo_url="Repository URL: "
    git remote add origin %repo_url%
)

REM Push to GitHub
echo.
echo 🚀 Pushing to GitHub...
git push -u origin main

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    ✅ Deploy Complete!                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📍 Next steps:
echo 1. Go to your GitHub repository
echo 2. Settings → Pages
echo 3. Set Source to 'main' branch and '/ (root)' folder
echo 4. Wait 1-3 minutes for deployment
echo 5. Your site will be at: https://USERNAME.github.io/REPO_NAME/
echo.
pause
