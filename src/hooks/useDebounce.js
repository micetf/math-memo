// src/hooks/useDebounce.js
import { useState, useEffect } from "react";

/**
 * Hook pour débouncer une valeur
 * @param {*} value - Valeur à débouncer
 * @param {number} delay - Délai en millisecondes
 * @returns {*} Valeur debouncée
 */
export const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Configurer le timer pour mettre à jour la valeur après le délai
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Nettoyer le timer si la valeur change avant le délai
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
};
