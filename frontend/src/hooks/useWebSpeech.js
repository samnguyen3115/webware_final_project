import { useEffect, useRef, useState } from "react";

export function useWebSpeech({
    lang = "en-US",
    continuous = true,
    interimResults = true,
    onFinalText,
    onInterimText,
} = {}) {
    const recognitionRef = useRef(null);
    const listeningRef = useRef(false);

    const [supported, setSupported] = useState(true);
    const [listening, setListening] = useState(false);

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.interimResults = interimResults;
        recognition.continuous = continuous;

        recognition.onstart = () => setListening(true);

        recognition.onresult = (event) => {
            // Build full transcript across results
            let full = "";
            for (let i = 0; i < event.results.length; i++) {
                full += event.results[i][0].transcript;
            }

            // Interim callback
            if (onInterimText) onInterimText(full);

            // Final callback for latest final segment
            const last = event.results[event.results.length - 1];
            if (last?.isFinal) {
                const finalFull = full.trim();
                if (onFinalText) onFinalText(finalFull);
            }
        };

        recognition.onend = () => {
            // Auto-restart if user still wants listening
            if (listeningRef.current) recognition.start();
            else setListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            try {
                recognition.stop();
            } catch { }
        };
    }, [lang, interimResults, continuous, onFinalText, onInterimText]);

    const start = () => {
        const rec = recognitionRef.current;
        if (!rec) return;
        listeningRef.current = true;
        try {
            rec.start();
        } catch { }
    };

    const stop = () => {
        const rec = recognitionRef.current;
        if (!rec) return;
        listeningRef.current = false;
        try {
            rec.stop();
        } catch { }
        setListening(false);
    };

    const toggle = () => (listeningRef.current ? stop() : start());

    return { supported, listening, start, stop, toggle };
}