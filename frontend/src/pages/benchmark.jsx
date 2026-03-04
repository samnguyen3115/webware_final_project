import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../App.css";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import BenchmarkForm from "../components/BenchmarkForm";

export default function Benchmark() {
  const { logout, user } = useContext(AuthContext) || {};
  const schoolId = user?.schoolId ?? 1;

  return (
    <div className="min-h-screen bg-white text-black">
      <DashboardHeader schoolId={schoolId} onLogout={logout} />

      <main className="mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Benchmark Form</h1>
        <BenchmarkForm />
      </main>
    </div>
  );
}