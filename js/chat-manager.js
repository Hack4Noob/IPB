// Chat Manager - Gerencia toda a lógica de mensagens em tempo real

class ChatManager {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.currentUser = null;
        this.currentTurmaId = null;
        this.userTypingTimeout = null;
        this.lastMessageTime = 0;
        this.messageThrottleMs = 1000;

        this.elements = {
            messagesContainer: document.getElementById('messages-container'),
            messageInput: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            messageForm: document.getElementById('message-form'),
            typingIndicator: document.getElementById('typing-indicator'),
            chatTitle: document.getElementById('chat-title'),
            onlineStatus: document.getElementById('online-status'),
            contextMenu: document.getElementById('context-menu'),
            backBtn: document.getElementById('back-btn'),
        };

        const chatCacheInstance = chatCache;

        this.chatCacheInstance = chatCacheInstance;

        this.init();
    }

    async init() {
        this.auth.onAuthStateChanged(async (user) => {
            this.currentUser = user;
            if (user) {
                // Get turma from URL or parameter
                const turmaId = this.getTurmaIdFromUrl();
                if (turmaId) {
                    this.currentTurmaId = turmaId;
                    await this.loadChat();
                    this.setupEventListeners();
                }
            } else {
                window.location.href = '/login.html';
            }
        });
    }

    getTurmaIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('turma') || localStorage.getItem('currentTurmaId');
    }

    setupEventListeners() {
        this.elements.messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        this.elements.messageInput.addEventListener('input', () => {
            this.handleTyping();
        });

        this.elements.backBtn?.addEventListener('click', () => {
            window.history.back();
        });

        // Context menu handling
        document.addEventListener('contextmenu', (e) => {
            const messageEl = e.target.closest('.message-bubble');
            if (messageEl && messageEl.dataset.messageId) {
                e.preventDefault();
                this.showContextMenu(e, messageEl.dataset.messageId);
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu') && !e.target.closest('.message-bubble')) {
                this.hideContextMenu();
            }
        });
    }

    async loadChat() {
        const turmaRef = this.db.collection('turmas').doc(this.currentTurmaId);
        const turmaDoc = await turmaRef.get();

        if (!turmaDoc.exists) {
            console.error('Turma not found');
            return;
        }

        const turmaData = turmaDoc.data();
        this.elements.chatTitle.textContent = turmaData.nome || 'Chat';

        // Load initial messages from cache
        const cachedMessages = await this.chatCacheInstance.getCachedMessages(this.currentTurmaId);
        this.renderMessages(cachedMessages);

        // Listen for real-time updates
        turmaRef.collection('chats')
            .orderBy('timestamp', 'asc')
            .limit(50)
            .onSnapshot((snapshot) => {
                const messages = [];
                snapshot.forEach((doc) => {
                    messages.push({ id: doc.id, ...doc.data() });
                });

                this.renderMessages(messages);
                this.scrollToBottom();
                this.chatCacheInstance.invalidateCache(this.currentTurmaId);
            });

        // Listen for users online status
        this.db.collection('users_online')
            .where('turmaId', '==', this.currentTurmaId)
            .onSnapshot((snapshot) => {
                const onlineCount = snapshot.size;
                this.updateOnlineStatus(onlineCount);
            });
    }

    renderMessages(messages) {
        if (messages.length === 0) {
            this.elements.messagesContainer.innerHTML = `
                <div class="messages-empty">
                    <i class="fas fa-comments"></i>
                    <p>Nenhuma mensagem ainda. Comece uma conversa!</p>
                </div>
            `;
            return;
        }

        this.elements.messagesContainer.innerHTML = messages.map((msg) => {
            const isOwn = msg.userId === this.currentUser.uid;
            const time = msg.timestamp?.toDate?.()?.toLocaleTimeString('pt-BR') || 'Enviando...';
            const userInitials = msg.userName?.charAt(0).toUpperCase() || 'U';

            return `
                <div class="message ${isOwn ? 'sent' : 'received'}" data-message-id="${msg.id}">
                    <div class="message-content">
                        ${!isOwn ? `<small class="message-author">${msg.userName}</small>` : ''}
                        <div class="message-bubble" data-message-id="${msg.id}">
                            ${this.sanitizeMessage(msg.message)}
                        </div>
                        <div class="message-time">${time}</div>
                        ${msg.reactions && Object.keys(msg.reactions).length > 0 ? `
                            <div class="message-reactions">
                                ${Object.entries(msg.reactions).map(([emoji, count]) => `
                                    <span class="reaction" data-emoji="${emoji}">${emoji} ${count > 1 ? count : ''}</span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    sanitizeMessage(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async sendMessage() {
        const now = Date.now();
        if (now - this.lastMessageTime < this.messageThrottleMs) {
            return;
        }

        const message = this.elements.messageInput.value.trim();
        if (!message || message.length === 0) return;

        this.lastMessageTime = now;
        this.elements.sendBtn.disabled = true;

        try {
            // Sanitize message
            const sanitized = this.sanitizeMessage(message);

            await this.db.collection('turmas')
                .doc(this.currentTurmaId)
                .collection('chats')
                .add({
                    message: sanitized,
                    userId: this.currentUser.uid,
                    userName: this.currentUser.displayName || this.currentUser.email,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    edited: false,
                });

            this.elements.messageInput.value = '';
            this.elements.messageInput.focus();

            // Invalidate cache after sending
            this.chatCacheInstance.invalidateCache(this.currentTurmaId);
        } catch (error) {
            console.error('[Chat] Erro ao enviar mensagem:', error);
            alert('Erro ao enviar mensagem. Tente novamente.');
        } finally {
            this.elements.sendBtn.disabled = false;
        }
    }

    handleTyping() {
        clearTimeout(this.userTypingTimeout);

        // Show typing indicator
        this.showUserTyping(this.currentUser.displayName || 'Usuário');

        this.userTypingTimeout = setTimeout(() => {
            this.hideTypingIndicator();
        }, 3000);
    }

    showUserTyping(userName) {
        const typingEl = document.getElementById('typing-user');
        if (typingEl) {
            typingEl.textContent = userName;
        }
        this.elements.typingIndicator.classList.remove('hidden');
    }

    hideTypingIndicator() {
        this.elements.typingIndicator.classList.add('hidden');
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.messagesContainer.scrollTop = 
                this.elements.messagesContainer.scrollHeight;
        }, 100);
    }

    updateOnlineStatus(count) {
        if (this.elements.onlineStatus) {
            if (count > 0) {
                this.elements.onlineStatus.classList.add('online');
                this.elements.onlineStatus.textContent = `${count} online`;
            } else {
                this.elements.onlineStatus.classList.remove('online');
                this.elements.onlineStatus.textContent = 'offline';
            }
        }
    }

    showContextMenu(event, messageId) {
        const menu = this.elements.contextMenu;
        menu.style.position = 'fixed';
        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';
        menu.classList.remove('hidden');
        menu.dataset.messageId = messageId;

        // Setup context menu actions
        menu.querySelectorAll('.context-menu-item').forEach((item) => {
            item.onclick = async () => {
                const action = item.dataset.action;
                await this.handleMessageAction(action, messageId);
                this.hideContextMenu();
            };
        });
    }

    hideContextMenu() {
        this.elements.contextMenu.classList.add('hidden');
    }

    async handleMessageAction(action, messageId) {
        const messageRef = this.db.collection('turmas')
            .doc(this.currentTurmaId)
            .collection('chats')
            .doc(messageId);

        const messageDoc = await messageRef.get();
        if (!messageDoc.exists || messageDoc.data().userId !== this.currentUser.uid) {
            alert('Você não pode fazer isso com esta mensagem.');
            return;
        }

        switch (action) {
            case 'delete':
                if (confirm('Deseja deletar esta mensagem?')) {
                    await messageRef.delete();
                }
                break;
            case 'edit':
                const newText = prompt('Editar mensagem:', messageDoc.data().message);
                if (newText) {
                    await messageRef.update({
                        message: this.sanitizeMessage(newText),
                        edited: true,
                        editedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    });
                }
                break;
            case 'react':
                const emoji = prompt('Digite um emoji para reagir (ex: 👍)');
                if (emoji) {
                    const reactions = messageDoc.data().reactions || {};
                    reactions[emoji] = (reactions[emoji] || 0) + 1;
                    await messageRef.update({ reactions });
                }
                break;
        }
    }
}

// Initialize chat manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ChatManager();
    });
} else {
    new ChatManager();
}
