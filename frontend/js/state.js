const STATE_KEY = 'finsight_db_v1';

const initialData = {
    1: {
        clientes: [
            { id: 101, nome: 'Comércio Silva & Filhos Ltda', documento: '12.345.678/0001-90', telefone: '(75) 99123-4567', email: 'contato@silvafilhos.com', endereco: 'Av. Roberto Santos, 450', limite: 15000.00, situacao: 'Regular', historico: 'Última compra: R$ 3.200,00 em 10/11/2026' },
            { id: 102, nome: 'Mariana Costa Oliveira', documento: '123.456.789-00', telefone: '(75) 98877-6655', email: 'mariana.costa@email.com', endereco: 'Rua Rui Barbosa, 112', limite: 3500.00, situacao: 'Inadimplente', historico: 'Fatura em aberto: R$ 850,00' }
        ],
        produtos: [
            { id: 201, codigo: 'PRD-001', nome: 'Notebook Corporativo i5', descricao: '8GB RAM, SSD 256GB', categoria: 'Informática', quantidade: 14, minimo: 5, compra: 2400.00, venda: 3290.00, movimentacoes: ['+15 Entrada Inicial', '-1 Venda #402'] },
            { id: 202, codigo: 'PRD-002', nome: 'Monitor LED 24" Full HD', descricao: 'HDMI/VGA Ajustável', categoria: 'Periféricos', quantidade: 3, minimo: 6, compra: 580.00, venda: 890.00, movimentacoes: ['+10 Entrada Inicial', '-7 Saídas diversas'] }
        ],
        funcionarios: [
            { id: 501, nome: 'Carlos Eduardo Almeida', cargo: 'Analista Financeiro', setor: 'Financeiro', telefone: '(75) 99911-2233', email: 'carlos.almeida@finsight.com', contratacao: '2025-02-10', usuario: 'calmeida', nivel: 'Gerente', ativo: true },
            { id: 502, nome: 'Beatriz Santos Rocha', cargo: 'Assistente de Estoque', setor: 'Logística', telefone: '(75) 98844-5566', email: 'beatriz.rocha@finsight.com', contratacao: '2026-01-15', usuario: 'brocha', nivel: 'Operador', ativo: true }
        ],
        transacoes: [
            { id: 701, tipo: 'Receber', descricao: 'Fatura #104 - Comércio Silva & Filhos', clienteId: 101, valor: 3200.00, vencimento: '2026-11-25', status: 'Pendente' },
            { id: 702, tipo: 'Receber', descricao: 'Fatura #105 - Mariana Costa Oliveira', clienteId: 102, valor: 850.00, vencimento: '2026-11-05', status: 'Atrasado' },
            { id: 703, tipo: 'Pagar', descricao: 'Fornecedor de Hardware', clienteId: null, valor: 4800.00, vencimento: '2026-11-28', status: 'Pendente' },
            { id: 704, tipo: 'Receita', descricao: 'Venda à Vista - Balcão', clienteId: null, valor: 6450.00, vencimento: '2026-11-12', status: 'Pago' },
            { id: 705, tipo: 'Despesa', descricao: 'Energia Elétrica e Internet', clienteId: null, valor: 1120.00, vencimento: '2026-11-10', status: 'Pago' }
        ]
    },
    2: {
        clientes: [
            { id: 301, nome: 'Supermercado Recôncavo', documento: '98.765.432/0001-10', telefone: '(75) 3631-2200', email: 'compras@reconcavo.com', endereco: 'BR-101, Km 265', limite: 50000.00, situacao: 'Regular', historico: 'Última compra: R$ 14.500,00 em 15/11/2026' }
        ],
        produtos: [
            { id: 401, codigo: 'BEB-101', nome: 'Fardo Água Mineral 500ml (12un)', descricao: 'Sem gás', categoria: 'Bebidas', quantidade: 120, minimo: 30, compra: 8.50, venda: 14.00, movimentacoes: ['+150 Entrada Fornecedor', '-30 Pedido #88'] }
        ],
        funcionarios: [
            { id: 601, nome: 'Rafael Souza Lima', cargo: 'Supervisor de Operações', setor: 'Operações', telefone: '(75) 99700-1122', email: 'rafael.lima@finsight.com', contratacao: '2024-08-01', usuario: 'rlima', nivel: 'Admin', ativo: true }
        ],
        transacoes: [
            { id: 801, tipo: 'Receber', descricao: 'Pedido #88 - Supermercado Recôncavo', clienteId: 301, valor: 14500.00, vencimento: '2026-11-30', status: 'Pendente' },
            { id: 802, tipo: 'Pagar', descricao: 'Frete e Distribuição Regional', clienteId: null, valor: 3900.00, vencimento: '2026-11-22', status: 'Pendente' },
            { id: 803, tipo: 'Receita', descricao: 'Entregas Concluídas Semana 2', clienteId: null, valor: 9800.00, vencimento: '2026-11-14', status: 'Pago' },
            { id: 804, tipo: 'Despesa', descricao: 'Manutenção de Frota', clienteId: null, valor: 2150.00, vencimento: '2026-11-08', status: 'Pago' }
        ]
    }
};

function getDB() {
    const saved = localStorage.getItem(STATE_KEY);
    if (!saved) {
        localStorage.setItem(STATE_KEY, JSON.stringify(initialData));
        return initialData;
    }
    try {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(empId => {
            if (!parsed[empId].clientes) parsed[empId].clientes = initialData[empId]?.clientes || [];
            if (!parsed[empId].produtos) parsed[empId].produtos = initialData[empId]?.produtos || [];
            if (!parsed[empId].funcionarios) parsed[empId].funcionarios = initialData[empId]?.funcionarios || [];
            if (!parsed[empId].transacoes) parsed[empId].transacoes = initialData[empId]?.transacoes || [];
        });
        return parsed;
    } catch (e) {
        localStorage.setItem(STATE_KEY, JSON.stringify(initialData));
        return initialData;
    }
}

function saveDB(db) {
    localStorage.setItem(STATE_KEY, JSON.stringify(db));
}

function getCurrentEmpresaId() {
    return localStorage.getItem('finsight_empresa_ativa') || '1';
}

function getEmpresaData() {
    const db = getDB();
    const empId = getCurrentEmpresaId();
    if (!db[empId]) {
        db[empId] = { clientes: [], produtos: [], funcionarios: [], transacoes: [] };
        saveDB(db);
    }
    return db[empId];
}

function formatBRL(val) {
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}