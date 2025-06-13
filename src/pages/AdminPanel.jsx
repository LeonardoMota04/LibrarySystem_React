import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getBooks, addBook, deleteBook } from "../services/bookService";
import { searchBooks } from "../services/bookService";
import Navbar from "../components/Navbar";

export default function AdminPanel() {
  const { currentUser, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    description: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  // useEffect para pesquisa em tempo real
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        try {
          setLoading(true);
          setError("");
          const results = await searchBooks(searchTerm);
          setSearchResults(results);
        } catch (error) {
          console.error("Erro na pesquisa:", error);
          setError("Erro ao pesquisar livros. Tente novamente.");
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500); // Delay de 500ms para evitar muitas requisições

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const fetchedBooks = await getBooks();
      setBooks(fetchedBooks);
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
      setError("Não foi possível carregar os livros. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (book) => {
    try {
      setLoading(true);
      const firestoreBookId = await addBook(book);
      console.log("Livro adicionado com ID:", firestoreBookId);
      setSearchResults([]);
      setSearchTerm("");
      fetchBooks();
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
      setError("Erro ao adicionar livro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    console.log("Tentando deletar livro:", bookId);
    
    if (!window.confirm("Tem certeza que deseja excluir este livro?")) {
      console.log("Usuário cancelou a exclusão");
      return;
    }

    try {
      console.log("Iniciando processo de exclusão do livro");
      setLoading(true);
      await deleteBook(bookId);
      console.log("Livro deletado com sucesso");
      fetchBooks();
    } catch (error) {
      console.error("Erro ao excluir livro:", error);
      setError("Erro ao excluir livro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={currentUser} onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Painel Administrativo</h1>
          
          {/* Barra de pesquisa da API */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pesquisar e Adicionar Livros</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar livros na API..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>

          {/* Resultados da pesquisa */}
          {searchResults.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Resultados da Pesquisa</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((book) => (
                  <div key={book.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="w-24 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{book.title}</h3>
                        <p className="text-sm text-gray-600">{book.author}</p>
                        <button
                          onClick={() => handleAddBook(book)}
                          className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Adicionar à Biblioteca
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de livros existentes */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Livros na Biblioteca</h2>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <div key={book.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="w-24 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{book.title}</h3>
                        <p className="text-sm text-gray-600">{book.author}</p>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
