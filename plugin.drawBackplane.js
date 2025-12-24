/**
 * 和時計の背景（文字盤）を描画するプラグイン
 *
 * 作成日: 2025-12-24
 * 著者: Tsutomu Hayashi
 *
 * 概要:
 *   和時計の盤面（背景）を Canvas 上に描画するプラグイン。
 *   盤面画像の描画、中心合わせ、スケール調整、回転補正などを担当する。
 *   針プラグインや暦プラグインより先に呼び出されることを前提とする。
 *
 * 機能:
 *   - 背景画像の描画（config.backgroundImage）
 *   - 盤面の中心合わせ（Canvas 中心に translate）
 *   - スケール調整（高 DPI や画像サイズ差に対応）
 *   - dialMode による盤面切り替え（標準盤・不定時法盤など）
 *
 * 注意:
 *   - 背景画像は Init 時にプリロードされ、Wadokei.backplane.loaded に格納される。
 *   - drawBackpanel() は画像ロード完了後にのみ描画される。
 *   - 画像は「中心が画像中央」でデザインされていることを前提とする。
 *
 * @param {CanvasRenderingContext2D} ctx - 描画先の Canvas コンテキスト
 * @param {number} radius - 時計の半径（Canvas.width / 2）
 * @param {Object} [opt] - オプション設定
 * @param {number} [opt.scale=1.0] - 背景画像のスケール倍率
 * @param {number} [opt.offsetX=0] - 中心補正（横方向）
 * @param {number} [opt.offsetY=0] - 中心補正（縦方向）
 * @returns {void}
 */

function InitDrawBackplane(config) {
    const img = new Image();
    img.src = config.backgroundImage || "brass_backpanel.webp";

    img.onload = () => {
        Wadokei.backplane.image = img;
        Wadokei.backplane.loaded = true;
        console.log("Backplane image loaded");
    };
}

configPromise.then(InitDrawBackplane);

function drawBackground(ctx, radius) {
    if (!Wadokei.backplane.loaded) return;

    ctx.save();
    try {
        // 円形クリッピング
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.clip();

        // 画像の縦横比を維持したまま、円より少し大きめに描く
        const w = Wadokei.backplane.image.width;
        const h = Wadokei.backplane.image.height;
        const aspect = w / h;

        let drawW, drawH;

        if (aspect > 1) {
            // 横長 → 高さ基準
            drawH = radius * 2 * 1.2; // ← 20%大きめ
            drawW = drawH * aspect;
        } else {
            // 縦長 → 幅基準
            drawW = radius * 2 * 1.2;
            drawH = drawW / aspect;
        }

        ctx.drawImage(Wadokei.backplane.image, -drawW / 2, -drawH / 2, drawW, drawH);

    } finally {
        ctx.restore();
    }
}

function drawDialWithAngles(angleMap, r) {
    for (const z in angleMap) {
        drawTextAtAngle(z, angleMap[z], r);
    }
}

function drawTextAtAngle(text, angle, r) {
    ctx.save();
    try {
        ctx.rotate(angle);
        ctx.translate(0, -r);
        ctx.font = "20pt 'Yu Mincho', serif";
        ctx.fillStyle = "#5c3317";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 0, 0);
    } finally {
        ctx.restore();
    }
}

// 漢数字（四〜九）を角度位置に描く
function drawNumberAtAngle(text, angle, r) {
    ctx.save();
    try {
        ctx.rotate(angle);
        ctx.translate(0, -r);
        ctx.font = "16pt 'Yu Mincho', serif";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 0, 0);
    } finally {
        ctx.restore();
    }
}

// 刻線（tick）を角度位置に描く
function drawTickAtAngle(angle, r1, r2) {
    ctx.save();
    try {
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -r1);
        ctx.lineTo(0, -r2);
        ctx.stroke();
    } finally {
        ctx.restore();
    }
}

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

function drawBackplane(ctx, radius) {
    const { dialMode, lat, lon } = Wadokei.config;
    const { sunrise, sunset } = Wadokei.sun;

    drawBackground(ctx, radius); // ← ここで背景を描画

    // -----------------------------
    // 昼の長さと寛政暦補正
    // -----------------------------

    const sunriseDate = new Date(sunrise);
    const sunsetDate = new Date(sunset);

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

    const diffAke = (sunriseDate - ake);
    const diffKure = (kure - sunsetDate);

    // 卯の正刻（明け六つ）
    const tU = sunrise - diffAke;

    // 酉の正刻（暮れ六つ）
    const tY = sunset + diffKure;

    // 昼の長さ（寛政暦補正後）
    const rDay = (tY - tU) / (24 * 3600 * 1000);
    const thetaDay = rDay * 2 * Math.PI;

    // 補正後の正午
    const trueNoonCorrected = tU + (tY - tU) / 2;

    // 今日の 12:00
    const noon = new Date(sunrise);
    noon.setHours(12, 0, 0, 0);
    const noonMs = noon.getTime();

    // ズレ（ミリ秒）
    const delta = trueNoonCorrected - noonMs;

    // 角度に変換（1日 = 2π）
    const tickShift = delta * (2 * Math.PI / 86400000);


    // -----------------------------
    // 干支角度（純粋幾何学）
    // -----------------------------
    const angle = {};

    // 絶対基準
    angle["午"] = 0;
    angle["子"] = Math.PI;

    // 卯・酉（昼の端）
    angle["卯"] = -thetaDay / 2;
    angle["酉"] = +thetaDay / 2;

    // 午→卯 の弧を、卯側から見て 3等分
    {
        const w1 = (angle["午"] - angle["卯"] + 2 * Math.PI) % (2 * Math.PI);
        angle["辰"] = (angle["卯"] + w1 / 3) % (2 * Math.PI);
        angle["巳"] = (angle["卯"] + 2 * w1 / 3) % (2 * Math.PI);
    }

    // 午→酉（未・申）はそのままで OK（午側から割っても順番が崩れない）
    {
        const w1 = (angle["酉"] - angle["午"] + 2 * Math.PI) % (2 * Math.PI);
        angle["未"] = (angle["午"] + w1 / 3) % (2 * Math.PI);
        angle["申"] = (angle["午"] + 2 * w1 / 3) % (2 * Math.PI);
    }

    // 酉→子 の弧を、酉側から見て 3等分（ここが戌亥）
    {
        const w2 = (angle["子"] - angle["酉"] + 2 * Math.PI) % (2 * Math.PI);
        angle["戌"] = (angle["酉"] + w2 / 3) % (2 * Math.PI);
        angle["亥"] = (angle["酉"] + 2 * w2 / 3) % (2 * Math.PI);
    }

    // 子→卯 の弧を、子側から見て 3等分（丑・寅）
    {
        const w3 = (angle["卯"] - angle["子"] + 2 * Math.PI) % (2 * Math.PI);
        angle["丑"] = (angle["子"] + w3 / 3) % (2 * Math.PI);
        angle["寅"] = (angle["子"] + 2 * w3 / 3) % (2 * Math.PI);
    }


    // -----------------------------
    // 刻線（境界）
    // -----------------------------
    // 干支の中心角 angle[...] はすでに計算済み

    // 刻線（開始角）は中心角の中点
    function mid(a, b) {
        let d = (b - a + 2 * Math.PI) % (2 * Math.PI);
        return (a + d / 2) % (2 * Math.PI);
    }

    const angleTick = [];

    // 卯の開始角（寅と卯の中点）
    angleTick.push(mid(angle["寅"], angle["卯"]));

    // 辰
    angleTick.push(mid(angle["卯"], angle["辰"]));

    // 巳
    angleTick.push(mid(angle["辰"], angle["巳"]));

    // 午
    angleTick.push(mid(angle["巳"], angle["午"]));

    // 未
    angleTick.push(mid(angle["午"], angle["未"]));

    // 申
    angleTick.push(mid(angle["未"], angle["申"]));

    // 酉
    angleTick.push(mid(angle["申"], angle["酉"]));

    // 戌
    angleTick.push(mid(angle["酉"], angle["戌"]));

    // 亥
    angleTick.push(mid(angle["戌"], angle["亥"]));

    // 子
    angleTick.push(mid(angle["亥"], angle["子"]));

    // 丑
    angleTick.push(mid(angle["子"], angle["丑"]));

    // 寅
    angleTick.push(mid(angle["丑"], angle["寅"]));

    // 翌卯（ループ閉じ）
    angleTick.push(angleTick[0] + 2 * Math.PI);


    // -----------------------------
    // dialMode（午上／子上）
    // -----------------------------
    let shift = 0;
    if (dialMode === "子上") {
        shift = Math.PI;
    }

    for (const z in angle) {
        angle[z] = (angle[z] + shift + 2 * Math.PI) % (2 * Math.PI);
    }
    for (let i = 0; i < angleTick.length; i++) {
        angleTick[i] = (angleTick[i] + shift + 2 * Math.PI) % (2 * Math.PI);
    }

    const angleU2 = angle["卯"];
    const angleY2 = angle["酉"];

    // -----------------------------
    // 描画
    // -----------------------------
    ctx.save();
    try {
        // 昼背景
        ctx.save();
        try {
            ctx.rotate(-Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius - 10, angleU2, angleY2);
            ctx.fillStyle = "rgba(255, 248, 220, 0.6)";
            ctx.fill();
        } finally { ctx.restore(); }

        // 夜背景
        ctx.save();
        try {
            ctx.rotate(-Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius - 10, angleY2, angleU2 + 2 * Math.PI);
            ctx.fillStyle = "rgba(230, 240, 255, 0.6)";
            ctx.fill();
        } finally { ctx.restore(); }

        // 干支
        for (const z in angle) {
            drawTextAtAngle(z, angle[z], radius - 40);
        }

        // 漢数字
        const zodiacOrder = [
            "卯", "辰", "巳", "午", "未", "申",
            "酉", "戌", "亥", "子", "丑", "寅"
        ];
        const clockNumbers = [ 
            “六”, “五”, “四”, “九”, “八”, “七”, 
            “六”, “五”, “四”, “九”, “八”, “七” ];

        for (let i = 0; i < 12; i++) {
            const z = zodiacOrder[i];
            drawNumberAtAngle(clockNumbers[i], angle[z], radius - 80);
        }

        // 刻線
        for (const a of angleTick) {
            drawTickAtAngle(a, radius - 60, radius - 20);
        }

        // 中央の丸
        ctx.save();
        try {
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, 2 * Math.PI);
            ctx.fillStyle = "#000";
            ctx.fill();
        } finally { ctx.restore(); }

    } finally {
        ctx.restore();
    }

    return {
        angleZodiac: angle,
        angleTick,
        shift: tickShift
    };
}