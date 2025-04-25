# LibrarySystem_React
Um sistema de biblioteca digital desenvolvido com React e TailwindCSS e Firebase para gerenciamento externo, que permite aos usuários pesquisar, favoritar e gerenciar livros.

## Funcionalidades

- 🔍 Pesquisa de livros usando a API do Google Books
- 👤 Sistema de autenticação de usuários
- ⭐ Sistema de favoritos
- 👑 Painel administrativo para gerenciamento de livros
- 📱 Interface responsiva e moderna

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm 
- Chave da API do Google Books e chaves do Firebase

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_GOOGLE_BOOKS_API_KEY=
```

## Executando o Projeto

1. Inicie o servidor de desenvolvimento:
```bash
npm start
```

2. Acesse o projeto em `http://localhost:3000`

## Estrutura do Projeto

```
library-system-react/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── contexts/       # Contextos do React (Auth, etc)
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Serviços (Firebase, API, etc)
│   ├── firebase/      # Configuração do Firebase
│   └── App.jsx        # Componente principal
├── public/            # Arquivos estáticos
└── package.json       # Dependências e scripts
```

## Contribuindo

1. Crie uma branch para sua feature:
```bash
git checkout -b feature/nome-da-feature
```

2. Faça commit das suas alterações:
```bash
git commit -m 'Adiciona nova feature'
```

3. Faça push para a branch:
```bash
git push origin feature/nome-da-feature
```
