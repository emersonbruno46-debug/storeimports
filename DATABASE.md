# Banco de dados — plano de migração (localStorage → Supabase)

Estado atual: **nada foi aplicado em nenhum projeto Supabase.** Esta pasta contém o schema, o adaptador e o roteiro; criar o projeto é o próximo passo.

## Arquivos

| Arquivo | Papel |
|---|---|
| `migrations/001_initial_schema.sql` | Tabelas do catálogo, reservas, vendas, estoque, logs + funções de faturamento/estorno |
| `migrations/002_ops_tables_and_hardening.sql` | Manutenções, promoções, fotos, perfis, configurações da loja; RLS por papel; reserva pública via RPC com preço no servidor; códigos por sequence; índices; bucket de imagens |
| `supabase_adapter.js` | Cliente (carregado só ao conectar), mapeadores camelCase↔snake_case, leituras, RPCs, login e `importBackup()` |
| `store_data.js` → `DataAdapter` | Ponto de troca demo/produção (`DEMO_CONFIG.isDemo`) |

## Mapa de coleções → tabelas

| localStorage (`store_imports_demo_v3_*`) | Tabela | Observações |
|---|---|---|
| `categories` | `categories` | `image` é nome de arquivo em `assets/`; vira URL do Storage quando houver upload |
| `products` (+ `variants[]`, `images[]`) | `products`, `product_variants`, `product_images` | variações viram linhas; fotos base64 sobem para o bucket `product-images` |
| `reservations` (+ `items[]`) | `reservations`, `reservation_items` | cliente cria por `fn_create_reservation` |
| `sales` (+ `items[]`) | `sales`, `sale_items` | histórico imutável: correção só via `fn_refund_sale` |
| `stockMovements` | `stock_movements` | imutável |
| `maintenances` | `maintenances` | |
| `promotions` | `promotions` | |
| `users` | `profiles` | ligado a `auth.users`; **não** é importado (criar pelo Auth) |
| `activityLog` | `activity_logs` | imutável |
| `DEMO_CONFIG` (contato, endereço…) | `store_settings` | linha única |

Valores em dinheiro são sempre **centavos inteiros** (`*_cents`), igual ao código atual.

## Passo a passo

### 0. Criar o projeto (você)
Crie o projeto em supabase.com. Anote **Project URL** e **anon key** (a `service_role` nunca vai para o front).

### 1. Aplicar o schema
SQL Editor → cole e rode `001`, depois `002`. (Ou `supabase db push`.)

### 2. Criar o primeiro administrador
Authentication → Users → *Add user* (e-mail + senha forte). Depois, no SQL Editor:

```sql
INSERT INTO public.profiles (id, name, role)
SELECT id, 'Thallys', 'admin' FROM auth.users WHERE email = 'SEU-EMAIL-AQUI';
```

Em *Authentication → Providers → Email*, **desative "Allow new users to sign up"**. Só você cria contas.

### 3. Migrar os dados atuais
No painel atual: Configurações → **Exportar backup**. Depois, logado como admin, no console do navegador:

```js
// DEMO_CONFIG.supabaseUrl / supabaseAnonKey preenchidos em store_data.js
await SupabaseAdapter.api.signIn('seu-email', 'sua-senha');
await SupabaseAdapter.importBackup(JSON.parse(/* conteúdo do arquivo */), console.log);
```

Depois da importação, acerte as sequences para não colidir com códigos importados:

```sql
SELECT setval('sale_code_seq',        COALESCE((SELECT max(substring(code from 4)::int) FROM sales        WHERE code ~ '^VD-\d+$'),  2000) + 1, false);
SELECT setval('reservation_code_seq', COALESCE((SELECT max(substring(code from 5)::int) FROM reservations WHERE code ~ '^#SI-\d+$'), 1000) + 1, false);
SELECT setval('maintenance_code_seq', COALESCE((SELECT max(substring(code from 5)::int) FROM maintenances WHERE code ~ '^MNT-\d+$'), 1000) + 1, false);
```

> Os dados atuais são **de demonstração** (clientes "Demo", IMEIs "DEMO"). Provavelmente você vai querer começar o banco limpo e cadastrar o catálogo real; nesse caso pule o passo 3 e importe só `categories`.

### 4. Ligar o front (trabalho de código — ainda não feito)

**Fase 1 — catálogo público + reserva (resolve o achado C1 da auditoria)**
- `app.js`: trocar `getProducts()` por `await DataAdapter.getProducts()` e o envio do formulário por `DataAdapter.createReservation(...)`.
- Só o catálogo público e o formulário mudam; o painel continua local.

**Fase 2 — painel com login (resolve C2)**
- Tela de login (`signIn`) antes de renderizar o painel; `signOut` no menu do perfil.
- O painel hoje lê `state.*` de forma **síncrona** a partir do `localStorage`. Migrar significa: carregar tudo com `await` no início (`getProducts/getSales/getReservations`) e trocar cada gravação por chamada ao banco. As operações críticas já existem no servidor: `fn_complete_reservation`, `fn_refund_sale`.
- Ajuste de estoque, PDV e CRUD ainda precisam de métodos em `SupabaseAdapter.api` (insert em `sales`/`sale_items`/`stock_movements` — **de preferência numa função SQL transacional**, como o faturamento, para não vender sem baixar o estoque).

**Fase 3 — tempo real e relatórios**
- `supabase.channel(...)` em `reservations` para o contador do menu atualizar sozinho.
- Visões SQL (`v_sales_by_day`, `v_low_stock`) para os KPIs deixarem de iterar no navegador quando houver milhares de vendas.

## Decisões que dependem de você
- **Reserva bloqueia estoque?** Hoje não; dois clientes podem reservar a última unidade. Se sim, definir o prazo de retirada (`store_settings.reservation_hold_hours`, padrão 48 h) e um job (`pg_cron`) para expirar reservas.
- **Papéis:** `admin`/`manager` (apagam, estornam, mudam configurações), `sales`, `stock`. A `002` só distingue "staff" de "admin/manager"; se quiser que `sales` não ajuste estoque (ou vice-versa), é um refinamento de policy.
- **Domínio e hospedagem** (ver `PENDENCIAS_BRUNO.md`).

## Riscos conhecidos
- O SQL foi escrito com cuidado mas **nunca executado**. Rode em um projeto de teste (ou em uma *branch* do Supabase) antes do definitivo e leia os erros de cada comando.
- `001` + `002` dependem de `RENAME` das funções originais; **não rode a `002` duas vezes** (ela não é idempotente nessa parte). Se precisar refazer, use o rollback do `ATIVACAO.md` e rode `001` → `002` de novo.
- `product_variants.stock_quantity` fica visível ao público (necessário para "disponível/indisponível"). Se não quiser expor a quantidade exata, troque por uma view que devolva só `in_stock BOOLEAN`.
