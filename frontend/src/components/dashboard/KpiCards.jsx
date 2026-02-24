// src/components/dashboard/KpiCards.jsx
import React from "react";

export default function KpiCards({ kpis }) {
    return (
        <section className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-200">High-level KPIs</h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {kpis.map((k) => (
                    <div key={k.label} className={`rounded-xl border ${k.tone} bg-white/5 p-4`}>
                        <div className="text-xs font-medium text-slate-300">{k.label}</div>
                        <div className="mt-2 text-2xl font-semibold">{k.valueText}</div>
                        <div className="mt-1 text-xs text-slate-400">{k.sub}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}