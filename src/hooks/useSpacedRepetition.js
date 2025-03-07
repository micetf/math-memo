/**
 * @file useSpacedRepetition.js
 * @description Hook personnalisé pour gérer la répétition espacée des faits numériques
 */

import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useStorage } from "../contexts";
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
    // Validation des entrées
    const validUserId = userId || "guest";
    const validProgressionId = progressionId || "default";

    // Construction de la clé de stockage avec userId et progressionId
    const storageKey = `spaced-rep-${validUserId}-${validProgressionId}`;

    // Journalisation pour débogage
    console.log(
        `Initialisation de useSpacedRepetition avec la clé: ${storageKey}`
    );

    // Récupérer le contexte de stockage
    const storage = useStorage();

    // Récupération des données stockées localement
    const [facts, setFacts] = useLocalStorage(storageKey, {});

    // État pour suivre les faits à réviser aujourd'hui
    const [factsToReview, setFactsToReview] = useState([]);

    // Sauvegarder les faits quand ils sont modifiés
    useEffect(() => {
        if (storage.isInitialized) {
            storage.saveData(storageKey, facts);
        }
    }, [facts, storage, storageKey]);

    // Debug
    useEffect(() => {
        console.log(
            `SpacedRepetition: ${storageKey}, ${
                Object.keys(facts).length
            } faits trouvés`
        );
    }, [storageKey, facts]);

    /**
     * Fonction pour vérifier si un fait appartient au niveau actuel
     * @param {string} factId - ID du fait à vérifier
     * @returns {boolean} - true si le fait appartient au niveau actuel
     */
    const isFactFromCurrentLevel = useCallback(
        (factId) => {
            // Les IDs des faits commencent généralement par le code du niveau
            return factId && factId.startsWith(validProgressionId);
        },
        [validProgressionId]
    );

    /**
     * Nettoie les faits qui ne correspondent pas au niveau actuel
     * @returns {Object} Faits filtrés
     */
    const cleanupInconsistentFacts = useCallback(() => {
        const currentLevelFacts = {};
        let inconsistentFactsFound = false;

        // Filtrer pour ne garder que les faits du niveau actuel
        Object.keys(facts).forEach((factId) => {
            if (isFactFromCurrentLevel(factId)) {
                currentLevelFacts[factId] = facts[factId];
            } else {
                inconsistentFactsFound = true;
                console.log(`Fait inconsistant détecté et ignoré: ${factId}`);
            }
        });

        // Mettre à jour le stockage si des faits inconsistants ont été trouvés
        if (inconsistentFactsFound) {
            console.log(`Nettoyage des faits inconsistants pour ${storageKey}`);
            setFacts(currentLevelFacts);
        }

        return currentLevelFacts;
    }, [facts, isFactFromCurrentLevel, setFacts, storageKey]);

    // Exécuter un nettoyage initial
    useEffect(() => {
        cleanupInconsistentFacts();
    }, [cleanupInconsistentFacts]);

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

            // Vérifier que le fait appartient au niveau actuel
            if (!isFactFromCurrentLevel(factId)) {
                console.warn(
                    `Tentative d'ajout d'un fait de niveau incorrect: ${factId} pour le niveau ${validProgressionId}`
                );
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
        [setFacts, isFactFromCurrentLevel, validProgressionId]
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
                let factsAdded = 0;

                factsArray.forEach((fact) => {
                    if (!fact || !fact.id) return;

                    const factId = fact.id;

                    // Vérifier que le fait appartient au niveau actuel
                    if (!isFactFromCurrentLevel(factId)) {
                        console.warn(
                            `Ignoring fact from incorrect level: ${factId}`
                        );
                        return;
                    }

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
                        factsAdded++;
                    }
                });

                console.log(
                    `${factsAdded} nouveaux faits ajoutés pour ${storageKey}`
                );
                return newFacts;
            });
        },
        [setFacts, isFactFromCurrentLevel, storageKey]
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

                console.log(
                    `Mise à jour du fait ${factId}: niveau ${
                        fact.level
                    } -> ${newLevel}, prochaine révision: ${nextReviewDate.toLocaleDateString()}`
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
        const currentLevelFacts = cleanupInconsistentFacts();

        const factsToReview = Object.values(currentLevelFacts).filter(
            (fact) => {
                if (!fact || !fact.nextReview) return false;

                const nextReview = new Date(fact.nextReview);
                return nextReview <= now;
            }
        );

        console.log(
            `${factsToReview.length} faits à réviser aujourd'hui pour ${storageKey}`
        );
        return factsToReview;
    }, [cleanupInconsistentFacts, storageKey]);

    /**
     * Récupère des statistiques sur la progression de l'apprentissage
     * @returns {Object} Statistiques
     */
    const getProgressStats = useCallback(() => {
        const currentLevelFacts = cleanupInconsistentFacts();
        const totalFacts = Object.keys(currentLevelFacts).length;

        const factsByLevel = {
            [KNOWLEDGE_LEVELS.NEW]: 0,
            [KNOWLEDGE_LEVELS.LEARNING]: 0,
            [KNOWLEDGE_LEVELS.REVIEWING]: 0,
            [KNOWLEDGE_LEVELS.MASTERED]: 0,
        };

        Object.values(currentLevelFacts).forEach((fact) => {
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
    }, [cleanupInconsistentFacts, getFactsToReviewToday]);

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
