import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getBooks } from "../services/bookService";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";

export default function Home() {
  const { currentUser, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

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

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={currentUser} onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Biblioteca Digital</h1>

        {/* Campo de busca */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Buscar por título ou autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Lista de livros */}
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
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
