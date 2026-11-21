(function configurarPerfisColaboradorFinSight() {
    const PERFIL_KEY = "finsight_perfil_colaborador";
    const USUARIO_KEY = "finsight_usuario_colaborador";

    const CREDENCIAIS = {
        admin: { usuario: "admin@2026", senha: "admin@2026", label: "Admin" },
        gerente: { usuario: "gerente@2026", senha: "gerente@2026", label: "Gerente (Somente Leitura)" }
    };

    function getPerfilAtivo() {
        return sessionStorage.getItem(PERFIL_KEY) || "admin";
    }

    function ehGerenteSomenteLeitura() {
        if (sessionStorage.getItem("finsight_modo_cliente_exclusivo") === "1") return false;
        return getPerfilAtivo() === "gerente";
    }

    function validarCredencialColaborador(perfilEscolhido, usuarioDigitado, senhaDigitada) {
        const u = (usuarioDigitado || "").trim().toLowerCase();
        const s = senhaDigitada || "";

        if (perfilEscolhido === "admin") {
            return u === CREDENCIAIS.admin.usuario && s === CREDENCIAIS.admin.senha;
        }
        if (perfilEscolhido === "gerente") {
            return u === CREDENCIAIS.gerente.usuario && s === CREDENCIAIS.gerente.senha;
        }
        return false;
    }

    function aplicarRestricoesGerente() {
        const ehGerente = ehGerenteSomenteLeitura();
        const container = document.getElementById("module-container");
        if (!container) return;

        container.querySelectorAll("[data-gerente-lock]").forEach(el => el.remove());

        if (!ehGerente) {
            container.querySelectorAll("button, [onclick]").forEach(el => {
                if (el.dataset.gerenteDisabled === "1") {
                    el.disabled = false;
                    el.style.opacity = "";
                    el.style.pointerEvents = "";
                    el.removeAttribute("title");
                    delete el.dataset.gerenteDisabled;
                }
            });
            return;
        }

        const aviso = document.createElement("div");
        aviso.setAttribute("data-gerente-lock", "1");
        aviso.style.cssText = "background:#FEF3C7;color:#92400E;border:1px solid #F59E0B;padding:10px 14px;border-radius:8px;margin-bottom:14px;font-size:0.9rem;font-weight:600;";
        aviso.innerHTML = '<i class="fa-solid fa-eye"></i> Perfil Gerente: visualização liberada em todas as páginas, sem permissão para fazer alterações.';
        container.prepend(aviso);

        container.querySelectorAll("button, a.btn-add, [onclick]").forEach(el => {
            if (el.closest("[data-gerente-lock]")) return;
            const onClick = (el.getAttribute("onclick") || "").toLowerCase();
            const texto = (el.innerText || "").toLowerCase();
            const ehAcaoAlteracao =
                onClick.includes("abrirmodal") ||
                onClick.includes("excluir") ||
                onClick.includes("remover") ||
                onClick.includes("deletar") ||
                onClick.includes("pagar") ||
                onClick.includes("quitar") ||
                onClick.includes("cobrar") ||
                onClick.includes("movimentar") ||
                onClick.includes("salvar") ||
                texto.includes("novo ") ||
                texto.includes("excluir") ||
                texto.includes("pagar") ||
                texto.includes("cobrar") ||
                texto.includes("movimentar");

            if (ehAcaoAlteracao) {
                el.dataset.gerenteDisabled = "1";
                el.disabled = true;
                el.style.opacity = "0.45";
                el.style.pointerEvents = "none";
                el.setAttribute("title", "Perfil Gerente não pode fazer alterações");
            }
        });
    }

    function exibirErroLogin(mensagem) {
        let erroEl = document.getElementById("colab-login-erro");
        if (!erroEl) {
            erroEl = document.createElement("p");
            erroEl.id = "colab-login-erro";
            erroEl.style.cssText = "color:#DC2626;font-size:0.875rem;font-weight:600;margin:8px 0 12px;";
            const form = document.querySelector("#auth-screen form");
            const btn = form?.querySelector('button[type="submit"]');
            if (form && btn) form.insertBefore(erroEl, btn);
        }
        erroEl.innerText = mensagem;
        erroEl.style.display = "block";
    }

    function prepararTelaLoginColaborador() {
        const authForm = document.querySelector("#auth-screen form");
        if (!authForm) return;

        if (!document.getElementById("perfil-colaborador-select")) {
            const grupo = document.createElement("div");
            grupo.className = "input-group";
            grupo.innerHTML = `
                <label for="perfil-colaborador-select">Tipo de Acesso</label>
                <select id="perfil-colaborador-select">
                    <option value="admin">Admin</option>
                    <option value="gerente">Gerente</option>
                </select>
            `;
            const submitBtn = authForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                authForm.insertBefore(grupo, submitBtn);
            } else {
                authForm.appendChild(grupo);
            }
        }

        if (!authForm.dataset.credenciaisHooked) {
            authForm.dataset.credenciaisHooked = "1";
            authForm.addEventListener("submit", (event) => {
                const perfilEscolhido = document.getElementById("perfil-colaborador-select")?.value || "admin";
                const usuarioVal = document.getElementById("usuario")?.value || "";
                const senhaVal = document.getElementById("senha")?.value || "";

                if (!validarCredencialColaborador(perfilEscolhido, usuarioVal, senhaVal)) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    const esperado = CREDENCIAIS[perfilEscolhido]?.usuario || "admin@2026";
                    exibirErroLogin(`Usuário ou senha inválidos para ${perfilEscolhido === "gerente" ? "Gerente" : "Admin"}. Use ${esperado} e a mesma senha.`);
                    return false;
                }

                const erroEl = document.getElementById("colab-login-erro");
                if (erroEl) erroEl.style.display = "none";

                sessionStorage.setItem(PERFIL_KEY, perfilEscolhido);
                sessionStorage.setItem(USUARIO_KEY, usuarioVal.trim());

                setTimeout(() => {
                    if (sessionStorage.getItem("finsight_modo_cliente_exclusivo") !== "1") {
                        const badge = document.getElementById("empresa-logada-badge");
                        const empNome = document.getElementById("empresa-select")?.selectedOptions?.[0]?.text || "Matriz Comercial Ltda";
                        if (badge) {
                            badge.innerText = perfilEscolhido === "gerente"
                                ? `${empNome} • Gerente (Leitura)`
                                : `${empNome} • Admin`;
                        }
                        aplicarRestricoesGerente();
                    }
                }, 120);
            }, true);
        }
    }

    document.addEventListener("DOMContentLoaded", prepararTelaLoginColaborador);
    setInterval(() => {
        prepararTelaLoginColaborador();
        if (sessionStorage.getItem("finsight_modo_cliente_exclusivo") !== "1") {
            aplicarRestricoesGerente();
        }
    }, 300);
})();