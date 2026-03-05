import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "../App.css";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import BenchmarkForm from "../components/BenchmarkForm";

export default function Benchmark() {
  const { logout, user } = useContext(AuthContext) || {};
  const schoolId = user?.schoolId ?? 1;
  const [benchmarkCategory, setBenchmarkCategory] = useState("Admissions");

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-black">
      <DashboardHeader schoolId={schoolId} onLogout={logout} isAdmin={user?.role === "admin"} userRole={user?.role} />

      <main className="w-full px-6 lg:px-10 py-6">
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={() => setBenchmarkCategory("Admissions")}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              benchmarkCategory === "Admissions"
                ? "bg-[#0F2D52] text-white"
                : "border border-gray-400 bg-white text-black hover:bg-gray-100"
            }`}
          >
            Admissions Benchmark
          </button>
          <button
            onClick={() => setBenchmarkCategory("Employee")}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              benchmarkCategory === "Employee"
                ? "bg-[#0F2D52] text-white"
                : "border border-gray-400 bg-white text-black hover:bg-gray-100"
            }`}
          >
            Employee Benchmark
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">{benchmarkCategory} Benchmark Form</h1>

        <BenchmarkForm category={benchmarkCategory} />
      </main>
    </div>
  );
}