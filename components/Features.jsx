import React from 'react';

const Features = () => {
  return (
    <section className="features">
      <div className="container">
        <h2>Por Que Escolher o IPG?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15.09 8.26H22L17.82 12.88L20.16 19.44L12 15.27L3.84 19.44L6.18 12.88L2 8.26H8.91L12 2Z" />
              </svg>
            </div>
            <h3>Excelência Acadêmica</h3>
            <p>Professores qualificados com mestrado e doutorado dedicados ao seu sucesso</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M7 7H17M7 12H17M7 17H13" />
              </svg>
            </div>
            <h3>Laboratórios Modernos</h3>
            <p>Infraestrutura de ponta para aprendizado prático e desenvolvimento de habilidades</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3>Comunidade Ativa</h3>
            <p>Rede de alunos, professores e profissionais em constante colaboração</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;