(function garantirDashboardCompletoFinSight() {
    function formatBRL(v) {
        return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function montarSeNecessario() {
        if (sessionStorage.getItem("finsight_modo_cliente_exclusivo") === "1") return;

        const container = document.getElementById("module-container") || document.querySelector("main .content, main, .main-content");
        if (!container) return;

        // Se o dashboard oficial já renderizou (tem gráficos, vários cards ou tabela), não substitui
        const cardsExistentes = container.querySelectorAll(".card").length;
        const temGraficoOuTabela = Boolean(container.querySelector("canvas, table, svg"));
        if (cardsExistentes >= 4 || temGraficoOuTabela) return;

        const textoLimpo = (container.innerText || "").trim();
        if (textoLimpo.length > 120) return;

        const empId = Number(localStorage.getItem("finsight_empresa_ativa") || localStorage.getItem("empresaAtiva") || 1);
        const db = typeof getDB === "function" ? getDB() : {};
        const emp = db[empId] || {};
        const clientes = Array.isArray(emp.clientes) ? emp.clientes : [];
        const estoque = Array.isArray(emp.estoque) ? emp.estoque : (Array.isArray(emp.produtos) ? emp.produtos : []);
        const transacoes = Array.isArray(emp.transacoes) ? emp.transacoes : [];

        const totalEstoque = estoque.reduce((soma, item) => {
            const qtd = Number(item.quantidade ?? item.qtd ?? item.estoque ?? 1);
            return soma + (Number.isFinite(qtd) ? qtd : 1);
        }, 0);

        const totalReceber = transacoes
            .filter(t => (t.tipo || "").toLowerCase() === "receber" && (t.status || "").toLowerCase() !== "pago")
            .reduce((s, t) => s + Number(t.valor || 0), 0);

        const totalPago = transacoes
            .filter(t => (t.status || "").toLowerCase() === "pago")
            .reduce((s, t) => s + Number(t.valor || 0), 0);

        const inadimplentes = clientes.filter(c => (c.situacao || "").toLowerCase() === "inadimplente").length;

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px;padding:8px 0;">
                <div class="card" style="padding:18px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;">
                    <div style="font-size:0.85rem;color:#64748b;">Clientes Cadastrados</div>
                    <div style="font-size:1.5rem;font-weight:700;margin-top:6px;color:#0f172a;">${clientes.length}</div>
                    <small style="color:#64748b;">${inadimplentes} em situação de inadimplência</small>
                </div>
                <div class="card" style="padding:18px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;">
                    <div style="font-size:0.85rem;color:#64748b;">Total Recebido</div>
                    <div style="font-size:1.5rem;font-weight:700;margin-top:6px;color:#15803D;">${formatBRL(totalPago)}</div>
                    <small style="color:#64748b;">Parcelas quitadas no período</small>
                </div>
                <div class="card" style="padding:18px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;">
                    <div style="font-size:0.85rem;color:#64748b;">A Receber / Em Aberto</div>
                    <div style="font-size:1.5rem;font-weight:700;margin-top:6px;color:#B45309;">${formatBRL(totalReceber)}</div>
                    <small style="color:#64748b;">Parcelas pendentes ou em atraso</small>
                </div>
                <div class="card" style="padding:18px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;">
                    <div style="font-size:0.85rem;color:#64748b;">Itens em Estoque</div>
                    <div style="font-size:1.5rem;font-weight:700;margin-top:6px;color:#0b5ed7;">${totalEstoque || estoque.length}</div>
                    <small style="color:#64748b;">Unidades/produtos registrados na empresa</small>
                </div>
            </div>
        `;
    }

    setTimeout(montarSeNecessario, 900);
    setTimeout(montarSeNecessario, 1800);
})();