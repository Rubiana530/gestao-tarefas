const path = require('path');
const fs = require('fs');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const { tarefas, seed } = require('./db');
const svc = require('./service');

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

// Documentação: arquivo YAML bruto + Swagger UI
const yamlTexto = fs.readFileSync(path.join(__dirname, '..', 'openapi.yaml'), 'utf8');
app.get('/openapi.yaml', (_req, res) => res.type('text/yaml; charset=utf-8').send(yamlTexto));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(YAML.parse(yamlTexto), { customSiteTitle: 'API de Gestão de Tarefas' }));

// API REST
const a = (fn) => (req, res, next) => fn(req, res).catch(next);
const r = express.Router();
r.post('/', a(async (req, res) => res.status(201).json(await svc.criar(req.body))));
r.get('/', a(async (req, res) => res.json(await svc.listar(req.query))));
r.get('/:id', a(async (req, res) => res.json(await svc.buscar(req.params.id))));
r.put('/:id', a(async (req, res) => res.json(await svc.editar(req.params.id, req.body))));
r.delete('/:id', a(async (req, res) => { await svc.excluir(req.params.id); res.status(204).end(); }));
r.patch('/:id/status', a(async (req, res) => res.json(await svc.alterarStatus(req.params.id, req.body?.status))));
r.patch('/:id/prioridade', a(async (req, res) => res.json(await svc.alterarPrioridade(req.params.id, req.body?.prioridade))));
r.patch('/:id/prazo', a(async (req, res) => res.json(await svc.alterarPrazo(req.params.id, req.body?.prazo))));
app.use('/api/tarefas', r);

// Site
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', (_req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));
app.use((err, _req, res, _next) => {
  if (err instanceof svc.HttpError) return res.status(err.status).json({ erro: err.message, detalhes: err.detalhes });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido' });
  console.error(err); res.status(500).json({ erro: 'Erro interno do servidor' });
});

seed(tarefas).then(() => app.listen(PORT, () => {
  console.log(`Site:         http://localhost:${PORT}`);
  console.log(`API:          http://localhost:${PORT}/api/tarefas`);
  console.log(`Swagger UI:   http://localhost:${PORT}/api-docs`);
  console.log(`YAML da API:  http://localhost:${PORT}/openapi.yaml`);
}));
