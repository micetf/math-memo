/**
 * @file Home.jsx
 * @description Page d'accueil de l'application
 */

import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Icon } from "../components/common/Icon";
import { ProgressBar } from "../components/common/ProgressBar";
import AuthContext from "../contexts/AuthContext";
import ProgressContext from "../contexts/ProgressContext";
import { DIFFICULTY_LEVELS } from "../data/progressions";
import { isAppInstalled, promptInstall } from "../services/pwaService";

/**
 * Page d'accueil de l'application
 * @returns {JSX.Element} Page Home
 */
const Home = () => {
    const navigate = useNavigate();
    const { user, loginAsGuest, updateProfile } = useContext(AuthContext);
    const { currentLevel, changeLevel, factsToReview, getOverallProgress } =
        useContext(ProgressContext);

    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(isAppInstalled());

    // Détecter si l'application peut être installée
    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Empêcher Chrome d'afficher automatiquement l'invite
            e.preventDefault();
            // Stocker l'événement pour l'utiliser plus tard
            setInstallPrompt(e);
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt
        );

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
        };
    }, []);

    // Vérifier si l'application est installée
    useEffect(() => {
        const checkIfInstalled = () => {
            setIsInstalled(isAppInstalled());
        };

        window.addEventListener("appinstalled", checkIfInstalled);

        return () => {
            window.removeEventListener("appinstalled", checkIfInstalled);
        };
    }, []);

    /**
     * Lance l'invite d'installation de la PWA
     */
    const handleInstallClick = async () => {
        if (installPrompt) {
            const installed = await promptInstall(installPrompt);

            if (installed) {
                setInstallPrompt(null);
                setIsInstalled(true);
            }
        }
    };

    /**
     * Lance une session d'exercices
     */
    const handleStartExercise = () => {
        // Si l'utilisateur n'est pas connecté, créer un compte invité
        if (!user) {
            loginAsGuest();
        }

        navigate("/exercise");
    };

    /**
     * Accède à la page de progression
     */
    const handleViewProgress = () => {
        navigate("/progress");
    };

    /**
     * Sélectionne un niveau de difficulté
     * @param {string} level - Niveau de difficulté
     */
    const handleSelectLevel = (level) => {
        console.log(`Selecting level: ${level} (current: ${currentLevel})`);

        // Ne rien faire si on clique sur le niveau déjà sélectionné
        if (level === currentLevel) {
            console.log("Level already selected, no change needed");
            return;
        }

        // Changer le niveau dans le contexte de progression
        changeLevel(level);

        // Mettre à jour le profil de l'utilisateur si connecté
        if (user) {
            console.log(`Updating user profile with new level: ${level}`);
            const updatedUser = updateProfile({
                level,
            });
            console.log("Updated user:", updatedUser);
        } else {
            console.log("No user logged in, level change will not persist");
        }

        // Force rerender to ensure the UI updates correctly
        setTimeout(() => {
            console.log("Current level after change:", currentLevel);
        }, 100);
    };

    // Si l'utilisateur est connecté, afficher des statistiques et actions personnalisées
    const stats = user ? getOverallProgress() : null;
    const hasFactsToReview = user && factsToReview && factsToReview.length > 0;

    return (
        <Layout hideFooter={false}>
            <div className="max-w-4xl mx-auto">
                {/* Bannière d'accueil */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">MathMemo</h1>
                    <p className="mb-4">
                        Apprends les faits numériques avec des exercices adaptés
                        à ton niveau !
                    </p>

                    <Button
                        variant="warning"
                        size="lg"
                        onClick={handleStartExercise}
                        className="mt-2"
                    >
                        Commencer les exercices
                    </Button>
                </div>

                {/* Section de progression (utilisateur connecté) */}
                {user && (
                    <Card elevated className="mb-6">
                        <div className="p-4">
                            <h2 className="text-xl font-semibold mb-2">
                                Bienvenue, {user.name} !
                            </h2>

                            {hasFactsToReview ? (
                                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                                    <div className="flex items-center">
                                        <Icon
                                            name="star"
                                            color="#FBBF24"
                                            className="mr-2"
                                        />
                                        <span className="font-medium">
                                            Tu as {factsToReview.length} faits à
                                            réviser aujourd&lsquo;hui
                                        </span>
                                    </div>

                                    <Button
                                        variant="primary"
                                        onClick={handleStartExercise}
                                        className="mt-3"
                                        fullWidth
                                    >
                                        Commencer la révision
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-green-50 p-4 rounded-lg mb-4">
                                    <div className="flex items-center">
                                        <Icon
                                            name="checkCircle"
                                            color="#10B981"
                                            className="mr-2"
                                        />
                                        <span className="font-medium">
                                            Tu as terminé toutes tes révisions
                                            pour aujourd&lsquo;hui !
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Résumé de progression */}
                            {stats && (
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">
                                            Progression totale
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {stats.factsByLevel[3] || 0} /{" "}
                                            {stats.totalFacts || 0} faits
                                            maîtrisés
                                        </span>
                                    </div>
                                    <ProgressBar
                                        value={stats.masteredPercentage || 0}
                                        variant="success"
                                        showLabel
                                    />

                                    <Button
                                        variant="secondary"
                                        onClick={handleViewProgress}
                                        className="mt-4"
                                        fullWidth
                                    >
                                        Voir ma progression complète
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Sélection du niveau (CP, CE1, CE2) */}
                <h2 className="text-xl font-semibold mb-4">
                    Choisis ton niveau
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Niveau CP */}
                    <Card
                        className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                            user && user.level === DIFFICULTY_LEVELS.CP
                                ? "border-2 border-blue-500"
                                : ""
                        }`}
                        onClick={() => handleSelectLevel(DIFFICULTY_LEVELS.CP)}
                    >
                        <div className="text-center p-4">
                            <div className="rounded-full bg-blue-100 w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl font-bold text-blue-600">
                                    CP
                                </span>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">
                                Cours Préparatoire
                            </h3>
                            <p className="text-sm text-gray-600">6-7 ans</p>
                            <p className="mt-2 text-sm">
                                Premiers nombres, additions et soustractions
                                simples
                            </p>
                        </div>
                    </Card>

                    {/* Niveau CE1 */}
                    <Card
                        className={`cursor-pointer hover:bg-green-50 transition-colors ${
                            user && user.level === DIFFICULTY_LEVELS.CE1
                                ? "border-2 border-green-500"
                                : ""
                        }`}
                        onClick={() => handleSelectLevel(DIFFICULTY_LEVELS.CE1)}
                    >
                        <div className="text-center p-4">
                            <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl font-bold text-green-600">
                                    CE1
                                </span>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">
                                Cours Élémentaire 1
                            </h3>
                            <p className="text-sm text-gray-600">7-8 ans</p>
                            <p className="mt-2 text-sm">
                                Additions avec retenue, soustractions, nombres
                                jusqu&lsquo;à 100
                            </p>
                        </div>
                    </Card>

                    {/* Niveau CE2 */}
                    <Card
                        className={`cursor-pointer hover:bg-purple-50 transition-colors ${
                            user && user.level === DIFFICULTY_LEVELS.CE2
                                ? "border-2 border-purple-500"
                                : ""
                        }`}
                        onClick={() => handleSelectLevel(DIFFICULTY_LEVELS.CE2)}
                    >
                        <div className="text-center p-4">
                            <div className="rounded-full bg-purple-100 w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl font-bold text-purple-600">
                                    CE2
                                </span>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">
                                Cours Élémentaire 2
                            </h3>
                            <p className="text-sm text-gray-600">8-9 ans</p>
                            <p className="mt-2 text-sm">
                                Multiplications, divisions simples, nombres
                                jusqu&lsquo;à 1000
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Bannière d'installation de l'application */}
                {!isInstalled && installPrompt && (
                    <Card
                        elevated
                        className="mb-6 bg-indigo-50 border-l-4 border-indigo-500"
                    >
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <Icon
                                    name="settings"
                                    color="#6366F1"
                                    className="mr-3"
                                    size="24"
                                />
                                <div>
                                    <h3 className="font-semibold">
                                        Installe MathMemo sur ton appareil
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Pour un accès plus rapide et utiliser
                                        l&lsquo;application sans connexion
                                        internet
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                onClick={handleInstallClick}
                                className="ml-4 whitespace-nowrap"
                            >
                                Installer
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Section informative */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                        <h3 className="text-lg font-semibold mb-2">
                            Comment ça marche ?
                        </h3>
                        <p className="text-gray-700 mb-3">
                            MathMemo utilise la méthode de répétition espacée
                            pour t&lsquo;aider à mémoriser efficacement les
                            faits numériques.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start">
                                <Icon
                                    name="checkCircle"
                                    color="#10B981"
                                    className="mr-2 flex-shrink-0"
                                />
                                <span>
                                    Répète les faits au bon moment pour mieux
                                    les retenir
                                </span>
                            </li>
                            <li className="flex items-start">
                                <Icon
                                    name="checkCircle"
                                    color="#10B981"
                                    className="mr-2 flex-shrink-0"
                                />
                                <span>
                                    Progression adaptée à ton rythme
                                    d&lsquo;apprentissage
                                </span>
                            </li>
                            <li className="flex items-start">
                                <Icon
                                    name="checkCircle"
                                    color="#10B981"
                                    className="mr-2 flex-shrink-0"
                                />
                                <span>
                                    Suivi de ta progression pour voir tes
                                    améliorations
                                </span>
                            </li>
                        </ul>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold mb-2">
                            Pourquoi s&lsquo;entraîner régulièrement ?
                        </h3>
                        <p className="text-gray-700 mb-3">
                            La mémorisation des faits numériques est essentielle
                            en mathématiques :
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start">
                                <Icon
                                    name="star"
                                    color="#FBBF24"
                                    className="mr-2 flex-shrink-0"
                                />
                                <span>
                                    Permet de libérer ta mémoire de travail pour
                                    résoudre des problèmes plus complexes
                                </span>
                            </li>
                            <li className="flex items-start">
                                <Icon
                                    name="star"
                                    color="#FBBF24"
                                    className="mr-2 flex-shrink-0"
                                />
                                <span>
                                    Améliore ta confiance et ta rapidité en
                                    calcul mental
                                </span>
                            </li>
                            <li className="flex items-start">
                                <Icon
                                    name="star"
                                    color="#FBBF24"
                                    className="mr-2 flex-shrink-0"
                                />
                                <span>
                                    Constitue une base solide pour les
                                    apprentissages mathématiques futurs
                                </span>
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
