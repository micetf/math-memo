// src/services/indexedDBService.js
import Dexie from "dexie";

/**
 * @file indexedDBService.js
 * @description Service de gestion de la base de données IndexedDB via Dexie.js
 */

/**
 * Version actuelle de la base de données
 * À incrémenter lors des changements de schéma
 * @constant {number}
 */
const DB_VERSION = 1;

/**
 * Nom de la base de données
 * @constant {string}
 */
const DB_NAME = "mathmemoDb";

/**
 * Instance de la base de données Dexie
 * @type {Dexie}
 */
let db = null;

/**
 * Initialise la base de données
 * @returns {Promise<Dexie>} Instance Dexie initialisée
 */
export const initializeDatabase = async () => {
    if (db) return db;

    try {
        // Créer une nouvelle instance de Dexie
        db = new Dexie(DB_NAME);

        // Définir le schéma
        db.version(DB_VERSION).stores({
            keyValuePairs: "&key", // Stockage clé-valeur général (remplace localStorage)
            profiles: "&id,name,level", // Profils utilisateurs
            facts: "&id,level,nextReview", // Faits numériques et leur progression
            sessions: "&id,userId,date", // Sessions d'exercices
            analytics: "++id,userId,date", // Données analytiques
        });

        // Ouvrir la connexion à la base de données
        await db.open();
        console.log(
            `Base de données ${DB_NAME} v${DB_VERSION} initialisée avec succès`
        );
        return db;
    } catch (error) {
        console.error(
            "Erreur lors de l'initialisation de la base de données:",
            error
        );
        throw new Error(
            `Erreur d'initialisation de la base de données: ${error.message}`
        );
    }
};

/**
 * Obtient l'instance de la base de données
 * @returns {Dexie|null} Instance de la base de données ou null si non initialisée
 */
export const getDatabase = () => {
    return db;
};

/**
 * Service pour les opérations de stockage clé-valeur
 * Remplacement direct de localStorage mais avec IndexedDB
 */
export const keyValueService = {
    /**
     * Enregistre une valeur associée à une clé
     * @param {string} key - Clé unique
     * @param {*} value - Valeur à stocker
     * @returns {Promise<string>} Clé de l'élément enregistré
     */
    saveItem: async (key, value) => {
        try {
            if (!db) await initializeDatabase();
            await db.keyValuePairs.put({ key, value });
            return key;
        } catch (error) {
            console.error(
                `Erreur lors de l'enregistrement de la clé ${key}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Récupère une valeur à partir de sa clé
     * @param {string} key - Clé à récupérer
     * @returns {Promise<*>} Valeur associée à la clé
     */
    getItem: async (key) => {
        try {
            if (!db) await initializeDatabase();
            const item = await db.keyValuePairs.get(key);
            return item ? item.value : null;
        } catch (error) {
            console.error(
                `Erreur lors de la récupération de la clé ${key}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Supprime une valeur à partir de sa clé
     * @param {string} key - Clé à supprimer
     * @returns {Promise<void>}
     */
    removeItem: async (key) => {
        try {
            if (!db) await initializeDatabase();
            await db.keyValuePairs.delete(key);
        } catch (error) {
            console.error(
                `Erreur lors de la suppression de la clé ${key}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Vérifie si une clé existe
     * @param {string} key - Clé à vérifier
     * @returns {Promise<boolean>} True si la clé existe
     */
    hasKey: async (key) => {
        try {
            if (!db) await initializeDatabase();
            const count = await db.keyValuePairs
                .where("key")
                .equals(key)
                .count();
            return count > 0;
        } catch (error) {
            console.error(
                `Erreur lors de la vérification de la clé ${key}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Récupère toutes les paires clé-valeur
     * @returns {Promise<Array>} Tableau de toutes les paires clé-valeur
     */
    getAllItems: async () => {
        try {
            if (!db) await initializeDatabase();
            return await db.keyValuePairs.toArray();
        } catch (error) {
            console.error(
                "Erreur lors de la récupération de toutes les clés:",
                error
            );
            throw error;
        }
    },

    /**
     * Efface toutes les données du stockage clé-valeur
     * @returns {Promise<void>}
     */
    clear: async () => {
        try {
            if (!db) await initializeDatabase();
            await db.keyValuePairs.clear();
        } catch (error) {
            console.error("Erreur lors de l'effacement du stockage:", error);
            throw error;
        }
    },
};

/**
 * Service pour la gestion des profils utilisateurs
 */
export const profilesService = {
    /**
     * Enregistre un profil utilisateur
     * @param {Object} profile - Profil utilisateur à enregistrer
     * @returns {Promise<string>} ID du profil enregistré
     */
    saveProfile: async (profile) => {
        try {
            if (!db) await initializeDatabase();
            await db.profiles.put(profile);
            return profile.id;
        } catch (error) {
            console.error(
                `Erreur lors de l'enregistrement du profil ${profile.id}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Récupère un profil utilisateur par son ID
     * @param {string} id - ID du profil
     * @returns {Promise<Object|null>} Profil utilisateur ou null si non trouvé
     */
    getProfileById: async (id) => {
        try {
            if (!db) await initializeDatabase();
            return await db.profiles.get(id);
        } catch (error) {
            console.error(
                `Erreur lors de la récupération du profil ${id}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Récupère tous les profils utilisateurs
     * @returns {Promise<Array>} Tableau de tous les profils
     */
    getAllProfiles: async () => {
        try {
            if (!db) await initializeDatabase();
            return await db.profiles.toArray();
        } catch (error) {
            console.error(
                "Erreur lors de la récupération de tous les profils:",
                error
            );
            throw error;
        }
    },

    /**
     * Supprime un profil utilisateur
     * @param {string} id - ID du profil à supprimer
     * @returns {Promise<void>}
     */
    deleteProfile: async (id) => {
        try {
            if (!db) await initializeDatabase();
            await db.profiles.delete(id);
        } catch (error) {
            console.error(
                `Erreur lors de la suppression du profil ${id}:`,
                error
            );
            throw error;
        }
    },
};

/**
 * Service pour la gestion des faits numériques et leur progression
 */
export const factsService = {
    /**
     * Enregistre un fait numérique
     * @param {Object} fact - Fait numérique à enregistrer
     * @returns {Promise<string>} ID du fait enregistré
     */
    saveFact: async (fact) => {
        try {
            if (!db) await initializeDatabase();
            await db.facts.put(fact);
            return fact.id;
        } catch (error) {
            console.error(
                `Erreur lors de l'enregistrement du fait ${fact.id}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Enregistre plusieurs faits numériques
     * @param {Array} facts - Tableau de faits numériques à enregistrer
     * @returns {Promise<number>} Nombre de faits enregistrés
     */
    saveManyFacts: async (facts) => {
        try {
            if (!db) await initializeDatabase();
            await db.facts.bulkPut(facts);
            return facts.length;
        } catch (error) {
            console.error(
                "Erreur lors de l'enregistrement de plusieurs faits:",
                error
            );
            throw error;
        }
    },

    /**
     * Récupère un fait par son ID
     * @param {string} id - ID du fait
     * @returns {Promise<Object|null>} Fait numérique ou null si non trouvé
     */
    getFactById: async (id) => {
        try {
            if (!db) await initializeDatabase();
            return await db.facts.get(id);
        } catch (error) {
            console.error(
                `Erreur lors de la récupération du fait ${id}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Récupère tous les faits pour un niveau donné
     * @param {string} level - Niveau scolaire
     * @returns {Promise<Array>} Tableau de faits numériques
     */
    getFactsByLevel: async (level) => {
        try {
            if (!db) await initializeDatabase();
            return await db.facts.where("level").equals(level).toArray();
        } catch (error) {
            console.error(
                `Erreur lors de la récupération des faits pour le niveau ${level}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Récupère les faits à réviser à une date donnée
     * @param {Date} date - Date de révision
     * @returns {Promise<Array>} Tableau de faits numériques à réviser
     */
    getFactsToReview: async (date) => {
        try {
            if (!db) await initializeDatabase();
            const dateString = date.toISOString();
            return await db.facts
                .where("nextReview")
                .belowOrEqual(dateString)
                .toArray();
        } catch (error) {
            console.error(
                "Erreur lors de la récupération des faits à réviser:",
                error
            );
            throw error;
        }
    },

    /**
     * Récupère tous les faits pour un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @returns {Promise<Object>} Objet avec les faits indexés par leur ID
     */
    getAllFactsForUser: async (userId) => {
        try {
            if (!db) await initializeDatabase();
            const allFacts = await db.facts
                .where("userId")
                .equals(userId)
                .toArray();
            // Transformer en objet indexé par ID
            return allFacts.reduce((acc, fact) => {
                acc[fact.id] = fact;
                return acc;
            }, {});
        } catch (error) {
            console.error(
                `Erreur lors de la récupération des faits pour l'utilisateur ${userId}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Supprime un fait
     * @param {string} id - ID du fait à supprimer
     * @returns {Promise<void>}
     */
    deleteFact: async (id) => {
        try {
            if (!db) await initializeDatabase();
            await db.facts.delete(id);
        } catch (error) {
            console.error(
                `Erreur lors de la suppression du fait ${id}:`,
                error
            );
            throw error;
        }
    },
};

// Exporter d'autres services spécifiques selon les besoins

/**
 * Migration des données de localStorage vers IndexedDB
 * @returns {Promise<boolean>} Succès de la migration
 */
export const migrateFromLocalStorage = async () => {
    try {
        await initializeDatabase();
        console.log("Début de la migration depuis localStorage");

        // Obtenir toutes les clés du localStorage
        const keys = Object.keys(localStorage);
        let migratedItems = 0;

        for (const key of keys) {
            try {
                // Exclure certaines clés si nécessaire
                if (key.startsWith("devtools") || key.startsWith("console")) {
                    continue;
                }

                // Récupérer et parser la valeur
                const value = JSON.parse(localStorage.getItem(key));

                // Déterminer où stocker la valeur en fonction du préfixe ou du contenu
                if (key.startsWith("mathmemo-profiles")) {
                    // Migrer les profils
                    if (Array.isArray(value)) {
                        for (const profile of value) {
                            await profilesService.saveProfile(profile);
                        }
                    }
                } else if (key.startsWith("spaced-rep-")) {
                    // Migrer les faits numériques
                    const userId = key.split("-")[2];
                    const level = key.split("-")[3];

                    // Transformer l'objet en tableau de faits avec userId et level ajoutés
                    const facts = Object.entries(value).map(
                        ([factId, factData]) => ({
                            ...factData,
                            id: factId,
                            userId,
                            level,
                        })
                    );

                    await factsService.saveManyFacts(facts);
                } else {
                    // Migrer comme paire clé-valeur générique
                    await keyValueService.saveItem(key, value);
                }

                migratedItems++;
            } catch (err) {
                console.warn(`Échec de migration pour la clé ${key}:`, err);
                // Continuer avec les autres clés
            }
        }

        console.log(
            `Migration terminée: ${migratedItems}/${keys.length} éléments migrés`
        );
        return true;
    } catch (error) {
        console.error(
            "Erreur lors de la migration depuis localStorage:",
            error
        );
        return false;
    }
};

export default {
    initializeDatabase,
    getDatabase,
    keyValueService,
    profilesService,
    factsService,
    migrateFromLocalStorage,
};
