#!/bin/bash

# 🚀 ORDINA - Quick Deploy Script for GitHub Pages

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          🚀 ORDINA GitHub Pages Deploy Script             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📝 Adding files to Git..."
git add .

# Commit
echo "💾 Creating commit..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi
git commit -m "$commit_msg"

# Check if remote exists
if ! git remote | grep -q origin; then
    echo ""
    echo "🔗 No remote repository found."
    echo "Please enter your GitHub repository URL:"
    echo "Example: https://github.com/username/ordina.git"
    read -p "Repository URL: " repo_url
    git remote add origin "$repo_url"
fi

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    ✅ Deploy Complete!                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Settings → Pages"
echo "3. Set Source to 'main' branch and '/ (root)' folder"
echo "4. Wait 1-3 minutes for deployment"
echo "5. Your site will be at: https://USERNAME.github.io/REPO_NAME/"
echo ""
