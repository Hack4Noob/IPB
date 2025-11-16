import React, { useState } from 'react';

const Header = () => {
  const [isMenuActive, setIsMenuActive] = useState(false);

  const toggleMenu = () => setIsMenuActive(!isMenuActive);

  return (
    <header>
      <div className="container">
        <div className="logo">
          <img src="/images/logo.png" alt="IPG Logo" />
          <h1>IPG</h1>
        </div>
        <nav>
          <ul id="nav-list" role="navigation" className={isMenuActive ? 'active' : ''}>
            <li><a href="/index.html" aria-current="page">Início</a></li>
            <li><a href="/sobre.html">Sobre</a></li>
            <li><a href="/cursos.html">Cursos</a></li>
            <li><a href="/galeria.html">Galeria</a></li>
            <li><a href="/contato.html">Contato</a></li>
            <li id="user-area"><a href="/login.html">Área do Usuário</a></li>
          </ul>
        </nav>
        <button className="mobile-menu" aria-label="Menu de navegação" onClick={toggleMenu}>
          <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18" />
            <path d="M3 6h18" />
            <path d="M3 18h18" />
          </svg>
          <svg className="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: isMenuActive ? 'block' : 'none' }}>
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;