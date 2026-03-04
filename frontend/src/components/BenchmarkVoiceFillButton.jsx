import React, { useMemo, useState } from "react";
import { MicrophoneIcon, XIcon, CheckCircleIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { useWebSpeech } from "../hooks/useWebSpeech"; // adjust path if needed

const FIELDS = [
    { key: "year", label: "Year", aliases: ["year"] },
    { key: "applicants", label: "Applicants", aliases: ["applicants", "total applicants"] },
    { key: "enrolled", label: "Enrolled", aliases: ["enrolled", "total enrolled"] },
    { key: "internationalPerc", label: "% International", aliases: ["international", "international percent", "international percentage"] },
    { key: "teacherStudentRatio", label: "Student-Teacher Ratio", aliases: ["ratio", "student teacher ratio", "teacher student ratio"] },
    { key: "avgGPA", label: "Average GPA", aliases: ["gpa", "average gpa"] },
    { key: "aveTestScore", label: "Average Test Score", aliases: ["test score", "average test score", "score"] },
    { key: "percentAthlete", label: "% Athletics", aliases: ["athlete", "athletes", "percent athlete", "athletics"] },
];

const normalize = (s) =>
    (s || "")
        .toLowerCase()
        .replace(/[^\w\s.%]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

function parseNumber(raw) {
    const cleaned = normalize(raw).replace("%", "").trim();
    // handle "point" e.g. "3 point 8"
    const pointFixed = cleaned.replace(/\bpoint\b/g, ".");
    const match = pointFixed.match(/-?\d+(\.\d+)?/);
    return match ? match[0] : null; // keep string; your form stores strings
}

function findFieldKey(text) {
    const t = normalize(text);
    // prefer longer aliases first
    const aliasList = FIELDS.flatMap((f) => f.aliases.map((a) => ({ key: f.key, alias: a })))
        .sort((a, b) => b.alias.length - a.alias.length);

    for (const { key, alias } of aliasList) {
        if (t.includes(normalize(alias))) return key;
    }
    return null;
}

function parseUtteranceToPatch(utterance) {
    const t = normalize(utterance);

    // Commands:
    // "set year to 2024"
    // "year 2024"
    // "international percent 12"
    // "gpa 3.8"
    // "clear gpa"
    // "undo"
    // "apply"
    if (t.includes("undo")) return { __cmd: "undo" };
    if (t.includes("apply")) return { __cmd: "apply" };
    if (t.includes("clear")) {
        const key = findFieldKey(t);
        if (key) return { [key]: "" };
        return null;
    }

    const key = findFieldKey(t);
    if (!key) return null;

    // try to capture after "to" if present
    let rhs = t;
    const toIdx = t.indexOf(" to ");
    if (toIdx !== -1) rhs = t.slice(toIdx + 4);

    const num = parseNumber(rhs);
    if (num == null) return null;

    return { [key]: num };
}

export default function BenchmarkVoiceFillButton({
    formData,
    setFormData,
    validateAndShowErrors, // optional function you pass in
}) {
    const [open, setOpen] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [finalTranscript, setFinalTranscript] = useState("");

    // pendingPatch is what user can preview before applying
    const [pendingPatch, setPendingPatch] = useState({});
    const [history, setHistory] = useState([]); // store previous formData snapshots for undo

    const pendingEntries = useMemo(() => Object.entries(pendingPatch), [pendingPatch]);

    const applyPatch = () => {
        if (pendingEntries.length === 0) return;
        setHistory((h) => [...h, formData]);
        const next = { ...formData };
        for (const [k, v] of pendingEntries) next[k] = v;
        setFormData(next);
        setPendingPatch({});
        if (validateAndShowErrors) validateAndShowErrors(next);
    };

    const undo = () => {
        setHistory((h) => {
            if (h.length === 0) return h;
            const prev = h[h.length - 1];
            setFormData(prev);
            if (validateAndShowErrors) validateAndShowErrors(prev);
            return h.slice(0, -1);
        });
        setPendingPatch({});
    };

    const { supported, listening, toggle, stop } = useWebSpeech({
        onInterimText: (t) => setTranscript(t),
        onFinalText: (t) => {
            setFinalTranscript(t);

            const patch = parseUtteranceToPatch(t);
            if (!patch) return;

            if (patch.__cmd === "apply") return applyPatch();
            if (patch.__cmd === "undo") return undo();

            setPendingPatch((p) => ({ ...p, ...patch }));
        },
    });

    if (!supported) return null;

    return (
        <>
            {open && (
                <div
                    style={{
                        position: "fixed",
                        right: 20,
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
                        <strong>Fill Benchmark Form (Voice)</strong>
                        <XIcon
                            size={20}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                setOpen(false);
                                stop();
                            }}
                        />
                    </div>

                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
                        Say things like:
                        <div style={{ marginTop: 6 }}>
                            • “set year to 2024”<br />
                            • “applicants 5200”<br />
                            • “international percent 12”<br />
                            • “gpa 3.8”<br />
                            • “clear test score”<br />
                            • “apply” / “undo”
                        </div>
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
                                    return (
                                        <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                            <span>{label}</span>
                                            <span style={{ fontWeight: 700 }}>{String(v)}</span>
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

                    <button
                        onClick={() => {
                            if (listening) {
                                stop();            // <-- force stop
                                setTranscript(""); // optional: clear interim
                                // setFinalTranscript(""); // optional
                            } else {
                                toggle();          // or start() if your hook exposes it
                            }
                        }}
                        style={{
                            marginTop: 12,
                            width: "100%",
                            padding: 10,
                            borderRadius: 10,
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold",
                            color: "white",
                            background: listening ? "#ef4444" : "#0ea5e9",
                        }}
                    >
                        {listening ? "Stop Listening" : "Start Listening"}
                    </button>
                </div>
            )}

            {/* Floating button on the right for FORM filling */}
            <button
                onClick={() => setOpen((v) => !v)}
                title="Voice-fill Benchmark Form"
                style={{
                    position: "fixed",
                    right: 20,
                    bottom: 20,
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: "none",
                    background: "#0ea5e9",
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