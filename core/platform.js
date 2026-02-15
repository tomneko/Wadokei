window.WadokeiPlatform = {
    init: async () => {
        console.log("Web platform initialized.");
        // Webでは何もしない、あるいはWeb特有の初期化
    },
    getSetting: async (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn("⚠️ localStorage read failed:", e);
            return null;
        }
    },
    setSetting: async (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn("⚠️ localStorage write failed:", e);
        }
    }
};