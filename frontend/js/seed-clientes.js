(function seedClientesTodasEmpresasFinSight() {
    if (typeof getDB !== "function" || typeof saveDB !== "function") return;
    const clientes6 = [
        { id: 1, nome: "Cliente 01 — Comercio Silva & Filhos Ltda", documento: "12.345.678/0001-90", telefone: "(75) 99123-4501", email: "cliente01@finsight.com", endereco: "Av. Roberto Santos, 450 - Centro", limite: 15000.00, situacao: "Regular", usuario: "Cliente 01", senha: "Cliente01@123", historico: "Compra em 3x • 1 paga, 1 em atraso, 1 por vir" },
        { id: 2, nome: "Cliente 02 — Mariana Costa Oliveira", documento: "123.456.789-02", telefone: "(75) 98877-6602", email: "cliente02@finsight.com", endereco: "Rua Rui Barbosa, 112 - Jardim", limite: 4500.00, situacao: "Inadimplente", usuario: "Cliente 02", senha: "Cliente02@123", historico: "Compra em 2x • 1 em atraso, 1 por vir" },
        { id: 3, nome: "Cliente 03 — Lucas Mendes Ferreira", documento: "234.567.890-03", telefone: "(75) 99200-3303", email: "cliente03@finsight.com", endereco: "Rua 7 de Setembro, 88 - Centro", limite: 6000.00, situacao: "Regular", usuario: "Cliente 03", senha: "Cliente03@123", historico: "Compra em 2x • 1 paga, 1 por vir" },
        { id: 4, nome: "Cliente 04 — Papelaria Horizonte Ltda", documento: "34.567.890/0001-04", telefone: "(75) 3631-4404", email: "cliente04@finsight.com", endereco: "Av. ACM, 310 - Cajueiro", limite: 12000.00, situacao: "Regular", usuario: "Cliente 04", senha: "Cliente04@123", historico: "Compra em 3x • 2 pagas, 1 por vir" },
        { id: 5, nome: "Cliente 05 — Fernanda Lima Santos", documento: "456.789.012-05", telefone: "(75) 98111-5505", email: "cliente05@finsight.com", endereco: "Travessa da Matriz, 24 - Centro", limite: 3000.00, situacao: "Inadimplente", usuario: "Cliente 05", senha: "Cliente05@123", historico: "Compra em 2x • 1 em atraso, 1 por vir" },
        { id: 6, nome: "Cliente 06 — Studio Criativo Bahia ME", documento: "56.789.012/0001-06", telefone: "(75) 99444-6606", email: "cliente06@finsight.com", endereco: "Rua Castro Alves, 190 - Quitandinha", limite: 20000.00, situacao: "Regular", usuario: "Cliente 06", senha: "Cliente06@123", historico: "Compra em 4x • 1 paga, 1 em atraso, 2 por vir" }
    ];
    const transacoes6 = [
        { id: 1001, tipo: "Receber", descricao: "Compra #101 — Notebook Corporativo i5", clienteId: 1, parcelas: "Parcela 1/3", valor: 1100.00, vencimento: "2026-10-15", status: "Pago", cobrancas: [] },
        { id: 1002, tipo: "Receber", descricao: "Compra #101 — Notebook Corporativo i5", clienteId: 1, parcelas: "Parcela 2/3", valor: 1100.00, vencimento: "2026-11-15", status: "Atrasado", cobrancas: [] },
        { id: 1003, tipo: "Receber", descricao: "Compra #101 — Notebook Corporativo i5", clienteId: 1, parcelas: "Parcela 3/3", valor: 1100.00, vencimento: "2026-12-20", status: "Pendente", cobrancas: [] },
        { id: 1004, tipo: "Receber", descricao: "Compra #102 — Monitor LED 24", clienteId: 2, parcelas: "Parcela 1/2", valor: 445.00, vencimento: "2026-11-05", status: "Atrasado", cobrancas: [] },
        { id: 1005, tipo: "Receber", descricao: "Compra #102 — Monitor LED 24", clienteId: 2, parcelas: "Parcela 2/2", valor: 445.00, vencimento: "2026-12-22", status: "Pendente", cobrancas: [] },
        { id: 1006, tipo: "Receber", descricao: "Compra #103 — Teclado e Mouse Sem Fio", clienteId: 3, parcelas: "Parcela 1/2", valor: 250.00, vencimento: "2026-11-10", status: "Pago", cobrancas: [] },
        { id: 1007, tipo: "Receber", descricao: "Compra #103 — Teclado e Mouse Sem Fio", clienteId: 3, parcelas: "Parcela 2/2", valor: 250.00, vencimento: "2026-12-25", status: "Pendente", cobrancas: [] },
        { id: 1008, tipo: "Receber", descricao: "Compra #104 — Lote Material Escritorio", clienteId: 4, parcelas: "Parcela 1/3", valor: 900.00, vencimento: "2026-09-20", status: "Pago", cobrancas: [] },
        { id: 1009, tipo: "Receber", descricao: "Compra #104 — Lote Material Escritorio", clienteId: 4, parcelas: "Parcela 2/3", valor: 900.00, vencimento: "2026-10-20", status: "Pago", cobrancas: [] },
        { id: 1010, tipo: "Receber", descricao: "Compra #104 — Lote Material Escritorio", clienteId: 4, parcelas: "Parcela 3/3", valor: 900.00, vencimento: "2026-12-28", status: "Pendente", cobrancas: [] },
        { id: 1011, tipo: "Receber", descricao: "Compra #105 — Cadeira Ergonomica", clienteId: 5, parcelas: "Parcela 1/2", valor: 600.00, vencimento: "2026-11-12", status: "Atrasado", cobrancas: [] },
        { id: 1012, tipo: "Receber", descricao: "Compra #105 — Cadeira Ergonomica", clienteId: 5, parcelas: "Parcela 2/2", valor: 600.00, vencimento: "2026-12-30", status: "Pendente", cobrancas: [] },
        { id: 1013, tipo: "Receber", descricao: "Compra #106 — Kit Workstation", clienteId: 6, parcelas: "Parcela 1/4", valor: 1200.00, vencimento: "2026-10-10", status: "Pago", cobrancas: [] },
        { id: 1014, tipo: "Receber", descricao: "Compra #106 — Kit Workstation", clienteId: 6, parcelas: "Parcela 2/4", valor: 1200.00, vencimento: "2026-11-18", status: "Atrasado", cobrancas: [] },
        { id: 1015, tipo: "Receber", descricao: "Compra #106 — Kit Workstation", clienteId: 6, parcelas: "Parcela 3/4", valor: 1200.00, vencimento: "2026-12-26", status: "Pendente", cobrancas: [] },
        { id: 1016, tipo: "Receber", descricao: "Compra #106 — Kit Workstation", clienteId: 6, parcelas: "Parcela 4/4", valor: 1200.00, vencimento: "2027-01-26", status: "Pendente", cobrancas: [] }
    ];
    function aplicarEmTodasEmpresas() {
        const db = getDB();
        let alterou = false;
        Object.keys(db).forEach((empKey, empIdx) => {
            const emp = db[empKey];
            if (!emp || typeof emp !== "object") return;
            const atuais = emp.clientes || [];
            const jaTem = atuais.some(c => (c.usuario || "").toLowerCase() === "cliente 06");
            if (!jaTem) {
                emp.clientes = clientes6.map(c => ({ ...c }));
                const outrasTx = (emp.transacoes || []).filter(t => ![1, 2, 3, 4, 5, 6].includes(Number(t.clienteId)));
                const offset = (empIdx + 1) * 10000;
                emp.transacoes = [...transacoes6.map(t => ({ ...t, id: offset + Number(t.id) })), ...outrasTx];
                alterou = true;
            }
        });
        if (alterou) { saveDB(db); }
    }
    aplicarEmTodasEmpresas();
    setInterval(aplicarEmTodasEmpresas, 400);
})();