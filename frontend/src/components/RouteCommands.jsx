import VoiceInput from './VoiceInput';

const RouteCommands = () => {
    const commands = [
        { phrase: "go to login", action: "/login" },
        { phrase: "go to signup", action: "/signup" },
        { phrase: "go to dashboard", action: "/dashboard" },
        { phrase: "go home", action: "/" },
    ];

    return (
        <div>
            <VoiceInput commands={commands} />
        </div>
    );
};

export default RouteCommands;
























/*
import React from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Dictaphone = () => {
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

    return (
        <div>
            <p>Microphone: {listening ? 'on' : 'off'}</p>
            <button onClick={SpeechRecognition.startListening}>Start</button>
            <button onClick={SpeechRecognition.stopListening}>Stop</button>
            <button onClick={resetTranscript}>Reset</button>
            <p>{transcript}</p>
        </div>
    );
};
export default Dictaphone;*/
