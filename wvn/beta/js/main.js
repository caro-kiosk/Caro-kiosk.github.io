class NachrichtenPortal {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.init();
    }

    async init() {
        await this.loadArticles();
        this.renderTopStories();
        this.renderNewsGrid();
        this.setupEventListeners();
        this.updateCounts();
    }

    async loadArticles() {
        try {
            const response = await fetch('data/articles.json');
            this.articles = await response.json();
            this.filteredArticles = [...this.articles];
        } catch (error) {
            console.error('Fehler beim Laden:', error);
            document.getElementById('news-grid').innerHTML = 
                '<div class="no-results">Bitte erstellen Sie data/articles.json</div>';
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = e.target.dataset.filter;
                this.filterArticles(filter);
            });
        });

        // Search
        document.getElementById('search').addEventListener('input', (e) => {
            this.searchArticles(e.target.value);
        });

        // Modal
        document.getElementById('analyze-btn').addEventListener('click', () => this.sendToPerplexity());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendToPerplexity();
        });

        // News Cards
        document.addEventListener('click', (e) => {
            if (e.target.closest('.news-card') || e.target.closest('.top-story')) {
                this.openArticleDebate(e.target.closest('.news-card, .top-story'));
            }
        });

        document.querySelector('.modal-close').addEventListener('click', () => {
            document.getElementById('debate-modal').style.display = 'none';
        });
    }

    filterArticles(category) {
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        event.target.classList.add('active');

        if (category === 'all') {
            this.filteredArticles = [...this.articles];
        } else {
            this.filteredArticles = this.articles.filter(article => 
                article.category === category
            );
        }

        this.renderTopStories();
        this.renderNewsGrid();
        this.updateCounts();
    }

    searchArticles(query) {
        const q = query.toLowerCase();
        this.filteredArticles = this.articles.filter(article =>
            article.title.toLowerCase().includes(q) ||
            article.summary.toLowerCase().includes(q) ||
            article.country.toLowerCase().includes(q) ||
            article.source.toLowerCase().includes(q)
        );
        this.renderTopStories();
        this.renderNewsGrid();
        this.updateCounts();
    }

    renderTopStories() {
        const topStories = this.filteredArticles.slice(0, 4);
        document.getElementById('top-stories').innerHTML = topStories.map(article => `
            <article class="top-story news-card" data-id="${article.id}">
                <div class="top-story-image">
                    <span class="country-flag">${article.country}</span>
                    📰
                </div>
                <div class="top-story-content">
                    <h3 class="top-story-title">${article.title}</h3>
                    <div class="news-meta">
                        <span class="news-source">${article.source}</span>
                        <span class="news-date">${article.date}</span>
                    </div>
                </div>
            </article>
        `).join('');
    }

    renderNewsGrid() {
        const grid = document.getElementById('news-grid');
        const articles = this.filteredArticles.slice(4, 20);

        if (!articles.length) {
            grid.innerHTML = '<div class="no-results">Keine Artikel gefunden</div>';
            return;
        }

        grid.innerHTML = articles.map(article => `
            <article class="news-card" data-id="${article.id}">
                <div class="news-card-image">
                    <span class="country-flag">${article.country}</span>
                </div>
                <div class="news-card-content">
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-summary">${article.summary}</p>
                    <div class="news-meta">
                        <span class="news-source">${article.source}</span>
                        <span class="news-date">${article.date}</span>
                    </div>
                </div>
            </article>
        `).join('');
    }

    openArticleDebate(card) {
        const id = card.dataset.id;
        const article = this.articles.find(a => a.id == id);
        
        document.getElementById('modal-news-title').textContent = article.title;
        document.getElementById('modal-news-source').textContent = `${article.source} • ${article.country}`;
        
        document.getElementById('debate-modal').style.display = 'block';
    }

    sendToPerplexity() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        
        if (!text) return;

        const chat = document.getElementById('perplexity-chat');
        const article = this.articles.find(a => a.id == document.querySelector('.news-card[data-id]:focus')?.dataset.id);
        
        // Platzhalter für Perplexity Response
        const message = document.createElement('div');
        message.className = 'chat-message ai';
        message.innerHTML = `
            <p><strong>Perplexity AI:</strong> <em>Analysiere "${article.title}"...</em></p>
            <p><strong>API Key erforderlich:</strong> Schreibe <code>PERPLEXITY_API_KEY=pxx-...</code> oder deine Frage.</p>
        `;
        chat.appendChild(message);
        chat.scrollTop = chat.scrollHeight;
        input.value = '';
    }

    updateCounts() {
        const countEl = document.querySelector('.section-title .count');
        countEl.textContent = `(${this.filteredArticles.length})`;
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new NachrichtenPortal();
});
