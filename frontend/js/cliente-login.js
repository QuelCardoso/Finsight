async function handleClienteLogin(event) {
    event.preventDefault();
    const empresaEl = document.getElementById("cli-login-empresa");
    const empresaId = Number(empresaEl ? empresaEl.value : (localStorage.getItem(EMPRESA_KEY) || 1));
    const identificador = (document.getElementById("cli-login-usuario")?.value || "").trim();
    const senha = (document.getElementById("cli-login-senha")?.value || "").trim();
    const erroEl = document.getElementById("cli-login-erro");

    if (erroEl) erroEl.style.display = "none";

    if (typeof EMPRESA_KEY !== "undefined") {
        localStorage.setItem(EMPRESA_KEY, String(empresaId));
    }

    const db = typeof getDB === "function" ? getDB() : {};
    const dados = db[empresaId] || (typeof getEmpresaData === "function" ? getEmpresaData() : {});
    const identLower = identificador.toLowerCase();
    const digitosIdent = identificador.replace(/\D/g, "");

    const clienteEncontrado = (dados.clientes || []).find(c => {
        const emailCli = (c.email || "").trim().toLowerCase();
        const digitosTel = (c.telefone || "").replace(/\D/g, "");

        const bateEmail = Boolean(emailCli) && identLower === emailCli;
        const bateTelefone = digitosIdent.length >= 8 && digitosTel.length >= 8 && (
            digitosTel === digitosIdent ||
            digitosTel.endsWith(digitosIdent) ||
            digitosIdent.endsWith(digitosTel)
        );

        const senhaEsperada = (c.senha || "Cliente@2026").trim();
        return (bateEmail || bateTelefone) && senha === senhaEsperada;
    });

    if (!clienteEncontrado) {
        if (erroEl) {
            erroEl.innerText = "Login ou senha incorretos.";
            erroEl.style.display = "block";
        }
        return;
    }

    sessionStorage.removeItem("finsight_perfil_colaborador");
    sessionStorage.setItem("finsight_cliente_sessao", JSON.stringify(clienteEncontrado));
    sessionStorage.setItem("finsight_modo_cliente_exclusivo", "1");
    window.location.replace("index.html");
}

document.addEventListener("DOMContentLoaded", () => {
    const label = document.querySelector('label[for="cli-login-usuario"]');
    if (label) label.innerText = "E-mail ou Telefone do Cliente";
    const input = document.getElementById("cli-login-usuario");
    if (input) input.placeholder = "Ex.: cliente01@gmail.com ou (75) 99123-4501";
});