# ConfraRacha APCD – Convites Personalizados & Mural de Recados

Plataforma para gestão completa de RSVP e convidados, com convites personalizados, painel administrativo e o mural de recados do evento. Construída sobre Next.js (App Router) com TailwindCSS, Prisma e MySQL.

## Rodando localmente

1. **Instale as dependências**

   ```bash
   pnpm install # ou npm install / yarn install
   ```

2. **Configure o arquivo `.env`**

   Copie `.env.example` para `.env.local` e preencha com as credenciais reais do banco.

3. **Execute as migrações do Prisma**

   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

4. **Inicie o servidor**

   ```bash
   npm run dev
   ```

   Acesse `http://localhost:3000`.

## Estrutura principal

- `app/convite/[token]/page.tsx`: experiência do convidado com vídeo, confete e edição de RSVP.
- `app/admin`: base do painel administrativo (login, dashboard e ações voltam nas próximas etapas).
- `app/api/rsvp/[token]/route.ts`: endpoint que recebe confirmações/alterações de presença.
- `prisma/schema.prisma`: definição do banco (MySQL) com eventos, convidados, convites, RSVPs e logs.
- `db/seed.sql`: dump SQL para criação rápida das tabelas + dados de exemplo.
- `prisma/seed.ts`: script oficial do Prisma com os mesmos dados do dump.

## Próximos passos sugeridos

- Implementar autenticação administrativa (NextAuth + rota de login).
- Construir o dashboard com resumo, tabela de convidados e ações (WhatsApp / copiar link).
- Criar importação CSV e exportação em CSV/Excel.
- Configurar deploy (frontend: Vercel; backend/DB: Railway ou Supabase) com as variáveis correspondentes.
# ConfraRachaAPCD
# ConfraRachaAPCD
