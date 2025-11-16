// Componente reutilizável de header
class HeaderComponent {
  constructor(options = {}) {
    this.userRole = options.userRole || 'public'; // public, aluno, professor, admin, secretaria, associacao
    this.activePage = options.activePage || '';
    this.userName = options.userName || '';
  }

  // Define menus por tipo de usuário
  getMenuItems() {
    const menus = {
      public: [
        { href: '/index.html', label: 'Início', icon: 'home' },
        { href: '/sobre.html', label: 'Sobre' },
        { href: '/cursos.html', label: 'Cursos' },
        { href: '/cadastro.html', label: 'Cadastre-se' },
        { href: '/contato.html', label: 'Contato' },
        { href: '/login.html', label: 'Entrar', id: 'user-area' }
      ],
      aluno: [
        { href: '/index.html', label: 'Início', icon: 'home' },
        { href: '/aluno/dashboard.html', label: 'Dashboard' },
        { href: '/aluno/notas.html', label: 'Notas' },
        { href: '/aluno/presencas.html', label: 'Presenças' },
        { href: '/aluno/avisos.html', label: 'Avisos' },
        { href: '/aluno/perfil.html', label: 'Perfil' },
        { href: '/aluno/documentos.html', label: 'Documentos' },
        { href: '/logout.html', label: 'Sair' }
      ],
      professor: [
        { href: '/index.html', label: 'Início', icon: 'home' },
        { href: '/professor/dashboard.html', label: 'Dashboard' },
        { href: '/professor/turmas.html', label: 'Turmas' },
        { href: '/professor/notas.html', label: 'Notas' },
        { href: '/professor/presencas.html', label: 'Presenças' },
        { href: '/professor/avisos.html', label: 'Avisos' },
        { href: '/professor/estatisticas.html', label: 'Estatísticas' },
        { href: '/logout.html', label: 'Sair' }
      ],
      admin: [
        { href: '/index.html', label: 'Início', icon: 'home' },
        { href: '/admin/dashboard.html', label: 'Dashboard' },
        { href: '/admin/cursos.html', label: 'Cursos' },
        { href: '/admin/turmas.html', label: 'Turmas' },
        { href: '/admin/disciplinas.html', label: 'Disciplinas' },
        { href: '/admin/usuarios.html', label: 'Usuários' },
        { href: '/admin/relatorios.html', label: 'Relatórios' },
        { href: '/admin/configuracoes.html', label: 'Configurações' },
        { href: '/logout.html', label: 'Sair' }
      ],
      secretaria: [
        { href: '/index.html', label: 'Início', icon: 'home' },
        { href: '/secretaria/dashboard.html', label: 'Dashboard' },
        { href: '/secretaria/alunos.html', label: 'Alunos' },
        { href: '/secretaria/documentos.html', label: 'Documentos' },
        { href: '/secretaria/pagamentos.html', label: 'Pagamentos' },
        { href: '/secretaria/relatorios.html', label: 'Relatórios' },
        { href: '/logout.html', label: 'Sair' }
      ],
      associacao: [
        { href: '/index.html', label: 'Início', icon: 'home' },
        { href: '/associacao/dashboard.html', label: 'Dashboard' },
        { href: '/logout.html', label: 'Sair' }
      ]
    };
    return menus[this.userRole] || menus.public;
  }

  // Gera HTML do header completo
  render() {
    const menuItems = this.getMenuItems();
    const menuHTML = menuItems.map(item => {
      const isActive = item.href === this.activePage ? 'class="active"' : '';
      const icon = item.icon === 'home' ? this.getHomeIcon() : '';
      const itemClass = item.icon === 'home' ? 'class="home-link"' : '';
      
      return `
        <li ${itemClass}>
          <a href="${item.href}" ${isActive} ${item.id ? `id="${item.id}"` : ''}>
            ${icon}
            ${item.label}
          </a>
        </li>
      `;
    }).join('');

    return `
      <header>
        <div class="container">
          <div class="logo">
            <img src="/images/logo.png" alt="IPG Logo">
            <h1>IPG - Instituto Politécnico da Graça</h1>
          </div>
          <nav>
            <ul id="nav-list" role="navigation">
              ${menuHTML}
            </ul>
          </nav>
          <div class="mobile-menu" aria-label="Abrir menu de navegação">
            ${this.getMobileMenuIcons()}
          </div>
        </div>
      </header>
    `;
  }

  getHomeIcon() {
    return `
      <svg class="home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <path d="M9 22V12h6v10"/>
      </svg>
    `;
  }

  getMobileMenuIcons() {
    return `
      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12h18"/>
        <path d="M3 6h18"/>
        <path d="M3 18h18"/>
      </svg>
      <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
        <path d="M18 6L6 18"/>
        <path d="M6 6l12 12"/>
      </svg>
    `;
  }

  // Inicializa funcionalidade do menu mobile
  initMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu');
    const navList = document.getElementById('nav-list');
    
    if (!mobileMenuButton || !navList) return;

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

    // Fecha ao clicar em link
    document.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', () => {
        if (navList.classList.contains('active')) {
          navList.classList.remove('active');
          const menuIcon = mobileMenuButton.querySelector('.menu-icon');
          const closeIcon = mobileMenuButton.querySelector('.close-icon');
          if (menuIcon && closeIcon) {
            menuIcon.style.display = 'block';
            closeIcon.style.display = 'none';
          }
        }
      });
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
      if (navList.classList.contains('active') && 
          !navList.contains(e.target) && 
          !mobileMenuButton.contains(e.target)) {
        navList.classList.remove('active');
        const menuIcon = mobileMenuButton.querySelector('.menu-icon');
        const closeIcon = mobileMenuButton.querySelector('.close-icon');
        if (menuIcon && closeIcon) {
          menuIcon.style.display = 'block';
          closeIcon.style.display = 'none';
        }
      }
    });

    // Fecha em resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navList.classList.contains('active')) {
        navList.classList.remove('active');
        const menuIcon = mobileMenuButton.querySelector('.menu-icon');
        const closeIcon = mobileMenuButton.querySelector('.close-icon');
        if (menuIcon && closeIcon) {
          menuIcon.style.display = 'block';
          closeIcon.style.display = 'none';
        }
      }
    });
  }
}

// Exportar para uso global
window.HeaderComponent = HeaderComponent;
