// src/contexts/storage/StorageProvider.jsx
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import StorageContext from "./StorageContext";
import indexedDBService, {
    initializeDatabase,
    keyValueService,
} from "../../services/indexedDBService";

/**
 * Vérifie si une valeur est sérialisable pour le stockage
 * @param {*} value - Valeur à vérifier
 * @returns {boolean} True si la valeur est sérialisable
 */
const isSerializable = (value) => {
    // Vérifier les types non sérialisables
    if (
        value instanceof Function ||
        value instanceof Promise ||
        value instanceof Map ||
        value instanceof Set ||
        value instanceof WeakMap ||
        value instanceof WeakSet ||
        value instanceof Error ||
        value === undefined
    ) {
        return false;
    }

    // Pour les objets et tableaux, vérifier récursivement chaque propriété
    if (typeof value === "object" && value !== null) {
        // Pour les dates, RegExp et autres objets sérialisables
        if (
            value instanceof Date ||
            value instanceof RegExp ||
            value instanceof String ||
            value instanceof Number ||
            value instanceof Boolean
        ) {
            return true;
        }

        // Vérifier si c'est un tableau
        if (Array.isArray(value)) {
            return value.every((item) => isSerializable(item));
        }

        // Pour les objets ordinaires
        return Object.keys(value).every((key) => isSerializable(value[key]));
    }

    // Les types primitifs sont sérialisables
    return true;
};

/**
 * Fournisseur de contexte pour gérer le stockage de données de l'application
 * Utilise IndexedDB via Dexie.js pour un stockage persistant et performant
 *
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur StorageContext
 */
export const StorageProvider = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState(null);
    const [isIndexedDBSupported, setIsIndexedDBSupported] = useState(true);

    // Initialisation du stockage
    useEffect(() => {
        const initStorage = async () => {
            try {
                // Vérifier que IndexedDB est disponible
                if (!window.indexedDB) {
                    console.warn(
                        "IndexedDB n'est pas supporté, utilisation du fallback localStorage"
                    );
                    setIsIndexedDBSupported(false);
                    setIsInitialized(true);
                    return;
                }

                // Initialiser IndexedDB
                await initializeDatabase();
                console.log("Stockage IndexedDB initialisé avec succès");
                setIsInitialized(true);
            } catch (err) {
                console.error("Erreur d'initialisation du stockage:", err);
                setError(err.message);

                // En cas d'échec avec IndexedDB, utiliser localStorage comme fallback
                setIsIndexedDBSupported(false);
                setIsInitialized(true);
            }
        };

        initStorage();
    }, []);

    /**
     * Enregistre des données dans le stockage
     * @param {string} key - Clé de stockage
     * @param {*} data - Données à stocker (seront sérialisées en JSON)
     * @returns {Promise<boolean>} Succès de l'opération
     */
    const saveData = useCallback(
        async (key, data) => {
            if (!key) {
                console.error("Clé de stockage manquante");
                return false;
            }

            try {
                // Vérifier si les données sont sérialisables
                if (!isSerializable(data)) {
                    throw new Error("Les données ne sont pas sérialisables");
                }

                if (isIndexedDBSupported) {
                    // Utiliser IndexedDB
                    await keyValueService.saveItem(key, data);
                } else {
                    // Fallback à localStorage
                    const serializedData = JSON.stringify(data);
                    localStorage.setItem(key, serializedData);
                }
                return true;
            } catch (err) {
                console.error(`Erreur lors de la sauvegarde de ${key}:`, err);
                setError(`Erreur de stockage: ${err.message}`);
                return false;
            }
        },
        [isIndexedDBSupported]
    );

    /**
     * Récupère des données du stockage
     * @param {string} key - Clé de stockage
     * @param {*} defaultValue - Valeur par défaut si les données n'existent pas
     * @returns {Promise<*>} Données récupérées ou valeur par défaut
     */
    const loadData = useCallback(
        async (key, defaultValue = null) => {
            if (!key) {
                console.error("Clé de stockage manquante");
                return defaultValue;
            }

            try {
                let data;

                if (isIndexedDBSupported) {
                    // Utiliser IndexedDB
                    data = await keyValueService.getItem(key);
                } else {
                    // Fallback à localStorage
                    const serializedData = localStorage.getItem(key);
                    data =
                        serializedData !== null
                            ? JSON.parse(serializedData)
                            : null;
                }

                return data !== null ? data : defaultValue;
            } catch (err) {
                console.error(`Erreur lors du chargement de ${key}:`, err);
                setError(`Erreur de lecture: ${err.message}`);
                return defaultValue;
            }
        },
        [isIndexedDBSupported]
    );

    /**
     * Supprime des données du stockage
     * @param {string} key - Clé de stockage
     * @returns {Promise<boolean>} Succès de l'opération
     */
    const removeData = useCallback(
        async (key) => {
            if (!key) {
                console.error("Clé de stockage manquante");
                return false;
            }

            try {
                if (isIndexedDBSupported) {
                    // Utiliser IndexedDB
                    await keyValueService.removeItem(key);
                } else {
                    // Fallback à localStorage
                    localStorage.removeItem(key);
                }
                return true;
            } catch (err) {
                console.error(`Erreur lors de la suppression de ${key}:`, err);
                setError(`Erreur de suppression: ${err.message}`);
                return false;
            }
        },
        [isIndexedDBSupported]
    );

    /**
     * Vérifie si une clé existe dans le stockage
     * @param {string} key - Clé à vérifier
     * @returns {Promise<boolean>} True si la clé existe
     */
    const hasKey = useCallback(
        async (key) => {
            if (!key) return false;
            try {
                if (isIndexedDBSupported) {
                    // Utiliser IndexedDB
                    return await keyValueService.hasKey(key);
                } else {
                    // Fallback à localStorage
                    return localStorage.getItem(key) !== null;
                }
            } catch (err) {
                console.error(`Erreur lors de la vérification de ${key}:`, err);
                return false;
            }
        },
        [isIndexedDBSupported]
    );

    /**
     * Efface toutes les données stockées par l'application
     * @returns {Promise<boolean>} Succès de l'opération
     */
    const clearAllData = useCallback(async () => {
        try {
            if (isIndexedDBSupported) {
                // Utiliser IndexedDB
                await keyValueService.clear();
            } else {
                // Fallback à localStorage
                localStorage.clear();
            }
            return true;
        } catch (err) {
            console.error(
                "Erreur lors de la suppression de toutes les données:",
                err
            );
            setError(`Erreur de nettoyage: ${err.message}`);
            return false;
        }
    }, [isIndexedDBSupported]);

    /**
     * Migre les données de localStorage vers IndexedDB
     * @returns {Promise<boolean>} Succès de la migration
     */
    const migrateFromLocalStorage = useCallback(async () => {
        if (!isIndexedDBSupported) {
            console.warn("IndexedDB n'est pas supporté, migration impossible");
            return false;
        }

        try {
            return await indexedDBService.migrateFromLocalStorage();
        } catch (err) {
            console.error(
                "Erreur lors de la migration depuis localStorage:",
                err
            );
            setError(`Erreur de migration: ${err.message}`);
            return false;
        }
    }, [isIndexedDBSupported]);

    // Valeur du contexte à exposer
    const contextValue = {
        isInitialized,
        error,
        isIndexedDBSupported,
        saveData,
        loadData,
        removeData,
        hasKey,
        clearAllData,
        migrateFromLocalStorage,
        // Exposer les services spécifiques pour un accès direct
        indexedDBService,
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
