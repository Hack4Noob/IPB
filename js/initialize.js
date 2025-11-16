// js/initialize.js
const db = firebase.firestore();
const auth = firebase.auth();

// Dados de exemplo para as coleções
const noticias = [
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

const eventos = [
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

const mensagens = [
  {
    id: 'mensagem1',
    nome: 'João Silva',
    email: 'joao@example.com',
    mensagem: 'Gostaria de saber mais sobre os cursos oferecidos.',
    data: new Date('2025-09-26')
  }
];

const alunos = [
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

const cursos = [
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

const usuarios = [
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

const turmas = [
  {
    id: 'turma1',
    nome: '10A',
    cursoId: 'curso1',
    professorId: 'prof123',
    alunos: ['aluno123', 'aluno124']
  }
];

const disciplinas = [
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

const notas = [
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

const presencas = [
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

const avisos = [
  {
    id: 'aviso1',
    titulo: 'Prova de Matemática',
    mensagem: 'A prova será na próxima sexta-feira às 10h.',
    data: new Date('2025-09-26'),
    professorId: 'prof123'
  }
];

const pagamentos = [
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

const documentos = [
  {
    id: 'documento1',
    alunoId: 'aluno123',
    url: 'https://res.cloudinary.com/your-cloud-name/document/upload/v1234567890/certificado.pdf',
    nome: 'Certificado de Conclusão',
    data: new Date('2025-09-26')
  }
];

const configuracoes = [
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
  const batch = db.batch();
  for (const item of data) {
    const docRef = db.collection(collectionName).doc(item.id);
    batch.set(docRef, item);
  }
  await batch.commit();
  console.log(`Coleção ${collectionName} preenchida com sucesso!`);
}

// Função para inicializar todas as coleções
async function initializeFirestore() {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert('Você precisa estar logado como administrador para inicializar as coleções.');
      return;
    }
    const idTokenResult = await user.getIdTokenResult();
    if (idTokenResult.claims.role !== 'admin') {
      alert('Apenas administradores podem inicializar as coleções.');
      return;
    }

    await populateCollection('noticias', noticias);
    await populateCollection('eventos', eventos);
    await populateCollection('mensagens', mensagens);
    await populateCollection('alunos', alunos);
    await populateCollection('cursos', cursos);
    await populateCollection('usuarios', usuarios);
    await populateCollection('turmas', turmas);
    await populateCollection('disciplinas', disciplinas);
    await populateCollection('notas', notas);
    await populateCollection('presencas', presencas);
    await populateCollection('avisos', avisos);
    await populateCollection('pagamentos', pagamentos);
    await populateCollection('documentos', documentos);
    await populateCollection('configuracoes', configuracoes);
    
    alert('Todas as coleções foram preenchidas com sucesso!');
  } catch (error) {
    console.error('Erro ao preencher coleções:', error);
    alert('Erro ao inicializar coleções: ' + error.message);
  }
}

// Exportar a função para uso em outras partes do projeto
window.initializeFirestore = initializeFirestore;
