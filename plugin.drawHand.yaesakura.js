/**
 * 八重桜の針画像を使って針を描画するプラグイン
 *
 * 作成日: 2025-12-24
 * 著者: Tsutomu Hayashi
 *
 * 概要:
 *   和時計の針をデザイン画像で描画するプラグイン。
 *   画像は「右向き」「中心が画像中央」で作成すること。
 *   正午シフト（文字盤調整後）に対応。
 *
 * @param {number} angle - 針の角度（ラジアン、0=右方向、反時計回り）
 * @param {number} length - 針の長さ（未使用）
 * @param {Object} [opt] - オプション設定
 * @param {number} [opt.scale=0.4] - 針のスケール倍率
 * @param {number} [opt.offsetX=0] - 中心補正（横方向）
 * @param {number} [opt.offsetY=0] - 中心補正（縦方向）
 * @param {number} [opt.tickShift=0] - 刻線補正角度（ラジアン）
 * @returns {void}
 */


function InitDrawHand(config) {
  const img = new Image();
  img.src = config.handImage || 'yaesakura.webp';

  img.onload = () => {
    Wadokei.hand.image = img;
    Wadokei.hand.loaded = true;
    console.log("Hand image loaded");
    console.log(`Hand image size: ${img.width} x ${img.height} pixels`);
  };
}

configPromise.then(InitDrawHand);

function drawHand(angle, length, opt = {}) {
  const {
    // scale = 0.4,     // 針の大きさ調整
    offsetX = 0,     // 中心補正（横）
    offsetY = 0,      // 中心補正（縦）
    tickShift = 0    // 刻線補正（未使用）
  } = opt;
  if (!Wadokei.hand.loaded) return;
  const handImage = Wadokei.hand.image;
  const canvasSize = Wadokei.canvas.clientWidth; // CSSで決まった表示サイズ
  Wadokei.hand.scale = canvasSize / Math.max(handImage.width, handImage.height);
  console.log(`Recommended scale factor: ${Wadokei.hand.scale.toFixed(3)}`);
  const scale = Wadokei.hand.scale || 0.4;

  const ctx = Wadokei.ctx;

  const cx = 0;//canvas.width / 2;
  const cy = 0;//canvas.height / 2;

  // 針の角度に正午補正を加える
  const actualAngle = angle + tickShift;

  ctx.save();
  try {
    ctx.globalAlpha = 1.0;              // ← drawImage の前に必須
    ctx.globalCompositeOperation = "source-over";
    ctx.imageSmoothingEnabled = true;



    // 時計の中心へ移動
    ctx.translate(cx + offsetX, cy + offsetY);

    ctx.rotate(actualAngle);          // 角度だけ回転
    ctx.scale(scale, scale);    // 必要ならスケール

    // 画像の中心を原点に合わせて描画
    ctx.drawImage(
      handImage,
      -handImage.width / 2,
      -handImage.height / 2
    );
  } finally {
    ctx.restore();
  }
}

