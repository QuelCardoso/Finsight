(function isolarAreaClienteFinSight() {
    function ehModoCliente() {
        return sessionStorage.getItem("finsight_modo_cliente_exclusivo") === "1";
    }

    function getClienteSessao() {
        try {
            const raw = sessionStorage.getItem("finsight_cliente_sessao");
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    }

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function renderizarPortalExclusivo(cliente) {
        const container = document.getElementById("module-container");
        if (!container) return;

        const tituloEl = document.getElementById("current-module-title");
        if (tituloEl) tituloEl.innerText = "Área do Cliente — Minhas Compras e Pagamentos";

        const empId = Number(localStorage.getItem("finsight_empresa_ativa") || localStorage.getItem("empresaAtiva") || 1);
        const db = typeof getDB === "function" ? getDB() : {};
        const dadosEmp = db[empId] || {};
        const transacoes = (dadosEmp.transacoes || []).filter(t => Number(t.clienteId) === Number(cliente.id));

        const totalPago = transacoes.filter(t => (t.status || "").toLowerCase() === "pago").reduce((acc, t) => acc + Number(t.valor || 0), 0);
        const totalAberto = transacoes.filter(t => (t.status || "").toLowerCase() !== "pago").reduce((acc, t) => acc + Number(t.valor || 0), 0);

        const linhas = transacoes.length
            ? transacoes.map(t => {
                const st = t.status || "Pendente";
                const badgeClass = st.toLowerCase() === "pago"
                    ? "badge-success"
                    : (st.toLowerCase() === "atrasado" ? "badge-danger" : "badge-warning");
                const acaoBtn = st.toLowerCase() !== "pago"
                    ? `<button type="button" class="btn-primary" style="padding:6px 12px;font-size:0.82rem;" data-pagar-id="${t.id}">Pagar Parcela</button>`
                    : `<span style="color:#15803D;font-weight:600;font-size:0.85rem;">Quitado</span>`;
                return `
                    <tr>
                        <td><strong>${t.descricao || "Compra"}</strong><br><small style="color:var(--text-muted);">${t.parcelas || "Parcela única"}</small></td>
                        <td>${t.vencimento || "-"}</td>
                        <td><strong>${formatarMoeda(t.valor)}</strong></td>
                        <td><span class="badge ${badgeClass}">${st}</span></td>
                        <td>${acaoBtn}</td>
                    </tr>
                `;
            }).join("")
            : `<tr><td colspan="5" style="text-align:center;padding:18px;">Nenhuma compra ou parcela registrada para este cliente.</td></tr>`;

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:18px;">
                <div class="card" style="padding:16px;">
                    <div style="font-size:0.85rem;color:var(--text-muted);">Cliente</div>
                    <div style="font-size:1.15rem;font-weight:700;margin-top:4px;">${cliente.nome}</div>
                    <small style="color:var(--text-muted);">Usuário: ${cliente.usuario || "-"}</small>
                </div>
                <div class="card" style="padding:16px;">
                    <div style="font-size:0.85rem;color:var(--text-muted);">Total Pago</div>
                    <div style="font-size:1.25rem;font-weight:700;color:#15803D;margin-top:4px;">${formatarMoeda(totalPago)}</div>
                </div>
                <div class="card" style="padding:16px;">
                    <div style="font-size:0.85rem;color:var(--text-muted);">Em Aberto / A Vencer</div>
                    <div style="font-size:1.25rem;font-weight:700;color:#B45309;margin-top:4px;">${formatarMoeda(totalAberto)}</div>
                </div>
            </div>
            <div class="card table-container" style="padding:16px;">
                <h3 style="margin-top:0;margin-bottom:12px;">Histórico de Compras e Parcelas</h3>
                <table class="data-table" style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr>
                            <th>Descrição / Parcela</th>
                            <th>Vencimento</th>
                            <th>Valor</th>
                            <th>Status</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>${linhas}</tbody>
                </table>
            </div>
        `;

        container.querySelectorAll("[data-pagar-id]").forEach(btn => {
            btn.addEventListener("click", () => {
                const txId = Number(btn.getAttribute("data-pagar-id"));
                if (typeof getDB === "function" && typeof saveDB === "function") {
                    const dbAtual = getDB();
                    const listaTx = (dbAtual[empId] && dbAtual[empId].transacoes) || [];
                    const alvo = listaTx.find(item => Number(item.id) === txId);
                    if (alvo) {
                        alvo.status = "Pago";
                        saveDB(dbAtual);
                        renderizarPortalExclusivo(cliente);
                    }
                }
            });
        });
    }

    function aplicarIsolamentoCliente() {
        if (!ehModoCliente()) return;
        const cliente = getClienteSessao();
        if (!cliente) return;

        const authEl = document.getElementById("auth-screen");
        const appEl = document.getElementById("app-screen");
        if (authEl) authEl.style.setProperty("display", "none", "important");
        if (appEl) appEl.style.setProperty("display", "flex", "important");

        document.querySelectorAll(".sidebar-nav a, .sidebar-nav button, .nav-item").forEach(item => {
            const txt = (item.innerText || "").toLowerCase();
            const isSair = txt.includes("sair") || (item.getAttribute("onclick") || "").toLowerCase().includes("logout");
            const isPortal = txt.includes("portal") || txt.includes("minha área") || txt.includes("minha area") || txt.includes("compras");
            if (!isSair && !isPortal) {
                item.style.setProperty("display", "none", "important");
            } else {
                item.style.setProperty("display", "", "important");
            }
        });

        const badge = document.getElementById("empresa-logada-badge");
        if (badge) badge.innerText = `Cliente: ${cliente.nome}`;

        const container = document.getElementById("module-container");
        if (container && !container.innerHTML.includes("Histórico de Compras e Parcelas")) {
            renderizarPortalExclusivo(cliente);
        }
    }

    setInterval(aplicarIsolamentoCliente, 200);
})();