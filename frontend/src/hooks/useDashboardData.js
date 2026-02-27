import { useEffect, useMemo, useState } from "react";
import { formatNum, formatPct, safeDiv, sumField } from "../utils/format";
import { getKpiCardTone } from "../utils/kpi";

export function useDashboardData({ schoolId }) {
    const [category, setCategory] = useState("Admissions"); // Admissions | Enrollment
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [activityRows, setActivityRows] = useState([]);
    const [enrollmentRows, setEnrollmentRows] = useState([]);
    const [socRows, setSOCRows] = useState([]);
    const [schoolYearId, setSchoolYearId] = useState(null);

    useEffect(() => {
        let alive = true;

        async function load() {
            setLoading(true);
            setErr("");

            try {
                // Get JWT token from localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No authentication token found");
                }

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // Fetch data from API - middleware ensures user only gets their school's data
                const activityRes = await fetch("http://localhost:5000/api/admission/activity", { headers });
                if (!activityRes.ok) throw new Error(`Activity fetch failed: ${activityRes.status}`);
                const a = await activityRes.json();

                const enrollmentRes = await fetch("http://localhost:5000/api/admission/enrollment", { headers });
                if (!enrollmentRes.ok) throw new Error(`Enrollment fetch failed: ${enrollmentRes.status}`);
                const e = await enrollmentRes.json();

                const socRes = await fetch("http://localhost:5000/api/admission/activity-soc", { headers });
                if (!socRes.ok) throw new Error(`SOC fetch failed: ${socRes.status}`);
                const s = await socRes.json();

                if (!alive) return undefined;

                // Convert MongoDB documents to match expected format
                const activityData = Array.isArray(a) ? a : [];
                const enrollmentData = Array.isArray(e) ? e : [];
                const socData = Array.isArray(s) ? s : [];

                setActivityRows(activityData);
                setEnrollmentRows(enrollmentData);
                setSOCRows(socData);

                // Get available school years from ALL collections
                const allYears = new Set();
                activityData.forEach(r => {
                    if (Number.isFinite(r.SCHOOL_YR_ID)) allYears.add(r.SCHOOL_YR_ID);
                });
                enrollmentData.forEach(r => {
                    if (Number.isFinite(r.SCHOOL_YR_ID)) allYears.add(r.SCHOOL_YR_ID);
                });
                socData.forEach(r => {
                    if (Number.isFinite(r.SCHOOL_YR_ID)) allYears.add(r.SCHOOL_YR_ID);
                });
                
                const years = Array.from(allYears).sort((x, y) => x - y);
                setSchoolYearId((prev) => prev ?? years[years.length - 1] ?? null);
            } catch (e2) {
                if (alive) {
                    setErr(e2?.message || "Failed to load dashboard data");
                }
            } finally {
                if (alive) {
                    setLoading(false);
                }
            }
        }

        load();
        return () => {
            alive = false;
        };
    }, [schoolId]);

    const availableYears = useMemo(() => {
        const allYears = new Set();
        activityRows.forEach(r => {
            if (Number.isFinite(r.SCHOOL_YR_ID)) allYears.add(r.SCHOOL_YR_ID);
        });
        enrollmentRows.forEach(r => {
            if (Number.isFinite(r.SCHOOL_YR_ID)) allYears.add(r.SCHOOL_YR_ID);
        });
        socRows.forEach(r => {
            if (Number.isFinite(r.SCHOOL_YR_ID)) allYears.add(r.SCHOOL_YR_ID);
        });
        return Array.from(allYears).sort((a, b) => a - b);
    }, [activityRows, enrollmentRows, socRows]);

    const activityFiltered = useMemo(() => {
        if (!Number.isFinite(schoolYearId)) return [];
        return activityRows.filter((r) => r.SCHOOL_YR_ID === schoolYearId);
    }, [activityRows, schoolYearId]);

    const enrollmentFiltered = useMemo(() => {
        if (!Number.isFinite(schoolYearId)) return [];
        return enrollmentRows.filter((r) => r.SCHOOL_YR_ID === schoolYearId);
    }, [enrollmentRows, schoolYearId]);

    const admissionsAgg = useMemo(() => {
        // Calculate KPIs using available data
        // Note: CSV data doesn't include acceptances or completed enrollment breakdowns
        // Available: INQUIRIES (applications), CONTRACTED_ENROLL (actual enrollments), CAPACITY_ENROLL
        
        // Get applications from enrollment data (INQUIRIES)
        const enrollmentByType = new Map();
        for (const r of enrollmentFiltered) {
            const type = r.ENROLLMENT_TYPE_CD ?? "UNKNOWN";
            const enrolled = Number.isFinite(r.NR_ENROLLED) ? r.NR_ENROLLED : 0;
            enrollmentByType.set(type, (enrollmentByType.get(type) ?? 0) + enrolled);
        }
        
        const appsTotal = enrollmentByType.get("INQUIRIES") ?? 0;
        
        // Get actual enrollments from activity data (contracted enrollments)
        const enrollBoys = sumField(activityFiltered, "CONTRACTED_ENROLL_BOYS");
        const enrollGirls = sumField(activityFiltered, "CONTRACTED_ENROLL_GIRLS");
        const enrollTotal = enrollBoys + enrollGirls;
        
        // Admission rate: Contracted Enrollments / Applications
        // (using contracted enrollments as acceptances since actual acceptance data not available)
        const admitRate = appsTotal > 0 ? safeDiv(enrollTotal, appsTotal) : undefined;
        
        // Yield rate: Enrollments / Applications (percentage of applicants who enrolled)
        const yieldRate = appsTotal > 0 ? safeDiv(enrollTotal, appsTotal) : undefined;

        // Capacity fill: Enrollments / Capacity
        const cap = sumField(activityFiltered, "CAPACITY_ENROLL");
        const fillRate = cap > 0 ? safeDiv(enrollTotal, cap) : undefined;

        return {
            inquiriesTotal: appsTotal,
            appsTotal,
            acceptTotal: enrollTotal, // Using enrollments as proxy
            enrollTotal,
            admitRate,
            yieldRate,
            inquiryToApp: 0,
            enrollBoys,
            enrollGirls,
            cap,
            fillRate,
        };
    }, [enrollmentFiltered, activityFiltered]);

    const pipelineLineData = useMemo(() => {
        const labels = ["Applications", "Acceptances", "New Enrollments"];
        const data = [
            admissionsAgg.appsTotal,
            admissionsAgg.acceptTotal,
            admissionsAgg.enrollTotal,
        ];

        return {
            labels,
            datasets: [
                {
                    label: "Count",
                    data,
                    fill: true,
                    tension: 0.35,
                    borderColor: "#000000",
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                },
            ],
        };
    }, [admissionsAgg]);

    const genderDoughnutData = useMemo(() => {
        return {
            labels: ["Boys", "Girls"],
            datasets: [
                {
                    label: "New Enrollments",
                    data: [admissionsAgg.enrollBoys, admissionsAgg.enrollGirls],
                    backgroundColor: ["#404040", "#808080"],
                    borderColor: "#000000",
                },
            ],
        };
    }, [admissionsAgg]);

    const enrollmentBarData = useMemo(() => {
        const byType = new Map();
        for (const r of enrollmentFiltered) {
            const type = r.ENROLLMENT_TYPE_CD ?? "UNKNOWN";
            const v = Number.isFinite(r.NR_ENROLLED) ? r.NR_ENROLLED : 0;
            byType.set(type, (byType.get(type) ?? 0) + v);
        }

        const labels = Array.from(byType.keys()).sort((a, b) => String(a).localeCompare(String(b)));
        const values = labels.map((k) => byType.get(k));

        return {
            labels,
            datasets: [
                {
                    label: "Total",
                    data: values,
                    backgroundColor: "#606060",
                    borderColor: "#000000",
                },
            ],
        };
    }, [enrollmentFiltered]);

    const kpis = useMemo(() => {
        return [
            {
                label: "Admission rate",
                valueText: formatPct(admissionsAgg.admitRate),
                tone: getKpiCardTone(admissionsAgg.admitRate, "rate"),
                sub: "Contracted Enrollments / Applications",
            },
            {
                label: "Yield rate",
                valueText: formatPct(admissionsAgg.yieldRate),
                tone: getKpiCardTone(admissionsAgg.yieldRate, "rate"),
                sub: "Enrollments / Applications",
            },
            {
                label: "New enrollments",
                valueText: formatNum(admissionsAgg.enrollTotal),
                tone: "border-gray-400/50",
                sub: "Contracted enrollments total",
            },
            {
                label: "Capacity fill",
                valueText: formatPct(admissionsAgg.fillRate),
                tone: getKpiCardTone(admissionsAgg.fillRate, "rate"),
                sub: "Enrollments / Capacity",
            },
        ];
    }, [admissionsAgg]);

    return {
        // state
        category,
        setCategory,
        loading,
        err,
        activityRows,
        enrollmentRows,
        socRows,
        schoolYearId,
        setSchoolYearId,

        // derived
        availableYears,
        kpis,
        pipelineLineData,
        genderDoughnutData,
        enrollmentBarData,
    };
}