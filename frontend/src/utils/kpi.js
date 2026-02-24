export function getKpiCardTone(value, kind) {
    if (!Number.isFinite(value)) return "border-white/10";

    if (kind === "rate") {
        if (value >= 0.5) return "border-emerald-400/30";
        if (value >= 0.25) return "border-amber-400/30";
        return "border-rose-400/30";
    }

    return "border-white/10";
}