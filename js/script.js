// js/script.js
import { setupAuth, setupLoginForm, setupCadastroForm } from './auth-manager.js';
import { initializeFirestore } from './content-manager.js';
import { setupUI } from './ui-manager.js';
import { db, auth, storage } from './firebase-config.js';

// Lista de páginas públicas que não requerem autenticação
const publicPages = [
  '/index.html',
  '/sobre.html',
  '/cursos.html',
  '/contato.html',
  '/login.html',
  '/cadastro.html',
  '/associacao/dashboard.html' // Atualizado para permitir conteúdos públicos
];

// Função para verificar se a página atual é pública
function isPublicPage() {
  const currentPath = window.location.pathname;
  console.log('1. Verificando se a página é pública:', currentPath);
  return publicPages.includes(currentPath);
}

// Inicialização principal
document.addEventListener('DOMContentLoaded', () => {
  console.log('2. DOM completamente carregado.');
  
  // Configurar autenticação
  setupAuth(db, auth, publicPages);
  
  // Configurar formulários de login e cadastro
  setupLoginForm(auth);
  setupCadastroForm(db, auth);
  
  // Configurar interface do usuário
  setupUI(db, auth, storage);

  // Inicializar Firestore apenas na página de administração
  if (window.location.pathname.includes('/admin/')) {
    console.log('3. Inicializando Firestore para página de administração.');
    initializeFirestore(db);
  }

  // Verificar autenticação para a página da associação
  if (window.location.pathname === '/associacao/dashboard.html') {
    console.log('4. Verificando acesso à página da associação.');
    auth.onAuthStateChanged(user => {
      if (!user && !isPublicPage()) {
        console.log('5. Usuário não autenticado, redirecionando para login.');
        window.location.href = '/login.html';
      } else if (user) {
        db.collection('usuarios').doc(user.uid).get().then(doc => {
          const userData = doc.data();
          console.log('6. Dados do usuário:', userData);
          if (!userData.membroAssociacao && window.location.pathname === '/associacao/dashboard.html') {
            console.log('7. Usuário não é membro da associação, exibindo mensagem de acesso negado.');
            // A mensagem de acesso negado é tratada no ui-manager.js
          } else {
            console.log('8. Usuário é membro da associação, permitindo acesso.');
          }
        }).catch(error => {
          console.error('9. Erro ao verificar dados do usuário:', error.code, error.message);
          window.location.href = '/login.html';
        });
      } else {
        console.log('10. Acesso como visitante, exibindo apenas conteúdos públicos.');
      }
    });
  }
});

// Expor função de inicialização do Firestore para uso manual
window.initializeFirestore = () => {
  console.log('11. Inicializando Firestore manualmente.');
  initializeFirestore(db);
};
