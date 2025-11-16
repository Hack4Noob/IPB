// Script para popular a coleção de galeria com imagens de exemplo

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

const firebaseConfig = {
  // Use environment variables or paste your config here
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const galleryImages = [
  {
    titulo: 'Campus Principal',
    descricao: 'Vista geral do campus do IPG',
    categoria: 'campus',
    url: '/images/escola-hero.jpg',
  },
  {
    titulo: 'Laboratório de Informática',
    descricao: 'Equipamentos modernos para aulas práticas',
    categoria: 'laboratorios',
    url: '/images/lab.jpg',
  },
  {
    titulo: 'Formatura 2024',
    descricao: 'Evento de formatura dos alunos',
    categoria: 'eventos',
    url: '/images/formatura.jpg',
  },
  {
    titulo: 'Alunos em Aula',
    descricao: 'Momento de aprendizado em sala de aula',
    categoria: 'alunos',
    url: '/images/alunos-aula.jpg',
  },
  {
    titulo: 'Recreio dos Alunos',
    descricao: 'Convivência entre alunos',
    categoria: 'alunos',
    url: '/images/recreio.jpg',
  },
  {
    titulo: 'Seminário de Empreendedorismo',
    descricao: 'Palestra com empresários locais',
    categoria: 'eventos',
    url: '/images/seminario.jpg',
  },
];

async function seedGallery() {
  try {
    console.log('[v0] Starting gallery seed...');
    
    for (const image of galleryImages) {
      await addDoc(collection(db, 'galeria'), {
        ...image,
        dataUpload: serverTimestamp(),
      });
      console.log(`[v0] Added image: ${image.titulo}`);
    }
    
    console.log('[v0] Gallery seeding completed successfully!');
  } catch (error) {
    console.error('[v0] Error seeding gallery:', error);
  }
}

seedGallery();
