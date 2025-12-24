/**
 * 標準の時計針を描画するプラグイン（初期バージョン）
 *
 * 作成日: 2025-12-19
 * 著者: Tsutomu Hayashi
 *
 * 概要:
 *   和時計の針をシンプルな図形で描画する標準プラグイン。
 *   針はやや太めにデザインされており、視認性を重視。
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

// 時計の針を描画する関数
function drawHand(angle, length, opt = {}) {
  const {
    baseWidth = 24,          // 針の基部の太さ
    tipWidth = 8,           // 針の先端の太さ
    colorMain = '#2b2b2b',  // 本体の色
    colorEdge = '#5a4a35',  // 縁の色
    highlight = 'rgba(255,255,255,0.35)', // 光沢ライン
    shadow = 'rgba(0,0,0,0.35)',          // 影
    glow = 'rgba(255,255,200,0.08)',       // 外側の輝き
    tickShift = 0  // 刻線補正角度（ラジアン）
  } = opt;

  ctx.save();
  try {
    ctx.rotate(angle + tickShift);

    // 外側のぼんやりした輝き
    const glowGrad = ctx.createRadialGradient(0, 0, length * 0.2, 0, 0, length);
    glowGrad.addColorStop(0, 'transparent');
    glowGrad.addColorStop(1, glow);
    ctx.strokeStyle = glowGrad;
    ctx.lineWidth = baseWidth * 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();

    // 本体のグラデーション
    const bodyGrad = ctx.createLinearGradient(0, -baseWidth / 2, 0, baseWidth / 2);
    bodyGrad.addColorStop(0, colorEdge);
    bodyGrad.addColorStop(0.5, colorMain);
    bodyGrad.addColorStop(1, colorEdge);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = bodyGrad;
    ctx.lineWidth = baseWidth;
    ctx.shadowColor = shadow;
    ctx.shadowBlur = 6;

    //   ctx.beginPath();
    //   ctx.moveTo(-length*0.08, 0); // 根元の少し後ろ
    //   ctx.lineTo(length*0.88, 0);  // 先端手前まで
    //   ctx.stroke();

    // 円錐状の針本体
    ctx.shadowColor = shadow;
    ctx.shadowBlur = 6;
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();

    // 根元（少し細く）
    const root = baseWidth * 0.75;

    // 中央のふくらみ
    const mid = baseWidth * 1.1;

    // 先端側の辺の長さ
    const len1 = Math.sqrt((0.4 * length) ** 2 + (tipWidth / 2) ** 2);
    const x = Math.sqrt((length * 0.88 - len1) ** 2 - (tipWidth / 2) ** 2);
    const tipBase = 0.4 * length + x;

    // 左側の輪郭
    ctx.moveTo(0, -root / 2);
    ctx.lineTo(length * 0.4, -mid / 2);
    ctx.lineTo(tipBase, -tipWidth / 2);

    // 右側の輪郭
    ctx.lineTo(tipBase, tipWidth / 2);
    ctx.lineTo(length * 0.4, mid / 2);
    ctx.lineTo(0, root / 2);

    ctx.closePath();
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // 先端の三角形
    ctx.shadowBlur = 0;
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(length * 0.88, -tipWidth);
    ctx.lineTo(length, 0);
    ctx.lineTo(length * 0.88, tipWidth);
    ctx.closePath();
    ctx.fill();

    // 光沢ライン
    ctx.strokeStyle = highlight;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(length * 0.1, -1);
    ctx.lineTo(length * 0.8, -1);
    ctx.stroke();

    // 根元の丸（ボス）
    ctx.beginPath();
    ctx.fillStyle = bodyGrad;  // 針と同じグラデーションでもOK
    ctx.arc(0, 0, root * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // 光沢ラインのハイライト
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.2;
    ctx.arc(0, 0, root * 0.7, -Math.PI * 0.2, Math.PI * 0.1);
    ctx.stroke();
  } finally {
    ctx.restore();
  }
}
