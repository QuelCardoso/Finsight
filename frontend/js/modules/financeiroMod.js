let financeiroChartInstance = null;

function renderFinanceiroModule() {
    const container = document.getElementById('module-container');
    const dados = getEmpresaData();

    const totalReceber = dados.transacoes
        .filter(t => t.tipo === 'Receber' && t.status !== 'Pago')
        .reduce((acc, t) => acc + t.valor, 0);

    const totalPagar = dados.transacoes
        .filter(t => t.tipo === 'Pagar' && t.status !== 'Pago')
        .reduce((acc, t) => acc + t.valor, 0);

    const totalReceitasPagas = dados.transacoes
        .filter(t => (t.tipo === 'Receita' || (t.tipo === 'Receber' && t.status === 'Pago')))
        .reduce((acc, t) => acc + t.valor, 0);

    const totalDespesasPagas = dados.transacoes
        .filter(t => (t.tipo === 'Despesa' || (t.tipo === 'Pagar' && t.status === 'Pago')))
        .reduce((acc, t) => acc + t.valor, 0);

    const fluxoCaixa = totalReceitasPagas - totalDespesasPagas;

    container.innerHTML = `
        <div class="cards-grid">
            <div class="card-metric" style="border-left-color: var(--accent-green);">
                <h4>Contas a Receber (Aberto)</h4>
                <div class="value">${formatBRL(totalReceber)}</div>
            </div>
            <div class="card-metric" style="border-left-color: #EF4444;">
                <h4>Contas a Pagar (Aberto)</h4>
                <div class="value">${formatBRL(totalPagar)}</div>
            </div>
            <div class="card-metric" style="border-left-color: var(--tech-blue);">
                <h4>Fluxo de Caixa (Realizado)</h4>
                <div class="value" style="color: ${fluxoCaixa >= 0 ? 'var(--accent-green)' : '#EF4444'};">${formatBRL(fluxoCaixa)}</div>
            </div>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 25px; max-height: 300px;">
            <h3 style="margin-bottom: 12px; font-size: 16px; color: var(--primary-blue);">Receitas vs. Despesas Realizadas</h3>
            <div style="height: 210px;">
                <canvas id="grafico-financeiro"></canvas>
            </div>
        </div>

        <div class="module-header">
            <div class="search-bar">
                <select id="filtro-tipo-fin" onchange="filtrarTransacoes()" style="padding: 10px; border-radius: 6px; border: 1px solid var(--border-color);">
                    <option value="Todos">Todos os Tipos</option>
                    <option value="Receber">Contas a Receber</option>
                    <option value="Pagar">Contas a Pagar</option>
                    <option value="Receita">Receitas</option>
                    <option value="Despesa">Despesas</option>
                </select>
                <input type="text" id="busca-transacao" placeholder="Pesquisar descrição..." onkeyup="filtrarTransacoes()">
            </div>
            <button class="btn-add" onclick="abrirModalTransacao()">
                <i class="fa-solid fa-plus"></i> Novo Lançamento
            </button>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Descrição</th>
                        <th>Vencimento</th>
                        <th>Valor</th>
                        <th>Estado</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabela-financeiro-body"></tbody>
            </table>
        </div>

        <div id="modal-transacao" class="modal-overlay">
            <div class="modal-box">
                <div class="modal-header">
                    <h3>Novo Lançamento Financeiro</h3>
                    <button class="modal-close" onclick="fecharModalTransacao()">&times;</button>
                </div>
                <form onsubmit="salvarTransacao(event)">
                    <div class="form-grid">
                        <div class="input-group">
                            <label>Tipo de Lançamento *</label>
                            <select id="fin-tipo" required>
                                <option value="Receber">Conta a Receber</option>
                                <option value="Pagar">Conta a Pagar</option>
                                <option value="Receita">Receita Realizada</option>
                                <option value="Despesa">Despesa Realizada</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Valor (R$) *</label>
                            <input type="number" step="0.01" min="0.01" id="fin-valor" required>
                        </div>
                        <div class="input-group form-full">
                            <label>Descrição *</label>
                            <input type="text" id="fin-desc" required placeholder="Ex: Mensalidade, Fornecedor, Serviço">
                        </div>
                        <div class="input-group">
                            <label>Data de Vencimento *</label>
                            <input type="date" id="fin-venc" required>
                        </div>
                        <div class="input-group">
                            <label>Estado *</label>
                            <select id="fin-status">
                                <option value="Pendente">Pendente</option>
                                <option value="Pago">Pago / Recebido</option>
                                <option value="Atrasado">Atrasado</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary" style="margin-top: 15px;">Registar Lançamento</button>
                </form>
            </div>
        </div>
    `;

    renderGraficoFinanceiro(totalReceitasPagas, totalDespesasPagas);
    filtrarTransacoes();
}

function renderGraficoFinanceiro(receitas, despesas) {
    const ctx = document.getElementById('grafico-financeiro');
    if (!ctx) return;

    if (financeiroChartInstance) {
        financeiroChartInstance.destroy();
    }

    financeiroChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Receitas Realizadas', 'Despesas Realizadas'],
            datasets: [{
                label: 'Valor (R$)',
                data: [receitas, despesas],
                backgroundColor: ['#10B981', '#EF4444'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

function filtrarTransacoes() {
    const tipoFiltro = document.getElementById('filtro-tipo-fin')?.value || 'Todos';
    const termo = (document.getElementById('busca-transacao')?.value || '').toLowerCase();
    const lista = getEmpresaData().transacoes;
    const tbody = document.getElementById('tabela-financeiro-body');

    const filtrados = lista.filter(t => {
        const matchTipo = tipoFiltro === 'Todos' || t.tipo === tipoFiltro;
        const matchTexto = t.descricao.toLowerCase().includes(termo);
        return matchTipo && matchTexto;
    });

    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">Nenhum lançamento encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtrados.map(t => {
        const statusBadge = t.status === 'Pago' ? 'badge-success' : (t.status === 'Atrasado' ? 'badge-danger' : 'badge-warning');
        const tipoColor = (t.tipo === 'Receber' || t.tipo === 'Receita') ? 'var(--accent-green)' : '#EF4444';
        const vencFmt = t.vencimento ? t.vencimento.split('-').reverse().join('/') : '-';

        return `
            <tr>
                <td><strong style="color: ${tipoColor};">${t.tipo}</strong></td>
                <td>${t.descricao}</td>
                <td>${vencFmt}</td>
                <td><strong>${formatBRL(t.valor)}</strong></td>
                <td><span class="badge ${statusBadge}">${t.status}</span></td>
                <td class="action-btns">
                    ${t.status !== 'Pago' ? `<button class="btn-icon btn-stock" title="Marcar como Pago/Recebido" onclick="marcarComoPago(${t.id})"><i class="fa-solid fa-check"></i></button>` : ''}
                    <button class="btn-icon btn-delete" title="Excluir" onclick="excluirTransacao(${t.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function abrirModalTransacao() {
    document.getElementById('fin-venc').value = new Date().toISOString().split('T')[0];
    document.getElementById('modal-transacao').style.display = 'flex';
}

function fecharModalTransacao() {
    document.getElementById('modal-transacao').style.display = 'none';
}

function salvarTransacao(event) {
    event.preventDefault();
    const db = getDB();
    const empId = getCurrentEmpresaId();

    const nova = {
        id: Date.now(),
        tipo: document.getElementById('fin-tipo').value,
        valor: parseFloat(document.getElementById('fin-valor').value) || 0,
        descricao: document.getElementById('fin-desc').value,
        vencimento: document.getElementById('fin-venc').value,
        status: document.getElementById('fin-status').value,
        clienteId: null
    };

    db[empId].transacoes.unshift(nova);
    saveDB(db);
    fecharModalTransacao();
    renderFinanceiroModule();
}

function marcarComoPago(id) {
    const db = getDB();
    const empId = getCurrentEmpresaId();
    const t = db[empId].transacoes.find(item => item.id === id);
    if (!t) return;
    t.status = 'Pago';
    saveDB(db);
    renderFinanceiroModule();
}

function excluirTransacao(id) {
    if (!confirm('Deseja excluir este lançamento financeiro?')) return;
    const db = getDB();
    const empId = getCurrentEmpresaId();
    db[empId].transacoes = db[empId].transacoes.filter(item => item.id !== id);
    saveDB(db);
    renderFinanceiroModule();
}
