// firebase-config.js
// ATENÇÃO: Nunca exponha dados sensíveis em produção pública!

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBo4kgCaHXXdRdJI04zlSXcghHoNSXqhdo",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "gestaoescolar-b.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "gestaoescolar-b",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "gestaoescolar-b.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1069726652251",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1069726652251:web:0a64a3bf35e499651bec7e",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-S44FL3986J"
};

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase inicializado ✅");
    // Inicializa Analytics se disponível
    if (typeof firebase.analytics === "function") {
      firebase.analytics();
      console.log("Firebase Analytics inicializado");
    }
  } else {
    console.log("Firebase já estava inicializado");
  }
  // Disponibiliza globalmente para outros scripts
  window.auth = firebase.auth();
  window.db = firebase.firestore();
} catch (err) {
  console.error("Erro ao inicializar Firebase:", err);
  alert("Erro ao inicializar Firebase. Verifique a configuração.");
}
