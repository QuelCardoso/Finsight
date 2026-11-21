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

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)