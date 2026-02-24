export function parseCsv(text) {
    const rows = [];
    let i = 0;
    let cur = "";
    let row = [];
    let inQuotes = false;

    const pushCell = () => {
        row.push(cur);
        cur = "";
    };

    const pushRow = () => {
        if (row.length === 1 && row[0] === "") return; // ignore empty trailing line
        rows.push(row);
        row = [];
    };

    while (i < text.length) {
        const c = text[i];

        if (c === '"') {
            // escaped quote
            if (inQuotes && text[i + 1] === '"') {
                cur += '"';
                i += 2;
                continue;
            }
            inQuotes = !inQuotes;
            i += 1;
            continue;
        }

        if (!inQuotes && (c === "," || c === "\n" || c === "\r")) {
            pushCell();

            // new line (handle \r\n)
            if (c === "\n" || c === "\r") {
                pushRow();
                if (c === "\r" && text[i + 1] === "\n") i += 1;
            }

            i += 1;
            continue;
        }

        cur += c;
        i += 1;
    }

    pushCell();
    pushRow();

    const headers = rows[0].map((h) => h.trim());
    const dataRows = rows.slice(1);

    const toNumberOrString = (v) => {
        const t = (v ?? "").trim();
        if (t === "" || t.toLowerCase() === "nan" || t.toLowerCase() === "null") return null;
        const n = Number(t);
        return Number.isFinite(n) ? n : t;
    };

    return dataRows.map((r) => {
        const obj = {};
        headers.forEach((h, idx) => {
            obj[h] = toNumberOrString(r[idx] ?? "");
        });
        return obj;
    });
}