// src/contexts/storage/StorageProvider.jsx
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import StorageContext from "./StorageContext";

/**
 * Fournisseur de contexte pour gérer le stockage de données de l'application
 * Ce provider servira d'abstraction pour faciliter la migration future vers IndexedDB
 *
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur StorageContext
 */
export const StorageProvider = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState(null);

    // Initialisation du stockage
    useEffect(() => {
        try {
            // Vérification que localStorage est disponible
            if (typeof window !== "undefined" && window.localStorage) {
                setIsInitialized(true);
            } else {
                throw new Error("localStorage n'est pas disponible");
            }
        } catch (err) {
            console.error("Erreur d'initialisation du stockage:", err);
            setError(err.message);
        }
    }, []);

    /**
     * Enregistre des données dans le stockage
     * @param {string} key - Clé de stockage
     * @param {*} data - Données à stocker (seront sérialisées en JSON)
     * @returns {boolean} Succès de l'opération
     */
    const saveData = useCallback((key, data) => {
        if (!key) {
            console.error("Clé de stockage manquante");
            return false;
        }

        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (err) {
            console.error(`Erreur lors de la sauvegarde de ${key}:`, err);
            setError(`Erreur de stockage: ${err.message}`);
            return false;
        }
    }, []);

    /**
     * Récupère des données du stockage
     * @param {string} key - Clé de stockage
     * @param {*} defaultValue - Valeur par défaut si les données n'existent pas
     * @returns {*} Données récupérées ou valeur par défaut
     */
    const loadData = useCallback((key, defaultValue = null) => {
        if (!key) {
            console.error("Clé de stockage manquante");
            return defaultValue;
        }

        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) {
                return defaultValue;
            }
            return JSON.parse(serializedData);
        } catch (err) {
            console.error(`Erreur lors du chargement de ${key}:`, err);
            setError(`Erreur de lecture: ${err.message}`);
            return defaultValue;
        }
    }, []);

    /**
     * Supprime des données du stockage
     * @param {string} key - Clé de stockage
     * @returns {boolean} Succès de l'opération
     */
    const removeData = useCallback((key) => {
        if (!key) {
            console.error("Clé de stockage manquante");
            return false;
        }

        try {
            localStorage.removeItem(key);
            return true;
        } catch (err) {
            console.error(`Erreur lors de la suppression de ${key}:`, err);
            setError(`Erreur de suppression: ${err.message}`);
            return false;
        }
    }, []);

    /**
     * Vérifie si une clé existe dans le stockage
     * @param {string} key - Clé à vérifier
     * @returns {boolean} True si la clé existe
     */
    const hasKey = useCallback((key) => {
        if (!key) return false;
        try {
            return localStorage.getItem(key) !== null;
        } catch (err) {
            console.error(`Erreur lors de la vérification de ${key}:`, err);
            return false;
        }
    }, []);

    /**
     * Efface toutes les données stockées par l'application
     * @returns {boolean} Succès de l'opération
     */
    const clearAllData = useCallback(() => {
        try {
            localStorage.clear();
            return true;
        } catch (err) {
            console.error(
                "Erreur lors de la suppression de toutes les données:",
                err
            );
            setError(`Erreur de nettoyage: ${err.message}`);
            return false;
        }
    }, []);

    // Valeur du contexte à exposer
    const contextValue = {
        isInitialized,
        error,
        saveData,
        loadData,
        removeData,
        hasKey,
        clearAllData,
    };

    return (
        <StorageContext.Provider value={contextValue}>
            {children}
        </StorageContext.Provider>
    );
};

StorageProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default StorageProvider;
