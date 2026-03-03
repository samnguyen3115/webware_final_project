import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const VoiceInput = ({ commands = [] }) => {
    const [listening, isListening] = useState(false);
    const [transcript, isTranscribing] = useState("");
    const [finalTranscript, setFinalTranscript] = useState("");
    const recognitionRef = useRef(null);
    const listeningRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        //implementing cross-browser support
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

        // Called when recognition starts successfully
        recognition.onstart = () => {
            isListening(true);
        };

        // Called when speech is recognized
        recognition.onresult = (event) => {
            let liveTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                liveTranscript += event.results[i][0].transcript;
            }
            isTranscribing(liveTranscript);

            if (event.results[0].isFinal) {
                setFinalTranscript(liveTranscript);

                // Execute commands if they match
                commands.forEach(({ phrase, action }) => {
                    if (liveTranscript.toLowerCase().includes(phrase.toLowerCase())) {
                        if (typeof action === "string") {
                            navigate(action); // navigate to route
                        } else if (typeof action === "function") {
                            action(); // call callback
                        }
                    }
                });
            }
        };

        // Keep recognition running until user stops
        recognition.onend = () => {
            if (listeningRef.current) {
                recognition.start(); // auto-restart
            } else {
                isListening(false);
            }
        };

        recognitionRef.current = recognition;
    }, [commands, navigate]);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (!listeningRef.current) {
            listeningRef.current = true;
            recognitionRef.current.start();
        } else {
            listeningRef.current = false;
            recognitionRef.current.stop();
            isListening(false);
        }
    };

    return (
        <div className="voice-input p-4 border rounded-md bg-gray-50">
            <p className="mb-1 text-gray-500 text-sm">
                Interim: <span className="text-gray-800">{transcript}</span>
            </p>
            <p className="mb-2 text-gray-700">
                Final: <span className="font-semibold">{finalTranscript}</span>
            </p>
            <button
                onClick={toggleListening}
                className={`px-4 py-2 rounded text-white ${
                    listening ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
                {listening ? "Stop Listening" : "Start Voice Input"}
            </button>
        </div>
    );
};

export default VoiceInput;