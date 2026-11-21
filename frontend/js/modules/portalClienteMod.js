function getClienteAutenticado() {
    const raw = sessionStorage.getItem('finsight_cliente_sessao');
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (_) {
        return null;
    }
}

function setClienteAutenticado(clienteObj) {
    sessionStorage.setItem('finsight_cliente_sessao', JSON.stringify(clienteObj));
}

function limparSessaoCliente() {
    sessionStorage.removeItem('finsight_cliente_sessao');
}

function classificarLancamentoCliente(t) {
    if (t.status === 'Pago') return 'Pago';
    if (t.status === 'Atrasado') return 'Pendente';
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (t.vencimento) {
        const partes = t.vencimento.split('-');
        if (partes.length === 3) {
            const venc = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
            venc.setHours(0, 0, 0, 0);
            const diffDias = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
            if (diffDias <= 0) return 'Pendente';
            if (diffDias <= 15) return 'Pendente';
            return 'Por Vir';
        }
    }
    return 'Pendente';
}

function getLancamentosExclusivosCliente(dados, cliente) {
    if (!cliente) return [];
    const nomeLower = (cliente.nome || '').toLowerCase();
    return (dados.transacoes || []).filter(t => {
        if (t.clienteId && Number(t.clienteId) === Number(cliente.id)) return true;
        if (t.cliente_id && Number(t.cliente_id) === Number(cliente.id)) return true;
        if (t.tipo === 'Receber' && nomeLower && (t.descricao || '').toLowerCase().includes(nomeLower)) {
            return true;
        }
        return false;
    }).map(t => ({
        ...t,
        categoriaPagamento: classificarLancamentoCliente(t),
        parcelasInfo: t.parcelas || t.parcelamento || '1x (À vista)'
    }));
}

let filtroPortalAtual = 'todos';

function setFiltroPortalCliente(filtro) {
    filtroPortalAtual = filtro;
    renderPortalClienteModule();
}

function renderPortalClienteModule() {
    const container = document.getElementById('module-container');
    const dados = getEmpresaData();
    const clienteSessao = getClienteAutenticado();
    const clientes = dados.clientes || [];

    const cliente = clienteSessao
        ? (clientes.find(c => Number(c.id) === Number(clienteSessao.id)) || clienteSessao)
        : (clientes[0] || null);

    if (!cliente) {
        container.innerHTML = `
            <div style="background:white; padding:24px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <p style="color: var(--text-muted);">Nenhum cadastro de cliente encontrado.</p>
            </div>
        `;
        return;
    }

    const itens = getLancamentosExclusivosCliente(dados, cliente);
    const pendentes = itens.filter(i => i.categoriaPagamento === 'Pendente');
    const pagos = itens.filter(i => i.categoriaPagamento === 'Pago');
    const porVir = itens.filter(i => i.categoriaPagamento === 'Por Vir');

    const totalPendente = pendentes.reduce((acc, i) => acc + Number(i.valor || 0), 0);
    const totalPago = pagos.reduce((acc, i) => acc + Number(i.valor || 0), 0);
    const totalPorVir = porVir.reduce((acc, i) => acc + Number(i.valor || 0), 0);

    const filtrados = itens.filter(i => {
        if (filtroPortalAtual === 'pendentes') return i.categoriaPagamento === 'Pendente';
        if (filtroPortalAtual === 'pagos') return i.categoriaPagamento === 'Pago';
        if (filtroPortalAtual === 'por_vir') return i.categoriaPagamento === 'Por Vir';
        return true;
    });

    container.innerHTML = `
        <div style="background:white; padding:18px 22px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom:20px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px;">
            <div>
                <h3 style="margin:0; color:var(--primary-blue); font-size:1.1rem;">Olá, ${cliente.nome}</h3>
                <p style="margin:4px 0 0; color:var(--text-muted); font-size:0.9rem;">
                    Documento: ${cliente.documento || '-'} • Usuário: <strong>${cliente.usuario || cliente.email || '-'}</strong>
                </p>
            </div>
            <span class="badge ${cliente.situacao === 'Inadimplente' ? 'badge-danger' : 'badge-success'}">
                Situação: ${cliente.situacao || 'Regular'}
            </span>
        </div>

        <div class="cards-grid">
            <div class="card-metric" style="border-left-color: #EF4444;">
                <h4>Pagamentos Pendentes / Atrasados</h4>
                <div class="value" style="color: #EF4444;">${formatBRL(totalPendente)}</div>
            </div>
            <div class="card-metric" style="border-left-color: var(--accent-green);">
                <h4>Pagamentos Já Pagos</h4>
                <div class="value">${formatBRL(totalPago)}</div>
            </div>
            <div class="card-metric" style="border-left-color: var(--primary-blue);">
                <h4>Pagamentos Por Vir</h4>
                <div class="value">${formatBRL(totalPorVir)}</div>
            </div>
        </div>

        <div style="background:white; padding:16px 20px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom:20px;">
            <h4 style="margin:0 0 6px; color:var(--primary-blue);">Histórico de Compras</h4>
            <p style="margin:0; color:var(--text-muted); font-size:0.95rem;">
                ${cliente.historico || 'Acompanhe abaixo suas compras, parcelamentos e status de cada pagamento.'}
            </p>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
            <button type="button" class="${filtroPortalAtual === 'todos' ? 'btn-add' : 'a11y-btn'}" onclick="setFiltroPortalCliente('todos')">Todas as Compras / Parcelas (${itens.length})</button>
            <button type="button" class="${filtroPortalAtual === 'pendentes' ? 'btn-add' : 'a11y-btn'}" onclick="setFiltroPortalCliente('pendentes')">Pendentes (${pendentes.length})</button>
            <button type="button" class="${filtroPortalAtual === 'pagos' ? 'btn-add' : 'a11y-btn'}" onclick="setFiltroPortalCliente('pagos')">Já Pagos (${pagos.length})</button>
            <button type="button" class="${filtroPortalAtual === 'por_vir' ? 'btn-add' : 'a11y-btn'}" onclick="setFiltroPortalCliente('por_vir')">Por Vir (${porVir.length})</button>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Compra / Descrição</th>
                        <th>Parcelamento</th>
                        <th>Vencimento</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtrados.length === 0 ? `
                        <tr><td colspan="6" style="text-align:center; color:var(--text-muted);">Nenhum registo encontrado nesta categoria.</td></tr>
                    ` : filtrados.map(item => {
                        const vencFmt = item.vencimento ? item.vencimento.split('-').reverse().join('/') : '-';
                        const badgeClass = item.status === 'Pago'
                            ? 'badge-success'
                            : (item.categoriaPagamento === 'Pendente' ? 'badge-danger' : 'badge-warning');
                        const acaoBtn = item.status === 'Pago'
                            ? `<span style="color:var(--text-muted); font-size:0.875rem;"><i class="fa-solid fa-check"></i> Pago</span>`
                            : `<button type="button" class="btn-add" style="padding:6px 12px; font-size:0.875rem;" onclick="abrirModalPagamentoPortal(${item.id})"><i class="fa-solid fa-wallet"></i> Pagar</button>`;

                        return `
                            <tr>
                                <td><strong>${item.descricao}</strong></td>
                                <td>${item.parcelasInfo}</td>
                                <td>${vencFmt}</td>
                                <td><strong>${formatBRL(item.valor)}</strong></td>
                                <td><span class="badge ${badgeClass}">${item.status}</span></td>
                                <td>${acaoBtn}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <div id="modal-pagamento-portal" class="modal-overlay">
            <div class="modal-box">
                <div class="modal-header">
                    <h3>Realizar Pagamento</h3>
                    <button class="modal-close" type="button" onclick="fecharModalPagamentoPortal()">&times;</button>
                </div>
                <form onsubmit="confirmarPagamentoPortal(event)">
                    <input type="hidden" id="portal-pag-transacao-id">
                    <p id="portal-pag-resumo" style="margin-bottom:14px; font-weight:600;"></p>
                    <div class="input-group">
                        <label for="portal-pag-metodo">Forma de Pagamento</label>
                        <select id="portal-pag-metodo" required>
                            <option value="PIX">PIX Instantâneo</option>
                            <option value="Boleto">Boleto Bancário</option>
                            <option value="Cartão de Crédito">Cartão de Crédito</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary">Confirmar Pagamento</button>
                </form>
            </div>
        </div>
    `;
}

function abrirModalPagamentoPortal(transacaoId) {
    const dados = getEmpresaData();
    const t = (dados.transacoes || []).find(item => Number(item.id) === Number(transacaoId));
    if (!t) return;
    document.getElementById('portal-pag-transacao-id').value = t.id;
    document.getElementById('portal-pag-resumo').innerText = `${t.descricao} — Valor: ${formatBRL(t.valor)}`;
    document.getElementById('modal-pagamento-portal').style.display = 'flex';
}

function fecharModalPagamentoPortal() {
    document.getElementById('modal-pagamento-portal').style.display = 'none';
}

async function confirmarPagamentoPortal(event) {
    event.preventDefault();
    const transacaoId = Number(document.getElementById('portal-pag-transacao-id').value);
    const metodo = document.getElementById('portal-pag-metodo').value;
    const empId = getCurrentEmpresaId();
    const db = getDB();
    const empDados = db[empId];
    if (!empDados) return;

    const t = (empDados.transacoes || []).find(item => Number(item.id) === transacaoId);
    if (t) {
        t.status = 'Pago';
        t.formaPagamento = metodo;
    }

    saveDB(db);
    fecharModalPagamentoPortal();

    await apiRequest(`/transacoes/${transacaoId}/pagar`, {
        method: 'PATCH',
        body: JSON.stringify({ empresa_id: empId, metodo })
    });

    renderPortalClienteModule();
}