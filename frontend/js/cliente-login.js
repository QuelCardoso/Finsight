async function handleClienteLogin(event) {
    event.preventDefault();
    const empresaId = Number(document.getElementById("cli-login-empresa").value);
    const usuario = (document.getElementById("cli-login-usuario").value || "").trim();
    const senha = document.getElementById("cli-login-senha").value || "";
    const erroEl = document.getElementById("cli-login-erro");

    erroEl.style.display = "none";
    localStorage.setItem(EMPRESA_KEY, String(empresaId));
    if (typeof syncEmpresaFromApi === "function") {
        await syncEmpresaFromApi(empresaId);
    }

    const db = typeof getDB === "function" ? getDB() : {};
    const dados = db[empresaId] || (typeof getEmpresaData === "function" ? getEmpresaData() : {});
    const usuarioLower = usuario.toLowerCase();
    const digitosUsuario = usuario.replace(/\D/g, "");

    const clienteEncontrado = (dados.clientes || []).find(c => {
        const bateUser = c.usuario && c.usuario.trim().toLowerCase() === usuarioLower;
        const bateNome = c.nome && c.nome.trim().toLowerCase() === usuarioLower;
        const bateEmail = c.email && c.email.trim().toLowerCase() === usuarioLower;
        const digitosDoc = (c.documento || "").replace(/\D/g, "");
        const bateDoc = digitosUsuario.length >= 6 && digitosDoc === digitosUsuario;
        const senhaEsperada = c.senha || "Cliente@2026";
        return (bateUser || bateNome || bateEmail || bateDoc) && senha === senhaEsperada;
    });

    if (!clienteEncontrado) {
        erroEl.innerText = "Credenciais inválidas. Exemplo: Cliente 01 e senha Cliente01@123.";
        erroEl.style.display = "block";
        return;
    }

    sessionStorage.removeItem("finsight_perfil_colaborador");
    sessionStorage.setItem("finsight_cliente_sessao", JSON.stringify(clienteEncontrado));
    sessionStorage.setItem("finsight_modo_cliente_exclusivo", "1");
    window.location.replace("index.html");
}