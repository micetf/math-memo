// src/contexts/theme/useTheme.js
import { useContext } from "react";
import ThemeContext from "./ThemeContext";

/**
 * Hook personnalisé pour utiliser le contexte de thème
 * @returns {Object} Contexte de thème
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error(
            "useTheme doit être utilisé à l'intérieur d'un ThemeProvider"
        );
    }
    return context;
};
