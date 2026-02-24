import React from "react";
import { formatNum } from "../../utils/format";

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
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <label className="block text-xs font-medium text-slate-300">Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none"
                >
                    <option>Admissions</option>
                    <option>Enrollment</option>
                </select>
                <p className="mt-2 text-xs text-slate-400">
                    Admissions = pipeline + rates • Enrollment = totals by type
                </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <label className="block text-xs font-medium text-slate-300">Year (SCHOOL_YR_ID)</label>
                <select
                    value={Number.isFinite(schoolYearId) ? schoolYearId : ""}
                    onChange={(e) => setSchoolYearId(Number(e.target.value))}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none"
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
                <p className="mt-2 text-xs text-slate-400">
                    This dataset uses SCHOOL_YR_ID as the year key.
                </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <label className="block text-xs font-medium text-slate-300">Status</label>
                <div className="mt-2 text-sm text-slate-200">{loading ? "Loading CSVs…" : err ? "Error" : "Ready"}</div>
                {err ? <div className="mt-2 text-xs text-rose-300">{err}</div> : null}
                {!err && !loading ? (
                    <div className="mt-2 text-xs text-slate-400">
                        Rows: {formatNum(activityRowsCount)} activity • {formatNum(enrollmentRowsCount)} enrollment
                    </div>
                ) : null}
            </div>
        </div>
    );
}