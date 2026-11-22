(function corrigirBotaoEPlaceholderCliente() {
    const styleId = "finsight-btn-forcar-cor";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            form button[type="submit"],
            #btn-entrar-cliente,
            .login-card button[type="submit"],
            .auth-card button[type="submit"],
            button.btn-primary {
                display: block !important;
                width: 100% !important;
                opacity: 1 !important;
                visibility: visible !important;
                background-color: #0b5ed7 !important;
                background: #0b5ed7 !important;
                color: #ffffff !important;
                border: 1px solid #0b5ed7 !important;
                border-radius: 8px !important;
                padding: 12px 16px !important;
                font-size: 1rem !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                margin-top: 14px !important;
                pointer-events: auto !important;
            }
            form button[type="submit"]:hover,
            #btn-entrar-cliente:hover,
            .login-card button[type="submit"]:hover,
            .auth-card button[type="submit"]:hover,
            button.btn-primary:hover {
                background-color: #094db1 !important;
                background: #094db1 !important;
                color: #ffffff !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
        `;
        document.head.appendChild(style);
    }

    function aplicarNoDom() {
        const input = document.getElementById("cli-login-usuario");
        if (input) {
            input.placeholder = "Ex.: cliente01@gmail.com ou (75) 99123-4501";
        }
        document.querySelectorAll('form button[type="submit"], #btn-entrar-cliente').forEach((btn) => {
            btn.style.setProperty("display", "block", "important");
            btn.style.setProperty("opacity", "1", "important");
            btn.style.setProperty("visibility", "visible", "important");
            btn.style.setProperty("background-color", "#0b5ed7", "important");
            btn.style.setProperty("color", "#ffffff", "important");
        });
    }

    aplicarNoDom();
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", aplicarNoDom);
    }
    setInterval(aplicarNoDom, 300);
})();