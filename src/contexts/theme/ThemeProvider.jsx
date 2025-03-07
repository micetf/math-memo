// src/contexts/theme/ThemeProvider.jsx
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import ThemeContext from "./ThemeContext";
import { useStorage } from "../storage"; // Import via barrel

/**
 * Fournisseur de contexte pour gérer le thème de l'application
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur ThemeContext
 */
export const ThemeProvider = ({ children }) => {
    const storage = useStorage();
    const [theme, setTheme] = useState("light");

    // Charger le thème stocké lors de l'initialisation
    useEffect(() => {
        if (storage.isInitialized) {
            const storedTheme = storage.loadData("mathmemo-theme", "light");
            setTheme(storedTheme);
            applyTheme(storedTheme);
        }
    }, [applyTheme, storage]);

    // Sauvegarder le thème lorsqu'il change
    useEffect(() => {
        if (storage.isInitialized) {
            storage.saveData("mathmemo-theme", theme);
        }
    }, [theme, storage]);

    /**
     * Applique le thème au document
     * @param {string} newTheme - Thème à appliquer
     */
    const applyTheme = useCallback((newTheme) => {
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    /**
     * Définit un nouveau thème
     * @param {string} newTheme - Nouveau thème ('light' ou 'dark')
     */
    const setNewTheme = useCallback(
        (newTheme) => {
            if (newTheme === "light" || newTheme === "dark") {
                setTheme(newTheme);
                applyTheme(newTheme);
            }
        },
        [applyTheme]
    );

    /**
     * Bascule entre les thèmes clair et sombre
     */
    const toggleTheme = useCallback(() => {
        const newTheme = theme === "light" ? "dark" : "light";
        setNewTheme(newTheme);
    }, [theme, setNewTheme]);

    const value = {
        theme,
        setTheme: setNewTheme,
        toggleTheme,
        isDark: theme === "dark",
    };

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ThemeProvider;
