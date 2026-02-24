export function safeDiv(a, b) {
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
    return a / b;
}

export function formatPct(x) {
    if (!Number.isFinite(x)) return "—";
    return `${(x * 100).toFixed(1)}%`;
}

export function formatNum(x) {
    if (!Number.isFinite(x)) return "—";
    return Intl.NumberFormat().format(x);
}

export function sumField(rows, field) {
    return rows.reduce((acc, r) => acc + (Number.isFinite(r[field]) ? r[field] : 0), 0);
}