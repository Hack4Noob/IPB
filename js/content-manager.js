// content-manager.js - Gerenciamento de conteúdo do site (notícias, eventos, contato)
document.addEventListener('DOMContentLoaded', function() {
  const db = firebase.firestore();

  // Utilitário para mostrar spinner de loading
  function showLoading(container, msg = 'Carregando...') {
    let spinner = container.querySelector('.loading-spinner');
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.className = 'loading-spinner active';
      spinner.setAttribute('aria-live', 'polite');
      spinner.innerHTML = msg;
      container.appendChild(spinner);
    }
    spinner.style.display = 'flex';
  }
  function hideLoading(container) {
    const spinner = container.querySelector('.loading-spinner');
    if (spinner) spinner.style.display = 'none';
  }

  // Carregar notícias do Firestore (exemplo)
  const noticiasContainer = document.getElementById('noticias-container');
  if (noticiasContainer) {
    showLoading(noticiasContainer, 'Carregando notícias...');
    db.collection('noticias').orderBy('data', 'desc').limit(3).get().then(querySnapshot => {
      noticiasContainer.innerHTML = '';
      querySnapshot.forEach(doc => {
        const noticia = doc.data();
        console.log('39. Notícia carregada:', noticia);
        const noticiaCard = document.createElement('div');
        noticiaCard.className = 'noticia-card';
        noticiaCard.innerHTML = `
          <div class="noticia-img">
            <img src="${noticia.imagem}" alt="${noticia.titulo}" loading="lazy">
          </div>
          <div class="noticia-content">
            <h3>${noticia.titulo}</h3>
            <p>${noticia.resumo}</p>
            <div class="noticia-meta">
              <span><i class="far fa-calendar-alt" aria-hidden="true"></i> ${new Date(noticia.data).toLocaleDateString('pt-BR')}</span>
              <a href="#" tabindex="0">Leia mais</a>
            </div>
          </div>
        `;
        noticiasContainer.appendChild(noticiaCard);
      });
      hideLoading(noticiasContainer);
    }).catch(error => {
      console.error('Erro ao carregar notícias:', error.code, error.message);
      noticiasContainer.innerHTML = '<p aria-live="assertive" tabindex="-1" style="color:#d32f2f;">Erro ao carregar notícias. Tente novamente mais tarde.</p>';
      hideLoading(noticiasContainer);
    });
  }

  // Carregar eventos do Firestore
  const calendarioContainer = document.getElementById('calendario');
  if (calendarioContainer) {
    showLoading(calendarioContainer, 'Carregando eventos...');
    db.collection('eventos').orderBy('data', 'asc').limit(3).get().then(querySnapshot => {
      calendarioContainer.innerHTML = '';
      querySnapshot.forEach(doc => {
        const evento = doc.data();
        console.log('42. Evento carregado:', evento);
        const eventoDiv = document.createElement('div');
        eventoDiv.className = 'evento';
        eventoDiv.innerHTML = `
          <div class="evento-data">
            <div class="evento-dia">${new Date(evento.data).getDate()}</div>
            <div class="evento-mes">${new Date(evento.data).toLocaleString('pt-BR', { month: 'short' }).toUpperCase()}</div>
          </div>
          <div class="evento-info">
            <h3>${evento.titulo}</h3>
            <p>${evento.descricao}</p>
          </div>
        `;
        calendarioContainer.appendChild(eventoDiv);
      });
      hideLoading(calendarioContainer);
    }).catch(error => {
      console.error('Erro ao carregar eventos:', error.code, error.message);
      calendarioContainer.innerHTML = '<p aria-live="assertive" tabindex="-1" style="color:#d32f2f;">Erro ao carregar eventos. Tente novamente mais tarde.</p>';
      hideLoading(calendarioContainer);
    });
  }

  // Formulário de contato (usado em contato.html)
  const formContato = document.getElementById('form-contato');
  if (formContato) {
    let submitLock = false;
    const errorMessage = document.getElementById('error-message');

    // Oculta erro ao digitar
    formContato.addEventListener('input', () => {
      if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        errorMessage.classList.add('hidden');
        errorMessage.removeAttribute('aria-live');
        errorMessage.removeAttribute('tabindex');
      }
    });

    formContato.addEventListener('submit', function(e) {
      e.preventDefault();
      if (submitLock) return;
      submitLock = true;

      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('email').value.trim();
      const mensagem = document.getElementById('mensagem').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!nome || !email || !mensagem) {
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, preencha todos os campos.';
          errorMessage.style.display = 'block';
          errorMessage.classList.remove('hidden');
          errorMessage.setAttribute('aria-live', 'assertive');
          errorMessage.setAttribute('tabindex', '-1');
          errorMessage.focus();
        } else {
          alert('Por favor, preencha todos os campos.');
        }
        submitLock = false;
        return;
      }
      if (!emailRegex.test(email)) {
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, insira um email válido.';
          errorMessage.style.display = 'block';
          errorMessage.classList.remove('hidden');
          errorMessage.setAttribute('aria-live', 'assertive');
          errorMessage.setAttribute('tabindex', '-1');
          errorMessage.focus();
        } else {
          alert('Por favor, insira um email válido.');
        }
        submitLock = false;
        return;
      }

      db.collection('mensagens').add({
        nome,
        email,
        mensagem,
        data: new Date().toISOString()
      }).then(() => {
        if (errorMessage) {
          errorMessage.style.display = 'none';
          errorMessage.classList.add('hidden');
          errorMessage.removeAttribute('aria-live');
          errorMessage.removeAttribute('tabindex');
        }
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        formContato.reset();
      }).catch(error => {
        if (errorMessage) {
          errorMessage.textContent = 'Erro ao enviar mensagem: ' + error.message;
          errorMessage.style.display = 'block';
          errorMessage.classList.remove('hidden');
          errorMessage.setAttribute('aria-live', 'assertive');
          errorMessage.setAttribute('tabindex', '-1');
          errorMessage.focus();
        } else {
          alert('Erro ao enviar mensagem: ' + error.message);
        }
      }).finally(() => {
        submitLock = false;
      });
    });
  }
});
