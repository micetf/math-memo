/**
 * @file ProgressProvider.jsx
 * @description Contexte pour gérer la progression des élèves - version d'urgence pour éviter les boucles
 */

import { useState, useContext } from "react";
import PropTypes from "prop-types";
import AuthContext from "./AuthContext";
import { PROGRESSIONS, DIFFICULTY_LEVELS } from "../data/progressions";
import ProgressContext from "./ProgressContext";

/**
 * Fournisseur de contexte pour gérer la progression de l'élève - version simplifiée
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur ProgressContext
 */
export const ProgressProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [currentLevel, setCurrentLevel] = useState(
        user?.level || DIFFICULTY_LEVELS.CP
    );
    const [activePeriod, setActivePeriod] = useState(null);
    const [activeUnit, setActiveUnit] = useState(null);

    // Version simplifiée pour éviter les boucles infinies
    const mockFacts = {
        "mock-fact-1": {
            id: "mock-fact-1",
            level: 0,
            successCount: 0,
        },
    };

    const mockFactsToReview = [];

    // Fonctions simplifiées
    const changeLevel = (level) => {
        if (PROGRESSIONS[level]) {
            setCurrentLevel(level);
        }
    };

    const changePeriod = (period) => {
        setActivePeriod(period);
    };

    const changeUnit = (unit) => {
        setActiveUnit(unit);
    };

    const getFactProgress = () => null;

    const getFactsWithProgress = () => [];

    const getOverallProgress = () => ({
        totalFacts: 0,
        factsByLevel: { 0: 0, 1: 0, 2: 0, 3: 0 },
        masteredPercentage: 0,
        progressionCoverage: 0,
    });

    const addFact = () => {};

    const addMultipleFacts = () => {};

    const updateFactProgress = () => {};

    const getFactsToReviewToday = () => [];

    // Valeur du contexte simplifiée
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
        facts: mockFacts,
        factsToReview: mockFactsToReview,
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
