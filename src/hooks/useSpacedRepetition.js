/**
 * @file useSpacedRepetition.js
 * @description Hook personnalisé pour gérer la répétition espacée des faits numériques
 */

import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Niveaux de connaissance pour l'algorithme de répétition espacée
 * @constant {Object}
 */
export const KNOWLEDGE_LEVELS = {
    NEW: 0, // Nouveau fait numérique
    LEARNING: 1, // En cours d'apprentissage
    REVIEWING: 2, // En révision
    MASTERED: 3, // Maîtrisé
};

/**
 * Intervalle de répétition en jours selon le niveau de connaissance
 * @constant {Object}
 */
const REPETITION_INTERVALS = {
    [KNOWLEDGE_LEVELS.NEW]: 0, // Le jour même
    [KNOWLEDGE_LEVELS.LEARNING]: 1, // 1 jour
    [KNOWLEDGE_LEVELS.REVIEWING]: 3, // 3 jours
    [KNOWLEDGE_LEVELS.MASTERED]: 7, // 7 jours
};

/**
 * Nombre de succès consécutifs nécessaires pour passer au niveau suivant
 * @constant {Object}
 */
const SUCCESS_THRESHOLD = {
    [KNOWLEDGE_LEVELS.NEW]: 2, // 2 succès pour passer de NEW à LEARNING
    [KNOWLEDGE_LEVELS.LEARNING]: 3, // 3 succès pour passer de LEARNING à REVIEWING
    [KNOWLEDGE_LEVELS.REVIEWING]: 4, // 4 succès pour passer de REVIEWING à MASTERED
};

/**
 * Hook personnalisé pour gérer l'algorithme de répétition espacée
 * @param {string} userId - Identifiant de l'utilisateur
 * @param {string} progressionId - Identifiant de la progression didactique
 * @returns {Object} Fonctions et état pour gérer la répétition espacée
 */
export const useSpacedRepetition = (userId, progressionId) => {
    // Récupération des données stockées localement
    const storageKey = `spaced-rep-${userId || "guest"}-${
        progressionId || "default"
    }`;
    const [facts, setFacts] = useLocalStorage(storageKey, {});

    // État pour suivre les faits à réviser aujourd'hui
    const [factsToReview, setFactsToReview] = useState([]);

    // Debug
    useEffect(() => {
        console.log("SpacedRepetition initialized with key:", storageKey);
        console.log("Current facts in storage:", facts);
    }, [storageKey, facts]);

    /**
     * Crée ou met à jour un fait numérique dans la base de faits
     * @param {string} factId - Identifiant unique du fait (ex: "add-2-3")
     * @param {Object} factData - Données associées au fait
     */
    const addFact = useCallback(
        (factId, factData) => {
            if (!factId) {
                console.error("Cannot add fact: factId is required");
                return;
            }

            setFacts((prev) => {
                // Si le fait existe déjà, ne pas l'écraser
                if (prev[factId]) {
                    return prev;
                }

                return {
                    ...prev,
                    [factId]: {
                        id: factId,
                        level: KNOWLEDGE_LEVELS.NEW,
                        successCount: 0,
                        lastReviewed: new Date().toISOString(),
                        nextReview: new Date().toISOString(),
                        history: [],
                        ...factData,
                    },
                };
            });
        },
        [setFacts]
    );

    /**
     * Ajoute plusieurs faits numériques en même temps
     * @param {Array<Object>} factsArray - Tableau d'objets de faits
     */
    const addMultipleFacts = useCallback(
        (factsArray) => {
            if (!Array.isArray(factsArray) || factsArray.length === 0) {
                console.error(
                    "Cannot add facts: factsArray must be a non-empty array"
                );
                return;
            }

            setFacts((prev) => {
                const newFacts = { ...prev };

                factsArray.forEach((fact) => {
                    if (!fact || !fact.id) return;

                    const factId = fact.id;
                    if (!newFacts[factId]) {
                        newFacts[factId] = {
                            id: factId,
                            level: KNOWLEDGE_LEVELS.NEW,
                            successCount: 0,
                            lastReviewed: new Date().toISOString(),
                            nextReview: new Date().toISOString(),
                            history: [],
                            ...fact,
                        };
                    }
                });

                return newFacts;
            });
        },
        [setFacts]
    );

    /**
     * Met à jour un fait après une réponse de l'utilisateur
     * @param {string} factId - Identifiant du fait
     * @param {boolean} isCorrect - Si la réponse était correcte
     * @param {number} responseTime - Temps de réponse en secondes (optionnel)
     */
    const updateFactProgress = useCallback(
        (factId, isCorrect, responseTime = null) => {
            if (!factId) {
                console.error(
                    "Cannot update fact progress: factId is required"
                );
                return;
            }

            setFacts((prev) => {
                const fact = prev[factId];
                if (!fact) {
                    console.error(`Fact with ID ${factId} not found`);
                    return prev;
                }

                let newLevel = fact.level;
                let successCount = isCorrect ? fact.successCount + 1 : 0;

                // Mise à jour du niveau en fonction de la réponse
                if (
                    isCorrect &&
                    successCount >= SUCCESS_THRESHOLD[fact.level]
                ) {
                    if (fact.level < KNOWLEDGE_LEVELS.MASTERED) {
                        newLevel = fact.level + 1;
                        successCount = 0;
                    }
                } else if (!isCorrect && fact.level > KNOWLEDGE_LEVELS.NEW) {
                    newLevel = fact.level - 1;
                }

                // Calcul de la prochaine date de révision
                const now = new Date();
                const nextReviewDate = new Date(now);
                nextReviewDate.setDate(
                    now.getDate() + REPETITION_INTERVALS[newLevel]
                );

                // Mise à jour du fait
                return {
                    ...prev,
                    [factId]: {
                        ...fact,
                        level: newLevel,
                        successCount,
                        lastReviewed: now.toISOString(),
                        nextReview: nextReviewDate.toISOString(),
                        history: [
                            ...fact.history,
                            {
                                date: now.toISOString(),
                                isCorrect,
                                responseTime: responseTime || 0,
                            },
                        ],
                    },
                };
            });
        },
        [setFacts]
    );

    /**
     * Récupère les faits qui doivent être révisés aujourd'hui
     * @returns {Array} Liste des faits à réviser
     */
    const getFactsToReviewToday = useCallback(() => {
        const now = new Date();
        const factsToReview = Object.values(facts).filter((fact) => {
            if (!fact || !fact.nextReview) return false;

            const nextReview = new Date(fact.nextReview);
            return nextReview <= now;
        });

        console.log(`Found ${factsToReview.length} facts to review today`);
        return factsToReview;
    }, [facts]);

    /**
     * Récupère des statistiques sur la progression de l'apprentissage
     * @returns {Object} Statistiques
     */
    const getProgressStats = useCallback(() => {
        const totalFacts = Object.keys(facts).length;
        const factsByLevel = {
            [KNOWLEDGE_LEVELS.NEW]: 0,
            [KNOWLEDGE_LEVELS.LEARNING]: 0,
            [KNOWLEDGE_LEVELS.REVIEWING]: 0,
            [KNOWLEDGE_LEVELS.MASTERED]: 0,
        };

        Object.values(facts).forEach((fact) => {
            if (fact && typeof fact.level === "number") {
                factsByLevel[fact.level] = (factsByLevel[fact.level] || 0) + 1;
            }
        });

        // Récupérer les faits à réviser aujourd'hui
        const factsToReview = getFactsToReviewToday();

        return {
            totalFacts,
            factsByLevel,
            factsToReview,
            masteredPercentage:
                totalFacts > 0
                    ? Math.round(
                          (factsByLevel[KNOWLEDGE_LEVELS.MASTERED] /
                              totalFacts) *
                              100
                      )
                    : 0,
        };
    }, [facts, getFactsToReviewToday]);

    // Mise à jour des faits à réviser au chargement et lorsque les faits changent
    useEffect(() => {
        const toReview = getFactsToReviewToday();
        setFactsToReview(toReview);
    }, [facts, getFactsToReviewToday]);

    return {
        facts,
        factsToReview,
        addFact,
        addMultipleFacts,
        updateFactProgress,
        getFactsToReviewToday,
        getProgressStats,
        KNOWLEDGE_LEVELS,
    };
};
