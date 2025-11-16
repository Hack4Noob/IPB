// auth-manager.js - Gerenciamento de autenticação e usuários
document.addEventListener('DOMContentLoaded', function() {
  const db = firebase.firestore();
  const auth = firebase.auth();

  console.log('0. Iniciando auth-manager.js - Firebase inicializado.');

  // Páginas públicas onde não deve haver redirecionamento automático
  const publicPages = ['/', '/index.html', '/sobre.html', '/cursos.html', '/contato.html', '/cadastro.html', '/login.html'];

  // Função utilitária para obter URL do painel por role
  function getDashboardUrl(role) {
    switch (role) {
      case 'admin': return '/admin/dashboard.html';
      case 'secretaria': return '/secretaria/dashboard.html';
      case 'professor': return '/professor/dashboard.html';
      case 'aluno': return '/aluno/dashboard.html';
      default: return '/login.html';
    }
  }

  // Função auxiliar para redirecionamento seguro
  function proceedWithRedirect(role, currentPage, user) {
    const dashboardUrl = getDashboardUrl(role);
    const allowedPagesByRole = {
      admin: ['/admin/'],
      secretaria: ['/secretaria/'],
      professor: ['/professor/'],
      aluno: ['/aluno/']
    };

    // Se já estiver em página da área da role, não redireciona
    if (allowedPagesByRole[role].some(prefix => currentPage.startsWith(prefix))) {
      console.log('Usuário em página da área da role, sem redirecionamento:', currentPage);
      return;
    }

    // Se não for página pública, redireciona
    if (!publicPages.some(page => currentPage.endsWith(page))) {
      console.log('Redirecionando para dashboard:', dashboardUrl);
      window.location.href = dashboardUrl;
    } else {
      console.log('Página pública, sem redirecionamento:', currentPage);
    }
  }

  // Utilitário para mostrar mensagem de erro acessível
  function showError(msg, errorMessage) {
    if (errorMessage) {
      errorMessage.textContent = msg;
      errorMessage.style.display = 'block';
      errorMessage.setAttribute('aria-live', 'assertive');
      errorMessage.setAttribute('tabindex', '-1');
      errorMessage.focus();
      window.scrollTo({ top: errorMessage.offsetTop - 40, behavior: 'smooth' });
    } else {
      alert(msg);
    }
  }

  // Utilitário para esconder mensagem de erro
  function hideError(errorMessage) {
    if (errorMessage) {
      errorMessage.textContent = '';
      errorMessage.style.display = 'none';
      errorMessage.removeAttribute('aria-live');
      errorMessage.removeAttribute('tabindex');
    }
  }

  // Adiciona spinner de loading para operações assíncronas
  function showLoading(form) {
    let spinner = form.querySelector('.loading-spinner');
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.className = 'loading-spinner active';
      spinner.setAttribute('aria-live', 'polite');
      spinner.innerHTML = 'Carregando...';
      form.appendChild(spinner);
    }
    spinner.style.display = 'flex';
  }
  function hideLoading(form) {
    const spinner = form.querySelector('.loading-spinner');
    if (spinner) spinner.style.display = 'none';
  }

  // Verificar autenticação e personalizar menu
  auth.onAuthStateChanged(user => {
    let currentPage = window.location.pathname;
    console.log('1. onAuthStateChanged - Tipo de user:', typeof user, 'Usuário:', user, 'Página atual:', currentPage);

    const userArea = document.getElementById('user-area');
    const userWelcome = document.getElementById('user-welcome');
    const loginBtn = document.getElementById('login-btn');
    const initializeBtn = document.getElementById('initialize-btn');

    if (user && typeof user === 'object' && user.uid) {
      console.log('2. Usuário autenticado:', { uid: user.uid, email: user.email, displayName: user.displayName });

      db.collection('usuarios').doc(user.uid).get()
        .then((doc) => {
          let role = 'aluno';
          if (doc.exists) {
            role = doc.data().role;
            console.log('3. Role obtido do Firestore:', role);
          } else {
            console.log('3. Documento não encontrado, criando documento padrão...');
            const userData = {
              id: user.uid,
              nome: user.displayName || 'Usuário Sem Nome',
              email: user.email,
              role: 'aluno'
            };
            db.collection('usuarios').doc(user.uid).set(userData)
              .then(() => console.log('3.1. Documento criado em usuarios:', userData))
              .catch(error => console.error('3.2. Erro ao criar documento:', error));
          }

          // Atualiza menus e áreas visuais
          if (userArea) userArea.innerHTML = `<a href="${getDashboardUrl(role)}">Bem-vindo, ${user.displayName || user.email}</a>`;
          if (userWelcome) {
            userWelcome.style.display = 'block';
            userWelcome.innerHTML = `Olá, ${user.displayName || user.email}! Acesse seu <a href="${getDashboardUrl(role)}">painel</a>.`;
          }
          if (loginBtn) {
            loginBtn.href = getDashboardUrl(role);
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

          proceedWithRedirect(role, currentPage, user);
        })
        .catch(error => {
          console.error('4. Erro ao buscar documento de usuário:', error);
        });

    } else {
      console.log('5. Nenhum usuário autenticado.');
      if (!publicPages.some(page => currentPage.endsWith(page))) {
        console.log('5.1. Redirecionando para /login.html');
        window.location.href = '/login.html';
      }

      if (userArea) userArea.innerHTML = `<a href="/login.html">Área do Usuário</a>`;
      if (userWelcome) userWelcome.style.display = 'none';
      if (loginBtn) {
        loginBtn.href = '/login.html';
        loginBtn.textContent = 'Acesse o Sistema';
      }
      if (initializeBtn) initializeBtn.style.display = 'none';
    }
  });

  // Cadastro
  const cadastroForm = document.getElementById('cadastro-form');
  if (cadastroForm) {
    const tipoUsuario = document.getElementById('tipo-usuario');
    const disciplinaLabel = document.getElementById('disciplina-label');
    const disciplinaInput = document.getElementById('disciplina');
    const cursoSelect = document.getElementById('curso');
    const periodoSelect = document.getElementById('periodo');
    const classeSelect = document.getElementById('classe');
    const errorMessage = document.getElementById('error-message');

    // Mapeamento cursos -> disciplinas
    const cursosDisciplinas = {
      "Gestão do Ambiente": ["Português","Inglês ou Francês","Empreendedorismo","Ordenamento do Território","Conservação da Natureza","Formação Integradoras","Atitudes","Ecoturismo","Educação Física","Matemática","Química","Biologia","Qualidade Ambiental","Projetos em Ambiente","Projeto Tecnológico","Estágio Curricular Supervisionado"],
      "Energias Renováveis": ["Português","Inglês ou Francês","Formação Integradoras","Educação Física","Matemática","Física","Química","Informática","Empreendedorismo","Eletricidade","Desenho Técnico","Tecnologias e Processos","Organização e Gestão Industrial","Projeto Tecnológico","Estágio Curricular Supervisionado"],
      "Energias e Instalações Eléctricas": ["Português","Inglês ou Francês","Formação de Atitudes","Educação Física","Matemática","Física","Química","Informática","Máquinas Eléctricas","Instalações Eléctricas","Tecnologias Eléctricas","Electricidade e Electrónica","Desenho Técnico","Tecnologias e Processos","Empreendedorismo","Organização e Gestão Industrial","Práticas Oficinas e Laboratoriais","Projeto Tecnológico","Estágio Curricular Supervisionado"],
      "Frio e Climatização": ["Português","Inglês ou Francês","Formação Integradoras","Educação Física","Empreendedorismo","Electricidade e Electrónica","Desenho Técnico","Atitudes","Tecnologias e Processos","Organização e Gestão Industrial","Projeto Tecnológico","Estágio Curricular Supervisionado","Matemática","Física","Química","Informática"],
      "Electrónica Industrial e Automação": ["Português","Inglês ou Francês","Formação Integradoras","Educação Física","Matemática","Física","Química","Informática","Empreendedorismo","Electricidade e Electrónica","Desenho Técnico","Atitudes","Sistemas Digitais","Máquinas Eléctricas","Tecnologias de Comando","Tecnologias e Processos","Práticas Oficinas e Laboratoriais","Organização e Gestão Industrial","Projeto Tecnológico","Estágio Curricular Supervisionado"]
    };

    tipoUsuario.addEventListener('change', () => {
      if (tipoUsuario.value === 'professor') {
        disciplinaLabel.style.display = 'block';
        disciplinaInput.style.display = 'block';
        disciplinaInput.required = true;
        cursoSelect.required = true;
        cursoSelect.multiple = true;
        cursoSelect.size = 5;
        periodoSelect.required = true;
        document.getElementById('curso-group').style.display = 'block';
        document.getElementById('periodo-group').style.display = 'block';
        document.getElementById('classe-group').style.display = 'none';
      } else if (tipoUsuario.value === 'aluno') {
        cursoSelect.required = true;
        cursoSelect.multiple = false;
        cursoSelect.size = 1;
        periodoSelect.required = true;
        disciplinaLabel.style.display = 'none';
        disciplinaInput.style.display = 'none';
        disciplinaInput.required = false;
        disciplinaInput.value = '';
        document.getElementById('curso-group').style.display = 'block';
        document.getElementById('periodo-group').style.display = 'block';
        document.getElementById('classe-group').style.display = 'block';
      } else {
        disciplinaLabel.style.display = 'none';
        disciplinaInput.style.display = 'none';
        disciplinaInput.required = false;
        disciplinaInput.value = '';
        cursoSelect.required = false;
        cursoSelect.multiple = false;
        periodoSelect.required = false;
        document.getElementById('curso-group').style.display = 'none';
        document.getElementById('periodo-group').style.display = 'none';
        document.getElementById('classe-group').style.display = 'none';
      }
    });

    // Evita duplo envio
    let submitLock = false;

    // Oculta erro ao digitar
    cadastroForm.addEventListener('input', () => hideError(errorMessage));

    cadastroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submitLock) return;
      submitLock = true;
      showLoading(cadastroForm);
      hideError(errorMessage);

      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('usuario').value.trim();
      const senha = document.getElementById('senha').value.trim();
      const tipoUsuarioValue = tipoUsuario.value;
      const disciplina = disciplinaInput.value.trim();
      const periodo = periodoSelect.value;
      const classe = classeSelect.value;
      const cursosSelecionados = Array.from(cursoSelect.selectedOptions).map(opt => opt.value);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!nome || !email || !senha || !tipoUsuarioValue) {
        showError('Preencha todos os campos obrigatórios.', errorMessage);
        hideLoading(cadastroForm); submitLock = false; return;
      }
      if (!emailRegex.test(email)) {
        showError('Email inválido.', errorMessage);
        hideLoading(cadastroForm); submitLock = false; return;
      }
      if (senha.length < 6) {
        showError('Senha deve ter no mínimo 6 caracteres.', errorMessage);
        hideLoading(cadastroForm); submitLock = false; return;
      }
      if ((tipoUsuarioValue === 'aluno' || tipoUsuarioValue === 'professor') && !periodo) {
        showError('Selecione o período.', errorMessage);
        hideLoading(cadastroForm); submitLock = false; return;
      }
      if (tipoUsuarioValue === 'aluno' && !classe) {
        showError('Selecione a classe.', errorMessage);
        hideLoading(cadastroForm); submitLock = false; return;
      }
      if (tipoUsuarioValue === 'professor') {
        if (cursosSelecionados.length === 0 || cursosSelecionados.length > 2) {
          showError('Professor deve selecionar no mínimo 1 e no máximo 2 cursos.', errorMessage);
          hideLoading(cadastroForm); submitLock = false; return;
        }
        if (!disciplina) {
          showError('Informe a disciplina para professores.', errorMessage);
          hideLoading(cadastroForm); submitLock = false; return;
        }
      }
      if (tipoUsuarioValue === 'aluno' && cursosSelecionados.length !== 1) {
        showError('Aluno deve selecionar exatamente 1 curso.', errorMessage);
        hideLoading(cadastroForm); submitLock = false; return;
      }

      try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        await user.updateProfile({ displayName: nome });

        const disciplinas = cursosSelecionados.flatMap(curso => cursosDisciplinas[curso] || []);

        const userData = { id: user.uid, nome, email, role: tipoUsuarioValue, periodo, cursos: cursosSelecionados, disciplinas };
        if (tipoUsuarioValue === 'aluno') userData.classe = classe;
        if (tipoUsuarioValue === 'professor') userData.disciplina = disciplina;

        await db.collection('usuarios').doc(user.uid).set(userData);

        if (tipoUsuarioValue === 'aluno') {
          const alunoData = { id: user.uid, nome, email, matricula: 'TEMP-' + Date.now(), curso: cursosSelecionados[0], periodo, classe, disciplinas };
          await db.collection('alunos').doc(user.uid).set(alunoData);
        }

        alert('Conta criada com sucesso! Redirecionando...');
        window.location.href = getDashboardUrl(tipoUsuarioValue);
      } catch (error) {
        console.error('Erro ao criar conta:', error);
        showError('Erro: ' + error.message, errorMessage);
      } finally {
        hideLoading(cadastroForm);
        submitLock = false;
      }
    });
  }

  // Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    let loginLock = false;
    const errorMessage = document.getElementById('error-message');
    loginForm.addEventListener('input', () => hideError(errorMessage));

    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (loginLock) return;
      loginLock = true;
      showLoading(loginForm);
      hideError(errorMessage);

      const usuario = document.getElementById('usuario').value.trim();
      const senha = document.getElementById('senha').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!usuario || !senha) {
        showError('Preencha todos os campos.', errorMessage);
        hideLoading(loginForm); loginLock = false; return;
      }
      if (!emailRegex.test(usuario)) {
        showError('Email inválido.', errorMessage);
        hideLoading(loginForm); loginLock = false; return;
      }

      auth.signInWithEmailAndPassword(usuario, senha)
        .then(userCredential => {
          const user = userCredential.user;
          db.collection('usuarios').doc(user.uid).get()
            .then(doc => {
              const role = doc.exists ? doc.data().role : 'aluno';
              window.location.href = getDashboardUrl(role);
            });
        })
        .catch(error => {
          console.error('Erro ao fazer login:', error);
          showError('Erro: ' + error.message, errorMessage);
        })
        .finally(() => {
          hideLoading(loginForm);
          loginLock = false;
        });
    });
  }

});
