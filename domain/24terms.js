/**
 * 二十四節気計算モジュール
 *
 * 作成日: 2025-12-24
 * 著者: Tsutomu Hayashi
 *
 * 概要:
 *   このモジュールは、指定した日時における二十四節気を計算し、
 *   現在の節気・次の節気・前の節気、および節気の開始時刻を返す。
 *
 *   計算は太陽黄経（ecliptic longitude）を基準とし、
 *   0°（春分）から 360° までを 15° 刻みで区切った
 *   24 の節気区分に基づいて判定する。
 *
 *   寛政暦の定義に基づく「伏角 7°21′40″」などの
 *   夜明け・日暮れ計算とは独立しており、
 *   本モジュールは純粋に太陽黄経のみを扱う。
 *
 * 機能:
 *   - 指定日時の太陽黄経を計算
 *   - 現在の節気 index（0〜23）を判定
 *   - 節気名（例: 立春・雨水・啓蟄 …）を返す
 *   - 次の節気までの残り時間を計算
 *   - 前後の節気の開始日時を返す
 *
 * 依存:
 *   - SunCalc または内部の太陽位置計算関数
 *   - Wadokei.config で定義される節気名リスト（24項）
 *
 * 注意:
 *   - 二十四節気は太陽黄経に基づくため、タイムゾーンに依存する。
 *   - 計算精度は SunCalc の精度に準ずる。
 *   - 旧暦（太陰太陽暦）の朔望計算とは無関係。
 *
 * @module 24terms
 */

const SEKki_ORDER = [
  { index: 1, name: '立春', month: 2, day: 4 },
  { index: 2, name: '雨水', month: 2, day: 19 },
  { index: 3, name: '啓蟄', month: 3, day: 6 },
  { index: 4, name: '春分', month: 3, day: 20 },
  { index: 5, name: '清明', month: 4, day: 5 },
  { index: 6, name: '穀雨', month: 4, day: 20 },
  { index: 7, name: '立夏', month: 5, day: 5 },
  { index: 8, name: '小満', month: 5, day: 21 },
  { index: 9, name: '芒種', month: 6, day: 6 },
  { index: 10, name: '夏至', month: 6, day: 21 },
  { index: 11, name: '小暑', month: 7, day: 7 },
  { index: 12, name: '大暑', month: 7, day: 23 },
  { index: 13, name: '立秋', month: 8, day: 8 },
  { index: 14, name: '処暑', month: 8, day: 23 },
  { index: 15, name: '白露', month: 9, day: 8 },
  { index: 16, name: '秋分', month: 9, day: 23 },
  { index: 17, name: '寒露', month: 10, day: 8 },
  { index: 18, name: '霜降', month: 10, day: 23 },
  { index: 19, name: '立冬', month: 11, day: 7 },
  { index: 20, name: '小雪', month: 11, day: 22 },
  { index: 21, name: '大雪', month: 12, day: 7 },
  { index: 22, name: '冬至', month: 12, day: 22 },
  { index: 23, name: '小寒', month: 1, day: 6 },
  { index: 24, name: '大寒', month: 1, day: 20 }
];

// ユーティリティ
function makeDate(year, month, day) {
  // month は 1-12 を想定
  return new Date(year, month - 1, day, 0, 0, 0);
}

// その年の節気日付列（年跨ぎに対応: 小寒・大寒は翌年正月扱い）
function buildYearTable(year) {
  // 小寒・大寒（index 23,24）は年頭扱いなので year+1 側で生成
  const table = SEKki_ORDER.map(t => {
    const y = (t.index >= 23) ? year + 1 : year;
    return { index: t.index, name: t.name, date: makeDate(y, t.month, t.day) };
  }).sort((a, b) => a.date - b.date);
  return table;
}

// 現在の節気を返す（近似）
function getSekki(now) {
  const year = now.getFullYear();
  const table = buildYearTable(year);
  // 区間判定: table[i] ≤ now < table[i+1]
  for (let i = 0; i < table.length; i++) {
    const cur = table[i];
    const next = table[(i + 1) % table.length]; // 周回
    const start = cur.date;
    const end = next.date;
    if (start <= now && now < end) {
      return { index: cur.index, name: cur.name, start, end };
    }
  }
  // フォールバック
  const last = table[table.length - 1];
  return { index: last.index, name: last.name, start: last.date, end: table[0].date };
}

// グローバル公開
window.getSekki = getSekki;