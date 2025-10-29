// ═══════════════════════════════════════════════════════════════════════════
// 📰 МОДУЛЬ НОВОСТЕЙ
// ═══════════════════════════════════════════════════════════════════════════

import { NEWSAPI_KEY, NEWS_PER_PAGE } from '../config.js';

let currentPage = 1;
let currentCountry = 'us';
let currentCategory = 'general';

export function initNews() {
    loadNews();
    setupNewsControls();
}

function setupNewsControls() {
    const countrySelect = document.getElementById('news-country-select');
    const categorySelect = document.getElementById('news-category-select');
    const prevBtn = document.getElementById('news-prev-btn');
    const nextBtn = document.getElementById('news-next-btn');
    
    if (countrySelect) {
        countrySelect.addEventListener('change', (e) => {
            currentCountry = e.target.value;
            currentPage = 1;
            loadNews();
        });
    }
    
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            currentPage = 1;
            loadNews();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadNews();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentPage++;
            loadNews();
        });
    }
}

async function loadNews() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;
    
    try {
        newsContainer.innerHTML = '<div class="text-center p-4">Загрузка новостей...</div>';
        
        const url = `https://newsdata.io/api/1/news?apikey=${NEWSAPI_KEY}&country=${currentCountry}&category=${currentCategory}&language=ru&page=${currentPage}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            displayNews(data.results);
        } else {
            newsContainer.innerHTML = '<div class="text-center p-4">Новости не найдены</div>';
        }
    } catch (error) {
        newsContainer.innerHTML = '<div class="text-center p-4 text-red-500">Ошибка загрузки новостей</div>';
    }
}

function displayNews(articles) {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;
    
    newsContainer.innerHTML = articles.map(article => `
        <div class="premium-card p-4 mb-3 hover:shadow-lg transition-all">
            ${article.image_url ? `
                <img src="${article.image_url}" 
                     alt="${article.title}" 
                     class="w-full h-48 object-cover rounded-lg mb-3">
            ` : ''}
            <h3 class="font-bold text-lg mb-2">${article.title}</h3>
            <p class="text-sm opacity-70 mb-3">${article.description || ''}</p>
            <div class="flex justify-between items-center text-xs opacity-60">
                <span>${article.source_id || 'Источник'}</span>
                <span>${new Date(article.pubDate).toLocaleDateString('ru-RU')}</span>
            </div>
            ${article.link ? `
                <a href="${article.link}" 
                   target="_blank" 
                   class="premium-btn mt-3 inline-block text-sm">
                    Читать далее
                </a>
            ` : ''}
        </div>
    `).join('');
}

export { loadNews };
