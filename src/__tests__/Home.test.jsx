import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../pages/Home';

// CT01 - Deve renderizar a lista de livros obtida do serviço
// CT02 - Deve filtrar os livros pelo termo de busca
// CT03 - Deve exibir mensagem de erro quando o serviço falha

// Mock do hook useAuth
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: null, logout: jest.fn() })
}));

// Mock do serviço de livros
const mockBooks = [
  { id: '1', title: 'React Testing', author: 'Kent C Dodds', description: 'Testing guide' },
  { id: '2', title: 'Learning Firebase', author: 'Firebase Team', description: 'Firebase book' }
];

jest.mock('../services/bookService', () => ({
  getBooks: jest.fn()
}));

import { getBooks } from '../services/bookService';

describe('Home Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('CT01 - exibe livros retornados pelo serviço', async () => {
    getBooks.mockResolvedValueOnce(mockBooks);

    render(<Home />);

    // espera os livros aparecerem
    for (const book of mockBooks) {
      expect(await screen.findByText(book.title)).toBeInTheDocument();
    }
  });

  test('CT02 - filtra livros conforme termo de busca', async () => {
    getBooks.mockResolvedValueOnce(mockBooks);

    render(<Home />);

    const searchInput = await screen.findByPlaceholderText(/buscar/i);

    // Digita "react" no campo de busca
    fireEvent.change(searchInput, { target: { value: 'react' } });

    await waitFor(() => {
      expect(screen.getByText('React Testing')).toBeInTheDocument();
      expect(screen.queryByText('Learning Firebase')).not.toBeInTheDocument();
    });
  });

  test('CT03 - exibe mensagem de erro quando getBooks falha', async () => {
    getBooks.mockRejectedValueOnce(new Error('Falha'));

    render(<Home />);

    expect(await screen.findByText(/não foi possível carregar os livros/i)).toBeInTheDocument();
  });
}); 