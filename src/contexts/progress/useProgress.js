// src/contexts/progress/useProgress.js
import { useContext } from "react";
import ProgressContext from "./ProgressContext";

/**
 * Hook pour utiliser le contexte de progression
 * @returns {Object} Contexte de progression
 */
export const useProgress = () => {
    const context = useContext(ProgressContext);
    if (!context) {
        throw new Error(
            "useProgress doit être utilisé à l'intérieur d'un ProgressProvider"
        );
    }
    return context;
};
