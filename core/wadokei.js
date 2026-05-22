/**
 * 和時計エンジン本体（Wadokei Core）
 *
 * 作成日: 2025-12-24
 * 著者: Tsutomu Hayashi
 *
 * 概要:
 *   和時計の中心ロジックを提供するコアモジュール。
 *   設定（config）、天文計算（sun）、描画状態（state）を統合管理し、
 *   各プラグイン（針・盤面・暦）へ必要なデータを供給する。
 *
 * 主な責務:
 *   - 設定ファイル（config.json）の読み込みと保持
 *   - SunCalc を用いた日の出・日の入り・真太陽時の計算
 *   - Canvas の初期化と描画ループ管理
 *   - 各描画プラグイン（drawBackplane / drawHand / drawCalendar）の呼び出し
 *   - 情報パネル（24節気・時刻・タイムゾーン）の更新
 *
 * 公開される名前空間:
 *   Wadokei.config  - 設定（dialMode, calMode, lat, lon など）
 *   Wadokei.sun     - 天文データ（sunrise, sunset, Lday, trueNoon）
 *   Wadokei.state   - 描画状態（現在時刻など）
 *   Wadokei.hand    - 針プラグインが使用する画像・ロード状態
 *   Wadokei.backplane - 盤面プラグインが使用する画像・ロード状態
 *
 * 注意:
 *   - SunCalc の計算は InitWadokei 内で初期化される。
 *   - 描画ループは startWadokei() により開始される。
 *   - プラグインは config.handPlugin / backplanePlugin / calendarPlugin により動的ロードされる。
 *
 * このファイルは「和時計エンジンの中枢」であり、
 * プラグインはこのモジュールが提供するデータを参照して描画を行う。
 */

/* グローバル名前空間 Wadokei の初期化
  */
window.Wadokei = {
  config: {},
  sun: {},
  state: {},
  hand: {},
  backplane: {},
  demo: {
    enabled: false,
    fixedDate: null
  }
};

const SETTINGS_KEY = "wadokei.settings.v1";
const DEFAULT_USER_SETTINGS = {
  showDayNight: true,
  language: "auto",
  sekkiFixedMode: false,
  kanseiCorrection: true,
  showQuarterKokuLines: false
};

function t(key, params = {}) {
  const template = window.WadokeiPlatform?.translate?.(key, params) || key;

  return template.replace(/\{(\w+)\}/g, (_, token) => {
    return params[token] ?? `{${token}}`;
  });
}

function applyTranslations() {
  window.WadokeiPlatform?.applyTranslations?.();
}

function parseDemoDateTime(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  // Accept "YYYY/MM/DD HH:mm:ss" and "YYYY-MM-DD HH:mm:ss"
  const m = value.trim().match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
  if (!m) {
    return null;
  }

  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const hour = Number(m[4] ?? 0);
  const minute = Number(m[5] ?? 0);
  const second = Number(m[6] ?? 0);
  const dt = new Date(year, month, day, hour, minute, second, 0);

  if (Number.isNaN(dt.getTime())) {
    return null;
  }
  return dt;
}

function initDemoClock(config) {
  const normalizeDemoMode = (rawMode) => {
    if (rawMode === true) return 2;
    if (rawMode === false || rawMode == null) return 1;
    const mode = Number(rawMode);
    return [1, 2, 3].includes(mode) ? mode : 1;
  };

  const mode = normalizeDemoMode(config?.demoMode);
  const fixedRaw = parseDemoDateTime(config?.demoDateTime);
  const fixedDate = [2, 3].includes(mode) ? fixedRaw : null;

  if (mode === 3 && fixedDate) {
    const now = new Date();
    now.setSeconds(0, 0);
    const base = new Date(fixedDate.getTime());
    base.setSeconds(0, 0);
    const elapsed = ((now.getTime() - base.getTime()) % (5 * 60 * 1000) + (5 * 60 * 1000)) % (5 * 60 * 1000);
    Wadokei.demo.enabled = true;
    Wadokei.demo.fixedDate = new Date(base.getTime() + elapsed);
    return;
  }

  Wadokei.demo.enabled = mode === 2 && !!fixedDate;
  Wadokei.demo.fixedDate = fixedDate;

  if (mode > 1 && !fixedDate) {
    console.warn("⚠️ demoMode is enabled but demoDateTime is invalid. Falling back to realtime clock.");
  }
}

function getCurrentDateTime() {
  if (Wadokei.demo.enabled && Wadokei.demo.fixedDate) {
    return new Date(Wadokei.demo.fixedDate.getTime());
  }
  return new Date();
}

function getSunCalcAnchorDate(nowTime) {
  if (Wadokei.userSettings?.sekkiFixedMode === true) {
    const sekki = getSekki(nowTime);
    if (sekki?.start instanceof Date) {
      return sekki.start;
    }
  }
  return nowTime;
}

function getSunCalcStateKey(nowTime) {
  if (Wadokei.userSettings?.sekkiFixedMode === true) {
    const sekki = getSekki(nowTime);
    const idx = sekki?.index ?? "unknown";
    const start = sekki?.start instanceof Date ? sekki.start : nowTime;
    return `sekki:${idx}:${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()}`;
  }
  return `daily:${nowTime.toDateString()}`;
}

/* 和時計初期化
  * config: 設定オブジェクト
  * consts: 定数オブジェクト
  * WadokeiLocal: ローカル環境情報オブジェクト（存在する場合）
  * 備考: WadokeiLocal はWordpress環境でwp_locarize_script()で注入する
  */
async function InitWadokei(config, consts) {

  Wadokei.consts = { ...consts };
  Wadokei.config = { ...config };
  initDemoClock(Wadokei.config);

  if (typeof WadokeiLocal !== 'undefined' && WadokeiLocal !== null) {
    Wadokei.consts.coreDir = WadokeiLocal.coreDir;
    Wadokei.consts.pluginDir = WadokeiLocal.pluginDir;
    Wadokei.consts.pluginRsrcsDir = WadokeiLocal.pluginDir + '/rsrcs/';
  }

  Wadokei.userSettings = await loadUserSettings();
  const nowTime = getCurrentDateTime();
  Wadokei.sun = ComputeSunData(getSunCalcAnchorDate(nowTime));
  Wadokei.state.lastSunCalcKey = getSunCalcStateKey(nowTime);
  window.WadokeiPlatform?.refreshLocale?.(Wadokei.userSettings);
  window.WadokeiPlatform?.applyTranslations?.();
  if (window.WadokeiPlatform?.setupInfoPanelInteractions) {
    await window.WadokeiPlatform.setupInfoPanelInteractions({
      t,
      getSettings: () => Wadokei.userSettings,
      setSettings: (patch) => {
        Wadokei.userSettings = { ...Wadokei.userSettings, ...patch };
      },
      saveSettings: saveUserSettings,
      refreshLocale: () => {
        window.WadokeiPlatform?.refreshLocale?.(Wadokei.userSettings);
        window.WadokeiPlatform?.applyTranslations?.();
      },
      redraw: () => draw()
    });
  }
  if (window.WadokeiPlatform?.applySettingsToUI) {
    window.WadokeiPlatform.applySettingsToUI({
      t,
      getSettings: () => Wadokei.userSettings
    });
  }

  // フォント読み込み完了後に開始
  document.fonts.ready.then(() => {
    startWadokei();
  });
}

// 読み込み対象のリスト
const loadTasks = [
  configPromise,
  constsPromise,
  loadPlugin("core/platform.js") // platform.js も並列で読み込む
];

/*  設定・定数読み込みと初期化
  */
Promise.allSettled(loadTasks)
  .then(async results => {
    // ここで results 配列から 3 つの要素を取り出しています
    const [configRes, constsRes, platformRes] = results;

    // 1. 必須ファイルのバリデーション
    if (configRes.status !== "fulfilled") {
      return showErrorMessage("config.json の読み込みに失敗しました。");
    }
    if (constsRes.status !== "fulfilled") {
      return showErrorMessage("consts.json の読み込みに失敗しました。");
    }

    // 2. プラットフォーム層の初期化とログ
    if (window.WadokeiPlatform?.init) {
      try {
        await window.WadokeiPlatform.init();
        console.log("✅ Platform layer initialized successfully.");
      } catch (e) {
        console.error("❌ Platform init failed during execution:", e);
      }
    } else {
      // ロード自体に失敗したか、initが定義されていない場合
      if (platformRes.status !== "fulfilled" || !platformRes.value?.ok) {
        console.warn("⚠️ platform.js could not be loaded. Falling back to default.");
      } else {
        console.log("ℹ️ Standard platform mode (no extra init required).");
      }
    }

    // 3. 和時計本体の初期化
    await InitWadokei(configRes.value, constsRes.value);
  });


/* 針描画（簡易版）はプラグインへ移動しました */

/* 盤面描画（簡易版）はプラグインへ移動しました */

/* 和時計描画
  */
function drawClock(nowTime) {
  const { dialMode, calMode, lat, lon } = Wadokei.config;
  const { sunrise, sunset, ake, kure, Lday, trueNoon } = Wadokei.sun;
  const ctx = Wadokei.ctx;
  const radius = Wadokei.radius;
  const canvas = Wadokei.canvas;

  // 座標系リセット
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 座標系をスケール
  ctx.scale(2, 2);

  // 中央へ移動
  ctx.translate(Wadokei.radius, Wadokei.radius);

  // 透明度リセット
  ctx.globalAlpha = 1.0;

  // 寛政暦補正OFFでは、卯/酉の正刻を日の出/日の入りとして盤面を構成する。
  const useKanseiCorrection = Wadokei.userSettings?.kanseiCorrection !== false;
  const dayStart = useKanseiCorrection ? ake : sunrise;
  const dayEnd = useKanseiCorrection ? kure : sunset;
  let dayLength = dayEnd - dayStart;
  let nightLength = (dayStart + 24 * 3600 * 1000) - dayEnd;

  let dayAngle = (dayLength / (dayLength + nightLength)) * 2 * Math.PI;
  let nightAngle = 2 * Math.PI - dayAngle;

  // dayStart は number（ミリ秒）なので Date に戻す
  let sunriseDate = new Date(dayStart);

  // 今日の0時から日の出までの秒数
  let sunriseSec =
    sunriseDate.getHours() * 3600 +
    sunriseDate.getMinutes() * 60 +
    sunriseDate.getSeconds();

  // 1日の中の位置（0〜2π）
  let startAngle = (sunriseSec / (24 * 3600)) * 2 * Math.PI;

  // 真上を0radにしたいなら -90°補正
  // startAngle -= Math.PI / 2;

  // 盤面描画（ここに全部押し込む）
  const bp = drawBackplane(ctx, radius, {
    startAngle,
    dayAngle,
    nightAngle,
    dialMode,
    sunrise,
    sunset,
    showDayNight: Wadokei.userSettings?.showDayNight !== false,
    kanseiCorrection: useKanseiCorrection,
    showQuarterKokuLines: Wadokei.userSettings?.showQuarterKokuLines === true
  });
  const tickShift = bp.shift;
  // 針の角度計算
  let seconds = nowTime.getHours() * 3600 + nowTime.getMinutes() * 60 + nowTime.getSeconds();
  let angle = (seconds / 86400) * 2 * Math.PI;

  if (dialMode === "午上") {
    angle += Math.PI / 2;
  } else {
    angle -= Math.PI / 2;
  }

  // 針描画
  drawHand(angle, radius - 60, {
    scale: 0.4,
    offsetX: 0,
    offsetY: 0,
    tickShift: -tickShift
  });
}

/*  プラグイン読み込み
  * url: プラグインスクリプトのURL
  * 戻り値: Promise（{ url, ok } のオブジェクト）
  */
function loadPlugin(url) {
  return new Promise(resolve => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => resolve({ url, ok: true });
    script.onerror = () => resolve({ url, ok: false }); // ← 読み込み失敗でも resolve
    document.head.appendChild(script);
  });
}

/*  Canvas初期化
  */
function initCanvas() {
  // Canvas 初期化
  const canvas = document.getElementById('clock');
  const ctx = canvas.getContext('2d');

  // CSS の表示サイズを取得
  const displaySize = canvas.clientWidth;

  // 内部解像度を合わせる（高精細）
  canvas.width = displaySize * 2;
  canvas.height = displaySize * 2;

  // ★ ここでグローバル共有
  Wadokei.canvas = canvas;
  Wadokei.ctx = ctx;
  Wadokei.radius = displaySize / 2;
}

// UIスケール設定
const scaleMap = [
  { w: 300, s: 0.65 },
  { w: 325, s: 0.70 },
  { w: 350, s: 0.75 },
  { w: 375, s: 0.80 },
  { w: 400, s: 0.85 },
  { w: 425, s: 0.88 },
  { w: 450, s: 0.90 },
  { w: 475, s: 0.92 },
  { w: 500, s: 0.94 },
  { w: 525, s: 0.96 },
  { w: 550, s: 0.98 },
  { w: 600, s: 1.00 }
];

/* 画面幅からUIスケールを決定
  * w: 画面幅（ピクセル）
  * 戻り値: スケール値（例: 0.75）
  */
function uiScaleFromWidth(w) {
  let chosen = scaleMap[0].s;
  for (const item of scaleMap) {
    if (w >= item.w) {
      chosen = item.s;
    }
  }
  return chosen;
}

/*  和時計の描画（務さんのロジックを利用）
  * config: 設定オブジェクト
  */
function draw() {
  const beforeWidth = Wadokei.canvas.clientWidth;

  if (Wadokei.lastCanvasWidth !== beforeWidth) {
    initCanvas();
    const afterWidth = Wadokei.canvas.clientWidth;
    Wadokei.lastCanvasWidth = afterWidth;
    Wadokei.uiScale = uiScaleFromWidth(afterWidth);
  }
  // console.log(`UI Scale: ${Wadokei.uiScale}`);

  // 日の出・日の入り再計算（1日1回実行）
  const nowTime = getCurrentDateTime();
  const sunCalcKey = getSunCalcStateKey(nowTime);
  if (Wadokei.state.lastSunCalcKey !== sunCalcKey) {
    Wadokei.sun = ComputeSunData(getSunCalcAnchorDate(nowTime));
    Wadokei.state.lastSunCalcKey = sunCalcKey;
  }

  // 描画処理引数は全てWadokeiから取得
  drawClock(nowTime);

  // 情報パネル更新
  drawInfoPanel(nowTime);
}

/* 描画ループ開始
  */
function startClockLoop() {
  draw();
  setInterval(draw, 1000);
}

/*  メイン関数
  */
function startWadokei() {

  // Canvas 初期化
  initCanvas();

  // プラグイン名を決定（default → core に置き換え）
  let handPlugin = Wadokei.config.handPlugin;
  if (!handPlugin || handPlugin === "default") {
    handPlugin = Wadokei.consts.coreDir + Wadokei.consts.defaultHand;
  } else {
    handPlugin = Wadokei.consts.pluginDir + handPlugin;
  }

  let backplanePlugin = Wadokei.config.backplanePlugin;
  if (!backplanePlugin || backplanePlugin === "default") {
    backplanePlugin = Wadokei.consts.coreDir + Wadokei.consts.defaultBackplane;
  } else {
    backplanePlugin = Wadokei.consts.pluginDir + backplanePlugin;
  }

  // 読み込むプラグイン一覧
  const pluginNames = [
    handPlugin,
    backplanePlugin,
  ];

  // ロード開始
  const pluginLoads = Promise.all(
    pluginNames
      .filter(name => name)     // 空文字を除外
      .map(name => loadPlugin(name))
  );

  // ここから先は「プラグイン読み込み後」に実行したい処理
  pluginLoads.then(results => {
    // Clockループ開始
    startClockLoop();
  });
}

async function loadUserSettings() {
  let raw = null;

  try {
    if (window.WadokeiPlatform?.getSetting) {
      raw = await window.WadokeiPlatform.getSetting(SETTINGS_KEY);
    } else {
      raw = localStorage.getItem(SETTINGS_KEY);
    }
  } catch (e) {
    console.warn("⚠️ Failed to read settings:", e);
  }

  if (!raw) {
    return { ...DEFAULT_USER_SETTINGS };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_SETTINGS,
      ...parsed,
      showDayNight: parsed.showDayNight !== false,
      kanseiCorrection: parsed.kanseiCorrection !== false,
      showQuarterKokuLines: parsed.showQuarterKokuLines === true
    };
  } catch (e) {
    console.warn("⚠️ Invalid settings payload. Using defaults.", e);
    return { ...DEFAULT_USER_SETTINGS };
  }
}

async function saveUserSettings() {
  const payload = JSON.stringify(Wadokei.userSettings || DEFAULT_USER_SETTINGS);

  try {
    if (window.WadokeiPlatform?.setSetting) {
      await window.WadokeiPlatform.setSetting(SETTINGS_KEY, payload);
      return;
    }
    localStorage.setItem(SETTINGS_KEY, payload);
  } catch (e) {
    console.warn("⚠️ Failed to save settings:", e);
  }
}

function applySettingsToUI() {
  window.WadokeiPlatform?.applySettingsToUI?.({
    t,
    getSettings: () => Wadokei.userSettings
  });
}

function syncInfoPanelHeight() {
  window.WadokeiPlatform?.syncInfoPanelHeight?.();
}

function setupInfoPanelInteractions() {
  window.WadokeiPlatform?.setupInfoPanelInteractions?.({
    t,
    getSettings: () => Wadokei.userSettings,
    setSettings: (patch) => {
      Wadokei.userSettings = { ...Wadokei.userSettings, ...patch };
    },
    saveSettings: saveUserSettings,
    refreshLocale: () => {
      window.WadokeiPlatform?.refreshLocale?.(Wadokei.userSettings);
      window.WadokeiPlatform?.applyTranslations?.();
    },
    redraw: () => draw()
  });
}

/* 情報パネル描画
  * nowTime: Dateオブジェクト（現在日時）
  */
function drawInfoPanel(nowTime) {
  const { sunrise, sunset, ake, kure } = Wadokei.sun;

  // 表示用DOM
  const $datetime = document.getElementById('datetime');
  const $sekki = document.getElementById('sekki');
  const $timezone = document.getElementById('timezone');

  // タイムゾーン表示
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  $timezone.textContent = tz;

  // 現在日時 
  $datetime.textContent = formatDateTime(nowTime);

  // 日の出・日の入り時刻
  const sunriseStr = formatTime(new Date(sunrise));
  const sunsetStr = formatTime(new Date(sunset));

  //卯の正刻・酉の正刻表示
  const akeStr = formatTime(new Date(ake));
  const kureStr = formatTime(new Date(kure));

  // 24節気判定（terms.js の getSekki を使用）
  const sekki = getSekki(nowTime);
  const sekkiHeader = t("sekki.prefix", { index: sekki.index, name: sekki.name });
  $sekki.innerText = `${sekkiHeader}\n${t("sun.sunrise")}: ${sunriseStr}\n${t("sun.ake")}: ${akeStr}\n${t("sun.sunset")}: ${sunsetStr}\n${t("sun.kure")}: ${kureStr}`;

  syncInfoPanelHeight();

}
