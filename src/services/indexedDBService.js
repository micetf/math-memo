// src/services/indexedDBService.js
import Dexie from "dexie";

/**
 * @file indexedDBService.js
 * @description Service complet de gestion de la base de données IndexedDB via Dexie.js
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
 * Vérifie si IndexedDB est supporté par le navigateur
 * @returns {boolean} True si IndexedDB est supporté
 */
export const isIndexedDBSupported = () => {
    try {
        return window.indexedDB !== undefined && window.indexedDB !== null;
    } catch (e) {
        console.warn("Vérification de support IndexedDB échouée:", e);
        return false;
    }
};

/**
 * Initialise la base de données
 * @returns {Promise<Dexie>} Instance Dexie initialisée
 */
export const initializeDatabase = async () => {
    if (db) return db;

    if (!isIndexedDBSupported()) {
        throw new Error("IndexedDB n'est pas supporté par ce navigateur");
    }

    try {
        // Créer une nouvelle instance de Dexie
        db = new Dexie(DB_NAME);

        // Définir le schéma
        db.version(DB_VERSION).stores({
            keyValuePairs: "&key", // Stockage clé-valeur général (remplace localStorage)
            profiles: "&id,name,level", // Profils utilisateurs
            facts: "&id,userId,level,nextReview", // Faits numériques et leur progression
            sessions: "&id,userId,date", // Sessions d'exercices
            analytics: "++id,userId,date,type", // Données analytiques
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

            // Préparer les données pour le stockage
            const item = {
                key,
                value,
                updatedAt: new Date().toISOString(),
            };

            await db.keyValuePairs.put(item);
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
     * Récupère toutes les clés qui commencent par un préfixe donné
     * @param {string} prefix - Préfixe des clés à récupérer
     * @returns {Promise<Array>} Tableau des paires clé-valeur correspondantes
     */
    getItemsByPrefix: async (prefix) => {
        try {
            if (!db) await initializeDatabase();
            return await db.keyValuePairs
                .filter((item) => item.key.startsWith(prefix))
                .toArray();
        } catch (error) {
            console.error(
                `Erreur lors de la récupération des clés avec le préfixe ${prefix}:`,
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

            // S'assurer que le profil a tous les champs nécessaires
            const completeProfile = {
                ...profile,
                updatedAt: new Date().toISOString(),
            };

            if (!completeProfile.createdAt) {
                completeProfile.createdAt = completeProfile.updatedAt;
            }

            await db.profiles.put(completeProfile);
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

    /**
     * Met à jour un profil utilisateur existant
     * @param {string} id - ID du profil à mettre à jour
     * @param {Object} updates - Mises à jour à appliquer
     * @returns {Promise<Object>} Profil mis à jour
     */
    updateProfile: async (id, updates) => {
        try {
            if (!db) await initializeDatabase();

            // Récupérer le profil existant
            const existingProfile = await db.profiles.get(id);

            if (!existingProfile) {
                throw new Error(`Profil avec ID ${id} non trouvé`);
            }

            // Appliquer les mises à jour
            const updatedProfile = {
                ...existingProfile,
                ...updates,
                updatedAt: new Date().toISOString(),
            };

            await db.profiles.put(updatedProfile);
            return updatedProfile;
        } catch (error) {
            console.error(
                `Erreur lors de la mise à jour du profil ${id}:`,
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

            const completeFact = {
                ...fact,
                updatedAt: new Date().toISOString(),
            };

            await db.facts.put(completeFact);
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

            const now = new Date().toISOString();
            const completeFacts = facts.map((fact) => ({
                ...fact,
                updatedAt: now,
            }));

            await db.facts.bulkPut(completeFacts);
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
     * Récupère tous les faits pour un niveau et un utilisateur donnés
     * @param {string} userId - ID de l'utilisateur
     * @param {string} level - Niveau scolaire
     * @returns {Promise<Array>} Tableau de faits numériques
     */
    getFactsByUserAndLevel: async (userId, level) => {
        try {
            if (!db) await initializeDatabase();
            return await db.facts.where({ userId, level }).toArray();
        } catch (error) {
            console.error(
                `Erreur lors de la récupération des faits pour l'utilisateur ${userId} et le niveau ${level}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Récupère les faits à réviser pour un utilisateur à une date donnée
     * @param {string} userId - ID de l'utilisateur
     * @param {Date} date - Date de révision
     * @returns {Promise<Array>} Tableau de faits numériques à réviser
     */
    getFactsToReview: async (userId, date = new Date()) => {
        try {
            if (!db) await initializeDatabase();
            const dateString = date.toISOString();
            return await db.facts
                .where({ userId })
                .and((item) => item.nextReview <= dateString)
                .toArray();
        } catch (error) {
            console.error(
                `Erreur lors de la récupération des faits à réviser pour l'utilisateur ${userId}:`,
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
            const allFacts = await db.facts.where({ userId }).toArray();

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
     * Met à jour un fait numérique existant
     * @param {string} id - ID du fait à mettre à jour
     * @param {Object} updates - Mises à jour à appliquer
     * @returns {Promise<Object>} Fait mis à jour
     */
    updateFact: async (id, updates) => {
        try {
            if (!db) await initializeDatabase();

            // Récupérer le fait existant
            const existingFact = await db.facts.get(id);

            if (!existingFact) {
                throw new Error(`Fait avec ID ${id} non trouvé`);
            }

            // Appliquer les mises à jour
            const updatedFact = {
                ...existingFact,
                ...updates,
                updatedAt: new Date().toISOString(),
            };

            await db.facts.put(updatedFact);
            return updatedFact;
        } catch (error) {
            console.error(
                `Erreur lors de la mise à jour du fait ${id}:`,
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

    /**
     * Supprime tous les faits d'un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @returns {Promise<number>} Nombre de faits supprimés
     */
    deleteAllFactsForUser: async (userId) => {
        try {
            if (!db) await initializeDatabase();
            return await db.facts.where({ userId }).delete();
        } catch (error) {
            console.error(
                `Erreur lors de la suppression des faits pour l'utilisateur ${userId}:`,
                error
            );
            throw error;
        }
    },
};

/**
 * Service pour la gestion des sessions d'exercices
 */
export const sessionsService = {
    /**
     * Enregistre une session d'exercices
     * @param {Object} session - Session à enregistrer
     * @returns {Promise<string>} ID de la session enregistrée
     */
    saveSession: async (session) => {
        try {
            if (!db) await initializeDatabase();

            const completeSession = {
                ...session,
                updatedAt: new Date().toISOString(),
            };

            if (!completeSession.createdAt) {
                completeSession.createdAt = completeSession.updatedAt;
            }

            await db.sessions.put(completeSession);
            return session.id;
        } catch (error) {
            console.error(
                `Erreur lors de l'enregistrement de la session ${session.id}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Récupère les sessions d'un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @returns {Promise<Array>} Tableau de sessions
     */
    getSessionsByUser: async (userId) => {
        try {
            if (!db) await initializeDatabase();
            return await db.sessions.where({ userId }).toArray();
        } catch (error) {
            console.error(
                `Erreur lors de la récupération des sessions pour l'utilisateur ${userId}:`,
                error
            );
            throw error;
        }
    },
};

/**
 * Service pour la gestion des données analytiques
 */
export const analyticsService = {
    /**
     * Enregistre un événement analytique
     * @param {Object} event - Événement à enregistrer
     * @returns {Promise<number>} ID de l'événement enregistré
     */
    logEvent: async (event) => {
        try {
            if (!db) await initializeDatabase();

            const completeEvent = {
                ...event,
                timestamp: new Date().toISOString(),
            };

            return await db.analytics.add(completeEvent);
        } catch (error) {
            console.error(
                "Erreur lors de l'enregistrement d'un événement analytique:",
                error
            );
            throw error;
        }
    },

    /**
     * Récupère les événements analytiques d'un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @param {string} [type] - Type d'événement (optionnel)
     * @returns {Promise<Array>} Tableau d'événements
     */
    getEventsByUser: async (userId, type = null) => {
        try {
            if (!db) await initializeDatabase();

            if (type) {
                return await db.analytics.where({ userId, type }).toArray();
            }

            return await db.analytics.where({ userId }).toArray();
        } catch (error) {
            console.error(
                `Erreur lors de la récupération des événements pour l'utilisateur ${userId}:`,
                error
            );
            throw error;
        }
    },
};

/**
 * Migration des données de localStorage vers IndexedDB
 * @returns {Promise<{success: boolean, migrated: number, total: number, errors: number}>} Résultat de la migration
 */
export const migrateFromLocalStorage = async () => {
    if (!isIndexedDBSupported()) {
        console.warn("IndexedDB n'est pas supporté, migration impossible");
        return { success: false, migrated: 0, total: 0, errors: 0 };
    }

    try {
        await initializeDatabase();
        console.log("Début de la migration depuis localStorage");

        // Obtenir toutes les clés du localStorage
        const keys = Object.keys(localStorage);
        let migratedItems = 0;
        let errorItems = 0;
        const startTime = Date.now();

        // Grouper les faits par utilisateur et niveau pour une migration par lots
        const factsGroups = {};

        for (const key of keys) {
            try {
                // Exclure certaines clés si nécessaire
                if (key.startsWith("devtools") || key.startsWith("console")) {
                    continue;
                }

                // Récupérer et parser la valeur
                const rawValue = localStorage.getItem(key);
                let value;

                try {
                    value = JSON.parse(rawValue);
                } catch (error) {
                    // Si le parsing échoue, utiliser la valeur brute
                    value = rawValue;
                    console.log(`Le parsing a échoué : ${error}`);
                }

                // Déterminer où stocker la valeur en fonction du préfixe ou du contenu
                if (key === "mathmemo-profiles") {
                    // Migrer les profils
                    if (Array.isArray(value)) {
                        for (const profile of value) {
                            await profilesService.saveProfile({
                                ...profile,
                                migratedAt: new Date().toISOString(),
                            });
                        }
                    }
                    migratedItems++;
                } else if (key === "mathmemo-active-user") {
                    // Migrer l'utilisateur actif comme une paire clé-valeur
                    await keyValueService.saveItem(key, value);
                    migratedItems++;
                } else if (key.startsWith("spaced-rep-")) {
                    // Migrer les faits numériques
                    const parts = key.split("-");
                    const userId = parts.length > 2 ? parts[2] : "guest";
                    const level = parts.length > 3 ? parts[3] : "default";

                    // Grouper les faits pour les ajouter en lot
                    const groupKey = `${userId}-${level}`;
                    factsGroups[groupKey] = factsGroups[groupKey] || [];

                    // Transformer l'objet en tableau de faits avec userId et level ajoutés
                    const facts = Object.entries(value).map(
                        ([factId, factData]) => ({
                            ...factData,
                            id: factId,
                            userId,
                            level,
                            migratedAt: new Date().toISOString(),
                        })
                    );

                    factsGroups[groupKey].push(...facts);
                    migratedItems++;
                } else {
                    // Migrer comme paire clé-valeur générique
                    await keyValueService.saveItem(key, value);
                    migratedItems++;
                }
            } catch (err) {
                console.warn(`Échec de migration pour la clé ${key}:`, err);
                errorItems++;
                // Continuer avec les autres clés
            }
        }

        // Migrer tous les groupes de faits en lot
        for (const groupKey in factsGroups) {
            if (factsGroups[groupKey].length > 0) {
                await factsService.saveManyFacts(factsGroups[groupKey]);
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(
            `Migration terminée en ${duration}s: ${migratedItems}/${keys.length} éléments migrés, ${errorItems} erreurs`
        );

        // Marquer la migration comme terminée
        await keyValueService.saveItem("mathmemo-migration-completed", {
            date: new Date().toISOString(),
            migrated: migratedItems,
            total: keys.length,
            errors: errorItems,
        });

        return {
            success: true,
            migrated: migratedItems,
            total: keys.length,
            errors: errorItems,
        };
    } catch (error) {
        console.error(
            "Erreur lors de la migration depuis localStorage:",
            error
        );
        return {
            success: false,
            migrated: 0,
            total: 0,
            errors: 1,
            error: error.message,
        };
    }
};

export default {
    initializeDatabase,
    getDatabase,
    isIndexedDBSupported,
    keyValueService,
    profilesService,
    factsService,
    sessionsService,
    analyticsService,
    migrateFromLocalStorage,
    // Alias de compatibilité pour références existantes
    keyValue: keyValueService,
    profiles: profilesService,
    facts: factsService,
};
