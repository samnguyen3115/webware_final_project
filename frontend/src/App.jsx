import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Benchmark from './pages/benchmark';
import PeerComparison from './pages/PeerComparison';
import './App.css';
// import SpeechRecognition, {useSpeechRecognition} from "react-speech-recognition";
import "regenerator-runtime/runtime";
import RouteCommands from "./components/RouteCommands.jsx";
import VoiceInput from "./components/VoiceInput.jsx";
import VoiceButton from './components/VoiceButton.jsx';

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


function RoleBasedHomeRedirect() {
  const { isAuthenticated, loading, user } = React.useContext(AuthContext);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/benchmark" replace />;
  }

  if (user?.role === 'school') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {

  //const [redirectURL, setRedirectURL] = useState("");
  const commands = [
    { phrase: "go to dashboard", action: "/dashboard" },
    { phrase: "go to login", action: "/login" },
    { phrase: "go to sign up", action: "/signup" },
    { phrase: ["log out", "logout"], action: () => console.log("Logging out...") }
  ];

  return (
    <AuthProvider>
      <Router>
        {/* <RouteCommands /> */}

        {/*<VoiceRouter />*/}
        <VoiceButton commands={commands} />
        <div className="app-container">
          {/*<VoiceInput commands ={commands} />*/}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'school']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/peer-comparison"
              element={
                <ProtectedRoute allowedRoles={['admin', 'school']}>
                  <PeerComparison />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benchmark"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Benchmark />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<RoleBasedHomeRedirect />} />
          </Routes>
        </div>
      </Router>

    </AuthProvider>
  );
}

export default App;
