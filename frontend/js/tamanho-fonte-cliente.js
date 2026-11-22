(function corrigirTamanhoFonteFinSight() {
    const ESCALA_KEY = "finsight_escala_fonte";
    const ESCALA_PADRAO = 100;
    const ESCALA_MIN = 85;
    const ESCALA_MAX = 140;
    const PASSO = 10;

    function getEscalaAtual() {
        const salvo = Number(localStorage.getItem(ESCALA_KEY));
        return Number.isFinite(salvo) && salvo >= ESCALA_MIN && salvo <= ESCALA_MAX
            ? salvo
            : ESCALA_PADRAO;
    }

    const styleId = "finsight-escala-fonte-css";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            :root {
                --finsight-font-scale: 1;
            }
            #module-container,
            #module-container p,
            #module-container div,
            #module-container span,
            #module-container td,
            #module-container th,
            #module-container label,
            #module-container button,
            #modal-link-pagamento-cliente,
            #modal-link-pagamento-cliente p,
            #modal-link-pagamento-cliente div,
            #modal-link-pagamento-cliente span,
            #modal-link-pagamento-cliente label,
            #modal-link-pagamento-cliente button,
            .login-card,
            .login-card label,
            .login-card input,
            .login-card select,
            .login-card button {
                font-size: calc(1em * var(--finsight-font-scale)) !important;
            }
            #module-container h1, #module-container h2, #module-container h3,
            #modal-link-pagamento-cliente h1, #modal-link-pagamento-cliente h2, #modal-link-pagamento-cliente h3 {
                font-size: calc(1.15em * var(--finsight-font-scale)) !important;
            }
        `;
        document.head.appendChild(style);
    }

    function aplicarEscala(escala) {
        const limitada = Math.max(ESCALA_MIN, Math.min(ESCALA_MAX, escala));
        localStorage.setItem(ESCALA_KEY, String(limitada));
        const fator = limitada / 100;
        document.documentElement.style.setProperty("--finsight-font-scale", String(fator));
        document.documentElement.style.fontSize = `${limitada}%`;
    }

    function vincularBotoesFonte() {
        document.querySelectorAll("button, [role='button']").forEach((btn) => {
            if (btn.dataset.fonteVinculada) return;
            const rotulo = (btn.innerText || btn.getAttribute("aria-label") || btn.title || "").trim();

            if (rotulo === "A+" || rotulo.toLowerCase().includes("aumentar fonte")) {
                btn.dataset.fonteVinculada = "1";
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    aplicarEscala(getEscalaAtual() + PASSO);
                }, true);
            } else if (rotulo === "A-" || rotulo.toLowerCase().includes("diminuir fonte")) {
                btn.dataset.fonteVinculada = "1";
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    aplicarEscala(getEscalaAtual() - PASSO);
                }, true);
            } else if (rotulo === "A" || rotulo.toLowerCase().includes("fonte padrão") || rotulo.toLowerCase().includes("fonte padrao")) {
                btn.dataset.fonteVinculada = "1";
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    aplicarEscala(ESCALA_PADRAO);
                }, true);
            }
        });
    }

    function iniciar() {
        aplicarEscala(getEscalaAtual());
        vincularBotoesFonte();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
    setTimeout(vincularBotoesFonte, 400);
})();