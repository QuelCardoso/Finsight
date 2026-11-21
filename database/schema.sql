-- Schema PostgreSQL multi-tenant para o FinSight

CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    documento VARCHAR(30) NOT NULL,
    telefone VARCHAR(30),
    email VARCHAR(120),
    endereco VARCHAR(220),
    limite NUMERIC(12, 2) DEFAULT 0.00,
    situacao VARCHAR(30) DEFAULT 'Regular',
    historico TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    codigo VARCHAR(40) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao VARCHAR(255),
    categoria VARCHAR(80),
    quantidade INTEGER DEFAULT 0,
    minimo INTEGER DEFAULT 1,
    compra NUMERIC(12, 2) DEFAULT 0.00,
    venda NUMERIC(12, 2) DEFAULT 0.00,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS funcionarios (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    setor VARCHAR(100) NOT NULL,
    telefone VARCHAR(30),
    email VARCHAR(120) NOT NULL,
    contratacao DATE,
    usuario VARCHAR(80) NOT NULL,
    senha_hash VARCHAR(255),
    nivel VARCHAR(30) DEFAULT 'Operador',
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Receber', 'Pagar', 'Receita', 'Despesa')),
    descricao VARCHAR(220) NOT NULL,
    valor NUMERIC(12, 2) NOT NULL,
    vencimento DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Pago', 'Atrasado')),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cobrancas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    transacao_id INTEGER NOT NULL REFERENCES transacoes(id) ON DELETE CASCADE,
    observacao TEXT NOT NULL,
    registado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_empresa ON produtos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_funcionarios_empresa ON funcionarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_empresa ON transacoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cobrancas_empresa ON cobrancas(empresa_id);

INSERT INTO empresas (id, nome, cnpj) VALUES
    (1, 'Matriz Comercial Ltda', '10.000.000/0001-01'),
    (2, 'Distribuidora Bahia Sul', '20.000.000/0001-02')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('empresas', 'id'), COALESCE((SELECT MAX(id) FROM empresas), 1), true);