/* ============================================================
   MC GERSON JR — JAVASCRIPT PURO
   Funcionalidades: Navbar, Menu Mobile, Player Rádio, Carrinho, Modais
   ============================================================ */

// ============ NAVBAR SCROLL ============
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// ============ MOBILE MENU ============
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu a');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
  });
}

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
  });
});

// ============ ACTIVE NAV LINK ============
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', setActiveNavLink);

// ============ RADIO PLAYER ============
class RadioPlayer {
  constructor() {
    this.isPlaying = false;
    this.currentTrackIndex = 0;
    this.volume = 80;
    this.playlist = [
      { title: 'Brilho do Ouro', artist: 'MC Gerson Jr', duration: '3:24' },
      { title: 'Periferia Vence', artist: 'MC Gerson Jr', duration: '2:47' },
      { title: 'Raiz da Favela', artist: 'MC Gerson Jr', duration: '2:58' },
      { title: 'Rei do Baile', artist: 'MC Gerson Jr', duration: '3:12' },
      { title: 'Amor de Verdade', artist: 'MC Gerson Jr feat. MC Loma', duration: '4:02' },
      { title: 'Noite Dourada', artist: 'MC Gerson Jr', duration: '3:33' },
      { title: 'Subindo o Morro', artist: 'MC Gerson Jr feat. DJ Marlboro', duration: '3:41' },
      { title: 'Saudade da Rua', artist: 'MC Gerson Jr', duration: '3:55' },
    ];
    
    this.init();
  }

  init() {
    const playBtn = document.querySelector('[data-radio-play]');
    const prevBtn = document.querySelector('[data-radio-prev]');
    const nextBtn = document.querySelector('[data-radio-next]');
    const volumeSlider = document.querySelector('[data-radio-volume]');

    if (playBtn) playBtn.addEventListener('click', () => this.togglePlay());
    if (prevBtn) prevBtn.addEventListener('click', () => this.previousTrack());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextTrack());
    if (volumeSlider) volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));

    this.updateDisplay();
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    this.updateDisplay();
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    this.updateDisplay();
  }

  previousTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.updateDisplay();
  }

  setVolume(value) {
    this.volume = value;
  }

  updateDisplay() {
    const track = this.playlist[this.currentTrackIndex];
    const titleEl = document.querySelector('[data-radio-title]');
    const artistEl = document.querySelector('[data-radio-artist]');
    const playBtn = document.querySelector('[data-radio-play]');
    const statusEl = document.querySelector('[data-radio-status]');

    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    if (playBtn) {
      playBtn.innerHTML = this.isPlaying 
        ? '<svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
        : '<svg class="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    }
    if (statusEl) {
      statusEl.textContent = this.isPlaying ? '● AO VIVO' : 'PAUSADO';
    }
  }
}

// ============ SHOPPING CART ============
class ShoppingCart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
    this.init();
  }

  init() {
    this.updateCartDisplay();
    this.attachEventListeners();
  }

  addItem(id, name, price) {
    this.items.push({ id, name, price });
    localStorage.setItem('cart', JSON.stringify(this.items));
    this.updateCartDisplay();
    this.showNotification(`${name} adicionado ao carrinho!`);
  }

  removeItem(index) {
    this.items.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(this.items));
    this.updateCartDisplay();
  }

  clearCart() {
    this.items = [];
    localStorage.setItem('cart', JSON.stringify(this.items));
    this.updateCartDisplay();
  }

  updateCartDisplay() {
    const cartBtn = document.querySelector('[data-cart-btn]');
    const cartCount = document.querySelector('[data-cart-count]');
    
    if (cartCount) {
      cartCount.textContent = this.items.length;
      if (this.items.length > 0) {
        cartBtn.style.display = 'flex';
      } else {
        cartBtn.style.display = 'none';
      }
    }
  }

  attachEventListeners() {
    const addToCartBtns = document.querySelectorAll('[data-add-to-cart]');
    addToCartBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.productId;
        const name = btn.dataset.productName;
        const price = btn.dataset.productPrice;
        this.addItem(id, name, price);
      });
    });
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #FFD700;
      color: #080808;
      padding: 1rem 1.5rem;
      border-radius: 0;
      font-weight: bold;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// ============ CATEGORY FILTER ============
class CategoryFilter {
  constructor() {
    this.init();
  }

  init() {
    const filterBtns = document.querySelectorAll('[data-category-filter]');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => this.filterProducts(btn.dataset.category));
    });
  }

  filterProducts(category) {
    const products = document.querySelectorAll('[data-product]');
    const filterBtns = document.querySelectorAll('[data-category-filter]');

    filterBtns.forEach(btn => {
      if (btn.dataset.category === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    products.forEach(product => {
      if (category === 'Todos' || product.dataset.category === category) {
        product.style.display = 'block';
        product.classList.add('animate-fade-in-up');
      } else {
        product.style.display = 'none';
      }
    });
  }
}

// ============ VIDEO MODAL ============
class VideoModal {
  constructor() {
    this.init();
  }

  init() {
    const videoThumbnails = document.querySelectorAll('[data-video-id]');
    const modal = document.querySelector('[data-video-modal]');
    const closeBtn = document.querySelector('[data-modal-close]');

    videoThumbnails.forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        e.preventDefault();
        const videoId = thumb.dataset.videoId;
        this.openModal(videoId, modal);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal(modal));
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal(modal);
      });
    }
  }

  openModal(videoId, modal) {
    const iframe = modal.querySelector('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal(modal) {
    const iframe = modal.querySelector('iframe');
    iframe.src = '';
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// ============ SCROLL ANIMATIONS ============
class ScrollAnimations {
  constructor() {
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const animateElements = document.querySelectorAll('[data-animate]');
    animateElements.forEach(el => observer.observe(el));
  }
}

// ============ INITIALIZE ON DOM READY ============
document.addEventListener('DOMContentLoaded', () => {
  new RadioPlayer();
  new ShoppingCart();
  new CategoryFilter();
  new VideoModal();
  new ScrollAnimations();
});

// ============ UTILITY: PLAY MUSIC ITEM ============
function playMusicItem(index, playlist) {
  const items = document.querySelectorAll('.music-item');
  items.forEach((item, i) => {
    if (i === index) {
      item.classList.add('playing');
    } else {
      item.classList.remove('playing');
    }
  });
}

// ============ UTILITY: FORMAT PRICE ============
function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}
