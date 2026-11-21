(function carregarEquipeFinSight() {
    const novoNome = "Eduardo Henrique Martins";
    const novoUsuario = "emartins";
    const novoEmail = "eduardo.martins@finsight.com";

    const novos = [
        {
            nome: "Marcos Vinicius Souza",
            usuario: "msouza",
            cargo: "Operador de Caixa",
            setor: "Frente de Caixa",
            telefone: "(75) 98765-4302",
            email: "marcos.souza@finsight.com",
            contratacao: "01/09/2025",
            nivel: "Operador de Caixa"
        },
        {
            nome: "Camila Rodrigues Cruz",
            usuario: "ccruz",
            cargo: "Vendedor",
            setor: "Comercial / Vendas",
            telefone: "(75) 99654-3203",
            email: "camila.cruz@finsight.com",
            contratacao: "18/03/2026",
            nivel: "Vendedor"
        },
        {
            nome: "Thiago Henrique Dias",
            usuario: "tdias",
            cargo: "Vendedor",
            setor: "Comercial / Vendas",
            telefone: "(75) 98222-1104",
            email: "thiago.dias@finsight.com",
            contratacao: "05/06/2026",
            nivel: "Vendedor"
        },
        {
            nome: "Juliana Pereira Gomes",
            usuario: "jgomes",
            cargo: "Gerente de Operacoes",
            setor: "Gestao / Operacoes",
            telefone: "(75) 99310-7701",
            email: "juliana.gomes@finsight.com",
            contratacao: "12/05/2024",
            nivel: "Gerente"
        },
        {
            nome: "Lucas Gabriel Nogueira",
            usuario: "lnogueira",
            cargo: "Analista Administrativo",
            setor: "Administrativo",
            telefone: "(75) 99500-8807",
            email: "lucas.nogueira@finsight.com",
            contratacao: "20/02/2026",
            nivel: "Analista"
        }
    ];

    function atualizarStorage() {
        if (typeof getDB !== "function" || typeof saveDB !== "function") return;
        const db = getDB();
        if (!db[1]) return;

        let lista = (db[1].funcionarios || []).map(f => {
            if ((f.nome || "").toLowerCase().includes("carlos eduardo")) {
                return { ...f, nome: novoNome, usuario: novoUsuario, email: novoEmail };
            }
            return f;
        });

        const existentes = new Set(lista.map(f => (f.usuario || "").toLowerCase()));
        novos.forEach((n, idx) => {
            if (!existentes.has(n.usuario.toLowerCase())) {
                const partesData = n.contratacao.split("/");
                const isoData = partesData.length === 3 ? `${partesData[2]}-${partesData[1]}-${partesData[0]}` : "2026-01-01";
                lista.push({
                    id: 10 + idx,
                    nome: n.nome,
                    cargo: n.cargo,
                    setor: n.setor,
                    telefone: n.telefone,
                    email: n.email,
                    contratacao: isoData,
                    usuario: n.usuario,
                    nivel: n.nivel,
                    ativo: true
                });
            }
        });

        db[1].funcionarios = lista;
        saveDB(db);
    }

    function aplicarNaTela() {
        const titulo = (document.getElementById("current-module-title")?.innerText || "").toLowerCase();
        if (!titulo.includes("funcion")) return;

        const tbody = document.querySelector("#module-container table tbody");
        if (!tbody) return;

        tbody.querySelectorAll("td").forEach(td => {
            if (td.innerText && td.innerText.includes("Carlos Eduardo Almeida")) {
                td.innerHTML = td.innerHTML
                    .replace(/Carlos Eduardo Almeida/g, novoNome)
                    .replace(/calmeida/g, novoUsuario);
            }
        });

        const textoAtual = tbody.innerText || "";
        novos.forEach(n => {
            if (!textoAtual.includes(n.nome) && !textoAtual.includes(n.usuario)) {
                const tr = document.createElement("tr");
                tr.setAttribute("data-equipe-extra", "1");
                tr.innerHTML =
                    `<td><strong>${n.nome}</strong><br><small style="color:var(--text-muted);">Utilizador: ${n.usuario}</small></td>` +
                    `<td><strong>${n.cargo}</strong><br><small style="color:var(--text-muted);">${n.setor}</small></td>` +
                    `<td>${n.telefone}<br><small style="color:var(--text-muted);">${n.email}</small></td>` +
                    `<td>${n.contratacao}</td>` +
                    `<td><span class="badge badge-success">${n.nivel}</span></td>` +
                    `<td><span style="color:var(--text-muted);font-size:0.85rem;">Ativo</span></td>`;
                tbody.appendChild(tr);
            }
        });
    }

    atualizarStorage();
    setInterval(() => {
        atualizarStorage();
        aplicarNaTela();
    }, 300);
})();