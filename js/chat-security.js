// Chat Security Manager - Valida acesso e gerencia permissões

class ChatSecurity {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
    }

    async validateChatAccess(turmaId, userId) {
        try {
            const userDoc = await this.db.collection('usuarios').doc(userId).get();
            
            if (!userDoc.exists) {
                console.error('[ChatSecurity] User not found');
                return false;
            }

            const userData = userDoc.data();
            const turmas = userData.turmas || [];

            // Check if user is in this turma
            const hasAccess = turmas.includes(turmaId);

            if (!hasAccess) {
                console.warn('[ChatSecurity] User does not have access to this turma');
            }

            return hasAccess;
        } catch (error) {
            console.error('[ChatSecurity] Error validating access:', error);
            return false;
        }
    }

    async validateMessageEdit(turmaId, messageId, userId) {
        try {
            const messageDoc = await this.db
                .collection('turmas')
                .doc(turmaId)
                .collection('chats')
                .doc(messageId)
                .get();

            if (!messageDoc.exists) {
                console.error('[ChatSecurity] Message not found');
                return false;
            }

            const messageData = messageDoc.data();
            return messageData.userId === userId;
        } catch (error) {
            console.error('[ChatSecurity] Error validating edit:', error);
            return false;
        }
    }

    async validateMessageDelete(turmaId, messageId, userId) {
        return this.validateMessageEdit(turmaId, messageId, userId);
    }

    sanitizeMessage(text) {
        if (typeof text !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        let sanitized = div.innerHTML;

        // Remove dangerous HTML
        sanitized = sanitized
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');

        return sanitized;
    }

    validateMessageLength(text) {
        return text && text.length > 0 && text.length <= 5000;
    }

    rateLimit(userId, action) {
        const key = `ratelimit-${userId}-${action}`;
        const count = parseInt(localStorage.getItem(key) || '0');
        const timestamp = parseInt(localStorage.getItem(`${key}-time`) || '0');
        const now = Date.now();

        // Reset if more than 1 minute passed
        if (now - timestamp > 60000) {
            localStorage.setItem(key, '0');
            localStorage.setItem(`${key}-time`, now.toString());
            return true;
        }

        // Allow max 20 messages per minute
        if (count >= 20) {
            console.warn('[ChatSecurity] Rate limit exceeded');
            return false;
        }

        localStorage.setItem(key, (count + 1).toString());
        return true;
    }

    async logChatActivity(userId, action, turmaId, messageId = null) {
        try {
            await this.db.collection('chat_logs').add({
                userId,
                action,
                turmaId,
                messageId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userAgent: navigator.userAgent,
            });
        } catch (error) {
            console.error('[ChatSecurity] Error logging activity:', error);
        }
    }
}

// Export for use
const chatSecurity = new ChatSecurity();
