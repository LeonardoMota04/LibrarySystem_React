import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Suas configurações do Firebase
// Substitua com suas próprias configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCCnk0PaUohxwBTqpfieUPSK5HqvUq1SWQ",
  authDomain: "librarysystem-88158.firebaseapp.com",
  projectId: "librarysystem-88158",
  storageBucket: "librarysystem-88158.firebasestorage.app",
  messagingSenderId: "724455102827",
  appId: "1:724455102827:web:2b46cec7d60481a1ad542e"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 