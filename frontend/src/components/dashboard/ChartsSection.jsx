// src/components/dashboard/ChartsSection.jsx
import React, { useMemo } from "react";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";

export default function ChartsSection({
    category,
    pipelineLineData,
    genderDoughnutData,
    enrollmentBarData,
    employeeStudentTeacherTrendData,
    employeeCategoriesPieData,
}) {
    const chartOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#000000" } },
                tooltip: { enabled: true },
            },
            scales: {
                x: { ticks: { color: "#000000" }, grid: { color: "rgba(0,0,0,0.1)" } },
                y: { ticks: { color: "#000000" }, grid: { color: "rgba(0,0,0,0.1)" } },
            },
        }),
        []
    );

    const doughnutOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#000000" }, position: "right" },
                tooltip: { enabled: true },
            },
        }),
        []
    );

    const pieOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#000000" }, position: "right" },
                tooltip: { enabled: true },
            },
        }),
        []
    );

    return (
        <section className="grid gap-4 lg:grid-cols-2">
            {category === "Admissions" ? (
                <>
                    <div className="rounded-2xl border border-gray-400 bg-white p-4">
                        <div className="mb-2 flex items-baseline justify-between">
                            <h3 className="text-sm font-semibold text-black">Admissions pipeline</h3>
                            <div className="text-xs text-gray-600"></div>
                        </div>
                        <div className="h-72">
                            <Line data={pipelineLineData} options={chartOptions} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-400 bg-white p-4">
                        <div className="mb-2 flex items-baseline justify-between">
                            <h3 className="text-sm font-semibold text-black">New enrollments by gender</h3>
                            <div className="text-xs text-gray-600"></div>
                        </div>
                        <div className="h-72">
                            <Doughnut data={genderDoughnutData} options={doughnutOptions} />
                        </div>
                    </div>

                </>
            ) : category === "Employee" ? (
                <>
                    <div className="rounded-2xl border border-gray-400 bg-white p-4">
                        <div className="mb-2 flex items-baseline justify-between">
                            <h3 className="text-sm font-semibold text-black">Student-to-Teacher ratio growth by year</h3>
                            <div className="text-xs text-gray-600"></div>
                        </div>
                        <div className="h-72">
                            <Line data={employeeStudentTeacherTrendData} options={chartOptions} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-400 bg-white p-4">
                        <div className="mb-2 flex items-baseline justify-between">
                            <h3 className="text-sm font-semibold text-black">Employee categories distribution</h3>
                            <div className="text-xs text-gray-600"></div>
                        </div>
                        <div className="h-72">
                            <Pie data={employeeCategoriesPieData} options={pieOptions} />
                        </div>
                    </div>
                </>
            ) : (
                <div className="rounded-2xl border border-gray-400 bg-white p-4 lg:col-span-2">
                    <div className="mb-2 flex items-baseline justify-between">
                        <h3 className="text-sm font-semibold text-black">Enrollment totals by type</h3>
                        <div className="text-xs text-gray-600">
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