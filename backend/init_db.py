from app import app, db

ddl_statements = [
    """
    CREATE TABLE IF NOT EXISTS empresas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(150) NOT NULL,
        cnpj VARCHAR(20) UNIQUE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
        nome VARCHAR(150) NOT NULL,
        documento VARCHAR(30) NOT NULL,
        telefone VARCHAR(30),
        email VARCHAR(120),
        endereco VARCHAR(220),
        limite NUMERIC(12, 2) DEFAULT 0.00,
        situacao VARCHAR(30) DEFAULT 'Regular',
        historico TEXT
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
        codigo VARCHAR(40) NOT NULL,
        nome VARCHAR(150) NOT NULL,
        descricao VARCHAR(255),
        categoria VARCHAR(80),
        quantidade INTEGER DEFAULT 0,
        minimo INTEGER DEFAULT 1,
        compra NUMERIC(12, 2) DEFAULT 0.00,
        venda NUMERIC(12, 2) DEFAULT 0.00
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS funcionarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        ativo BOOLEAN DEFAULT 1
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS transacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
        tipo VARCHAR(20) NOT NULL,
        descricao VARCHAR(220) NOT NULL,
        valor NUMERIC(12, 2) NOT NULL,
        vencimento DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Pendente'
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS cobrancas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
        transacao_id INTEGER NOT NULL REFERENCES transacoes(id) ON DELETE CASCADE,
        observacao TEXT NOT NULL,
        registado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
]

with app.app_context():
    for stmt in ddl_statements:
        db.session.execute(db.text(stmt))

    db.session.execute(db.text("""
        INSERT OR IGNORE INTO empresas (id, nome, cnpj) VALUES
        (1, 'Matriz Comercial Ltda', '10.000.000/0001-01'),
        (2, 'Distribuidora Bahia Sul', '20.000.000/0001-02')
    """))

    for col_sql in [
        "ALTER TABLE clientes ADD COLUMN usuario VARCHAR(80)",
        "ALTER TABLE clientes ADD COLUMN senha_hash VARCHAR(255)"
    ]:
        try:
            db.session.execute(db.text(col_sql))
        except Exception:
            db.session.rollback()
    db.session.commit()
    print("Base de dados local finsight.db criada com sucesso!")