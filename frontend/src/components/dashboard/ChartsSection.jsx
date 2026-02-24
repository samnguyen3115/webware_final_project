// src/components/dashboard/ChartsSection.jsx
import React, { useMemo } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";

export default function ChartsSection({
    category,
    pipelineLineData,
    genderDoughnutData,
    enrollmentBarData,
}) {
    const chartOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#e5e7eb" } },
                tooltip: { enabled: true },
            },
            scales: {
                x: { ticks: { color: "#e5e7eb" }, grid: { color: "rgba(255,255,255,0.08)" } },
                y: { ticks: { color: "#e5e7eb" }, grid: { color: "rgba(255,255,255,0.08)" } },
            },
        }),
        []
    );

    const doughnutOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#e5e7eb" } },
            },
        }),
        []
    );

    return (
        <section className="grid gap-4 lg:grid-cols-2">
            {category === "Admissions" ? (
                <>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-2 flex items-baseline justify-between">
                            <h3 className="text-sm font-semibold">Admissions pipeline</h3>
                            <div className="text-xs text-slate-400">Derived from ADMISSION_ACTIVITY.csv</div>
                        </div>
                        <div className="h-72">
                            <Line data={pipelineLineData} options={chartOptions} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-2 flex items-baseline justify-between">
                            <h3 className="text-sm font-semibold">New enrollments by gender</h3>
                            <div className="text-xs text-slate-400">Derived from ADMISSION_ACTIVITY.csv</div>
                        </div>
                        <div className="h-72">
                            <Doughnut data={genderDoughnutData} options={doughnutOptions} />
                        </div>
                    </div>
                </>
            ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
                    <div className="mb-2 flex items-baseline justify-between">
                        <h3 className="text-sm font-semibold">Enrollment totals by type</h3>
                        <div className="text-xs text-slate-400">
                            Derived from ADMISSION_ACTIVITY_ENROLLMENT.csv
                        </div>
                    </div>
                    <div className="h-80">
                        <Bar data={enrollmentBarData} options={chartOptions} />
                    </div>
                </div>
            )}
        </section>
    );
}