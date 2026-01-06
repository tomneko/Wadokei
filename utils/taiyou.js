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

  return { sunrise, sunset, Lday, trueNoon };
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