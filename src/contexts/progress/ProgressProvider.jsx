// src/contexts/progress/ProgressProvider.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useAuth, useStorage, ProgressContext } from "..";
import {
    useSpacedRepetition,
    KNOWLEDGE_LEVELS,
} from "../../hooks/useSpacedRepetition";
import { PROGRESSIONS, DIFFICULTY_LEVELS } from "../../data/progressions";

/**
 * Fournisseur de contexte pour gérer la progression de l'élève
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur ProgressContext
 */
export const ProgressProvider = ({ children }) => {
    const { user } = useAuth();
    const { isInitialized, factsService } = useStorage();

    // État pour le niveau, la période et l'unité actifs
    const [currentLevel, setCurrentLevel] = useState(
        user?.level || DIFFICULTY_LEVELS.CP
    );
    const [activePeriod, setActivePeriod] = useState(null);
    const [activeUnit, setActiveUnit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Références pour éviter des rendus inutiles
    const initializedRef = useRef(false);
    const initializedUnitsRef = useRef(new Set());

    // Synchroniser le niveau avec le profil utilisateur quand il change
    useEffect(() => {
        if (user && user.level && user.level !== currentLevel) {
            console.log(
                `Synchronisation du niveau avec le profil: ${user.level}`
            );
            setCurrentLevel(user.level);
        }
    }, [user, currentLevel]);

    // Utiliser l'ID de l'utilisateur pour le stockage des données de progression
    const userId = user?.id || "guest";

    // Initialiser le hook de répétition espacée avec l'ID utilisateur et le niveau
    const {
        facts,
        factsToReview,
        addFact,
        addMultipleFacts,
        updateFactProgress,
        getFactsToReviewToday,
        getProgressStats,
    } = useSpacedRepetition(userId, currentLevel, factsService);

    // Mise à jour de la période et de l'unité actives lors du changement de niveau
    useEffect(() => {
        if (
            !initializedRef.current &&
            currentLevel &&
            PROGRESSIONS[currentLevel]
        ) {
            setLoading(true);

            try {
                const firstPeriod = PROGRESSIONS[currentLevel].periods[0];
                if (firstPeriod) {
                    console.log(
                        `Sélection de la période par défaut: ${firstPeriod.name}`
                    );
                    setActivePeriod(firstPeriod);

                    const firstUnit = firstPeriod.units[0];
                    if (firstUnit) {
                        console.log(
                            `Sélection de l'unité par défaut: ${firstUnit.name}`
                        );
                        setActiveUnit(firstUnit);
                        initializedRef.current = true;
                    }
                }

                setError(null);
            } catch (err) {
                console.error(
                    `Erreur lors de l'initialisation du niveau ${currentLevel}:`,
                    err
                );
                setError(
                    `Erreur lors de l'initialisation du niveau: ${err.message}`
                );
            } finally {
                setLoading(false);
            }
        }
    }, [currentLevel]);

    // Initialiser les faits numériques de l'unité active
    useEffect(() => {
        if (
            !loading &&
            activeUnit &&
            activeUnit.facts &&
            activeUnit.facts.length > 0 &&
            !initializedUnitsRef.current.has(activeUnit.id) &&
            isInitialized
        ) {
            try {
                // Vérifier que les faits ne sont pas déjà ajoutés au système
                const factsToAdd = activeUnit.facts.filter(
                    (fact) => !facts[fact.id]
                );

                if (factsToAdd.length > 0) {
                    console.log(
                        `Ajout de ${factsToAdd.length} nouveaux faits de l'unité ${activeUnit.name}`
                    );
                    addMultipleFacts(factsToAdd);
                    initializedUnitsRef.current.add(activeUnit.id);
                }
            } catch (err) {
                console.error(
                    `Erreur lors de l'ajout des faits de l'unité ${activeUnit.name}:`,
                    err
                );
                setError(`Erreur lors de l'ajout des faits: ${err.message}`);
            }
        }
    }, [activeUnit, facts, addMultipleFacts, loading, isInitialized]);

    /**
     * Change le niveau de difficulté actif
     * @param {string} level - Niveau de difficulté
     * @returns {boolean} Succès de l'opération
     */
    const changeLevel = useCallback((level) => {
        try {
            if (!PROGRESSIONS[level]) {
                console.error(
                    `Le niveau ${level} n'existe pas dans les progressions`
                );
                return false;
            }

            console.log(`Changement de niveau vers: ${level}`);

            // Réinitialiser l'état d'initialisation
            initializedRef.current = false;
            initializedUnitsRef.current = new Set();

            setCurrentLevel(level);
            return true;
        } catch (err) {
            console.error(
                `Erreur lors du changement de niveau vers ${level}:`,
                err
            );
            setError(`Erreur lors du changement de niveau: ${err.message}`);
            return false;
        }
    }, []);

    /**
     * Change la période active
     * @param {Object} period - Période à activer
     * @returns {boolean} Succès de l'opération
     */
    const changePeriod = useCallback((period) => {
        try {
            if (!period || !period.units) {
                console.error("Période invalide ou sans unités");
                return false;
            }

            console.log(`Changement de période vers: ${period.name}`);
            setActivePeriod(period);

            // Activer la première unité de la nouvelle période par défaut
            if (period.units.length > 0) {
                console.log(
                    `Sélection de la première unité: ${period.units[0].name}`
                );
                setActiveUnit(period.units[0]);
            }

            return true;
        } catch (err) {
            console.error(`Erreur lors du changement de période:`, err);
            setError(`Erreur lors du changement de période: ${err.message}`);
            return false;
        }
    }, []);

    /**
     * Change l'unité active
     * @param {Object} unit - Unité à activer
     * @returns {boolean} Succès de l'opération
     */
    const changeUnit = useCallback((unit) => {
        try {
            if (!unit) {
                console.error("Unité invalide");
                return false;
            }

            console.log(`Changement d'unité vers: ${unit.name}`);
            setActiveUnit(unit);
            return true;
        } catch (err) {
            console.error(`Erreur lors du changement d'unité:`, err);
            setError(`Erreur lors du changement d'unité: ${err.message}`);
            return false;
        }
    }, []);

    /**
     * Récupère la progression pour un fait spécifique
     * @param {string} factId - Identifiant du fait
     * @returns {Object|null} Progression du fait ou null
     */
    const getFactProgress = useCallback(
        (factId) => {
            if (!factId || !facts[factId]) {
                return null;
            }
            return facts[factId];
        },
        [facts]
    );

    /**
     * Récupère tous les faits de l'unité active avec leur progression
     * @returns {Array} Faits avec leur progression
     */
    const getFactsWithProgress = useCallback(() => {
        if (!activeUnit || !activeUnit.facts) {
            return [];
        }

        return activeUnit.facts.map((fact) => ({
            ...fact,
            progress: facts[fact.id] || {
                level: KNOWLEDGE_LEVELS.NEW,
                successCount: 0,
                lastReviewed: null,
                nextReview: null,
            },
        }));
    }, [activeUnit, facts]);

    /**
     * Calcule les statistiques globales de progression
     * @returns {Object} Statistiques de progression
     */
    const getOverallProgress = useCallback(() => {
        const stats = getProgressStats();

        // Calcul du pourcentage de couverture de la progression
        let totalFactsInProgression = 0;
        let factsAdded = 0;

        if (currentLevel && PROGRESSIONS[currentLevel]) {
            PROGRESSIONS[currentLevel].periods.forEach((period) => {
                period.units.forEach((unit) => {
                    if (unit.facts) {
                        totalFactsInProgression += unit.facts.length;

                        unit.facts.forEach((fact) => {
                            if (facts[fact.id]) {
                                factsAdded++;
                            }
                        });
                    }
                });
            });
        }

        const progressionCoverage =
            totalFactsInProgression > 0
                ? Math.round((factsAdded / totalFactsInProgression) * 100)
                : 0;

        return {
            ...stats,
            progressionCoverage,
            currentLevel,
            activePeriodName: activePeriod?.name || null,
            activeUnitName: activeUnit?.name || null,
        };
    }, [currentLevel, facts, getProgressStats, activePeriod, activeUnit]);

    /**
     * Supprime tous les faits de progression pour l'utilisateur actuel
     * Utile pour les tests ou réinitialiser les données
     * @returns {Promise<boolean>} Succès de l'opération
     */
    const clearUserProgress = useCallback(async () => {
        try {
            if (!userId) {
                console.warn(
                    "Impossible de supprimer les faits: aucun utilisateur actif"
                );
                return false;
            }

            if (factsService && factsService.deleteAllFactsForUser) {
                await factsService.deleteAllFactsForUser(userId);
                console.log(
                    `Progression supprimée pour l'utilisateur ${userId}`
                );
                // Réinitialiser les références pour forcer le rechargement
                initializedUnitsRef.current = new Set();
                return true;
            } else {
                console.warn("Service de suppression de faits non disponible");
                return false;
            }
        } catch (err) {
            console.error(
                "Erreur lors de la suppression de la progression:",
                err
            );
            setError(
                `Erreur lors de la suppression de la progression: ${err.message}`
            );
            return false;
        }
    }, [userId, factsService]);

    /**
     * Exporte les données de progression au format JSON
     * @returns {Object|null} Données exportées ou null en cas d'erreur
     */
    const exportProgress = useCallback(() => {
        try {
            if (!userId) {
                console.warn(
                    "Impossible d'exporter la progression: aucun utilisateur actif"
                );
                return null;
            }

            return {
                userId,
                level: currentLevel,
                exportedAt: new Date().toISOString(),
                facts,
                metadata: {
                    totalFacts: Object.keys(facts).length,
                    stats: getProgressStats(),
                },
            };
        } catch (err) {
            console.error(
                "Erreur lors de l'exportation de la progression:",
                err
            );
            setError(`Erreur lors de l'exportation: ${err.message}`);
            return null;
        }
    }, [userId, currentLevel, facts, getProgressStats]);

    // Valeur du contexte à exposer
    const contextValue = {
        currentLevel,
        activePeriod,
        activeUnit,
        loading,
        error,
        changeLevel,
        changePeriod,
        changeUnit,
        getFactProgress,
        getFactsWithProgress,
        getOverallProgress,
        clearUserProgress,
        exportProgress,

        // Fonctions du système de répétition espacée
        facts,
        factsToReview,
        addFact,
        addMultipleFacts,
        updateFactProgress,
        getFactsToReviewToday,
    };

    return (
        <ProgressContext.Provider value={contextValue}>
            {children}
        </ProgressContext.Provider>
    );
};

ProgressProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProgressProvider;
