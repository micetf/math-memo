/**
 * @file ProgressContext.jsx
 * @description Contexte pour gérer la progression des élèves
 */

import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import AuthContext from "./AuthContext";
import { useSpacedRepetition } from "../hooks/useSpacedRepetition";
import { PROGRESSIONS, DIFFICULTY_LEVELS } from "../data/progressions";
import ProgressContext from "./ProgressContext";

/**
 * Fournisseur de contexte pour gérer la progression de l'élève
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur ProgressContext
 */
export const ProgressProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [currentLevel, setCurrentLevel] = useState(DIFFICULTY_LEVELS.CP);
    const [activePeriod, setActivePeriod] = useState(null);
    const [activeUnit, setActiveUnit] = useState(null);

    // Initialiser le système de répétition espacée avec l'ID de l'utilisateur
    const spacedRepetition = useSpacedRepetition(
        user?.id || "guest",
        currentLevel
    );

    // S'assurer que les faits numériques sont chargés
    useEffect(() => {
        if (user) {
            // Charger les faits de la progression actuelle
            const progression = PROGRESSIONS[currentLevel];

            if (progression) {
                // Par défaut, charger la première période ou celle active
                const period = activePeriod || progression.periods[0];
                setActivePeriod(period);

                // Par défaut, charger la première unité ou celle active
                const unit = activeUnit || period.units[0];
                setActiveUnit(unit);

                // Ajouter tous les faits de l'unité au système de répétition espacée
                spacedRepetition.addMultipleFacts(unit.facts);
            }
        }
    }, [user, currentLevel, activePeriod, activeUnit, spacedRepetition]);

    /**
     * Change le niveau de difficulté actuel
     * @param {string} level - Niveau de difficulté (CP, CE1, CE2)
     */
    const changeLevel = (level) => {
        if (PROGRESSIONS[level]) {
            setCurrentLevel(level);
            setActivePeriod(null);
            setActiveUnit(null);
        }
    };

    /**
     * Change la période active
     * @param {Object} period - Période à activer
     */
    const changePeriod = (period) => {
        const progression = PROGRESSIONS[currentLevel];
        const validPeriod = progression.periods.find((p) => p.id === period.id);

        if (validPeriod) {
            setActivePeriod(validPeriod);
            setActiveUnit(validPeriod.units[0]);
        }
    };

    /**
     * Change l'unité active
     * @param {Object} unit - Unité à activer
     */
    const changeUnit = (unit) => {
        if (activePeriod) {
            const validUnit = activePeriod.units.find((u) => u.id === unit.id);

            if (validUnit) {
                setActiveUnit(validUnit);
                // Ajouter les faits de cette unité au système de répétition espacée
                spacedRepetition.addMultipleFacts(validUnit.facts);
            }
        }
    };

    /**
     * Récupère les données de progression pour un fait spécifique
     * @param {string} factId - Identifiant du fait
     * @returns {Object|null} Données de progression ou null
     */
    const getFactProgress = (factId) => {
        return spacedRepetition.facts[factId] || null;
    };

    /**
     * Récupère tous les faits avec leur progression pour l'unité active
     * @returns {Array} Liste de faits avec leur progression
     */
    const getFactsWithProgress = () => {
        if (!activeUnit) return [];

        return activeUnit.facts.map((fact) => ({
            ...fact,
            progress: getFactProgress(fact.id),
        }));
    };

    /**
     * Récupère les statistiques globales de progression
     * @returns {Object} Statistiques de progression
     */
    const getOverallProgress = () => {
        const stats = spacedRepetition.getProgressStats();

        // Calculer le nombre total de faits dans la progression courante
        let totalFactsInProgression = 0;
        const progression = PROGRESSIONS[currentLevel];

        progression.periods.forEach((period) => {
            period.units.forEach((unit) => {
                totalFactsInProgression += unit.facts.length;
            });
        });

        return {
            ...stats,
            totalFactsInProgression,
            progressionCoverage: Math.round(
                (stats.totalFacts / totalFactsInProgression) * 100
            ),
        };
    };

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
        facts: spacedRepetition.facts,
        factsToReview: spacedRepetition.factsToReview,
        addFact: spacedRepetition.addFact,
        addMultipleFacts: spacedRepetition.addMultipleFacts,
        updateFactProgress: spacedRepetition.updateFactProgress,
        getFactsToReviewToday: spacedRepetition.getFactsToReviewToday,
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
