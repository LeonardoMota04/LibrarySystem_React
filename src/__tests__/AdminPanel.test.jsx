import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPanel from '../pages/AdminPanel';

// CT04 - Pesquisa em tempo real deve chamar searchBooks e exibir resultados
// CT05 - Clicar em "Adicionar à Biblioteca" deve chamar addBook
// CT06 - Clicar em "Excluir" deve chamar deleteBook
// CT07 - Indicador de carregamento deve aparecer durante a pesquisa

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'user1' }, logout: jest.fn() })
}));

const mockSearchResult = [
  {
    id: 'gb1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    description: 'Um livro sobre boas práticas',
    imageUrl: 'https://example.com/clean-code.jpg'
  }
];

const mockBooksInDb = [
  {
    id: 'db1',
    title: 'Refactoring',
    author: 'Martin Fowler',
    description: 'Refatoração de código',
    imageUrl: 'https://example.com/refactoring.jpg'
  }
];

jest.mock('../services/bookService', () => ({
  searchBooks: jest.fn(),
  addBook: jest.fn(),
  getBooks: jest.fn(),
  deleteBook: jest.fn()
}));

import { searchBooks, addBook, getBooks, deleteBook } from '../services/bookService';

describe('AdminPanel', () => {
  beforeEach(() => {
    getBooks.mockResolvedValue(mockBooksInDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('CT04 - pesquisa em tempo real', async () => {
    searchBooks.mockResolvedValueOnce(mockSearchResult);

    render(<AdminPanel />);

    const input = screen.getByPlaceholderText(/pesquisar livros na api/i);

    // digita termo com mais de 2 caracteres
    userEvent.type(input, 'cle');

    // Aguarda resultado aparecer
    expect(await screen.findByText('Clean Code')).toBeInTheDocument();
    expect(searchBooks).toHaveBeenCalledTimes(1);
  });

  test('CT05 - adiciona livro ao clicar em "Adicionar à Biblioteca"', async () => {
    searchBooks.mockResolvedValueOnce(mockSearchResult);
    addBook.mockResolvedValueOnce('firestore-id');

    render(<AdminPanel />);
    const input = screen.getByPlaceholderText(/pesquisar livros na api/i);
    userEvent.type(input, 'cle');

    const addButton = await screen.findByRole('button', { name: /adicionar à biblioteca/i });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(addBook).toHaveBeenCalledWith(mockSearchResult[0]);
    });
  });

  test('CT06 - exclui livro ao clicar em "Excluir"', async () => {
    // Força confirm
    window.confirm = jest.fn(() => true);
    deleteBook.mockResolvedValueOnce();

    render(<AdminPanel />);

    // esperar livros do db aparecerem
    const deleteButton = await screen.findByRole('button', { name: /excluir/i });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteBook).toHaveBeenCalledWith('db1');
    });
  });

  test('CT07 - mostra spinner de carregamento durante pesquisa', async () => {
    // searchBooks demora para resolver
    searchBooks.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(mockSearchResult), 100)));

    render(<AdminPanel />);
    const input = screen.getByPlaceholderText(/pesquisar livros na api/i);

    userEvent.type(input, 'cle');

    // Spinner deve aparecer (busca elemento com classe animate-spin)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Aguarda resultado
    expect(await screen.findByText('Clean Code')).toBeInTheDocument();
  });
}); 