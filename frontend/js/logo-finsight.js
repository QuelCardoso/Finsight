(function padronizarLogoFinSight() {
    const svgIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:#00d2ff;"><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/></svg>`;

    function criarMarca(claroNoFundoEscuro) {
        const corTexto = claroNoFundoEscuro ? "#00d2ff" : "#0f172a";
        const span = document.createElement("span");
        span.className = "finsight-brand-logo";
        span.style.cssText = `display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:1.25rem;letter-spacing:-0.02em;color:${corTexto};line-height:1;`;
        span.innerHTML = `${svgIcon}<span>FinSight</span>`;
        return span;
    }

    function aplicarLogo() {
        // 1. Topo / sidebar do sistema (fundo escuro)
        const seletoresEscuros = [".sidebar-brand", ".logo", ".brand-logo", "#sidebar-logo", ".nav-brand"];
        seletoresEscuros.forEach((sel) => {
            document.querySelectorAll(sel).forEach((el) => {
                if (!el.dataset.logoFinSightAplicado && (el.innerText || "").toLowerCase().includes("finsight")) {
                    el.innerHTML = "";
                    el.appendChild(criarMarca(true));
                    el.dataset.logoFinSightAplicado = "1";
                }
            });
        });

        // 2. Cabeçalhos de login / portal do cliente (fundo claro)
        document.querySelectorAll("h1, h2, .login-title, .auth-header").forEach((el) => {
            const txt = (el.innerText || "").trim();
            if (txt === "FinSight" && !el.dataset.logoFinSightAplicado) {
                el.innerHTML = "";
                el.appendChild(criarMarca(false));
                el.dataset.logoFinSightAplicado = "1";
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", aplicarLogo);
    } else {
        aplicarLogo();
    }
    setTimeout(aplicarLogo, 300);
})();