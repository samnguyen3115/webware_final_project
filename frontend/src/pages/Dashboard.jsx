// src/pages/Dashboard.jsx
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../App.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardControls from "../components/dashboard/DashboardControls";
import KpiCards from "../components/dashboard/KpiCards";
import ChartsSection from "../components/dashboard/ChartsSection";
import { useDashboardData } from "../hooks/useDashboardData";
import VoiceInput from "../components/VoiceInput.jsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { logout, user } = useContext(AuthContext) || {};
  const schoolId = user?.schoolId ?? 1;

  const {
    category,
    setCategory,
    loading,
    err,
    activityRows,
    enrollmentRows,
    schoolYearId,
    setSchoolYearId,
    availableYears,
    kpis,
    pipelineLineData,
    genderDoughnutData,
    enrollmentBarData,
    employeeStudentTeacherTrendData,
    employeeCategoriesPieData,
  } = useDashboardData({ schoolId });

  return (
    <div className="min-h-screen bg-white text-black">
      <DashboardHeader schoolId={schoolId} schoolYearId={schoolYearId} onLogout={logout} isAdmin={canOpenBenchmark} userRole={user?.role} />

      <main className="mx-auto px-20 py-6">
        <DashboardControls
          category={category}
          setCategory={setCategory}
          schoolYearId={schoolYearId}
          setSchoolYearId={setSchoolYearId}
          availableYears={availableYears}
          loading={loading}
          err={err}
          activityRowsCount={activityRows.length}
          enrollmentRowsCount={enrollmentRows.length}
        />




        <KpiCards kpis={kpis} />

        <ChartsSection
          category={category}
          pipelineLineData={pipelineLineData}
          genderDoughnutData={genderDoughnutData}
          enrollmentBarData={enrollmentBarData}
          employeeStudentTeacherTrendData={employeeStudentTeacherTrendData}
          employeeCategoriesPieData={employeeCategoriesPieData}
        />

      </main>
    </div>
  );
}