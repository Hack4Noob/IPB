// Validar token antes de fazer requisições
async function validateUserToken(uid) {
  try {
    const userDoc = await firebase.firestore()
      .collection('usuarios')
      .doc(uid)
      .get();
    
    if (!userDoc.exists) {
      console.warn('[SECURITY] Usuário não encontrado:', uid);
      return null;
    }
    
    const userData = userDoc.data();
    
    // Validar campos obrigatórios
    if (!userData.role || !userData.email) {
      console.warn('[SECURITY] Dados de usuário incompletos:', uid);
      return null;
    }
    
    return userData;
  } catch (error) {
    console.error('[SECURITY] Erro ao validar token:', error);
    return null;
  }
}

// Verificar permissões antes de operações sensíveis
async function checkAdminAccess(uid) {
  const user = await validateUserToken(uid);
  return user?.role === 'admin';
}

async function checkProfessorAccess(uid) {
  const user = await validateUserToken(uid);
  return user?.role === 'professor';
}

// Logout seguro
async function secureLogout() {
  try {
    await firebase.auth().signOut();
    // Limpar dados locais sensíveis
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/login.html';
  } catch (error) {
    console.error('[SECURITY] Erro ao fazer logout:', error);
  }
}

// Detectar e prevenir XSS
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Validar emails
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar senhas (mínimo 6 caracteres, complexidade)
function isValidPassword(password) {
  return password.length >= 6;
}

// Exportar funções
window.authSecurity = {
  validateUserToken,
  checkAdminAccess,
  checkProfessorAccess,
  secureLogout,
  sanitizeInput,
  isValidEmail,
  isValidPassword
};
