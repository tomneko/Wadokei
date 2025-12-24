window.config = null;

window.configPromise = fetch("config.json")
    .then(r => r.json())
    .then(cfg => {
        window.config = cfg;
        return cfg;
    });
