// src/contexts/ui/UIProvider.jsx
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useAuth, useStorage, UIContext } from "..";

// Clé de stockage
const UI_PREFERENCES_KEY = "mathmemo-ui-preferences";

/**
 * Fournisseur de contexte pour gérer les préférences d'interface utilisateur
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur UIContext
 */
export const UIProvider = ({ children }) => {
    const { user } = useAuth();
    const storage = useStorage();

    // États UI
    const [darkMode, setDarkMode] = useState(false);
    const [soundEffects, setSoundEffects] = useState(true);
    const [showTimer, setShowTimer] = useState(true);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Charger les préférences de l'utilisateur
    useEffect(() => {
        if (!storage.isInitialized) return;

        const loadUIPreferences = async () => {
            try {
                setLoading(true);

                // Si l'utilisateur est connecté, utilisez ses préférences
                if (user && user.preferences) {
                    setDarkMode(user.preferences.darkMode ?? false);
                    setSoundEffects(user.preferences.soundEffects ?? true);
                    setShowTimer(user.preferences.showTimer ?? true);
                } else {
                    // Sinon, utilisez les préférences stockées localement
                    const storedPreferences = await storage.loadData(
                        UI_PREFERENCES_KEY,
                        {
                            darkMode: false,
                            soundEffects: true,
                            showTimer: true,
                        }
                    );

                    setDarkMode(storedPreferences.darkMode);
                    setSoundEffects(storedPreferences.soundEffects);
                    setShowTimer(storedPreferences.showTimer);
                }
            } catch (err) {
                console.error(
                    "Erreur lors du chargement des préférences UI:",
                    err
                );
            } finally {
                setLoading(false);
            }
        };

        loadUIPreferences();
    }, [user, storage]);

    // Appliquer le mode sombre au document
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    // Sauvegarder les préférences
    useEffect(() => {
        if (!storage.isInitialized || loading) return;

        const saveUIPreferences = async () => {
            // Sauvegarder les préférences localement si pas d'utilisateur ou utilisateur invité
            if (!user || user.isGuest) {
                try {
                    // Créer un objet de préférences sérialisable
                    const preferences = {
                        darkMode,
                        soundEffects,
                        showTimer,
                    };

                    // S'assurer qu'aucune propriété non sérialisable n'est présente
                    // Convertir en JSON et revenir pour éliminer tout ce qui n'est pas sérialisable
                    const serializedPrefs = JSON.parse(
                        JSON.stringify(preferences)
                    );

                    await storage.saveData(UI_PREFERENCES_KEY, serializedPrefs);
                } catch (error) {
                    console.error(
                        "Erreur lors de la sauvegarde des préférences UI:",
                        error
                    );
                }
            }
        };

        saveUIPreferences();
    }, [storage, loading, user, darkMode, soundEffects, showTimer]);

    /**
     * Change le mode d'affichage (clair/sombre)
     * @param {boolean} isDark - Si true, active le mode sombre
     */
    const toggleDarkMode = useCallback(
        (isDark = !darkMode) => {
            setDarkMode(isDark);
        },
        [darkMode]
    );

    /**
     * Active ou désactive les effets sonores
     * @param {boolean} enabled - Si true, active les effets sonores
     */
    const toggleSoundEffects = useCallback(
        (enabled = !soundEffects) => {
            setSoundEffects(enabled);
        },
        [soundEffects]
    );

    /**
     * Active ou désactive l'affichage du chronomètre
     * @param {boolean} show - Si true, affiche le chronomètre
     */
    const toggleShowTimer = useCallback(
        (show = !showTimer) => {
            setShowTimer(show);
        },
        [showTimer]
    );

    /**
     * Affiche un toast (notification temporaire)
     * @param {string} message - Message à afficher
     * @param {string} type - Type de notification (success, error, info, warning)
     * @param {number} duration - Durée d'affichage en ms
     */
    const showToast = useCallback((message, type = "info", duration = 3000) => {
        // Créer un objet toast avec une ID unique
        const newToast = {
            message,
            type,
            id: Date.now(),
        };

        setToast(newToast);

        // Effacer automatiquement le toast après la durée spécifiée
        setTimeout(() => {
            setToast((currentToast) =>
                currentToast && currentToast.id === newToast.id
                    ? null
                    : currentToast
            );
        }, duration);
    }, []);

    /**
     * Ferme le toast actuellement affiché
     */
    const closeToast = useCallback(() => {
        setToast(null);
    }, []);

    /**
     * Obtient les préférences UI actuelles
     * @returns {Object} Préférences UI
     */
    const getUIPreferences = useCallback(() => {
        return {
            darkMode,
            soundEffects,
            showTimer,
        };
    }, [darkMode, soundEffects, showTimer]);

    // Valeur du contexte à exposer
    const contextValue = {
        darkMode,
        soundEffects,
        showTimer,
        toast,
        loading,
        toggleDarkMode,
        toggleSoundEffects,
        toggleShowTimer,
        showToast,
        closeToast,
        getUIPreferences,
    };

    return (
        <UIContext.Provider value={contextValue}>
            {children}
            {/* Toast Component */}
            {toast && (
                <div
                    className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-md w-full p-4 rounded-lg shadow-lg z-50 transition-opacity duration-300 ${
                        toast ? "opacity-100" : "opacity-0"
                    } ${
                        toast.type === "success"
                            ? "bg-green-500 text-white"
                            : toast.type === "error"
                            ? "bg-red-500 text-white"
                            : toast.type === "warning"
                            ? "bg-yellow-500 text-gray-900"
                            : "bg-blue-500 text-white"
                    }`}
                >
                    <div className="flex justify-between items-center">
                        <p>{toast.message}</p>
                        <button
                            onClick={closeToast}
                            className="ml-4 text-sm p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                            aria-label="Fermer"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </UIContext.Provider>
    );
};

UIProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default UIProvider;
