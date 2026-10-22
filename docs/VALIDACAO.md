# Verificação da entrega

A validação usa o código compilado e PostgreSQL 16 real. As imagens em `docs/`
foram capturadas da aplicação em execução, com dados fictícios persistidos.

## Escopo dos testes

- Compilação TypeScript do backend e frontend e build Vite.
- Respostas de saúde, prontidão, rotas inexistentes e entradas inválidas.
- CRUD de pessoas/equipamentos, paginação, relações, e-mail duplicado e FK inválida.
- Elegibilidade para empréstimos, data futura, tentativa concorrente de retirada,
  devolução, devolução duplicada e preservação do histórico.
- Navegador Chromium: pessoa → equipamento → empréstimo → devolução → edição → CSV.
- Layout em 390 px, menu móvel, busca sem resultados e recuperação de erro de conexão.
- Auditoria npm nas duas árvores de dependências.

## Reprodução

Consulte a seção [Testes completos](../README.md#testes-completos).
O workflow em `.github/workflows/ci.yml` usa Node.js 22 e PostgreSQL 16.

## Docker

O arquivo Compose foi validado com `docker compose --env-file .env.example config --quiet`.
A execução dos containers não foi verificada nesta máquina porque o daemon Docker
não estava acessível. O fluxo equivalente foi executado diretamente com Node.js e
PostgreSQL, incluindo migrações e os dois seeds.

## Capturar novamente as prévias

Com a aplicação compilada rodando em `http://localhost:3000`:

```bash
npx playwright install chromium
node scripts/capture-preview.cjs
```

Os arquivos `docs/preview-desktop.png` e `docs/preview-mobile.png` são substituídos
pelas novas capturas. Use apenas um banco de demonstração, sem dados pessoais reais.
