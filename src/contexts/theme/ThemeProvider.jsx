// src/contexts/theme/ThemeProvider.jsx
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import ThemeContext from "./ThemeContext";
import { useStorage } from "../storage";

/**
 * Fournisseur de contexte pour gérer le thème de l'application
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur ThemeContext
 */
export const ThemeProvider = ({ children }) => {
    const storage = useStorage();
    const [theme, setTheme] = useState("light");

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

    // Charger le thème stocké lors de l'initialisation
    useEffect(() => {
        const loadTheme = async () => {
            if (storage.isInitialized) {
                try {
                    // Utiliser await pour résoudre la Promise
                    const storedTheme = await storage.loadData(
                        "mathmemo-theme",
                        "light"
                    );
                    setTheme(storedTheme);
                    applyTheme(storedTheme);
                } catch (error) {
                    console.error("Erreur lors du chargement du thème:", error);
                    // En cas d'erreur, utiliser le thème par défaut
                    setTheme("light");
                    applyTheme("light");
                }
            }
        };

        loadTheme();
    }, [storage, applyTheme]);

    // Sauvegarder le thème lorsqu'il change
    useEffect(() => {
        const saveTheme = async () => {
            if (storage.isInitialized) {
                try {
                    // Utiliser await pour résoudre la Promise
                    await storage.saveData("mathmemo-theme", theme);
                } catch (error) {
                    console.error(
                        "Erreur lors de la sauvegarde du thème:",
                        error
                    );
                }
            }
        };

        saveTheme();
    }, [theme, storage]);

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
