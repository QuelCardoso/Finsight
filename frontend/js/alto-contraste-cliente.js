(function corrigirAltoContrasteClienteFinSight() {
    const STORAGE_KEY = "finsight_alto_contraste";
    const CLASSES_CONTRASTE = ["high-contrast", "alto-contraste", "contrast-mode"];

    function estaAtivo() {
        return CLASSES_CONTRASTE.some(c => document.body.classList.contains(c) || document.documentElement.classList.contains(c))
            || localStorage.getItem(STORAGE_KEY) === "1";
    }

    function aplicarEstado(ativo) {
        CLASSES_CONTRASTE.forEach(c => {
            document.body.classList.toggle(c, ativo);
            document.documentElement.classList.toggle(c, ativo);
        });
        localStorage.setItem(STORAGE_KEY, ativo ? "1" : "0");
    }

    const styleId = "finsight-alto-contraste-cliente-css";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            html.high-contrast, body.high-contrast,
            html.alto-contraste, body.alto-contraste,
            html.contrast-mode, body.contrast-mode {
                background: #000000 !important;
                background-color: #000000 !important;
                color: #ffffff !important;
            }

            html.high-contrast *, body.high-contrast *,
            html.alto-contraste *, body.alto-contraste *,
            html.contrast-mode *, body.contrast-mode * {
                border-color: #ffff00 !important;
            }

            html.high-contrast .card, body.high-contrast .card,
            html.alto-contraste .card, body.alto-contraste .card,
            html.contrast-mode .card, body.contrast-mode .card,
            html.high-contrast .login-card, body.high-contrast .login-card,
            html.alto-contraste .login-card, body.alto-contraste .login-card,
            html.high-contrast .auth-card, body.high-contrast .auth-card,
            html.alto-contraste .auth-card, body.alto-contraste .auth-card,
            html.high-contrast .table-container, body.high-contrast .table-container,
            html.alto-contraste .table-container, body.alto-contraste .table-container,
            html.high-contrast #modal-link-pagamento-cliente > div,
            body.high-contrast #modal-link-pagamento-cliente > div,
            html.alto-contraste #modal-link-pagamento-cliente > div,
            body.alto-contraste #modal-link-pagamento-cliente > div {
                background: #000000 !important;
                background-color: #000000 !important;
                color: #ffffff !important;
                border: 2px solid #ffff00 !important;
                box-shadow: none !important;
            }

            html.high-contrast input, body.high-contrast input,
            html.alto-contraste input, body.alto-contraste input,
            html.high-contrast select, body.high-contrast select,
            html.alto-contraste select, body.alto-contraste select,
            html.high-contrast textarea, body.high-contrast textarea,
            html.alto-contraste textarea, body.alto-contraste textarea {
                background: #000000 !important;
                background-color: #000000 !important;
                color: #ffff00 !important;
                border: 2px solid #ffffff !important;
            }

            html.high-contrast table, body.high-contrast table,
            html.alto-contraste table, body.alto-contraste table,
            html.high-contrast th, body.high-contrast th,
            html.alto-contraste th, body.alto-contraste th,
            html.high-contrast td, body.high-contrast td,
            html.alto-contraste td, body.alto-contraste td {
                background: #000000 !important;
                color: #ffffff !important;
                border: 1px solid #ffff00 !important;
            }

            html.high-contrast button, body.high-contrast button,
            html.alto-contraste button, body.alto-contraste button,
            html.contrast-mode button, body.contrast-mode button,
            html.high-contrast #btn-entrar-cliente, body.high-contrast #btn-entrar-cliente,
            html.alto-contraste #btn-entrar-cliente, body.alto-contraste #btn-entrar-cliente {
                background: #ffff00 !important;
                background-color: #ffff00 !important;
                color: #000000 !important;
                border: 2px solid #ffffff !important;
                font-weight: 700 !important;
            }

            html.high-contrast a, body.high-contrast a,
            html.alto-contraste a, body.alto-contraste a,
            html.high-contrast small, body.high-contrast small,
            html.alto-contraste small, body.alto-contraste small,
            html.high-contrast label, body.high-contrast label,
            html.alto-contraste label, body.alto-contraste label,
            html.high-contrast span, body.high-contrast span {
                color: #ffff00 !important;
            }

            html.high-contrast button *, body.high-contrast button *,
            html.alto-contraste button *, body.alto-contraste button * {
                color: #000000 !important;
            }
        `;
        document.head.appendChild(style);
    }

    function vincularBotoesContraste() {
        document.querySelectorAll("button, a, [role='button']").forEach((el) => {
            const txt = (el.innerText || el.getAttribute("aria-label") || "").toLowerCase();
            if (txt.includes("contraste") && !el.dataset.contrasteVinculado) {
                el.dataset.contrasteVinculado = "1";
                el.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const novoEstado = !estaAtivo();
                    aplicarEstado(novoEstado);
                }, true);
            }
        });
    }

    function iniciar() {
        if (localStorage.getItem(STORAGE_KEY) === "1") {
            aplicarEstado(true);
        }
        vincularBotoesContraste();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
    setTimeout(vincularBotoesContraste, 400);
})();