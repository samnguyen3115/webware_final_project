export function getKpiCardTone(value, kind) {
    if (!Number.isFinite(value)) return "border-gray-400/50";

    if (kind === "rate") {
        if (value >= 0.5) return "border-black/50";
        if (value >= 0.25) return "border-gray-500/50";
        return "border-gray-600/50";
    }

    return "border-gray-400/50";
}