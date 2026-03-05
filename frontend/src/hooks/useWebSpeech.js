import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Key fixes:
 * - SpeechRecognition instance is created ONLY when lang/continuous/interimResults change.
 * - onFinalText/onInterimText/onDebug/debugLabel/debug are kept in refs (no re-init loop).
 * - stop() uses abort() for hard-stop.
 */
export function useWebSpeech({
    lang = "en-US",
    continuous = true,
    interimResults = true,
    onFinalText,
    onInterimText,

    debug = false,
    debugLabel = "useWebSpeech",
    onDebug, // optional: push debug lines to UI
} = {}) {
    const recognitionRef = useRef(null);

    // "user wants listening" gate for auto-restart onend
    const listeningWantedRef = useRef(false);

    // callback refs (so changing callbacks doesn't recreate recognition)
    const onFinalTextRef = useRef(onFinalText);
    const onInterimTextRef = useRef(onInterimText);
    const debugRef = useRef(debug);
    const debugLabelRef = useRef(debugLabel);
    const onDebugRef = useRef(onDebug);

    const [supported, setSupported] = useState(true);
    const [listening, setListening] = useState(false);

    // keep refs updated
    useEffect(() => {
        onFinalTextRef.current = onFinalText;
    }, [onFinalText]);

    useEffect(() => {
        onInterimTextRef.current = onInterimText;
    }, [onInterimText]);

    useEffect(() => {
        debugRef.current = debug;
    }, [debug]);

    useEffect(() => {
        debugLabelRef.current = debugLabel;
    }, [debugLabel]);

    useEffect(() => {
        onDebugRef.current = onDebug;
    }, [onDebug]);

    const dbg = useCallback((...args) => {
        if (!debugRef.current) return;

        const label = debugLabelRef.current || "useWebSpeech";
        console.log(`[${label}]`, ...args);

        const cb = onDebugRef.current;
        if (typeof cb === "function") {
            // keep UI debug line simple and safe
            const line = args
                .map((x) => (typeof x === "string" ? x : String(x)))
                .join(" ");
            try {
                cb(line);
            } catch {
                // ignore UI debug errors
            }
        }
    }, []);

    // Create recognition ONLY when core config changes
    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSupported(false);
            dbg("SpeechRecognition NOT supported.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.interimResults = interimResults;
        recognition.continuous = continuous;

        recognition.onstart = () => {
            setListening(true);
            dbg("EVENT onstart -> listening=true");
        };

        recognition.onresult = (event) => {
            let full = "";
            for (let i = 0; i < event.results.length; i++) {
                full += event.results[i][0].transcript;
            }

            dbg("EVENT onresult interim:", full);

            const interimCb = onInterimTextRef.current;
            if (typeof interimCb === "function") interimCb(full);

            const last = event.results[event.results.length - 1];
            if (last?.isFinal) {
                const finalFull = full.trim();
                dbg("EVENT onresult FINAL:", finalFull);
                const finalCb = onFinalTextRef.current;
                if (typeof finalCb === "function") finalCb(finalFull);
            }
        };

        recognition.onerror = (e) => {
            dbg("EVENT onerror:", e?.error || e);
        };

        recognition.onend = () => {
            dbg("EVENT onend. listeningWanted=", listeningWantedRef.current);

            if (listeningWantedRef.current) {
                try {
                    dbg("Auto-restart -> start()");
                    recognition.start();
                } catch (e) {
                    dbg("Auto-restart failed:", e?.message || e);
                    setListening(false);
                }
            } else {
                dbg("Not restarting -> listening=false");
                setListening(false);
            }
        };

        recognitionRef.current = recognition;
        dbg("INIT recognition created.", {
            lang,
            interimResults,
            continuous,
        });

        return () => {
            dbg("CLEANUP -> stop/abort recognition");
            try {
                listeningWantedRef.current = false;
                recognition.abort?.();
                recognition.stop?.();
            } catch {
                // ignore
            }
            recognitionRef.current = null;
        };
    }, [lang, interimResults, continuous, dbg]);

    const start = useCallback(() => {
        const rec = recognitionRef.current;
        if (!rec) return;

        dbg("CALL start()");
        listeningWantedRef.current = true;

        try {
            rec.start();
        } catch (e) {
            dbg("start() threw:", e?.message || e);
        }
    }, [dbg]);

    const stop = useCallback(() => {
        const rec = recognitionRef.current;
        if (!rec) return;

        dbg("CALL stop()");
        listeningWantedRef.current = false;

        try {
            if (typeof rec.abort === "function") {
                rec.abort();
                dbg("stop(): abort()");
            } else {
                rec.stop();
                dbg("stop(): stop()");
            }
        } catch (e) {
            dbg("stop() threw:", e?.message || e);
        }

        // Immediate UI reflect; onend comes later
        setListening(false);
    }, [dbg]);

    const toggle = useCallback(() => {
        dbg("CALL toggle(). listeningWanted was:", listeningWantedRef.current);
        return listeningWantedRef.current ? stop() : start();
    }, [dbg, start, stop]);

    return { supported, listening, start, stop, toggle };
}