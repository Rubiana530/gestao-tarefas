# Sistema de Gestão de Tarefas

## O que é esta aplicação

Aplicação Web com API REST para organizar e acompanhar tarefas, da criação até a conclusão. Possui 8 funcionalidades: **Cadastro, Consulta, Edição, Exclusão, Status, Prioridade, Prazo e Pesquisa**.

- **Back-end:** Node.js + Express
- **Banco de dados:** em memória (estilo `mongodb-memory-server`): `src/db.js` expõe uma coleção com `insertOne`, `findOne`, `find`, `updateOne` e `deleteOne`. Não requer instalação de banco nem download de binários. **Os dados são perdidos ao parar a aplicação.**
- **Documentação:** especificação OpenAPI 3 em `openapi.yaml`, servida em um endpoint e renderizada com Swagger UI
- **Front-end:** página única em `public/index.html` (HTML, CSS e JS puros)

## Como instalar

Pré-requisito: Node.js 18 ou superior.

```bash
npm install
```

## Como executar

```bash
npm start
```

A porta padrão é 3000. Para mudar: `PORT=8080 npm start` (Windows PowerShell: `$env:PORT=8080; npm start`).

## Dados de teste incluídos

Ao iniciar, o banco em memória é populado com 6 tarefas:

| Título | Prioridade | Status | Prazo |
|---|---|---|---|
| Preparar apresentação do projeto | alta | em_andamento | hoje + 3 dias |
| Revisar contrato do fornecedor | alta | pendente | hoje + 1 dia |
| Atualizar planilha de custos | media | pendente | hoje + 7 dias |
| Agendar consulta no dentista | baixa | pendente | sem prazo |
| Enviar relatório mensal | media | concluida | já passou |
| Pagar conta de energia | alta | pendente | vencido (ontem) |

Os prazos são relativos à data de inicialização. A tarefa concluída serve para testar a regra 5, e a vencida mostra o aviso "Prazo vencido" no site.

## Regras de negócio

1. Toda tarefa possui título e descrição (obrigatórios).
2. Toda tarefa possui uma prioridade: `baixa`, `media` ou `alta` (obrigatória).
3. Toda tarefa possui um status: `pendente`, `em_andamento` ou `concluida` (padrão no cadastro: `pendente`).
4. A data de entrega (`prazo`, formato `AAAA-MM-DD`) não pode ser anterior à data de criação. O prazo é opcional.
5. Uma tarefa concluída não volta automaticamente para pendente: o sistema nunca altera o status sozinho (editar outros campos mantém o status) e a transição `concluida → pendente` é rejeitada com HTTP 409. Para retomar, a tarefa deve ser reaberta explicitamente como `em_andamento`.
6. O sistema permite editar uma tarefa (`PUT /api/tarefas/{id}`).
7. Quando a tarefa não é encontrada, a API responde HTTP 404 com `{"erro": "Tarefa não encontrada"}`.

## URLs importantes

Com a aplicação rodando na porta 3000:

| O quê | URL |
|---|---|
| Site | http://localhost:3000 |
| API (listagem) | http://localhost:3000/api/tarefas |
| Swagger UI | http://localhost:3000/api-docs |
| Especificação YAML | http://localhost:3000/openapi.yaml |

### Endpoints

| Funcionalidade | Método e rota |
|---|---|
| Cadastro | `POST /api/tarefas` |
| Consulta | `GET /api/tarefas` e `GET /api/tarefas/{id}` |
| Pesquisa | `GET /api/tarefas?q=texto&status=pendente&prioridade=alta` |
| Edição | `PUT /api/tarefas/{id}` |
| Exclusão | `DELETE /api/tarefas/{id}` |
| Status | `PATCH /api/tarefas/{id}/status` |
| Prioridade | `PATCH /api/tarefas/{id}/prioridade` |
| Prazo | `PATCH /api/tarefas/{id}/prazo` |

## Estrutura

```
openapi.yaml        especificação Swagger/OpenAPI
public/index.html   site
src/server.js       rotas, Swagger e arquivos estáticos
src/service.js      regras de negócio
src/db.js           banco em memória e dados de teste
```
