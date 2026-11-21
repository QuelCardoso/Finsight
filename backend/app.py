import bcrypt
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "FinSight API"})

    @app.get("/api/empresas")
    def listar_empresas():
        rows = db.session.execute(
            db.text("SELECT id, nome, cnpj FROM empresas ORDER BY id")
        ).mappings().all()
        return jsonify([dict(r) for r in rows])

    @app.get("/api/dashboard")
    def dashboard_resumo():
        empresa_id = request.args.get("empresa_id", type=int)
        if not empresa_id:
            return jsonify({"error": "empresa_id é obrigatório"}), 400

        total_clientes = db.session.execute(
            db.text("SELECT COUNT(*) FROM clientes WHERE empresa_id = :emp"),
            {"emp": empresa_id}
        ).scalar() or 0

        total_produtos = db.session.execute(
            db.text("SELECT COALESCE(SUM(quantidade), 0) FROM produtos WHERE empresa_id = :emp"),
            {"emp": empresa_id}
        ).scalar() or 0

        alertas_estoque = db.session.execute(
            db.text("SELECT COUNT(*) FROM produtos WHERE empresa_id = :emp AND quantidade <= minimo"),
            {"emp": empresa_id}
        ).scalar() or 0

        contas_pagar = db.session.execute(
            db.text("SELECT COALESCE(SUM(valor), 0) FROM transacoes WHERE empresa_id = :emp AND tipo = 'Pagar' AND status <> 'Pago'"),
            {"emp": empresa_id}
        ).scalar() or 0

        contas_receber = db.session.execute(
            db.text("SELECT COALESCE(SUM(valor), 0) FROM transacoes WHERE empresa_id = :emp AND tipo = 'Receber' AND status <> 'Pago'"),
            {"emp": empresa_id}
        ).scalar() or 0

        atrasados = db.session.execute(
            db.text("SELECT COUNT(*) FROM transacoes WHERE empresa_id = :emp AND tipo = 'Receber' AND status = 'Atrasado'"),
            {"emp": empresa_id}
        ).scalar() or 0

        return jsonify({
            "empresa_id": empresa_id,
            "total_clientes": int(total_clientes),
            "total_produtos": int(total_produtos),
            "alertas_estoque": int(alertas_estoque),
            "contas_pagar": float(contas_pagar),
            "contas_receber": float(contas_receber),
            "pendencias_atraso": int(atrasados)
        })

    # -------------------- CLIENTES --------------------
    @app.get("/api/clientes")
    def listar_clientes():
        empresa_id = request.args.get("empresa_id", type=int)
        if not empresa_id:
            return jsonify({"error": "empresa_id é obrigatório"}), 400

        rows = db.session.execute(
            db.text("""
                SELECT id, empresa_id, nome, documento, telefone, email, endereco,
                       limite::float, situacao, historico
                FROM clientes
                WHERE empresa_id = :emp
                ORDER BY id DESC
            """),
            {"emp": empresa_id}
        ).mappings().all()
        return jsonify([dict(r) for r in rows])

    @app.post("/api/clientes")
    def criar_cliente():
        data = request.get_json() or {}
        if not data.get("empresa_id") or not data.get("nome") or not data.get("documento"):
            return jsonify({"error": "empresa_id, nome e documento são obrigatórios"}), 400

        row = db.session.execute(
            db.text("""
                INSERT INTO clientes (empresa_id, nome, documento, telefone, email, endereco, limite, situacao, historico)
                VALUES (:empresa_id, :nome, :documento, :telefone, :email, :endereco, :limite, :situacao, :historico)
                RETURNING id
            """),
            {
                "empresa_id": data["empresa_id"],
                "nome": data["nome"],
                "documento": data["documento"],
                "telefone": data.get("telefone", ""),
                "email": data.get("email", ""),
                "endereco": data.get("endereco", ""),
                "limite": data.get("limite", 0),
                "situacao": data.get("situacao", "Regular"),
                "historico": data.get("historico", "")
            }
        ).fetchone()
        db.session.commit()
        return jsonify({"id": row[0], "message": "Cliente cadastrado com sucesso"}), 201

    @app.put("/api/clientes/<int:cliente_id>")
    def atualizar_cliente(cliente_id):
        data = request.get_json() or {}
        empresa_id = data.get("empresa_id")
        if not empresa_id:
            return jsonify({"error": "empresa_id é obrigatório"}), 400

        db.session.execute(
            db.text("""
                UPDATE clientes
                SET nome = :nome, documento = :documento, telefone = :telefone,
                    email = :email, endereco = :endereco, limite = :limite,
                    situacao = :situacao, historico = :historico
                WHERE id = :id AND empresa_id = :emp
            """),
            {
                "id": cliente_id,
                "emp": empresa_id,
                "nome": data.get("nome", ""),
                "documento": data.get("documento", ""),
                "telefone": data.get("telefone", ""),
                "email": data.get("email", ""),
                "endereco": data.get("endereco", ""),
                "limite": data.get("limite", 0),
                "situacao": data.get("situacao", "Regular"),
                "historico": data.get("historico", "")
            }
        )
        db.session.commit()
        return jsonify({"message": "Cliente atualizado com sucesso"})

    @app.delete("/api/clientes/<int:cliente_id>")
    def excluir_cliente(cliente_id):
        empresa_id = request.args.get("empresa_id", type=int)
        if not empresa_id:
            return jsonify({"error": "empresa_id é obrigatório"}), 400

        db.session.execute(
            db.text("DELETE FROM clientes WHERE id = :id AND empresa_id = :emp"),
            {"id": cliente_id, "emp": empresa_id}
        )
        db.session.commit()
        return jsonify({"message": "Cliente excluído com sucesso"})

    # -------------------- ESTOQUE / PRODUTOS --------------------
    @app.get("/api/produtos")
    def listar_produtos():
        empresa_id = request.args.get("empresa_id", type=int)
        if not empresa_id:
            return jsonify({"error": "empresa_id é obrigatório"}), 400

        rows = db.session.execute(
            db.text("""
                SELECT id, empresa_id, codigo, nome, descricao, categoria,
                       quantidade, minimo, compra::float, venda::float
                FROM produtos
                WHERE empresa_id = :emp
                ORDER BY id DESC
            """),
            {"emp": empresa_id}
        ).mappings().all()
        return jsonify([dict(r) for r in rows])

    @app.post("/api/produtos")
    def criar_produto():
        data = request.get_json() or {}
        if not data.get("empresa_id") or not data.get("codigo") or not data.get("nome"):
            return jsonify({"error": "empresa_id, codigo e nome são obrigatórios"}), 400

        row = db.session.execute(
            db.text("""
                INSERT INTO produtos (empresa_id, codigo, nome, descricao, categoria, quantidade, minimo, compra, venda)
                VALUES (:empresa_id, :codigo, :nome, :descricao, :categoria, :quantidade, :minimo, :compra, :venda)
                RETURNING id
            """),
            {
                "empresa_id": data["empresa_id"],
                "codigo": data["codigo"],
                "nome": data["nome"],
                "descricao": data.get("descricao", ""),
                "categoria": data.get("categoria", ""),
                "quantidade": data.get("quantidade", 0),
                "minimo": data.get("minimo", 1),
                "compra": data.get("compra", 0),
                "venda": data.get("venda", 0)
            }
        ).fetchone()
        db.session.commit()
        return jsonify({"id": row[0], "message": "Produto cadastrado com sucesso"}), 201

    @app.put("/api/produtos/<int:produto_id>")
    def atualizar_produto(produto_id):
        data = request.get_json() or {}
        empresa_id = data.get("empresa_id")
        if not empresa_id:
            return jsonify({"error": "empresa_id é obrigatório"}), 400

        db.session.execute(
            db.text("""
                UPDATE produtos
                SET codigo = :codigo, nome = :nome, descricao = :descricao,
                    categoria = :categoria, quantidade = :quantidade, minimo = :minimo,
                    compra = :compra, venda = :venda
                WHERE id = :id AND empresa_id = :emp
            """),
            {
                "id": produto_id,
                "emp": empresa_id,
                "codigo": data.get("codigo", ""),
                "nome": data.get("nome", ""),
                "descricao": data.get("descricao", ""),
                "categoria": data.get("categoria", ""),
                "quantidade": data.get("quantidade", 0),
                "minimo": data.get("minimo", 1),
                "compra": data.get("compra", 0),
                "venda": data.get("venda", 0)
            }
        )
        db.session.commit()
        return jsonify({"message": "Produto atualizado com sucesso"})

    @app.post("/api/produtos/<int:produto_id>/movimentar")
    def movimentar_estoque(produto_id):
        data = request.get_json() or {}
        empresa_id = data.get("empresa_id")
        tipo = data.get("tipo")
        qtd = int(data.get("quantidade", 0))

        if not empresa_id or tipo not in ("entrada", "saida") or qtd <= 0:
            return jsonify({"error": "Dados de movimentação inválidos"}), 400

        atual = db.session.execute(
            db.text("SELECT quantidade FROM produtos WHERE id = :id AND empresa_id = :emp"),
            {"id": produto_id, "emp": empresa_id}
        ).scalar()

        if atual is None:
            return jsonify({"error": "Produto não encontrado"}), 404
        if tipo == "saida" and qtd > atual:
            return jsonify({"error": "Quantidade de saída maior que o estoque disponível"}), 400

        nova_qtd = atual + qtd if tipo == "entrada" else atual - qtd
        db.session.execute(
            db.text("UPDATE produtos SET quantidade = :qtd WHERE id = :id AND empresa_id = :emp"),
            {"qtd": nova_qtd, "id": produto_id, "emp": empresa_id}
        )
        db.session.commit()
        return jsonify({"quantidade": nova_qtd, "message": "Estoque atualizado com sucesso"})

    @app.delete("/api/produtos/<int:produto_id>")
    def excluir_produto(produto_id):
        empresa_id = request.args.get("empresa_id", type=int)
        if not empresa_id:
            return jsonify({"error": "empresa_id é obrigatório"}), 400

        db.session.execute(
            db.text("DELETE FROM produtos WHERE id = :id AND empresa_id = :emp"),
            {"id": produto_id, "emp": empresa_id}
        )
        db.session.commit()
        return jsonify({"message": "Produto excluído com sucesso"})

    # -------------------- FUNCIONÁRIOS --------------------
    @app.get("/api/funcionarios")
    def listar_funcionarios():
        empresa_id = request.args.get("empresa_id", type=int)
        if not empresa_id:
            return jsonify({"error": "empresa_id é obrigatório"}), 400

        rows = db.session.execute(
            db.text("""
                SELECT id, empresa_id, nome, cargo, setor, telefone, email,
                       contratacao::text, usuario, nivel, ativo
                FROM funcionarios
                WHERE empresa_id = :emp
                ORDER BY id DESC
            """),
            {"emp": empresa_id}
        ).mappings().all()
        return jsonify([dict(r) for r in rows])

    @app.post("/api/funcionarios")
    def criar_funcionario():
        data = request.get_json() or {}
        if not data.get("empresa_id") or not data.get("nome") or not data.get("usuario"):
            return jsonify({"error": "empresa_id, nome e usuario são obrigatórios"}), 400

        senha_plana = (data.get("senha") or "FinSight@2026").encode("utf-8")
        senha_hash = bcrypt.hashpw(senha_plana, bcrypt.gensalt()).decode("utf-8")

        row = db.session.execute(
            db.text("""
                INSERT INTO funcionarios (empresa_id, nome, cargo, setor, telefone, email, contratacao, usuario, senha_hash, nivel, ativo)
                VALUES (:empresa_id, :nome, :cargo, :setor, :telefone, :email, :contratacao, :usuario, :senha_hash, :nivel, :ativo)
                RETURNING id
            """),
            {
                "empresa_id": data["empresa_id"],
                "nome": data["nome"],
                "cargo": data.get("cargo", ""),
                "setor": data.get("setor", ""),
                "telefone": data.get("telefone", ""),
                "email": data.get("email", ""),
                "contratacao": data.get("contratacao") or None,
                "usuario": data["usuario"],
                "senha_hash": senha_hash,
                "nivel": data.get("nivel", "Operador"),
                "ativo": data.get("ativo", True)
            }
        ).fetchone()
        db.session.commit()
        return jsonify({"id": row[0], "message": "Funcionário cadastrado com sucesso"}), 201

    @app.delete("/api/funcionarios/<int:func_id>")
    def excluir_funcionario(func_id):
        empresa_id = request.args.get("empresa_id", type=int)
        if not empresa_id:
            return jsonify({"error": "empresa_id é obrigatório"}), 400

        db.session.execute(
            db.text("DELETE FROM funcionarios WHERE id = :id AND empresa_id = :emp"),
            {"id": func_id, "emp": empresa_id}
        )
        db.session.commit()
        return jsonify({"message": "Funcionário excluído com sucesso"})

    # -------------------- FINANCEIRO E INADIMPLÊNCIA --------------------
    @app.get("/api/transacoes")
    def listar_transacoes():
        empresa_id = request.args.get("empresa_id", type=int)
        if not empresa_id:
            return jsonify({"error": "empresa_id é obrigatório"}), 400

        rows = db.session.execute(
            db.text("""
                SELECT id, empresa_id, cliente_id, tipo, descricao,
                       valor::float, vencimento::text, status
                FROM transacoes
                WHERE empresa_id = :emp
                ORDER BY vencimento ASC, id DESC
            """),
            {"emp": empresa_id}
        ).mappings().all()
        return jsonify([dict(r) for r in rows])

    @app.post("/api/transacoes")
    def criar_transacao():
        data = request.get_json() or {}
        if not data.get("empresa_id") or not data.get("tipo") or not data.get("descricao"):
            return jsonify({"error": "empresa_id, tipo e descricao são obrigatórios"}), 400

        row = db.session.execute(
            db.text("""
                INSERT INTO transacoes (empresa_id, cliente_id, tipo, descricao, valor, vencimento, status)
                VALUES (:empresa_id, :cliente_id, :tipo, :descricao, :valor, :vencimento, :status)
                RETURNING id
            """),
            {
                "empresa_id": data["empresa_id"],
                "cliente_id": data.get("cliente_id") or None,
                "tipo": data["tipo"],
                "descricao": data["descricao"],
                "valor": data.get("valor", 0),
                "vencimento": data["vencimento"],
                "status": data.get("status", "Pendente")
            }
        ).fetchone()
        db.session.commit()
        return jsonify({"id": row[0], "message": "Lançamento registado com sucesso"}), 201

    @app.patch("/api/transacoes/<int:transacao_id>/pagar")
    def marcar_como_pago(transacao_id):
        data = request.get_json() or {}
        empresa_id = data.get("empresa_id") or request.args.get("empresa_id", type=int)
        if not empresa_id:
            return jsonify({"error": "empresa_id é obrigatório"}), 400

        db.session.execute(
            db.text("UPDATE transacoes SET status = 'Pago' WHERE id = :id AND empresa_id = :emp"),
            {"id": transacao_id, "emp": empresa_id}
        )
        db.session.commit()
        return jsonify({"message": "Lançamento marcado como pago"})

    @app.delete("/api/transacoes/<int:transacao_id>")
    def excluir_transacao(transacao_id):
        empresa_id = request.args.get("empresa_id", type=int)
        if not empresa_id:
            return jsonify({"error": "empresa_id é obrigatório"}), 400

        db.session.execute(
            db.text("DELETE FROM transacoes WHERE id = :id AND empresa_id = :emp"),
            {"id": transacao_id, "emp": empresa_id}
        )
        db.session.commit()
        return jsonify({"message": "Lançamento excluído com sucesso"})

    @app.get("/api/inadimplencia")
    def listar_inadimplencia():
        empresa_id = request.args.get("empresa_id", type=int)
        if not empresa_id:
            return jsonify({"error": "empresa_id é obrigatório"}), 400

        rows = db.session.execute(
            db.text("""
                SELECT t.id, t.descricao, t.valor::float, t.vencimento::text, t.status,
                       GREATEST(CURRENT_DATE - t.vencimento, 0) AS dias_atraso,
                       c.nome AS cliente_nome, c.telefone AS cliente_telefone,
                       (SELECT COUNT(*) FROM cobrancas cb WHERE cb.transacao_id = t.id) AS total_cobrancas
                FROM transacoes t
                LEFT JOIN clientes c ON c.id = t.cliente_id
                WHERE t.empresa_id = :emp AND t.tipo = 'Receber' AND t.status = 'Atrasado'
                ORDER BY t.vencimento ASC
            """),
            {"emp": empresa_id}
        ).mappings().all()
        return jsonify([dict(r) for r in rows])

    @app.post("/api/transacoes/<int:transacao_id>/cobrancas")
    def registar_cobranca(transacao_id):
        data = request.get_json() or {}
        empresa_id = data.get("empresa_id")
        observacao = (data.get("observacao") or "").strip()

        if not empresa_id or not observacao:
            return jsonify({"error": "empresa_id e observacao são obrigatórios"}), 400

        row = db.session.execute(
            db.text("""
                INSERT INTO cobrancas (empresa_id, transacao_id, observacao)
                VALUES (:emp, :tid, :obs)
                RETURNING id, registado_em::text
            """),
            {"emp": empresa_id, "tid": transacao_id, "obs": observacao}
        ).fetchone()
        db.session.commit()
        return jsonify({"id": row[0], "registado_em": row[1], "message": "Cobrança registada com sucesso"}), 201
    @app.post("/api/cliente-auth/login")
    def login_cliente():
        data = request.get_json() or {}
        empresa_id = data.get("empresa_id")
        identificador = (data.get("usuario") or "").strip().lower()
        senha = (data.get("senha") or "").encode("utf-8")

        if not empresa_id or not identificador or not senha:
            return jsonify({"error": "empresa_id, usuario e senha são obrigatórios"}), 400

        row = db.session.execute(
            db.text("""
                SELECT id, empresa_id, nome, documento, telefone, email, endereco,
                       limite::float, situacao, historico, usuario, senha_hash
                FROM clientes
                WHERE empresa_id = :emp
                  AND (LOWER(usuario) = :ident OR LOWER(email) = :ident)
                LIMIT 1
            """),
            {"emp": empresa_id, "ident": identificador}
        ).mappings().first()

        if not row:
            return jsonify({"error": "Credenciais inválidas"}), 401

        stored_hash = row["senha_hash"] or ""
        valido = False
        if stored_hash.startswith(""):
            valido = bcrypt.checkpw(senha, stored_hash.encode("utf-8"))
        else:
            valido = (senha.decode("utf-8", errors="ignore") == (stored_hash or "Cliente@2026"))

        if not valido:
            return jsonify({"error": "Credenciais inválidas"}), 401

        cliente_dict = dict(row)
        cliente_dict.pop("senha_hash", None)
        return jsonify({"cliente": cliente_dict})

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)