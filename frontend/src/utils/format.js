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
    let sum = 0;
    let debugCount = 0;
    for (const r of rows) {
        const val = r[field];
        // Skip null, undefined, NaN, "NULL" string, and non-finite numbers
        if (val === null || val === undefined || val === "NULL" || !Number.isFinite(val)) {
            if (debugCount < 2) console.log(`DEBUG sumField skip - field: ${field}, val: ${val}, type: ${typeof val}`);
            debugCount++;
            continue;
        }
        sum += val;
    }
    if (rows.length > 0) {
        console.log(`DEBUG sumField(${field}): processed ${rows.length} rows, skipped ${debugCount}, total sum: ${sum}`);
    }
    return sum;
}