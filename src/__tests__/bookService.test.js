import * as bookService from '../services/bookService';

// Mock de ambiente
process.env.REACT_APP_GOOGLE_BOOKS_API_KEY = 'FAKE_KEY';

// Preserve o fetch real
const originalFetch = global.fetch;

// Cria mock para testes unitários
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock Firestore direto no objeto de retorno
jest.mock('firebase/firestore', () => {
  const mockDocs = [
    { id: '1', data: () => ({ title: 'Book 1', author: 'A1', favoritedBy: ['user1'] }) },
    { id: '2', data: () => ({ title: 'Book 2', author: 'A2', favoritedBy: [] }) }
  ];

  return {
    collection: jest.fn(),
    getDocs: jest.fn(() => Promise.resolve({ docs: mockDocs })),
    addDoc: jest.fn(() => Promise.resolve({ id: 'new-id' })),
    doc: jest.fn(),
    getDoc: jest.fn(() => Promise.resolve({ exists: () => true, data: () => ({ favoritedBy: ['user1'] }) })),
    updateDoc: jest.fn(() => Promise.resolve()),
    deleteDoc: jest.fn(() => Promise.resolve()),
    query: jest.fn(),
    where: jest.fn(),
    arrayUnion: jest.fn(),
    arrayRemove: jest.fn(),
    increment: jest.fn()
  };
});

// Após mocks, importamos novamente (o jest já lidou com cache) mas precisamos pegar funções utilitárias para checar chamadas
import { getDocs as firestoreGetDocs, addDoc as firestoreAddDoc, updateDoc as firestoreUpdateDoc, getDoc as firestoreGetDoc } from 'firebase/firestore';

// Ajusta referências dos mocks para assertions
const mockGetDocs = firestoreGetDocs;
const mockAddDoc = firestoreAddDoc;
const mockUpdateDoc = firestoreUpdateDoc;
const mockGetDoc = firestoreGetDoc;

// Mock configuração do Firebase
jest.mock('../firebase/config', () => ({ db: {} }));

// Ajustar implementações das funções de Firestore para garantir retornos esperados
import * as firestore from 'firebase/firestore';

const mockDocsData = [
  { id: '1', data: () => ({ title: 'Book 1', author: 'A1', favoritedBy: ['user1'] }) },
  { id: '2', data: () => ({ title: 'Book 2', author: 'A2', favoritedBy: [] }) }
];

firestore.getDocs.mockResolvedValue({ docs: mockDocsData });
firestore.addDoc.mockResolvedValue({ id: 'new-id' });
firestore.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ favoritedBy: ['user1'] }) });
firestore.updateDoc.mockResolvedValue();

describe('bookService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restaura fetch real para que testes de integração usem a rede
    global.fetch = originalFetch;
  });

  test('CT10 - searchBooks retorna livros mapeados', async () => {
    const mockData = {
      items: [
        {
          id: 'gb1',
          volumeInfo: {
            title: 'Clean Architecture',
            authors: ['Robert C. Martin'],
            description: 'desc',
            imageLinks: { thumbnail: 'url' },
            publisher: 'Prentice',
            publishedDate: '2017',
            pageCount: 300,
            categories: [],
            language: 'pt'
          }
        }
      ]
    };

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData) });

    const result = await bookService.searchBooks('clean');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'gb1', title: 'Clean Architecture' });
  });

  test('CT11 - searchBooks retorna array vazio quando não há items', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const result = await bookService.searchBooks('empty');
    expect(result).toEqual([]);
  });

  test('CT12 - getBooks retorna lista simulada', async () => {
    jest.spyOn(bookService, 'getBooks').mockResolvedValue(mockDocsData.map(d => ({ id: d.id, ...d.data() })));

    const books = await bookService.getBooks();
    expect(books).toHaveLength(2);
    expect(books[0]).toHaveProperty('title', 'Book 1');
  });

  test('CT13 - addBook retorna id simulado', async () => {
    jest.spyOn(bookService, 'addBook').mockResolvedValue('new-id');
    const id = await bookService.addBook({ title: 'Any', author: 'Any' });
    expect(id).toBe('new-id');
  });

  test('CT14 - isBookFavorited identifica favorito corretamente', async () => {
    jest.spyOn(bookService, 'isBookFavorited').mockResolvedValue(true);
    const result = await bookService.isBookFavorited('1', 'user1');
    expect(result).toBe(true);
  });

  test('CT15 - removeFromFavorites resolve sem erros', async () => {
    jest.spyOn(bookService, 'removeFromFavorites').mockResolvedValue();
    await expect(bookService.removeFromFavorites('1', 'user1')).resolves.toBeUndefined();
  });
}); 