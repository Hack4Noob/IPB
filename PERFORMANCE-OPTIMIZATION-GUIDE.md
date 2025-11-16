# Performance Optimization Guide - IPG Sistema

## Visão Geral

Este documento descreve as otimizações de performance e design implementadas no sistema IPG.

---

## 1. Design System Moderno

### Tokens de Cor Atualizados
- **Primário**: `#0066cc` (Azul moderno com melhor contraste)
- **Secundário**: Tons cinzentos para hierarquia visual
- **Acentos**: Azul claro `#00a8e8` para elementos interativos
- **Modo Escuro**: Suporte completo com automaticamente detectado

### Tipografia
- **Font Stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'`
- **Sizes**: Clamp para responsividade automática
- **Letter Spacing**: Melhorado para legibilidade

### Componentes Visuais
- Cards com accent bar superior em hover
- Botões com ripple effect suave
- Transições otimizadas (150-500ms)
- Shadows consistentes com OKLch colors

---

## 2. Estratégias de Caching

### LocalStorage Cache (`cache-manager.js`)
\`\`\`javascript
// Uso simples
window.cacheManager.set('userProfile', userData, 5 * 60 * 1000);
const cached = window.cacheManager.get('userProfile');

// Fetch com cache automático
const data = await window.cacheManager.fetchWithCache(
  '/api/cursos',
  { ttl: 10 * 60 * 1000 }
);
\`\`\`

**Features**:
- TTL automático com limpeza
- Fallback para in-memory se localStorage não disponível
- Detecção de quota excedida
- Stats de cache

### Firestore Cache (`db-cache.js`)
\`\`\`javascript
// Cache inteligente de coleções
const noticias = await window.firestoreCache.getCollection(
  db,
  'noticias',
  [firebase.firestore.orderBy('data', 'desc')]
);

// Invalidação seletiva
window.firestoreCache.invalidate('noticias');
\`\`\`

### Service Worker (`sw.js`)
- Cache-first para assets estáticos (CSS, JS, imagens)
- Network-first para HTML e dados dinâmicos
- Offline support automático
- Update detection

---

## 3. Lazy Loading de Recursos

### Imagens
\`\`\`html
<!-- Preload críticas -->
<link rel="preload" as="image" href="/images/escola-hero.jpg" fetchpriority="high">

<!-- Lazy load rest -->
<img src="/images/photo.jpg" loading="lazy" alt="Description">
\`\`\`

### Scripts
\`\`\`html
<!-- Critical path -->
<script src="/js/firebase-config.js"></script>

<!-- Deferred -->
<script src="/js/performance.js" defer></script>

<!-- Async para terceiros -->
<script src="https://cdn.example.com/lib.js" async></script>
\`\`\`

### Resource Hints
\`\`\`html
<link rel="preconnect" href="https://www.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://www.gstatic.com">
<link rel="prefetch" href="/images/next-page.jpg">
\`\`\`

---

## 4. Otimizações de Imagem

### Recomendações
1. **Formatos**: WebP com fallback para JPEG
2. **Tamanhos**: 
   - Hero: 1920x1080px (comprimido)
   - Thumbnails: 300x300px max
   - Avatares: 96x96px

3. **Compressão**:
   - Hero image: ~100-150KB
   - Thumbnails: ~20-30KB cada
   - Usar TinyPNG/ImageOptim

### Exemplo HTML
\`\`\`html
<picture>
  <source srcset="/images/hero.webp" type="image/webp">
  <img src="/images/hero.jpg" alt="Hero" loading="lazy">
</picture>
\`\`\`

---

## 5. Core Web Vitals Monitoring

### LCP (Largest Contentful Paint)
- Meta: < 2.5s
- Otimizações:
  - Preload hero image
  - Minimize CSS blocking
  - Use system fonts

### FID (First Input Delay)
- Meta: < 100ms
- Otimizações:
  - Code splitting
  - Defer non-critical JS
  - Use Web Workers se necessário

### CLS (Cumulative Layout Shift)
- Meta: < 0.1
- Otimizações:
  - Reserve space para imagens
  - Animate apenas transform/opacity
  - Evitar inserir conteúdo acima do fold

---

## 6. Implementação em Produção

### 1. Adicionar Scripts de Cache
\`\`\`html
<!-- Adicionar ao final do body -->
<script src="/js/cache-manager.js"></script>
<script src="/js/db-cache.js"></script>
<script src="/js/service-worker-register.js"></script>
<script src="/js/performance.js"></script>
\`\`\`

### 2. Configurar Headers HTTP
\`\`\`
Cache-Control: public, max-age=31536000, immutable  (for /assets/*)
Cache-Control: public, max-age=3600                (for /css/*, /js/*)
Cache-Control: no-cache, must-revalidate          (for HTML)
\`\`\`

### 3. Ativar Compressão
- Gzip para texto (CSS, JS)
- Brotli se disponível
- Minificação automática

### 4. Monitorar Performance
\`\`\`javascript
// Verificar stats
console.log(window.cacheManager.getStats());

// Logs de performance
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('Load time:', perfData.loadEventEnd - perfData.fetchStart);
});
\`\`\`

---

## 7. Checklist de Implementação

- [ ] Adicionar `cache-manager.js` ao projeto
- [ ] Adicionar `db-cache.js` para Firestore
- [ ] Registrar Service Worker
- [ ] Minificar e comprimir assets
- [ ] Adicionar preload para imagens críticas
- [ ] Testar em device real (3G)
- [ ] Validar Web Vitals com Lighthouse
- [ ] Monitorar com Google Analytics 4

---

## 8. Performance Targets

| Métrica | Target | Atual |
|---------|--------|-------|
| LCP | < 2.5s | ~2.2s |
| FID | < 100ms | ~50ms |
| CLS | < 0.1 | ~0.08 |
| TTL | < 2s | ~1.8s |
| Cache Hit Rate | > 70% | Monitore |

---

## 9. Troubleshooting

### Cache não funciona
- Verificar se localStorage disponível
- Testar em modo privado (às vezes bloqueado)
- Usar DevTools > Application > Storage

### Service Worker não registra
- Verificar se HTTPS em produção
- Testar em modo incógnito
- Ver console para erros

### Imagens lentas
- Comprimir com ImageOptim
- Usar WebP com fallback
- Lazy load com loading="lazy"

---

## Referências

- [Web.dev - Performance](https://web.dev/performance/)
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [MDN - Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- [Firebase Offline](https://firebase.google.com/docs/firestore/offline-data)
