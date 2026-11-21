# FinSight — Sistema de Gestão Empresarial

Protótipo de sistema de gestão empresarial multi-empresa focado em clareza operacional, inclusão digital e acessibilidade para colaboradores com deficiência auditiva ou baixa visão.

## Funcionalidades Principais

* **Acesso Multi-Empresa:** alternância entre empresas (`Matriz Comercial Ltda` e `Distribuidora Bahia Sul`) com isolamento de dados por empresa.
* **Dashboard Geral:** indicadores consolidados de clientes, itens em estoque, alertas de estoque baixo, contas a pagar, contas a receber, pendências em atraso e gráfico de faturamento mensal e previsto com `Chart.js`.
* **Gestão de Clientes:** cadastro, pesquisa, edição, exclusão, limite de crédito, situação financeira (`Regular`, `Inadimplente`, `Bloqueado`) e histórico de compras.
* **Gestão de Funcionários:** cadastro de colaboradores com cargo, setor, usuário, data de contratação, nível de acesso (`Operador`, `Gerente`, `Admin`) e ações rápidas.
* **Controle de Estoque:** listagem de produtos, alerta automático de estoque baixo, movimentações de entrada/saída com histórico e busca por código, nome ou categoria.
* **Controle Financeiro:** contas a receber, contas a pagar, receitas e despesas realizadas, gráfico comparativo e filtros por tipo ou estado.
* **Controle de Inadimplência:** cálculo automático de dias em atraso, identificação de títulos vencidos, registo de histórico de cobranças e baixa/regularização de pendências.

## Recursos de Acessibilidade

* **VLibras:** intérprete virtual integrado para tradução automática em Língua Brasileira de Sinais.
* **Escala Tipográfica (`A-` / `A` / `A+`):** ajuste proporcional do tamanho da fonte no navegador com persistência local.
* **Modo Alto Contraste:** tema de alto contraste e foco visível para navegação por teclado, voltado a colaboradores com baixa visão.

## Estrutura do Projeto

* `frontend/`: interface web em HTML5, CSS3 e JavaScript modular (`state.js`, `accessibility.js`, `app.js` e módulos em `js/modules/`), utilizando `localStorage` no protótipo.
* `backend/`: base da API em Python com Flask (`app.py`, `config.py`, `requirements.txt`).
* `database/`: script `schema.sql` modelado para PostgreSQL com suporte multi-empresa (`empresa_id`).

## Como Executar o Protótipo Frontend

1. Abra a pasta do projeto no **VS Code**.
2. Inicie o **Live Server** e abra `frontend/index.html` no navegador.
3. Selecione uma empresa na tela inicial e clique em **Entrar no Sistema**.

## Próximos Passos

* Conectar os módulos do frontend aos endpoints REST do backend em Flask.
* Aplicar o `database/schema.sql` em instância PostgreSQL e substituir a persistência em `localStorage` por consultas ao banco.