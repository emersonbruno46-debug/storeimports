# Auditoria — Store Imports (catálogo + painel)

Escopo: `index.html`/`app.js` (catálogo público), `admin.html`/`admin.js`/`admin.css` (painel), `store_data.js` (camada de dados) e `migrations/`.
Método: leitura do código + execução do painel no navegador. **Não** foi feito teste de carga, Lighthouse nem teste em celulares reais.

Legenda: ✅ corrigido nesta entrega · 🛠 preparado (falta ligar) · ⏳ pendente

---

## Crítico

| # | Achado | Status |
|---|--------|--------|
| C1 | **A reserva do cliente nunca chega à loja.** `createDemoReservation()` grava no `localStorage` do *navegador do visitante*. O painel, aberto em outro aparelho, não vê nada. Hoje o catálogo só funciona como demo. | 🛠 RPC `fn_create_reservation` + `SupabaseAdapter.api.createReservation` prontos; falta ligar o formulário (fase 1 do `DATABASE.md`). Enquanto isso, o botão de WhatsApp da tela de sucesso é o único canal real. |
| C2 | **O painel não tem login.** Qualquer pessoa que abra `/admin.html` tem acesso total; o "perfil" (Thallys/Joice) é só um seletor sem senha. | 🛠 `profiles` + `is_staff()/is_admin()` + RLS na `002`; `SupabaseAdapter.api.signIn` pronto. Falta a tela de login. **Não publique o painel em domínio público antes disso.** |
| C3 | **XSS armazenado no painel.** Nomes de cliente, aparelho, problema, produto e categoria eram concatenados em `innerHTML` sem escape (manutenções, cupom impresso, selects, promoções, galeria). Um texto como `<img onerror=…>` digitado em um campo executava no painel. | ✅ helper `esc()` aplicado em todos os pontos listados. Revisar sempre que surgir um novo `innerHTML`. |
| C4 | **Filtro de status das Reservas nunca funcionava.** As opções usavam rótulos ("Aguardando confirmação") mas o dado guarda `new/contacted/…`; qualquer filtro retornava lista vazia. | ✅ |

## Alto

| # | Achado | Status |
|---|--------|--------|
| A1 | Migration `001`: policies `FOR ALL TO authenticated USING (true)` — qualquer conta logada (inclusive cadastro aberto) seria admin. | 🛠 substituídas na `002` |
| A2 | Migration `001`: `fn_complete_reservation` / `fn_refund_sale` são `SECURITY DEFINER`, executáveis por `anon` e confiam em `p_actor_user_id` vindo do cliente (auditoria falsificável). | 🛠 `002` renomeia para `_impl_*`, revoga acesso e expõe wrappers só para staff usando `auth.uid()` |
| A3 | Migration `001`: `INSERT … WITH CHECK (true)` público em `reservations` permitia o navegador definir preço, total e status. | 🛠 `002` remove e cria `fn_create_reservation` (preço calculado no servidor, limites de quantidade) |
| A4 | Migration `001`: a policy pública de variantes expõe **`cost_cents`** (preço de custo) e IMEIs pela API pública. RLS filtra linhas, não colunas. | 🛠 `002` restringe colunas do `anon` |
| A5 | Migration `001`: código de venda `VD-` + `random()` de 4 dígitos → colisão no `UNIQUE` após algumas centenas de vendas. O mesmo no front (`#SI-` + random). | 🛠 sequences + trigger na `002` |
| A6 | Fotos de produto/categoria são salvas em base64 no `localStorage` (~5 MB de teto). Poucas fotos esgotam a cota e o `saveStoreData` falha só com `console.error`. | 🛠 bucket `product-images` + tabela `product_images` + upload no importador. ⏳ mostrar erro ao usuário quando a gravação falhar |
| A7 | Os dados do painel vivem só no navegador: limpar o cache apaga tudo. | ✅ backup/restauração JSON em Configurações · 🛠 banco |

## Médio

| # | Achado | Status |
|---|--------|--------|
| M1 | Visão Geral tinha números **inventados**: gráfico "Volume Mensal" com barras fixas, "Saúde Operacional: 100%" e "0 erros" estáticos. Induzia a decisão errada. | ✅ removidos; tudo vem dos dados |
| M2 | Botão **"Resetar Dados"** dentro das Ações Rápidas da Visão Geral (perigo a um clique). | ✅ movido para "Zona de risco" em Configurações |
| M3 | Ações Rápidas apontavam para abas inexistentes por apelido (`pdv`, `config`) e "Novo Produto" só trocava de aba sem abrir o formulário. | ✅ |
| M4 | Log de atividade ganhava uma linha a cada recarga do painel e crescia sem limite. | ✅ 1 registro por sessão do navegador; teto de 300 |
| M5 | Filtro de categoria de Produtos tinha opções fixas (Capas, Fones, Películas…) que não existem no cadastro. | ✅ montado a partir das categorias reais |
| M6 | `assets/placeholder.png` é referenciado mas **não existe** (imagem quebrada em todo produto sem foto). | ✅ `placeholder.svg` |
| M7 | Todo registro grava `actorUserId: 'user-1'`, ignorando o perfil selecionado. Auditoria de "quem fez" é inútil. | ⏳ resolvido de verdade com login (C2) |
| M8 | `chart.js` carregado sem versão fixa (`@latest`); `lucide` via unpkg. Uma versão nova pode quebrar o painel sem aviso. | ✅ chart.js fixado em 4.4.1 |
| M9 | `ATIVACAO.md`: variáveis `NEXT_PUBLIC_*` não se aplicam (o site é estático, sem Next); o passo "criar admin" insere em `activity_logs` em vez de dar papel a alguém. | ✅ corrigido |
| M10 | Seeds com referências soltas (`mov-2` aponta para `sale-100`, que não existe) quebrariam a importação por FK. | ✅ importador limpa referências órfãs |

## Baixo / observações

- ~230 `style="…"` inline em HTML → dificulta tema/manutenção.
- `index.html` e `admin.html` repetem todo o CSS base em `style.css` (2.855 linhas) — vale revisar o que o painel realmente usa.
- Estoque só é descontado no faturamento; a reserva **não bloqueia** unidades. Dois clientes podem reservar a última peça. Decisão de negócio (ver `PENDENCIAS_BRUNO.md`, prazo de retirada).
- Não há tela de "Detalhe da reserva" com histórico (`history` é salvo, mas não exibido).
- `out.txt` (vazio) está versionado — pode ser removido.
- Acessibilidade: itens do menu lateral eram `div` sem foco por teclado (✅ agora têm `role="button"`, `tabindex` e Enter/Espaço). Contraste e leitores de tela não foram medidos.
- SEO do catálogo: sem `sitemap.xml`, sem dados estruturados (`Product`/`LocalBusiness`) e sem `og:image`.

## O que mudou no painel (resumo)

- **Visão Geral** vira central de comando: saudação, ações rápidas, "Precisa de atenção" (reservas sem resposta/vencidas, estoque zerado/baixo, manutenção parada, promoção expirando, produto sem custo — cada item abre a tela certa já filtrada), KPIs com comparação ao período anterior (faturamento, vendas, ticket, lucro bruto estimado, estoque a custo), gráfico real de faturamento por dia, mais vendidos.
- **Menu lateral** agrupado (Operação / Catálogo / Sistema) com contadores de pendências.
- **Busca rápida** `Ctrl+K` (produtos, reservas, vendas, manutenções e páginas).
- **Configurações**: status do banco, backup/restauração JSON, zona de risco.
- **Todas as telas** passaram a usar um mesmo sistema visual (`admin-ui.css` + `admin_views.js`):
  - **Reservas**: cartões com situação, itens, retirada ("hoje/amanhã/vencida"), botão de WhatsApp com mensagem pronta e um único botão com o próximo passo (contato → confirmar → faturar).
  - **Estoque**: resumo, filtro por situação, barra de nível por variação e gaveta lateral de movimentação (entrada/saída/contagem, com o saldo resultante antes de salvar).
  - **Promoções**: construtor em 3 passos com resumo ao vivo, aviso de preço abaixo do custo e lista de promoções ativas com remoção individual.
  - **Produtos / Categorias / Vendas / Manutenções (quadro kanban) / Equipe**: filtros em chips, tabelas e cartões redesenhados, nova venda em gaveta com total em tempo real.

## Limitações desta entrega

- Testado: carregamento do painel sem erros de console, navegação a partir dos alertas, busca rápida, troca de período, mapeadores do adaptador (ida e volta em produto). **Não testado:** SQL contra um Postgres real, `importBackup` contra um projeto Supabase, layout em celular físico.
- Os formulários de cadastro de produto, categoria e manutenção (janelas modais) mantêm o visual anterior; herdam só as cores e bordas novas.
- Lucro estimado só considera vendas cujos itens têm custo cadastrado; fica marcado como "parcial" quando faltam.
