# Gestor Financeiro — API

API REST para gerenciamento de finanças pessoais, construída com NestJS, TypeScript, PostgreSQL e Prisma. Permite que usuários cadastrem receitas e despesas, organizem por categorias e visualizem relatórios financeiros de forma segura e isolada por conta.

API em produção: https://gestor-financeiro-api-1369.onrender.com
Documentação interativa (Swagger): https://gestor-financeiro-api-1369.onrender.com/docs

> A API roda no plano gratuito do Render, que "dorme" após 15 minutos de inatividade. O primeiro acesso após um tempo parado pode levar de 30 a 60 segundos para responder.

---

## Funcionalidades

- Autenticação com JWT (cadastro e login, senhas criptografadas com bcrypt)
- Categorias de receitas e despesas, com CRUD completo
- Transações financeiras, vinculadas a categorias, com validação de regras de negócio
- Relatórios de resumo financeiro (saldo, receitas, despesas) e agrupamento por categoria, filtráveis por período
- Isolamento de dados por usuário — cada pessoa só acessa suas próprias informações
- Documentação interativa via Swagger
- Tratamento de erros padronizado em toda a API

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20 |
| Framework | NestJS |
| Linguagem | TypeScript |
| Banco de dados | PostgreSQL |
| ORM | Prisma |
| Autenticação | JWT + Passport |
| Documentação | Swagger (OpenAPI) |
| Testes | Jest |
| Containerização | Docker (multi-stage build) |
| CI/CD | GitHub Actions |
| Hospedagem | Render (API) + Neon (banco) |

## Arquitetura

O projeto segue a arquitetura modular do NestJS, organizada em camadas:
src/
├── auth/ # Autenticação (JWT, guards, estratégias)
├── categories/ # CRUD de categorias
├── transactions/ # CRUD de transações + regras de negócio
├── reports/ # Relatórios e agregações
├── prisma/ # Integração com o banco via Prisma
└── common/ # Filtros e utilitários compartilhados


Cada módulo de domínio segue o padrão Controller → Service → Prisma, com DTOs validados automaticamente via `class-validator`, e autenticação JWT aplicada globalmente (com rotas públicas marcadas explicitamente via decorator `@Public()`).

## Endpoints principais

| Método | Rota | Descrição | Autenticado |
|---|---|---|---|
| POST | `/auth/register` | Cadastro de usuário | Não |
| POST | `/auth/login` | Login (retorna JWT) | Não |
| GET/POST/PATCH/DELETE | `/categories` | CRUD de categorias | Sim |
| GET/POST/PATCH/DELETE | `/transactions` | CRUD de transações | Sim |
| GET | `/reports/summary` | Resumo financeiro do período | Sim |
| GET | `/reports/by-category` | Totais agrupados por categoria | Sim |

A lista completa e interativa está disponível na documentação Swagger.

## Rodando localmente

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose

### Passos

```bash
git clone https://github.com/SEU_USUARIO/gestor-financeiro-backend.git
cd gestor-financeiro-backend

npm install

cp .env.example .env

docker compose up --build
```

A API estará disponível em `http://localhost:3000`, e a documentação em `http://localhost:3000/docs`.

### Rodando sem Docker (desenvolvimento)

```bash
docker compose up -d postgres
npm run start:dev
```

## Testes

```bash
npm test
```

18 testes unitários cobrindo as regras de negócio principais: autenticação, isolamento de dados por usuário, e validação de compatibilidade entre categoria e tipo de transação.

## CI/CD

Todo push na branch `main` dispara automaticamente, via GitHub Actions:
1. Instalação de dependências
2. Geração do Prisma Client
3. Aplicação de migrations num banco de teste temporário
4. Execução da suíte de testes
5. Build do projeto

O deploy em produção acontece automaticamente no Render a cada push, com migrations aplicadas antes de cada nova versão entrar no ar.

## Licença

Este projeto foi desenvolvido para fins de portfólio.