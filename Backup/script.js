// Menu Mobile: Alterna a visibilidade do menu em telas menores
document.querySelector('.mobile-menu')?.addEventListener('click', function() {
  document.querySelector('nav').classList.toggle('active');
});

// Carregar conteúdo dinâmico ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar Firebase (certifique-se de que firebase-config.js está incluído)
  const db = firebase.firestore();
  const auth = firebase.auth();

  console.log('0. Iniciando script.js - Firebase inicializado.');

  // Páginas públicas onde não deve haver redirecionamento automático
  const publicPages = ['/index.html', '/sobre.html', '/cursos.html', '/contato.html', '/cadastro.html', '/login.html'];

  // Verificar autenticação e personalizar menu
  auth.onAuthStateChanged(user => {
    let currentPage = window.location.pathname;
    console.log('1. onAuthStateChanged - Tipo de user:', typeof user, 'Usuário:', user, 'Página atual:', currentPage);

    // Normalizar currentPage para remover prefixos
    currentPage = currentPage.replace(/^\/primary:[^\/]+/, '');

    const userArea = document.getElementById('user-area');
    const userWelcome = document.getElementById('user-welcome');
    const loginBtn = document.getElementById('login-btn');
    const initializeBtn = document.getElementById('initialize-btn');

    if (user && typeof user === 'object' && user.uid) {
      console.log('2. Usuário autenticado:', { uid: user.uid, email: user.email, displayName: user.displayName });
      // Buscar role no Firestore
      db.collection('usuarios').doc(user.uid).get()
        .then((doc) => {
          if (doc.exists) {
            const role = doc.data().role;
            console.log('3. Role obtido do Firestore:', role);
            proceedWithRedirect(role, currentPage, user, userArea, userWelcome, loginBtn, initializeBtn);
          } else {
            console.warn('4. Documento do usuário não encontrado no Firestore para uid:', user.uid);
            console.log('4.1. Criando documento em usuarios para uid:', user.uid);
            const userData = {
              id: user.uid,
              nome: user.displayName || 'Usuário Sem Nome',
              email: user.email,
              role: 'aluno'
            };
            db.collection('usuarios').doc(user.uid).set(userData)
              .then(() => {
                console.log('4.2. Documento criado em usuarios:', userData);
                proceedWithRedirect(userData.role, currentPage, user, userArea, userWelcome, loginBtn, initializeBtn);
              })
              .catch(error => {
                console.error('4.3. Erro ao criar documento em usuarios:', error.code, error.message);
                alert('Erro ao criar perfil de usuário: ' + error.message + '. Por favor, tente novamente ou contate o suporte.');
                console.log('4.4. Permanece na página atual:', currentPage);
              });
          }
        })
        .catch((error) => {
          console.error('5. Erro ao buscar role no Firestore:', error.code, error.message);
          alert('Erro ao verificar permissões: ' + error.message + '. Por favor, tente novamente ou contate o suporte.');
          console.log('5.1. Permanece na página atual:', currentPage);
        });
    } else {
      console.log('6. Nenhum usuário autenticado ou user inválido:', user);
      if (!publicPages.some(page => currentPage.endsWith(page))) {
        console.log('6.1. Redirecionando para /login.html.');
        window.location.href = '/login.html';
      } else {
        console.log('6.2. Página pública, sem redirecionamento:', currentPage);
      }

      if (userArea) {
        userArea.innerHTML = `<a href="/login.html">Área do Usuário</a>`;
      }
      if (userWelcome) {
        userWelcome.style.display = 'none';
      }
      if (loginBtn) {
        loginBtn.href = '/login.html';
        loginBtn.textContent = 'Acesse o Sistema';
      }
      if (initializeBtn) {
        initializeBtn.style.display = 'none';
      }
    }
  });

  // Função auxiliar para redirecionamento
  function proceedWithRedirect(role, currentPage, user, userArea, userWelcome, loginBtn, initializeBtn) {
    let dashboardUrl;
    if (role === 'admin') {
      dashboardUrl = '/admin/dashboard.html';
    } else if (role === 'secretaria') {
      dashboardUrl = '/secretaria/dashboard.html';
    } else if (role === 'professor') {
      dashboardUrl = '/professor/dashboard.html';
    } else if (role === 'aluno') {
      dashboardUrl = '/aluno/dashboard.html';
    } else {
      console.error('7. Role inválido:', role);
      alert('Erro: Permissão inválida. Faça login novamente.');
      console.log('7.1. Redirecionando para /login.html devido a role inválido.');
      auth.signOut();
      window.location.href = '/login.html';
      return;
    }

    console.log('8. URL do painel correspondente:', dashboardUrl);

    if (userArea) {
      userArea.innerHTML = `<a href="${dashboardUrl}">Bem-vindo, ${user.displayName || user.email}</a>`;
    }
    if (userWelcome) {
      userWelcome.style.display = 'block';
      userWelcome.innerHTML = `Olá, ${user.displayName || user.email}! Acesse seu <a href="${dashboardUrl}">painel</a>.`;
    }
    if (loginBtn) {
      loginBtn.href = dashboardUrl;
      loginBtn.textContent = 'Ir para o Painel';
    }
    if (initializeBtn && role === 'admin') {
      initializeBtn.style.display = 'inline-block';
      initializeBtn.addEventListener('click', () => {
        if (confirm('Deseja inicializar o banco de dados? Isso sobrescreverá os dados existentes.')) {
          initializeFirestore();
        }
      });
    }

    if (currentPage.endsWith(dashboardUrl)) {
      console.log('9. Já está na página correta, sem redirecionamento:', currentPage);
      return;
    }
    if (!publicPages.some(page => currentPage.endsWith(page)) || currentPage.endsWith('/login.html') || currentPage.endsWith('/cadastro.html')) {
      console.log('9. Executando redirecionamento para:', dashboardUrl);
      window.location.href = dashboardUrl;
    } else {
      console.log('9.1. Página pública, sem redirecionamento:', currentPage);
    }
  }

  // Dados de exemplo para inicializar coleções
  const noticiasData = [
    {
      id: 'noticia1',
      titulo: 'Inscrições Abertas para o Novo Semestre',
      resumo: 'As inscrições para o próximo semestre letivo já estão abertas. Garanta sua vaga!',
      data: new Date('2025-07-15'),
      imagem: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/noticia1.jpg'
    },
    {
      id: 'noticia2',
      titulo: 'Escola Ganha Prêmio de Excelência Educacional',
      resumo: 'Nossa escola foi premiada pelo terceiro ano consecutivo pelo MEC.',
      data: new Date('2025-07-10'),
      imagem: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/noticia2.jpg'
    },
    {
      id: 'noticia3',
      titulo: 'Feira de Ciências Atrai Mais de 500 Visitantes',
      resumo: 'Evento anual supera expectativas com projetos inovadores de alunos.',
      data: new Date('2025-07-05'),
      imagem: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/noticia3.jpg'
    }
  ];

  const eventosData = [
    {
      id: 'evento1',
      titulo: 'Reunião de Pais e Mestres',
      descricao: 'Encontro para alinhamento do semestre com os responsáveis.',
      data: new Date('2025-08-20')
    },
    {
      id: 'evento2',
      titulo: 'Olimpíada de Matemática',
      descricao: 'Competição anual entre os alunos do ensino médio.',
      data: new Date('2025-08-25')
    },
    {
      id: 'evento3',
      titulo: 'Feira Cultural Escolar',
      descricao: 'Evento cultural com apresentações e exposições.',
      data: new Date('2025-09-30')
    }
  ];

  const mensagensData = [
    {
      id: 'mensagem1',
      nome: 'João Silva',
      email: 'joao@example.com',
      mensagem: 'Gostaria de saber mais sobre os cursos oferecidos.',
      data: new Date('2025-09-26')
    }
  ];

  const alunosData = [
    {
      id: 'aluno123',
      nome: 'João Silva',
      matricula: '2025001',
      curso: 'Energias',
      email: 'joao@impb-angola.com'
    },
    {
      id: 'aluno124',
      nome: 'Maria Santos',
      matricula: '2025002',
      curso: 'Automação',
      email: 'maria@impb-angola.com'
    }
  ];

  const cursosData = [
    {
      id: 'curso1',
      nome: 'Energias Renováveis',
      duracao: 3,
      descricao: 'Curso técnico em energias renováveis.'
    },
    {
      id: 'curso2',
      nome: 'Automação Industrial',
      duracao: 3,
      descricao: 'Curso técnico em automação industrial.'
    }
  ];

  const usuariosData = [
    {
      id: 'admin1',
      nome: 'Admin Kambala',
      email: 'admin@impb-angola.com',
      role: 'admin'
    },
    {
      id: 'secretaria1',
      nome: 'Secretária Maria',
      email: 'secretaria@impb-angola.com',
      role: 'secretaria'
    },
    {
      id: 'prof123',
      nome: 'Ana Oliveira',
      email: 'ana@impb-angola.com',
      role: 'professor',
      disciplina: 'Psicopedagogia'
    }
  ];

  const turmasData = [
    {
      id: 'turma1',
      nome: '10A',
      cursoId: 'curso1',
      professorId: 'prof123',
      alunos: ['aluno123', 'aluno124']
    }
  ];

  const disciplinasData = [
    {
      id: 'disciplina1',
      nome: 'Matemática',
      cursoId: 'curso1',
      professorId: 'prof123'
    },
    {
      id: 'disciplina2',
      nome: 'Psicopedagogia',
      cursoId: 'curso2',
      professorId: 'prof123'
    }
  ];

  const notasData = [
    {
      id: 'nota1',
      alunoId: 'aluno123',
      disciplinaId: 'disciplina1',
      valor: 15,
      trimestre: 1
    },
    {
      id: 'nota2',
      alunoId: 'aluno124',
      disciplinaId: 'disciplina1',
      valor: 12,
      trimestre: 1
    }
  ];

  const presencasData = [
    {
      id: 'presenca1',
      alunoId: 'aluno123',
      disciplinaId: 'disciplina1',
      data: new Date('2025-09-26T08:00:00Z'),
      presente: true
    },
    {
      id: 'presenca2',
      alunoId: 'aluno124',
      disciplinaId: 'disciplina1',
      data: new Date('2025-09-26T08:00:00Z'),
      presente: false
    }
  ];

  const avisosData = [
    {
      id: 'aviso1',
      titulo: 'Prova de Matemática',
      mensagem: 'A prova será na próxima sexta-feira às 10h.',
      data: new Date('2025-09-26'),
      professorId: 'prof123'
    }
  ];

  const pagamentosData = [
    {
      id: 'pagamento1',
      alunoId: 'aluno123',
      valor: 50000,
      status: 'pago',
      data: new Date('2025-09-01')
    },
    {
      id: 'pagamento2',
      alunoId: 'aluno124',
      valor: 50000,
      status: 'pendente',
      data: new Date('2025-09-01')
    }
  ];

  const documentosData = [
    {
      id: 'documento1',
      alunoId: 'aluno123',
      url: 'https://res.cloudinary.com/your-cloud-name/document/upload/v1234567890/certificado.pdf',
      nome: 'Certificado de Conclusão',
      data: new Date('2025-09-26')
    }
  ];

  const configuracoesData = [
    {
      id: 'geral',
      nome: 'IMPB - Instituto Médio Politécnico da Graça',
      email: 'estanislauclassic@gmail.com',
      endereco: 'Rua da Educação, 123 - Bairro Nossa Senhora da Graça, Benguela, Angola',
      telefone: '(+244) 940525856'
    }
  ];

  // Função para preencher uma coleção
  async function populateCollection(collectionName, data) {
    console.log('10. Iniciando preenchimento da coleção:', collectionName);
    const batch = db.batch();
    for (const item of data) {
      const docRef = db.collection(collectionName).doc(item.id);
      batch.set(docRef, item);
    }
    try {
      await batch.commit();
      console.log(`11. Coleção ${collectionName} preenchida com sucesso!`);
    } catch (error) {
      console.error(`12. Erro ao preencher coleção ${collectionName}:`, error.code, error.message);
      throw error;
    }
  }

  // Função para inicializar todas as coleções
  async function initializeFirestore() {
    console.log('13. Iniciando inicialização do Firestore...');
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('14. Usuário não está logado para inicializar coleções.');
        alert('Você precisa estar logado como administrador para inicializar as coleções.');
        return;
      }
      const userDoc = await db.collection('usuarios').doc(user.uid).get();
      if (!userDoc.exists || userDoc.data().role !== 'admin') {
        console.log('15. Usuário não é administrador ou documento não existe:', user.uid);
        alert('Apenas administradores podem inicializar as coleções.');
        return;
      }

      await populateCollection('noticias', noticiasData);
      await populateCollection('eventos', eventosData);
      await populateCollection('mensagens', mensagensData);
      await populateCollection('alunos', alunosData);
      await populateCollection('cursos', cursosData);
      await populateCollection('usuarios', usuariosData);
      await populateCollection('turmas', turmasData);
      await populateCollection('disciplinas', disciplinasData);
      await populateCollection('notas', notasData);
      await populateCollection('presencas', presencasData);
      await populateCollection('avisos', avisosData);
      await populateCollection('pagamentos', pagamentosData);
      await populateCollection('documentos', documentosData);
      await populateCollection('configuracoes', configuracoesData);
      
      console.log('16. Todas as coleções foram preenchidas com sucesso!');
      alert('Todas as coleções foram preenchidas com sucesso!');
    } catch (error) {
      console.error('17. Erro ao preencher coleções:', error.code, error.message);
      alert('Erro ao inicializar coleções: ' + error.message);
    }
  }

  // Formulário de cadastro (usado em cadastro.html)
  const cadastroForm = document.getElementById('cadastro-form');
  if (cadastroForm) {
    console.log('18. Formulário de cadastro encontrado.');
    const tipoUsuario = document.getElementById('tipo-usuario');
    const disciplinaLabel = document.getElementById('disciplina-label');
    const disciplinaInput = document.getElementById('disciplina');
    const errorMessage = document.getElementById('error-message');

    tipoUsuario.addEventListener('change', () => {
      console.log('19. Tipo de usuário selecionado:', tipoUsuario.value);
      if (tipoUsuario.value === 'professor') {
        disciplinaLabel.style.display = 'block';
        disciplinaInput.style.display = 'block';
        disciplinaInput.required = true;
      } else {
        disciplinaLabel.style.display = 'none';
        disciplinaInput.style.display = 'none';
        disciplinaInput.required = false;
        disciplinaInput.value = '';
      }
    });

    cadastroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('20. Formulário de cadastro submetido.');

      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('email').value.trim();
      const senha = document.getElementById('senha').value.trim();
      const tipoUsuarioValue = tipoUsuario.value;
      const disciplina = disciplinaInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      console.log('21. Dados do formulário:', { nome, email, senha, tipoUsuario: tipoUsuarioValue, disciplina });

      if (!nome || !email || !senha || !tipoUsuarioValue) {
        console.log('22. Erro: Campos obrigatórios não preenchidos.');
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, preencha todos os campos obrigatórios.';
          errorMessage.style.display = 'block';
          errorMessage.classList.remove('hidden');
        } else {
          alert('Por favor, preencha todos os campos obrigatórios.');
        }
        return;
      }
      if (!emailRegex.test(email)) {
        console.log('22. Erro: Email inválido.');
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, insira um email válido.';
          errorMessage.style.display = 'block';
          errorMessage.classList.remove('hidden');
        } else {
          alert('Por favor, insira um email válido.');
        }
        return;
      }
      if (senha.length < 6) {
        console.log('22. Erro: Senha muito curta.');
        if (errorMessage) {
          errorMessage.textContent = 'A senha deve ter no mínimo 6 caracteres.';
          errorMessage.style.display = 'block';
          errorMessage.classList.remove('hidden');
        } else {
          alert('A senha deve ter no mínimo 6 caracteres.');
        }
        return;
      }
      if (tipoUsuarioValue === 'professor' && !disciplina) {
        console.log('22. Erro: Disciplina não informada para professor.');
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, informe a disciplina para professores.';
          errorMessage.style.display = 'block';
          errorMessage.classList.remove('hidden');
        } else {
          alert('Por favor, informe a disciplina para professores.');
        }
        return;
      }

      try {
        console.log('23. Criando usuário no Firebase Authentication...');
        const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        console.log('24. Usuário criado:', { uid: user.uid, email: user.email });

        console.log('25. Atualizando perfil com nome:', nome);
        await user.updateProfile({ displayName: nome });
        console.log('26. Perfil atualizado.');

        console.log('27. Salvando documento na coleção usuarios...');
        const userData = {
          id: user.uid,
          nome,
          email,
          role: tipoUsuarioValue
        };
        if (tipoUsuarioValue === 'professor') {
          userData.disciplina = disciplina;
        }
        await db.collection('usuarios').doc(user.uid).set(userData);
        console.log('28. Documento salvo em usuarios:', userData);

        if (tipoUsuarioValue === 'aluno') {
          console.log('29. Salvando documento na coleção alunos...');
          const alunoData = {
            id: user.uid,
            nome,
            email,
            matricula: 'TEMP-' + Date.now(),
            curso: ''
          };
          await db.collection('alunos').doc(user.uid).set(alunoData);
          console.log('30. Documento salvo em alunos:', alunoData);
        }

        console.log('31. Cadastro concluído com sucesso.');
        if (errorMessage) {
          errorMessage.style.display = 'none';
          errorMessage.classList.add('hidden');
        }
        alert('Conta criada com sucesso! Redirecionando para o painel...');
        const dashboardUrl = tipoUsuarioValue === 'admin' ? '/admin/dashboard.html' :
                            tipoUsuarioValue === 'secretaria' ? '/secretaria/dashboard.html' :
                            tipoUsuarioValue === 'professor' ? '/professor/dashboard.html' :
                            '/aluno/dashboard.html';
        console.log('31.1. Redirecionando para:', dashboardUrl);
        window.location.href = dashboardUrl;
      } catch (error) {
        console.error('32. Erro ao criar conta:', error.code, error.message);
        if (errorMessage) {
          errorMessage.textContent = 'Erro ao criar conta: ' + error.message;
          errorMessage.style.display = 'block';
          errorMessage.classList.remove('hidden');
        } else {
          alert('Erro ao criar conta: ' + error.message);
        }
      }
    });
  }

  // Autenticação (usado em login.html)
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    console.log('33. Formulário de login encontrado.');
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const usuario = document.getElementById('usuario').value.trim();
      const senha = document.getElementById('senha').value.trim();
      const errorMessage = document.getElementById('error-message');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      console.log('34. Tentativa de login - Email:', usuario, 'Senha:', senha);

      if (!usuario || !senha) {
        console.log('35. Erro: Campos obrigatórios não preenchidos.');
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, preencha todos os campos.';
          errorMessage.style.display = 'block';
          errorMessage.classList.remove('hidden');
        } else {
          alert('Por favor, preencha todos os campos.');
        }
        return;
      }
      if (!emailRegex.test(usuario)) {
        console.log('35. Erro: Email inválido como usuário.');
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, insira um email válido como usuário.';
          errorMessage.style.display = 'block';
          errorMessage.classList.remove('hidden');
        } else {
          alert('Por favor, insira um email válido como usuário.');
        }
        return;
      }
      auth.signInWithEmailAndPassword(usuario, senha)
        .then(userCredential => {
          console.log('36. Login bem-sucedido:', { uid: userCredential.user.uid, email: userCredential.user.email });
          if (errorMessage) {
            errorMessage.style.display = 'none';
            errorMessage.classList.add('hidden');
          }
          alert('Login bem-sucedido! Redirecionando...');
        })
        .catch(error => {
          console.error('37. Erro ao fazer login - Código:', error.code, 'Mensagem:', error.message);
          if (errorMessage) {
            errorMessage.textContent = `Erro: ${error.message}`;
            errorMessage.style.display = 'block';
            errorMessage.classList.remove('hidden');
          } else {
            alert('Erro ao fazer login: ' + error.message);
          }
        });
    });
  }

  // Carregar notícias do Firestore (exemplo)
  const noticiasContainer = document.getElementById('noticias-container');
  if (noticiasContainer) {
    console.log('38. Carregando notícias do Firestore...');
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
              <a href="#">Leia mais</a>
            </div>
          </div>
        `;
        noticiasContainer.appendChild(noticiaCard);
      });
    }).catch(error => {
      console.error('40. Erro ao carregar notícias:', error.code, error.message);
      noticiasContainer.innerHTML = '<p>Erro ao carregar notícias. Tente novamente mais tarde.</p>';
    });
  }

  // Carregar eventos do Firestore
  const calendarioContainer = document.getElementById('calendario');
  if (calendarioContainer) {
    console.log('41. Carregando eventos do Firestore...');
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
    }).catch(error => {
      console.error('43. Erro ao carregar eventos:', error.code, error.message);
      calendarioContainer.innerHTML = '<p>Erro ao carregar eventos. Tente novamente mais tarde.</p>';
    });
  }

  // Formulário de contato (usado em contato.html)
  const formContato = document.getElementById('form-contato');
  if (formContato) {
    console.log('44. Formulário de contato encontrado.');
    formContato.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('45. Formulário de contato submetido.');
      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('email').value.trim();
      const mensagem = document.getElementById('mensagem').value.trim();
      const errorMessage = document.getElementById('error-message');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      console.log('46. Dados do formulário de contato:', { nome, email, mensagem });

      if (!nome || !email || !mensagem) {
        console.log('47. Erro: Campos obrigatórios não preenchidos.');
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, preencha todos os campos.';
          errorMessage.style.display = 'block';
          errorMessage.classList.remove('hidden');
        } else {
          alert('Por favor, preencha todos os campos.');
        }
        return;
      }
      if (!emailRegex.test(email)) {
        console.log('47. Erro: Email inválido.');
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, insira um email válido.';
          errorMessage.style.display = 'block';
          errorMessage.classList.remove('hidden');
        } else {
          alert('Por favor, insira um email válido.');
        }
        return;
      }

      db.collection('mensagens').add({
        nome,
        email,
        mensagem,
        data: new Date().toISOString()
      }).then(() => {
        console.log('48. Mensagem enviada com sucesso.');
        if (errorMessage) {
          errorMessage.style.display = 'none';
          errorMessage.classList.add('hidden');
        }
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        formContato.reset();
      }).catch(error => {
        console.error('49. Erro ao enviar mensagem:', error.code, error.message);
        if (errorMessage) {
          errorMessage.textContent = 'Erro ao enviar mensagem: ' + error.message;
          errorMessage.style.display = 'block';
          errorMessage.classList.remove('hidden');
        } else {
          alert('Erro ao enviar mensagem: ' + error.message);
        }
      });
    });
  }

  // Função para atualizar tabelas com Firestore
  function updateTable(tableId, collection, fields, editHandler, deleteHandler) {
    console.log('50. Atualizando tabela:', tableId, 'Coleção:', collection);
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) {
      console.log('51. Tabela não encontrada:', tableId);
      return;
    }
    tbody.innerHTML = '';
    db.collection(collection).get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const item = { id: doc.id, ...doc.data() };
        console.log('52. Item carregado para tabela:', item);
        const row = document.createElement('tr');
        fields.forEach(field => {
          const cell = document.createElement('td');
          cell.textContent = item[field] || '';
          row.appendChild(cell);
        });
        const actionsCell = document.createElement('td');
        actionsCell.className = 'action-buttons';
        actionsCell.innerHTML = `
          <button class="edit-btn" data-id="${item.id}" aria-label="Editar"><i class="fas fa-edit"></i></button>
          <button class="delete-btn" data-id="${item.id}" aria-label="Excluir"><i class="fas fa-trash"></i></button>
        `;
        row.appendChild(actionsCell);
        tbody.appendChild(row);
      });

      tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          console.log('53. Botão de edição clicado para ID:', btn.dataset.id);
          editHandler(btn.dataset.id);
        });
      });
      tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          console.log('54. Botão de exclusão clicado para ID:', btn.dataset.id);
          deleteHandler(btn.dataset.id);
        });
      });
    }).catch(error => {
      console.error('55. Erro ao carregar dados para tabela:', error.code, error.message);
    });
  }

  // Gerenciar Alunos (usado em secretaria/alunos.html)
  const alunoForm = document.getElementById('aluno-form');
  if (alunoForm) {
    console.log('56. Formulário de aluno encontrado.');
    updateTable('alunos-table', 'alunos', ['nome', 'matricula', 'curso'], 
      (id) => {
        console.log('57. Editando aluno com ID:', id);
        db.collection('alunos').doc(id).get().then(doc => {
          const aluno = doc.data();
          console.log('58. Dados do aluno:', aluno);
          document.getElementById('aluno-nome').value = aluno.nome;
          document.getElementById('aluno-matricula').value = aluno.matricula;
          document.getElementById('aluno-curso').value = aluno.curso;
          alunoForm.dataset.editId = id;
        });
      },
      (id) => {
        console.log('59. Solicitando exclusão do aluno com ID:', id);
        if (confirm('Deseja excluir este aluno?')) {
          db.collection('alunos').doc(id).delete()
            .then(() => {
              console.log('60. Aluno excluído com sucesso:', id);
              updateTable('alunos-table', 'alunos', ['nome', 'matricula', 'curso']);
            })
            .catch(error => {
              console.error('61. Erro ao excluir aluno:', error.code, error.message);
              alert('Erro ao excluir aluno: ' + error.message);
            });
        }
      }
    );

    alunoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('62. Formulário de aluno submetido.');
      const nome = document.getElementById('aluno-nome').value.trim();
      const matricula = document.getElementById('aluno-matricula').value.trim();
      const curso = document.getElementById('aluno-curso').value;
      console.log('63. Dados do formulário de aluno:', { nome, matricula, curso });
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!nome || !matricula || !curso) {
        console.log('64. Erro: Campos obrigatórios não preenchidos.');
        alert('Por favor, preencha todos os campos.');
        return;
      }
      if (alunoForm.dataset.editId) {
        const id = alunoForm.dataset.editId;
        console.log('65. Atualizando aluno com ID:', id);
        db.collection('alunos').doc(id).update({ nome, matricula, curso })
          .then(() => {
            console.log('66. Aluno atualizado com sucesso:', id);
            updateTable('alunos-table', 'alunos', ['nome', 'matricula', 'curso']);
            alunoForm.reset();
            delete alunoForm.dataset.editId;
          })
          .catch(error => {
            console.error('67. Erro ao editar aluno:', error.code, error.message);
            alert('Erro ao editar aluno: ' + error.message);
          });
      } else {
        console.log('68. Adicionando novo aluno...');
        db.collection('alunos').add({ nome, matricula, curso })
          .then(docRef => {
            console.log('69. Novo aluno adicionado com ID:', docRef.id);
            db.collection('alunos').doc(docRef.id).update({ id: docRef.id });
            updateTable('alunos-table', 'alunos', ['nome', 'matricula', 'curso']);
            alunoForm.reset();
          })
          .catch(error => {
            console.error('70. Erro ao adicionar aluno:', error.code, error.message);
            alert('Erro ao adicionar aluno: ' + error.message);
          });
      }
    });
  }

  // Gerenciar Professores (usado em admin/usuarios.html para professores)
  const professorForm = document.getElementById('professor-form');
  if (professorForm) {
    console.log('71. Formulário de professor encontrado.');
    updateTable('professores-table', 'usuarios', ['nome', 'email', 'disciplina'],
      (id) => {
        console.log('72. Editando professor com ID:', id);
        db.collection('usuarios').doc(id).get().then(doc => {
          const professor = doc.data();
          console.log('73. Dados do professor:', professor);
          document.getElementById('professor-nome').value = professor.nome;
          document.getElementById('professor-email').value = professor.email;
          document.getElementById('professor-disciplina').value = professor.disciplina;
          professorForm.dataset.editId = id;
        });
      },
      (id) => {
        console.log('74. Solicitando exclusão do professor com ID:', id);
        if (confirm('Deseja excluir este professor?')) {
          db.collection('usuarios').doc(id).delete()
            .then(() => {
              console.log('75. Professor excluído com sucesso:', id);
              updateTable('professores-table', 'usuarios', ['nome', 'email', 'disciplina']);
            })
            .catch(error => {
              console.error('76. Erro ao excluir professor:', error.code, error.message);
              alert('Erro ao excluir professor: ' + error.message);
            });
        }
      }
    );

    professorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('77. Formulário de professor submetido.');
      const nome = document.getElementById('professor-nome').value.trim();
      const email = document.getElementById('professor-email').value.trim();
      const disciplina = document.getElementById('professor-disciplina').value.trim();
      console.log('78. Dados do formulário de professor:', { nome, email, disciplina });
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!nome || !email || !disciplina) {
        console.log('79. Erro: Campos obrigatórios não preenchidos.');
        alert('Por favor, preencha todos os campos.');
        return;
      }
      if (!emailRegex.test(email)) {
        console.log('79. Erro: Email inválido.');
        alert('Por favor, insira um email válido.');
        return;
      }
      if (professorForm.dataset.editId) {
        const id = professorForm.dataset.editId;
        console.log('80. Atualizando professor com ID:', id);
        db.collection('usuarios').doc(id).update({ nome, email, disciplina, role: 'professor' })
          .then(() => {
            console.log('81. Professor atualizado com sucesso:', id);
            updateTable('professores-table', 'usuarios', ['nome', 'email', 'disciplina']);
            professorForm.reset();
            delete professorForm.dataset.editId;
          })
          .catch(error => {
            console.error('82. Erro ao editar professor:', error.code, error.message);
            alert('Erro ao editar professor: ' + error.message);
          });
      } else {
        console.log('83. Adicionando novo professor...');
        db.collection('usuarios').add({ nome, email, disciplina, role: 'professor' })
          .then(docRef => {
            console.log('84. Novo professor adicionado com ID:', docRef.id);
            db.collection('usuarios').doc(docRef.id).update({ id: docRef.id });
            updateTable('professores-table', 'usuarios', ['nome', 'email', 'disciplina']);
            professorForm.reset();
          })
          .catch(error => {
            console.error('85. Erro ao adicionar professor:', error.code, error.message);
            alert('Erro ao adicionar professor: ' + error.message);
          });
      }
    });
  }

  // Gerenciar Cursos (usado em admin/cursos.html)
  const cursoForm = document.getElementById('curso-form');
  if (cursoForm) {
    console.log('86. Formulário de curso encontrado.');
    updateTable('cursos-table', 'cursos', ['nome', 'duracao'],
      (id) => {
        console.log('87. Editando curso com ID:', id);
        db.collection('cursos').doc(id).get().then(doc => {
          const curso = doc.data();
          console.log('88. Dados do curso:', curso);
          const cursoNomeInput = document.getElementById('curso-nome');
          const cursoDuracaoInput = document.getElementById('curso-duracao');
          if (cursoNomeInput && cursoDuracaoInput) {
            cursoNomeInput.value = curso.nome;
            cursoDuracaoInput.value = curso.duracao;
            cursoForm.dataset.editId = id;
          } else {
            console.error('88.1. Elementos curso-nome ou curso-duracao não encontrados.');
            alert('Erro: Formulário de curso incompleto. Verifique os campos.');
          }
        }).catch(error => {
          console.error('88.2. Erro ao carregar dados do curso:', error.code, error.message);
          alert('Erro ao carregar curso: ' + error.message);
        });
      },
      (id) => {
        console.log('89. Solicitando exclusão do curso com ID:', id);
        if (confirm('Deseja excluir este curso?')) {
          db.collection('cursos').doc(id).delete()
            .then(() => {
              console.log('90. Curso excluído com sucesso:', id);
              updateTable('cursos-table', 'cursos', ['nome', 'duracao']);
            })
            .catch(error => {
              console.error('91. Erro ao excluir curso:', error.code, error.message);
              alert('Erro ao excluir curso: ' + error.message);
            });
        }
      }
    );

    cursoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('92. Formulário de curso submetido.');
      const cursoNomeInput = document.getElementById('curso-nome');
      const cursoDuracaoInput = document.getElementById('curso-duracao');
      
      if (!cursoNomeInput || !cursoDuracaoInput) {
        console.error('93. Erro: Elementos curso-nome ou curso-duracao não encontrados.');
        alert('Erro: Formulário de curso incompleto. Verifique os campos.');
        return;
      }

      const nome = cursoNomeInput.value.trim();
      const duracao = cursoDuracaoInput.value.trim();
      console.log('94. Dados do formulário de curso:', { nome, duracao });

      if (!nome || !duracao) {
        console.log('95. Erro: Campos obrigatórios não preenchidos.');
        alert('Por favor, preencha todos os campos.');
        return;
      }
      if (isNaN(duracao) || parseInt(duracao) <= 0) {
        console.log('95. Erro: Duração inválida.');
        alert('Por favor, insira uma duração válida (número positivo).');
        return;
      }

      if (cursoForm.dataset.editId) {
        const id = cursoForm.dataset.editId;
        console.log('96. Atualizando curso com ID:', id);
        db.collection('cursos').doc(id).update({ nome, duracao: parseInt(duracao) })
          .then(() => {
            console.log('97. Curso atualizado com sucesso:', id);
            updateTable('cursos-table', 'cursos', ['nome', 'duracao']);
            cursoForm.reset();
            delete cursoForm.dataset.editId;
            alert('Curso atualizado com sucesso!');
          })
          .catch(error => {
            console.error('98. Erro ao editar curso:', error.code, error.message);
            alert('Erro ao editar curso: ' + error.message);
          });
      } else {
        console.log('99. Adicionando novo curso...');
        db.collection('cursos').add({ nome, duracao: parseInt(duracao) })
          .then(docRef => {
            console.log('100. Novo curso adicionado com ID:', docRef.id);
            db.collection('cursos').doc(docRef.id).update({ id: docRef.id });
            updateTable('cursos-table', 'cursos', ['nome', 'duracao']);
            cursoForm.reset();
            alert('Curso adicionado com sucesso!');
          })
          .catch(error => {
            console.error('101. Erro ao adicionar curso:', error.code, error.message);
            alert('Erro ao adicionar curso: ' + error.message);
          });
      }
    });
  }

  // Gerenciar Relatórios (usado em admin/relatorios.html ou secretaria/relatorios.html)
  const relatorioForm = document.getElementById('relatorio-form');
  if (relatorioForm) {
    console.log('102. Formulário de relatório encontrado.');
    relatorioForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('103. Formulário de relatório submetido.');
      const tipo = document.getElementById('relatorio-tipo').value;
      console.log('104. Tipo de relatório selecionado:', tipo);
      const output = document.getElementById('relatorio-output');
      output.innerHTML = '';
      let collection, fields;
      if (tipo === 'alunos') {
        collection = 'alunos';
        fields = ['nome', 'matricula', 'curso'];
      } else if (tipo === 'professores') {
        collection = 'usuarios';
        fields = ['nome', 'email', 'disciplina'];
      } else if (tipo === 'cursos') {
        collection = 'cursos';
        fields = ['nome', 'duracao'];
      } else {
        console.log('105. Erro: Tipo de relatório inválido.');
        output.innerHTML = '<p>Por favor, selecione um tipo de relatório.</p>';
        return;
      }
      console.log('106. Gerando relatório para coleção:', collection, 'Campos:', fields);
      output.innerHTML = `<h3>Relatório de ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h3>`;
      const table = document.createElement('table');
      table.className = 'admin-table';
      const thead = document.createElement('thead');
      const tbody = document.createElement('tbody');
      thead.innerHTML = `<tr>${fields.map(f => `<th>${f.charAt(0).toUpperCase() + f.slice(1)}</th>`).join('')}</tr>`;
      db.collection(collection).get().then(querySnapshot => {
        const data = [];
        querySnapshot.forEach(doc => {
          const item = { id: doc.id, ...doc.data() };
          console.log('107. Item carregado para relatório:', item);
          data.push(item);
          const row = document.createElement('tr');
          fields.forEach(field => {
            const cell = document.createElement('td');
            cell.textContent = item[field] || '';
            row.appendChild(cell);
          });
          tbody.appendChild(row);
        });
        table.appendChild(thead);
        table.appendChild(tbody);
        output.appendChild(table);

        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'Exportar como CSV';
        exportBtn.style.padding = '10px 20px';
        exportBtn.style.backgroundColor = '#3498db';
        exportBtn.style.color = '#ffffff';
        exportBtn.style.border = 'none';
        exportBtn.style.borderRadius = '8px';
        exportBtn.style.marginTop = '16px';
        exportBtn.style.cursor = 'pointer';
        exportBtn.addEventListener('click', () => {
          console.log('108. Exportando relatório como CSV...');
          exportToCSV(data, fields, `relatorio_${tipo}.csv`);
        });
        output.insertAdjacentElement('afterend', exportBtn);
      }).catch(error => {
        console.error('109. Erro ao gerar relatório:', error.code, error.message);
        alert('Erro ao gerar relatório: ' + error.message);
      });
    });
  }

  // Exportar relatórios como CSV
  function exportToCSV(data, fields, filename) {
    console.log('110. Exportando dados para CSV:', { filename, fields });
    const csv = ['\ufeff' + fields.join(','), ...data.map(item => fields.map(f => `"${item[f] || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    console.log('111. CSV gerado, iniciando download:', filename);
    link.click();
  }

  // Navegação entre seções do painel (usado em adm-painel.html)
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  if (sidebarLinks) {
    console.log('112. Links da barra lateral encontrados.');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('113. Link da barra lateral clicado:', link.getAttribute('href'));
        const sectionId = link.getAttribute('href').substring(1);
        document.querySelectorAll('.admin-section').forEach(section => {
          section.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-link').forEach(l => {
          l.classList.remove('active');
        });
        document.querySelector(`#${sectionId}`).classList.add('active');
        link.classList.add('active');
      });
    });
  }
});
