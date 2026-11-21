let dashboardChartInstance = null;

function handleLogin(event) {
    event.preventDefault();
    const empresaSelect = document.getElementById('empresa-select');
    const empresaId = empresaSelect.value;
    const empresaNome = empresaSelect.options[empresaSelect.selectedIndex].text;

    localStorage.setItem('finsight_empresa_ativa', empresaId);

    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'flex';
    document.getElementById('empresa-logada-badge').innerText = empresaNome;

    switchModule('dashboard');
}

function handleLogout() {
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
}

function switchModule(moduleName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        const onclickAttr = item.getAttribute('onclick') || '';
        if (onclickAttr.includes(`'${moduleName}'`)) {
            item.classList.add('active');
        }
    });

    const titleEl = document.getElementById('current-module-title');
    const container = document.getElementById('module-container');

    if (moduleName === 'dashboard') {
        titleEl.innerText = 'Dashboard Geral';
        const dados = getEmpresaData();
        const totalClientes = (dados.clientes || []).length;
        const totalProdutos = (dados.produtos || []).reduce((acc, p) => acc + p.quantidade, 0);
        const alertasEstoque = (dados.produtos || []).filter(p => p.quantidade <= p.minimo).length;
        const atrasados = (dados.transacoes || []).filter(t => t.tipo === 'Receber' && t.status === 'Atrasado');
        const inadimplentes = atrasados.length;

        const contasPagar = (dados.transacoes || [])
            .filter(t => t.tipo === 'Pagar' && t.status !== 'Pago')
            .reduce((acc, t) => acc + t.valor, 0);

        const contasReceber = (dados.transacoes || [])
            .filter(t => t.tipo === 'Receber' && t.status !== 'Pago')
            .reduce((acc, t) => acc + t.valor, 0);

        const receitasRealizadas = (dados.transacoes || [])
            .filter(t => t.tipo === 'Receita' || (t.tipo === 'Receber' && t.status === 'Pago'))
            .reduce((acc, t) => acc + t.valor, 0);

        container.innerHTML = `
            <div class="cards-grid">
                <div class="card-metric">
                    <h4>Total de Clientes</h4>
                    <div class="value">${totalClientes}</div>
                </div>
                <div class="card-metric" style="border-left-color: var(--accent-teal);">
                    <h4>Itens em Estoque</h4>
                    <div class="value">${totalProdutos}</div>
                </div>
                <div class="card-metric" style="border-left-color: #F59E0B;">
                    <h4>Contas a Pagar</h4>
                    <div class="value">${formatBRL(contasPagar)}</div>
                </div>
                <div class="card-metric" style="border-left-color: var(--accent-green);">
                    <h4>Contas a Receber</h4>
                    <div class="value">${formatBRL(contasReceber)}</div>
                </div>
            </div>
            <div class="cards-grid">
                <div class="card-metric" style="border-left-color: #EF4444;">
                    <h4>Alertas de Estoque Baixo</h4>
                    <div class="value">${alertasEstoque}</div>
                </div>
                <div class="card-metric" style="border-left-color: #DC2626;">
                    <h4>Pendências em Atraso</h4>
                    <div class="value">${inadimplentes}</div>
                </div>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); max-height: 300px;">
                <h3 style="margin-bottom: 12px; font-size: 16px; color: var(--primary-blue);">Faturamento Mensal e Previsto</h3>
                <div style="height: 210px;">
                    <canvas id="grafico-dashboard"></canvas>
                </div>
            </div>
        `;

        const ctx = document.getElementById('grafico-dashboard');
        if (ctx && typeof Chart !== 'undefined') {
            if (dashboardChartInstance) dashboardChartInstance.destroy();
            dashboardChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Ago', 'Set', 'Out', 'Nov (Realizado)', 'A Receber'],
                    datasets: [{
                        label: 'Faturamento (R$)',
                        data: [receitasRealizadas * 0.72, receitasRealizadas * 0.85, receitasRealizadas * 0.91, receitasRealizadas, contasReceber],
                        borderColor: '#0066FF',
                        backgroundColor: 'rgba(0, 180, 216, 0.15)',
                        fill: true,
                        tension: 0.35
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    } else if (moduleName === 'clientes') {
        titleEl.innerText = 'Gestão de Clientes';
        renderClientesModule();
    } else if (moduleName === 'funcionarios') {
        titleEl.innerText = 'Gestão de Funcionários';
        renderFuncionariosModule();
    } else if (moduleName === 'estoque') {
        titleEl.innerText = 'Controle de Estoque';
        renderEstoqueModule();
    } else if (moduleName === 'financeiro') {
        titleEl.innerText = 'Controle Financeiro';
        renderFinanceiroModule();
    } else if (moduleName === 'inadimplencia') {
        titleEl.innerText = 'Controle de Inadimplência';
        if (typeof renderInadimplenciaModule === 'function') {
            renderInadimplenciaModule();
        } else {
            container.innerHTML = `<div style="background:white;padding:24px;border-radius:8px;">Erro ao carregar o módulo de Inadimplência. Verifica se <code>js/modules/inadimplenciaMod.js</code> existe.</div>`;
        }
    }
}