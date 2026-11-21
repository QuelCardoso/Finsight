(function carregarEstoqueExtraFinSight() {
    const novosProdutos = [
        {
            id: 3,
            codigo: "PRD-003",
            nome: "Teclado Mecanico ABNT2",
            descricao: "Switch azul, retroiluminacao branca",
            categoria: "Perifericos",
            quantidade: 22,
            minimo: 6,
            compra: 165.00,
            venda: 279.00,
            movimentacoes: [
                { data: "04/11/2026", tipo: "Entrada", qtd: 25, obs: "Lote inicial perifericos" },
                { data: "12/11/2026", tipo: "Saida", qtd: 3, obs: "Venda balcao" }
            ]
        },
        {
            id: 4,
            codigo: "PRD-004",
            nome: "Mouse Sem Fio Ergonomico",
            descricao: "1600 DPI, receptor USB 2.4GHz",
            categoria: "Perifericos",
            quantidade: 4,
            minimo: 8,
            compra: 55.00,
            venda: 98.00,
            movimentacoes: [
                { data: "06/11/2026", tipo: "Entrada", qtd: 15, obs: "Reposicao estoque" },
                { data: "16/11/2026", tipo: "Saida", qtd: 11, obs: "Vendas corporativas" }
            ]
        },
        {
            id: 5,
            codigo: "PRD-005",
            nome: "Cadeira Escritorio Ergonomica",
            descricao: "Encosto em tela mesh, ajuste de altura",
            categoria: "Mobiliario",
            quantidade: 9,
            minimo: 4,
            compra: 620.00,
            venda: 940.00,
            movimentacoes: [
                { data: "02/11/2026", tipo: "Entrada", qtd: 12, obs: "Entrega fornecedor" },
                { data: "15/11/2026", tipo: "Saida", qtd: 3, obs: "Pedido studio" }
            ]
        },
        {
            id: 6,
            codigo: "PRD-006",
            nome: "Roteador Wi-Fi 6 Dual Band",
            descricao: "AX1800, 4 antenas alto ganho",
            categoria: "Redes",
            quantidade: 18,
            minimo: 5,
            compra: 290.00,
            venda: 449.00,
            movimentacoes: [
                { data: "08/11/2026", tipo: "Entrada", qtd: 20, obs: "Compra rede" },
                { data: "17/11/2026", tipo: "Saida", qtd: 2, obs: "Instalacao interna" }
            ]
        },
        {
            id: 7,
            codigo: "PRD-007",
            nome: "SSD NVMe 1TB PCIe Gen4",
            descricao: "Leitura ate 7000 MB/s",
            categoria: "Informatica",
            quantidade: 2,
            minimo: 5,
            compra: 380.00,
            venda: 560.00,
            movimentacoes: [
                { data: "03/11/2026", tipo: "Entrada", qtd: 10, obs: "Lote SSD" },
                { data: "18/11/2026", tipo: "Saida", qtd: 8, obs: "Upgrades de maquinas" }
            ]
        }
    ];

    function formatarMoeda(v) {
        return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function atualizarStorage() {
        if (typeof getDB !== "function" || typeof saveDB !== "function") return;
        const db = getDB();
        if (!db[1]) return;

        const atuais = db[1].produtos || [];
        const codigosExistentes = new Set(atuais.map(p => (p.codigo || "").toUpperCase()));
        const nomesExistentes = new Set(atuais.map(p => (p.nome || "").toLowerCase()));

        const faltantes = novosProdutos.filter(
            p => !codigosExistentes.has(p.codigo.toUpperCase()) && !nomesExistentes.has(p.nome.toLowerCase())
        );

        if (faltantes.length > 0) {
            db[1].produtos = [...atuais, ...faltantes];
            saveDB(db);
        }
    }

    function aplicarNaTabela() {
        const titulo = (document.getElementById("current-module-title")?.innerText || "").toLowerCase();
        if (!titulo.includes("estoque")) return;

        const tbody = document.querySelector("#module-container table tbody");
        if (!tbody) return;

        const textoTabela = tbody.innerText || "";
        novosProdutos.forEach(p => {
            if (!textoTabela.includes(p.codigo) && !textoTabela.includes(p.nome)) {
                const baixo = Number(p.quantidade) <= Number(p.minimo);
                const statusBadge = baixo
                    ? `<span class="badge badge-danger">Estoque Baixo (Min: ${p.minimo})</span>`
                    : `<span class="badge badge-success">Normal</span>`;

                const tr = document.createElement("tr");
                tr.setAttribute("data-estoque-extra", "1");
                tr.innerHTML =
                    `<td><strong>${p.codigo}</strong></td>` +
                    `<td><strong>${p.nome}</strong><br><small style="color:var(--text-muted);">${p.descricao}</small></td>` +
                    `<td>${p.categoria}</td>` +
                    `<td><strong>${p.quantidade} un</strong></td>` +
                    `<td>${formatarMoeda(p.venda)}</td>` +
                    `<td>${statusBadge}</td>` +
                    `<td><span style="color:var(--text-muted);font-size:0.85rem;">Ativo</span></td>`;
                tbody.appendChild(tr);
            }
        });
    }

    atualizarStorage();
    setInterval(() => {
        atualizarStorage();
        aplicarNaTabela();
    }, 300);
})();