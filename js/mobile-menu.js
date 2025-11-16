/**
 * Unified Mobile Menu Handler
 * Garante que o menu mobile seja 100% consistente em todas as páginas
 */
class UnifiedMobileMenu {
  constructor(options = {}) {
    this.mobileMenuSelector = options.mobileMenuSelector || '.mobile-menu';
    this.navSelector = options.navSelector || '#nav-list';
    this.breakpoint = options.breakpoint || 768;
    this.init();
  }

  init() {
    this.mobileMenuBtn = document.querySelector(this.mobileMenuSelector);
    this.nav = document.querySelector(this.navSelector);

    if (!this.mobileMenuBtn || !this.nav) {
      console.warn('[Mobile Menu] Elementos não encontrados');
      return;
    }

    this.createOverlay();
    this.setupEventListeners();
    this.ensureConsistentMarkup();
  }

  createOverlay() {
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'menu-overlay';
      document.body.appendChild(overlay);
    }
    this.overlay = overlay;
  }

  ensureConsistentMarkup() {
    if (!this.mobileMenuBtn.innerHTML.includes('svg')) {
      const menuSVG = `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>`;
      const closeSVG = `<svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>`;
      
      // Remover Font Awesome icons se existirem
      const faIcon = this.mobileMenuBtn.querySelector('i.fas');
      if (faIcon) faIcon.remove();
      
      this.mobileMenuBtn.innerHTML = menuSVG + closeSVG;
    }
    
    this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
    this.mobileMenuBtn.setAttribute('aria-label', 'Abrir menu de navegação');
  }

  setupEventListeners() {
    // Toggle menu on button click
    this.mobileMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleMenu();
    });

    // Close on overlay click
    this.overlay.addEventListener('click', () => this.closeMenu());

    // Close on link click
    this.nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen() && !this.nav.contains(e.target) && !this.mobileMenuBtn.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.closeMenu();
      }
    });

    // Close on window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > this.breakpoint && this.isOpen()) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    if (this.isOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.nav.classList.add('active');
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.mobileMenuBtn.setAttribute('aria-expanded', 'true');
    this.updateIcons();
  }

  closeMenu() {
    this.nav.classList.remove('active');
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
    this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
    this.updateIcons();
  }

  isOpen() {
    return this.nav.classList.contains('active');
  }

  updateIcons() {
    const menuIcon = this.mobileMenuBtn.querySelector('.menu-icon');
    const closeIcon = this.mobileMenuBtn.querySelector('.close-icon');
    
    if (menuIcon && closeIcon) {
      if (this.isOpen()) {
        menuIcon.style.display = 'none';
        closeIcon.style.display = 'block';
      } else {
        menuIcon.style.display = 'block';
        closeIcon.style.display = 'none';
      }
    }
  }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new UnifiedMobileMenu({
    mobileMenuSelector: '.mobile-menu',
    navSelector: '#nav-list',
    breakpoint: 768
  });
});

// Export for manual initialization if needed
window.UnifiedMobileMenu = UnifiedMobileMenu;
