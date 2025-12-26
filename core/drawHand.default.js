/**
 * 標準の時計針を描画するプラグイン（デフォルト設定）
 *
 * 作成日: 2025-12-26
 * 著者: Tsutomu Hayashi
 *
 * 概要:
 *   和時計の針をシンプルな線で描画する標準プラグイン。
 *   文字盤調整後の正午シフトにに対応。
 *
 * @param {number} angle - 針の角度（ラジアン、0=右方向、反時計回り）
 * @param {number} length - 針の長さ（ピクセル）
 * @returns {void}
 */

function InitDrawHand(config) {
    // 初期化処理は特に無し
}

configPromise.then(InitDrawHand);

/* 針描画（簡易版）
  *
  * angle: 針の角度（ラジアン）
  * length: 針の長さ（ピクセル）
  * opt: オプションオブジェクト
  *   - scale: 針の大きさ調整（未使用）
  *   - offsetX: 中心補正（横）
  *   - offsetY: 中心補正（縦）
  *   - tickShift: 刻線補正角度（ラジアン）
  */
function drawHand(angle, length, opt = {}) {
    const { scale = 0.4,
        offsetX = 0,
        offsetY = 0,
        tickShift = 0 } = opt;
    const ctx = Wadokei.ctx;

    const acctualAngle = angle + tickShift + Math.PI / 2;

    ctx.save();
    try {
        ctx.rotate(acctualAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, length);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000";
        ctx.stroke();
    } finally {
        ctx.restore();
    }
}