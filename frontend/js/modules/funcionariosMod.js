function renderFuncionariosModule() {
    const container = document.getElementById('module-container');
    container.innerHTML = `
        <div class="module-header">
            <div class="search-bar">
                <input type="text" id="busca-funcionario" placeholder="Pesquisar por nome, cargo, setor ou e-mail..." onkeyup="filtrarFuncionarios()">
            </div>
            <button class="btn-add" onclick="abrirModalFuncionario()">
                <i class="fa-solid fa-user-plus"></i> Novo Funcionário
            </button>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Funcionário</th>
                        <th>Cargo / Setor</th>
                        <th>Contato</th>
                        <th>Contratação</th>
                        <th>Nível de Acesso</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabela-funcionarios-body"></tbody>
            </table>
        </div>

        <div id="modal-funcionario" class="modal-overlay">
            <div class="modal-box">
                <div class="modal-header">
                    <h3 id="modal-func-titulo">Cadastrar Funcionário</h3>
                    <button class="modal-close" type="button" onclick="fecharModalFuncionario()">&times;</button>
                </div>
                <form id="form-funcionario" onsubmit="salvarFuncionario(event)">
                    <input type="hidden" id="func-id">
                    <div class="form-grid">
                        <div class="input-group form-full">
                            <label>Nome Completo *</label>
                            <input type="text" id="func-nome" required>
                        </div>
                        <div class="input-group">
                            <label>Cargo *</label>
                            <input type="text" id="func-cargo" required placeholder="Ex: Analista Administrativo">
                        </div>
                        <div class="input-group">
                            <label>Setor *</label>
                            <input type="text" id="func-setor" required placeholder="Ex: Financeiro, TI, Vendas">
                        </div>
                        <div class="input-group">
                            <label>Telefone *</label>
                            <input type="text" id="func-tel" required placeholder="(75) 90000-0000">
                        </div>
                        <div class="input-group">
                            <label>E-mail Corporativo *</label>
                            <input type="email" id="func-email" required placeholder="nome@empresa.com">
                        </div>
                        <div class="input-group">
                            <label>Data de Contratação *</label>
                            <input type="date" id="func-contratacao" required>
                        </div>
                        <div class="input-group">
                            <label>Nível de Acesso *</label>
                            <select id="func-nivel">
                                <option value="Operador">Operador</option>
                                <option value="Gerente">Gerente</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Utilizador de Acesso *</label>
                            <input type="text" id="func-usuario" required placeholder="ex: msilva">
                        </div>
                        <div class="input-group">
                            <label>Senha de Acesso (Simulada)</label>
                            <input type="password" id="func-senha" placeholder="••••••••">
                        </div>
                    </div>
                    <button type="submit" class="btn-primary" style="margin-top: 15px;">Salvar Funcionário</button>
                </form>
            </div>
        </div>
    `;
    filtrarFuncionarios();
}

function filtrarFuncionarios() {
    const termo = (document.getElementById('busca-funcionario')?.value || '').toLowerCase();
    const lista = getEmpresaData().funcionarios || [];
    const tbody = document.getElementById('tabela-funcionarios-body');
    if (!tbody) return;

    const filtrados = lista.filter(f =>
        (f.nome || '').toLowerCase().includes(termo) ||
        (f.cargo || '').toLowerCase().includes(termo) ||
        (f.setor || '').toLowerCase().includes(termo) ||
        (f.email || '').toLowerCase().includes(termo)
    );

    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">Nenhum funcionário encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtrados.map(f => {
        const badgeClass = f.nivel === 'Admin' ? 'badge-danger' : (f.nivel === 'Gerente' ? 'badge-warning' : 'badge-success');
        const dataFmt = f.contratacao ? f.contratacao.split('-').reverse().join('/') : '-';
        return `
            <tr>
                <td><strong>${f.nome}</strong><br><small style="color:var(--text-muted)">Utilizador: ${f.usuario}</small></td>
                <td><strong>${f.cargo}</strong><br><small style="color:var(--text-muted)">${f.setor}</small></td>
                <td>${f.telefone}<br><small style="color:var(--text-muted)">${f.email}</small></td>
                <td>${dataFmt}</td>
                <td><span class="badge ${badgeClass}">${f.nivel}</span></td>
                <td class="action-btns">
                    <button class="btn-icon btn-edit" type="button" title="Editar" onclick="editarFuncionario(${f.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon btn-delete" type="button" title="Excluir" onclick="excluirFuncionario(${f.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function abrirModalFuncionario() {
    document.getElementById('form-funcionario').reset();
    document.getElementById('func-id').value = '';
    document.getElementById('func-contratacao').value = new Date().toISOString().split('T')[0];
    document.getElementById('modal-func-titulo').innerText = 'Cadastrar Funcionário';
    document.getElementById('modal-funcionario').style.display = 'flex';
}

function fecharModalFuncionario() {
    document.getElementById('modal-funcionario').style.display = 'none';
}

function salvarFuncionario(event) {
    event.preventDefault();
    const db = getDB();
    const empId = getCurrentEmpresaId();
    if (!db[empId]) db[empId] = { clientes: [], produtos: [], funcionarios: [], transacoes: [] };
    if (!Array.isArray(db[empId].funcionarios)) db[empId].funcionarios = [];

    const id = document.getElementById('func-id').value;

    const funcObj = {
        id: id ? Number(id) : Date.now(),
        nome: document.getElementById('func-nome').value.trim(),
        cargo: document.getElementById('func-cargo').value.trim(),
        setor: document.getElementById('func-setor').value.trim(),
        telefone: document.getElementById('func-tel').value.trim(),
        email: document.getElementById('func-email').value.trim(),
        contratacao: document.getElementById('func-contratacao').value,
        nivel: document.getElementById('func-nivel').value,
        usuario: document.getElementById('func-usuario').value.trim(),
        ativo: true
    };

    if (id) {
        const idx = db[empId].funcionarios.findIndex(f => f.id === Number(id));
        if (idx > -1) db[empId].funcionarios[idx] = funcObj;
    } else {
        db[empId].funcionarios.push(funcObj);
    }

    saveDB(db);
    fecharModalFuncionario();
    filtrarFuncionarios();
}

function editarFuncionario(id) {
    const f = (getEmpresaData().funcionarios || []).find(item => item.id === id);
    if (!f) return;

    document.getElementById('func-id').value = f.id;
    document.getElementById('func-nome').value = f.nome;
    document.getElementById('func-cargo').value = f.cargo;
    document.getElementById('func-setor').value = f.setor;
    document.getElementById('func-tel').value = f.telefone;
    document.getElementById('func-email').value = f.email;
    document.getElementById('func-contratacao').value = f.contratacao;
    document.getElementById('func-nivel').value = f.nivel;
    document.getElementById('func-usuario').value = f.usuario;

    document.getElementById('modal-func-titulo').innerText = 'Editar Funcionário';
    document.getElementById('modal-funcionario').style.display = 'flex';
}

function excluirFuncionario(id) {
    if (!confirm('Deseja realmente remover este funcionário?')) return;
    const db = getDB();
    const empId = getCurrentEmpresaId();
    db[empId].funcionarios = (db[empId].funcionarios || []).filter(f => f.id !== id);
    saveDB(db);
    filtrarFuncionarios();
}
