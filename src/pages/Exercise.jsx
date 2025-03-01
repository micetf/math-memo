/**
 * @file Exercise.jsx
 * @description Page principale d'exercices avec répétition espacée
 */

import { useState, useEffect, useContext, useCallback } from "react";
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
import { PROGRESSIONS } from "../data/progressions";

/**
 * Page d'exercices qui présente des faits numériques selon l'algorithme de répétition espacée
 * @returns {JSX.Element} Page Exercise
 */
const Exercise = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const {
        getFactsToReviewToday,
        updateFactProgress,
        currentLevel,
        addMultipleFacts,
    } = useContext(ProgressContext);

    const [currentSession, setCurrentSession] = useState(null);
    const [currentFactIndex, setCurrentFactIndex] = useState(0);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionStats, setSessionStats] = useState({
        correct: 0,
        incorrect: 0,
        totalTime: 0,
    });

    // Effets sonores
    const correctSound = useAudio("/assets/sounds/success.mp3", {
        autoload: false,
    });
    const incorrectSound = useAudio("/assets/sounds/error.mp3", {
        autoload: false,
    });

    // Fonction pour générer des faits fallback si getFactsToReviewToday retourne vide
    const generateFallbackFacts = useCallback(() => {
        // Sélectionner le niveau actuel
        const progression = PROGRESSIONS[currentLevel];
        if (!progression) return [];

        // Prendre la première période et première unité
        const period = progression.periods[0];
        if (!period) return [];

        const unit = period.units[0];
        if (!unit) return [];

        // Retourner quelques faits de cette unité (limiter à 5 pour la session)
        return unit.facts.slice(0, 5);
    }, [currentLevel]);

    // Charger les faits à réviser au chargement de la page
    useEffect(() => {
        const initializeSession = async () => {
            setIsLoading(true);

            try {
                if (!user) {
                    setIsLoading(false);
                    setSessionComplete(true);
                    return;
                }

                // Récupérer les faits à réviser
                let factsToReview = getFactsToReviewToday();

                // Si pas de faits à réviser, utiliser des faits de fallback
                if (!factsToReview || factsToReview.length === 0) {
                    const fallbackFacts = generateFallbackFacts();

                    // Ajouter ces faits au système de répétition
                    if (fallbackFacts.length > 0) {
                        addMultipleFacts(fallbackFacts);
                        factsToReview = fallbackFacts;
                    }
                }

                if (factsToReview && factsToReview.length > 0) {
                    // Limiter à 10 faits par session pour ne pas fatiguer l'élève
                    const sessionFacts = factsToReview.slice(0, 10);
                    setCurrentSession(sessionFacts);
                    setCurrentFactIndex(0);
                    setSessionComplete(false);
                } else {
                    // Pas de faits à réviser
                    setSessionComplete(true);
                }
            } catch (error) {
                console.error(
                    "Erreur lors de l'initialisation de la session:",
                    error
                );
                setSessionComplete(true);
            } finally {
                setIsLoading(false);
            }
        };

        initializeSession();
    }, [user, getFactsToReviewToday, generateFallbackFacts, addMultipleFacts]);

    /**
     * Gère le résultat d'un exercice
     * @param {Object} result - Résultat de l'exercice
     */
    const handleExerciseResult = (result) => {
        const { factId, isCorrect, responseTime } = result;
        console.log("Exercise result:", result);

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
            // Incrémenter directement pour éviter les problèmes d'état asynchrone
            const newIndex = currentFactIndex + 1;
            setCurrentFactIndex(newIndex);
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
    if (isLoading) {
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

    // Si l'utilisateur n'est pas connecté, afficher un message
    if (!user) {
        return (
            <Layout title="Exercices">
                <div className="max-w-md mx-auto">
                    <Card elevated className="text-center p-6">
                        <Icon
                            name="errorCircle"
                            size="32"
                            className="mx-auto text-yellow-500 mb-4"
                        />
                        <h2 className="text-xl font-bold mb-4">
                            Connexion nécessaire
                        </h2>
                        <p className="mb-6">
                            Tu dois te connecter ou créer un compte pour accéder
                            aux exercices.
                        </p>
                        <Button variant="primary" onClick={handleGoHome}>
                            Retour à l&lsquo;accueil
                        </Button>
                    </Card>
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

                            {currentSession && stats.total > 0 && (
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

                {currentFact ? (
                    <ExerciseCard
                        fact={currentFact}
                        onResult={handleExerciseResult}
                        onNext={handleNextExercise}
                        showTimer={true}
                    />
                ) : (
                    <Card elevated className="text-center p-4">
                        <p className="text-gray-600">
                            Erreur lors du chargement de l&lsquo;exercice.
                        </p>
                        <Button
                            variant="primary"
                            onClick={handleGoHome}
                            className="mt-4"
                        >
                            Retour à l&lsquo;accueil
                        </Button>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default Exercise;
