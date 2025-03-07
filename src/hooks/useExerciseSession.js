// src/hooks/useExerciseSession.js
import { useMemo, useEffect, useCallback, useReducer, useRef } from "react";
import { useAudio } from "./useAudio";

// Actions pour le reducer
const SESSION_ACTIONS = {
    INIT_SESSION: "INIT_SESSION",
    START_LOADING: "START_LOADING",
    FINISH_LOADING: "FINISH_LOADING",
    SET_ERROR: "SET_ERROR",
    NEXT_EXERCISE: "NEXT_EXERCISE",
    COMPLETE_SESSION: "COMPLETE_SESSION",
    UPDATE_STATS: "UPDATE_STATS",
    RESET_SESSION: "RESET_SESSION",
};

// État initial
const initialState = {
    currentSession: null,
    currentFactIndex: 0,
    sessionComplete: false,
    isLoading: true,
    error: null,
    stats: {
        correct: 0,
        incorrect: 0,
        totalTime: 0,
    },
};

// Reducer pour gérer l'état de la session
function sessionReducer(state, action) {
    switch (action.type) {
        case SESSION_ACTIONS.INIT_SESSION:
            return {
                ...state,
                currentSession: action.payload,
                currentFactIndex: 0,
                sessionComplete: false,
                isLoading: false,
                error: null,
            };

        case SESSION_ACTIONS.START_LOADING:
            return {
                ...state,
                isLoading: true,
            };

        case SESSION_ACTIONS.FINISH_LOADING:
            return {
                ...state,
                isLoading: false,
            };

        case SESSION_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false,
            };

        case SESSION_ACTIONS.NEXT_EXERCISE:
            return {
                ...state,
                currentFactIndex: state.currentFactIndex + 1,
            };

        case SESSION_ACTIONS.COMPLETE_SESSION:
            return {
                ...state,
                sessionComplete: true,
            };

        case SESSION_ACTIONS.UPDATE_STATS:
            return {
                ...state,
                stats: {
                    ...state.stats,
                    correct:
                        state.stats.correct +
                        (action.payload.isCorrect ? 1 : 0),
                    incorrect:
                        state.stats.incorrect +
                        (action.payload.isCorrect ? 0 : 1),
                    totalTime:
                        state.stats.totalTime + action.payload.responseTime,
                },
            };

        case SESSION_ACTIONS.RESET_SESSION:
            return {
                ...initialState,
                isLoading: true,
            };

        default:
            return state;
    }
}

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
    // Utiliser useReducer au lieu de plusieurs useState pour une gestion d'état plus robuste
    const [state, dispatch] = useReducer(sessionReducer, initialState);

    // Destructurer l'état du reducer pour faciliter l'utilisation
    const {
        currentSession,
        currentFactIndex,
        sessionComplete,
        isLoading,
        error,
        stats,
    } = state;

    // Effets sonores
    const correctSound = useAudio("/assets/sounds/success.mp3", {
        autoload: true,
    });
    const incorrectSound = useAudio("/assets/sounds/error.mp3", {
        autoload: true,
    });

    // Référence pour le fait actuel
    const currentFactRef = useRef(null);

    /**
     * Génère des faits de secours si aucun fait à réviser n'est disponible
     * @returns {Array} Liste de faits numériques
     */
    const generateFallbackFacts = useCallback((level, maxFacts = 5) => {
        if (!level) return [];

        try {
            // Logique pour générer des faits de secours basés sur le niveau
            // Cette fonction doit être implémentée en fonction de votre modèle de données
            console.log(
                `Générer des faits de secours pour le niveau: ${level}`,
                `Nombre max de faits : ${maxFacts}`
            );

            // Exemple simplifié, à adapter selon votre modèle de données
            return []; // Implémentation à compléter
        } catch (err) {
            console.error(
                "Erreur lors de la génération des faits de secours:",
                err
            );
            return [];
        }
    }, []);

    /**
     * Initialise une nouvelle session d'exercices
     */
    const initializeSession = useCallback(async () => {
        dispatch({ type: SESSION_ACTIONS.START_LOADING });

        try {
            if (!user) {
                dispatch({ type: SESSION_ACTIONS.COMPLETE_SESSION });
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
                const fallbackFacts = generateFallbackFacts(currentLevel);
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

                dispatch({
                    type: SESSION_ACTIONS.INIT_SESSION,
                    payload: sessionFacts,
                });

                // Mettre à jour la référence du fait actuel
                currentFactRef.current = sessionFacts[0] || null;
            } else {
                console.log("Aucun fait à réviser, session terminée");
                dispatch({ type: SESSION_ACTIONS.COMPLETE_SESSION });
            }
        } catch (err) {
            console.error(
                "Erreur lors de l'initialisation de la session:",
                err
            );
            dispatch({
                type: SESSION_ACTIONS.SET_ERROR,
                payload:
                    "Impossible de charger les exercices. Veuillez réessayer.",
            });
        }
    }, [
        user,
        getFactsToReviewToday,
        generateFallbackFacts,
        currentLevel,
        addMultipleFacts,
    ]);

    /**
     * Gère le résultat d'un exercice
     * @param {Object} result - Résultat de l'exercice
     */
    const handleExerciseResult = useCallback(
        (result) => {
            const { factId, isCorrect, responseTime } = result;
            console.log("Résultat de l'exercice:", result);

            // Mettre à jour les statistiques de la session
            dispatch({
                type: SESSION_ACTIONS.UPDATE_STATS,
                payload: { isCorrect, responseTime },
            });

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
        if (!currentSession) return;

        // Si c'est le dernier exercice, terminer la session
        if (currentFactIndex >= currentSession.length - 1) {
            console.log("Tous les exercices sont terminés");
            dispatch({ type: SESSION_ACTIONS.COMPLETE_SESSION });
            return;
        }

        // Sinon, passer à l'exercice suivant
        console.log(
            `Passage au fait suivant: ${currentFactIndex + 1}/${
                currentSession.length
            }`
        );
        dispatch({ type: SESSION_ACTIONS.NEXT_EXERCISE });

        // Mettre à jour la référence au fait actuel
        currentFactRef.current = currentSession[currentFactIndex + 1] || null;
    }, [currentSession, currentFactIndex]);

    /**
     * Calcule les statistiques de la session
     * @returns {Object} Statistiques formatées
     */
    const getFormattedStats = useCallback(() => {
        if (!currentSession) return {};

        const total = stats.correct + stats.incorrect;
        const successRate =
            total > 0 ? Math.round((stats.correct / total) * 100) : 0;
        const averageTime =
            total > 0 ? (stats.totalTime / total).toFixed(1) : 0;

        return {
            total,
            correct: stats.correct,
            incorrect: stats.incorrect,
            successRate,
            averageTime,
            totalTime: stats.totalTime.toFixed(1),
        };
    }, [currentSession, stats]);

    // Initialiser la session au montage du composant
    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    // Calculer le pourcentage de progression
    const progress = useMemo(() => {
        if (!currentSession || currentSession.length === 0) return 0;
        return ((currentFactIndex + 1) / currentSession.length) * 100;
    }, [currentSession, currentFactIndex]);

    // Obtenir le fait actuel
    const currentFact = useMemo(() => {
        if (!currentSession || currentFactIndex >= currentSession.length)
            return null;
        return currentSession[currentFactIndex];
    }, [currentSession, currentFactIndex]);

    return {
        // États
        isLoading,
        error,
        sessionComplete,
        currentFact,
        currentSession,
        currentFactIndex,
        progress,

        // Actions
        initializeSession,
        handleExerciseResult,
        goToNextExercise,

        // Utilitaires
        getFormattedStats,
    };
};
