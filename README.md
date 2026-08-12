# Agenda Fácil — Web

Frontend do [Agenda Fácil](https://github.com/Juao-crtl-c/agenda-facil-api),
sistema de agendamento online para negócios locais, desenvolvido pela
**Vianova Dev**. Este repositório é a "vitrine": a página pública onde o
cliente marca horário sozinho e o painel onde o dono configura tudo — os
dois consumindo a [API REST própria](https://github.com/Juao-crtl-c/agenda-facil-api)
via `fetch`, sem acesso direto a banco.

Segue a mesma identidade visual do primeiro projeto da marca, [Vianova Gestão
Financeira](https://github.com/Juao-crtl-c/vianova-gestao-financeira), pra
manter consistência de portfólio de estúdio.

## Produção

**https://agenda-facil-web-tan.vercel.app** — publicado na Vercel, deploy
automático a cada push em `master`. Consome a [API em
produção](https://github.com/Juao-crtl-c/agenda-facil-api) na Render.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS. Sem cliente Prisma nem
acesso a banco aqui — toda persistência passa pela API.

- **Página pública é Server-Side Rendered** (`app/[slug]/page.tsx`): busca o
  negócio no servidor a cada request (`cache: "no-store"`, sempre atual) —
  bom SEO e carregamento rápido, já que é o link que o dono compartilha com
  clientes de verdade.
- **Painel do dono é renderizado no client**, depois do login: guarda de
  rota simples (`app/painel/layout.tsx`) verifica o token e redireciona pra
  `/entrar` se ausente.
- **Autenticação**: JWT em `localStorage`, injetado como
  `Authorization: Bearer` em cada chamada autenticada (`lib/api.ts`). Escolha
  deliberada de simplicidade — é o padrão comum pra uma SPA consumindo uma
  API externa própria; uma versão mais robusta trocaria isso por um cookie
  httpOnly atrás de um proxy (Route Handlers do Next), mas não era o foco
  desta rodada.

## Estrutura

```
app/
  [slug]/                       página pública de agendamento (SSR)
  agendamentos/[token]/         detalhes, cancelar, remarcar
  painel/                       área do dono (negócio, serviços, agenda)
  entrar/ cadastro/             auth
lib/
  api.ts                        fetch wrapper com tratamento de erro padrão
  auth.ts                       token em localStorage + hook useAuth
  painel-context.tsx            estado do negócio do dono compartilhado
                                 entre as páginas do painel
components/                     FluxoAgendamento (wizard de agendamento),
                                 DetalhesAgendamento, PainelSidebar
```

## Passo a passo para rodar

Precisa da [API](https://github.com/Juao-crtl-c/agenda-facil-api) rodando
(local ou publicada) — sem ela, nada aqui funciona.

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, default localhost:3333/api
npm install
npm run dev
```

Acesse `http://localhost:3000`. Fluxo de teste completo: crie uma conta em
`/cadastro` → configure o negócio, horário de funcionamento e um serviço no
painel → abra `/<seu-slug>` (o link público) → agende como se fosse cliente
→ confira em `/painel/agenda`.

## Próximos passos (roadmap)

- [ ] Cookie httpOnly via proxy Next em vez de token em localStorage
- [ ] Visão mensal (calendário) além da semanal em `/painel/agenda`
- [ ] Múltiplos profissionais por negócio (quando a API suportar)
