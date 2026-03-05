import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    MicrophoneIcon,
    XIcon,
    CheckCircleIcon,
    ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { useWebSpeech } from "../hooks/useWebSpeech";

const FIELDS = [
    { key: "SCHOOL_ID", label: "School ID", aliases: ["school id", "school"] },
    { key: "SCHOOL_YR_ID", label: "School Year ID", aliases: ["school year", "school year id", "year id"] },
    { key: "GRADE_DEF_ID", label: "Grade Definition ID", aliases: ["grade definition", "grade id", "grade definition id"] },
    { key: "CAPACITY_ENROLL", label: "Capacity Enrollment", aliases: ["capacity", "capacity enroll", "capacity enrollment"] },
    { key: "CONTRACTED_ENROLL_BOYS", label: "Contracted Boys", aliases: ["contracted boys", "boys contracted", "boys enrollment"] },
    { key: "CONTRACTED_ENROLL_GIRLS", label: "Contracted Girls", aliases: ["contracted girls", "girls contracted", "girls enrollment"] },
    { key: "CONTRACTED_ENROLL_NB", label: "Contracted Non-Binary", aliases: ["contracted non binary", "non binary", "nb enrollment"] },
    { key: "COMPLETED_APPLICATION_TOTAL", label: "Completed Applications", aliases: ["completed applications", "applications total", "completed application total"] },
    { key: "ACCEPTANCES_TOTAL", label: "Acceptances", aliases: ["acceptances", "acceptance total", "accepted total"] },
    { key: "NEW_ENROLLMENTS_TOTAL", label: "New Enrollments", aliases: ["new enrollments", "new enrollment total", "enrollments total"] },
];

const normalize = (s) =>
    (s || "")
        .toLowerCase()
        .replace(/[^\w\s.%]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

function parseNumber(raw) {
    const cleaned = normalize(raw).replace("%", "").trim();
    const pointFixed = cleaned.replace(/\bpoint\b/g, ".");
    const match = pointFixed.match(/-?\d+(\.\d+)?/);
    return match ? match[0] : null;
}

function findFieldKey(text) {
    const t = normalize(text);
    const aliasList = FIELDS.flatMap((f) =>
        f.aliases.map((a) => ({ key: f.key, alias: a }))
    ).sort((a, b) => b.alias.length - a.alias.length);

    for (const { key, alias } of aliasList) {
        if (t.includes(normalize(alias))) return key;
    }
    return null;
}

function parseUtteranceToPatch(utterance) {
    const t = normalize(utterance);

    if (t.includes("undo")) return { __cmd: "undo" };
    if (t.includes("apply")) return { __cmd: "apply" };

    if (t.includes("clear")) {
        const key = findFieldKey(t);
        if (key) return { [key]: "" };
        return null;
    }

    const key = findFieldKey(t);
    if (!key) return null;

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
    validateAndShowErrors,
}) {
    const DEBUG_VOICE = true;

    const log = (...args) => {
        if (!DEBUG_VOICE) return;
        console.log("[VoiceFill]", ...args);
    };

    const [debugLog, setDebugLog] = useState([]);
    const pushDebug = useCallback((line) => {
        if (!DEBUG_VOICE) return;
        setDebugLog((prev) => {
            const next = [...prev, line];
            return next.length > 250 ? next.slice(next.length - 250) : next;
        });
    }, [DEBUG_VOICE]);

    const [open, setOpen] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [finalTranscript, setFinalTranscript] = useState("");
    const [pendingPatch, setPendingPatch] = useState({});
    const [history, setHistory] = useState([]);

    const pendingEntries = useMemo(() => Object.entries(pendingPatch), [pendingPatch]);

    const applyPatch = useCallback(() => {
        log("APPLY clicked. pendingPatch =", pendingPatch);
        pushDebug(`APPLY: ${JSON.stringify(pendingPatch)}`);

        if (pendingEntries.length === 0) return;

        setHistory((h) => [...h, formData]);

        const next = { ...formData };
        for (const [k, v] of pendingEntries) next[k] = v;

        setFormData(next);
        setPendingPatch({});
        if (validateAndShowErrors) validateAndShowErrors(next);
    }, [formData, pendingEntries, pendingPatch, pushDebug, setFormData, validateAndShowErrors]);

    const undo = useCallback(() => {
        log("UNDO clicked. history.length =", history.length);
        pushDebug("UNDO");

        setHistory((h) => {
            if (h.length === 0) return h;
            const prev = h[h.length - 1];
            setFormData(prev);
            if (validateAndShowErrors) validateAndShowErrors(prev);
            return h.slice(0, -1);
        });

        setPendingPatch({});
    }, [history.length, pushDebug, setFormData, validateAndShowErrors]);

    // ✅ Stable callbacks (prevents hook re-init loops)
    const onInterimText = useCallback((t) => {
        setTranscript(t);
        log("INTERIM:", t);
        pushDebug(`INTERIM: ${t}`);
    }, [pushDebug]);

    const onFinalText = useCallback((t) => {
        setFinalTranscript(t);
        log("FINAL:", t);
        pushDebug(`FINAL: ${t}`);

        const patch = parseUtteranceToPatch(t);
        log("PARSE:", patch);
        pushDebug(`PARSE: ${JSON.stringify(patch)}`);

        if (!patch) return;

        if (patch.__cmd === "apply") return applyPatch();
        if (patch.__cmd === "undo") return undo();

        setPendingPatch((p) => {
            const merged = { ...p, ...patch };
            log("PENDING PATCH ->", merged);
            pushDebug(`PENDING: ${JSON.stringify(merged)}`);
            return merged;
        });
    }, [applyPatch, pushDebug, undo]);

    const onDebug = useCallback((line) => {
        // hook debug lines
        pushDebug(`HOOK: ${line}`);
    }, [pushDebug]);

    const { supported, listening, start, stop } = useWebSpeech({
        onInterimText,
        onFinalText,
        debug: DEBUG_VOICE,
        debugLabel: "BenchmarkWebSpeech",
        onDebug,
    });

    useEffect(() => {
        log(listening ? "LISTENING STARTED" : "LISTENING STOPPED");
        pushDebug(listening ? "STATE: LISTENING STARTED" : "STATE: LISTENING STOPPED");
    }, [listening, pushDebug]);

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
                                log("UI close -> stop()");
                                pushDebug("UI: close -> stop()");
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
                            <div style={{ fontSize: 13, opacity: 0.8 }}>No pending changes yet. Speak a field + value.</div>
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
                            background: listening ? "#ef4444" : "#0ea5e9",
                        }}
                    >
                        {listening ? "Stop Listening" : "Start Listening"}
                    </button>

                    {DEBUG_VOICE && (
                        <div style={{ marginTop: 12 }}>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>Debug Log</div>
                            <div
                                style={{
                                    maxHeight: 160,
                                    overflow: "auto",
                                    fontSize: 11,
                                    background: "#f9fafb",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 10,
                                    padding: 8,
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {debugLog.length === 0 ? "No logs yet." : debugLog.join("\n")}
                            </div>

                            <button
                                onClick={() => setDebugLog([])}
                                style={{
                                    marginTop: 8,
                                    padding: "6px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #e5e7eb",
                                    background: "white",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                }}
                            >
                                Clear Debug Log
                            </button>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={() => {
                    setOpen((v) => {
                        const next = !v;
                        pushDebug(`UI: panel ${next ? "opened" : "closed"}`);
                        if (!next) stop();
                        return next;
                    });
                }}
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