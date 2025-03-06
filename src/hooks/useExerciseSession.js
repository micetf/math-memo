/**
 * @file useExerciseSession.js
 * @description Hook personnalisé pour gérer la logique de session d'exercices
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useAudio } from "./useAudio";
import { PROGRESSIONS } from "../data/progressions";

/**
 * Hook pour gérer toute la logique d'une session d'exercices
 * @param {Object} options - Options de configuration
 * @param {Object} options.user - Utilisateur actuel
 * @param {Function} options.getFactsToReviewToday - Fonction pour récupérer les faits à réviser
 * @param {Function} options.updateFactProgress - Fonction pour mettre à jour la progression d'un fait
 * @param {string} options.currentLevel - Niveau actuel de l'utilisateur
 * @param {Function} options.addMultipleFacts - Fonction pour ajouter plusieurs faits
 * @returns {Object} État et méthodes pour gérer la session d'exercices
 */
export const useExerciseSession = ({
    user,
    getFactsToReviewToday,
    updateFactProgress,
    currentLevel,
    addMultipleFacts,
}) => {
    // États pour la session d'exercices
    const [currentSession, setCurrentSession] = useState(null);
    const [currentFactIndex, setCurrentFactIndex] = useState(0);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sessionStats, setSessionStats] = useState({
        correct: 0,
        incorrect: 0,
        totalTime: 0,
    });

    // Références pour éviter les problèmes de fermeture (closure)
    const sessionRef = useRef(null);
    const factIndexRef = useRef(0);

    // Effets sonores
    const correctSound = useAudio("/assets/sounds/success.mp3", {
        autoload: true,
    });
    const incorrectSound = useAudio("/assets/sounds/error.mp3", {
        autoload: true,
    });

    /**
     * Génère des faits de secours si aucun fait à réviser n'est disponible
     * @returns {Array} Liste de faits numériques
     */
    const generateFallbackFacts = useCallback(() => {
        // S'assurer d'utiliser le niveau de l'utilisateur s'il est connecté
        const levelToUse = user?.level || currentLevel;
        console.log(
            `Génération de faits de secours pour le niveau: ${levelToUse}`
        );

        // Sélectionner le niveau approprié
        const progression = PROGRESSIONS[levelToUse];
        if (!progression) {
            console.error(
                `Niveau ${levelToUse} non trouvé, utilisation de CP par défaut`
            );
            return PROGRESSIONS["cp"].periods[0].units[0].facts.slice(0, 5);
        }

        // Prendre la première période et première unité
        const period = progression.periods[0];
        if (!period) {
            console.error(
                `Pas de période trouvée pour le niveau ${levelToUse}`
            );
            return [];
        }

        const unit = period.units[0];
        if (!unit) {
            console.error(`Pas d'unité trouvée dans la période ${period.name}`);
            return [];
        }

        console.log(
            `Génération de faits de secours depuis: ${progression.name} > ${period.name} > ${unit.name}`
        );

        // Retourner quelques faits de cette unité (limiter à 5 pour la session)
        if (!unit.facts || unit.facts.length === 0) {
            console.error(`Pas de faits trouvés dans l'unité ${unit.name}`);
            return [];
        }

        return unit.facts.slice(0, 5);
    }, [user, currentLevel]);

    /**
     * Initialise une nouvelle session d'exercices
     */
    const initializeSession = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (!user) {
                setIsLoading(false);
                setSessionComplete(true);
                return;
            }

            // Récupérer les faits à réviser
            let factsToReview = getFactsToReviewToday();
            console.log(
                "Faits à réviser récupérés:",
                factsToReview?.length || 0
            );

            // Si pas de faits à réviser, utiliser des faits de fallback
            if (!factsToReview || factsToReview.length === 0) {
                const fallbackFacts = generateFallbackFacts();
                console.log(
                    "Utilisation de faits de secours:",
                    fallbackFacts.length
                );

                // Ajouter ces faits au système de répétition
                if (fallbackFacts.length > 0) {
                    addMultipleFacts(fallbackFacts);
                    factsToReview = fallbackFacts;
                }
            }

            if (factsToReview && factsToReview.length > 0) {
                // Limiter à 10 faits par session pour ne pas fatiguer l'élève
                const sessionFacts = factsToReview.slice(0, 10);
                console.log("Session créée avec", sessionFacts.length, "faits");
                setCurrentSession(sessionFacts);

                // Mettre à jour les références
                sessionRef.current = sessionFacts;
                factIndexRef.current = 0;

                // Mettre à jour les états
                setCurrentFactIndex(0);
                setSessionComplete(false);

                // Réinitialiser les statistiques
                setSessionStats({
                    correct: 0,
                    incorrect: 0,
                    totalTime: 0,
                });
            } else {
                console.log("Aucun fait à réviser, session terminée");
                // Pas de faits à réviser
                setSessionComplete(true);
            }
        } catch (error) {
            console.error(
                "Erreur lors de l'initialisation de la session:",
                error
            );
            setError(
                "Impossible de charger les exercices. Veuillez réessayer."
            );
            setSessionComplete(true);
        } finally {
            setIsLoading(false);
        }
    }, [user, getFactsToReviewToday, generateFallbackFacts, addMultipleFacts]);

    /**
     * Gère le résultat d'un exercice
     * @param {Object} result - Résultat de l'exercice
     */
    const handleExerciseResult = useCallback(
        (result) => {
            const { factId, isCorrect, responseTime } = result;
            console.log("Résultat de l'exercice:", result);

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
            updateFactProgress(factId, isCorrect, responseTime);
        },
        [correctSound, incorrectSound, updateFactProgress]
    );

    /**
     * Passe à l'exercice suivant ou termine la session
     */
    const goToNextExercise = useCallback(() => {
        // Utiliser les références pour éviter les problèmes de closure
        const session = sessionRef.current;
        const currentIndex = factIndexRef.current;

        console.log(
            `Passage au fait suivant: ${currentIndex + 1}/${
                session?.length || 0
            }`
        );

        if (session && currentIndex < session.length - 1) {
            // Incrémenter les références et les états
            const nextIndex = currentIndex + 1;
            factIndexRef.current = nextIndex;
            setCurrentFactIndex(nextIndex);

            console.log(
                `Nouvel index: ${nextIndex}, fait actuel:`,
                session[nextIndex]
            );
        } else {
            console.log("Tous les exercices sont terminés");
            // Tous les exercices sont terminés
            setSessionComplete(true);
        }
    }, []);

    /**
     * Calcule les statistiques de la session
     * @returns {Object} Statistiques formatées
     */
    const getFormattedStats = useCallback(() => {
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
    }, [currentSession, sessionStats]);

    // Initialiser la session au montage du composant
    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    // Debug - Afficher les états actuels pour faciliter le développement
    useEffect(() => {
        console.log("État de la session:", {
            sessionLength: currentSession?.length || 0,
            currentFactIndex,
            refIndex: factIndexRef.current,
            sessionComplete,
        });
    }, [currentSession, currentFactIndex, sessionComplete]);

    // Obtenir le fait actuel en utilisant la référence pour plus de fiabilité
    const currentFact = sessionRef.current?.[factIndexRef.current] || null;
    const progress =
        sessionRef.current?.length > 0
            ? ((factIndexRef.current + 1) / sessionRef.current.length) * 100
            : 0;

    return {
        // États
        isLoading,
        error,
        sessionComplete,
        currentFact,
        currentSession: sessionRef.current,
        currentFactIndex: factIndexRef.current,
        progress,

        // Actions
        initializeSession,
        handleExerciseResult,
        goToNextExercise,

        // Utilitaires
        getFormattedStats,
    };
};
