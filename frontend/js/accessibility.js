const FONT_SCALE_KEY = 'finsight_font_scale';
const CONTRAST_KEY = 'finsight_high_contrast';

let currentFontPercent = parseInt(localStorage.getItem(FONT_SCALE_KEY) || '100', 10);

function applyFontScale(percent) {
    currentFontPercent = Math.min(140, Math.max(90, percent));
    document.documentElement.style.fontSize = (16 * (currentFontPercent / 100)) + 'px';
    localStorage.setItem(FONT_SCALE_KEY, String(currentFontPercent));
}

function aumentarFonte() {
    applyFontScale(currentFontPercent + 10);
}

function diminuirFonte() {
    applyFontScale(currentFontPercent - 10);
}

function resetarFonte() {
    applyFontScale(100);
}

function alternarAltoContraste() {
    const ativo = document.body.classList.toggle('high-contrast');
    localStorage.setItem(CONTRAST_KEY, ativo ? '1' : '0');
}

document.addEventListener('DOMContentLoaded', () => {
    applyFontScale(currentFontPercent);
    if (localStorage.getItem(CONTRAST_KEY) === '1') {
        document.body.classList.add('high-contrast');
    }
});