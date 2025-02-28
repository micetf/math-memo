/**
 * @file App.jsx
 * @description Composant principal de l'application
 */

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import { ProgressProvider } from "./contexts/ProgressProvider";
import { registerServiceWorker } from "./services/pwaService";
import Home from "./pages/Home";
import Exercise from "./pages/Exercise";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";

/**
 * Composant principal de l'application
 * @returns {JSX.Element} Composant App
 */
const App = () => {
    // Enregistrer le service worker au chargement de l'application
    useEffect(() => {
        const initServiceWorker = async () => {
            try {
                await registerServiceWorker();
                console.log("Service Worker enregistré avec succès");
            } catch (error) {
                console.error(
                    "Erreur lors de l'enregistrement du Service Worker:",
                    error
                );
            }
        };

        initServiceWorker();
    }, []);

    return (
        <AuthProvider>
            <ProgressProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/exercise" element={<Exercise />} />
                        <Route path="/progress" element={<Progress />} />
                        <Route path="/settings" element={<Settings />} />
                        {/* Rediriger les routes inconnues vers l'accueil */}
                        <Route path="*" element={<Home />} />
                    </Routes>
                </Router>
            </ProgressProvider>
        </AuthProvider>
    );
};

export default App;
