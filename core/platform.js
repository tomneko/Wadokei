const SUPPORTED_LOCALES = ["ja", "en", "fr", "de"];

const I18N_STRINGS = {
    ja: {
        "label.datetime": "年月日・時刻",
        "label.sekki": "24節気",
        "label.timezone": "タイムゾーン",
        "label.version": "バージョン",
        "label.copyright": "著作権",
        "label.appLicense": "アプリ本体ライセンス",
        "value.proprietary": "プロプライエタリ（All rights reserved）",
        "hint.tapMenu": "タップでメニュー",
        "menu.settings": "設定",
        "menu.displaySettings": "表示設定",
        "menu.oss": "オープンソースライセンス",
        "menu.terms": "利用規約",
        "menu.privacy": "プライバシーポリシー",
        "menu.tokushoho": "特定商取引法の表示",
        "menu.backToFront": "表へ戻る",
        "menu.back": "戻る",
        "setting.dayNight": "昼夜区分け",
        "setting.sekkiMode": "二十四節気モード",
        "setting.language": "言語",
        "state.visible": "表示",
        "state.hidden": "非表示",
        "state.enabled": "有効",
        "state.disabled": "無効",
        "legal.oss": "詳細は docs/open-source-licenses.md を参照してください。",
        "legal.terms": "詳細は docs/terms-of-service.md を参照してください。",
        "legal.privacy": "詳細は docs/privacy-policy.md を参照してください。",
        "legal.tokushoho": "詳細は docs/tokushoho.md を参照してください。",
        "sekki.prefix": "第{index}節 {name}",
        "sun.sunrise": "日の出",
        "sun.sunset": "日の入",
        "sun.ake": "卯正刻",
        "sun.kure": "酉正刻"
    },
    en: {
        "label.datetime": "Date & Time",
        "label.sekki": "24 Solar Terms",
        "label.timezone": "Time Zone",
        "label.version": "Version",
        "label.copyright": "Copyright",
        "label.appLicense": "App License",
        "value.proprietary": "Proprietary (All rights reserved)",
        "hint.tapMenu": "Tap to open menu",
        "menu.settings": "Settings",
        "menu.displaySettings": "Display Settings",
        "menu.oss": "Open Source Licenses",
        "menu.terms": "Terms of Service",
        "menu.privacy": "Privacy Policy",
        "menu.tokushoho": "Act on Specified Commercial Transactions",
        "menu.backToFront": "Back to front",
        "menu.back": "Back",
        "setting.dayNight": "Day/Night Segments",
        "setting.sekkiMode": "24-Solar-Term Mode",
        "setting.language": "Language",
        "state.visible": "Visible",
        "state.hidden": "Hidden",
        "state.enabled": "Enabled",
        "state.disabled": "Disabled",
        "legal.oss": "See docs/open-source-licenses.md for details.",
        "legal.terms": "See docs/terms-of-service.md for details.",
        "legal.privacy": "See docs/privacy-policy.md for details.",
        "legal.tokushoho": "See docs/tokushoho.md for details.",
        "sekki.prefix": "Term {index}: {name}",
        "sun.sunrise": "Sunrise",
        "sun.sunset": "Sunset",
        "sun.ake": "Dawn mark",
        "sun.kure": "Dusk mark"
    },
    fr: {
        "label.datetime": "Date et heure",
        "label.sekki": "24 termes solaires",
        "label.timezone": "Fuseau horaire",
        "label.version": "Version",
        "label.copyright": "Droits d’auteur",
        "label.appLicense": "Licence de l’application",
        "value.proprietary": "Propriétaire (All rights reserved)",
        "hint.tapMenu": "Touchez pour ouvrir le menu",
        "menu.settings": "Paramètres",
        "menu.displaySettings": "Paramètres d’affichage",
        "menu.oss": "Licences Open Source",
        "menu.terms": "Conditions d’utilisation",
        "menu.privacy": "Politique de confidentialité",
        "menu.tokushoho": "Loi sur les transactions commerciales spécifiées",
        "menu.backToFront": "Retour à l’avant",
        "menu.back": "Retour",
        "setting.dayNight": "Segments jour/nuit",
        "setting.sekkiMode": "Mode des 24 termes",
        "setting.language": "Langue",
        "state.visible": "Afficher",
        "state.hidden": "Masquer",
        "state.enabled": "Activé",
        "state.disabled": "Désactivé",
        "legal.oss": "Voir docs/open-source-licenses.md pour les détails.",
        "legal.terms": "Voir docs/terms-of-service.md pour les détails.",
        "legal.privacy": "Voir docs/privacy-policy.md pour les détails.",
        "legal.tokushoho": "Voir docs/tokushoho.md pour les détails.",
        "sekki.prefix": "Terme {index} : {name}",
        "sun.sunrise": "Lever",
        "sun.sunset": "Coucher",
        "sun.ake": "Repère d’aube",
        "sun.kure": "Repère du crépuscule"
    },
    de: {
        "label.datetime": "Datum & Uhrzeit",
        "label.sekki": "24 Sonnenperioden",
        "label.timezone": "Zeitzone",
        "label.version": "Version",
        "label.copyright": "Urheberrecht",
        "label.appLicense": "App-Lizenz",
        "value.proprietary": "Proprietär (All rights reserved)",
        "hint.tapMenu": "Tippen für Menü",
        "menu.settings": "Einstellungen",
        "menu.displaySettings": "Anzeigeeinstellungen",
        "menu.oss": "Open-Source-Lizenzen",
        "menu.terms": "Nutzungsbedingungen",
        "menu.privacy": "Datenschutzrichtlinie",
        "menu.tokushoho": "Gesetz über spezifizierte Handelstransaktionen",
        "menu.backToFront": "Zur Vorderseite",
        "menu.back": "Zurück",
        "setting.dayNight": "Tag/Nacht-Segmente",
        "setting.sekkiMode": "24-Sonnenperioden-Modus",
        "setting.language": "Sprache",
        "state.visible": "Anzeigen",
        "state.hidden": "Ausblenden",
        "state.enabled": "Aktiv",
        "state.disabled": "Inaktiv",
        "legal.oss": "Details siehe docs/open-source-licenses.md.",
        "legal.terms": "Details siehe docs/terms-of-service.md.",
        "legal.privacy": "Details siehe docs/privacy-policy.md.",
        "legal.tokushoho": "Details siehe docs/tokushoho.md.",
        "sekki.prefix": "Periode {index}: {name}",
        "sun.sunrise": "Sonnenaufgang",
        "sun.sunset": "Sonnenuntergang",
        "sun.ake": "Morgendämmerung",
        "sun.kure": "Abenddämmerung"
    }
};

let currentLocale = "en";

function normalizeLocale(localeCode) {
    const base = String(localeCode || "").toLowerCase().split("-")[0];
    return SUPPORTED_LOCALES.includes(base) ? base : "en";
}

function resolveLocale(settings) {
    if (settings?.language && settings.language !== "auto") {
        return normalizeLocale(settings.language);
    }
    return normalizeLocale(navigator.language || "en");
}

function refreshLocale(settings) {
    currentLocale = resolveLocale(settings);
}

function translate(key, params = {}) {
    const dictionary = I18N_STRINGS[currentLocale] || I18N_STRINGS.en;
    const template = dictionary[key] || I18N_STRINGS.en[key] || key;
    return template.replace(/\{(\w+)\}/g, (_, token) => params[token] ?? `{${token}}`);
}

function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.getAttribute("data-i18n");
        if (!key) return;
        element.textContent = translate(key);
    });
}

function createInfoPanelController() {
    const state = {
        initialized: false,
        currentView: 'home'
    };

    function updateFaceVisibility(panel) {
        const front = panel?.querySelector('.panel-front');
        const back = panel?.querySelector('.panel-back');
        const isFlipped = panel?.classList.contains('is-flipped');
        if (!front || !back) return;

        front.style.opacity = isFlipped ? '0' : '1';
        front.style.pointerEvents = isFlipped ? 'none' : 'auto';
        back.style.opacity = isFlipped ? '1' : '0';
        back.style.pointerEvents = isFlipped ? 'auto' : 'none';
    }

    function syncInfoPanelHeight() {
        const panel = document.getElementById('info-panel');
        const inner = panel?.querySelector('.panel-inner');
        const front = panel?.querySelector('.panel-front');
        const back = panel?.querySelector('.panel-back');
        const menuBar = document.querySelector('.bottom-menu-bar');
        if (!panel || !inner || !front) return;

        const isFlipped = panel.classList.contains('is-flipped');
        const targetHeight = isFlipped
            ? (back?.scrollHeight || front.scrollHeight)
            : front.scrollHeight;

        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const panelTop = panel.getBoundingClientRect().top;
        const menuBarHeight = menuBar?.getBoundingClientRect().height || 0;
        const availableHeight = Math.max(180, Math.floor(viewportHeight - panelTop - menuBarHeight - 16));
        inner.style.height = `${Math.min(targetHeight, availableHeight)}px`;
        updateFaceVisibility(panel);
    }

    function updateMenuDockButton(menuDockButton, isBackVisible) {
        if (!menuDockButton) return;

        const label = menuDockButton.querySelector('.menu-dock-label');
        const icon = menuDockButton.querySelector('.menu-dock-icon');
        const labelKey = isBackVisible ? 'menu.back' : 'menu.settings';

        if (label) {
            label.setAttribute('data-i18n', labelKey);
            label.textContent = translate(labelKey);
        }

        if (icon) {
            if (isBackVisible) {
                icon.classList.remove('material-symbols-outlined');
                icon.textContent = '↩︎';
            } else {
                icon.classList.add('material-symbols-outlined');
                icon.textContent = 'settings';
            }
        }

        menuDockButton.setAttribute('aria-label', translate(labelKey));
    }

    function applySettingsToUI(ctx) {
        const settings = ctx.getSettings();
        const toggle = document.getElementById('show-day-night');
        const toggleLabel = document.getElementById('show-day-night-label');
        const sekkiFixedToggle = document.getElementById('sekki-fixed-mode');
        const sekkiFixedLabel = document.getElementById('sekki-fixed-mode-label');
        const languageSelect = document.getElementById('language-select');

        if (!toggle) return;
        toggle.checked = settings?.showDayNight !== false;
        if (toggleLabel) {
            toggleLabel.textContent = toggle.checked ? ctx.t('state.visible') : ctx.t('state.hidden');
        }
        if (sekkiFixedToggle) {
            sekkiFixedToggle.checked = settings?.sekkiFixedMode === true;
        }
        if (sekkiFixedLabel) {
            sekkiFixedLabel.textContent = (settings?.sekkiFixedMode === true)
                ? ctx.t('state.enabled')
                : ctx.t('state.disabled');
        }
        if (languageSelect) {
            languageSelect.value = settings?.language || 'auto';
        }
    }

    function renderBackView(ctx, viewId) {
        const panel = document.getElementById('info-panel');
        const back = panel?.querySelector('.panel-back');
        if (!back) return;

        if (viewId === 'settings') {
            back.innerHTML = `
                <div class="row row-setting no-flip">
                    <div class="label" data-i18n="setting.dayNight">昼夜区分け</div>
                    <div class="value setting-value">
                        <label class="ios-switch no-flip" for="show-day-night">
                            <input id="show-day-night" type="checkbox" class="no-flip" checked>
                            <span class="ios-slider"></span>
                        </label>
                        <span id="show-day-night-label">表示</span>
                    </div>
                </div>
                <div class="row row-setting no-flip">
                    <div class="label" data-i18n="setting.sekkiMode">二十四節気モード</div>
                    <div class="value setting-value">
                        <label class="ios-switch no-flip" for="sekki-fixed-mode">
                            <input id="sekki-fixed-mode" type="checkbox" class="no-flip">
                            <span class="ios-slider"></span>
                        </label>
                        <span id="sekki-fixed-mode-label">無効</span>
                    </div>
                </div>
                <div class="row row-setting no-flip">
                    <label class="label" for="language-select" data-i18n="setting.language">言語</label>
                    <div class="value">
                        <select id="language-select" class="no-flip">
                            <option value="auto">Auto</option>
                            <option value="ja">日本語</option>
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                        </select>
                    </div>
                </div>
                <div class="panel-actions">
                    <button type="button" class="menu-btn no-flip" data-panel-view="home" data-i18n="menu.back">戻る</button>
                </div>
            `;
        } else {
            back.innerHTML = `
                <div class="row">
                    <div class="label" data-i18n="label.copyright">著作権</div>
                    <div class="value">© 2026 Tomneko(Hayashi Tsutomu)</div>
                </div>
                <div class="row">
                    <div class="label">License</div>
                    <div class="value">MIT License</div>
                </div>
                <div class="menu-list">
                    <button type="button" class="menu-btn no-flip" data-panel-view="settings" data-i18n="menu.displaySettings">表示設定</button>
                </div>
            `;
        }

        state.currentView = viewId;
        applyTranslations();
        applySettingsToUI(ctx);
        syncInfoPanelHeight();
    }

    function renderMarkdownToHtml(markdownText) {
        const lines = String(markdownText || '').replace(/\r\n/g, '\n').split('\n');
        let html = '';
        let inList = false;

        const closeList = () => {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
        };

        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) {
                closeList();
                continue;
            }

            if (line.startsWith('### ')) { closeList(); html += `<h3>${line.slice(4)}</h3>`; continue; }
            if (line.startsWith('## ')) { closeList(); html += `<h2>${line.slice(3)}</h2>`; continue; }
            if (line.startsWith('# ')) { closeList(); html += `<h1>${line.slice(2)}</h1>`; continue; }

            if (line.startsWith('- ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${line.slice(2)}</li>`;
                continue;
            }

            closeList();
            html += `<p>${line}</p>`;
        }

        closeList();
        return html;
    }

    async function setupInfoPanelInteractions(ctx) {
        const panel = document.getElementById('info-panel');
        const menuDockButton = document.getElementById('menu-dock-button');
        if (!panel || state.initialized) {
            syncInfoPanelHeight();
            return;
        }

        state.initialized = true;
        panel.classList.add('panel-2d');

        const openBack = () => {
            panel.classList.add('is-flipped');
            panel.setAttribute('aria-pressed', 'true');
            updateMenuDockButton(menuDockButton, true);
            renderBackView(ctx, 'home');
        };

        const closeBack = () => {
            panel.classList.remove('is-flipped');
            panel.setAttribute('aria-pressed', 'false');
            updateMenuDockButton(menuDockButton, false);
            syncInfoPanelHeight();
        };

        syncInfoPanelHeight();
        window.addEventListener('resize', syncInfoPanelHeight);

        if (menuDockButton) {
            menuDockButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (panel.classList.contains('is-flipped')) {
                    closeBack();
                } else {
                    openBack();
                }
            });
        }

        panel.addEventListener('click', (event) => {
            if (panel.classList.contains('is-flipped')) {
                const button = event.target?.closest('button');
                if (!button) return;
                event.stopPropagation();

                const action = button.getAttribute('data-panel-action');
                const view = button.getAttribute('data-panel-view');
                if (action === 'close') {
                    closeBack();
                    return;
                }
                if (view) {
                    renderBackView(ctx, view);
                }
                return;
            }

            if (event.target?.closest('.no-flip')) return;
            openBack();
        });

        panel.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (panel.classList.contains('is-flipped')) {
                    closeBack();
                } else {
                    openBack();
                }
            }
        });

        panel.addEventListener('change', async (event) => {
            if (!panel.classList.contains('is-flipped')) return;

            if (event.target?.id === 'show-day-night') {
                ctx.setSettings({ showDayNight: event.target.checked });
                applySettingsToUI(ctx);
                await ctx.saveSettings();
                ctx.redraw();
                syncInfoPanelHeight();
                return;
            }

            if (event.target?.id === 'sekki-fixed-mode') {
                ctx.setSettings({ sekkiFixedMode: event.target.checked });
                applySettingsToUI(ctx);
                await ctx.saveSettings();
                ctx.redraw();
                syncInfoPanelHeight();
                return;
            }

            if (event.target?.id === 'language-select') {
                ctx.setSettings({ language: event.target.value });
                ctx.refreshLocale();
                await ctx.saveSettings();
                renderBackView(ctx, state.currentView);
                ctx.redraw();
            }
        });

        updateMenuDockButton(menuDockButton, false);
        applySettingsToUI(ctx);
        syncInfoPanelHeight();
    }

    return {
        setupInfoPanelInteractions,
        applySettingsToUI,
        syncInfoPanelHeight
    };
}

const infoPanelController = createInfoPanelController();

window.WadokeiPlatform = {
    init: async () => {
        console.log('Web platform initialized.');
    },
    getSetting: async (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('⚠️ localStorage read failed:', e);
            return null;
        }
    },
    setSetting: async (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('⚠️ localStorage write failed:', e);
        }
    },
    refreshLocale: (settings) => refreshLocale(settings),
    translate: (key, params) => translate(key, params),
    applyTranslations: () => applyTranslations(),
    setupInfoPanelInteractions: async (ctx) => infoPanelController.setupInfoPanelInteractions(ctx),
    applySettingsToUI: (ctx) => infoPanelController.applySettingsToUI(ctx),
    syncInfoPanelHeight: () => infoPanelController.syncInfoPanelHeight()
};
