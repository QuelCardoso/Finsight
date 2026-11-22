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

    function fecharModalPagamento() {
        const modal = document.getElementById("modal-link-pagamento-cliente");
        if (modal) modal.remove();
    }

    function abrirModalLinkPagamento(cliente, empId, transacao) {
        fecharModalPagamento();
        const valorFmt = formatarMoeda(transacao.valor);
        const codigoRef = `FS-${empId}-${transacao.id}-${Date.now().toString().slice(-4)}`;
        const urlPagamento = `${window.location.origin}${window.location.pathname}?pay=${codigoRef}`;
        const pixCopiaCola = `00020126580014BR.GOV.BCB.PIX0136finsight-pagamentos@finsight.com.br520400005303986540${Number(transacao.valor || 0).toFixed(2)}5802BR5915FINSIGHT GESTAO6009SAJ BAHIA62070503***6304A1B2`;
        const linhaBoleto = `34191.79001 01043.510047 91020.150008 8 98950000${String(Math.round(Number(transacao.valor || 0) * 100)).padStart(6, "0")}`;

        const overlay = document.createElement("div");
        overlay.id = "modal-link-pagamento-cliente";
        overlay.style.cssText = "position:fixed;inset:0;background:rgba(15,23,42,0.68);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;";

        overlay.innerHTML = `
            <div class="card" style="width:100%;max-width:500px;padding:22px;border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,0.28);background:var(--bg-card,#ffffff);color:var(--text-main,#0f172a);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <h3 style="margin:0;font-size:1.15rem;">Link de Pagamento Seguro</h3>
                    <button type="button" id="btn-fechar-modal-pay" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:inherit;">&times;</button>
                </div>
                <div style="background:rgba(14,165,233,0.08);border:1px solid rgba(14,165,233,0.25);border-radius:8px;padding:12px;margin-bottom:14px;">
                    <div style="font-size:0.85rem;color:var(--text-muted,#64748b);">${transacao.descricao || "Compra"} (${transacao.parcelas || "Parcela única"})</div>
                    <div style="font-size:1.35rem;font-weight:700;margin-top:4px;">${valorFmt}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted,#64748b);margin-top:2px;">Vencimento: ${transacao.vencimento || "-"} • Ref: ${codigoRef}</div>
                </div>

                <label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:6px;">Link direto desta cobrança</label>
                <div style="display:flex;gap:8px;margin-bottom:14px;">
                    <input type="text" id="input-url-pagamento" readonly value="${urlPagamento}" style="flex:1;padding:8px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.82rem;background:#f8fafc;color:#0f172a;">
                    <button type="button" id="btn-copiar-url-pay" class="btn-secondary" style="padding:8px 12px;white-space:nowrap;">Copiar Link</button>
                </div>

                <label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:8px;">Escolha a melhor forma para pagar</label>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">
                    <button type="button" class="btn-metodo-pay" data-metodo="pix" style="padding:10px 8px;border-radius:8px;border:2px solid #0284c7;background:rgba(2,132,199,0.1);font-weight:600;cursor:pointer;">Pix Instantâneo</button>
                    <button type="button" class="btn-metodo-pay" data-metodo="cartao" style="padding:10px 8px;border-radius:8px;border:1px solid #cbd5e1;background:transparent;font-weight:600;cursor:pointer;">Cartão de Crédito</button>
                    <button type="button" class="btn-metodo-pay" data-metodo="boleto" style="padding:10px 8px;border-radius:8px;border:1px solid #cbd5e1;background:transparent;font-weight:600;cursor:pointer;">Boleto Bancário</button>
                </div>

                <div id="detalhes-metodo-pay" style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:14px;font-size:0.85rem;">
                    <strong>Pix Copia e Cola:</strong>
                    <textarea readonly rows="2" style="width:100%;margin-top:6px;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.78rem;resize:none;">${pixCopiaCola}</textarea>
                </div>

                <div id="feedback-copia-pay" style="font-size:0.82rem;color:#15803D;margin-bottom:10px;display:none;"></div>

                <div style="display:flex;justify-content:flex-end;gap:10px;">
                    <button type="button" id="btn-cancelar-modal-pay" class="btn-secondary" style="padding:9px 14px;">Fechar</button>
                    <button type="button" id="btn-confirmar-pagamento-link" class="btn-primary" style="padding:9px 16px;">Confirmar Pagamento</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const feedbackEl = overlay.querySelector("#feedback-copia-pay");
        const detalhesEl = overlay.querySelector("#detalhes-metodo-pay");

        overlay.querySelector("#btn-fechar-modal-pay").addEventListener("click", fecharModalPagamento);
        overlay.querySelector("#btn-cancelar-modal-pay").addEventListener("click", fecharModalPagamento);
        overlay.addEventListener("click", (e) => { if (e.target === overlay) fecharModalPagamento(); });

        overlay.querySelector("#btn-copiar-url-pay").addEventListener("click", () => {
            const inp = overlay.querySelector("#input-url-pagamento");
            inp.select();
            navigator.clipboard?.writeText(inp.value).catch(() => {});
            feedbackEl.innerText = "Link de pagamento copiado para a área de transferência!";
            feedbackEl.style.display = "block";
        });

        overlay.querySelectorAll(".btn-metodo-pay").forEach((btn) => {
            btn.addEventListener("click", () => {
                overlay.querySelectorAll(".btn-metodo-pay").forEach((b) => {
                    b.style.border = "1px solid #cbd5e1";
                    b.style.background = "transparent";
                });
                btn.style.border = "2px solid #0284c7";
                btn.style.background = "rgba(2,132,199,0.1)";

                const metodo = btn.getAttribute("data-metodo");
                if (metodo === "pix") {
                    detalhesEl.innerHTML = `<strong>Pix Copia e Cola (aprovação na hora):</strong><textarea readonly rows="2" style="width:100%;margin-top:6px;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.78rem;resize:none;">${pixCopiaCola}</textarea>`;
                } else if (metodo === "cartao") {
                    detalhesEl.innerHTML = `
                        <strong>Pagamento via Cartão de Crédito:</strong>
                        <div style="margin-top:8px;display:grid;gap:8px;">
                            <select style="padding:7px;border:1px solid #cbd5e1;border-radius:6px;">
                                <option>1x de ${valorFmt} sem juros</option>
                                <option>2x de ${formatarMoeda(Number(transacao.valor || 0) / 2)} sem juros</option>
                                <option>3x de ${formatarMoeda(Number(transacao.valor || 0) / 3)} sem juros</option>
                            </select>
                            <small style="color:var(--text-muted,#64748b);">Ambiente protegido com aprovação imediata no link.</small>
                        </div>
                    `;
                } else {
                    detalhesEl.innerHTML = `<strong>Linha Digitável do Boleto Bancário:</strong><input type="text" readonly value="${linhaBoleto}" style="width:100%;margin-top:6px;padding:7px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.8rem;">`;
                }
            });
        });

        overlay.querySelector("#btn-confirmar-pagamento-link").addEventListener("click", () => {
            if (typeof getDB === "function" && typeof saveDB === "function") {
                const dbAtual = getDB();
                const listaTx = (dbAtual[empId] && dbAtual[empId].transacoes) || [];
                const alvo = listaTx.find((item) => Number(item.id) === Number(transacao.id));
                if (alvo) {
                    alvo.status = "Pago";
                    saveDB(dbAtual);
                }
            }
            fecharModalPagamento();
            renderizarPortalExclusivo(cliente);
        });
    }

    function renderizarPortalExclusivo(cliente) {
        const container = document.getElementById("module-container");
        if (!container) return;

        const tituloEl = document.getElementById("current-module-title");
        if (tituloEl) tituloEl.innerText = "Área do Cliente — Minhas Compras e Pagamentos";

        const empId = Number(localStorage.getItem("finsight_empresa_ativa") || localStorage.getItem("empresaAtiva") || 1);
        const db = typeof getDB === "function" ? getDB() : {};
        const dadosEmp = db[empId] || {};
        const transacoes = (dadosEmp.transacoes || []).filter((t) => Number(t.clienteId) === Number(cliente.id));

        const totalPago = transacoes.filter((t) => (t.status || "").toLowerCase() === "pago").reduce((acc, t) => acc + Number(t.valor || 0), 0);
        const totalAberto = transacoes.filter((t) => (t.status || "").toLowerCase() !== "pago").reduce((acc, t) => acc + Number(t.valor || 0), 0);

        const linhasHtml = transacoes.length
            ? transacoes.map((t) => {
                const st = t.status || "Pendente";
                const badgeClass = st.toLowerCase() === "pago"
                    ? "badge-success"
                    : (st.toLowerCase() === "atrasado" ? "badge-danger" : "badge-warning");
                const acaoBtn = st.toLowerCase() !== "pago"
                    ? `<button type="button" class="btn-primary" style="padding:6px 12px;font-size:0.82rem;" data-link-pagar-id="${t.id}">Link de Pagamento</button>`
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
                    <small style="color:var(--text-muted);">${cliente.email || cliente.usuario || "-"}</small>
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
                            <th>Pagamento</th>
                        </tr>
                    </thead>
                    <tbody>${linhasHtml}</tbody>
                </table>
            </div>
        `;

        container.querySelectorAll("[data-link-pagar-id]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const txId = Number(btn.getAttribute("data-link-pagar-id"));
                const transacaoAlvo = transacoes.find((item) => Number(item.id) === txId);
                if (transacaoAlvo) {
                    abrirModalLinkPagamento(cliente, empId, transacaoAlvo);
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

        document.querySelectorAll(".sidebar-nav a, .sidebar-nav button, .nav-item").forEach((item) => {
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