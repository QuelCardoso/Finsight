(function atualizarClientesGmailFinSight() {
    if (typeof getDB !== "function" || typeof saveDB !== "function") return;
    const clientesAtualizados = [
        { id: 1, nome: "Cliente 01 — Comercio Silva & Filhos Ltda", documento: "12.345.678/0001-90", telefone: "(75) 99123-4501", email: "cliente01@gmail.com", endereco: "Av. Roberto Santos, 450 - Centro", limite: 15000.00, situacao: "Regular", usuario: "Cliente 01", senha: "Cliente01@132", historico: "Compra em 3x • 1 paga, 1 em atraso, 1 por vir" },
        { id: 2, nome: "Cliente 02 — Mariana Costa Oliveira", documento: "123.456.789-02", telefone: "(75) 98877-6602", email: "cliente02@gmail.com", endereco: "Rua Rui Barbosa, 112 - Jardim", limite: 4500.00, situacao: "Inadimplente", usuario: "Cliente 02", senha: "Cliente02@123", historico: "Compra em 2x • 1 em atraso, 1 por vir" },
        { id: 3, nome: "Cliente 03 — Lucas Mendes Ferreira", documento: "234.567.890-03", telefone: "(75) 99200-3303", email: "cliente03@gmail.com", endereco: "Rua 7 de Setembro, 88 - Centro", limite: 6000.00, situacao: "Regular", usuario: "Cliente 03", senha: "Cliente03@123", historico: "Compra em 2x • 1 paga, 1 por vir" },
        { id: 4, nome: "Cliente 04 — Papelaria Horizonte Ltda", documento: "34.567.890/0001-04", telefone: "(75) 3631-4404", email: "cliente04@gmail.com", endereco: "Av. ACM, 310 - Cajueiro", limite: 12000.00, situacao: "Regular", usuario: "Cliente 04", senha: "Cliente04@123", historico: "Compra em 3x • 2 pagas, 1 por vir" },
        { id: 5, nome: "Cliente 05 — Fernanda Lima Santos", documento: "456.789.012-05", telefone: "(75) 98111-5505", email: "cliente05@gmail.com", endereco: "Travessa da Matriz, 24 - Centro", limite: 3000.00, situacao: "Inadimplente", usuario: "Cliente 05", senha: "Cliente05@123", historico: "Compra em 2x • 1 em atraso, 1 por vir" },
        { id: 6, nome: "Cliente 06 — Studio Criativo Bahia ME", documento: "56.789.012/0001-06", telefone: "(75) 99444-6606", email: "cliente06@gmail.com", endereco: "Rua Castro Alves, 190 - Quitandinha", limite: 20000.00, situacao: "Regular", usuario: "Cliente 06", senha: "Cliente06@123", historico: "Compra em 4x • 1 paga, 1 em atraso, 2 por vir" }
    ];
    function sincronizar() {
        const db = getDB();
        let mudou = false;
        Object.keys(db).forEach((empKey) => {
            const emp = db[empKey];
            if (!emp || typeof emp !== "object" || !Array.isArray(emp.clientes)) return;
            clientesAtualizados.forEach((base) => {
                const alvo = emp.clientes.find((c) => Number(c.id) === base.id || (c.usuario || "").toLowerCase() === base.usuario.toLowerCase());
                if (alvo) {
                    if (alvo.email !== base.email || alvo.senha !== base.senha || alvo.telefone !== base.telefone) {
                        alvo.email = base.email;
                        alvo.senha = base.senha;
                        alvo.telefone = base.telefone;
                        mudou = true;
                    }
                }
            });
        });
        if (mudou) { saveDB(db); }
    }
    sincronizar();
    setInterval(sincronizar, 400);
})();