import { render, screen, fireEvent } from '@testing-library/react';
import BookCard from '../components/BookCard';

// Mock do hook useAuth
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'user1' } })
}));

jest.mock('../services/bookService', () => ({
  addToFavorites: jest.fn(() => Promise.resolve()),
  removeFromFavorites: jest.fn(() => Promise.resolve())
}));

import { addToFavorites, removeFromFavorites } from '../services/bookService';

const baseBook = {
  id: 'book1',
  title: 'Domain-Driven Design',
  author: 'Eric Evans',
  description: 'Livro sobre DDD',
  favoritesCount: 0,
  favoritedBy: []
};

describe('BookCard', () => {
  afterEach(() => jest.clearAllMocks());

  test('CT08 - adiciona aos favoritos quando ainda não é favorito', async () => {
    render(<BookCard book={baseBook} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(addToFavorites).toHaveBeenCalledWith('book1', 'user1');
  });

  test('CT09 - remove dos favoritos quando já é favorito', async () => {
    const favoriteBook = { ...baseBook, favoritedBy: ['user1'], favoritesCount: 1 };

    render(<BookCard book={favoriteBook} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(removeFromFavorites).toHaveBeenCalledWith('book1', 'user1');
  });
}); 