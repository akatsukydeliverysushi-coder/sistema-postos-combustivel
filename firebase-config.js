// Configuração pública do aplicativo Web Firebase.
// NÃO coloque aqui chaves privadas, service accounts ou senhas.
const firebaseConfig = {
  apiKey: "AIzaSyDr7Id3TpDFbYBMRdDbEWzVyvwiPCNHh4Q",
  authDomain: "sistema-de-postos.firebaseapp.com",
  projectId: "sistema-de-postos",
  storageBucket: "sistema-de-postos.firebasestorage.app",
  messagingSenderId: "652280144702",
  appId: "1:652280144702:web:73ea9c9c0720c3b06b826f",
  measurementId: "G-7TNZ84QQE4"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const firebaseAuth = firebase.auth();
const firebaseDb = firebase.firestore();
