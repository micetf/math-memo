// src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProviders } from "./AppProviders";
import { registerServiceWorker } from "./services/pwaService";
import { MigrationPrompt } from "./components/common/MigrationPrompt";
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
            <AppWithMigration />
        </AppProviders>
    );
};

/**
 * Composant qui gère la migration et l'affichage de l'application
 * Ce composant est à l'intérieur des providers, donc il a accès aux hooks de contexte
 * @returns {JSX.Element} Contenu de l'application avec gestion de migration
 */
const AppWithMigration = () => {
    const [showMigration, setShowMigration] = useState(false);
    const [isMigrationChecked, setIsMigrationChecked] = useState(false);

    // Nous allons vérifier si la migration est nécessaire au chargement
    useEffect(() => {
        // Vérifier s'il y a des données dans localStorage à migrer
        const hasLocalStorageData = Object.keys(localStorage).some(
            (key) =>
                key.startsWith("mathmemo-") || key.startsWith("spaced-rep-")
        );

        setShowMigration(hasLocalStorageData);
        setIsMigrationChecked(true);
    }, []);

    /**
     * Gère la fin de la migration
     * @param {boolean} success - Si la migration a réussi
     */
    const handleMigrationComplete = (success) => {
        console.log(
            `Migration ${
                success ? "terminée avec succès" : "ignorée ou échouée"
            }`
        );
        setShowMigration(false);
    };

    return (
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

            {/* Afficher la prompt de migration si nécessaire */}
            {showMigration && isMigrationChecked && (
                <MigrationPrompt
                    onMigrationComplete={handleMigrationComplete}
                />
            )}
        </Router>
    );
};

export default App;
