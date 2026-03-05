import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MicrophoneIcon, XIcon } from "@phosphor-icons/react";
import { useWebSpeech } from "../hooks/useWebSpeech"; // adjust path if needed

const normalize = (s) => (s || "").toLowerCase().trim();

function matchPhrase(text, phrase) {
    const t = normalize(text);
    if (!t) return false;

    if (Array.isArray(phrase)) {
        return phrase.some((p) => t.includes(normalize(p)));
    }
    return t.includes(normalize(phrase));
}

export default function VoiceButton({ commands = [] }) {
    const [open, setOpen] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [finalTranscript, setFinalTranscript] = useState("");

    const navigate = useNavigate();

    const compiled = useMemo(() => {
        return commands.map((c) => ({
            phrase: c.phrase,
            action: c.action,
        }));
    }, [commands]);

    const { supported, listening, toggle, stop } = useWebSpeech({
        onInterimText: (t) => setTranscript(t),
        onFinalText: (t) => {
            setFinalTranscript(t);

            for (const { phrase, action } of compiled) {
                if (matchPhrase(t, phrase)) {
                    if (typeof action === "string") navigate(action);
                    else if (typeof action === "function") action();
                    break;
                }
            }
        },
    });

    if (!supported) return null;

    return (
        <>
            {open && (
                <div
                    style={{
                        position: "fixed",
                        left: 20,
                        bottom: 92,
                        width: 340,
                        background: "white",
                        borderRadius: 16,
                        boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                        padding: 16,
                        zIndex: 9999,
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong>Voice Navigation</strong>
                        <XIcon
                            size={20}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                setOpen(false);
                                stop();
                            }}
                        />
                    </div>

                    <p style={{ marginTop: 10, fontSize: 13 }}>Transcript: {transcript}</p>
                    <p style={{ fontWeight: "bold", fontSize: 14 }}>Final: {finalTranscript}</p>

                    <button
                        onClick={toggle}
                        style={{
                            marginTop: 12,
                            width: "100%",
                            padding: 10,
                            borderRadius: 10,
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold",
                            color: "white",
                            background: listening ? "#ef4444" : "#f97316",
                        }}
                    >
                        {listening ? "Stop Listening" : "Start Listening"}
                    </button>

                    <div style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>
                        Try: “go to dashboard”, “go to login”, “go to sign up”, “log out”
                    </div>
                </div>
            )}

            <button
                onClick={() => setOpen((v) => !v)}
                style={{
                    position: "fixed",
                    left: 20,
                    bottom: 20,
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: "none",
                    background: "#f97316",
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