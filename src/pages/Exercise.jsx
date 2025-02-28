/**
 * @file Exercise.jsx
 * @description Page principale d'exercices avec répétition espacée
 */

import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { ExerciseCard } from "../components/exercises/ExerciseCard";
import { ProgressBar } from "../components/common/ProgressBar";
import { Icon } from "../components/common/Icon";
import ProgressContext from "../contexts/ProgressContext";
import AuthContext from "../contexts/AuthContext";
import { useAudio } from "../hooks/useAudio";

/**
 * Page d'exercices qui présente des faits numériques selon l'algorithme de répétition espacée
 * @returns {JSX.Element} Page Exercise
 */
const Exercise = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { getFactsToReviewToday, updateFactProgress } =
        useContext(ProgressContext);

    const [currentSession, setCurrentSession] = useState(null);
    const [currentFactIndex, setCurrentFactIndex] = useState(0);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [sessionStats, setSessionStats] = useState({
        correct: 0,
        incorrect: 0,
        totalTime: 0,
    });

    // Effets sonores
    const correctSound = useAudio("/assets/sounds/success.mp3");
    const incorrectSound = useAudio("/assets/sounds/error.mp3");

    // Charger les faits à réviser au chargement de la page
    useEffect(() => {
        if (user) {
            const facts = getFactsToReviewToday();

            if (facts.length > 0) {
                // Limiter à 10 faits par session pour ne pas fatiguer l'élève
                const sessionFacts = facts.slice(0, 10);
                setCurrentSession(sessionFacts);
            } else {
                // Pas de faits à réviser aujourd'hui
                setSessionComplete(true);
            }
        }
    }, [user, getFactsToReviewToday]);

    /**
     * Gère le résultat d'un exercice
     * @param {Object} result - Résultat de l'exercice
     */
    const handleExerciseResult = (result) => {
        const { factId, isCorrect, responseTime } = result;

        // Mettre à jour les statistiques de la session
        setSessionStats((prev) => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            incorrect: prev.incorrect + (isCorrect ? 0 : 1),
            totalTime: prev.totalTime + responseTime,
        }));

        // Jouer le son correspondant
        if (isCorrect) {
            correctSound.play();
        } else {
            incorrectSound.play();
        }

        // Mettre à jour la progression avec l'algorithme de répétition espacée
        updateFactProgress(factId, isCorrect);
    };

    /**
     * Passe à l'exercice suivant ou termine la session
     */
    const handleNextExercise = () => {
        if (currentSession && currentFactIndex < currentSession.length - 1) {
            setCurrentFactIndex(currentFactIndex + 1);
        } else {
            // Tous les exercices sont terminés
            setSessionComplete(true);
        }
    };

    /**
     * Démarre une nouvelle session
     */
    const handleStartNewSession = () => {
        navigate(0); // Recharger la page pour une nouvelle session
    };

    /**
     * Retourne à la page d'accueil
     */
    const handleGoHome = () => {
        navigate("/");
    };

    /**
     * Calcule les statistiques de la session
     * @returns {Object} Statistiques formatées
     */
    const getFormattedStats = () => {
        if (!currentSession) return {};

        const total = sessionStats.correct + sessionStats.incorrect;
        const successRate =
            total > 0 ? Math.round((sessionStats.correct / total) * 100) : 0;
        const averageTime =
            total > 0 ? (sessionStats.totalTime / total).toFixed(1) : 0;

        return {
            total,
            correct: sessionStats.correct,
            incorrect: sessionStats.incorrect,
            successRate,
            averageTime,
            totalTime: sessionStats.totalTime.toFixed(1),
        };
    };

    // Afficher un écran de chargement pendant l'initialisation
    if (!currentSession && !sessionComplete) {
        return (
            <Layout title="Exercices">
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-600">
                            Chargement des exercices...
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Afficher l'écran de fin de session
    if (sessionComplete) {
        const stats = getFormattedStats();

        return (
            <Layout
                title="Exercices terminés"
                showBackButton
                onBackClick={handleGoHome}
            >
                <div className="max-w-md mx-auto">
                    <Card elevated className="mb-6">
                        <div className="text-center p-4">
                            <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Icon
                                    name="checkCircle"
                                    size="32"
                                    color="#10B981"
                                />
                            </div>

                            <h2 className="text-2xl font-bold mb-2">
                                Félicitations !
                            </h2>

                            {currentSession ? (
                                <p className="text-gray-600 mb-4">
                                    Tu as terminé ta session d&lsquo;exercices.
                                </p>
                            ) : (
                                <p className="text-gray-600 mb-4">
                                    Tu as déjà terminé tous tes exercices pour
                                    aujourd&lsquo;hui.
                                </p>
                            )}

                            {currentSession && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <h3 className="font-semibold mb-2">
                                        Résultats de ta session :
                                    </h3>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-white p-2 rounded">
                                            <div className="font-medium">
                                                Exercices
                                            </div>
                                            <div className="text-2xl text-blue-600">
                                                {stats.total}
                                            </div>
                                        </div>

                                        <div className="bg-white p-2 rounded">
                                            <div className="font-medium">
                                                Réussite
                                            </div>
                                            <div className="text-2xl text-green-600">
                                                {stats.successRate}%
                                            </div>
                                        </div>

                                        <div className="bg-white p-2 rounded">
                                            <div className="font-medium">
                                                Bonnes réponses
                                            </div>
                                            <div className="text-2xl text-green-600">
                                                {stats.correct}
                                            </div>
                                        </div>

                                        <div className="bg-white p-2 rounded">
                                            <div className="font-medium">
                                                Erreurs
                                            </div>
                                            <div className="text-2xl text-red-500">
                                                {stats.incorrect}
                                            </div>
                                        </div>

                                        <div className="bg-white p-2 rounded col-span-2">
                                            <div className="font-medium">
                                                Temps moyen par exercice
                                            </div>
                                            <div className="text-xl">
                                                {stats.averageTime} secondes
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col space-y-3">
                                <Button
                                    variant="primary"
                                    onClick={handleStartNewSession}
                                >
                                    Nouvelle session
                                </Button>

                                <Button
                                    variant="secondary"
                                    onClick={handleGoHome}
                                >
                                    Retour à l&lsquo;accueil
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </Layout>
        );
    }

    // Afficher l'exercice en cours
    const currentFact = currentSession[currentFactIndex];
    const progress = ((currentFactIndex + 1) / currentSession.length) * 100;

    return (
        <Layout
            title="Exercice"
            showBackButton
            onBackClick={() => {
                if (
                    window.confirm(
                        "Es-tu sûr de vouloir quitter cette session ?"
                    )
                ) {
                    handleGoHome();
                }
            }}
        >
            <div className="max-w-md mx-auto mb-6">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-600">
                        Exercice {currentFactIndex + 1} sur{" "}
                        {currentSession.length}
                    </div>
                </div>

                <ProgressBar
                    value={progress}
                    variant="primary"
                    animated
                    className="mb-6"
                />

                <ExerciseCard
                    fact={currentFact}
                    onResult={handleExerciseResult}
                    onNext={handleNextExercise}
                    showTimer={true}
                />
            </div>
        </Layout>
    );
};

export default Exercise;
