/* utils/taiyou.js
    * 太陽関連の計算ユーティリティ
    * SunCalcライブラリを使用
    * 備考: Wadokeiエンジンの一部として使用
    * 依存: SunCalc (https://github.com/mourner/suncalc)
    */

/* 天文データ計算
  * date: Dateオブジェクト（計算対象日時）
  */
function ComputeSunData(date) {
  const { lat, lon } = Wadokei.config;
  const calcDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const sunTimes = getSunTimes(calcDate, lat, lon);

  const sunrise = sunTimes.sunrise.getTime();
  const sunset = sunTimes.sunset.getTime();
  const Lday = sunset - sunrise;
  const trueNoon = sunrise + Lday / 2;

  // -----------------------------
  // 寛政暦補正：暁六つ（ake）と暮六つ（kure）
  // -----------------------------
  const targetAlt = -7.361 * Math.PI / 180;

  const ake = findAltitudeTime1min(
    new Date(sunrise - 60 * 60000),
    sunrise,
    targetAlt,
    lat, lon
  );

  const kure = findAltitudeTime1min(
    sunset,
    new Date(sunset + 60 * 60000),
    targetAlt,
    lat, lon
  );


  return { sunrise, sunset, Lday, trueNoon, ake, kure };
}


/*  日の出・日の入り時刻取得
  * date: Dateオブジェクト（計算対象日時）
  * lat: 緯度（度）
  * lon: 経度（度）
  * 戻り値: { sunrise: Date, sunset: Date }
  */
function getSunTimes(date, lat, lon) {
  const times = SunCalc.getTimes(date, lat, lon);
  return {
    sunrise: times.sunrise,
    sunset: times.sunset
  };
}

/*
    * 指定した太陽高度に最も近い時刻を1分刻みで探索する
*/
function findAltitudeTime1min(start, end, targetAlt, lat, lon) {
  let best = null;
  let bestDiff = Infinity;

  for (let t = new Date(start); t <= end; t = new Date(t.getTime() + 60000)) {
    const alt = SunCalc.getPosition(t, lat, lon).altitude;
    const diff = Math.abs(alt - targetAlt);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = new Date(t);
    }
  }
  return best;
}