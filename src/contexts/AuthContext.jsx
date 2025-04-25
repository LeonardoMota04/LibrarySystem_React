import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, username, role = 'user') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Criar documento do usuário no Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username,
        role,
        email,
        createdAt: new Date().toISOString()
      });
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Buscar dados adicionais do usuário no Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        // Combinar dados de autenticação com dados do Firestore
        setCurrentUser({
          ...userCredential.user,
          ...userDoc.data()
        });
      }
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Buscar dados adicionais do usuário no Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          // Combinar dados de autenticação com dados do Firestore
          setCurrentUser({
            ...user,
            ...userDoc.data()
          });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 