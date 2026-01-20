/**
 * Chat Interface Logic
 */
class ChatInterface {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.isLoading = false;
    }

    /**
     * Initialize chat
     */
    init() {
        this.setupEventListeners();
        console.log('💬 Chat interface initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Chat toggle button
        const toggleBtn = document.getElementById('chat-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }

        // Close button
        const closeBtn = document.getElementById('chat-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Send button
        const sendBtn = document.getElementById('chat-send');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Input enter key
        const input = document.getElementById('chat-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Quick question buttons
        this.setupQuickQuestions();
    }

    /**
     * Setup quick question buttons
     */
    setupQuickQuestions() {
        const questions = [
            "Which districts need urgent attention?",
            "Show me top 10 states by bio ratio",
            "Compare Maharashtra and Punjab performance",
            "What's the national average bio ratio?"
        ];

        const container = document.getElementById('quick-questions');
        if (container) {
            container.innerHTML = questions.map(q => `
                <button class="quick-question-btn px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors" data-question="${q}">
                    ${q}
                </button>
            `).join('');

            // Add click handlers
            container.querySelectorAll('.quick-question-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const question = btn.getAttribute('data-question');
                    document.getElementById('chat-input').value = question;
                    this.sendMessage();
                });
            });
        }
    }

    /**
     * Toggle chat modal
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Open chat modal
     */
    open() {
        const modal = document.getElementById('chat-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.isOpen = true;
            
            // Focus input
            const input = document.getElementById('chat-input');
            if (input) input.focus();

            // Show welcome message if first time
            if (this.messages.length === 0) {
                this.addWelcomeMessage();
            }
        }
    }

    /**
     * Close chat modal
     */
    close() {
        const modal = document.getElementById('chat-modal');
        if (modal) {
            modal.classList.add('hidden');
            this.isOpen = false;
        }
    }

    /**
     * Add welcome message
     */
    addWelcomeMessage() {
        this.addMessage({
            type: 'bot',
            content: `
                <p class="mb-2">👋 Hi! I'm your AI assistant for UIDAI data analysis.</p>
                <p class="mb-2">I can help you with:</p>
                <ul class="list-disc ml-5 space-y-1">
                    <li>Finding crisis districts</li>
                    <li>Comparing state performance</li>
                    <li>Analyzing biometric ratios</li>
                    <li>Answering data questions</li>
                </ul>
                <p class="mt-3 text-sm text-gray-600">Try asking a question or click a quick question below!</p>
            `
        }, false);
    }

    /**
 * Send message with language preference
 */
async sendMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;

    let question = input.value.trim();
    if (!question) return;

    if (this.isLoading) {
        this.showToast('Please wait for the current response...', 'warning');
        return;
    }

    // Get selected language
    const languageSelector = document.getElementById('language-selector');
    const selectedLanguage = languageSelector ? languageSelector.value : 'en';

    // Append language instruction to question if not English
    if (selectedLanguage === 'hi') {
        question = question + " (हिंदी में जवाब दें)"; // Respond in Hindi
    } else if (selectedLanguage === 'te') {
        question = question + " (తెలుగులో సమాధానం ఇవ్వండి)"; // Respond in Telugu
    }

    // Add user message (show original question without language suffix)
    this.addMessage({
        type: 'user',
        content: input.value.trim()
    });

    // Clear input
    input.value = '';

    // Show loading
    this.isLoading = true;
    this.showTypingIndicator();

    try {
        // Send to API with language-appended question
        const response = await api.sendChatMessage(question);

        // Remove typing indicator
        this.removeTypingIndicator();

        if (response.success) {
            // Add bot response
            this.addMessage({
                type: 'bot',
                content: response.answer,
                chartData: response.chart_data
            });
        } else {
            this.addMessage({
                type: 'bot',
                content: `❌ Sorry, I encountered an error: ${response.error || 'Unknown error'}`,
                isError: true
            });
        }

    } catch (error) {
        this.removeTypingIndicator();
        this.addMessage({
            type: 'bot',
            content: `❌ Failed to get response. Please check your connection and try again.`,
            isError: true
        });
        console.error('Chat error:', error);
    } finally {
        this.isLoading = false;
    }
}

    /**
 * Add message to chat
 */
addMessage(message, scroll = true) {
    this.messages.push(message);

    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type} mb-4 ${message.type === 'user' ? 'text-right' : ''}`;

    const bubbleClass = message.type === 'user' 
        ? 'bg-blue-500 text-white' 
        : message.isError 
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-gray-100 text-gray-800';

    // Build message HTML
    let messageHTML = `
        <div class="inline-block max-w-3/4 px-4 py-3 rounded-lg ${bubbleClass} text-left">
            ${message.content}
            ${message.chartData ? this.renderChart(message.chartData) : ''}
        </div>
        <div class="text-xs text-gray-500 mt-1">${getTimestamp()}</div>
    `;

    messageDiv.innerHTML = messageHTML;
    messagesContainer.appendChild(messageDiv);

    if (scroll) {
        this.scrollToBottom();
    }
}

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'typing-indicator mb-4';
        typingDiv.innerHTML = `
            <div class="inline-block bg-gray-100 px-4 py-3 rounded-lg">
                <div class="flex space-x-2">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    /**
     * Remove typing indicator
     */
    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

   /**
 * Render chart in chat message
 */
renderChart(chartData) {
    if (!chartData) return '';

    const chartId = `chat-chart-${Date.now()}`;
    
    // Schedule chart creation after DOM update
    setTimeout(() => {
        const canvas = document.getElementById(chartId);
        if (canvas) {
            try {
                new Chart(canvas, chartData);
                console.log('✓ Chart rendered:', chartId);
            } catch (error) {
                console.error('Chart rendering error:', error);
            }
        } else {
            console.error('Canvas not found:', chartId);
        }
    }, 100);

    return `
        <div class="mt-4 bg-white p-4 rounded-lg border border-gray-200">
            <canvas id="${chartId}" style="max-height: 300px;"></canvas>
        </div>
    `;
}
    /**
     * Scroll to bottom
     */
    scrollToBottom() {
        const container = document.getElementById('chat-messages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${
            type === 'success' ? 'bg-green-500' : 
            type === 'warning' ? 'bg-yellow-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    /**
     * Clear chat history
     */
    clearHistory() {
        this.messages = [];
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        this.addWelcomeMessage();
    }
}

// Create global chat instance
const chat = new ChatInterface();