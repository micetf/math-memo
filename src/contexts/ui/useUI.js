// src/contexts/ui/useUI.js
import { useContext } from "react";
import UIContext from "./UIContext";

/**
 * Hook pour utiliser le contexte UI
 * @returns {Object} Contexte UI
 */
export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error(
            "useUI doit être utilisé à l'intérieur d'un UIProvider"
        );
    }
    return context;
};
