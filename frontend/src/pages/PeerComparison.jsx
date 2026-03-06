import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { useDashboardData } from "../hooks/useDashboardData";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function PeerComparison() {
  const { logout, user } = useContext(AuthContext) || {};
  const schoolId = user?.schoolId ?? 1;

  const {
    category,
    setCategory,
    schoolYearId,
    setSchoolYearId,
    availableYears,
    peerGroup,
    setPeerGroup,
    peerGroupOptions,
    peerComparison,
    peerLoading,
    peerErr,
    peerComparisonBarData,
    peerStats,
  } = useDashboardData({ schoolId });

  const chartOptions = {
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
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <DashboardHeader schoolId={schoolId} schoolYearId={schoolYearId} onLogout={logout} isAdmin={user?.role === "admin"} userRole={user?.role} />

      <main className="mx-auto px-20 py-6">
        <section className="mb-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-gray-400 bg-white p-4">
            <label className="block text-xs font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none"
            >
              <option>Admissions</option>
              <option>Employee</option>
            </select>
          </div>

          <div className="rounded-xl border border-gray-400 bg-white p-4">
            <label className="block text-xs font-medium text-gray-700">Year</label>
            <select
              value={Number.isFinite(schoolYearId) ? schoolYearId : ""}
              onChange={(e) => setSchoolYearId(Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none"
              disabled={availableYears.length === 0}
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
          </div>

          <div className="rounded-xl border border-gray-400 bg-white p-4">
            <label className="block text-xs font-medium text-gray-700">Peer group</label>
            <select
              value={peerGroup}
              onChange={(e) => setPeerGroup(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none"
              disabled={peerGroupOptions.length === 0}
            >
              {peerGroupOptions.length === 0 ? (
                <option value="all_schools">All Schools</option>
              ) : (
                peerGroupOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-400 bg-white p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-black">Your school vs peer average</h3>
            <div className="text-xs text-gray-600">{peerComparison?.peerGroupLabel ?? "Peer comparison"}</div>
          </div>

          {peerLoading ? (
            <div className="h-80 flex items-center justify-center text-sm text-gray-600">Loading peer comparison…</div>
          ) : peerErr ? (
            <div className="h-80 flex items-center justify-center text-sm text-black">{peerErr}</div>
          ) : peerComparison?.privacy?.isRedacted ? (
            <div className="h-80 flex flex-col items-center justify-center text-sm text-gray-700 gap-2">
              <div>{peerComparison?.message ?? "Peer metrics are hidden for privacy."}</div>
              <div className="text-xs text-gray-600">Peer schools found: {peerComparison?.peerSchoolCount ?? 0}</div>
            </div>
          ) : (
            <>
              <div className="h-80">
                <Bar data={peerComparisonBarData} options={chartOptions} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {peerStats.map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-gray-300 bg-gray-100 p-3">
                    <div className="text-xs font-medium text-gray-700">{stat.label}</div>
                    <div className="mt-1 text-lg font-semibold text-black">{stat.valueText}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-600">
                Peer schools included: {peerComparison?.peerSchoolCount ?? 0}. Individual peer identities and raw records are hidden.
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
