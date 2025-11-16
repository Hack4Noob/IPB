// Security Protection Module - Defesa contra ataques comuns
// Este arquivo deve ser carregado antes de qualquer outro script que acesse dados sensíveis

(function() {
  'use strict';

  const XSSProtection = {
    // Sanitizar strings para prevenir XSS
    sanitize: function(input) {
      if (typeof input !== 'string') return input;
      
      const div = document.createElement('div');
      div.textContent = input;
      return div.innerHTML;
    },
    
    // Sanitizar HTML de forma mais robusta
    sanitizeHTML: function(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Remover scripts
      const scripts = doc.querySelectorAll('script');
      scripts.forEach(script => script.remove());
      
      // Remover event handlers
      const allElements = doc.querySelectorAll('*');
      allElements.forEach(el => {
        // Remover atributos perigosos
        const dangerousAttrs = ['onclick', 'onerror', 'onload', 'onmouseover', 'onkeydown'];
        dangerousAttrs.forEach(attr => el.removeAttribute(attr));
      });
      
      return doc.body.innerHTML;
    }
  };

  const CSRFProtection = {
    generateToken: function() {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },
    
    getToken: function() {
      let token = sessionStorage.getItem('csrf-token');
      if (!token) {
        token = this.generateToken();
        sessionStorage.setItem('csrf-token', token);
      }
      return token;
    },
    
    validateToken: function(token) {
      const storedToken = sessionStorage.getItem('csrf-token');
      return storedToken && storedToken === token;
    }
  };

  const SQLInjectionProtection = {
    isValidInput: function(input) {
      // Detectar padrões comuns de SQL Injection
      const sqlPatterns = [
        /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/gi,
        /(--|#|;|\*|\'|\")/,
        /(\bOR\b.*=.*)/gi,
        /(\bAND\b.*=.*)/gi
      ];
      
      return !sqlPatterns.some(pattern => pattern.test(input));
    }
  };

  const BruteForceProtection = {
    attempts: {},
    maxAttempts: 5,
    lockoutTime: 15 * 60 * 1000, // 15 minutos
    
    recordAttempt: function(identifier) {
      const now = Date.now();
      
      if (!this.attempts[identifier]) {
        this.attempts[identifier] = [];
      }
      
      // Remover tentativas antigas
      this.attempts[identifier] = this.attempts[identifier].filter(
        time => now - time < this.lockoutTime
      );
      
      this.attempts[identifier].push(now);
    },
    
    isLocked: function(identifier) {
      return this.attempts[identifier] && 
             this.attempts[identifier].length >= this.maxAttempts;
    },
    
    getRemainingTime: function(identifier) {
      if (!this.isLocked(identifier)) return 0;
      
      const oldestAttempt = this.attempts[identifier][0];
      const elapsed = Date.now() - oldestAttempt;
      return Math.max(0, this.lockoutTime - elapsed);
    },
    
    reset: function(identifier) {
      delete this.attempts[identifier];
    }
  };

  const CSPHelper = {
    addHeaders: function() {
      // Adicionar meta tags de segurança (já devem estar em layout.tsx)
      const meta = {
        'X-UA-Compatible': 'IE=edge',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      };
      
      // Headers são normalmente configurados no servidor
      console.log('[SECURITY] CSP headers recomendados:', meta);
    },
    
    validateOrigin: function(origin) {
      // Whitelist de origens permitidas
      const allowedOrigins = [
        window.location.origin,
        'https://gestaoescolar-b.firebaseapp.com'
      ];
      
      return allowedOrigins.includes(origin);
    }
  };

  const DataExposureProtection = {
    // Mascarar informações sensíveis
    maskEmail: function(email) {
      const [name, domain] = email.split('@');
      const masked = name.slice(0, 2) + '*'.repeat(Math.max(0, name.length - 2)) + '@' + domain;
      return masked;
    },
    
    maskPassword: function(length = 10) {
      return '*'.repeat(length);
    },
    
    // Não logar dados sensíveis
    safeLog: function(message, data) {
      const safeData = JSON.parse(JSON.stringify(data));
      if (safeData.password) safeData.password = '[REDACTED]';
      if (safeData.email) safeData.email = this.maskEmail(safeData.email);
      if (safeData.token) safeData.token = '[REDACTED]';
      
      console.log('[SECURITY]', message, safeData);
    }
  };

  const RateLimiter = {
    limits: {},
    
    check: function(key, maxRequests = 10, windowMs = 60000) {
      const now = Date.now();
      
      if (!this.limits[key]) {
        this.limits[key] = [];
      }
      
      // Remover requisições fora da janela de tempo
      this.limits[key] = this.limits[key].filter(
        time => now - time < windowMs
      );
      
      if (this.limits[key].length >= maxRequests) {
        return false; // Bloqueado
      }
      
      this.limits[key].push(now);
      return true; // Permitido
    },
    
    reset: function(key) {
      delete this.limits[key];
    }
  };

  // Expor globalmente
  window.SecurityProtection = {
    XSS: XSSProtection,
    CSRF: CSRFProtection,
    SQLInjection: SQLInjectionProtection,
    BruteForce: BruteForceProtection,
    CSP: CSPHelper,
    DataExposure: DataExposureProtection,
    RateLimit: RateLimiter
  };

  // Log de inicialização
  console.log('[SECURITY] Protection module loaded ✓');
})();
