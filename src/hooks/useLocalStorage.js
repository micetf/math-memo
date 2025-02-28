/**
 * @file useLocalStorage.js
 * @description Hook personnalisé pour gérer le LocalStorage
 */

import { useState } from "react";

/**
 * Hook pour stocker et récupérer des données dans le localStorage
 * @param {string} key - Clé pour le stockage
 * @param {*} initialValue - Valeur initiale
 * @returns {Array} État et fonction pour mettre à jour l'état
 */
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
};
