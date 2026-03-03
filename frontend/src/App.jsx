import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import './App.css';
// import SpeechRecognition, {useSpeechRecognition} from "react-speech-recognition";
import "regenerator-runtime/runtime";
import VoiceInput from "./components/VoiceInput.jsx";

// function VoiceRouter() {
//     const navigate = useNavigate();
//     const commands = [
//         {
//             command: ["go to *", "open *"],
//             callback: (page) => {
//                 const path = `/${page.toLowerCase()}`;
//                 navigate(path);
//             },
//         },
//     ];
//
//     const {transcript} = useSpeechRecognition({commands});
//
//     return (
//         <>
//             <p id = "transcript"> Transcript: {transcript}</p>
//             <button onClick={SpeechRecognition.startListening}> Voice Input </button>
//         </>
//     );
//
// }


function App() {

    //const [redirectURL, setRedirectURL] = useState("");
    // const commands = [
    //     { phrase: "go to dashboard", action: "/dashboard" },
    //     { phrase: "go to login", action: "/login" },
    //     { phrase: "go to signup", action: "/signup" },
    //     { phrase: "logout", action: () => console.log("Logging out...") }
    // ];

  return (
    <AuthProvider>
      <Router>
          {/*<VoiceRouter />*/}
        <div className="app-container">
            {/*<VoiceInput commands ={commands} />*/}
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
