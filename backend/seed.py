import sys
from pathlib import Path
import bcrypt

sys.path.insert(0, str(Path(__file__).resolve().parent))
from app import app, db

with app.app_context():
    qtd_clientes = db.session.execute(db.text("SELECT COUNT(*) FROM clientes")).scalar() or 0
    if qtd_clientes == 0:
        db.session.execute(db.text("""
            INSERT INTO clientes (empresa_id, nome, documento, telefone, email, endereco, limite, situacao, historico) VALUES
            (1, 'Comércio Silva & Filhos Ltda', '12.345.678/0001-90', '(75) 99123-4567', 'contato@silvafilhos.com', 'Av. Roberto Santos, 450', 15000.00, 'Regular', 'Última compra: R$ 3.200,00 em 10/11/2026'),
            (1, 'Mariana Costa Oliveira', '123.456.789-00', '(75) 98877-6655', 'mariana.costa@email.com', 'Rua Rui Barbosa, 112', 3500.00, 'Inadimplente', 'Fatura em aberto: R$ 850,00'),
            (2, 'Supermercado Recôncavo', '98.765.432/0001-10', '(75) 3631-2200', 'compras@reconcavo.com', 'BR-101, Km 265', 50000.00, 'Regular', 'Última compra: R$ 14.500,00 em 15/11/2026');
        """))

        db.session.execute(db.text("""
            INSERT INTO produtos (empresa_id, codigo, nome, descricao, categoria, quantidade, minimo, compra, venda) VALUES
            (1, 'PRD-001', 'Notebook Corporativo i5', '8GB RAM, SSD 256GB', 'Informática', 14, 5, 2400.00, 3290.00),
            (1, 'PRD-002', 'Monitor LED 24" Full HD', 'HDMI/VGA Ajustável', 'Periféricos', 3, 6, 580.00, 890.00),
            (2, 'BEB-101', 'Fardo Água Mineral 500ml (12un)', 'Sem gás', 'Bebidas', 120, 30, 8.50, 14.00);
        """))

        db.session.execute(db.text("""
            INSERT INTO transacoes (empresa_id, cliente_id, tipo, descricao, valor, vencimento, status) VALUES
            (1, 1, 'Receber', 'Fatura #104 - Comércio Silva & Filhos', 3200.00, '2026-11-25', 'Pendente'),
            (1, 2, 'Receber', 'Fatura #105 - Mariana Costa Oliveira', 850.00, '2026-11-05', 'Atrasado'),
            (1, NULL, 'Pagar', 'Fornecedor de Hardware', 4800.00, '2026-11-28', 'Pendente'),
            (1, NULL, 'Receita', 'Venda à Vista - Balcão', 6450.00, '2026-11-12', 'Pago'),
            (1, NULL, 'Despesa', 'Energia Elétrica e Internet', 1120.00, '2026-11-10', 'Pago');
        """))

        senha_hash = bcrypt.hashpw(b"FinSight@2026", bcrypt.gensalt()).decode("utf-8")
        db.session.execute(db.text("""
            INSERT INTO funcionarios (empresa_id, nome, cargo, setor, telefone, email, contratacao, usuario, senha_hash, nivel, ativo) VALUES
            (1, 'Carlos Eduardo Almeida', 'Analista Financeiro', 'Financeiro', '(75) 99911-2233', 'carlos.almeida@finsight.com', '2025-02-10', 'calmeida', :sh, 'Gerente', 1),
            (1, 'Beatriz Santos Rocha', 'Assistente de Estoque', 'Logística', '(75) 98844-5566', 'beatriz.rocha@finsight.com', '2026-01-15', 'brocha', :sh, 'Operador', 1);
        """), {"sh": senha_hash})

        db.session.commit()
        print("Dados iniciais inseridos com sucesso!")
    else:
        print("A base de dados já possui registos.")