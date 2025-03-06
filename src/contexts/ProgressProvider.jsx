/**
 * @file ProgressProvider.jsx
 * @description Contexte pour gérer la progression des élèves - version corrigée
 */

import { useState, useEffect, useContext, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import AuthContext from "./AuthContext";
import { PROGRESSIONS, DIFFICULTY_LEVELS } from "../data/progressions";
import ProgressContext from "./ProgressContext";
import {
    useSpacedRepetition,
    KNOWLEDGE_LEVELS,
} from "../hooks/useSpacedRepetition";

/**
 * Fournisseur de contexte pour gérer la progression de l'élève
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur ProgressContext
 */
export const ProgressProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    // Utiliser une ref pour suivre les changements d'utilisateur ou de niveau
    const prevUserRef = useRef(null);
    const prevLevelRef = useRef(null);

    // État pour le niveau, la période et l'unité actifs
    const [currentLevel, setCurrentLevel] = useState(
        user?.level || DIFFICULTY_LEVELS.CP
    );
    const [activePeriod, setActivePeriod] = useState(null);
    const [activeUnit, setActiveUnit] = useState(null);

    // Utiliser l'ID de l'utilisateur pour le stockage des données de progression
    const userId = user?.id || "guest";

    // Synchroniser le niveau avec le profil utilisateur quand il change
    useEffect(() => {
        // Vérifier si l'utilisateur ou le niveau a changé pour éviter les mises à jour inutiles
        if (
            user &&
            user.level &&
            user.level !== currentLevel &&
            (prevUserRef.current !== user.id ||
                prevLevelRef.current !== user.level)
        ) {
            console.log(
                `Synchronisation du niveau avec le profil: ${user.level}`
            );
            setCurrentLevel(user.level);
            prevUserRef.current = user.id;
            prevLevelRef.current = user.level;
        }
    }, [user, currentLevel]);

    // Initialiser le hook de répétition espacée avec l'ID utilisateur et le niveau
    const {
        facts,
        factsToReview,
        addFact,
        addMultipleFacts,
        updateFactProgress,
        getFactsToReviewToday,
        getProgressStats,
    } = useSpacedRepetition(userId, currentLevel);

    // Journalisation pour le débogage
    const logOnceRef = useRef(false);
    useEffect(() => {
        // Limiter la journalisation pour éviter les boucles de mise à jour
        if (!logOnceRef.current) {
            console.log("ProgressProvider - État initial:", {
                userId,
                currentLevel,
                activePeriodId: activePeriod?.id,
                activeUnitId: activeUnit?.id,
                factsCount: Object.keys(facts || {}).length,
                factsToReviewCount: factsToReview?.length || 0,
            });
            logOnceRef.current = true;
        }
    }, [userId, currentLevel, activePeriod, activeUnit, facts, factsToReview]);

    // Mise à jour de la période et de l'unité actives lors du changement de niveau
    // Utiliser une ref pour éviter de déclencher cet effet trop souvent
    const levelInitializedRef = useRef(false);
    useEffect(() => {
        if (
            currentLevel &&
            PROGRESSIONS[currentLevel] &&
            !levelInitializedRef.current
        ) {
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
                    levelInitializedRef.current = true;
                }
            }
        }
    }, [currentLevel]);

    // Fonction pour initialiser les faits numériques de l'unité active
    // Utiliser une ref pour suivre les unités déjà initialisées
    const initializedUnitsRef = useRef(new Set());
    useEffect(() => {
        if (
            activeUnit &&
            activeUnit.facts &&
            activeUnit.facts.length > 0 &&
            !initializedUnitsRef.current.has(activeUnit.id)
        ) {
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
        }
    }, [activeUnit, facts, addMultipleFacts]);

    /**
     * Change le niveau de difficulté actif
     * @param {string} level - Niveau de difficulté
     */
    const changeLevel = useCallback((level) => {
        if (PROGRESSIONS[level]) {
            console.log(`Changement de niveau vers: ${level}`);
            // Réinitialiser l'état d'initialisation
            levelInitializedRef.current = false;
            setCurrentLevel(level);
        } else {
            console.error(
                `Le niveau ${level} n'existe pas dans les progressions`
            );
        }
    }, []);

    /**
     * Change la période active
     * @param {Object} period - Période à activer
     */
    const changePeriod = useCallback((period) => {
        if (period && period.units) {
            console.log(`Changement de période vers: ${period.name}`);
            setActivePeriod(period);

            // Activer la première unité de la nouvelle période par défaut
            if (period.units.length > 0) {
                console.log(
                    `Sélection de la première unité: ${period.units[0].name}`
                );
                setActiveUnit(period.units[0]);
            }
        }
    }, []);

    /**
     * Change l'unité active
     * @param {Object} unit - Unité à activer
     */
    const changeUnit = useCallback((unit) => {
        if (unit) {
            console.log(`Changement d'unité vers: ${unit.name}`);
            setActiveUnit(unit);
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

    // Valeur du contexte à exposer
    const contextValue = {
        currentLevel,
        activePeriod,
        activeUnit,
        changeLevel,
        changePeriod,
        changeUnit,
        getFactProgress,
        getFactsWithProgress,
        getOverallProgress,

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
