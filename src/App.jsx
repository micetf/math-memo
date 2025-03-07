// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProviders } from "./AppProviders";
import { registerServiceWorker } from "./services/pwaService";
import Home from "./pages/Home";
import Exercise from "./pages/Exercise";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Profiles from "./pages/Profiles";
import { Toast } from "./components/common/Toast";

/**
 * Composant principal de l'application
 * @returns {JSX.Element} Composant App
 */
const App = () => {
    // Enregistrer le service worker une seule fois au démarrage
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
        <AppProviders>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/exercise" element={<Exercise />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profiles" element={<Profiles />} />
                    {/* Rediriger les routes inconnues vers l'accueil */}
                    <Route path="*" element={<Home />} />
                </Routes>
                <Toast />
            </Router>
        </AppProviders>
    );
};

export default App;
