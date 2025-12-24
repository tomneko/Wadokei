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


window.Wadokei = {
  config: {},
  sun: {},
  state: {},
  hand: {},
  backplane: {}
};

const canvas = document.getElementById("clock");
const ctx = canvas.getContext("2d");
const radius = canvas.width / 2;
ctx.translate(radius, radius);

function ComputeSunData(date) {
  const { lat, lon } = Wadokei.config;
  const sunTimes = getSunTimes(date, lat, lon);

  const sunrise = sunTimes.sunrise.getTime();
  const sunset = sunTimes.sunset.getTime();
  const Lday = sunset - sunrise;
  const trueNoon = sunrise + Lday / 2;

  Wadokei.sun = { sunrise, sunset, Lday, trueNoon };
}

function InitWadokei(config) {

  Wadokei.config = { ...config };
  ComputeSunData(new Date());

  startWadokei();

}

configPromise.then(InitWadokei);

function drawDial(labels, startAngle, totalAngle) {
  let step = totalAngle / labels.length;
  ctx.save();
  try {
    ctx.font = "20pt 'Yu Mincho', serif";
    ctx.fillStyle = "#5c3317";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < labels.length; i++) {
      let angle = startAngle + (i + 0.5) * step;
      drawRotatedText(labels[i], angle, radius - 40);
      // let x = Math.cos(angle) * (radius-40);
      // let y = Math.sin(angle) * (radius-40);
      // ctx.fillText(labels[i], x, y);
    }
  } finally {
    ctx.restore();
  }
}

function drawNumbers(labels, startAngle, totalAngle, innerRadius) {
  let step = totalAngle / labels.length;
  ctx.save();
  try {
    ctx.font = "16pt 'Yu Mincho', serif";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < labels.length; i++) {
      let angle = startAngle + (i + 0.5) * step;
      drawRotatedText(labels[i], angle, radius - 80);
      // let x = Math.cos(angle) * innerRadius;
      // let y = Math.sin(angle) * innerRadius;
      // ctx.fillText(labels[i], x, y);
    }
  } finally {
    ctx.restore();
  }
}

function drawTicks(startAngle, totalAngle, divisions, innerRadius, outerRadius) {
  let step = totalAngle / divisions;
  ctx.save();
  try {
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    // i=0を飛ばすことで境目の重複を防ぐ
    for (let i = 1; i <= divisions; i++) {
      let angle = startAngle + i * step;
      let x1 = Math.cos(angle) * outerRadius;
      let y1 = Math.sin(angle) * outerRadius;
      let x2 = Math.cos(angle) * innerRadius;
      let y2 = Math.sin(angle) * innerRadius;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  } finally {
    ctx.restore();
  }
}

function drawHand(angle, length, opt = {}) {
  const { scale = 0.4,
    offsetX = 0,
    offsetY = 0,
    tickShift = 0 } = opt;

  const acctualAngle = angle + tickShift;

  ctx.save();
  try {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(acctualAngle) * length, Math.sin(acctualAngle) * length);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000";
    ctx.stroke();
  } finally {
    ctx.restore();
  }
}

function drawBackplane(ctx, radius, opt) {
  const { startAngle, dayAngle, nightAngle } = opt;

  // 背景（昼）
  ctx.save();
  try {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius - 10, startAngle, startAngle + dayAngle);
    ctx.fillStyle = "#fff8dc";
    ctx.fill();
  } finally {
    ctx.restore();
  }

  // 背景（夜）
  ctx.save();
  try {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius - 10, startAngle + dayAngle, startAngle + 2 * Math.PI);
    ctx.fillStyle = "#e6f0ff";
    ctx.fill();
  } finally {
    ctx.restore();
  }

  // 外枠
  ctx.save();
  try {
    ctx.beginPath();
    ctx.arc(0, 0, radius - 10, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#5c3317";
    ctx.stroke();
  } finally {
    ctx.restore();
  }

  // 十二支
  const zodiacDay = ["卯", "辰", "巳", "午", "未", "申"];
  const zodiacNight = ["酉", "戌", "亥", "子", "丑", "寅"];
  drawDial(zodiacDay, startAngle, dayAngle);
  drawDial(zodiacNight, startAngle + dayAngle, nightAngle);

  // 四〜九
  const clockNumbers = ["四", "五", "六", "七", "八", "九"];
  drawNumbers(clockNumbers, startAngle, dayAngle, radius - 80);
  drawNumbers(clockNumbers, startAngle + dayAngle, nightAngle, radius - 80);

  // 境界線
  drawTicks(startAngle, dayAngle, 6, radius - 60, radius - 20);
  drawTicks(startAngle + dayAngle, nightAngle, 6, radius - 60, radius - 20);

  // 中央装飾
  ctx.save();
  try {
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "#000";
    ctx.fill();
  } finally {
    ctx.restore();
  }
  return { shift: 0 }; // ダミー
}

function drawClock(ctx, canvas, radius) {
  const { dialMode, calMode, lat, lon } = Wadokei.config;
  const { sunrise, sunset, Lday, trueNoon } = Wadokei.sun;

  ctx.setTransform(1, 0, 0, 1, 0, 0); // 座標系リセット
  ctx.globalAlpha = 1.0;             // ← これが超重要
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.translate(canvas.width / 2, canvas.height / 2);

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

function drawRotatedText(text, angle, radius, rotate = true, offsetAngle = 0) {
  ctx.save();
  let totalAngle = angle + offsetAngle;

  // 座標移動
  ctx.translate(Math.cos(totalAngle) * radius, Math.sin(totalAngle) * radius);

  // 回転する場合のみ
  if (rotate) {
    ctx.rotate(totalAngle + Math.PI / 2); // 放射方向に立てる
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 0);

  ctx.restore();
}

function loadPlugin(url) {
  return new Promise(resolve => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => resolve({ url, ok: true });
    script.onerror = () => resolve({ url, ok: false }); // ← 読み込み失敗でも resolve
    document.head.appendChild(script);
  });
}

function getSunTimes(date, lat, lon) {
  const times = SunCalc.getTimes(date, lat, lon);
  return {
    sunrise: times.sunrise,
    sunset: times.sunset
  };
}

// メイン関数
function startWadokei() {

  // プラグイン読み込み（Promise を返す）
  const pluginNames = [
    config.handPlugin,
    config.backplanePlugin,
    config.calendarPlugin
  ];

  // default を除外してロード
  const pluginLoads = Promise.all(
    pluginNames
      .filter(name => name && name !== "default")
      .map(name => loadPlugin(name))
  );

  // ここから先は「プラグイン読み込み後」に実行したい処理
  pluginLoads.then(results => {
    console.log("プラグイン読み込み結果:", results);

    // 初回描画
    draw();

    // 1秒ごとに更新
    setInterval(draw, 1000);
  });

  // ※ draw() はここでは呼ばない
  // ※ setInterval もここでは呼ばない

  // Canvas 初期化
  const canvas = document.getElementById('clock');
  const ctx = canvas.getContext('2d');

  // CSS の表示サイズを取得
  const displaySize = canvas.clientWidth;

  // 内部解像度を合わせる（高精細）
  canvas.width = displaySize * 2;
  canvas.height = displaySize * 2;

  // 座標系をスケール
  ctx.scale(2, 2);

  // 半径を再計算
  const radius = displaySize / 2;

  ctx.save();
  ctx.translate(radius, radius);
  ctx.restore();

  // 表示用DOM
  const $datetime = document.getElementById('datetime');
  const $sekki = document.getElementById('sekki');
  const $timezone = document.getElementById('timezone');

  // タイムゾーン表示
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  $timezone.textContent = tz;

  // 24時間制の日時フォーマット（JST）
  function formatDateTime(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const wnames = ['日', '月', '火', '水', '木', '金', '土'];
    return `${y}/${m}/${day} (${wnames[d.getDay()]}) ${hh}:${mm}:${ss}`;
  }

  // 和時計の描画（務さんのロジックを利用）
  function draw() {
    const { sunrise, sunset } = Wadokei.sun;

    // 日の出・日の入り再計算（1日1回実行）
    const nowTime = new Date();
    const today = nowTime.toDateString();

    if (Wadokei.state.lastSunCalcDate !== today) {
      ComputeSunData(nowTime);
      Wadokei.state.lastSunCalcDate = today;
    }

    drawClock(ctx, canvas, radius, config.dialMode); // 務さんの既存関数に合わせて呼び出し

    // 情報パネル更新
    $datetime.textContent = formatDateTime(nowTime);

    // 時刻を「HH:MM」形式に整形
    function formatTime(date) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

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

}
;