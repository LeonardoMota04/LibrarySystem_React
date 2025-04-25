import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  arrayUnion, 
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Referência para a coleção de livros
const booksCollection = collection(db, 'books');

const GOOGLE_BOOKS_API_KEY = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export const searchBooks = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('O termo de busca deve ter pelo menos 2 caracteres');
    }

    if (!GOOGLE_BOOKS_API_KEY) {
      throw new Error('Chave da API do Google Books não configurada');
    }

    const encodedSearchTerm = encodeURIComponent(searchTerm.trim());
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${encodedSearchTerm}&key=${GOOGLE_BOOKS_API_KEY}&langRestrict=pt`);
    
    if (!response.ok) {
      throw new Error(`Erro na API do Google Books: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items) {
      return [];
    }

    return data.items.map(item => ({
      id: item.id,
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors ? item.volumeInfo.authors[0] : 'Autor desconhecido',
      description: item.volumeInfo.description || 'Sem descrição disponível',
      imageUrl: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150',
      publisher: item.volumeInfo.publisher || 'Editora desconhecida',
      publishedDate: item.volumeInfo.publishedDate || 'Data desconhecida',
      pageCount: item.volumeInfo.pageCount || 0,
      categories: item.volumeInfo.categories || [],
      language: item.volumeInfo.language || 'pt'
    }));
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    throw error;
  }
};

// Buscar todos os livros
export async function getBooks() {
  try {
    const querySnapshot = await getDocs(booksCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    throw error;
  }
}

// Buscar um livro específico
export async function getBook(bookId) {
  try {
    const bookDoc = await getDoc(doc(db, 'books', bookId));
    if (bookDoc.exists()) {
      return {
        id: bookDoc.id,
        ...bookDoc.data()
      };
    } else {
      throw new Error('Livro não encontrado');
    }
  } catch (error) {
    console.error('Erro ao buscar livro:', error);
    throw error;
  }
}

// Adicionar um novo livro
export async function addBook(bookData) {
  try {
    console.log("Adicionando novo livro:", bookData);
    
    // Separar o ID do Google Books do resto dos dados
    const { id: googleBooksId, ...restData } = bookData;
    
    const docRef = await addDoc(booksCollection, {
      ...restData,
      googleBooksId, // Armazenar o ID do Google Books separadamente
      favoritesCount: 0,
      favoritedBy: [],
      createdAt: new Date().toISOString()
    });
    
    console.log("Livro adicionado com sucesso, ID do Firestore:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar livro:', error);
    throw error;
  }
}

// Atualizar um livro existente
export async function updateBook(bookId, bookData) {
  try {
    const bookRef = doc(db, 'books', bookId);
    await updateDoc(bookRef, {
      ...bookData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao atualizar livro:', error);
    throw error;
  }
}

// Excluir um livro
export async function deleteBook(bookId) {
  try {
    console.log("Iniciando exclusão do livro no Firestore:", bookId);
    
    // Verificar se o livro existe
    const bookDoc = await getDoc(doc(db, 'books', bookId));
    if (!bookDoc.exists()) {
      console.log("Livro não encontrado no Firestore");
      throw new Error('Livro não encontrado');
    }
    
    console.log("Livro encontrado, procedendo com a exclusão");
    await deleteDoc(doc(db, 'books', bookId));
    console.log("Livro excluído com sucesso do Firestore");
  } catch (error) {
    console.error('Erro ao excluir livro:', error);
    throw error;
  }
}

// Adicionar um livro aos favoritos
export async function addToFavorites(bookId, userId) {
  try {
    console.log(`Adicionando livro ${bookId} aos favoritos do usuário ${userId}`);
    
    // Verificar se o livro existe
    const bookDoc = await getDoc(doc(db, 'books', bookId));
    if (!bookDoc.exists()) {
      throw new Error('Livro não encontrado');
    }
    
    const bookRef = doc(db, 'books', bookId);
    await updateDoc(bookRef, {
      favoritedBy: arrayUnion(userId),
      favoritesCount: increment(1)
    });
    
    console.log('Livro adicionado aos favoritos com sucesso');
  } catch (error) {
    console.error('Erro ao adicionar aos favoritos:', error);
    throw error;
  }
}

// Remover um livro dos favoritos
export async function removeFromFavorites(bookId, userId) {
  try {
    console.log(`Removendo livro ${bookId} dos favoritos do usuário ${userId}`);
    
    // Verificar se o livro existe
    const bookDoc = await getDoc(doc(db, 'books', bookId));
    if (!bookDoc.exists()) {
      throw new Error('Livro não encontrado');
    }
    
    const bookRef = doc(db, 'books', bookId);
    await updateDoc(bookRef, {
      favoritedBy: arrayRemove(userId),
      favoritesCount: increment(-1)
    });
    
    console.log('Livro removido dos favoritos com sucesso');
  } catch (error) {
    console.error('Erro ao remover dos favoritos:', error);
    throw error;
  }
}

// Verificar se um livro está nos favoritos do usuário
export async function isBookFavorited(bookId, userId) {
  try {
    const bookDoc = await getDoc(doc(db, 'books', bookId));
    if (bookDoc.exists()) {
      const bookData = bookDoc.data();
      return bookData.favoritedBy && bookData.favoritedBy.includes(userId);
    }
    return false;
  } catch (error) {
    console.error('Erro ao verificar favoritos:', error);
    throw error;
  }
}

// Buscar livros favoritos do usuário
export async function getUserFavorites(userId) {
  try {
    const q = query(booksCollection, where('favoritedBy', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar favoritos do usuário:', error);
    throw error;
  }
} 