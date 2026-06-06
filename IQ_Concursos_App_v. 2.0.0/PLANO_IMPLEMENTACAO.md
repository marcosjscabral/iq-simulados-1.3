# Plano de Implementação - PreparaAI (IQ Simulados 2.0.0)

## 📋 Visão Geral

**Produto:** Plataforma de estudos para concurseiros e estudantes  
**Objetivo do MVP:** CRUD manual de flashcards e decks + sessão de estudo com flip cards + simulados de múltipla escolha + dashboard simples  
**Prazo estimado:** 3-4 semanas (1 dev full-time + IA)  
**Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Prisma, Supabase (PostgreSQL), Vercel  

---

## 🎯 Filosofia de Desenvolvimento Acelerado com IA

- Stack simples e consolidada (menos curva de aprendizado, mais exemplos na internet)
- Código gerado por IA revisado manualmente
- Padronização de prompts para cada tipo de tarefa
- Componentes atômicos: cada tela, componente e endpoint será gerado individualmente
- Testes manuais frequentes: a cada feature, testar antes de avançar
- Uma feature por vez: evitar prompts gigantes que confundem a IA

---

## 🏗️ Stack Escolhida (MVP)

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | **Next.js 14 + Tailwind CSS + shadcn/ui** | Aproveita o design system já criado, componentes prontos, SSR opcional |
| Backend | **Next.js API Routes + NextAuth.js** | Monorepo simplificado, sem necessidade de servidor separado |
| Banco de Dados | **PostgreSQL via Supabase** | Gratuito generoso, autenticação built-in, RLS, real-time opcional |
| ORM | **Prisma** | Type-safe, migrations automáticas, excelente DX |
| Autenticação | **Supabase Auth** | Google OAuth, email/senha, zero configuração |
| Hospedagem | **Vercel** | Deploy automático do Next.js, domínio grátis, CI/CD integrado |
| Ícones | **Material Symbols** | Consistência visual com os mockups existentes |
| Fontes | **Inter** | Legibilidade comprovada, já configurada no design system |

---

## 📁 Estrutura de Pastas (Feature-Based Architecture)

> **Princípio:** Cada feature é autocontida. Para adicionar/remover/modificar uma feature, mexe-se apenas na pasta dela dentro de `features/`. Isso garante que mudanças em Flashcards não quebrem Simulados, e vice-versa.

```
preparaai/
├── src/
│   ├── app/                          # Next.js App Router (APENAS roteamento)
│   │   ├── layout.tsx                # Layout raiz (providers, metadados)
│   │   ├── page.tsx                  # Home (escolha de caminho)
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   └── (app)/                    # Rotas protegidas
│   │       ├── layout.tsx            # Layout com sidebar/bottomnav
│   │       ├── flashcards/
│   │       │   ├── page.tsx          # → importa de features/flashcards
│   │       │   ├── [deckId]/
│   │       │   │   ├── page.tsx
│   │       │   │   └── study/
│   │       │   │       └── page.tsx
│   │       ├── simulados/
│   │       │   ├── page.tsx          # → importa de features/simulados
│   │       │   ├── [examId]/
│   │       │   │   ├── page.tsx
│   │       │   │   └── resultado/
│   │       │   │       └── page.tsx
│   │       ├── dashboard/
│   │       │   └── page.tsx          # → importa de features/dashboard
│   │       ├── anotacoes/
│   │       │   └── page.tsx          # → placeholder (feature futura)
│   │       ├── vade-mecum/
│   │       │   └── page.tsx          # → placeholder (feature futura)
│   │       └── perfil/
│   │           └── page.tsx
│   │
│   ├── features/                     # 🧩 Cada feature é um módulo independente
│   │   ├── flashcards/
│   │   │   ├── index.ts              # Barrel file - exporta apenas o necessário
│   │   │   ├── components/
│   │   │   │   ├── deck-card.tsx
│   │   │   │   ├── deck-list.tsx
│   │   │   │   ├── flashcard-item.tsx
│   │   │   │   ├── flip-card.tsx
│   │   │   │   ├── create-deck-dialog.tsx
│   │   │   │   └── create-flashcard-dialog.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-decks.ts
│   │   │   │   └── use-study-session.ts
│   │   │   ├── api/
│   │   │   │   └── route.ts          # /api/flashcards e /api/decks
│   │   │   ├── types.ts             # Interfaces locais (Deck, Flashcard, etc.)
│   │   │   └── utils.ts             # Funções auxiliares da feature
│   │   │
│   │   ├── simulados/
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   │   ├── exam-card.tsx
│   │   │   │   ├── exam-list.tsx
│   │   │   │   ├── question-card.tsx
│   │   │   │   ├── alternative-list.tsx
│   │   │   │   └── timer.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-exam-session.ts
│   │   │   ├── api/
│   │   │   │   └── route.ts          # /api/exams e /api/attempts
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   │   ├── stats-card.tsx
│   │   │   │   └── progress-chart.tsx
│   │   │   ├── api/
│   │   │   │   └── route.ts          # /api/stats
│   │   │   └── types.ts
│   │   │
│   │   └── auth/                     # Feature de autenticação
│   │       ├── index.ts
│   │       ├── components/
│   │       │   ├── login-form.tsx
│   │       │   └── user-avatar.tsx
│   │       ├── hooks/
│   │       │   └── use-auth.ts
│   │       └── api/
│   │           └── route.ts
│   │
│   ├── shared/                       # 🔧 Compartilhado entre features
│   │   ├── ui/                       # shadcn/ui components (gerado pelo CLI)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── bottom-nav.tsx
│   │   │   └── header.tsx
│   │   ├── types.ts                 # Tipos globais (User, etc.)
│   │   └── lib/
│   │       ├── supabase/
│   │       │   ├── client.ts
│   │       │   ├── server.ts
│   │       │   └── middleware.ts
│   │       ├── prisma.ts
│   │       └── utils.ts             # Funções utilitárias globais
│   │
│   └── styles/
│       ├── globals.css
│       └── design-tokens.css        # Tokens extraídos do DESIGN.md
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### 🔒 Regras de encapsulamento entre features

1. **Cada feature expõe apenas seu `index.ts` (barrel file):**
   ```typescript
   // features/flashcards/index.ts
   export { DeckCard } from './components/deck-card'
   export { FlipCard } from './components/flip-card'
   export { useStudySession } from './hooks/use-study-session'
   export type { Deck, Flashcard } from './types'
   // NADA mais vaza para fora
   ```

2. **Features NÃO importam diretamente de outras features.** Se precisar de algo comum, vai para `shared/`.

3. **As páginas em `app/` são apenas wrappers finos** que importam componentes das features:
   ```typescript
   // app/(app)/flashcards/page.tsx
   import { DeckList } from '@/features/flashcards'
   
   export default function FlashcardsPage() {
     return <DeckList />
   }
   ```

4. **API Routes são co-localizadas** com sua feature (em `features/[nome]/api/`), mas mapeadas via Next.js App Router em `app/api/` com re-exports.

5. **Tipos são definidos localmente** em `features/[nome]/types.ts`. Apenas tipos realmente globais (ex: `User`) ficam em `shared/types.ts`.

### ✅ Vantagens dessa estrutura

| Cenário | Impacto |
|---------|---------|
| **Trocar todo o sistema de flashcards** | Mexe apenas em `features/flashcards/` e `app/(app)/flashcards/`. Nada mais. |
| **Adicionar feature nova** (ex: Anotações) | Cria `features/anotacoes/` + página em `app/`. Zero risco para o resto. |
| **Mudar design system** | Altera `shared/ui/` e `design-tokens.css`. Features consomem automaticamente. |
| **Trocar ORM ou banco** | Altera `shared/lib/prisma.ts` e `schema.prisma`. Features não sabem disso. |
| **Desenvolvedor novo** | Foca apenas na feature que vai trabalhar. Não precisa entender o projeto inteiro. |
| **Testes** | Cada feature tem seus próprios testes, rodam isolados, não quebram por mudanças externas. |

---

## 🗄️ Modelagem do Banco (Prisma Schema)

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  decks         Deck[]
  examAttempts  ExamAttempt[]
}

model Deck {
  id            String      @id @default(uuid())
  name          String
  description   String?
  subject       String      // Direito Penal, Constitucional...
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  flashcards    Flashcard[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Flashcard {
  id              String    @id @default(uuid())
  front           String
  back            String
  difficulty      String    @default("new")  // new, learning, mastered
  ease            Float     @default(2.5)    // fator SM-2
  interval        Int       @default(0)      // intervalo em dias
  repetitions     Int       @default(0)
  nextReviewDate  DateTime  @default(now())
  lastReviewedAt  DateTime?
  deckId          String
  deck            Deck      @relation(fields: [deckId], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Exam {
  id            String        @id @default(uuid())
  title         String
  description   String?
  subject       String
  questionCount Int           @default(10)
  timeLimitMin  Int?          // minutos, opcional
  questions     Question[]
  attempts      ExamAttempt[]
  createdAt     DateTime      @default(now())
}

model Question {
  id            String        @id @default(uuid())
  text          String
  examId        String
  exam          Exam          @relation(fields: [examId], references: [id])
  alternatives  Alternative[]
  orderIndex    Int           @default(0)
}

model Alternative {
  id            String        @id @default(uuid())
  text          String
  isCorrect     Boolean       @default(false)
  questionId    String
  question      Question      @relation(fields: [questionId], references: [id])
  orderIndex    Int           @default(0)
}

model ExamAttempt {
  id            String        @id @default(uuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  examId        String
  exam          Exam          @relation(fields: [examId], references: [id])
  score         Int           @default(0)
  totalQuestions Int          @default(0)
  answers       Json?         // { questionId: selectedAlternativeId }
  startedAt     DateTime      @default(now())
  finishedAt    DateTime?
}

model StudySession {
  id            String        @id @default(uuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  deckId        String
  deck          Deck          @relation(fields: [deckId], references: [id])
  cardsReviewed Int           @default(0)
  easyCount     Int           @default(0)
  mediumCount   Int           @default(0)
  hardCount     Int           @default(0)
  durationMin   Int           @default(0)
  createdAt     DateTime      @default(now())
}
```

---

## 📅 Fases do Projeto

### Fase 0: Setup e Fundação (2-3 dias)

**Objetivo:** Projeto rodando localmente, banco conectado, autenticação funcionando.

| # | Tarefa | Descrição | Prompt sugerido para IA |
|---|--------|-----------|-------------------------|
| 0.1 | Criar projeto Next.js | `npx create-next-app@latest preparaai --typescript --tailwind --app --src-dir` | - |
| 0.2 | Configurar shadcn/ui | Inicializar com tokens do DESIGN.md | "Configure shadcn/ui with these design tokens: [colar DESIGN.md]" |
| 0.3 | Configurar Supabase | Criar projeto no Supabase, configurar env vars | - |
| 0.4 | Configurar Prisma | Schema inicial com modelos User, Deck, Flashcard | "Create Prisma schema for: User (auth), Deck, Flashcard as specified in [colar schema]" |
| 0.5 | Configurar autenticação | Supabase Auth + middleware Next.js | "Implement Supabase Auth in Next.js with Google OAuth and middleware for protected routes" |
| 0.6 | Layout base | Sidebar desktop + BottomNav mobile (igual mockup) | "Create a Next.js layout component matching this HTML: [colar code.html da visualiza_o_do_deck]" |
| 0.7 | Design System CSS | Extrair tokens do DESIGN.md para Tailwind config + CSS variables | "Convert this Design System JSON into Tailwind config and CSS custom properties: [colar DESIGN.md]" |

**Entregáveis:** 
- [x] Projeto rodando em `localhost:3000`
- [x] Login com Google funcionando
- [x] Layout responsivo com navegação (4 abas: Flashcards, Anotações, IA Mentor, Vade Mecum)
- [x] Paleta de cores e tipografia do design system aplicadas

---

### Fase 1: CRUD de Decks e Flashcards (3-4 dias)

**Objetivo:** Usuário pode criar, editar e excluir decks e flashcards manualmente.

| # | Tarefa | Descrição | Referência mockup |
|---|--------|-----------|-------------------|
| 1.1 | Página de listagem de decks | Grid de cards com nome, descrição, contagem | `visualiza_o_do_deck` |
| 1.2 | Página de detalhes do deck | Lista de flashcards com filtros (Todos/Revisar/Aprendidos) | `visualiza_o_do_deck` |
| 1.3 | Modal de criar/editar deck | Form com nome, descrição, matéria | - |
| 1.4 | Modal de criar flashcard | Form com frente/verso + tags | `gerador_de_flashcards` (adaptado para manual) |
| 1.5 | Edição inline de flashcard | Botão editar na lista, transforma em textarea | `gerador_de_flashcards` (campo editável já existe) |
| 1.6 | Exclusão com confirmação | Dialog de confirmação antes de deletar | - |
| 1.7 | Toast de feedback | Notificações de sucesso/erro (shadcn toast) | - |
| 1.8 | API Routes | CRUD endpoints: `/api/decks`, `/api/decks/[id]`, `/api/flashcards`, `/api/flashcards/[id]` | - |

**Entregáveis:**  
- [x] CRUD completo de Decks e Flashcards
- [x] Validações básicas (campos obrigatórios)
- [x] UX responsiva mobile/desktop

---

### Fase 2: Sessão de Estudo - Flip Cards (3-4 dias)

**Objetivo:** Usuário pode estudar um deck com o sistema de flip card e feedback.

| # | Tarefa | Descrição | Referência mockup |
|---|--------|-----------|-------------------|
| 2.1 | Página de sessão de estudo | Header com nome do deck + progresso + botão fechar | `revis_o_inteligente` |
| 2.2 | Card 3D flip animation | CSS perspective + rotateY (já existe no mockup) | `revis_o_inteligente` (animação `is-flipped`) |
| 2.3 | Botão "Mostrar Resposta" | Revela o verso do card | `revis_o_inteligente` |
| 2.4 | Feedback buttons | "Não sabia" / "Duvidei" / "Sabia" com cores diferentes | `revis_o_inteligente` (feedback-actions) |
| 2.5 | Lógica de progressão | Tracking de quais cards foram vistos, qual a dificuldade | - |
| 2.6 | Barra de progresso | Percentual concluído com glow effect | `revis_o_inteligente` (progress bar) |
| 2.7 | Resumo pós-sessão | Estatísticas da sessão: cards vistos, acertos, tempo | - |

**Entregáveis:**  
- [x] Sessão de estudo funcional com flip animation
- [x] Registro de progresso por card
- [x] UX fluida com animações CSS suaves

---

### Fase 3: Simulados Básicos (4-5 dias)

**Objetivo:** Usuário pode responder questões de múltipla escolha e ver o resultado.

| # | Tarefa | Descrição | Referência mockup |
|---|--------|-----------|-------------------|
| 3.1 | Modelagem no Prisma | Model Exam (simulado) + Question + Alternative | - |
| 3.2 | Seed de questões | Script para popular questões de exemplo (10-20 questões) | - |
| 3.3 | Tela de escolha de simulado | Cards com informações do simulado (questões, tempo, matéria) | `escolha_seu_caminho` (adaptar card de Simulados) |
| 3.4 | Tela de realização do simulado | Questão + alternativas + navegação entre questões | `rea_de_simulado` (screen.png) |
| 3.5 | Cronômetro | Timer regressivo (opcional no MVP) | - |
| 3.6 | Tela de resultado | Gabarito, acertos/erros, percentual por matéria | `detalhes_do_simulado` |
| 3.7 | Histórico de simulados | Lista de simulados realizados com nota | `simulados_recentes` |

**Entregáveis:**  
- [x] Simulados de múltipla escolha funcionais
- [x] Correção automática com gabarito
- [x] Histórico de tentativas

---

### Fase 4: Dashboard e Perfil (2-3 dias)

**Objetivo:** Dashboard simples com estatísticas e página de perfil.

| # | Tarefa | Descrição | Referência mockup |
|---|--------|-----------|-------------------|
| 4.1 | Dashboard do estudante | Cards de resumo: total de flashcards, simulados feitos, tempo estudado | `dashboard_do_estudante` |
| 4.2 | Gráfico de progresso | Barras/linhas simples de evolução (recharts) | `an_lise_por_disciplina` |
| 4.3 | Página de perfil | Avatar, nome, email, estatísticas | Já existe avatar no header |
| 4.4 | Página de configurações | Trocar tema (claro/escuro), notificações | - |

**Entregáveis:**  
- [x] Dashboard funcional com dados reais
- [x] Perfil do usuário editável

---

### Fase 5: Ajustes finos e Deploy (2-3 dias)

| # | Tarefa | Descrição |
|---|--------|-----------|
| 5.1 | Responsividade total | Testar e ajustar todos os breakpoints |
| 5.2 | PWA básico | Manifest, service worker (next-pwa) |
| 5.3 | SEO básico | Metadata, titles, descriptions |
| 5.4 | Deploy Vercel | Conectar repo, configurar env vars |
| 5.5 | Domínio customizado | Configurar domínio próprio |
| 5.6 | Testes E2E básicos | Playwright para fluxos principais |

---

## 📊 Linha do Tempo

```
Semana 1:
  Dias 1-2:   Fase 0 (Setup - projeto, banco, auth, layout)
  Dias 3-5:   Fase 1 início (Listagem de decks, criar deck/flashcard)
  Dias 6-7:   Fase 1 conclusão (Edição, exclusão, API routes)

Semana 2:
  Dias 8-9:   Fase 2 início (Página de estudo, flip animation)
  Dias 10-11: Fase 2 conclusão (Feedback, progresso, resumo)
  Dias 12-14:  Fase 3 início (Model Exam, seed, tela de escolha)

Semana 3:
  Dias 15-17: Fase 3 conclusão (Realização do simulado, resultado, histórico)
  Dias 18-19: Fase 4 (Dashboard e perfil)

Semana 4:
  Dias 20-21: Fase 5 (Ajustes, PWA, SEO, Deploy)
```

**Total: 3-4 semanas com 1 dev + IA, trabalhando focado.**

---

## 🤖 Template de Prompt para IA

Para cada tarefa do plano, usar este template:

```
## Tarefa: [nome da tarefa conforme o plano]

**Contexto:**
- Projeto: PreparaAI - plataforma de estudos para concurseiros
- Stack: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Prisma, Supabase
- Design System: [colar trecho relevante do DESIGN.md]
- Mockup de referência: [colar code.html relevante ou descrever a tela]

**O que preciso:**
[descrição clara e objetiva do componente/página/endpoint]

**Requisitos:**
- [requisito 1]
- [requisito 2]
- [requisito 3]

**Tokens de design:**
- Primary: #4648d4
- Background: #f9f9ff
- Surface: #ffffff
- Text: #111c2d
- Text secondary: #464554
- Border radius: 12px-16px cards, 8px-12px inputs
- Font: Inter

**Restrições:**
- Usar apenas shadcn/ui components + Tailwind
- Seguir o padrão de código do projeto
- TypeScript estrito
- Responsivo mobile-first
```

---

## ✅ Checklist de Progresso

### Fase 0: Setup e Fundação
- [ ] 0.1 - Projeto Next.js criado
- [ ] 0.2 - shadcn/ui configurado com design tokens
- [ ] 0.3 - Projeto Supabase criado e variáveis de ambiente configuradas
- [ ] 0.4 - Prisma schema criado e primeira migration rodada
- [ ] 0.5 - Autenticação com Google OAuth funcionando
- [ ] 0.6 - Layout base com sidebar + bottom nav implementado
- [ ] 0.7 - Design system CSS aplicado globalmente

### Fase 1: CRUD de Decks e Flashcards
- [ ] 1.1 - Página de listagem de decks
- [ ] 1.2 - Página de detalhes do deck com lista de flashcards
- [ ] 1.3 - Modal de criar/editar deck
- [ ] 1.4 - Modal de criar flashcard
- [ ] 1.5 - Edição inline de flashcard
- [ ] 1.6 - Exclusão com diálogo de confirmação
- [ ] 1.7 - Toast de feedback
- [ ] 1.8 - API Routes CRUD

### Fase 2: Sessão de Estudo - Flip Cards
- [ ] 2.1 - Página de sessão de estudo
- [ ] 2.2 - Animação 3D de flip do card
- [ ] 2.3 - Botão "Mostrar Resposta"
- [ ] 2.4 - Botões de feedback (Não sabia / Duvidei / Sabia)
- [ ] 2.5 - Lógica de progressão e tracking
- [ ] 2.6 - Barra de progresso com glow effect
- [ ] 2.7 - Resumo pós-sessão

### Fase 3: Simulados Básicos
- [ ] 3.1 - Modelagem Prisma (Exam, Question, Alternative)
- [ ] 3.2 - Seed de questões de exemplo
- [ ] 3.3 - Tela de escolha de simulado
- [ ] 3.4 - Tela de realização do simulado
- [ ] 3.5 - Cronômetro (opcional)
- [ ] 3.6 - Tela de resultado com gabarito
- [ ] 3.7 - Histórico de simulados

### Fase 4: Dashboard e Perfil
- [ ] 4.1 - Dashboard do estudante
- [ ] 4.2 - Gráfico de progresso
- [ ] 4.3 - Página de perfil
- [ ] 4.4 - Página de configurações

### Fase 5: Ajustes finos e Deploy
- [ ] 5.1 - Responsividade total testada
- [ ] 5.2 - PWA configurado
- [ ] 5.3 - SEO básico implementado
- [ ] 5.4 - Deploy no Vercel realizado
- [ ] 5.5 - Domínio customizado configurado
- [ ] 5.6 - Testes E2E básicos

---

## 🔗 Referências

### Arquivos de design existentes:
- `IQ Simulados 2.0.0 - design/academic_intelligence_system/DESIGN.md` - Design System completo
- `IQ Simulados 2.0.0 - design/escolha_seu_caminho/code.html` - Tela inicial de escolha de caminho
- `IQ Simulados 2.0.0 - design/escolha_seu_caminho_vers_o_ilustrada_3/code.html` - Versão ilustrada
- `IQ Simulados 2.0.0 - design/revis_o_inteligente/code.html` - Sessão de estudo flip card
- `IQ Simulados 2.0.0 - design/revis_o_inteligente_menu_atualizado/code.html` - Flip card com menu atualizado
- `IQ Simulados 2.0.0 - design/visualiza_o_do_deck_menu_atualizado/code.html` - Detalhes do deck
- `IQ Simulados 2.0.0 - design/gerador_de_flashcards_menu_atualizado/code.html` - Gerador de flashcards
- `IQ Simulados 2.0.0 - design/relat_rio_de_intelig_ncia_menu_atualizado/code.html` - Relatório de inteligência

### Screenshots de referência (telas sem código HTML):
- `rea_de_simulado/screen.png` - Tela de realização de simulado
- `detalhes_do_simulado/screen.png` - Detalhes/resultado do simulado
- `simulados_recentes/screen.png` - Histórico de simulados
- `dashboard_do_estudante/screen.png` - Dashboard do estudante
- `an_lise_por_disciplina/screen.png` - Análise por disciplina
- `detalhes_de_desempenho/screen.png` - Detalhes de desempenho
- `vitrine_de_simulados/screen.png` - Vitrine de simulados
- `meu_progresso_de_estudos/screen.png` - Progresso de estudos
- `biblioteca_vade_mecum/screen.png` - Biblioteca Vade Mecum
- `leitura_da_lei_interativa/screen.png` - Leitura da lei interativa
- `flashcards_inteligentes/screen.png` - Flashcards inteligentes
- `dica_do_ia_mentor/screen.png` - Dica do IA Mentor
- `gerenciamento_de_anota_es/screen.png` - Gerenciamento de anotações
- `criar_nova_prova_admin/screen.png` - Criar nova prova (admin)
- `dashboard_do_administrador/screen.png` - Dashboard do administrador

---

## 📝 Notas

- Este plano cobre apenas o **MVP sem IA** (criação manual de flashcards e questões)
- Features de IA (geração automática de flashcards, análise inteligente, sugestões) serão planejadas na **Fase 2 do produto**
- O Vade Mecum e Anotações serão placeholders no MVP, implementados em versões futuras
- O painel do administrador será planejado separadamente após validação do MVP com usuários
- A cada checkpoint concluído, revisar o progresso e ajustar estimativas das fases seguintes

---

*Última atualização: início do projeto*
*Próxima ação: Fase 0 - Tarefa 0.1 (Criar projeto Next.js)*