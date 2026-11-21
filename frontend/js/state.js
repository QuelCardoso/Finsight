const API_BASE_URL = 'http://127.0.0.1:5000/api';
const DB_KEY = 'finsight_db_v1';
const EMPRESA_KEY = 'finsight_empresa_ativa';

const initialDB = {
    1: {
        nome: 'Matriz Comercial Ltda',
        clientes: [
            {
                id: 1,
                nome: 'Comércio Silva & Filhos Ltda',
                documento: '12.345.678/0001-90',
                telefone: '(75) 99123-4567',
                email: 'contato@silvafilhos.com',
                endereco: 'Av. Roberto Santos, 450 - Centro',
                limite: 15000.00,
                situacao: 'Regular',
                historico: 'Última compra: R$ 3.200,00 em 10/11/2026'
            },
            {
                id: 2,
                nome: 'Mariana Costa Oliveira',
                documento: '123.456.789-00',
                telefone: '(75) 98877-6655',
                email: 'mariana.costa@email.com',
                endereco: 'Rua Rui Barbosa, 112 - Jardim',
                limite: 3500.00,
                situacao: 'Inadimplente',
                historico: 'Fatura em aberto: R$ 850,00'
            }
        ],
        produtos: [
            {
                id: 1,
                codigo: 'PRD-001',
                nome: 'Notebook Corporativo i5',
                descricao: '8GB RAM, SSD 256GB, Tela 15.6"',
                categoria: 'Informática',
                quantidade: 14,
                minimo: 5,
                compra: 2400.00,
                venda: 3290.00,
                movimentacoes: [
                    { data: '01/11/2026', tipo: 'Entrada', qtd: 20, obs: 'Compra inicial lote 01' },
                    { data: '10/11/2026', tipo: 'Saída', qtd: 6, obs: 'Venda cliente Comércio Silva' }
                ]
            },
            {
                id: 2,
                codigo: 'PRD-002',
                nome: 'Monitor LED 24" Full HD',
                descricao: 'HDMI / VGA, Ajuste de inclinação',
                categoria: 'Periféricos',
                quantidade: 3,
                minimo: 6,
                compra: 580.00,
                venda: 890.00,
                movimentacoes: [
                    { data: '05/11/2026', tipo: 'Entrada', qtd: 10, obs: 'Reposição estoque' },
                    { data: '14/11/2026', tipo: 'Saída', qtd: 7, obs: 'Vendas balcão' }
                ]
            }
        ],
        funcionarios: [
            {
                id: 1,
                nome: 'Carlos Eduardo Almeida',
                cargo: 'Analista Financeiro',
                setor: 'Financeiro',
                telefone: '(75) 99911-2233',
                email: 'carlos.almeida@finsight.com',
                contratacao: '2025-02-10',
                usuario: 'calmeida',
                nivel: 'Gerente',
                ativo: true
            },
            {
                id: 2,
                nome: 'Beatriz Santos Rocha',
                cargo: 'Assistente de Estoque',
                setor: 'Logística',
                telefone: '(75) 98844-5566',
                email: 'beatriz.rocha@finsight.com',
                contratacao: '2026-01-15',
                usuario: 'brocha',
                nivel: 'Operador',
                ativo: true
            }
        ],
        transacoes: [
            { id: 1, tipo: 'Receber', descricao: 'Fatura #104 - Comércio Silva & Filhos', clienteId: 1, valor: 3200.00, vencimento: '2026-11-25', status: 'Pendente', cobrancas: [] },
            { id: 2, tipo: 'Receber', descricao: 'Fatura #105 - Mariana Costa Oliveira', clienteId: 2, valor: 850.00, vencimento: '2026-11-05', status: 'Atrasado', cobrancas: [] },
            { id: 3, tipo: 'Pagar', descricao: 'Fornecedor de Hardware', clienteId: null, valor: 4800.00, vencimento: '2026-11-28', status: 'Pendente', cobrancas: [] },
            { id: 4, tipo: 'Receita', descricao: 'Venda à Vista - Balcão', clienteId: null, valor: 6450.00, vencimento: '2026-11-12', status: 'Pago', cobrancas: [] },
            { id: 5, tipo: 'Despesa', descricao: 'Energia Elétrica e Internet', clienteId: null, valor: 1120.00, vencimento: '2026-11-10', status: 'Pago', cobrancas: [] }
        ]
    },
    2: {
        nome: 'Distribuidora Bahia Sul',
        clientes: [
            {
                id: 101,
                nome: 'Supermercado Recôncavo',
                documento: '98.765.432/0001-10',
                telefone: '(75) 3631-2200',
                email: 'compras@reconcavo.com',
                endereco: 'BR-101, Km 265',
                limite: 50000.00,
                situacao: 'Regular',
                historico: 'Última compra: R$ 14.500,00 em 15/11/2026'
            }
        ],
        produtos: [
            {
                id: 201,
                codigo: 'BEB-101',
                nome: 'Fardo Água Mineral 500ml (12un)',
                descricao: 'Sem gás',
                categoria: 'Bebidas',
                quantidade: 120,
                minimo: 30,
                compra: 8.50,
                venda: 14.00,
                movimentacoes: [
                    { data: '12/11/2026', tipo: 'Entrada', qtd: 120, obs: 'Carga inicial' }
                ]
            }
        ],
        funcionarios: [
            {
                id: 301,
                nome: 'Rafael Souza Menezes',
                cargo: 'Coordenador de Operações',
                setor: 'Operações',
                telefone: '(75) 99700-1122',
                email: 'rafael.menezes@finsight.com',
                contratacao: '2024-08-01',
                usuario: 'rmenezes',
                nivel: 'Admin',
                ativo: true
            }
        ],
        transacoes: [
            { id: 401, tipo: 'Receber', descricao: 'Pedido #88 - Supermercado Recôncavo', clienteId: 101, valor: 14500.00, vencimento: '2026-11-30', status: 'Pendente', cobrancas: [] },
            { id: 402, tipo: 'Pagar', descricao: 'Frete Regional Bahia', clienteId: null, valor: 2300.00, vencimento: '2026-11-22', status: 'Pendente', cobrancas: [] }
        ]
    }
};

function getDB() {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
        localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
        return JSON.parse(JSON.stringify(initialDB));
    }
    return JSON.parse(raw);
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function getCurrentEmpresaId() {
    return Number(localStorage.getItem(EMPRESA_KEY) || 1);
}

function getEmpresaData() {
    const db = getDB();
    const id = getCurrentEmpresaId();
    return db[id] || db[1];
}

function formatBRL(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function apiRequest(path, options = {}) {
    try {
        const resp = await fetch(`${API_BASE_URL}${path}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!resp.ok) return null;
        return await resp.json();
    } catch (_) {
        return null;
    }
}

async function syncEmpresaFromApi(empresaId) {
    const empId = Number(empresaId || getCurrentEmpresaId());
    const [clientes, produtos, funcionarios, transacoes] = await Promise.all([
        apiRequest(`/clientes?empresa_id=${empId}`),
        apiRequest(`/produtos?empresa_id=${empId}`),
        apiRequest(`/funcionarios?empresa_id=${empId}`),
        apiRequest(`/transacoes?empresa_id=${empId}`)
    ]);

    if (!clientes || !produtos || !funcionarios || !transacoes) {
        return false;
    }

    const db = getDB();
    if (!db[empId]) return false;

    const existentesProd = db[empId].produtos || [];
    db[empId].clientes = clientes.map(c => ({
        ...c,
        limite: Number(c.limite || 0)
    }));

    db[empId].produtos = produtos.map(p => {
        const localProd = existentesProd.find(item => item.id === p.id);
        return {
            ...p,
            quantidade: Number(p.quantidade || 0),
            minimo: Number(p.minimo || 0),
            compra: Number(p.compra || 0),
            venda: Number(p.venda || 0),
            movimentacoes: localProd?.movimentacoes || []
        };
    });

    db[empId].funcionarios = funcionarios.map(f => ({
        ...f,
        ativo: Boolean(f.ativo)
    }));

    const existentesTx = db[empId].transacoes || [];
    db[empId].transacoes = transacoes.map(t => {
        const localTx = existentesTx.find(item => item.id === t.id);
        return {
            ...t,
            clienteId: t.cliente_id ?? t.clienteId ?? null,
            valor: Number(t.valor || 0),
            cobrancas: localTx?.cobrancas || []
        };
    });

    saveDB(db);
    return true;
}