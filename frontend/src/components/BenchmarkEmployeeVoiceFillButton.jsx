import React, { useCallback, useMemo, useState } from "react";
import {
    MicrophoneIcon,
    XIcon,
    CheckCircleIcon,
    ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { useWebSpeech } from "../hooks/useWebSpeech";

const EMPLOYEE_CATEGORY_CODES = {
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

const FIELDS = [
    {
        key: "SCHOOL_YR_ID",
        label: "School Year ID",
        aliases: ["school year", "school year id", "year id"],
        type: "number",
    },
    {
        key: "EMP_CAT_CD",
        label: "Employee Category",
        aliases: ["employee category", "category", "employee type", "emp cat"],
        type: "category",
    },
    {
        key: "TOTAL_EMPLOYEES",
        label: "Total Employees",
        aliases: ["total employees", "employees total", "employee total"],
        type: "number",
    },
    {
        key: "FT_EMPLOYEES",
        label: "Full-Time Employees",
        aliases: ["full time employees", "ft employees", "full time", "full-time employees"],
        type: "number",
    },
    {
        key: "SUBCONTRACT_FTE",
        label: "Subcontract FTE",
        aliases: ["subcontract fte", "subcontract", "fte subcontract"],
        type: "number",
    },
    {
        key: "FTE_ONLY_SALARY_MIN",
        label: "Min Salary (FTE)",
        aliases: ["min salary", "minimum salary", "salary min", "fte salary min"],
        type: "number",
    },
    {
        key: "FTE_ONLY_SALARY_MAX",
        label: "Max Salary (FTE)",
        aliases: ["max salary", "maximum salary", "salary max", "fte salary max"],
        type: "number",
    },
    {
        key: "POC_EMPLOYEES",
        label: "Part-Time/Contractors",
        aliases: [
            "part time contractors",
            "part time",
            "contractors",
            "poc employees",
            "part-time contractors",
        ],
        type: "number",
    },
];

const normalize = (s) =>
    (s || "")
        .toLowerCase()
        .replace(/[^\w\s.%,-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

function parseNumber(raw) {
    if (raw == null) return null;

    let s = String(raw).toLowerCase();

    // remove commas in numbers
    s = s.replace(/(?<=\d),(?=\d)/g, "");

    const cleaned = normalize(s).replace("%", "").trim();
    const pointFixed = cleaned.replace(/\bpoint\b/g, ".");
    const spaceGroupedFixed = pointFixed.replace(/(\d)\s+(?=\d{3}\b)/g, "$1");

    const match = spaceGroupedFixed.match(/-?\d+(\.\d+)?/);
    return match ? match[0] : null;
}

function findField(text) {
    const t = normalize(text);

    const aliasList = FIELDS.flatMap((f) =>
        f.aliases.map((alias) => ({
            key: f.key,
            label: f.label,
            type: f.type,
            alias,
        }))
    ).sort((a, b) => b.alias.length - a.alias.length);

    for (const field of aliasList) {
        if (t.includes(normalize(field.alias))) return field;
    }

    return null;
}

function buildCategoryAliases() {
    const list = [];

    for (const [code, label] of Object.entries(EMPLOYEE_CATEGORY_CODES)) {
        const codeNorm = normalize(code);
        const labelNorm = normalize(label);

        list.push({ code, alias: codeNorm });
        list.push({ code, alias: labelNorm });

        // common spoken variations
        if (code === "EMPCAT_T") {
            list.push({ code, alias: "teacher" });
            list.push({ code, alias: "teachers" });
        }
        if (code === "EMPCAT_TS") {
            list.push({ code, alias: "teacher support" });
        }
        if (code === "EMPCAT_TA") {
            list.push({ code, alias: "teaching assistant" });
            list.push({ code, alias: "teaching assistants" });
            list.push({ code, alias: "teacher assistant" });
        }
        if (code === "EMPCAT_TAID") {
            list.push({ code, alias: "teaching assistant id" });
            list.push({ code, alias: "teacher assistant id" });
        }
        if (code === "EMPCAT_PMS") {
            list.push({ code, alias: "principals management" });
            list.push({ code, alias: "principal management" });
            list.push({ code, alias: "management" });
        }
        if (code === "EMPCAT_ADM") {
            list.push({ code, alias: "admin" });
            list.push({ code, alias: "administration" });
        }
        if (code === "EMPCAT_OAS") {
            list.push({ code, alias: "office admin" });
            list.push({ code, alias: "office administration" });
        }
        if (code === "EMPCAT_AS") {
            list.push({ code, alias: "admin support" });
            list.push({ code, alias: "administrative support" });
        }
        if (code === "EMPCAT_AO") {
            list.push({ code, alias: "admin other" });
            list.push({ code, alias: "administrative other" });
        }
        if (code === "EMPCAT_CS") {
            list.push({ code, alias: "counselor" });
            list.push({ code, alias: "counselors" });
        }
        if (code === "EMPCAT_INT") {
            list.push({ code, alias: "instructional specialists" });
            list.push({ code, alias: "instruction specialists" });
        }
        if (code === "EMPCAT_IS") {
            list.push({ code, alias: "instructional support" });
            list.push({ code, alias: "instruction support" });
        }
        if (code === "EMPCAT_RS") {
            list.push({ code, alias: "reading specialist" });
            list.push({ code, alias: "reading specialists" });
        }
        if (code === "EMPCAT_DCP") {
            list.push({ code, alias: "directors coordinators" });
            list.push({ code, alias: "director coordinator" });
            list.push({ code, alias: "directors and coordinators" });
        }
        if (code === "EMPCAT_SS") {
            list.push({ code, alias: "social services" });
            list.push({ code, alias: "social service" });
        }
        if (code === "EMPCAT_HS") {
            list.push({ code, alias: "health nurses" });
            list.push({ code, alias: "health and nurses" });
            list.push({ code, alias: "nurses" });
        }
        if (code === "EMPCAT_KS") {
            list.push({ code, alias: "food service" });
        }
        if (code === "EMPCAT_OE") {
            list.push({ code, alias: "operations maintenance" });
            list.push({ code, alias: "operations and maintenance" });
            list.push({ code, alias: "maintenance" });
        }
        if (code === "EMPCAT_MLS") {
            list.push({ code, alias: "media library" });
            list.push({ code, alias: "library" });
            list.push({ code, alias: "media" });
        }
        if (code === "EMPCAT_OC") {
            list.push({ code, alias: "other support" });
        }
    }

    return list.sort((a, b) => b.alias.length - a.alias.length);
}

const CATEGORY_ALIASES = buildCategoryAliases();

function parseCategory(raw) {
    const t = normalize(raw);

    for (const { code, alias } of CATEGORY_ALIASES) {
        if (t.includes(alias)) return code;
    }

    return null;
}

function parseUtteranceToPatch(utterance) {
    const t = normalize(utterance);

    if (t.includes("undo")) return { __cmd: "undo" };
    if (t.includes("apply")) return { __cmd: "apply" };

    if (t.includes("clear")) {
        const field = findField(t);
        if (field) return { [field.key]: "" };
        return null;
    }

    const field = findField(t);
    if (!field) return null;

    let rhs = t;
    const toIdx = t.indexOf(" to ");
    if (toIdx !== -1) rhs = t.slice(toIdx + 4);

    if (field.type === "category") {
        const categoryCode = parseCategory(rhs);
        if (!categoryCode) return null;
        return { [field.key]: categoryCode };
    }

    const num = parseNumber(rhs);
    if (num == null) return null;

    return { [field.key]: num };
}

export default function BenchmarkEmployeeVoiceFillButton({
    formData,
    setFormData,
    validateAndShowErrors,
    category = "Employee",
}) {
    const [open, setOpen] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [finalTranscript, setFinalTranscript] = useState("");
    const [pendingPatch, setPendingPatch] = useState({});
    const [history, setHistory] = useState([]);

    const buttonColor = "#0ea5e9";

    const pendingEntries = useMemo(() => Object.entries(pendingPatch), [pendingPatch]);

    const applyPatch = useCallback(() => {
        if (pendingEntries.length === 0) return;

        setHistory((h) => [...h, formData]);

        const next = { ...formData };
        for (const [k, v] of pendingEntries) next[k] = v;

        setFormData(next);
        setPendingPatch({});
        if (validateAndShowErrors) validateAndShowErrors(next);
    }, [formData, pendingEntries, setFormData, validateAndShowErrors]);

    const undo = useCallback(() => {
        setHistory((h) => {
            if (h.length === 0) return h;
            const prev = h[h.length - 1];
            setFormData(prev);
            if (validateAndShowErrors) validateAndShowErrors(prev);
            return h.slice(0, -1);
        });

        setPendingPatch({});
    }, [setFormData, validateAndShowErrors]);

    const onInterimText = useCallback((t) => {
        setTranscript(t);
    }, []);

    const onFinalText = useCallback(
        (t) => {
            setFinalTranscript(t);

            const patch = parseUtteranceToPatch(t);
            if (!patch) return;

            if (patch.__cmd === "apply") return applyPatch();
            if (patch.__cmd === "undo") return undo();

            setPendingPatch((p) => ({ ...p, ...patch }));
        },
        [applyPatch, undo]
    );

    const { supported, listening, start, stop } = useWebSpeech({
        onInterimText,
        onFinalText,
    });

    if (!supported) return null;

    return (
        <>
            {open && (
                <div
                    style={{
                        position: "fixed",
                        right: 10,
                        bottom: 92,
                        width: 380,
                        background: "white",
                        borderRadius: 16,
                        boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                        padding: 16,
                        zIndex: 9999,
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong>Fill Employee Benchmark Form (Voice)</strong>
                        <XIcon
                            size={20}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                setOpen(false);
                                stop();
                            }}
                        />
                    </div>

                    <div style={{ marginTop: 10, fontSize: 13 }}>
                        <div>Transcript: {transcript}</div>
                        <div style={{ fontWeight: "bold" }}>Final: {finalTranscript}</div>
                    </div>

                    <div style={{ marginTop: 12, padding: 10, border: "1px solid #e5e7eb", borderRadius: 12 }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>Preview changes</div>

                        {pendingEntries.length === 0 ? (
                            <div style={{ fontSize: 13, opacity: 0.8 }}>
                                No pending changes yet. Speak a field + value.
                            </div>
                        ) : (
                            <div style={{ display: "grid", gap: 6 }}>
                                {pendingEntries.map(([k, v]) => {
                                    const label = FIELDS.find((f) => f.key === k)?.label ?? k;
                                    const displayValue =
                                        k === "EMP_CAT_CD" ? EMPLOYEE_CATEGORY_CODES[v] || v : String(v);

                                    return (
                                        <div
                                            key={k}
                                            style={{ display: "flex", justifyContent: "space-between", fontSize: 13, gap: 12 }}
                                        >
                                            <span>{label}</span>
                                            <span style={{ fontWeight: 700, textAlign: "right" }}>{displayValue}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                            <button
                                onClick={applyPatch}
                                disabled={pendingEntries.length === 0}
                                style={{
                                    flex: 1,
                                    padding: 10,
                                    borderRadius: 10,
                                    border: "none",
                                    cursor: pendingEntries.length === 0 ? "not-allowed" : "pointer",
                                    color: "white",
                                    background: pendingEntries.length === 0 ? "#9ca3af" : "#16a34a",
                                    fontWeight: 800,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                }}
                            >
                                <CheckCircleIcon size={18} weight="fill" />
                                Apply
                            </button>

                            <button
                                onClick={undo}
                                disabled={history.length === 0}
                                style={{
                                    padding: 10,
                                    borderRadius: 10,
                                    border: "1px solid #e5e7eb",
                                    cursor: history.length === 0 ? "not-allowed" : "pointer",
                                    background: "white",
                                    fontWeight: 800,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                }}
                            >
                                <ArrowCounterClockwiseIcon size={18} />
                                Undo
                            </button>
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop: 12,
                            fontSize: 12,
                            color: "#4b5563",
                            lineHeight: 1.5,
                            background: "#f9fafb",
                            border: "1px solid #e5e7eb",
                            borderRadius: 10,
                            padding: 10,
                        }}
                    >
                        <div><strong>Examples:</strong></div>
                        <div>• “school year id 7”</div>
                        <div>• “employee category teachers”</div>
                        <div>• “total employees 45”</div>
                        <div>• “min salary 32000”</div>
                        <div>• “apply” / “undo” / “clear max salary”</div>
                    </div>

                    <button
                        onClick={() => (listening ? stop() : start())}
                        style={{
                            marginTop: 12,
                            width: "100%",
                            padding: 10,
                            borderRadius: 10,
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold",
                            color: "white",
                            background: listening ? "#ef4444" : buttonColor,
                        }}
                    >
                        {listening ? "Stop Listening" : "Start Listening"}
                    </button>
                </div>
            )}

            <button
                onClick={() => {
                    setOpen((v) => {
                        const next = !v;
                        if (!next) stop();
                        return next;
                    });
                }}
                title="Voice-fill Employee Benchmark Form"
                style={{
                    position: "fixed",
                    right: 10,
                    bottom: 10,
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: "none",
                    background: buttonColor,
                    cursor: "pointer",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10000,
                }}
            >
                <MicrophoneIcon size={28} color="white" weight="fill" />
            </button>
        </>
    );
}