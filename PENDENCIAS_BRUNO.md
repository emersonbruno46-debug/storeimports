# Pendências Comerciais e de Configuração Externa (Bruno)

> [!IMPORTANT]
> **Orientações:** Todas as correções de código, validações de estoque, regras de faturamento, estorno e interface gráfica foram concluídas e testadas localmente no projeto. Os dados de contato fornecidos já foram integrados ao código.

---

## 1. Dados de Contato e Identidade da Loja

- [x] **Número de WhatsApp / Contato:** `+55 38 9134-4656` (configurado para links de WhatsApp `https://wa.me/5538991344656`).
- [x] **Endereço Físico Completo:** `Rua Jovelino Pinheiro da Cruz, 02, Rio Pardo De Minas MG, 39530-000, Brasil` (configurado em cupons, rodapé e metadados).
- [x] **Redes Sociais (Instagram):** `https://www.instagram.com/storeimports___/` (`@storeimports___`) (configurado no rodapé e canal oficial).
- [ ] **Horário de Funcionamento:** Confirmar horário padrão oficial (atualmente configurado como `Segunda a Sábado das 09h às 19h`).

---

## 2. Credenciais de Banco de Dados e Backend (Produção)

- [ ] **URL do Projeto Supabase:** `SUPABASE_URL` (ex: `https://xyzcompany.supabase.co`).
- [ ] **Chave Pública (Anon Key):** `SUPABASE_ANON_KEY` para operações do catálogo.
- [ ] **Chave de Serviço (Service Role Key):** Para migrações e rotinas de servidor no Supabase CLI.

---

## 3. Domínio e Publicação

- [ ] **Domínio Definitivo:** Definir se a publicação utilizará domínio próprio (ex: `www.storeimports.com.br`) ou subdomínio Vercel (`storeimports.vercel.app`).
- [ ] **Configuração DNS:** Apontar os registros `A` e `CNAME` caso opte por domínio customizado.

---

## 4. Políticas Comerciais e Garantia

- [ ] **Prazo Máximo de Retirada:** Definir tempo limite para o cliente retirar a solicitação na loja antes de cancelar automaticamente (ex: `24 horas` ou `48 horas`).
- [ ] **Termos de Garantia:** Texto oficial para o rodapé do cupom de venda física impressa.
