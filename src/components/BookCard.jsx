import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { addToFavorites, removeFromFavorites } from "../services/bookService";

export default function BookCard({ book }) {
  const { currentUser } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(book.favoritesCount || 0);

  // Verificar se o livro está nos favoritos do usuário atual
  useEffect(() => {
    if (book.favoritedBy && currentUser) {
      setIsFavorite(book.favoritedBy.includes(currentUser.uid));
    }
  }, [book, currentUser]);

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      console.log("Usuário não está logado");
      return;
    }
    
    try {
      console.log("Tentando favoritar/desfavoritar livro:", book.id);
      
      if (isFavorite) {
        await removeFromFavorites(book.id, currentUser.uid);
        setFavoritesCount(prev => prev - 1);
      } else {
        await addToFavorites(book.id, currentUser.uid);
        setFavoritesCount(prev => prev + 1);
      }
      
      setIsFavorite(!isFavorite);
      console.log("Operação de favorito concluída com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar favoritos:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{book.title}</h2>
            <p className="text-sm text-gray-600 mb-3">por {book.author}</p>
          </div>
          {currentUser && (
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isFavorite 
                  ? "bg-yellow-400 text-white" 
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
              aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill={isFavorite ? "currentColor" : "none"} 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
            </button>
          )}
        </div>
        <p className="text-gray-700 text-sm leading-relaxed mb-4">{book.description}</p>
        
        <div className="flex items-center text-sm text-gray-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
          <span>{favoritesCount} {favoritesCount === 1 ? 'favorito' : 'favoritos'}</span>
        </div>
      </div>
    </div>
  );
}
  