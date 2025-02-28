/**
 * @file Settings.jsx
 * @description Page de paramètres de l'application
 */

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Icon } from "../components/common/Icon";
import AuthContext from "../contexts/AuthContext";
import { DIFFICULTY_LEVELS } from "../data/progressions";
import { updateCache } from "../services/pwaService";

/**
 * Page de paramètres de l'application
 * @returns {JSX.Element} Page Settings
 */
const Settings = () => {
    const navigate = useNavigate();
    const { user, updateProfile, logout, loginAsGuest } =
        useContext(AuthContext);

    const [displayName, setDisplayName] = useState(user?.name || "");
    const [selectedLevel, setSelectedLevel] = useState(
        user?.level || DIFFICULTY_LEVELS.CP
    );
    const [showTimer, setShowTimer] = useState(
        user?.preferences?.showTimer !== undefined
            ? user.preferences.showTimer
            : true
    );
    const [soundEffects, setSoundEffects] = useState(
        user?.preferences?.soundEffects !== undefined
            ? user.preferences.soundEffects
            : true
    );
    const [darkMode, setDarkMode] = useState(
        user?.preferences?.darkMode !== undefined
            ? user.preferences.darkMode
            : false
    );
    const [message, setMessage] = useState(null);

    /**
     * Met à jour les paramètres de l'utilisateur
     * @param {Event} e - Événement de soumission du formulaire
     */
    const handleSaveSettings = (e) => {
        e.preventDefault();

        if (!user) {
            // Créer un compte invité si nécessaire
            const guestUser = loginAsGuest();

            if (guestUser) {
                // Mettre à jour le profil de l'invité
                updateProfile({
                    name: displayName || "Invité",
                    level: selectedLevel,
                    preferences: {
                        showTimer,
                        soundEffects,
                        darkMode,
                    },
                });

                setMessage({
                    type: "success",
                    text: "Paramètres enregistrés avec succès!",
                });
            }
        } else {
            // Mettre à jour le profil de l'utilisateur existant
            updateProfile({
                name: displayName,
                level: selectedLevel,
                preferences: {
                    showTimer,
                    soundEffects,
                    darkMode,
                },
            });

            setMessage({
                type: "success",
                text: "Paramètres enregistrés avec succès!",
            });
        }

        // Appliquer le mode sombre si activé
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        // Effacer le message après 3 secondes
        setTimeout(() => {
            setMessage(null);
        }, 3000);
    };

    /**
     * Déconnecte l'utilisateur
     */
    const handleLogout = () => {
        if (window.confirm("Es-tu sûr de vouloir te déconnecter?")) {
            logout();
            navigate("/");
        }
    };

    /**
     * Réinitialise toutes les données
     */
    const handleResetData = () => {
        if (
            window.confirm(
                "Es-tu sûr de vouloir réinitialiser toutes tes données? Cette action est irréversible."
            )
        ) {
            // Effacer les données du localStorage
            localStorage.clear();

            // Recharger l'application
            window.location.reload();
        }
    };

    /**
     * Met à jour le cache de l'application
     */
    const handleUpdateCache = async () => {
        setMessage({
            type: "info",
            text: "Mise à jour en cours...",
        });

        const success = await updateCache();

        if (success) {
            setMessage({
                type: "success",
                text: "Application mise à jour avec succès!",
            });
        } else {
            setMessage({
                type: "error",
                text: "Impossible de mettre à jour l'application",
            });
        }

        // Effacer le message après 3 secondes
        setTimeout(() => {
            setMessage(null);
        }, 3000);
    };

    return (
        <Layout
            title="Paramètres"
            showBackButton
            onBackClick={() => navigate("/")}
        >
            <div className="max-w-2xl mx-auto">
                {message && (
                    <div
                        className={`mb-4 p-3 rounded-lg ${
                            message.type === "success"
                                ? "bg-green-100 text-green-700"
                                : message.type === "error"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                        }`}
                    >
                        <div className="flex items-center">
                            <Icon
                                name={
                                    message.type === "success"
                                        ? "checkCircle"
                                        : message.type === "error"
                                        ? "errorCircle"
                                        : "settings"
                                }
                                className="mr-2"
                                size="20"
                            />
                            <span>{message.text}</span>
                        </div>
                    </div>
                )}

                <Card elevated className="mb-6">
                    <div className="p-4">
                        <h2 className="text-xl font-semibold mb-4">Profil</h2>

                        <form onSubmit={handleSaveSettings}>
                            <div className="space-y-4">
                                {/* Nom d'affichage */}
                                <div>
                                    <label
                                        htmlFor="displayName"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Nom d&lsquo;affichage
                                    </label>
                                    <input
                                        type="text"
                                        id="displayName"
                                        value={displayName}
                                        onChange={(e) =>
                                            setDisplayName(e.target.value)
                                        }
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                        placeholder="Comment veux-tu être appelé?"
                                    />
                                </div>

                                {/* Niveau scolaire */}
                                <div>
                                    <label
                                        htmlFor="level"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Niveau scolaire
                                    </label>
                                    <select
                                        id="level"
                                        value={selectedLevel}
                                        onChange={(e) =>
                                            setSelectedLevel(e.target.value)
                                        }
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    >
                                        <option value={DIFFICULTY_LEVELS.CP}>
                                            CP (6-7 ans)
                                        </option>
                                        <option value={DIFFICULTY_LEVELS.CE1}>
                                            CE1 (7-8 ans)
                                        </option>
                                        <option value={DIFFICULTY_LEVELS.CE2}>
                                            CE2 (8-9 ans)
                                        </option>
                                    </select>
                                </div>

                                <h3 className="font-semibold text-lg mt-6 mb-3">
                                    Préférences
                                </h3>

                                {/* Option: Afficher le chronomètre */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label
                                            htmlFor="showTimer"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Afficher le chronomètre
                                        </label>
                                        <p className="text-xs text-gray-500">
                                            Voir le temps pris pour répondre à
                                            chaque exercice
                                        </p>
                                    </div>
                                    <div className="relative inline-block w-10 mr-2 align-middle">
                                        <input
                                            type="checkbox"
                                            id="showTimer"
                                            checked={showTimer}
                                            onChange={() =>
                                                setShowTimer(!showTimer)
                                            }
                                            className="sr-only"
                                        />
                                        <span
                                            className={`${
                                                showTimer
                                                    ? "bg-blue-500"
                                                    : "bg-gray-300"
                                            } block h-6 w-10 rounded-full transition-colors duration-200`}
                                        ></span>
                                        <span
                                            className={`${
                                                showTimer
                                                    ? "translate-x-4"
                                                    : "translate-x-0"
                                            } absolute left-1 top-1 block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                                        ></span>
                                    </div>
                                </div>

                                {/* Option: Effets sonores */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label
                                            htmlFor="soundEffects"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Effets sonores
                                        </label>
                                        <p className="text-xs text-gray-500">
                                            Jouer des sons lors des réponses
                                            correctes et incorrectes
                                        </p>
                                    </div>
                                    <div className="relative inline-block w-10 mr-2 align-middle">
                                        <input
                                            type="checkbox"
                                            id="soundEffects"
                                            checked={soundEffects}
                                            onChange={() =>
                                                setSoundEffects(!soundEffects)
                                            }
                                            className="sr-only"
                                        />
                                        <span
                                            className={`${
                                                soundEffects
                                                    ? "bg-blue-500"
                                                    : "bg-gray-300"
                                            } block h-6 w-10 rounded-full transition-colors duration-200`}
                                        ></span>
                                        <span
                                            className={`${
                                                soundEffects
                                                    ? "translate-x-4"
                                                    : "translate-x-0"
                                            } absolute left-1 top-1 block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                                        ></span>
                                    </div>
                                </div>

                                {/* Option: Mode sombre */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label
                                            htmlFor="darkMode"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Mode sombre
                                        </label>
                                        <p className="text-xs text-gray-500">
                                            Activer le thème sombre pour
                                            l&lsquo;application
                                        </p>
                                    </div>
                                    <div className="relative inline-block w-10 mr-2 align-middle">
                                        <input
                                            type="checkbox"
                                            id="darkMode"
                                            checked={darkMode}
                                            onChange={() =>
                                                setDarkMode(!darkMode)
                                            }
                                            className="sr-only"
                                        />
                                        <span
                                            className={`${
                                                darkMode
                                                    ? "bg-blue-500"
                                                    : "bg-gray-300"
                                            } block h-6 w-10 rounded-full transition-colors duration-200`}
                                        ></span>
                                        <span
                                            className={`${
                                                darkMode
                                                    ? "translate-x-4"
                                                    : "translate-x-0"
                                            } absolute left-1 top-1 block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                                        ></span>
                                    </div>
                                </div>

                                {/* Bouton de sauvegarde */}
                                <div className="mt-6">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        fullWidth
                                    >
                                        Enregistrer les paramètres
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </Card>

                {/* Section: Gestion de l'application */}
                <Card elevated className="mb-6">
                    <div className="p-4">
                        <h2 className="text-xl font-semibold mb-4">
                            Gestion de l&lsquo;application
                        </h2>

                        <div className="space-y-3">
                            <div
                                className="p-3 rounded-lg bg-blue-50 flex items-center justify-between cursor-pointer hover:bg-blue-100"
                                onClick={handleUpdateCache}
                            >
                                <div className="flex items-center">
                                    <Icon
                                        name="settings"
                                        className="mr-3 text-blue-600"
                                    />
                                    <div>
                                        <h3 className="font-medium">
                                            Mettre à jour l&lsquo;application
                                        </h3>
                                        <p className="text-xs text-gray-600">
                                            Télécharger la dernière version
                                            disponible
                                        </p>
                                    </div>
                                </div>
                                <Icon
                                    name="arrowRight"
                                    className="text-gray-500"
                                />
                            </div>

                            <div
                                className="p-3 rounded-lg bg-yellow-50 flex items-center justify-between cursor-pointer hover:bg-yellow-100"
                                onClick={handleResetData}
                            >
                                <div className="flex items-center">
                                    <Icon
                                        name="errorCircle"
                                        className="mr-3 text-yellow-600"
                                    />
                                    <div>
                                        <h3 className="font-medium">
                                            Réinitialiser les données
                                        </h3>
                                        <p className="text-xs text-gray-600">
                                            Effacer toutes les données et
                                            recommencer à zéro
                                        </p>
                                    </div>
                                </div>
                                <Icon
                                    name="arrowRight"
                                    className="text-gray-500"
                                />
                            </div>

                            {user && !user.isGuest && (
                                <div
                                    className="p-3 rounded-lg bg-red-50 flex items-center justify-between cursor-pointer hover:bg-red-100"
                                    onClick={handleLogout}
                                >
                                    <div className="flex items-center">
                                        <Icon
                                            name="close"
                                            className="mr-3 text-red-600"
                                        />
                                        <div>
                                            <h3 className="font-medium">
                                                Se déconnecter
                                            </h3>
                                            <p className="text-xs text-gray-600">
                                                Quitter cette session
                                            </p>
                                        </div>
                                    </div>
                                    <Icon
                                        name="arrowRight"
                                        className="text-gray-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Section: À propos */}
                <Card elevated>
                    <div className="p-4">
                        <h2 className="text-xl font-semibold mb-4">À propos</h2>

                        <div className="space-y-2">
                            <p className="text-sm">
                                <strong>MathMemo</strong> est une application
                                éducative conçue pour aider les élèves du cycle
                                2 (CP, CE1, CE2) à mémoriser les faits
                                numériques essentiels à travers un système de
                                répétition espacée adapté à leur progression.
                            </p>

                            <p className="text-sm">Version: 1.0.0</p>

                            <p className="text-sm mt-4 text-gray-600">
                                © 2023 MathMemo - Tous droits réservés
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default Settings;
