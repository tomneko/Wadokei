
// 時刻を「HH:MM」形式に整形
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


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