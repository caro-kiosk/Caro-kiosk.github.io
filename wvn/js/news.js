class NewsPortal {
    constructor() {
        this.news = [];
        this.filteredNews = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.loadNews();
        this.renderNews();
        this.setupEventListeners();
        this.updateStats();
    }

    async loadNews() {
        try {
            const response = await fetch('data/news.json');
            this.news = await response.json();
            this.filteredNews = [...this.news];
        } catch (error) {
            console.error('Fehler beim Laden der News:', error);
            this.showError();
        }
    }

    setupEventListeners() {
        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchNews(e.target.value);
        });

        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Modal
        document.querySelectorAll('.close-modal, .modal').forEach(el => {
            el.addEventListener('click', this.closeModal);
        });

        // Debate Buttons (dynamisch)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('debate-btn')) {
                const newsId = e.target.dataset.newsId;
                this.openDebate(newsId);
            }
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update UI
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Filter news
        if (filter === 'all') {
            this.filteredNews = [...this.news];
        } else {
            this.filteredNews = this.news.filter(news => 
                news.category.toLowerCase() === filter.toLowerCase()
            );
        }

        this.renderNews();
        this.updateStats();
    }

    searchNews(query) {
        const q = query.toLowerCase();
        this.filteredNews = this.news.filter(news => 
            news.title.toLowerCase().includes(q) ||
            news.summary.toLowerCase().includes(q) ||
            news.country.toLowerCase().includes(q)
        );
        this.renderNews();
        this.updateStats();
    }

    renderNews() {
        const grid = document.getElementById('news-grid');
        if (!this.filteredNews.length) {
            grid.innerHTML = '<div class="no-results">Keine News gefunden 😔</div>';
            return;
        }

        grid.innerHTML = this.filteredNews.map(news => `
            <article class="news-card" data-id="${news.id}">
                <div class="news-card-header">
                    <span class="country-badge">${news.country}</span>
                    <button class="debate-btn" data-news-id="${news.id}">💬 Debattieren</button>
                </div>
                <h3 class="news-title">${news.title}</h3>
                <p class="news-summary">${news.summary}</p>
                <div class="news-footer">
                    <a href="${news.url}" target="_blank" class="source-link">${news.source}</a>
                    <span class="date">${news.date}</span>
                </div>
            </article>
        `).join('');
    }

    openDebate(newsId) {
        const news = this.news.find(n => n.id == newsId);
        if (news) {
            // News an child window weitergeben
            window.localStorage.setItem('debate-news', JSON.stringify(news));
            
            // Modal öffnen
            const modal = document.getElementById('debate-modal');
            document.getElementById('modal-title').textContent = `Debatte: ${news.title}`;
            modal.style.display = 'block';
            
            // iframe neu laden
            document.getElementById('debate-frame').src = 'debate.html';
        }
    }

    closeModal(e) {
        if (e.target.classList.contains('modal') || e.target.classList.contains('close-modal')) {
            document.getElementById('debate-modal').style.display = 'none';
        }
    }

    updateStats() {
        document.getElementById('news-count').textContent = this.filteredNews.length;
        const countries = new Set(this.filteredNews.map(n => n.country));
        document.getElementById('countries-count').textContent = countries.size;
    }

    showError() {
        document.getElementById('news-grid').innerHTML = `
            <div style="text-align: center; padding: 4rem; color: #94a3b8;">
                <h3>❌ News konnten nicht geladen werden</h3>
                <p>Überprüfe data/news.json oder die Browser-Konsole.</p>
            </div>
        `;
    }
}

// Initialisieren
document.addEventListener('DOMContentLoaded', () => new NewsPortal());
