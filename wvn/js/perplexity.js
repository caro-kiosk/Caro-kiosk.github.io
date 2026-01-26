class PerplexityDebate {
    constructor() {
        this.apiKey = this.getApiKey();
        this.news = JSON.parse(window.localStorage.getItem('debate-news') || '{}');
        this.chatContainer = document.getElementById('chat-container');
        this.init();
    }

    getApiKey() {
        // 1. Aus URL Parameter
        const urlParams = new URLSearchParams(window.location.search);
        const key = urlParams.get('key');
        if (key) return key;

        // 2. Aus Input (Entwickler-Modus)
        const input = document.getElementById('chat-input');
        const match = input.value.match(/PERPLEXITY_API_KEY=(.+)/i);
        if (match) return match[1];

        // 3. localStorage (für Tests)
        return localStorage.getItem('perplexity_key') || '';
    }

    init() {
        document.getElementById('debate-title').textContent = this.news.title || 'Nachricht';
        
        // Event Listeners
        document.getElementById('send-btn').onclick = () => this.sendMessage();
        document.getElementById('chat-input').onkeypress = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };

        // Beispiel-Nachricht hinzufügen
        if (!this.apiKey) {
            this.addMessage('ℹ️ <strong>Entwickler-Hinweis:</strong> Füge dein Perplexity API Key hinzu:<br><code>PERPLEXITY_API_KEY=pplx-xxxxyourkey</code>', 'system');
        }
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message) return;

        // Nachricht anzeigen
        this.addMessage(message, 'user');
        input.value = '';

        if (!this.apiKey) {
            this.addMessage('❌ Kein API-Key gefunden. Füge <code>PERPLEXITY_API_KEY=xxx</code> in das Eingabefeld ein.', 'error');
            return;
        }

        // Perplexity API Call
        try {
            this.addMessage('🤔 Analysiere aus 5 Perspektiven...', 'ai');
            
            const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'sonar-small-online',
                    messages: [
                        {
                            role: 'system',
                            content: `Analysiere diese Nachricht aus 5 politischen Weltanschauungen (Liberal, Sozialdemokratisch, Konservativ, Ökologisch, National). Sei neutral, präzise, kurz (max 100 Wörter pro Perspektive). Strukturiere als nummerierte Liste.

News: ${this.news.title}
Zusammenfassung: ${this.news.summary}
Quelle: ${this.news.source}`
                        },
                        { role: 'user', content: message }
                    ],
                    max_tokens: 1500,
                    temperature: 0.7
                })
            });

            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content || '❌ API-Fehler';

            // Vorherige "Analysiere..." Nachricht ersetzen
            const loadingMsg = this.chatContainer.lastElementChild;
            if (loadingMsg.textContent.includes('Analysiere')) {
                loadingMsg.remove();
            }

            this.addMessage(aiResponse, 'ai');
            this.saveApiKey();

        } catch (error) {
            console.error('Perplexity Fehler:', error);
            this.addMessage(`❌ API-Fehler: ${error.message}. Überprüfe deinen API-Key.`, 'error');
        }
    }

    addMessage(text, type) {
        const div = document.createElement('div');
        div.className = `chat-message ${type}-message`;
        
        const colors = {
            ai: '#3b82f6',
            user: '#10b981',
            error: '#ef4444',
            system: '#f59e0b'
        };

        div.innerHTML = `
            <div class="message-bubble" style="border-left-color: ${colors[type] || '#6b7280'}">
                ${text}
            </div>
        `;

        this.chatContainer.appendChild(div);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    saveApiKey() {
        const input = document.getElementById('chat-input');
        const match = input.value.match(/PERPLEXITY_API_KEY=(.+)/i);
        if (match) {
            localStorage.setItem('perplexity_key', match[1]);
        }
    }
}

// Initialisieren wenn in Modal/iFrame
if (window.parent !== window) {
    document.addEventListener('DOMContentLoaded', () => new PerplexityDebate());
}
