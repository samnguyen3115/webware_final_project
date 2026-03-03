import React from "react";
import { formatNum } from "../../utils/format";
import { Link } from "react-router-dom"; //i added
export default function DashboardControls({
    category,
    setCategory,
    schoolYearId,
    setSchoolYearId,
    availableYears,
    loading,
    err,
    activityRowsCount,
    enrollmentRowsCount,
}) {
    return (
        <div className="mb-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-gray-400 bg-white p-4">
                <label className="block text-xs font-medium text-gray-700">Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none"
                >
                    <option>Admissions</option>
                </select>
                <p className="mt-2 text-xs text-gray-600">
                </p>
            </div>

            <div className="rounded-xl border border-gray-400 bg-white p-4">
                <label className="block text-xs font-medium text-gray-700">Year</label>
                <select
                    value={Number.isFinite(schoolYearId) ? schoolYearId : ""}
                    onChange={(e) => setSchoolYearId(Number(e.target.value))}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none"
                    disabled={loading || availableYears.length === 0}
                >
                    {availableYears.length === 0 ? (
                        <option value="">No years found</option>
                    ) : (
                        availableYears.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))
                    )}
                </select>
                <p className="mt-2 text-xs text-gray-600">
                </p>
            </div>

            <div className="rounded-xl border border-gray-400 bg-white p-4">
                <label className="block text-xs font-medium text-gray-700">Data status</label>
                <div className="mt-2 text-sm text-black">{loading ? "Loading API data…" : err ? "Error" : "Ready"}</div>
                {err ? <div className="mt-2 text-xs text-black">{err}</div> : null}
                {!err && !loading ? (
                    <div className="mt-2 text-xs text-gray-600">
                        Rows: {formatNum(activityRowsCount)} activity • {formatNum(enrollmentRowsCount)} enrollment
                    </div>
                ) : null}
            </div>
            {/*Benchmark Form */}
             <div className="rounded-xl border border-gray-400 bg-white p-4 flex items-center justify-center">
                <Link
                    to="/benchmark"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                    Open Benchmark Form
                </Link>
        </div>
        </div>
    );
}