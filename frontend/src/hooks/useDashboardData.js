import { useEffect, useMemo, useState } from "react";
import { formatNum, formatPct, safeDiv, sumField } from "../utils/format";
import { getKpiCardTone } from "../utils/kpi";

const EMPLOYEE_CATEGORY_NAMES = {
    EMPCAT_T: "Teachers",
    EMPCAT_TS: "Teacher Support",
    EMPCAT_TA: "Teaching Asst",
    EMPCAT_TAID: "Teaching Asst ID",
    EMPCAT_PMS: "Principals/Mgmt",
    EMPCAT_ADM: "Admin",
    EMPCAT_OAS: "Office Admin",
    EMPCAT_AS: "Admin Support",
    EMPCAT_AO: "Admin Other",
    EMPCAT_CS: "Counselors",
    EMPCAT_INT: "Instr Specialists",
    EMPCAT_IS: "Instr Support",
    EMPCAT_RS: "Reading Specialists",
    EMPCAT_DCP: "Directors/Coords",
    EMPCAT_SS: "Social Services",
    EMPCAT_HS: "Health/Nurses",
    EMPCAT_KS: "Food Service",
    EMPCAT_OE: "Operations/Maint",
    EMPCAT_MLS: "Media/Library",
    EMPCAT_OC: "Other Support",
};

async function fetchJson(url, datasetName) {
    const response = await fetch(url, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
    }

    if (response.status === 204) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`${datasetName} fetch failed: ${response.status}`);
    }

    const raw = await response.text();
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        throw new Error(`${datasetName} returned invalid JSON`);
    }
}

export function useDashboardData({ schoolId }) {
    const [category, setCategory] = useState("Admissions"); // Admissions | Employee
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [activityRows, setActivityRows] = useState([]);
    const [enrollmentRows, setEnrollmentRows] = useState([]);
    const [socRows, setSOCRows] = useState([]);
    const [employeePersonnelRows, setEmployeePersonnelRows] = useState([]);
    const [employeeAdminSupportRows, setEmployeeAdminSupportRows] = useState([]);
    const [schoolYearId, setSchoolYearId] = useState(null);
    const [peerGroup, setPeerGroup] = useState("all_schools");
    const [peerGroupOptions, setPeerGroupOptions] = useState([]);
    const [peerComparison, setPeerComparison] = useState(null);
    const [peerLoading, setPeerLoading] = useState(false);
    const [peerErr, setPeerErr] = useState("");

    useEffect(() => {
        let alive = true;

        async function fetchDataArray(url, datasetName) {
            const parsed = await fetchJson(url, datasetName);
            return Array.isArray(parsed) ? parsed : [];
        }

        async function load() {
            setLoading(true);
            setErr("");

            try {
                // Fetch data from API - middleware ensures user only gets their school's data
                const a = await fetchDataArray("/api/admission/activity", "Activity");
                const e = await fetchDataArray("/api/admission/enrollment", "Enrollment");
                const s = await fetchDataArray("/api/admission/activity-soc", "SOC");
                const ep = await fetchDataArray("/api/employee/personnel", "Employee personnel");
                const eas = await fetchDataArray("/api/employee/admin-support", "Employee admin support");

                if (!alive) return undefined;

                // Convert MongoDB documents to match expected format
                const activityData = Array.isArray(a) ? a : [];
                const enrollmentData = Array.isArray(e) ? e : [];
                const socData = Array.isArray(s) ? s : [];
                const employeePersonnelData = Array.isArray(ep) ? ep : [];
                const employeeAdminSupportData = Array.isArray(eas) ? eas : [];

                setActivityRows(activityData);
                setEnrollmentRows(enrollmentData);
                setSOCRows(socData);
                setEmployeePersonnelRows(employeePersonnelData);
                setEmployeeAdminSupportRows(employeeAdminSupportData);

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
                employeePersonnelData.forEach(r => {
                    if (Number.isFinite(r.SCHOOL_YR_ID)) allYears.add(r.SCHOOL_YR_ID);
                });
                employeeAdminSupportData.forEach(r => {
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

    useEffect(() => {
        let alive = true;

        async function loadPeerGroups() {
            try {
                const parsed = await fetchJson("/api/admission/stats/peer-groups", "Peer groups");
                if (!alive) return;
                const options = Array.isArray(parsed) ? parsed : [];
                setPeerGroupOptions(options);

                if (options.length > 0) {
                    setPeerGroup((prev) =>
                        options.some((option) => option?.key === prev) ? prev : options[0].key
                    );
                }
            } catch {
                if (!alive) return;
                setPeerGroupOptions([
                    { key: "all_schools", label: "All Schools" },
                    { key: "region_cd", label: "Same Region" },
                    { key: "group_cd", label: "Same group" },
                ]);
            }
        }

        loadPeerGroups();
        return () => {
            alive = false;
        };
    }, [schoolId]);

    useEffect(() => {
        let alive = true;

        async function loadPeerComparison() {
            if (!Number.isFinite(schoolYearId)) {
                setPeerComparison(null);
                return;
            }

            setPeerLoading(true);
            setPeerErr("");

            try {
                const params = new URLSearchParams({
                    schoolYearId: String(schoolYearId),
                    peerGroup,
                    category,
                });
                const parsed = await fetchJson(`/api/admission/stats/peer-comparison?${params.toString()}`, "Peer comparison");

                if (!alive) return;
                setPeerComparison(parsed ?? null);
            } catch (e2) {
                if (!alive) return;
                setPeerComparison(null);
                setPeerErr(e2?.message || "Failed to load peer comparison");
            } finally {
                if (alive) {
                    setPeerLoading(false);
                }
            }
        }

        loadPeerComparison();
        return () => {
            alive = false;
        };
    }, [peerGroup, schoolYearId, category]);

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
        employeePersonnelRows.forEach(r => {
            if (Number.isFinite(r.SCHOOL_YR_ID)) allYears.add(r.SCHOOL_YR_ID);
        });
        employeeAdminSupportRows.forEach(r => {
            if (Number.isFinite(r.SCHOOL_YR_ID)) allYears.add(r.SCHOOL_YR_ID);
        });
        return Array.from(allYears).sort((a, b) => a - b);
    }, [activityRows, enrollmentRows, socRows, employeePersonnelRows, employeeAdminSupportRows]);

    const activityFiltered = useMemo(() => {
        if (!Number.isFinite(schoolYearId)) return [];
        return activityRows.filter((r) => r.SCHOOL_YR_ID === schoolYearId);
    }, [activityRows, schoolYearId]);

    const enrollmentFiltered = useMemo(() => {
        if (!Number.isFinite(schoolYearId)) return [];
        return enrollmentRows.filter((r) => r.SCHOOL_YR_ID === schoolYearId);
    }, [enrollmentRows, schoolYearId]);

    const employeePersonnelFiltered = useMemo(() => {
        if (!Number.isFinite(schoolYearId)) return [];
        return employeePersonnelRows.filter((r) => r.SCHOOL_YR_ID === schoolYearId);
    }, [employeePersonnelRows, schoolYearId]);

    const employeeAdminSupportFiltered = useMemo(() => {
        if (!Number.isFinite(schoolYearId)) return [];
        return employeeAdminSupportRows.filter((r) => r.SCHOOL_YR_ID === schoolYearId);
    }, [employeeAdminSupportRows, schoolYearId]);

    const admissionsAgg = useMemo(() => {
        // Calculate KPIs using actual data from CSV
        // Available fields: COMPLETED_APPLICATION_TOTAL, ACCEPTANCES_TOTAL, NEW_ENROLLMENTS_TOTAL
        // Filter out rows with null values in these fields
        
        const validRows = activityFiltered.filter(r => 
            Number.isFinite(r.COMPLETED_APPLICATION_TOTAL) && 
            Number.isFinite(r.ACCEPTANCES_TOTAL) &&
            Number.isFinite(r.NEW_ENROLLMENTS_TOTAL)
        );

        console.log("DEBUG: activityFiltered rows:", activityFiltered.length);
        console.log("DEBUG: validRows (non-null):", validRows.length);
        console.log("DEBUG: Sample valid row:", validRows[0]);
        console.log("DEBUG: Sample row COMPLETED_APPLICATION_TOTAL:", validRows[0]?.COMPLETED_APPLICATION_TOTAL, "type:", typeof validRows[0]?.COMPLETED_APPLICATION_TOTAL);
        console.log("DEBUG: Sample row ACCEPTANCES_TOTAL:", validRows[0]?.ACCEPTANCES_TOTAL, "type:", typeof validRows[0]?.ACCEPTANCES_TOTAL);
        console.log("DEBUG: Sample row NEW_ENROLLMENTS_TOTAL:", validRows[0]?.NEW_ENROLLMENTS_TOTAL, "type:", typeof validRows[0]?.NEW_ENROLLMENTS_TOTAL);
        console.log("DEBUG: First 3 valid rows full objects:", validRows.slice(0, 3));

        // Get totals from activity data (only from valid rows)
        const appsTotal = sumField(validRows, "COMPLETED_APPLICATION_TOTAL");
        const acceptTotal = sumField(validRows, "ACCEPTANCES_TOTAL");
        const newEnrollTotal = sumField(validRows, "NEW_ENROLLMENTS_TOTAL");
        
        console.log("DEBUG: appsTotal:", appsTotal);
        console.log("DEBUG: acceptTotal:", acceptTotal);
        console.log("DEBUG: newEnrollTotal:", newEnrollTotal);
        
        // Get contracted enrollments (current enrolled students) from all activity rows
        const enrollBoys = sumField(activityFiltered, "CONTRACTED_ENROLL_BOYS");
        const enrollGirls = sumField(activityFiltered, "CONTRACTED_ENROLL_GIRLS");
        const enrollTotal = enrollBoys + enrollGirls;
        
        // Acceptance rate: Acceptances / Applications (only if we have valid data)
        const acceptanceRate = appsTotal > 0 ? safeDiv(acceptTotal, appsTotal) : undefined;
        
        console.log("DEBUG: acceptanceRate (raw):", acceptanceRate);
        console.log("DEBUG: acceptanceRate (formatted):", acceptanceRate !== undefined ? `${(acceptanceRate * 100).toFixed(1)}%` : "—");
        
        // Yield rate: New Enrollments / Acceptances (only if we have valid acceptances)
        const yieldRate = acceptTotal > 0 ? safeDiv(newEnrollTotal, acceptTotal) : undefined;

        // Capacity fill: Contracted Enrollments / Capacity
        const cap = sumField(activityFiltered, "CAPACITY_ENROLL");
        const fillRate = cap > 0 ? safeDiv(enrollTotal, cap) : undefined;

        // Enrollment rate: New Enrollments / Applications (overall conversion)
        const enrollmentRate = appsTotal > 0 ? safeDiv(newEnrollTotal, appsTotal) : undefined;

        return {
            appsTotal,
            acceptTotal,
            newEnrollTotal,
            enrollTotal,
            acceptanceRate,
            yieldRate,
            fillRate,
            enrollmentRate,
            enrollBoys,
            enrollGirls,
            cap,
        };
    }, [activityFiltered]);

    const pipelineLineData = useMemo(() => {
        const labels = ["Applications", "Acceptances", "New Enrollments"];
        const data = [
            admissionsAgg.appsTotal,
            admissionsAgg.acceptTotal,
            admissionsAgg.newEnrollTotal,
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

    const employeeAgg = useMemo(() => {
        const totalEmployees = sumField(employeePersonnelFiltered, "TOTAL_EMPLOYEES");
        const fullTimeEmployees = sumField(employeePersonnelFiltered, "FT_EMPLOYEES");
        const pocEmployees = sumField(employeePersonnelFiltered, "POC_EMPLOYEES");
        const subcontractFTE = sumField(employeePersonnelFiltered, "SUBCONTRACT_FTE");

        const studentsTotal = sumField(activityFiltered, "CONTRACTED_ENROLL_BOYS") + sumField(activityFiltered, "CONTRACTED_ENROLL_GIRLS");
        const teacherCategoryCodes = new Set(["EMPCAT_T", "EMPCAT_TS"]);
        const teacherRows = employeePersonnelFiltered.filter((r) => {
            const categoryCode = String(r.EMP_CAT_CD ?? "").trim().toUpperCase();
            return teacherCategoryCodes.has(categoryCode);
        });
        const teacherFteCount = sumField(teacherRows, "FT_EMPLOYEES");
        const teacherHeadcount = sumField(teacherRows, "TOTAL_EMPLOYEES");
        const teacherCount = teacherFteCount > 0 ? teacherFteCount : teacherHeadcount;
        const studentTeacherRatio = teacherCount > 0 ? safeDiv(studentsTotal, teacherCount) : undefined;

        const studentEmployeeRatio = totalEmployees > 0 ? safeDiv(studentsTotal, totalEmployees) : undefined;
        const subcontractorPercentage = totalEmployees > 0 ? safeDiv(subcontractFTE, totalEmployees) : undefined;

        const exemptCount = sumField(employeeAdminSupportFiltered, "NR_EXEMPT");
        const nonExemptCount = sumField(employeeAdminSupportFiltered, "NR_NONEXEMPT");
        const exemptRate =
            exemptCount + nonExemptCount > 0
                ? safeDiv(exemptCount, exemptCount + nonExemptCount)
                : undefined;

        const rowsWithSalary = employeePersonnelFiltered.filter(
            (r) =>
                Number.isFinite(r.FTE_ONLY_SALARY_MIN) &&
                Number.isFinite(r.FTE_ONLY_SALARY_MAX) &&
                r.FTE_ONLY_SALARY_MAX >= r.FTE_ONLY_SALARY_MIN &&
                (r.FTE_ONLY_SALARY_MIN > 0 || r.FTE_ONLY_SALARY_MAX > 0)
        );
        const avgSalaryMidpoint =
            rowsWithSalary.length > 0
                ? rowsWithSalary.reduce(
                      (sum, r) => sum + ((r.FTE_ONLY_SALARY_MIN + r.FTE_ONLY_SALARY_MAX) / 2),
                      0
                  ) / rowsWithSalary.length
                : undefined;
        const salaryBandSpread =
            rowsWithSalary.length > 0
                ? rowsWithSalary.reduce(
                      (sum, r) => sum + (r.FTE_ONLY_SALARY_MAX - r.FTE_ONLY_SALARY_MIN),
                      0
                  ) / rowsWithSalary.length
                : undefined;

        const fullTimeRate = totalEmployees > 0 ? safeDiv(fullTimeEmployees, totalEmployees) : undefined;

        const categoryTotals = new Map();
        for (const row of employeePersonnelFiltered) {
            const categoryCode = String(row.EMP_CAT_CD ?? "UNKNOWN").trim() || "UNKNOWN";
            const value = Number.isFinite(row.TOTAL_EMPLOYEES) ? row.TOTAL_EMPLOYEES : 0;
            categoryTotals.set(categoryCode, (categoryTotals.get(categoryCode) ?? 0) + value);
        }
        let topCategoryCode = "—";
        let topCategoryEmployees = 0;
        for (const [code, total] of categoryTotals.entries()) {
            if (total > topCategoryEmployees) {
                topCategoryCode = code;
                topCategoryEmployees = total;
            }
        }

        return {
            totalEmployees,
            fullTimeEmployees,
            fullTimeRate,
            subcontractFTE,
            studentsTotal,
            teacherCount,
            studentTeacherRatio,
            studentEmployeeRatio,
            subcontractorPercentage,
            pocEmployees,
            exemptCount,
            nonExemptCount,
            exemptRate,
            avgSalaryMidpoint,
            salaryBandSpread,
            topCategoryCode,
            topCategoryEmployees,
        };
    }, [employeePersonnelFiltered, employeeAdminSupportFiltered, activityFiltered]);

    const employeeCategoryBarData = useMemo(() => {
        const byCat = new Map();
        for (const r of employeePersonnelFiltered) {
            const key = r.EMP_CAT_CD ?? "UNKNOWN";
            const value = Number.isFinite(r.TOTAL_EMPLOYEES) ? r.TOTAL_EMPLOYEES : 0;
            byCat.set(key, (byCat.get(key) ?? 0) + value);
        }

        const labels = Array.from(byCat.keys()).sort((a, b) => String(a).localeCompare(String(b)));
        const values = labels.map((k) => byCat.get(k));

        return {
            labels,
            datasets: [
                {
                    label: "Employees",
                    data: values,
                    backgroundColor: "#606060",
                    borderColor: "#000000",
                },
            ],
        };
    }, [employeePersonnelFiltered]);

    const employeeStudentTeacherTrendData = useMemo(() => {
        const teacherCategoryCodes = new Set(["EMPCAT_T", "EMPCAT_TS"]);
        const years = Array.from(
            new Set([
                ...activityRows.map((r) => r.SCHOOL_YR_ID),
                ...employeePersonnelRows.map((r) => r.SCHOOL_YR_ID),
            ])
        )
            .filter((y) => Number.isFinite(y))
            .sort((a, b) => a - b);

        const ratios = years.map((year) => {
            const yearActivity = activityRows.filter((r) => r.SCHOOL_YR_ID === year);
            const studentsTotal =
                sumField(yearActivity, "CONTRACTED_ENROLL_BOYS") +
                sumField(yearActivity, "CONTRACTED_ENROLL_GIRLS");

            const yearPersonnel = employeePersonnelRows.filter((r) => r.SCHOOL_YR_ID === year);
            const teacherRows = yearPersonnel.filter((r) => {
                const categoryCode = String(r.EMP_CAT_CD ?? "").trim().toUpperCase();
                return teacherCategoryCodes.has(categoryCode);
            });
            const teacherFteCount = sumField(teacherRows, "FT_EMPLOYEES");
            const teacherHeadcount = sumField(teacherRows, "TOTAL_EMPLOYEES");
            const teacherCount = teacherFteCount > 0 ? teacherFteCount : teacherHeadcount;

            return teacherCount > 0 ? Number((studentsTotal / teacherCount).toFixed(2)) : null;
        });

        return {
            labels: years,
            datasets: [
                {
                    label: "Student-to-Teacher Ratio",
                    data: ratios,
                    fill: true,
                    tension: 0.35,
                    borderColor: "#000000",
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                },
            ],
        };
    }, [activityRows, employeePersonnelRows]);

    const employeeCategoriesPieData = useMemo(() => {
        const categoryTotals = new Map();
        for (const row of employeePersonnelFiltered) {
            const categoryCode = String(row.EMP_CAT_CD ?? "UNKNOWN").trim() || "UNKNOWN";
            const value = Number.isFinite(row.TOTAL_EMPLOYEES) ? row.TOTAL_EMPLOYEES : 0;
            categoryTotals.set(categoryCode, (categoryTotals.get(categoryCode) ?? 0) + value);
        }
        const sortedCategories = Array.from(categoryTotals.entries())
            .filter(([, total]) => total > 0)  // Only include categories with employees
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15); // limit to top 15 for readability
        const labels = sortedCategories.map(([code]) => EMPLOYEE_CATEGORY_NAMES[code] || code);
        const data = sortedCategories.map(([, total]) => total);
        const colors = [
            "#404040", "#555555", "#666666", "#707070", "#808080",
            "#909090", "#A0A0A0", "#9CA3AF", "#AAAAAA", "#BBBBBB",
            "#CCCCCC", "#DDDDDD", "#EEEEEE", "#B8B8B8", "#A8A8A8"
        ];
        return {
            labels,
            datasets: [
                {
                    label: "Employee Count",
                    data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: "#000000",
                    borderWidth: 1,
                },
            ],
        };
    }, [employeePersonnelFiltered]);

    const kpis = useMemo(() => {
        if (category === "Employee") {
            return [
                {
                    label: "Total employees",
                    valueText: formatNum(employeeAgg.totalEmployees),
                    tone: "border-gray-400/50",
                    sub: "All employee categories",
                },
                {
                    label: "Full-time rate",
                    valueText: formatPct(employeeAgg.fullTimeRate),
                    tone: getKpiCardTone(employeeAgg.fullTimeRate, "rate"),
                    sub: "FT employees / Total employees",
                },
                {
                    label: "Student-to-Teacher ratio",
                    valueText: Number.isFinite(employeeAgg.studentTeacherRatio)
                        ? `${employeeAgg.studentTeacherRatio.toFixed(2)} : 1`
                        : "—",
                    tone: getKpiCardTone(employeeAgg.studentTeacherRatio, "rate"),
                    sub: "Contracted enrollments / Teacher count",
                },
                {
                    label: "Student-to-Employee ratio",
                    valueText: Number.isFinite(employeeAgg.studentEmployeeRatio)
                        ? `${employeeAgg.studentEmployeeRatio.toFixed(2)} : 1`
                        : "—",
                    tone: getKpiCardTone(employeeAgg.studentEmployeeRatio, "rate"),
                    sub: "Contracted enrollments / Total employees",
                },
                {
                    label: "Top Employee Category",
                    valueText: EMPLOYEE_CATEGORY_NAMES[employeeAgg.topCategoryCode] || employeeAgg.topCategoryCode || "—",
                    tone: "border-gray-400/50",
                    sub: Number.isFinite(employeeAgg.topCategoryEmployees)
                        ? `${formatNum(employeeAgg.topCategoryEmployees)} employees`
                        : "No category data",
                },
            ];
        }

        const kpiArray = [
            {
                label: "Acceptance rate",
                valueText: formatPct(admissionsAgg.acceptanceRate),
                tone: getKpiCardTone(admissionsAgg.acceptanceRate, "rate"),
                sub: "Acceptances / Applications",
            },
            {
                label: "Yield rate",
                valueText: formatPct(admissionsAgg.yieldRate),
                tone: getKpiCardTone(admissionsAgg.yieldRate, "rate"),
                sub: "New Enrollments / Acceptances",
            },
            {
                label: "Enrollment rate",
                valueText: formatPct(admissionsAgg.enrollmentRate),
                tone: getKpiCardTone(admissionsAgg.enrollmentRate, "rate"),
                sub: "New Enrollments / Applications",
            },
            {
                label: "New enrollments",
                valueText: formatNum(admissionsAgg.newEnrollTotal),
                tone: "border-gray-400/50",
                sub: "Total new enrollments",
            },
            {
                label: "Capacity fill",
                valueText: formatPct(admissionsAgg.fillRate),
                tone: getKpiCardTone(admissionsAgg.fillRate, "rate"),
                sub: "Enrollments / Capacity",
            },
        ];
        console.log("DEBUG: KPIs array:", kpiArray);
        return kpiArray;
    }, [admissionsAgg, category, employeeAgg]);

    const peerComparisonBarData = useMemo(() => {
        const yourSchool = peerComparison?.yourSchool;
        const peerAverage = peerComparison?.peerAverage;

        if (category === "Employee") {
            return {
                labels: ["Total Employees", "Full-Time Rate", "Teacher Count"],
                datasets: [
                    {
                        label: "Your School",
                        data: [
                            Number.isFinite(yourSchool?.totalEmployees) ? yourSchool.totalEmployees : 0,
                            Number.isFinite(yourSchool?.fullTimeRate) ? yourSchool.fullTimeRate * 100 : 0,
                            Number.isFinite(yourSchool?.teacherCount) ? yourSchool.teacherCount : 0,
                        ],
                        backgroundColor: "#404040",
                        borderColor: "#000000",
                    },
                    {
                        label: "Peer Average",
                        data: [
                            Number.isFinite(peerAverage?.totalEmployees) ? peerAverage.totalEmployees : 0,
                            Number.isFinite(peerAverage?.fullTimeRate) ? peerAverage.fullTimeRate * 100 : 0,
                            Number.isFinite(peerAverage?.teacherCount) ? peerAverage.teacherCount : 0,
                        ],
                        backgroundColor: "#9CA3AF",
                        borderColor: "#000000",
                    },
                ],
            };
        }

        return {
            labels: ["Applications", "Enrollments", "Capacity Fill"],
            datasets: [
                {
                    label: "Your School",
                    data: [
                        Number.isFinite(yourSchool?.applications) ? yourSchool.applications : 0,
                        Number.isFinite(yourSchool?.enrollments) ? yourSchool.enrollments : 0,
                        Number.isFinite(yourSchool?.fillRate) ? yourSchool.fillRate * 100 : 0,
                    ],
                    backgroundColor: "#404040",
                    borderColor: "#000000",
                },
                {
                    label: "Peer Average",
                    data: [
                        Number.isFinite(peerAverage?.applications) ? peerAverage.applications : 0,
                        Number.isFinite(peerAverage?.enrollments) ? peerAverage.enrollments : 0,
                        Number.isFinite(peerAverage?.fillRate) ? peerAverage.fillRate * 100 : 0,
                    ],
                    backgroundColor: "#9CA3AF",
                    borderColor: "#000000",
                },
            ],
        };
    }, [category, peerComparison]);

    const peerStats = useMemo(() => {
        const yourSchool = peerComparison?.yourSchool ?? {};
        const peerAverage = peerComparison?.peerAverage ?? {};

        if (category === "Employee") {
            return [
                {
                    label: "Your total employees",
                    valueText: formatNum(yourSchool.totalEmployees),
                },
                {
                    label: "Peer avg total employees",
                    valueText: formatNum(peerAverage.totalEmployees),
                },
                {
                    label: "Your teacher count",
                    valueText: formatNum(yourSchool.teacherCount),
                },
                {
                    label: "Peer avg teacher count",
                    valueText: formatNum(peerAverage.teacherCount),
                },
            ];
        }

        return [
            {
                label: "Your acceptance rate",
                valueText: formatPct(yourSchool.acceptanceRate),
            },
            {
                label: "Peer average acceptance rate",
                valueText: formatPct(peerAverage.acceptanceRate),
            },
            {
                label: "Your new enrollments",
                valueText: formatNum(yourSchool.enrollments),
            },
            {
                label: "Peer average new enrollments",
                valueText: formatNum(peerAverage.enrollments),
            },
        ];
    }, [category, peerComparison]);

    return {
        // state
        category,
        setCategory,
        loading,
        err,
        activityRows,
        enrollmentRows,
        socRows,
        employeePersonnelRows,
        employeeAdminSupportRows,
        schoolYearId,
        setSchoolYearId,
        peerGroup,
        setPeerGroup,
        peerGroupOptions,
        peerComparison,
        peerLoading,
        peerErr,

        // derived
        availableYears,
        kpis,
        pipelineLineData,
        genderDoughnutData,
        enrollmentBarData,
        employeeCategoryBarData,
        employeeStudentTeacherTrendData,
        employeeCategoriesPieData,
        peerComparisonBarData,
        peerStats,
    };
}