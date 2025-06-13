import { searchBooks } from '../../services/bookService';

// CT16 - Consulta real à Google Books API e verifica que resultados são retornados.

describe('Integração • Google Books API', () => {
  test('CT16 - searchBooks devolve resultados reais', async () => {
    const term = 'harry potter';
    const results = await searchBooks(term);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('title');
    expect(results[0]).toHaveProperty('author');
  });
}); 