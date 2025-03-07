// src/hooks/useLocalStorage.js
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook pour stocker et récupérer des données dans le localStorage
 * @param {string} key - Clé pour le stockage
 * @param {*} initialValue - Valeur initiale
 * @returns {Array} [storedValue, setValue, removeValue] - État et fonctions pour manipuler les données
 */
export const useLocalStorage = (key, initialValue) => {
    // Vérification de la validité de la clé
    if (!key) {
        console.error("useLocalStorage: key is required");
        throw new Error("useLocalStorage: key is required");
    }

    // Référence pour suivre les montages
    const isMounted = useRef(false);

    // État pour gérer la valeur stockée
    const [storedValue, setStoredValue] = useState(() => {
        try {
            // Récupérer depuis localStorage ou utiliser la valeur initiale
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Synchroniser avec localStorage quand la valeur change
    useEffect(() => {
        // Ne pas exécuter lors du premier montage car nous avons déjà initialisé depuis localStorage
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    /**
     * Met à jour la valeur stockée
     * @param {*|Function} value - Nouvelle valeur ou fonction pour mettre à jour la valeur
     */
    const setValue = useCallback(
        (value) => {
            try {
                // Permettre une fonction pour la mise à jour (comme setState)
                const valueToStore =
                    value instanceof Function ? value(storedValue) : value;

                // Enregistrer dans l'état React et localStorage
                setStoredValue(valueToStore);
            } catch (error) {
                console.error(
                    `Error setting localStorage key "${key}":`,
                    error
                );
            }
        },
        [key, storedValue]
    );

    /**
     * Supprime la valeur du localStorage
     */
    const removeValue = useCallback(() => {
        try {
            // Supprimer du localStorage
            window.localStorage.removeItem(key);

            // Réinitialiser l'état à la valeur initiale
            setStoredValue(initialValue);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    /**
     * Vérifie si une clé existe dans le localStorage
     * @returns {boolean} True si la clé existe
     */
    const hasValue = useCallback(() => {
        try {
            return window.localStorage.getItem(key) !== null;
        } catch (error) {
            console.error(`Error checking localStorage key "${key}":`, error);
            return false;
        }
    }, [key]);

    return [storedValue, setValue, removeValue, hasValue];
};
