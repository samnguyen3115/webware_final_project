import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import './App.css';
import SpeechRecognition, {useSpeechRecognition} from "react-speech-recognition";
import "regenerator-runtime/runtime";

function VoiceRouter() {
    const navigate = useNavigate();
    const commands = [
        {
            command: ["go to *", "open *"],
            callback: (page) => {
                const path = `/${page.toLowerCase()}`;
                navigate(path);
            },
        },
    ];

    const {transcript} = useSpeechRecognition({commands});

    return (
        <>
            <p id = "transcript"> Transcript: {transcript}</p>
            <button onClick={SpeechRecognition.startListening}> Voice Input </button>
        </>
    );

}


function App() {

    //const [redirectURL, setRedirectURL] = useState("");

  return (
    <AuthProvider>
      <Router>
          <VoiceRouter />
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>  
      </Router>

    </AuthProvider>
  );
}

export default App;
