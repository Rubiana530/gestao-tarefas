const { tarefas } = require('./db');

const PRIORIDADES = ['baixa', 'media', 'alta'];
const STATUS = ['pendente', 'em_andamento', 'concluida'];

class HttpError extends Error { constructor(status, mensagem, detalhes) { super(mensagem); this.status = status; this.detalhes = detalhes; } }

const dataValida = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
const textoOk = (v) => typeof v === 'string' && v.trim().length > 0;
const agora = () => new Date().toISOString();

// Regra 4: a data de entrega não pode ser anterior à data de criação.
function validarPrazo(prazo, criadaEm, erros) {
  if (prazo === null || prazo === undefined) return;
  if (!dataValida(prazo)) { erros.push('prazo deve estar no formato AAAA-MM-DD'); return; }
  if (prazo < criadaEm.slice(0, 10)) erros.push('prazo não pode ser anterior à data de criação da tarefa');
}

// Regra 5: uma tarefa concluída não volta automaticamente para pendente.
function validarTransicao(atual, novo) {
  if (atual === 'concluida' && novo === 'pendente') {
    throw new HttpError(409, 'Uma tarefa concluída não pode voltar para pendente. Reabra-a como "em_andamento".');
  }
}

function falhar(erros) { if (erros.length) throw new HttpError(400, 'Dados inválidos', erros); }

// Regra 7: informar quando a tarefa não for encontrada.
async function buscar(id) {
  const t = await tarefas.findOne(id);
  if (!t) throw new HttpError(404, 'Tarefa não encontrada');
  return t;
}

// Cadastro (regras 1, 2, 3 e 4)
async function criar(b = {}) {
  const erros = [];
  if (!textoOk(b.titulo)) erros.push('titulo é obrigatório');
  if (!textoOk(b.descricao)) erros.push('descricao é obrigatória');
  if (!PRIORIDADES.includes(b.prioridade)) erros.push(`prioridade é obrigatória e deve ser: ${PRIORIDADES.join(', ')}`);
  const status = b.status ?? 'pendente';
  if (!STATUS.includes(status)) erros.push(`status deve ser: ${STATUS.join(', ')}`);
  const criadaEm = agora();
  validarPrazo(b.prazo, criadaEm, erros);
  falhar(erros);
  return tarefas.insertOne({ titulo: b.titulo.trim(), descricao: b.descricao.trim(), prioridade: b.prioridade, status, prazo: b.prazo ?? null, criadaEm, atualizadaEm: criadaEm });
}

// Consulta e pesquisa
async function listar({ q, status, prioridade } = {}) {
  const termo = q ? String(q).trim().toLowerCase() : '';
  const lista = await tarefas.find((t) =>
    (!termo || t.titulo.toLowerCase().includes(termo) || t.descricao.toLowerCase().includes(termo)) &&
    (!status || t.status === status) && (!prioridade || t.prioridade === prioridade));
  const peso = { alta: 0, media: 1, baixa: 2 };
  return lista.sort((a, b) => (a.status === 'concluida') - (b.status === 'concluida') || peso[a.prioridade] - peso[b.prioridade] || (a.prazo || '9999').localeCompare(b.prazo || '9999'));
}

// Edição (regra 6)
async function editar(id, b = {}) {
  const atual = await buscar(id);
  const erros = [];
  if (!textoOk(b.titulo)) erros.push('titulo é obrigatório');
  if (!textoOk(b.descricao)) erros.push('descricao é obrigatória');
  if (!PRIORIDADES.includes(b.prioridade)) erros.push(`prioridade deve ser: ${PRIORIDADES.join(', ')}`);
  if (b.status !== undefined && !STATUS.includes(b.status)) erros.push(`status deve ser: ${STATUS.join(', ')}`);
  validarPrazo(b.prazo, atual.criadaEm, erros);
  falhar(erros);
  const status = b.status ?? atual.status; // o status nunca muda de forma implícita
  validarTransicao(atual.status, status);
  return tarefas.updateOne(id, { titulo: b.titulo.trim(), descricao: b.descricao.trim(), prioridade: b.prioridade, status, prazo: b.prazo ?? null, atualizadaEm: agora() });
}

async function alterarStatus(id, status) {
  const atual = await buscar(id);
  if (!STATUS.includes(status)) falhar([`status deve ser: ${STATUS.join(', ')}`]);
  validarTransicao(atual.status, status);
  return tarefas.updateOne(id, { status, atualizadaEm: agora() });
}

async function alterarPrioridade(id, prioridade) {
  await buscar(id);
  if (!PRIORIDADES.includes(prioridade)) falhar([`prioridade deve ser: ${PRIORIDADES.join(', ')}`]);
  return tarefas.updateOne(id, { prioridade, atualizadaEm: agora() });
}

async function alterarPrazo(id, prazo) {
  const atual = await buscar(id);
  const erros = []; validarPrazo(prazo, atual.criadaEm, erros); falhar(erros);
  return tarefas.updateOne(id, { prazo: prazo ?? null, atualizadaEm: agora() });
}

async function excluir(id) { await buscar(id); await tarefas.deleteOne(id); }

module.exports = { HttpError, buscar, criar, listar, editar, alterarStatus, alterarPrioridade, alterarPrazo, excluir };
