# FitReport Pro

SaaS para personal trainers gerenciarem alunos, avaliações físicas, histórico de acompanhamento e relatórios comparativos profissionais.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 + componentes shadcn/base-ui
- Supabase Auth + Postgres + RLS
- Drizzle para schema e setup do banco
- Zod para validações
- Recharts para gráficos
- jsPDF + html2canvas para PDF A4 paisagem

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse a URL exibida pelo Vite, normalmente `http://localhost:5173`.

## Variáveis de ambiente

Crie `.env.local`:

```bash
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave-publicavel"
```

No Vercel, use essas mesmas variáveis com prefixo `VITE_`. Variáveis antigas como `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` não são lidas pelo Vite.

`DATABASE_URL` não é necessária para o app rodar no navegador. Use apenas localmente para comandos administrativos do banco, como Drizzle.

## Banco

Tabelas principais:

- `users`
- `trainers`
- `students`
- `assessments`
- `body_measurements`
- `skinfolds`
- `reports`

Com `DATABASE_URL` configurada localmente:

```bash
npm run db:push
```

As políticas RLS para Supabase estão em `src/db/rls.sql`. Elas garantem que cada personal veja apenas o próprio perfil, alunos, avaliações e relatórios.

## Deploy na Vercel

Configure o projeto como Vite:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

O arquivo `vercel.json` já inclui rewrite para `index.html`, então URLs como `/login` continuam abrindo o app Vite.

Depois de adicionar ou alterar variáveis de ambiente, faça um novo deploy para a Vercel aplicar os valores.

## Funcionalidades

- Cadastro, login e recuperação de senha via Supabase.
- Perfil personalizado por personal: nome, marca, foto, logo, cores, assinatura, Instagram e WhatsApp.
- CRUD de alunos com dados reais sincronizados no banco.
- Histórico de acompanhamento por aluno.
- Nova avaliação física com IMC, composição corporal, perímetros e Pollock 7 dobras.
- Comparativo entre avaliações do mesmo aluno.
- Relatório premium com análise automática por regras fixas.
- Edição manual de análise profissional e recomendações antes do PDF.
- Exportação para PDF, impressão e compartilhamento no WhatsApp.

## Validação

```bash
npm run lint
npm run typecheck
npm run build
```
