# FitReport Pro

SaaS moderno para personal trainers cadastrarem alunos, registrarem avaliacoes fisicas e gerarem relatorios comparativos visuais em PDF paisagem.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Auth preparado via `@supabase/ssr`
- Drizzle ORM para Postgres/Supabase
- React Hook Form/Zod preparados na camada de validacao
- Recharts para dashboard
- html2canvas + jsPDF para exportacao A4 paisagem

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. O app abre em modo demo com 1 personal, 3 alunos, 2 avaliacoes por aluno e 1 relatorio comparativo pronto.

## Variaveis de ambiente

Crie `.env.local` quando for conectar Supabase/Postgres:

```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anon"
```

Sem essas variaveis, o app continua funcionando com dados demo em memoria.

## Banco de dados

O schema Drizzle esta em `src/db/schema.ts` e cobre:

- `users`
- `trainers`
- `students`
- `assessments`
- `body_measurements`
- `skinfolds`
- `reports`

Com `DATABASE_URL` configurada:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## Funcionalidades

- Login, cadastro e recuperacao preparados para Supabase Auth
- Dashboard com totais, ultimas avaliacoes, evolucao media e grafico
- Perfil do personal com marca, contatos, foto, frase e assinatura
- CRUD demo de alunos
- Avaliacao fisica com IMC, massa magra, massa gorda e soma Pollock 7
- Relatorio comparativo com indicadores verdes/vermelhos e analise automatica
- Exportar PDF, imprimir e compartilhar resumo no WhatsApp

## Build

```bash
npm run lint
npm run build
```
