// /js/ui-manager.js
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const nav = document.getElementById('main-nav');
    let menuLock = false;

    // Criar overlay
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }

    // Ícones SVG
    const menuSVG = `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18 M3 6h18 M3 18h18"/></svg>`;
    const closeSVG = `<svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18 M6 6l12 12"/></svg>`;

    if (mobileMenu) {
        mobileMenu.innerHTML = menuSVG + closeSVG;
        mobileMenu.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu(e) {
        if (menuLock || !nav) return;
        menuLock = true;
        setTimeout(() => menuLock = false, 300);

        if (e) e.preventDefault();

        const isOpen = nav.classList.contains('active');
        nav.classList.toggle('active', !isOpen);
        overlay.classList.toggle('active', !isOpen);
        document.body.style.overflow = !isOpen ? 'hidden' : '';

        mobileMenu?.setAttribute('aria-expanded', !isOpen);
        const menuIcon = mobileMenu?.querySelector('.menu-icon');
        const closeIcon = mobileMenu?.querySelector('.close-icon');
        if (menuIcon && closeIcon) {
            menuIcon.style.display = !isOpen ? 'none' : 'block';
            closeIcon.style.display = !isOpen ? 'block' : 'none';
        }
    }

    mobileMenu?.addEventListener('click', toggleMenu);
    overlay?.addEventListener('click', toggleMenu);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nav.classList.contains('active')) toggleMenu();
    });

    document.querySelectorAll('.nav-mobile a, #nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) toggleMenu();
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && nav.classList.contains('active')) toggleMenu();
    });

    // Ícones automáticos (sem Font Awesome)
    const icons = {
        'início': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
        'sobre': '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>',
        'cursos': '<path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H19a2 2 0 0 0 2-2V6l-7-4H6.5A2.5 2.5 0 0 0 4 4.5z M14 3.5V8h5"/>',
        'cadastre-se': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
        'contato': '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>',
        'associação': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'área do usuário': '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
        'minha área': '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>'
    };

    document.querySelectorAll('nav a').forEach(link => {
        const text = link.textContent.toLowerCase().trim();
        const path = icons[text] || icons['início'];
        if (!path || link.querySelector('svg')) return;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.innerHTML = path;
        link.insertBefore(svg, link.firstChild);
    });
});
