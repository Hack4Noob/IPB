/**
 * Performance optimization utilities for IPG system
 * Implements lazy loading, resource prioritization, and caching strategies
 */

const setupImageLazyLoading = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

const setupResourceHints = () => {
  const criticalResources = [
    { rel: 'preconnect', href: 'https://www.gstatic.com' },
    { rel: 'dns-prefetch', href: 'https://www.gstatic.com' }
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = resource.rel;
    link.href = resource.href;
    if (resource.crossOrigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

const debounce = (func, delay = 300) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

class APICache {
  constructor(maxAge = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const age = Date.now() - item.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

const setupWebVitalsMonitoring = () => {
  // Largest Contentful Paint
  const paintObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      if (entry.name === 'largest-contentful-paint') {
        console.log('[Performance] LCP:', entry.renderTime || entry.loadTime);
      }
    });
  });

  try {
    paintObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    console.log('[Performance] LCP monitoring not supported');
  }

  // Cumulative Layout Shift
  let clsValue = 0;
  const layShiftObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        console.log('[Performance] CLS:', clsValue);
      }
    });
  });

  try {
    layShiftObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.log('[Performance] CLS monitoring not supported');
  }
};

const initPerformanceOptimizations = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupImageLazyLoading();
      setupResourceHints();
      setupWebVitalsMonitoring();
    });
  } else {
    setupImageLazyLoading();
    setupResourceHints();
    setupWebVitalsMonitoring();
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    setupImageLazyLoading,
    setupResourceHints,
    debounce,
    APICache,
    setupWebVitalsMonitoring,
    initPerformanceOptimizations
  };
}

// Auto-initialize if this is not imported as a module
if (typeof window !== 'undefined') {
  window.addEventListener('load', initPerformanceOptimizations);
}
