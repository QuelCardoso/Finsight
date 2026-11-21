function renderEstoqueModule() {
    const container = document.getElementById('module-container');
    container.innerHTML = `
        <div class="module-header">
            <div class="search-bar">
                <input type="text" id="busca-produto" placeholder="Pesquisar por código, nome ou categoria..." onkeyup="filtrarProdutos()">
            </div>
            <button class="btn-add" type="button" onclick="abrirModalProduto()">
                <i class="fa-solid fa-plus"></i> Novo Produto
            </button>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Produto / Descrição</th>
                        <th>Categoria</th>
                        <th>Qtd. Disponível</th>
                        <th>Preço Venda</th>
                        <th>Status Estoque</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabela-produtos-body"></tbody>
            </table>
        </div>

        <div id="modal-produto" class="modal-overlay">
            <div class="modal-box">
                <div class="modal-header">
                    <h3 id="modal-produto-titulo">Cadastrar Produto</h3>
                    <button class="modal-close" type="button" onclick="fecharModalProduto()">&times;</button>
                </div>
                <form id="form-produto" onsubmit="salvarProduto(event)">
                    <input type="hidden" id="prod-id">
                    <div class="form-grid">
                        <div class="input-group">
                            <label>Código do Produto *</label>
                            <input type="text" id="prod-codigo" required placeholder="PRD-001">
                        </div>
                        <div class="input-group">
                            <label>Categoria *</label>
                            <input type="text" id="prod-categoria" required placeholder="Informática">
                        </div>
                        <div class="input-group form-full">
                            <label>Nome do Produto *</label>
                            <input type="text" id="prod-nome" required>
                        </div>
                        <div class="input-group form-full">
                            <label>Descrição</label>
                            <input type="text" id="prod-desc">
                        </div>
                        <div class="input-group">
                            <label>Quantidade Inicial *</label>
                            <input type="number" id="prod-qtd" required min="0" value="10">
                        </div>
                        <div class="input-group">
                            <label>Estoque Mínimo *</label>
                            <input type="number" id="prod-min" required min="1" value="5">
                        </div>
                        <div class="input-group">
                            <label>Preço de Compra (R$) *</label>
                            <input type="number" step="0.01" id="prod-compra" required>
                        </div>
                        <div class="input-group">
                            <label>Preço de Venda (R$) *</label>
                            <input type="number" step="0.01" id="prod-venda" required>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary" style="margin-top: 15px;">Salvar Produto</button>
                </form>
            </div>
        </div>

        <div id="modal-movimentacao" class="modal-overlay">
            <div class="modal-box">
                <div class="modal-header">
                    <h3 id="mov-titulo">Movimentar Estoque</h3>
                    <button class="modal-close" type="button" onclick="fecharModalMov()">&times;</button>
                </div>
                <form onsubmit="registrarMovimentacao(event)">
                    <input type="hidden" id="mov-prod-id">
                    <div class="input-group">
                        <label>Tipo de Movimentação</label>
                        <select id="mov-tipo">
                            <option value="entrada">Entrada (+ Adicionar ao Estoque)</option>
                            <option value="saida">Saída (- Baixa de Estoque)</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Quantidade *</label>
                        <input type="number" id="mov-qtd" min="1" required value="1">
                    </div>
                    <div class="input-group">
                        <label>Motivo / Observação *</label>
                        <input type="text" id="mov-motivo" required placeholder="Ex: Compra Fornecedor / Venda Balcão">
                    </div>
                    <button type="submit" class="btn-primary">Confirmar Movimentação</button>
                </form>
                <div style="margin-top: 20px;">
                    <h4 style="font-size: 13px; color: var(--primary-blue); margin-bottom: 8px;">Histórico Recente:</h4>
                    <ul id="mov-historico-lista" style="font-size: 12px; color: var(--text-muted); padding-left: 18px;"></ul>
                </div>
            </div>
        </div>
    `;
    filtrarProdutos();
}

function filtrarProdutos() {
    const termo = (document.getElementById('busca-produto')?.value || '').toLowerCase();
    const produtos = getEmpresaData().produtos || [];
    const tbody = document.getElementById('tabela-produtos-body');
    if (!tbody) return;

    const filtrados = produtos.filter(p =>
        (p.codigo || '').toLowerCase().includes(termo) ||
        (p.nome || '').toLowerCase().includes(termo) ||
        (p.categoria || '').toLowerCase().includes(termo)
    );

    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">Nenhum produto cadastrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtrados.map(p => {
        const estoqueBaixo = p.quantidade <= p.minimo;
        const badge = estoqueBaixo
            ? `<span class="badge badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> Estoque Baixo (Mín: ${p.minimo})</span>`
            : `<span class="badge badge-success">Normal</span>`;

        return `
            <tr>
                <td><strong>${p.codigo}</strong></td>
                <td><strong>${p.nome}</strong><br><small style="color:var(--text-muted)">${p.descricao}</small></td>
                <td>${p.categoria}</td>
                <td><strong>${p.quantidade} un</strong></td>
                <td>${formatBRL(p.venda)}</td>
                <td>${badge}</td>
                <td class="action-btns">
                    <button class="btn-icon btn-stock" type="button" title="Entrada / Saída" onclick="abrirModalMov(${p.id})"><i class="fa-solid fa-right-left"></i></button>
                    <button class="btn-icon btn-edit" type="button" title="Editar" onclick="editarProduto(${p.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon btn-delete" type="button" title="Excluir" onclick="excluirProduto(${p.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function abrirModalProduto() {
    document.getElementById('form-produto').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('modal-produto-titulo').innerText = 'Cadastrar Produto';
    document.getElementById('modal-produto').style.display = 'flex';
}

function fecharModalProduto() {
    document.getElementById('modal-produto').style.display = 'none';
}

function salvarProduto(event) {
    event.preventDefault();
    const db = getDB();
    const empId = getCurrentEmpresaId();
    const id = document.getElementById('prod-id').value;

    const existente = id ? db[empId].produtos.find(p => p.id === Number(id)) : null;

    const prodObj = {
        id: id ? Number(id) : Date.now(),
        codigo: document.getElementById('prod-codigo').value.trim(),
        categoria: document.getElementById('prod-categoria').value.trim(),
        nome: document.getElementById('prod-nome').value.trim(),
        descricao: document.getElementById('prod-desc').value.trim(),
        quantidade: parseInt(document.getElementById('prod-qtd').value, 10) || 0,
        minimo: parseInt(document.getElementById('prod-min').value, 10) || 1,
        compra: parseFloat(document.getElementById('prod-compra').value) || 0,
        venda: parseFloat(document.getElementById('prod-venda').value) || 0,
        movimentacoes: existente ? existente.movimentacoes : [`+${document.getElementById('prod-qtd').value} Cadastro Inicial`]
    };

    if (id) {
        const idx = db[empId].produtos.findIndex(p => p.id === Number(id));
        if (idx > -1) db[empId].produtos[idx] = prodObj;
    } else {
        db[empId].produtos.push(prodObj);
    }

    saveDB(db);
    fecharModalProduto();
    filtrarProdutos();
}

function editarProduto(id) {
    const p = (getEmpresaData().produtos || []).find(item => item.id === id);
    if (!p) return;

    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-codigo').value = p.codigo;
    document.getElementById('prod-categoria').value = p.categoria;
    document.getElementById('prod-nome').value = p.nome;
    document.getElementById('prod-desc').value = p.descricao;
    document.getElementById('prod-qtd').value = p.quantidade;
    document.getElementById('prod-min').value = p.minimo;
    document.getElementById('prod-compra').value = p.compra;
    document.getElementById('prod-venda').value = p.venda;

    document.getElementById('modal-produto-titulo').innerText = 'Editar Produto';
    document.getElementById('modal-produto').style.display = 'flex';
}

function excluirProduto(id) {
    if (!confirm('Deseja excluir este produto do estoque?')) return;
    const db = getDB();
    const empId = getCurrentEmpresaId();
    db[empId].produtos = (db[empId].produtos || []).filter(p => p.id !== id);
    saveDB(db);
    filtrarProdutos();
}

function abrirModalMov(id) {
    const p = (getEmpresaData().produtos || []).find(item => item.id === id);
    if (!p) return;

    document.getElementById('mov-prod-id').value = p.id;
    document.getElementById('mov-titulo').innerText = `Estoque: ${p.nome} (Atual: ${p.quantidade})`;
    const lista = document.getElementById('mov-historico-lista');
    lista.innerHTML = (p.movimentacoes || []).map(m => `<li>${m}</li>`).join('');
    document.getElementById('modal-movimentacao').style.display = 'flex';
}

function fecharModalMov() {
    document.getElementById('modal-movimentacao').style.display = 'none';
}

function registrarMovimentacao(event) {
    event.preventDefault();
    const db = getDB();
    const empId = getCurrentEmpresaId();
    const id = Number(document.getElementById('mov-prod-id').value);
    const tipo = document.getElementById('mov-tipo').value;
    const qtd = parseInt(document.getElementById('mov-qtd').value, 10);
    const motivo = document.getElementById('mov-motivo').value.trim();

    const prod = db[empId].produtos.find(p => p.id === id);
    if (!prod) return;

    if (tipo === 'saida' && qtd > prod.quantidade) {
        alert('Quantidade de saída maior que o estoque disponível!');
        return;
    }

    if (tipo === 'entrada') {
        prod.quantidade += qtd;
        prod.movimentacoes.unshift(`+${qtd} Entrada (${motivo})`);
    } else {
        prod.quantidade -= qtd;
        prod.movimentacoes.unshift(`-${qtd} Saída (${motivo})`);
    }

    saveDB(db);
    fecharModalMov();
    filtrarProdutos();
}