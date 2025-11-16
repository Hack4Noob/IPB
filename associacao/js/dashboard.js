const db = firebase.firestore();
const auth = firebase.auth();

let currentUser = null;
let isAdmin = false;

const cld = cloudinary.Cloudinary.new({ cloud_name: 'YOUR_CLOUD_NAME' });

// Auth state listener
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    try {
      const userDoc = await db.collection('usuarios').doc(user.uid).get();
      const userData = userDoc.data();
      
      if (userData) {
        isAdmin = userData.role === 'admin';
        document.getElementById('user-area').innerHTML = `<a href="/login.html">${userData.nome} (Sair)</a>`;
        
        // Show/hide admin controls
        if (isAdmin) {
          document.querySelectorAll('.admin-controls').forEach(el => el.style.display = 'flex');
          initializeCloudinaryWidget();
        }
        
        // Load content
        loadAllContent();
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  } else {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('access-denied').style.display = 'block';
  }
});

function initializeCloudinaryWidget() {
  const uploadWidget = cld.upload({ tags: 'browser_upload' });
  
  document.getElementById('add-galeria-btn').addEventListener('click', () => {
    document.getElementById('galeria-form-container').style.display = 'block';
    uploadWidget.open();
  });
  
  uploadWidget.addEventListener('success', (result) => {
    document.getElementById('galeria-foto-url').value = result.info.secure_url;
    console.log('Imagem enviada:', result.info.secure_url);
  });
}

// Sidebar navigation
document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', () => {
    const section = link.getAttribute('data-section');
    
    // Update active state
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    // Show/hide sections
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(section).classList.add('active');
  });
});

// GALERIA
document.getElementById('add-galeria-btn')?.addEventListener('click', () => {
  document.getElementById('galeria-form-container').style.display = 'block';
});

document.getElementById('cancel-galeria')?.addEventListener('click', () => {
  document.getElementById('galeria-form-container').style.display = 'none';
  document.getElementById('galeria-form').reset();
});

document.getElementById('galeria-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const titulo = document.getElementById('galeria-titulo').value;
  const descricao = document.getElementById('galeria-descricao').value;
  const categoria = document.getElementById('galeria-categoria').value;
  const fotoUrl = document.getElementById('galeria-foto-url').value;
  
  if (!titulo || !categoria || !fotoUrl) {
    alert('Preencha todos os campos obrigatórios');
    return;
  }
  
  try {
    await db.collection('galeria').add({
      titulo,
      descricao,
      categoria,
      url: fotoUrl,
      autorId: currentUser.uid,
      autorNome: currentUser.displayName || currentUser.email,
      dataUpload: new Date().toISOString(),
      isPublic: true
    });
    
    document.getElementById('galeria-form').reset();
    document.getElementById('galeria-form-container').style.display = 'none';
    loadGaleria();
  } catch (error) {
    console.error('Erro ao adicionar foto:', error);
    alert('Erro ao adicionar foto');
  }
});

async function loadGaleria() {
  const container = document.getElementById('galeria-container');
  container.innerHTML = '';
  
  try {
    const snapshot = await db.collection('galeria').where('isPublic', '==', true).orderBy('dataUpload', 'desc').get();
    
    if (snapshot.empty) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">Nenhuma foto na galeria</p>';
      return;
    }
    
    snapshot.forEach(doc => {
      const foto = doc.data();
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.innerHTML = `
        <img src="${foto.url}" alt="${foto.titulo}" class="gallery-item-image">
        <div class="gallery-item-info">
          <div class="gallery-item-title">${foto.titulo}</div>
          <span class="gallery-item-category">${foto.categoria}</span>
        </div>
      `;
      
      if (isAdmin) {
        div.innerHTML += `
          <div class="post-actions">
            <button class="btn btn-danger delete-item" data-id="${doc.id}" data-type="galeria">
              <i class="fas fa-trash"></i> Deletar
            </button>
          </div>
        `;
      }
      
      container.appendChild(div);
    });
    
    setupDeleteButtons();
  } catch (error) {
    console.error('Erro ao carregar galeria:', error);
  }
}

// NOTÍCIAS
document.getElementById('add-noticia-btn')?.addEventListener('click', () => {
  document.getElementById('noticias-form-container').style.display = 'block';
});

document.getElementById('cancel-noticia')?.addEventListener('click', () => {
  document.getElementById('noticias-form-container').style.display = 'none';
  document.getElementById('noticias-form').reset();
});

document.getElementById('noticias-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const titulo = document.getElementById('noticia-titulo').value;
  const conteudo = document.getElementById('noticia-conteudo').value;
  const imagemUrl = document.getElementById('noticia-imagem-url').value;
  
  if (!titulo || !conteudo) {
    alert('Preencha título e conteúdo');
    return;
  }
  
  try {
    await db.collection('noticias').add({
      titulo,
      conteudo,
      imagemUrl: imagemUrl || null,
      autorId: currentUser.uid,
      autorNome: currentUser.displayName || currentUser.email,
      dataCriacao: new Date().toISOString(),
      isPublic: true
    });
    
    document.getElementById('noticias-form').reset();
    document.getElementById('noticias-form-container').style.display = 'none';
    loadNoticias();
  } catch (error) {
    console.error('Erro ao adicionar notícia:', error);
    alert('Erro ao adicionar notícia');
  }
});

async function loadNoticias() {
  const container = document.getElementById('noticias-container');
  container.innerHTML = '';
  
  try {
    const snapshot = await db.collection('noticias').where('isPublic', '==', true).orderBy('dataCriacao', 'desc').limit(20).get();
    
    if (snapshot.empty) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">Nenhuma notícia publicada</p>';
      return;
    }
    
    snapshot.forEach(doc => {
      const noticia = doc.data();
      const div = document.createElement('div');
      div.className = 'post-card';
      div.innerHTML = `
        ${noticia.imagemUrl ? `<img src="${noticia.imagemUrl}" alt="${noticia.titulo}" class="post-image">` : ''}
        <div class="post-content">
          <div class="post-title">${noticia.titulo}</div>
          <div class="post-meta">Por ${noticia.autorNome} em ${new Date(noticia.dataCriacao).toLocaleDateString('pt-BR')}</div>
          <div class="post-text">${noticia.conteudo}</div>
        </div>
      `;
      
      if (isAdmin) {
        div.innerHTML += `
          <div class="post-actions">
            <button class="btn btn-danger delete-item" data-id="${doc.id}" data-type="noticias">
              <i class="fas fa-trash"></i> Deletar
            </button>
          </div>
        `;
      }
      
      container.appendChild(div);
    });
    
    setupDeleteButtons();
  } catch (error) {
    console.error('Erro ao carregar notícias:', error);
  }
}

// ANÚNCIOS
document.getElementById('add-anuncio-btn')?.addEventListener('click', () => {
  document.getElementById('anuncios-form-container').style.display = 'block';
});

document.getElementById('cancel-anuncio')?.addEventListener('click', () => {
  document.getElementById('anuncios-form-container').style.display = 'none';
  document.getElementById('anuncios-form').reset();
});

document.getElementById('anuncios-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const titulo = document.getElementById('anuncio-titulo').value;
  const conteudo = document.getElementById('anuncio-conteudo').value;
  const imagemUrl = document.getElementById('anuncio-imagem-url').value;
  
  if (!titulo || !conteudo) {
    alert('Preencha título e descrição');
    return;
  }
  
  try {
    await db.collection('anuncios').add({
      titulo,
      conteudo,
      imagemUrl: imagemUrl || null,
      autorId: currentUser.uid,
      autorNome: currentUser.displayName || currentUser.email,
      dataCriacao: new Date().toISOString(),
      isPublic: true
    });
    
    document.getElementById('anuncios-form').reset();
    document.getElementById('anuncios-form-container').style.display = 'none';
    loadAnuncios();
  } catch (error) {
    console.error('Erro ao adicionar anúncio:', error);
    alert('Erro ao adicionar anúncio');
  }
});

async function loadAnuncios() {
  const container = document.getElementById('anuncios-container');
  container.innerHTML = '';
  
  try {
    const snapshot = await db.collection('anuncios').where('isPublic', '==', true).orderBy('dataCriacao', 'desc').limit(20).get();
    
    if (snapshot.empty) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">Nenhum anúncio publicado</p>';
      return;
    }
    
    snapshot.forEach(doc => {
      const anuncio = doc.data();
      const div = document.createElement('div');
      div.className = 'post-card';
      div.innerHTML = `
        ${anuncio.imagemUrl ? `<img src="${anuncio.imagemUrl}" alt="${anuncio.titulo}" class="post-image">` : ''}
        <div class="post-content">
          <div class="post-title">${anuncio.titulo}</div>
          <div class="post-meta">Por ${anuncio.autorNome} em ${new Date(anuncio.dataCriacao).toLocaleDateString('pt-BR')}</div>
          <div class="post-text">${anuncio.conteudo}</div>
        </div>
      `;
      
      if (isAdmin) {
        div.innerHTML += `
          <div class="post-actions">
            <button class="btn btn-danger delete-item" data-id="${doc.id}" data-type="anuncios">
              <i class="fas fa-trash"></i> Deletar
            </button>
          </div>
        `;
      }
      
      container.appendChild(div);
    });
    
    setupDeleteButtons();
  } catch (error) {
    console.error('Erro ao carregar anúncios:', error);
  }
}

// CURSOS
document.getElementById('add-curso-btn')?.addEventListener('click', () => {
  document.getElementById('cursos-form-container').style.display = 'block';
});

document.getElementById('cancel-curso')?.addEventListener('click', () => {
  document.getElementById('cursos-form-container').style.display = 'none';
  document.getElementById('cursos-form').reset();
});

document.getElementById('cursos-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const titulo = document.getElementById('curso-titulo').value;
  const descricao = document.getElementById('curso-descricao').value;
  const duracao = parseInt(document.getElementById('curso-duracao').value);
  const imagemUrl = document.getElementById('curso-imagem-url').value;
  
  if (!titulo || !descricao || !duracao) {
    alert('Preencha todos os campos obrigatórios');
    return;
  }
  
  try {
    await db.collection('cursos').add({
      nome: titulo,
      descricao,
      duracao,
      imagem: imagemUrl || null,
      autorId: currentUser.uid,
      dataCriacao: new Date().toISOString(),
      isPublic: true
    });
    
    document.getElementById('cursos-form').reset();
    document.getElementById('cursos-form-container').style.display = 'none';
    loadCursos();
  } catch (error) {
    console.error('Erro ao adicionar curso:', error);
    alert('Erro ao adicionar curso');
  }
});

async function loadCursos() {
  const container = document.getElementById('cursos-container');
  container.innerHTML = '';
  
  try {
    const snapshot = await db.collection('cursos').where('isPublic', '==', true).get();
    
    if (snapshot.empty) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">Nenhum curso publicado</p>';
      return;
    }
    
    snapshot.forEach(doc => {
      const curso = doc.data();
      const div = document.createElement('div');
      div.className = 'post-card';
      div.innerHTML = `
        ${curso.imagem ? `<img src="${curso.imagem}" alt="${curso.nome}" class="post-image">` : ''}
        <div class="post-content">
          <div class="post-title">${curso.nome}</div>
          <div class="post-meta">Duração: ${curso.duracao} ano(s)</div>
          <div class="post-text">${curso.descricao}</div>
        </div>
      `;
      
      if (isAdmin) {
        div.innerHTML += `
          <div class="post-actions">
            <button class="btn btn-danger delete-item" data-id="${doc.id}" data-type="cursos">
              <i class="fas fa-trash"></i> Deletar
            </button>
          </div>
        `;
      }
      
      container.appendChild(div);
    });
    
    setupDeleteButtons();
  } catch (error) {
    console.error('Erro ao carregar cursos:', error);
  }
}

// EVENTOS
document.getElementById('add-evento-btn')?.addEventListener('click', () => {
  document.getElementById('eventos-form-container').style.display = 'block';
});

document.getElementById('cancel-evento')?.addEventListener('click', () => {
  document.getElementById('eventos-form-container').style.display = 'none';
  document.getElementById('eventos-form').reset();
});

document.getElementById('eventos-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const titulo = document.getElementById('evento-titulo').value;
  const descricao = document.getElementById('evento-descricao').value;
  const data = document.getElementById('evento-data').value;
  const imagemUrl = document.getElementById('evento-imagem-url').value;
  
  if (!titulo || !descricao || !data) {
    alert('Preencha todos os campos obrigatórios');
    return;
  }
  
  try {
    await db.collection('eventos').add({
      titulo,
      descricao,
      data: new Date(data).toISOString(),
      imagemUrl: imagemUrl || null,
      autorId: currentUser.uid,
      dataCriacao: new Date().toISOString(),
      isPublic: true
    });
    
    document.getElementById('eventos-form').reset();
    document.getElementById('eventos-form-container').style.display = 'none';
    loadEventos();
  } catch (error) {
    console.error('Erro ao adicionar evento:', error);
    alert('Erro ao adicionar evento');
  }
});

async function loadEventos() {
  const container = document.getElementById('eventos-container');
  container.innerHTML = '';
  
  try {
    const snapshot = await db.collection('eventos').where('isPublic', '==', true).orderBy('data', 'asc').limit(20).get();
    
    if (snapshot.empty) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">Nenhum evento publicado</p>';
      return;
    }
    
    snapshot.forEach(doc => {
      const evento = doc.data();
      const div = document.createElement('div');
      div.className = 'post-card';
      div.innerHTML = `
        ${evento.imagemUrl ? `<img src="${evento.imagemUrl}" alt="${evento.titulo}" class="post-image">` : ''}
        <div class="post-content">
          <div class="post-title">${evento.titulo}</div>
          <div class="post-meta">Data: ${new Date(evento.data).toLocaleDateString('pt-BR')} às ${new Date(evento.data).toLocaleTimeString('pt-BR')}</div>
          <div class="post-text">${evento.descricao}</div>
        </div>
      `;
      
      if (isAdmin) {
        div.innerHTML += `
          <div class="post-actions">
            <button class="btn btn-danger delete-item" data-id="${doc.id}" data-type="eventos">
              <i class="fas fa-trash"></i> Deletar
            </button>
          </div>
        `;
      }
      
      container.appendChild(div);
    });
    
    setupDeleteButtons();
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
  }
}

// Delete functionality
function setupDeleteButtons() {
  document.querySelectorAll('.delete-item').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Tem certeza que deseja deletar este item?')) {
        const docId = btn.getAttribute('data-id');
        const type = btn.getAttribute('data-type');
        
        try {
          await db.collection(type).doc(docId).delete();
          
          if (type === 'galeria') loadGaleria();
          else if (type === 'noticias') loadNoticias();
          else if (type === 'anuncios') loadAnuncios();
          else if (type === 'cursos') loadCursos();
          else if (type === 'eventos') loadEventos();
        } catch (error) {
          console.error('Erro ao deletar:', error);
          alert('Erro ao deletar item');
        }
      }
    });
  });
}

// Load all content on page load
async function loadAllContent() {
  loadGaleria();
  loadNoticias();
  loadAnuncios();
  loadCursos();
  loadEventos();
}
