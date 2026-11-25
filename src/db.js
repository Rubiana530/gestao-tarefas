// Banco de dados em memória (volátil), com API inspirada no MongoDB.
// Os dados existem apenas enquanto o processo estiver rodando.
const { randomUUID } = require('crypto');

class MemoryCollection {
  constructor() { this.docs = new Map(); }
  async insertOne(doc) { const _id = randomUUID(); const d = { _id, ...doc }; this.docs.set(_id, d); return { ...d }; }
  async findOne(_id) { const d = this.docs.get(_id); return d ? { ...d } : null; }
  async find(predicate = () => true) { return [...this.docs.values()].filter(predicate).map(d => ({ ...d })); }
  async updateOne(_id, changes) {
    const d = this.docs.get(_id); if (!d) return null;
    const novo = { ...d, ...changes, _id }; this.docs.set(_id, novo); return { ...novo };
  }
  async deleteOne(_id) { return this.docs.delete(_id); }
}

const dataLocal = (d = new Date()) => { d = new Date(d); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const dia = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return dataLocal(d); };
const ts = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString(); };

async function seed(col) {
  const dados = [
    ['Preparar apresentação do projeto', 'Montar os slides da reunião de kickoff com o cliente.', 'alta', 'em_andamento', dia(3), -2],
    ['Revisar contrato do fornecedor', 'Ler as cláusulas de prazo e multa e enviar comentários ao jurídico.', 'alta', 'pendente', dia(1), -1],
    ['Atualizar planilha de custos', 'Incluir as despesas de novembro e conferir os totais.', 'media', 'pendente', dia(7), 0],
    ['Agendar consulta no dentista', 'Ligar para a clínica e marcar horário para a próxima semana.', 'baixa', 'pendente', null, 0],
    ['Enviar relatório mensal', 'Relatório de vendas enviado para a diretoria.', 'media', 'concluida', dia(-3), -10],
    ['Pagar conta de energia', 'Pagamento esquecido do mês passado, regularizar com urgência.', 'alta', 'pendente', dia(-1), -8],
  ];
  for (const [titulo, descricao, prioridade, status, prazo, criada] of dados) {
    await col.insertOne({ titulo, descricao, prioridade, status, prazo, criadaEm: ts(criada), atualizadaEm: ts(criada) });
  }
}

const tarefas = new MemoryCollection();
module.exports = { tarefas, seed };
