function renderClientesModule() {
    const container = document.getElementById('module-container');
    container.innerHTML = `
        <div class="module-header">
            <div class="search-bar">
                <input type="text" id="busca-cliente" placeholder="Pesquisar por nome, CPF/CNPJ ou e-mail..." onkeyup="filtrarClientes()">
            </div>
            <button class="btn-add" type="button" onclick="abrirModalCliente()">
                <i class="fa-solid fa-plus"></i> Novo Cliente
            </button>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Nome Completo / Razão Social</th>
                        <th>CPF / CNPJ</th>
                        <th>Contato</th>
                        <th>Limite de Crédito</th>
                        <th>Situação</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabela-clientes-body"></tbody>
            </table>
        </div>

        <div id="modal-cliente" class="modal-overlay">
            <div class="modal-box">
                <div class="modal-header">
                    <h3 id="modal-cliente-titulo">Cadastrar Cliente</h3>
                    <button class="modal-close" type="button" onclick="fecharModalCliente()">&times;</button>
                </div>
                <form id="form-cliente" onsubmit="salvarCliente(event)">
                    <input type="hidden" id="cliente-id">
                    <div class="form-grid">
                        <div class="input-group form-full">
                            <label>Nome Completo / Razão Social *</label>
                            <input type="text" id="cli-nome" required>
                        </div>
                        <div class="input-group">
                            <label>CPF ou CNPJ *</label>
                            <input type="text" id="cli-doc" required placeholder="000.000.000-00">
                        </div>
                        <div class="input-group">
                            <label>Telefone *</label>
                            <input type="text" id="cli-tel" required placeholder="(75) 90000-0000">
                        </div>
                        <div class="input-group">
                            <label>E-mail</label>
                            <input type="email" id="cli-email" placeholder="cliente@email.com">
                        </div>
                        <div class="input-group">
                            <label>Limite de Crédito (R$) *</label>
                            <input type="number" step="0.01" id="cli-limite" required value="1000.00">
                        </div>
                        <div class="input-group">
                            <label>Situação Financeira</label>
                            <select id="cli-situacao">
                                <option value="Regular">Regular</option>
                                <option value="Inadimplente">Inadimplente</option>
                                <option value="Bloqueado">Bloqueado</option>
                            </select>
                        </div>
                        <div class="input-group form-full">
                            <label>Endereço Completo</label>
                            <input type="text" id="cli-endereco">
                        </div>
                        <div class="input-group form-full">
                            <label>Histórico / Observações de Compras</label>
                            <input type="text" id="cli-historico" placeholder="Ex: Cliente recorrente, sem atrasos">
                        </div>
                    </div>
                    <button type="submit" class="btn-primary" style="margin-top: 15px;">Salvar Cadastro</button>
                </form>
            </div>
        </div>
    `;
    filtrarClientes();
}

function filtrarClientes() {
    const termo = (document.getElementById('busca-cliente')?.value || '').toLowerCase();
    const dados = getEmpresaData().clientes || [];
    const tbody = document.getElementById('tabela-clientes-body');
    if (!tbody) return;

    const filtrados = dados.filter(c =>
        (c.nome || '').toLowerCase().includes(termo) ||
        (c.documento || '').toLowerCase().includes(termo) ||
        (c.email || '').toLowerCase().includes(termo)
    );

    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">Nenhum cliente encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtrados.map(c => {
        const badgeClass = c.situacao === 'Regular' ? 'badge-success' : (c.situacao === 'Inadimplente' ? 'badge-danger' : 'badge-warning');
        return `
            <tr>
                <td><strong>${c.nome}</strong><br><small style="color:var(--text-muted)">${c.historico || 'Sem compras recentes'}</small></td>
                <td>${c.documento}</td>
                <td>${c.telefone}<br><small style="color:var(--text-muted)">${c.email}</small></td>
                <td>${formatBRL(c.limite)}</td>
                <td><span class="badge ${badgeClass}">${c.situacao}</span></td>
                <td class="action-btns">
                    <button class="btn-icon btn-edit" type="button" title="Editar" onclick="editarCliente(${c.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon btn-delete" type="button" title="Excluir" onclick="excluirCliente(${c.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function abrirModalCliente() {
    document.getElementById('form-cliente').reset();
    document.getElementById('cliente-id').value = '';
    document.getElementById('modal-cliente-titulo').innerText = 'Cadastrar Novo Cliente';
    document.getElementById('modal-cliente').style.display = 'flex';
}

function fecharModalCliente() {
    document.getElementById('modal-cliente').style.display = 'none';
}

function salvarCliente(event) {
    event.preventDefault();
    const db = getDB();
    const empId = getCurrentEmpresaId();
    const id = document.getElementById('cliente-id').value;

    const clienteObj = {
        id: id ? Number(id) : Date.now(),
        nome: document.getElementById('cli-nome').value.trim(),
        documento: document.getElementById('cli-doc').value.trim(),
        telefone: document.getElementById('cli-tel').value.trim(),
        email: document.getElementById('cli-email').value.trim(),
        limite: parseFloat(document.getElementById('cli-limite').value) || 0,
        situacao: document.getElementById('cli-situacao').value,
        endereco: document.getElementById('cli-endereco').value.trim(),
        historico: document.getElementById('cli-historico').value.trim()
    };

    if (id) {
        const idx = db[empId].clientes.findIndex(c => c.id === Number(id));
        if (idx > -1) db[empId].clientes[idx] = clienteObj;
    } else {
        db[empId].clientes.push(clienteObj);
    }

    saveDB(db);
    fecharModalCliente();
    filtrarClientes();
}

function editarCliente(id) {
    const cli = (getEmpresaData().clientes || []).find(c => c.id === id);
    if (!cli) return;

    document.getElementById('cliente-id').value = cli.id;
    document.getElementById('cli-nome').value = cli.nome;
    document.getElementById('cli-doc').value = cli.documento;
    document.getElementById('cli-tel').value = cli.telefone;
    document.getElementById('cli-email').value = cli.email;
    document.getElementById('cli-limite').value = cli.limite;
    document.getElementById('cli-situacao').value = cli.situacao;
    document.getElementById('cli-endereco').value = cli.endereco;
    document.getElementById('cli-historico').value = cli.historico;

    document.getElementById('modal-cliente-titulo').innerText = 'Editar Cliente';
    document.getElementById('modal-cliente').style.display = 'flex';
}

function excluirCliente(id) {
    if (!confirm('Deseja realmente excluir este cliente?')) return;
    const db = getDB();
    const empId = getCurrentEmpresaId();
    db[empId].clientes = (db[empId].clientes || []).filter(c => c.id !== id);
    saveDB(db);
    filtrarClientes();
}