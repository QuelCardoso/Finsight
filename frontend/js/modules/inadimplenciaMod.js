function calcularDiasAtraso(dataVencimento) {
    if (!dataVencimento) return 0;
    const partes = dataVencimento.split('-');
    if (partes.length !== 3) return 0;
    const venc = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    venc.setHours(0, 0, 0, 0);
    const diffMs = hoje - venc;
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
}

function renderInadimplenciaModule() {
    const container = document.getElementById('module-container');
    const dados = getEmpresaData();

    const atrasados = (dados.transacoes || []).filter(t => t.tipo === 'Receber' && t.status === 'Atrasado');
    const totalEmAtraso = atrasados.reduce((acc, t) => acc + t.valor, 0);
    const clientesInadimplentes = (dados.clientes || []).filter(c => c.situacao === 'Inadimplente');

    container.innerHTML = `
        <div class="cards-grid">
            <div class="card-metric" style="border-left-color: #EF4444;">
                <h4>Total em Atraso</h4>
                <div class="value" style="color: #EF4444;">${formatBRL(totalEmAtraso)}</div>
            </div>
            <div class="card-metric" style="border-left-color: #F59E0B;">
                <h4>Títulos Vencidos</h4>
                <div class="value">${atrasados.length}</div>
            </div>
            <div class="card-metric" style="border-left-color: #DC2626;">
                <h4>Clientes Inadimplentes</h4>
                <div class="value">${clientesInadimplentes.length}</div>
            </div>
        </div>

        <div class="module-header">
            <div class="search-bar">
                <input type="text" id="busca-inadimplencia" placeholder="Pesquisar por descrição ou cliente..." onkeyup="filtrarInadimplencia()">
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Referência / Cliente</th>
                        <th>Vencimento</th>
                        <th>Dias de Atraso</th>
                        <th>Valor em Atraso</th>
                        <th>Cobranças</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabela-inadimplencia-body"></tbody>
            </table>
        </div>

        <div id="modal-cobranca" class="modal-overlay">
            <div class="modal-box">
                <div class="modal-header">
                    <h3 id="cobranca-titulo">Registar Cobrança</h3>
                    <button class="modal-close" type="button" onclick="fecharModalCobranca()">&times;</button>
                </div>
                <form onsubmit="salvarCobranca(event)">
                    <input type="hidden" id="cobranca-transacao-id">
                    <div class="input-group">
                        <label>Canal / Observação da Cobrança *</label>
                        <input type="text" id="cobranca-texto" required placeholder="Ex: Contacto por WhatsApp em 19/11 - Promessa de pagamento">
                    </div>
                    <button type="submit" class="btn-primary">Adicionar ao Histórico</button>
                </form>
                <div style="margin-top: 20px;">
                    <h4 style="font-size: 13px; color: var(--primary-blue); margin-bottom: 8px;">Histórico de Cobranças:</h4>
                    <ul id="cobranca-historico-lista" style="font-size: 12px; color: var(--text-muted); padding-left: 18px;"></ul>
                </div>
            </div>
        </div>
    `;

    filtrarInadimplencia();
}

function filtrarInadimplencia() {
    const termo = (document.getElementById('busca-inadimplencia')?.value || '').toLowerCase();
    const dados = getEmpresaData();
    const tbody = document.getElementById('tabela-inadimplencia-body');
    if (!tbody) return;

    const atrasados = (dados.transacoes || []).filter(t => t.tipo === 'Receber' && t.status === 'Atrasado');

    const filtrados = atrasados.filter(t => {
        const cliente = (dados.clientes || []).find(c => c.id === t.clienteId);
        const nomeCli = cliente ? cliente.nome.toLowerCase() : '';
        return (t.descricao || '').toLowerCase().includes(termo) || nomeCli.includes(termo);
    });

    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">Nenhuma pendência em atraso encontrada para esta empresa.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtrados.map(t => {
        const cliente = (dados.clientes || []).find(c => c.id === t.clienteId);
        const dias = calcularDiasAtraso(t.vencimento);
        const vencFmt = t.vencimento ? t.vencimento.split('-').reverse().join('/') : '-';
        const qtdCob = (t.cobrancas || []).length;

        return `
            <tr>
                <td>
                    <strong>${t.descricao}</strong>
                    ${cliente ? `<br><small style="color:var(--text-muted)">Cliente: ${cliente.nome} (${cliente.telefone})</small>` : ''}
                </td>
                <td>${vencFmt}</td>
                <td><span class="badge badge-danger">${dias} ${dias === 1 ? 'dia' : 'dias'}</span></td>
                <td><strong>${formatBRL(t.valor)}</strong></td>
                <td><span class="badge badge-warning">${qtdCob} ${qtdCob === 1 ? 'registo' : 'registos'}</span></td>
                <td class="action-btns">
                    <button class="btn-icon btn-edit" type="button" title="Registar Cobrança" onclick="abrirModalCobranca(${t.id})"><i class="fa-solid fa-phone-volume"></i></button>
                    <button class="btn-icon btn-stock" type="button" title="Marcar como Pago" onclick="regularizarDivida(${t.id})"><i class="fa-solid fa-check"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function abrirModalCobranca(transacaoId) {
    const t = (getEmpresaData().transacoes || []).find(item => item.id === transacaoId);
    if (!t) return;

    document.getElementById('cobranca-transacao-id').value = t.id;
    document.getElementById('cobranca-titulo').innerText = `Cobrança: ${t.descricao}`;
    document.getElementById('cobranca-texto').value = '';

    const lista = document.getElementById('cobranca-historico-lista');
    const itens = t.cobrancas || [];
    lista.innerHTML = itens.length
        ? itens.map(c => `<li>${c}</li>`).join('')
        : '<li>Nenhuma cobrança registada ainda.</li>';

    document.getElementById('modal-cobranca').style.display = 'flex';
}

function fecharModalCobranca() {
    document.getElementById('modal-cobranca').style.display = 'none';
}

function salvarCobranca(event) {
    event.preventDefault();
    const db = getDB();
    const empId = getCurrentEmpresaId();
    const id = Number(document.getElementById('cobranca-transacao-id').value);
    const texto = document.getElementById('cobranca-texto').value.trim();

    const t = (db[empId].transacoes || []).find(item => item.id === id);
    if (!t) return;

    if (!Array.isArray(t.cobrancas)) t.cobrancas = [];
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    t.cobrancas.unshift(`${dataHoje} — ${texto}`);

    saveDB(db);
    abrirModalCobranca(id);
    filtrarInadimplencia();
}

function regularizarDivida(transacaoId) {
    if (!confirm('Confirmar o pagamento e regularização desta pendência?')) return;
    const db = getDB();
    const empId = getCurrentEmpresaId();
    const t = (db[empId].transacoes || []).find(item => item.id === transacaoId);
    if (!t) return;

    t.status = 'Pago';
    saveDB(db);
    renderInadimplenciaModule();
}