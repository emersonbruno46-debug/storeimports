# Guia de Ativação, Migração e Publicação — Store Imports

Este documento fornece as instruções exatas, comandos, variáveis de ambiente e a sequência necessária para inicializar, migrar o banco de dados Supabase e realizar a publicação do projeto **Store Imports**.

---

## 1. Variáveis de Ambiente Necessárias

Para ativar a integração em produção, crie ou configure as variáveis no arquivo `.env` (ou no painel da Vercel):

```env
# Configurações Públicas (Frontend)
NEXT_PUBLIC_STORE_NAME="Store Imports"
NEXT_PUBLIC_DEMO_MODE="false" # Defina 'false' para ativar backend real Supabase
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anon-publica"

# Configurações Privadas (Backend / CLI / Scripts)
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role-privada"
```

---

## 2. Sequência de Execução de Migração SQL (Supabase)

### Opção A: Via Dashboard do Supabase (SQL Editor)
1. Acesse o painel do Supabase ([https://supabase.com/dashboard](https://supabase.com/dashboard)).
2. Selecione seu projeto e vá em **SQL Editor**.
3. Abra o arquivo `migrations/001_initial_schema.sql`.
4. Cole todo o conteúdo no editor e clique em **Run**.

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
4. No **SQL Editor**, atribua o ID do usuário criado às permissões de sistema:

```sql
INSERT INTO public.activity_logs (id, type, entity_type, entity_id, message, actor_user_id, created_at)
VALUES ('act-init', 'info', 'system', 'admin', 'Administrador inicial criado', 'admin-user-id', NOW());
```

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
*Em seguida, re-execute o script `migrations/001_initial_schema.sql`.*

---

## 6. Verificação de Funcionamento

Após a ativação:
1. Verifique se o catálogo inicial renderiza todos os produtos sem requerer filtro.
2. Teste o faturamento de uma reserva com saldo em estoque.
3. Teste a tentativa de faturamento sem saldo (deve recusar com mensagem de aviso).
4. Teste o estorno de uma venda física no painel administrativo.
