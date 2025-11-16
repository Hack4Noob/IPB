import React from 'react';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>Educação Técnica para um Futuro Brilhante</h1>
          <p>Formando profissionais qualificados que transformam Benguela e Angola</p>
          <div className="hero-cta">
            <a href="/cursos.html" className="btn btn-primary">Conheça Nossos Cursos</a>
            <a href="/sobre.html" className="btn btn-secondary">Saiba Mais</a>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/escola-hero.jpg" alt="Campus IPG" loading="eager" />
        </div>
      </div>
    </section>
  );
};

export default Hero;