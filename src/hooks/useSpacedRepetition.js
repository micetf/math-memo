// src/hooks/useSpacedRepetition.js
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useStorage } from "../contexts/storage";

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
 * @param {Object} [factServiceOverride=null] - Service de faits personnalisé (optionnel)
 * @returns {Object} Fonctions et état pour gérer la répétition espacée
 */
export const useSpacedRepetition = (
    userId,
    progressionId,
    factServiceOverride = null
) => {
    // Validation des entrées avec useMemo pour éviter des recalculs inutiles
    const userFactsKey = useMemo(() => {
        const validUserId = userId || "guest";
        const validProgressionId = progressionId || "default";
        return `spaced-rep-${validUserId}-${validProgressionId}`;
    }, [userId, progressionId]);

    // Récupérer le contexte de stockage
    const storage = useStorage();

    // Utiliser le service de faits fourni ou celui du contexte de stockage
    const factsService = useMemo(
        () => factServiceOverride || storage.factsService,
        [factServiceOverride, storage.factsService]
    );

    // État pour les faits et leur progression
    const [facts, setFacts] = useState({});

    // État pour les faits à réviser aujourd'hui
    const [factsToReview, setFactsToReview] = useState([]);

    // États pour le chargement et les erreurs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Référence pour éviter les rendus inutiles
    const lastSavedFacts = useRef({});
    const isIndexedDBUsed = useRef(false);

    // Debug
    useEffect(() => {
        console.log(
            `SpacedRepetition: ${userFactsKey}, ${
                Object.keys(facts).length
            } faits trouvés (${
                isIndexedDBUsed.current ? "IndexedDB" : "localStorage"
            })`
        );
    }, [userFactsKey, facts]);

    /**
     * Sauvegarde les faits dans le stockage
     * @param {Object} updatedFacts - Faits à sauvegarder
     * @returns {Promise<boolean>} - Succès de l'opération
     */
    const saveFacts = useCallback(
        async (updatedFacts) => {
            try {
                if (factsService && isIndexedDBUsed.current) {
                    // Utiliser IndexedDB via factsService
                    // Convertir l'objet en tableau pour saveManyFacts
                    const factsArray = Object.entries(updatedFacts).map(
                        ([factId, factData]) => ({
                            ...factData,
                            id: factId,
                            userId,
                            level: progressionId,
                        })
                    );

                    await factsService.saveManyFacts(factsArray);
                } else {
                    // Fallback vers localStorage via saveData
                    await storage.saveData(userFactsKey, updatedFacts);
                }
                return true;
            } catch (err) {
                console.error(
                    `Erreur lors de la sauvegarde des faits pour ${userFactsKey}:`,
                    err
                );
                setError(`Erreur de stockage: ${err.message}`);
                return false;
            }
        },
        [factsService, storage, userFactsKey, userId, progressionId]
    );

    /**
     * Charge les faits depuis le stockage
     * @returns {Promise<Object>} - Faits chargés
     */
    const loadFacts = useCallback(async () => {
        try {
            let loadedFacts = {};

            if (factsService) {
                try {
                    // Essayer d'abord de charger depuis IndexedDB
                    const factsFromDB =
                        await factsService.getFactsByUserAndLevel(
                            userId,
                            progressionId
                        );

                    if (factsFromDB && factsFromDB.length > 0) {
                        // Convertir le tableau en objet indexé par ID
                        loadedFacts = factsFromDB.reduce((acc, fact) => {
                            const { id, ...restOfFact } = fact;
                            acc[id] = restOfFact;
                            return acc;
                        }, {});

                        isIndexedDBUsed.current = true;
                        console.log(
                            `Chargé ${factsFromDB.length} faits depuis IndexedDB`
                        );
                        return loadedFacts;
                    }
                } catch (err) {
                    console.warn(
                        "Échec du chargement depuis IndexedDB, fallback vers localStorage:",
                        err
                    );
                }
            }

            // Fallback vers localStorage
            loadedFacts = await storage.loadData(userFactsKey, {});
            isIndexedDBUsed.current = false;
            return loadedFacts;
        } catch (err) {
            console.error(
                `Erreur lors du chargement des faits pour ${userFactsKey}:`,
                err
            );
            setError(`Erreur de lecture: ${err.message}`);
            return {};
        }
    }, [factsService, storage, userFactsKey, userId, progressionId]);

    /**
     * Fonction pour vérifier si un fait appartient au niveau actuel
     * @param {string} factId - ID du fait à vérifier
     * @returns {boolean} - true si le fait appartient au niveau actuel
     */
    const isFactFromCurrentLevel = useCallback(
        (factId) => {
            // Les IDs des faits commencent généralement par le code du niveau
            return factId && factId.startsWith(progressionId);
        },
        [progressionId]
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
            console.log(
                `Nettoyage des faits inconsistants pour ${userFactsKey}`
            );
            setFacts(currentLevelFacts);
        }

        return currentLevelFacts;
    }, [facts, isFactFromCurrentLevel, userFactsKey]);

    // Exécuter un nettoyage initial et charger les faits
    useEffect(() => {
        if (!storage.isInitialized) return;

        const initializeData = async () => {
            setLoading(true);
            try {
                const loadedFacts = await loadFacts();
                setFacts(loadedFacts);
                setLoading(false);
            } catch (err) {
                console.error(
                    "Erreur lors de l'initialisation des données:",
                    err
                );
                setError("Erreur lors du chargement des données");
                setLoading(false);
            }
        };

        initializeData();
    }, [storage.isInitialized, loadFacts]);

    // Sauvegarder les faits lorsqu'ils changent (limité pour éviter les sauvegardes inutiles)
    useEffect(() => {
        if (!storage.isInitialized || loading) return;

        // Vérifier si les faits ont réellement changé pour éviter les sauvegardes inutiles
        const currentFactsStr = JSON.stringify(facts);
        const lastFactsStr = JSON.stringify(lastSavedFacts.current);

        if (currentFactsStr !== lastFactsStr) {
            saveFacts(facts);
            lastSavedFacts.current = { ...facts };
        }
    }, [facts, storage.isInitialized, loading, saveFacts]);

    /**
     * Crée ou met à jour un fait numérique dans la base de faits
     * @param {string} factId - Identifiant unique du fait (ex: "add-2-3")
     * @param {Object} factData - Données associées au fait
     * @returns {Promise<boolean>} Succès de l'opération
     */
    const addFact = useCallback(
        async (factId, factData) => {
            if (!factId) {
                console.error("Cannot add fact: factId is required");
                setError("Identifiant de fait requis");
                return false;
            }

            // Vérifier que le fait appartient au niveau actuel
            if (!isFactFromCurrentLevel(factId)) {
                console.warn(
                    `Tentative d'ajout d'un fait de niveau incorrect: ${factId} pour le niveau ${progressionId}`
                );
                setError(`Fait de niveau incorrect: ${factId}`);
                return false;
            }

            setFacts((prev) => {
                // Si le fait existe déjà, ne pas l'écraser
                if (prev[factId]) {
                    return prev;
                }

                const newFacts = {
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

                return newFacts;
            });

            return true;
        },
        [isFactFromCurrentLevel, progressionId]
    );

    /**
     * Ajoute plusieurs faits numériques en même temps
     * @param {Array<Object>} factsArray - Tableau d'objets de faits
     * @returns {Promise<boolean>} Succès de l'opération
     */
    const addMultipleFacts = useCallback(
        async (factsArray) => {
            if (!Array.isArray(factsArray) || factsArray.length === 0) {
                console.error(
                    "Cannot add facts: factsArray must be a non-empty array"
                );
                setError("Le tableau de faits est vide ou invalide");
                return false;
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
                    `${factsAdded} nouveaux faits ajoutés pour ${userFactsKey}`
                );
                return factsAdded > 0 ? newFacts : prev;
            });

            return true;
        },
        [isFactFromCurrentLevel, userFactsKey]
    );

    /**
     * Met à jour un fait après une réponse de l'utilisateur
     * @param {string} factId - Identifiant du fait
     * @param {boolean} isCorrect - Si la réponse était correcte
     * @param {number} responseTime - Temps de réponse en secondes (optionnel)
     * @returns {Promise<Object|null>} Fait mis à jour ou null en cas d'erreur
     */
    const updateFactProgress = useCallback(
        async (factId, isCorrect, responseTime = null) => {
            if (!factId) {
                console.error(
                    "Cannot update fact progress: factId is required"
                );
                setError("Identifiant de fait requis pour la mise à jour");
                return null;
            }

            let updatedFact = null;

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

                // Création du fait mis à jour
                updatedFact = {
                    ...fact,
                    level: newLevel,
                    successCount,
                    lastReviewed: now.toISOString(),
                    nextReview: nextReviewDate.toISOString(),
                    history: [
                        ...(fact.history || []),
                        {
                            date: now.toISOString(),
                            isCorrect,
                            responseTime: responseTime || 0,
                        },
                    ],
                };

                // Mettre à jour dans IndexedDB si disponible
                if (factsService && isIndexedDBUsed.current) {
                    try {
                        factsService.saveFact({
                            ...updatedFact,
                            id: factId,
                            userId,
                            level: progressionId,
                        });
                    } catch (e) {
                        console.warn(
                            "Erreur lors de la mise à jour dans IndexedDB:",
                            e
                        );
                        // Continuer avec la mise à jour en mémoire quand même
                    }
                }

                // Retourner les faits mis à jour
                return {
                    ...prev,
                    [factId]: updatedFact,
                };
            });

            return updatedFact;
        },
        [factsService, userId, progressionId]
    );

    /**
     * Récupère les faits qui doivent être révisés aujourd'hui
     * @returns {Promise<Array>} Liste des faits à réviser
     */
    const getFactsToReviewToday = useCallback(async () => {
        const now = new Date();
        const currentLevelFacts = cleanupInconsistentFacts();

        // Si factsService est disponible et IndexedDB est utilisé, récupérer depuis la base de données
        if (factsService && isIndexedDBUsed.current) {
            try {
                const reviewFacts = await factsService.getFactsToReview(
                    userId,
                    now
                );
                // Filtrer pour ne garder que les faits du niveau actuel
                const levelReviewFacts = reviewFacts.filter(
                    (fact) =>
                        fact.level === progressionId ||
                        isFactFromCurrentLevel(fact.id)
                );

                console.log(
                    `${levelReviewFacts.length} faits à réviser aujourd'hui depuis IndexedDB pour ${userFactsKey}`
                );

                return levelReviewFacts;
            } catch (err) {
                console.warn(
                    "Erreur lors de la récupération des faits à réviser depuis IndexedDB:",
                    err
                );
                // En cas d'échec, fallback vers la méthode en mémoire
            }
        }

        // Fallback : Filtrer les faits en mémoire
        const factsToReview = Object.values(currentLevelFacts).filter(
            (fact) => {
                if (!fact || !fact.nextReview) return false;

                const nextReview = new Date(fact.nextReview);
                return nextReview <= now;
            }
        );

        console.log(
            `${factsToReview.length} faits à réviser aujourd'hui pour ${userFactsKey}`
        );
        return factsToReview;
    }, [
        cleanupInconsistentFacts,
        factsService,
        userId,
        progressionId,
        isFactFromCurrentLevel,
        userFactsKey,
    ]);

    /**
     * Récupère des statistiques sur la progression de l'apprentissage
     * @returns {Promise<Object>} Statistiques
     */
    const getProgressStats = useCallback(async () => {
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
        const factsToReviewList = await getFactsToReviewToday();

        return {
            totalFacts,
            factsByLevel,
            factsToReview: factsToReviewList,
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
        if (!storage.isInitialized || loading) return;

        const updateFactsToReview = async () => {
            try {
                const toReview = await getFactsToReviewToday();
                setFactsToReview(toReview);
            } catch (err) {
                console.error(
                    "Erreur lors de la mise à jour des faits à réviser:",
                    err
                );
            }
        };

        updateFactsToReview();
    }, [facts, getFactsToReviewToday, storage.isInitialized, loading]);

    // Exposer les fonctionnalités publiques du hook
    return {
        facts,
        factsToReview,
        loading,
        error,
        addFact,
        addMultipleFacts,
        updateFactProgress,
        getFactsToReviewToday,
        getProgressStats,
        KNOWLEDGE_LEVELS,
        // Nouvelle fonction pour vérifier quelle méthode de stockage est utilisée
        isUsingIndexedDB: () => isIndexedDBUsed.current,
        // Fonctions pour la migration des données
        exportData: async () => {
            return {
                userId,
                progressionId,
                facts,
                exportedAt: new Date().toISOString(),
            };
        },
        importData: async (data) => {
            if (!data || !data.facts) {
                throw new Error("Données d'importation invalides");
            }

            // Vérifier si les données concernent le même utilisateur et niveau
            if (
                data.userId !== userId ||
                data.progressionId !== progressionId
            ) {
                console.warn(
                    "Importation de données pour un utilisateur ou niveau différent"
                );
            }

            // Fusionner avec les faits existants
            setFacts((prev) => ({
                ...prev,
                ...data.facts,
            }));

            return true;
        },
    };
};
