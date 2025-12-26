/* 盤面描画（簡易版）
  * ctx: CanvasRenderingContext2D
  * radius: 盤面半径（ピクセル）
  * opt: オプションオブジェクト
  *  - startAngle: 盤面開始角度（ラジアン）
  * - dayAngle: 昼部分の角度（ラジアン）
  * - nightAngle: 夜部分の角度（ラジアン）
  */
function drawBackplane(ctx, radius, opt) {
    const { startAngle, dayAngle, nightAngle } = opt;

    // 背景（昼）
    ctx.save();
    try {
        ctx.rotate(-Math.PI / 2);
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
        ctx.rotate(-Math.PI / 2);
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
    const clockNumbers = ["六", "五", "四", "九", "八", "七"];
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

/*  十二支描画
  * labels: 描画する文字列配列
  * startAngle: 描画開始角度（ラジアン）
  * totalAngle: 描画範囲角度（ラジアン）   
  */
function drawDial(labels, startAngle, totalAngle) {
    let step = totalAngle / labels.length;
    const ctx = Wadokei.ctx;
    const radius = Wadokei.radius;

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

/*  四〜九の漢数字を描く
  * labels: 描画する文字列配列
  * startAngle: 描画開始角度（ラジアン）
  * totalAngle: 描画範囲角度（ラジアン）
  * innerRadius: 文字列の内側半径（ピクセル）
  */
function drawNumbers(labels, startAngle, totalAngle, innerRadius) {
    let step = totalAngle / labels.length;
    const ctx = Wadokei.ctx;
    const radius = Wadokei.radius;

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

/*  刻線描画
 *
 *  startAngle: 刻線開始角度（ラジアン）  
 */
function drawTicks(startAngle, totalAngle, divisions, innerRadius, outerRadius) {
    let step = totalAngle / divisions;
    const ctx = Wadokei.ctx;
    const radius = Wadokei.radius;

    ctx.save();
    try {
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 2;
        // i=0を飛ばすことで境目の重複を防ぐ
        for (let i = 1; i <= divisions; i++) {
            let angle = (startAngle - Math.PI / 2 + i * step) % (2 * Math.PI);
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

/*  回転文字列描画
  * text: 描画文字列
  * angle: 角度（ラジアン）
  * radius: 半径（ピクセル）
  * rotate: 回転するかどうか（デフォルト true）
  * offsetAngle: 追加角度オフセット（ラジアン、デフォルト0）
  */
function drawRotatedText(text, angle, radius, rotate = true, offsetAngle = 0) {
    const ctx = Wadokei.ctx;
    let totalAngle = angle + offsetAngle;
    ctx.save();
    try {
        // 座標移動
        ctx.rotate(-Math.PI / 2);
        ctx.translate(Math.cos(totalAngle) * radius, Math.sin(totalAngle) * radius);

        // 回転する場合のみ
        if (rotate) {
            ctx.rotate(totalAngle + Math.PI / 2); // 放射方向に立てる
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 0, 0);
    } finally {
        ctx.restore();
    }
}