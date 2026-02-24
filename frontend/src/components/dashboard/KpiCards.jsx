// src/components/dashboard/KpiCards.jsx
import React from "react";

export default function KpiCards({ kpis }) {
    return (
        <section className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-black">High-level KPIs</h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {kpis.map((k) => (
                    <div key={k.label} className={`rounded-xl border ${k.tone} bg-gray-100 p-4`}>
                        <div className="text-xs font-medium text-gray-700">{k.label}</div>
                        <div className="mt-2 text-2xl font-semibold text-black">{k.valueText}</div>
                        <div className="mt-1 text-xs text-gray-600">{k.sub}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}