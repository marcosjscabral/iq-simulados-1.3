# 🎨 Sistema de Design e Layout: IQ Simulados (layout_skill.md)

Este documento atua como o **guia de estilo absoluto** e diretriz de layout para o desenvolvimento do ecossistema do **IQ Simulados**. Toda e qualquer alteração de interface, criação de novos componentes ou refatoração deve obedecer rigorosamente a este conjunto de regras estéticas e padrões de UX.

---

## 🌓 1. Paleta de Cores (Tema Escuro Conforto)

O design deve ser otimizado para sessões prolongadas de leitura, utilizando tons de baixo estresse visual e alto contraste harmônico.

### Cores Principais (Tokens CSS/Tailwind)
*   **Fundo Principal (Background):** `#0B0F19`
    *   *Descrição:* Um azul-escuro espacial profundo, que reduz a fadiga ocular em comparação ao preto puro `#000000`.
*   **Cartões e Superfícies (Surface/Card):** `#1F2937`
    *   *Descrição:* Cinza-azulado escuro com bordas sutis para separar o conteúdo do fundo.
*   **Textos Principais (Text Primary):** `#F3F4F6`
    *   *Descrição:* Branco gelo suave, evitando contraste de 100% que gera astigmatismo digital.
*   **Textos Secundários (Text Secondary):** `#9CA3AF`
    *   *Descrição:* Cinza médio para descrições, subtítulos e metadados.

### Cores de Destaque e Estados
*   **Acento de Marca / IA (Brand/Purple):** `#7C3AED` (Violeta vibrante)
    *   *Uso:* Botões de ação principais, badges especiais, realces de Inteligência Artificial.
*   **Sucesso / Acerto (Success/Green):** `#10B981` (Verde esmeralda)
    *   *Uso:* Respostas corretas, barras de progresso de acerto, feedbacks positivos.
*   **Erro / Incorreto (Error/Red):** `#EF4444` (Vermelho coral)
    *   *Uso:* Respostas incorretas, alertas e cronômetro estourado.

---

## ✍️ 2. Tipografia & Hierarquia Textual

A legibilidade é o foco principal. O concurseiro precisa ler enunciados extensos de forma rápida e confortável.

*   **Tipografia de Interface & Botões:** `Inter` (Sans-serif)
    *   *Uso:* Menus, labels, textos administrativos, botões de ação e dashboard.
*   **Tipografia do Enunciado das Questões:** Alternância dinâmica ou padrão para `Plus Jakarta Sans` ou `Merriweather` (Serifada).
    *   *Uso:* Corpo principal das perguntas de concurso para simular a prova física.
*   **Hierarquia de Títulos:**
    *   `h1`: Extra-Bold / Black, itálico em contextos de branding, com tracking reduzido (ex: `tracking-tighter`).
    *   `h2`/`h3`: Negritos marcantes, uppercase sutil em sub-títulos para transmitir seriedade de concurso.

---

## ✨ 3. Micro-interações, Feedbacks & Animações

Toda interface interativa deve parecer "viva" e responsiva. O uso de micro-animações do **Framer Motion** deve ser padronizado.

### Alternativas de Questão (Cartões de Múltipla Escolha)
1.  **Estado Padrão:** Borda sutil `#2D3748`, fundo `#1F2937`, cantos arredondados (`rounded-xl`).
2.  **Estado Hover/Foco:** Borda acesa com tom violeta `#7C3AED`, leve elevação 3D de 2px (`transform: translateY(-2px)`) e transição suave de `200ms`.
3.  **Estado de Clique (Active):** Escala de pressão sutil (`scale-95`).
4.  **Feedback Instantâneo de Resposta:**
    *   *Correta:* Brilho verde esmeralda `#10B981`, escala expandindo 2% e ícone de check.
    *   *Incorreta:* Efeito de vibração horizontal (*shake* animado via framer-motion) em vermelho coral `#EF4444` e alternativa correta marcada em verde estático.

### Painéis de Explicação da IA
*   **Estrutura:** Utilizar um painel expansível vertical (*accordion*) animado.
*   **Aparência:** Fundo transparente com efeito `backdrop-blur-md` e borda brilhante superior.
*   **Organização Interna:** Abas rápidas para navegação:
    *   📜 *Lei Seca (Fundamentação)*
    *   🔍 *Análise da Pegadinha*
    *   💡 *Mnemônico / Dica*

---

## 📱 4. Padrões de Layout Responsivo & Acessibilidade

O aplicativo é majoritariamente utilizado em dispositivos móveis durante o tempo livre do estudante.

*   **Tamanho de Toque (Touch Targets):** Garantir que todas as alternativas de simulado tenham altura mínima de `48px` para evitar cliques acidentais no celular.
*   **Cabeçalho Mobile Fixo:** O topo deve conter a barra de progresso do simulado e o botão de timer sempre visíveis ao rolar a página.
*   **Modo Silencioso (Timer de Prova):** Opção no cabeçalho para esconder feedbacks de acerto imediatos, exibindo apenas o cronômetro correndo para simular a pressão real de prova.

---

## 🛠️ 5. Práticas de Código e Implementação

*   **Design System com Tailwind v4:** Utilizar variáveis semânticas CSS mapeadas no arquivo global de estilo (`index.css`) em vez de aplicar cores absolutas inline.
*   **Framer Motion:** Centralizar as variantes de animação em um arquivo de constantes (`src/utils/animations.ts`) para consistência.
