# Convite Interativo • Aniversário de 1 Ano das Pititicas

Este repositório reúne todo o front-end, APIs e o painel administrativo usados para criar a experiência oficial de convite digital das Pititicas. A proposta é oferecer um convite com cara de streaming infantil: vídeo em tela cheia, confete, mensagens carinhosas e a praticidade de confirmar presença em segundos. Além disso, o painel dá autonomia para o time Pititicas administrar convidados, acompanhar o engajamento e personalizar visualmente cada detalhe da festa de 1 ano.

## Experiência do convidado

- **Link único com token** (`pages/convite/[token].tsx`): cada convidado recebe uma URL curta que carrega o vídeo, capa em fallback, identidade visual e avatar ilustrado das Pititicas.
- **RSVP guiado**: botões “Vou” / “Não vou”, seletor de acompanhantes com limites por convidado, feedback em tempo real, confetes e bloqueio automático quando o prazo expira (`app/api/rsvp/[token]/route.ts`).
- **Recado estilo Tanabata**: após responder, o convidado escreve um desejo de até 99 caracteres que vai para o mural temático (`app/api/tanabata/[token]/route.ts`).
- **Mural “árvore dos desejos”** (`pages/convite/arvore.tsx`): exibe todos os recados em cartões animados (tanzaku), com fundo em vídeo e organização automática alternando os lados dos galhos.
- **Acessibilidade e boas práticas**: autoplay configurado com `playsInline`, `poster` para fallback, camadas de contraste, mensagem de erro amigável para qualquer inconsistência de token ou prazo.

## Painel administrativo das Pititicas

- **Autenticação segura** (`pages/api/auth/[...nextauth].ts`): NextAuth com Credentials Provider. O primeiro login cria o admin padrão usando as variáveis `DEFAULT_ADMIN_*`.
- **Dashboard** (`pages/admin/index.tsx`): mostra confirmações, recusas, convidados pendentes, total esperado de pessoas, timeline de visualizações e resumo do evento.
- **Gestão de convidados** (`pages/admin/convidados.tsx` + `components/admin/*`): cadastro manual, importação CSV, download de template (`/api/admin/template`), edição inline, limite de acompanhantes e visão detalhada por convidado.
- **Configuração do evento** (`pages/admin/evento.tsx`): formulário para nome, subtítulo, rótulo de data, local, prazos de RSVP, nota adicional, favicon, vídeo e imagens.
- **Segurança e utilitários** (`pages/admin/seguranca.tsx` e `pages/admin/local-config.tsx`): alteração de senha, logs administrativos e um gerador de snippet `.env` para facilitar o setup em outros ambientes.

## Stack e arquitetura

- **Next.js 14** com mistura de App Router (APIs modernas) e Pages Router (rotas tradicionais).
- **TypeScript + React 18** para todo o front-end.
- **Tailwind CSS** para o design neon inspirado em streaming.
- **Prisma + MySQL** (dockerizado) para modelar eventos, convidados, convites, RSVPs, recados e logs.
- **NextAuth** para autenticação do painel.
- **TanStack Query** já instalado para futuras telas reativas em tempo real.

## Estrutura relevante

- `pages/convite/` — fluxo público do convite (RSVP, mural e assets).
- `pages/admin/` — dashboard, gerenciamento de convidados e telas utilitárias.
- `components/admin/` — formulários, tabelas e modais reutilizáveis do painel.
- `prisma/` — `schema.prisma`, migrações, seeds e scripts auxiliares.
- `lib/server/` — camadas de acesso a dados usadas tanto nas páginas quanto nas APIs.
- `public/uploads/` — espaço reservado para subir assets estáticos do convite (vídeos, ícones, etc.).

## Como rodar localmente

1. **Pré-requisitos**
   - Node.js 18+ (com npm ou pnpm)
   - Docker Desktop (para subir o MySQL) ou um servidor MySQL acessível
   - OpenSSL (ou similar) para gerar `NEXTAUTH_SECRET`

2. **Clone e instale dependências**
   ```bash
   npm install
   # ou pnpm install / yarn
   ```

3. **Configure o `.env`**
   - Copie `.env.example` para `.env`.
   - Opcionalmente abra `/admin/local-config` em desenvolvimento para gerar um snippet pronto (o conteúdo também está no arquivo `Ambiente`).
   - Preencha `DATABASE_URL`, `SHADOW_DATABASE_URL`, `NEXTAUTH_SECRET`, `DEFAULT_ADMIN_*` e credenciais opcionais.

4. **Suba o banco**
   ```bash
   docker compose up -d
   ```
   O `docker-compose.yml` cria um MySQL 8 com volume persistente e executa `prisma/init/01-create-shadow-db.sql` automaticamente.

5. **Migre e popule**
   ```bash
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```
   O seed (`prisma/seed.js`) já inclui um evento de exemplo, convidados fictícios e o admin padrão definido pelas variáveis de ambiente.

6. **Execute o app**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000/admin/login` para o painel e `http://localhost:3000/convite/{token}` para testar os convites (use os `shortCode` gerados pelo seed).

## Personalizando para o universo Pititicas

1. **Atualize o seed**: em `prisma/seed.js` altere nome do evento, vídeo, capa, personagem, notas e lista de convidados (lembrando de ajustar `maxCompanions`).
2. **Rode novamente `npm run prisma:seed`** após limpar a base ou use o painel para editar manualmente.
3. **Uploads**: suba vídeos/figuras no `public/uploads` ou em um CDN, atualizando os campos correspondentes no painel de “Evento & Aparência”.
4. **Recados e mural**: o mural Tanabata já está pronto. Você pode traduzir textos diretamente em `pages/convite/[token].tsx` caso queira outra linguagem / emoji.
5. **Deploy**: execute `npm run build` (que roda `prisma migrate deploy` + `next build`). No servidor, configure as mesmas variáveis `.env` e a conexão com o MySQL usado em produção.

## APIs principais

- `POST /api/rsvp` (Pages Router) e `PATCH /api/rsvp/[token]` (App Router) — recebem a confirmação, validam limite de acompanhantes e prazo.
- `PATCH /api/tanabata/[token]` — armazena o recado de 99 caracteres para o mural.
- `GET /api/admin/template` — entrega o CSV modelo para importação de convidados.

## Próximos passos sugeridos

- Integração com WhatsApp Business API para disparar o link tokenizado direto do painel.
- Webhooks de confirmação para alimentar BI/CRM usado pelas Pititicas.
- Converter o mural em tela interativa para o telão da festa (stream ao vivo dos recados).

Com isso, todo o time Pititicas tem um kit completo para convidar, confirmar e encantar os familiares nesta comemoração de 1 ano. Divirta-se construindo novas experiências! 🎉
