import { useEffect, useMemo, useState } from "react";
import { parseCsv } from "../utils/csv";
import { formatNum, formatPct, safeDiv, sumField } from "../utils/format";
import { getKpiCardTone } from "../utils/kpi";

export function useDashboardData({ schoolId }) {
    const [category, setCategory] = useState("Admissions"); // Admissions | Enrollment
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [activityRows, setActivityRows] = useState([]);
    const [enrollmentRows, setEnrollmentRows] = useState([]);
    const [schoolYearId, setSchoolYearId] = useState(null);

    useEffect(() => {
        let alive = true;

        async function load() {
            setLoading(true);
            setErr("");

            try {
                const [activityText, enrollmentText] = await Promise.all([
                    fetch("/data/ADMISSION_ACTIVITY.csv").then((r) => {
                        if (!r.ok) throw new Error("Could not load ADMISSION_ACTIVITY.csv");
                        return r.text();
                    }),
                    fetch("/data/ADMISSION_ACTIVITY_ENROLLMENT.csv").then((r) => {
                        if (!r.ok) throw new Error("Could not load ADMISSION_ACTIVITY_ENROLLMENT.csv");
                        return r.text();
                    }),
                ]);

                const a = parseCsv(activityText);
                const e = parseCsv(enrollmentText);

                if (!alive) return;

                setActivityRows(a);
                setEnrollmentRows(e);

                const years = Array.from(
                    new Set(a.filter((r) => r.SCHOOL_ID === schoolId).map((r) => r.SCHOOL_YR_ID))
                )
                    .filter((v) => Number.isFinite(v))
                    .sort((x, y) => x - y);

                setSchoolYearId((prev) => prev ?? years[years.length - 1] ?? null);
            } catch (e2) {
                if (!alive) return;
                setErr(e2?.message || "Failed to load dashboard data");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        }

        load();
        return () => {
            alive = false;
        };
    }, [schoolId]);

    const availableYears = useMemo(() => {
        const years = Array.from(
            new Set(activityRows.filter((r) => r.SCHOOL_ID === schoolId).map((r) => r.SCHOOL_YR_ID))
        )
            .filter((v) => Number.isFinite(v))
            .sort((a, b) => a - b);
        return years;
    }, [activityRows, schoolId]);

    const activityFiltered = useMemo(() => {
        if (!Number.isFinite(schoolYearId)) return [];
        return activityRows.filter((r) => r.SCHOOL_ID === schoolId && r.SCHOOL_YR_ID === schoolYearId);
    }, [activityRows, schoolId, schoolYearId]);

    const enrollmentFiltered = useMemo(() => {
        if (!Number.isFinite(schoolYearId)) return [];
        return enrollmentRows.filter(
            (r) => r.SCHOOL_ID === schoolId && r.SCHOOL_YR_ID === schoolYearId
        );
    }, [enrollmentRows, schoolId, schoolYearId]);

    const admissionsAgg = useMemo(() => {
        const inquiriesTotal =
            sumField(activityFiltered, "INQUIRIES_BOYS") + sumField(activityFiltered, "INQUIRIES_GIRLS");
        const appsTotal = sumField(activityFiltered, "COMPLETED_APPLICATION_TOTAL");
        const acceptTotal = sumField(activityFiltered, "ACCEPTANCES_TOTAL");
        const enrollTotal = sumField(activityFiltered, "NEW_ENROLLMENTS_TOTAL");

        const admitRate = safeDiv(acceptTotal, appsTotal);
        const yieldRate = safeDiv(enrollTotal, acceptTotal);
        const inquiryToApp = safeDiv(appsTotal, inquiriesTotal);

        const enrollBoys = sumField(activityFiltered, "NEW_ENROLLMENTS_BOYS");
        const enrollGirls = sumField(activityFiltered, "NEW_ENROLLMENTS_GIRLS");
        const cap = sumField(activityFiltered, "CAPACITY_ENROLL");
        const fillRate = safeDiv(enrollTotal, cap);

        return {
            inquiriesTotal,
            appsTotal,
            acceptTotal,
            enrollTotal,
            admitRate,
            yieldRate,
            inquiryToApp,
            enrollBoys,
            enrollGirls,
            cap,
            fillRate,
        };
    }, [activityFiltered]);

    const pipelineLineData = useMemo(() => {
        const labels = ["Inquiries", "Applications", "Acceptances", "New Enrollments"];
        const data = [
            admissionsAgg.inquiriesTotal,
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
                sub: "Acceptances / Applications",
            },
            {
                label: "Yield rate",
                valueText: formatPct(admissionsAgg.yieldRate),
                tone: getKpiCardTone(admissionsAgg.yieldRate, "rate"),
                sub: "New enrollments / Acceptances",
            },
            {
                label: "Inquiry → App",
                valueText: formatPct(admissionsAgg.inquiryToApp),
                tone: getKpiCardTone(admissionsAgg.inquiryToApp, "rate"),
                sub: "Applications / Inquiries",
            },
            {
                label: "New enrollments",
                valueText: formatNum(admissionsAgg.enrollTotal),
                tone: "border-white/10",
                sub: "Total for selected year",
            },
            {
                label: "Capacity fill",
                valueText: formatPct(admissionsAgg.fillRate),
                tone: getKpiCardTone(admissionsAgg.fillRate, "rate"),
                sub: "New enrollments / Capacity",
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