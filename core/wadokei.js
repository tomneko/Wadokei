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
  backplane: {}
};

/* 和時計初期化
  * config: 設定オブジェクト
  * consts: 定数オブジェクト
  */
function InitWadokei(config, consts) {

  Wadokei.consts = { ...consts };
  Wadokei.config = { ...config };

  Wadokei.sun = ComputeSunData(new Date());

  startWadokei();

}

/*  設定・定数読み込みと初期化
  */
Promise.allSettled([configPromise, constsPromise])
  .then(results => {
    const [configRes, constsRes] = results;

    if (configRes.status !== "fulfilled") {
      return showErrorMessage("config.json の読み込みに失敗しました。");
    }
    if (constsRes.status !== "fulfilled") {
      return showErrorMessage("consts.json の読み込みに失敗しました。");
    }

    InitWadokei(configRes.value, constsRes.value);
  });


/* 針描画（簡易版）はプラグインへ移動しました */

/* 盤面描画（簡易版）はプラグインへ移動しました */

/* 和時計描画
  */
function drawClock() {
  const { dialMode, calMode, lat, lon } = Wadokei.config;
  const { sunrise, sunset, Lday, trueNoon } = Wadokei.sun;
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

  // 昼夜長の計算
  let dayLength = sunset - sunrise;
  let nightLength = (sunrise + 24 * 3600 * 1000) - sunset;

  let dayAngle = (dayLength / (dayLength + nightLength)) * 2 * Math.PI;
  let nightAngle = 2 * Math.PI - dayAngle;

  // sunrise は number（ミリ秒）なので Date に戻す
  let sunriseDate = new Date(sunrise);

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
    sunset
  });
  const tickShift = bp.shift;

  // 針の角度計算
  let now = new Date();
  let seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  let angle = (seconds / 86400) * 2 * Math.PI;

  if (dialMode === "午上") {
    angle += Math.PI / 2;
  } else {
    angle -= Math.PI / 2;
  }

  drawHand(angle, radius - 60, {
    scale: 0.4,
    offsetX: 0,
    offsetY: 0,
    tickShift: tickShift
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
  console.log(`UI Scale: ${Wadokei.uiScale}`);

  // 日の出・日の入り再計算（1日1回実行）
  const nowTime = new Date();
  const today = nowTime.toDateString();

  if (Wadokei.state.lastSunCalcDate !== today) {
    ComputeSunData(nowTime);
    Wadokei.state.lastSunCalcDate = today;
  }

  // 描画処理引数は全てWadokeiから取得
  drawClock();

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
    handPlugin = Wadokei.consts.defaultHand;
  } else {
    handPlugin = Wadokei.consts.pluginDir + handPlugin;
  }

  let backplanePlugin = Wadokei.config.backplanePlugin;
  if (!backplanePlugin || backplanePlugin === "default") {
    backplanePlugin = Wadokei.consts.defaultBackplane;
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

/* 情報パネル描画
  * nowTime: Dateオブジェクト（現在日時）
  */
function drawInfoPanel(nowTime) {
  const { sunrise, sunset } = Wadokei.sun;

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

  // 24節気判定（terms.js の getSekki を使用）
  const sekki = getSekki(nowTime);
  // 例: { index: 4, name: '春分', next: Date }
  $sekki.textContent = `第${sekki.index}節 ${sekki.name}`;
  // 二十四節気の表示に追加
  $sekki.innerText = `第${sekki.index}節 ${sekki.name}\n日の出: ${sunriseStr}\n日の入り: ${sunsetStr}`;

}
;