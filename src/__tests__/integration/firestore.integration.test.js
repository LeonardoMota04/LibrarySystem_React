import { addBook, getBook, deleteBook } from '../../services/bookService';
import { auth, db } from '../../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// IT02 - Adiciona livro no Firestore e devolve ID
// IT03 - Recupera o livro recém-adicionado
// IT04 - Exclui o livro e confirma remoção

describe('Integração • Firestore', () => {
  beforeAll(async () => {
    const email = process.env.REACT_APP_TEST_ADMIN_EMAIL;
    const password = process.env.REACT_APP_TEST_ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error('Defina REACT_APP_TEST_ADMIN_EMAIL e REACT_APP_TEST_ADMIN_PASSWORD no .env para executar testes de integração');
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);

    // Garante que o documento do usuário contenha role 'admin'
    await setDoc(doc(db, 'users', cred.user.uid), { role: 'admin' }, { merge: true });
  });
  let createdId;
  const dummyBook = {
    id: 'integrationTestId',
    title: 'Teste de Integração',
    author: 'Jest Runner',
    description: 'Livro criado automaticamente em teste de integração',
    imageUrl: 'https://via.placeholder.com/150'
  };

  it('IT02 - addBook retorna ID válido', async () => {
    createdId = await addBook(dummyBook);
    expect(createdId).toBeTruthy();
  });

  it('IT03 - getBook devolve dados consistentes', async () => {
    const fetched = await getBook(createdId);
    expect(fetched).toMatchObject({ title: dummyBook.title, author: dummyBook.author });
  });

  it('IT04 - deleteBook remove o documento', async () => {
    await deleteBook(createdId);
    await expect(getBook(createdId)).rejects.toThrow();
  });
}); 