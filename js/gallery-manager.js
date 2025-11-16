// Gallery Manager - Handle gallery loading, filtering, and lightbox functionality
class GalleryManager {
  constructor() {
    this.db = firebase.firestore();
    this.auth = firebase.auth();
    this.currentCategory = 'todos';
    this.images = [];
    this.currentImageIndex = 0;
    this.filteredImages = [];
    this.initializeElements();
    this.setupEventListeners();
    this.loadGallery();
  }

  initializeElements() {
    this.container = document.getElementById('gallery-container');
    this.loadingEl = document.getElementById('gallery-loading');
    this.errorEl = document.getElementById('gallery-error');
    this.emptyEl = document.getElementById('gallery-empty');
    this.lightboxModal = document.getElementById('lightbox-modal');
    this.lightboxImage = document.getElementById('lightbox-image');
    this.lightboxTitle = document.getElementById('lightbox-title');
    this.lightboxCategory = document.getElementById('lightbox-category');
    this.lightboxDate = document.getElementById('lightbox-date');
    this.lightboxCurrent = document.getElementById('lightbox-current');
    this.lightboxTotal = document.getElementById('lightbox-total');
  }

  setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentCategory = e.target.dataset.category;
        this.filterImages();
      });
    });

    // Lightbox controls
    document.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
    document.querySelector('.lightbox-prev').addEventListener('click', () => this.prevImage());
    document.querySelector('.lightbox-next').addEventListener('click', () => this.nextImage());

    // Lightbox backdrop click
    document.querySelector('.lightbox-backdrop').addEventListener('click', () => this.closeLightbox());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.lightboxModal.classList.contains('active')) return;
      if (e.key === 'ArrowLeft') this.prevImage();
      if (e.key === 'ArrowRight') this.nextImage();
      if (e.key === 'Escape') this.closeLightbox();
    });
  }

  loadGallery() {
    this.loadingEl.style.display = 'block';
    this.errorEl.style.display = 'none';
    this.container.innerHTML = '';

    this.db.collection('galeria')
      .orderBy('dataUpload', 'desc')
      .get()
      .then((querySnapshot) => {
        this.images = [];
        querySnapshot.forEach((doc) => {
          this.images.push({
            id: doc.id,
            ...doc.data(),
            data: doc.data().dataUpload?.toDate?.()?.toLocaleDateString?.('pt-BR') || new Date().toLocaleDateString('pt-BR')
          });
        });

        this.loadingEl.style.display = 'none';
        
        if (this.images.length === 0) {
          this.emptyEl.style.display = 'block';
          return;
        }

        this.filterImages();
      })
      .catch((error) => {
        console.error('[v0] Gallery loading error:', error);
        this.errorEl.textContent = 'Erro ao carregar galeria: ' + error.message;
        this.errorEl.style.display = 'block';
        this.loadingEl.style.display = 'none';
      });
  }

  filterImages() {
    if (this.currentCategory === 'todos') {
      this.filteredImages = [...this.images];
    } else {
      this.filteredImages = this.images.filter(img => img.categoria === this.currentCategory);
    }

    this.emptyEl.style.display = this.filteredImages.length === 0 ? 'block' : 'none';
    this.renderGallery();
  }

  renderGallery() {
    this.container.innerHTML = '';
    
    this.filteredImages.forEach((image, index) => {
      const item = document.createElement('div');
      item.className = 'gallery-item slide-in';
      item.innerHTML = `
        <img src="${image.url}" alt="${image.titulo}" class="gallery-item-image" loading="lazy">
        <div class="gallery-item-overlay">
          <div class="gallery-item-title">${image.titulo}</div>
          <div class="gallery-item-category">${image.categoria}</div>
        </div>
        <div class="gallery-item-icon" aria-hidden="true">🔍</div>
      `;
      
      item.addEventListener('click', () => this.openLightbox(index));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openLightbox(index);
        }
      });
      
      this.container.appendChild(item);
    });
  }

  openLightbox(index) {
    this.currentImageIndex = index;
    const image = this.filteredImages[index];
    
    this.lightboxImage.src = image.url;
    this.lightboxImage.alt = image.titulo;
    this.lightboxTitle.textContent = image.titulo;
    this.lightboxCategory.textContent = image.categoria;
    this.lightboxDate.textContent = image.data;
    
    this.updateCounter();
    
    this.lightboxModal.classList.add('active');
    this.lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxModal.classList.remove('active');
    this.lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.filteredImages.length;
    const image = this.filteredImages[this.currentImageIndex];
    
    this.lightboxImage.style.opacity = '0';
    setTimeout(() => {
      this.lightboxImage.src = image.url;
      this.lightboxImage.alt = image.titulo;
      this.lightboxTitle.textContent = image.titulo;
      this.lightboxCategory.textContent = image.categoria;
      this.lightboxDate.textContent = image.data;
      this.updateCounter();
      this.lightboxImage.style.opacity = '1';
    }, 150);
  }

  prevImage() {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.filteredImages.length) % this.filteredImages.length;
    const image = this.filteredImages[this.currentImageIndex];
    
    this.lightboxImage.style.opacity = '0';
    setTimeout(() => {
      this.lightboxImage.src = image.url;
      this.lightboxImage.alt = image.titulo;
      this.lightboxTitle.textContent = image.titulo;
      this.lightboxCategory.textContent = image.categoria;
      this.lightboxDate.textContent = image.data;
      this.updateCounter();
      this.lightboxImage.style.opacity = '1';
    }, 150);
  }

  updateCounter() {
    this.lightboxCurrent.textContent = this.currentImageIndex + 1;
    this.lightboxTotal.textContent = this.filteredImages.length;
  }
}

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userArea = document.getElementById('user-area');
      userArea.innerHTML = `<a href="/dashboard.html" aria-label="Acessar dashboard">Minha Área</a>`;
    }
    
    new GalleryManager();
  });

  // Mobile menu toggle
  const mobileMenuButton = document.querySelector('.mobile-menu');
  const navList = document.getElementById('nav-list');
  if (mobileMenuButton && navList) {
    mobileMenuButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      navList.classList.toggle('active');
      const menuIcon = mobileMenuButton.querySelector('.menu-icon');
      const closeIcon = mobileMenuButton.querySelector('.close-icon');
      if (menuIcon && closeIcon) {
        menuIcon.style.display = navList.classList.contains('active') ? 'none' : 'block';
        closeIcon.style.display = navList.classList.contains('active') ? 'block' : 'none';
      }
    });
  }
});
