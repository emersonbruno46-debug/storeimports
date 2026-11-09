# Guia de Ativação, Migração e Publicação — Store Imports

Este documento fornece as instruções exatas, comandos, variáveis de ambiente e a sequência necessária para inicializar, migrar o banco de dados Supabase e realizar a publicação do projeto **Store Imports**.

---

## 1. Credenciais do Supabase

O site é estático (HTML/JS puro, sem Next.js), então **não há `.env`**. A URL do projeto e a chave `anon` (pública por design, protegida pelo RLS) vão em `DEMO_CONFIG` no topo de `store_data.js`:

```js
isDemo: false,
supabaseUrl: 'https://seu-projeto.supabase.co',
supabaseAnonKey: 'sua-chave-anon-publica'
```

A `service_role` **nunca** entra em arquivo do site; use-a apenas no painel do Supabase/CLI.

> Antes de mudar `isDemo` para `false`, leia o `DATABASE.md`: as telas ainda não foram migradas para o banco.

---

## 2. Sequência de Execução de Migração SQL (Supabase)

### Opção A: Via Dashboard do Supabase (SQL Editor)
1. Acesse o painel do Supabase ([https://supabase.com/dashboard](https://supabase.com/dashboard)).
2. Selecione seu projeto e vá em **SQL Editor**.
3. Rode `migrations/001_initial_schema.sql` e, em seguida, `migrations/002_ops_tables_and_hardening.sql` (cole e clique em **Run**, um de cada vez).

### Opção B: Via Supabase CLI (Linha de Comando)
```bash
# 1. Autenticar na CLI do Supabase
npx supabase login

# 2. Vincular o projeto local ao projeto remoto
npx supabase link --project-ref seu-project-ref

# 3. Aplicar as migrações SQL no banco remoto
npx supabase db push
```

---

## 3. Criação do Primeiro Usuário Administrador

Após executar a migração SQL, crie a conta administrativa principal no Supabase Auth:

1. Acesse **Authentication > Users** no painel do Supabase.
2. Clique em **Add User > Create User**.
3. Insira o email (ex: `admin@storeimports.com.br`) e defina uma senha forte.
4. No **SQL Editor**, dê o papel de administrador a essa conta:

```sql
INSERT INTO public.profiles (id, name, role)
SELECT id, 'Thallys', 'admin' FROM auth.users WHERE email = 'admin@storeimports.com.br';
```

5. Em **Authentication > Providers > Email**, desative o cadastro aberto (*Allow new users to sign up*).

---

## 4. Publicação na Vercel

```bash
# 1. Instalar Vercel CLI (se necessário)
npm install -g vercel

# 2. Autenticar e publicar ambiente de preview
vercel

# 3. Publicar em produção com variáveis aplicadas
vercel --prod
```

---

## 5. Procedimento de Reversão (Rollback)

Caso necessite reverter a publicação ou reiniciar os dados locais/remotos:

### Reversão do Frontend
```bash
# Reverter a publicação no Vercel para o deployment anterior
vercel rollback
```

### Reversão do Banco de Dados
Para redefinir ou reverter as tabelas de produção:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
*Em seguida, re-execute `001_initial_schema.sql` e `002_ops_tables_and_hardening.sql`, nesta ordem.*

---

## 6. Verificação de Funcionamento

Após a ativação:
1. Verifique se o catálogo inicial renderiza todos os produtos sem requerer filtro.
2. Teste o faturamento de uma reserva com saldo em estoque.
3. Teste a tentativa de faturamento sem saldo (deve recusar com mensagem de aviso).
4. Teste o estorno de uma venda física no painel administrativo.
