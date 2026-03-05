import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "../App.css";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import BenchmarkForm from "../components/BenchmarkForm";

export default function Benchmark() {
  const { logout, user } = useContext(AuthContext) || {};
  const schoolId = user?.schoolId ?? 1;
  const [benchmarkCategory, setBenchmarkCategory] = useState("Admissions"); // Admissions | Employee

  return (
    <div className="min-h-screen bg-white text-black">
      <DashboardHeader schoolId={schoolId} onLogout={logout} userRole={user?.role} />

      <main className="mx-auto px-4 py-6">
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => setBenchmarkCategory("Admissions")}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              benchmarkCategory === "Admissions"
                ? "bg-black text-white"
                : "border border-gray-400 bg-white text-black hover:bg-gray-100"
            }`}
          >
            Admissions Benchmark
          </button>
          <button
            onClick={() => setBenchmarkCategory("Employee")}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              benchmarkCategory === "Employee"
                ? "bg-black text-white"
                : "border border-gray-400 bg-white text-black hover:bg-gray-100"
            }`}
          >
            Employee Benchmark
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-4 text-center">{benchmarkCategory} Benchmark Form</h1>
        <div className="flex justify-center">
          <BenchmarkForm category={benchmarkCategory} />
        </div>
      </main>
    </div>
  );
}