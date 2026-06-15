# FitReport Pro

SaaS para personal trainers gerenciarem alunos, acompanhamentos físicos, relatórios comparativos premium e assinatura do workspace.

## Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 + componentes shadcn/base-ui
- Supabase Auth + Postgres
- Drizzle ORM
- Zod para validação
- Recharts para dashboard e histórico
- jsPDF para PDF A4 paisagem
- Stripe Billing + Checkout Sessions + Customer Portal

## Rodando Localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Variáveis

Crie `.env.local`:

```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anon"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe opcional
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID="price_..."
```

Sem banco configurado, o app mantém dados demo.

## Banco

Schema principal:

- `users`
- `trainers`
- `students`
- `assessments`
- `body_measurements`
- `skinfolds`
- `reports`

Com `DATABASE_URL`:

```bash
npm run db:push
npm run db:seed
```

Políticas RLS para Supabase estão em:

```bash
src/db/rls.sql
```

## Stripe

A integração usa Billing + Checkout Sessions:

- `/dashboard/assinatura` mostra plano atual e limites.
- `createCheckoutSessionAction` cria checkout de assinatura.
- `createBillingPortalAction` abre o portal do cliente.
- `/api/stripe/webhook` atualiza plano/status no banco.

Configure os produtos/preços no Stripe e preencha os IDs em `.env.local`.

## Funcionalidades

- Cadastro, login e recuperação de senha via Supabase.
- Perfil personalizado por personal: marca, foto, logo, cores, assinatura e onboarding.
- CRUD completo de alunos com objetivo, nível, frequência, restrições, observações clínicas e fotos de progresso.
- Avaliação física com IMC, composição corporal, perímetros e Pollock 7 dobras.
- Histórico do aluno com linha do tempo, fotos e comparação entre acompanhamentos.
- Relatórios premium com análise automática por regras fixas.
- Edição manual de análise profissional e recomendações antes do PDF.
- Salvamento de relatórios personalizados no banco.
- Link público temporário de relatório.
- Dashboard com métricas, evolução média, ranking e reavaliações pendentes.
- Planos Free, Pro e Studio preparados para SaaS.

## Validação

```bash
npm run lint
npm run build
```
