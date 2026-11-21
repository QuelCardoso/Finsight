let dashboardChartInstance = null;

function configurarMenuPorPerfil(ehCliente) {
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick') || '';
        const ehSair = onclickAttr.includes('handleLogout');
        const ehPortal = onclickAttr.includes("'portal'");
        if (ehCliente) {
            item.style.display = (ehPortal || ehSair) ? 'flex' : 'none';
        } else {
            item.style.display = 'flex';
        }
    });
}

async function handleLogin(event) {
    event.preventDefault();
    const empresaSelect = document.getElementById('empresa-select');
    const empresaId = Number(empresaSelect.value);
    const empresaNome = empresaSelect.options[empresaSelect.selectedIndex].text;
    const usuarioDigitado = (document.getElementById('usuario')?.value || '').trim().toLowerCase();
    const senhaDigitada = document.getElementById('senha')?.value || '';

    localStorage.setItem(EMPRESA_KEY, String(empresaId));
    await syncEmpresaFromApi(empresaId);

    const dados = getEmpresaData();
    const clienteMatch = (dados.clientes || []).find(c => {
        const userMatch = (c.usuario && c.usuario.toLowerCase() === usuarioDigitado) ||
                        (c.email && c.email.toLowerCase() === usuarioDigitado);
        const senhaEsperada = c.senha || 'Cliente@2026';
        return userMatch && senhaDigitada === senhaEsperada;
    });

    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'flex';

    if (clienteMatch) {
        setClienteAutenticado(clienteMatch);
        configurarMenuPorPerfil(true);
        document.getElementById('empresa-logada-badge').innerText = `Cliente: ${clienteMatch.nome}`;
        switchModule('portal');
        return;
    }

    limparSessaoCliente();
    configurarMenuPorPerfil(false);
    document.getElementById('empresa-logada-badge').innerText = empresaNome;
    switchModule('dashboard');
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
    } else if (moduleName === 'portal') {
        titleEl.innerText = 'Minha Área — Histórico e Pagamentos';
        if (typeof renderPortalClienteModule === 'function') {
            renderPortalClienteModule();
        }
    } else if (moduleName === 'inadimplencia') {
        titleEl.innerText = 'Controle de Inadimplência';
        if (typeof renderInadimplenciaModule === 'function') {
            renderInadimplenciaModule();
        } else {
            container.innerHTML = `<div style="background:white;padding:24px;border-radius:8px;">Erro ao carregar o módulo de Inadimplência. Verifica se <code>js/modules/inadimplenciaMod.js</code> existe.</div>`;
        }
    }
}

function handleLogout() {
    const eraCliente = sessionStorage.getItem('finsight_modo_cliente_exclusivo') === '1';
    if (typeof limparSessaoCliente === 'function') {
        limparSessaoCliente();
    } else {
        sessionStorage.removeItem('finsight_cliente_sessao');
    }
    sessionStorage.removeItem('finsight_modo_cliente_exclusivo');
    if (typeof configurarMenuPorPerfil === 'function') {
        configurarMenuPorPerfil(false);
    }
    if (eraCliente) {
        window.location.href = 'login-cliente.html';
        return;
    }
    const appEl = document.getElementById('app-screen');
    const authEl = document.getElementById('auth-screen');
    if (appEl) appEl.style.display = 'none';
    if (authEl) authEl.style.display = 'flex';
}

function ativarSessaoClienteSeExistir() {
    if (sessionStorage.getItem('finsight_modo_cliente_exclusivo') !== '1') return false;
    const cli = typeof getClienteAutenticado === 'function' ? getClienteAutenticado() : null;
    if (!cli) return false;

    const authEl = document.getElementById('auth-screen');
    const appEl = document.getElementById('app-screen');
    if (authEl) authEl.style.display = 'none';
    if (appEl) appEl.style.display = 'flex';
    if (typeof configurarMenuPorPerfil === 'function') {
        configurarMenuPorPerfil(true);
    }
    const badge = document.getElementById('empresa-logada-badge');
    if (badge) badge.innerText = `Cliente: ${cli.nome}`;
    switchModule('portal');
    return true;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(ativarSessaoClienteSeExistir, 50);
    });
} else {
    setTimeout(ativarSessaoClienteSeExistir, 50);
}

function aplicarModoClienteExclusivoSeAtivo() {
    if (sessionStorage.getItem('finsight_modo_cliente_exclusivo') !== '1') return false;
    const cli = typeof getClienteAutenticado === 'function' ? getClienteAutenticado() : null;
    if (!cli) return false;

    const authEl = document.getElementById('auth-screen');
    const appEl = document.getElementById('app-screen');
    if (authEl) authEl.style.setProperty('display', 'none', 'important');
    if (appEl) appEl.style.setProperty('display', 'flex', 'important');

    if (typeof configurarMenuPorPerfil === 'function') {
        configurarMenuPorPerfil(true);
    }

    const badge = document.getElementById('empresa-logada-badge');
    if (badge) badge.innerText = `Cliente: ${cli.nome}`;

    if (typeof renderPortalClienteModule === 'function') {
        const titleEl = document.getElementById('current-module-title');
        if (titleEl) titleEl.innerText = 'Minha Área — Histórico e Pagamentos';
        renderPortalClienteModule();
    } else if (typeof switchModule === 'function') {
        switchModule('portal');
    }
    return true;
}

setInterval(() => {
    if (sessionStorage.getItem('finsight_modo_cliente_exclusivo') === '1') {
        aplicarModoClienteExclusivoSeAtivo();
    }
}, 250);