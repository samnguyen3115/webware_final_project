import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const VoiceInput = ({ commands = [] }) => {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [finalTranscript, setFinalTranscript] = useState("");
    const [debug, setDebug] = useState(null);

    const recognitionRef = useRef(null);
    const listeningRef = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Your browser does not support speech recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.continuous = true; // helps keep session alive

        recognition.onstart = () => {
            console.log("[SR] onstart");
            setListening(true);
        };

        recognition.onresult = (event) => {
            // Build BOTH:
            // 1) full transcript across all results
            // 2) delta transcript from resultIndex
            let full = "";
            let delta = "";

            for (let i = 0; i < event.results.length; i++) {
                const piece = event.results[i][0]?.transcript ?? "";
                full += piece;
                if (i >= event.resultIndex) delta += piece;
            }

            // last changed result (usually what you want)
            const lastIndex = event.results.length - 1;
            const last = event.results[lastIndex];
            const lastText = last?.[0]?.transcript ?? "";
            const isFinal = !!last?.isFinal;

            console.log("[SR] onresult", {
                resultIndex: event.resultIndex,
                resultsLength: event.results.length,
                lastIndex,
                isFinal,
                lastText,
                delta,
                full,
                rawEvent: event,
            });

            setTranscript(full);

            setDebug({
                resultIndex: event.resultIndex,
                resultsLength: event.results.length,
                lastIndex,
                isFinal,
                lastText,
                delta,
                full,
            });

            // Use the last result's finality, not results[0]
            if (isFinal) {
                setFinalTranscript(full);

                // Execute commands
                const lowered = full.toLowerCase();
                commands.forEach(({ phrase, action }) => {
                    if (lowered.includes(String(phrase).toLowerCase())) {
                        console.log("[SR] command matched:", phrase, action);
                        if (typeof action === "string") navigate(action);
                        else if (typeof action === "function") action();
                    }
                });
            }
        };

        recognition.onerror = (e) => {
            console.log("[SR] onerror", e);
            // Common: "not-allowed" if mic perms not granted
        };

        recognition.onend = () => {
            console.log("[SR] onend (listeningRef =", listeningRef.current, ")");
            if (listeningRef.current) {
                try {
                    recognition.start();
                } catch (err) {
                    console.log("[SR] restart error", err);
                }
            } else {
                setListening(false);
            }
        };

        recognitionRef.current = recognition;

        // Cleanup (important for React dev / StrictMode)
        return () => {
            listeningRef.current = false;
            try {
                recognition.stop();
            } catch { }
            recognitionRef.current = null;
        };
    }, [commands, navigate]);

    const toggleListening = () => {
        const rec = recognitionRef.current;
        if (!rec) return;

        if (!listeningRef.current) {
            listeningRef.current = true;
            try {
                rec.start();
            } catch (err) {
                console.log("[SR] start error", err);
            }
        } else {
            listeningRef.current = false;
            try {
                rec.stop();
            } catch { }
            setListening(false);
        }
    };

    return (
        <div className="voice-input p-4 border rounded-md bg-gray-50">
            <p className="mb-1 text-gray-500 text-sm">
                Transcript: <span className="text-gray-800">{transcript}</span>
            </p>
            <p className="mb-2 text-gray-700">
                Final: <span className="font-semibold">{finalTranscript}</span>
            </p>

            {/* Debug panel so you can see what it's doing without DevTools */}
            {debug && (
                <pre className="text-xs bg-white border rounded p-2 mb-2 overflow-auto max-h-48">
                    {JSON.stringify(debug, null, 2)}
                </pre>
            )}

            <button
                onClick={toggleListening}
                className={`px-4 py-2 rounded text-white ${listening ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                    }`}
            >
                {listening ? "Stop Listening" : "Start Voice Input"}
            </button>
        </div>
    );
};

export default VoiceInput;