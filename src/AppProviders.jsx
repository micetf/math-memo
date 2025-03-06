/**
 * @file AppProviders.jsx
 * @description Composant qui centralise la gestion des contextes de l'application
 */

import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import AuthContext from "./contexts/AuthContext";
import ProgressContext from "./contexts/ProgressContext";
import { PROGRESSIONS, DIFFICULTY_LEVELS } from "./data/progressions";
import {
    useSpacedRepetition,
    KNOWLEDGE_LEVELS,
} from "./hooks/useSpacedRepetition";

/**
 * Composant qui fournit tous les contextes nécessaires à l'application
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur de contextes combinés
 */
export const AppProviders = ({ children }) => {
    // ========== ÉTAT PARTAGÉ ==========
    const [appState, setAppState] = useState({
        initialized: false,
        error: null,
    });

    // ========== ÉTAT AUTH ==========
    const [user, setUser] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [authLoading, setAuthLoading] = useState(true);

    // ========== ÉTAT PROGRESS ==========
    const [currentLevel, setCurrentLevel] = useState(DIFFICULTY_LEVELS.CP);
    const [activePeriod, setActivePeriod] = useState(null);
    const [activeUnit, setActiveUnit] = useState(null);

    // ========== INITIALISATION UNIQUE ==========
    useEffect(() => {
        if (appState.initialized) return;

        const initializeApp = async () => {
            console.log("Initialisation de l'application...");
            try {
                // 1. Charger les profils
                const storedProfiles =
                    localStorage.getItem("mathmemo-profiles");
                const parsedProfiles = storedProfiles
                    ? JSON.parse(storedProfiles)
                    : [];
                setProfiles(parsedProfiles);

                // 2. Charger l'utilisateur actif
                const activeUserId = localStorage.getItem(
                    "mathmemo-active-user"
                );
                let activeUser = null;

                if (activeUserId && parsedProfiles.length > 0) {
                    activeUser = parsedProfiles.find(
                        (p) => p.id === activeUserId
                    );
                    if (activeUser) {
                        setUser(activeUser);
                    }
                }

                // 3. Définir le niveau actif
                const level = activeUser?.level || DIFFICULTY_LEVELS.CP;
                setCurrentLevel(level);

                // 4. Initialiser la période et l'unité actives
                if (PROGRESSIONS[level]) {
                    const firstPeriod = PROGRESSIONS[level].periods[0];
                    if (firstPeriod) {
                        setActivePeriod(firstPeriod);
                        const firstUnit = firstPeriod.units[0];
                        if (firstUnit) {
                            setActiveUnit(firstUnit);
                        }
                    }
                }

                // 5. Finaliser l'initialisation
                setAppState((prev) => ({ ...prev, initialized: true }));
            } catch (error) {
                console.error("Erreur lors de l'initialisation:", error);
                setAppState((prev) => ({
                    ...prev,
                    error: "Erreur lors de l'initialisation de l'application",
                }));
            } finally {
                setAuthLoading(false);
            }
        };

        initializeApp();
    }, [appState.initialized]);

    // ========== HOOKS SPÉCIFIQUES ==========
    // Utiliser l'ID de l'utilisateur pour le stockage des données de progression
    const userId = user?.id || "guest";

    const {
        facts,
        factsToReview,
        addFact,
        addMultipleFacts,
        updateFactProgress,
        getFactsToReviewToday,
        getProgressStats,
    } = useSpacedRepetition(userId, currentLevel);

    // ========== FONCTIONS AUTH ==========
    /**
     * Sauvegarde les profils dans le localStorage
     */
    const saveProfiles = useCallback(() => {
        try {
            localStorage.setItem("mathmemo-profiles", JSON.stringify(profiles));
        } catch (err) {
            console.error("Erreur lors de la sauvegarde des profils:", err);
        }
    }, [profiles]);

    /**
     * Sauvegarde l'ID de l'utilisateur actif
     */
    const saveActiveUser = useCallback(() => {
        try {
            if (user && user.id) {
                localStorage.setItem("mathmemo-active-user", user.id);
            } else if (!user) {
                localStorage.removeItem("mathmemo-active-user");
            }
        } catch (err) {
            console.error(
                "Erreur lors de la sauvegarde de l'ID utilisateur:",
                err
            );
        }
    }, [user]);

    /**
     * Sélectionne un profil existant
     * @param {string} profileId - ID du profil
     * @returns {Object|null} Profil sélectionné ou null
     */
    const switchProfile = useCallback(
        (profileId) => {
            try {
                if (!profileId) return null;

                const profile = profiles.find((p) => p.id === profileId);
                if (profile) {
                    setUser(profile);
                    // Mettre à jour le niveau en fonction du profil
                    if (profile.level && profile.level !== currentLevel) {
                        setCurrentLevel(profile.level);
                    }
                    return profile;
                }
                return null;
            } catch (err) {
                console.error("Erreur lors du changement de profil:", err);
                return null;
            }
        },
        [profiles, currentLevel]
    );

    /**
     * Crée un nouveau profil
     * @param {Object} userData - Données du profil
     * @returns {Object|null} Nouveau profil ou null
     */
    const createProfile = useCallback((userData) => {
        try {
            if (!userData) return null;

            const newProfile = {
                id: `user-${Date.now()}`,
                name: userData.name || "Élève",
                avatar: userData.avatar || null,
                level: userData.level || DIFFICULTY_LEVELS.CP,
                preferences: userData.preferences || {
                    showTimer: true,
                    soundEffects: true,
                    darkMode: false,
                },
                createdAt: new Date().toISOString(),
            };

            setProfiles((prev) => [...prev, newProfile]);
            setUser(newProfile);
            return newProfile;
        } catch (err) {
            console.error("Erreur lors de la création du profil:", err);
            return null;
        }
    }, []);

    /**
     * Met à jour un profil existant
     * @param {Object} updates - Mises à jour à appliquer
     * @returns {Object|null} Profil mis à jour ou null
     */
    const updateProfile = useCallback(
        (updates) => {
            try {
                if (!user || !updates) return null;

                const updatedUser = {
                    ...user,
                    ...updates,
                    updatedAt: new Date().toISOString(),
                };

                setProfiles((prev) =>
                    prev.map((p) => (p.id === user.id ? updatedUser : p))
                );
                setUser(updatedUser);

                // Mettre à jour le niveau si nécessaire
                if (updates.level && updates.level !== currentLevel) {
                    setCurrentLevel(updates.level);
                }

                return updatedUser;
            } catch (err) {
                console.error("Erreur lors de la mise à jour du profil:", err);
                return null;
            }
        },
        [user, currentLevel]
    );

    /**
     * Supprime un profil
     * @param {string} profileId - ID du profil à supprimer
     * @returns {boolean} Succès de l'opération
     */
    const deleteProfile = useCallback(
        (profileId) => {
            try {
                if (user && user.id === profileId) {
                    return false;
                }

                setProfiles((prev) => prev.filter((p) => p.id !== profileId));
                return true;
            } catch (err) {
                console.error("Erreur lors de la suppression du profil:", err);
                return false;
            }
        },
        [user]
    );

    /**
     * Déconnecte l'utilisateur actif
     */
    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem("mathmemo-active-user");
    }, []);

    /**
     * Connecte l'utilisateur en tant qu'invité
     */
    const loginAsGuest = useCallback(() => {
        const guestProfile = {
            id: `guest-${Date.now()}`,
            name: "Invité",
            isGuest: true,
            level: currentLevel,
            preferences: {
                showTimer: true,
                soundEffects: true,
                darkMode: false,
            },
            createdAt: new Date().toISOString(),
        };

        setUser(guestProfile);
        return guestProfile;
    }, [currentLevel]);

    // ========== FONCTIONS PROGRESS ==========
    /**
     * Change le niveau de difficulté
     * @param {string} level - Niveau de difficulté
     */
    const changeLevel = useCallback(
        (level) => {
            if (PROGRESSIONS[level]) {
                setCurrentLevel(level);

                // Mettre à jour le profil de l'utilisateur si nécessaire
                if (user && user.level !== level) {
                    updateProfile({ level });
                }

                // Mettre à jour la période et l'unité
                const firstPeriod = PROGRESSIONS[level].periods[0];
                if (firstPeriod) {
                    setActivePeriod(firstPeriod);
                    const firstUnit = firstPeriod.units[0];
                    if (firstUnit) {
                        setActiveUnit(firstUnit);
                    }
                }
            }
        },
        [user, updateProfile]
    );

    /**
     * Change la période active
     * @param {Object} period - Période à activer
     */
    const changePeriod = useCallback((period) => {
        if (period && period.units) {
            setActivePeriod(period);

            // Activer la première unité de la période
            if (period.units.length > 0) {
                setActiveUnit(period.units[0]);
            }
        }
    }, []);

    /**
     * Change l'unité active
     * @param {Object} unit - Unité à activer
     */
    const changeUnit = useCallback((unit) => {
        if (unit) {
            setActiveUnit(unit);
        }
    }, []);

    /**
     * Récupère la progression pour un fait spécifique
     * @param {string} factId - Identifiant du fait
     * @returns {Object|null} Progression du fait ou null
     */
    const getFactProgress = useCallback(
        (factId) => {
            if (!factId || !facts[factId]) {
                return null;
            }
            return facts[factId];
        },
        [facts]
    );

    /**
     * Récupère tous les faits de l'unité active avec leur progression
     * @returns {Array} Faits avec leur progression
     */
    const getFactsWithProgress = useCallback(() => {
        if (!activeUnit || !activeUnit.facts) {
            return [];
        }

        return activeUnit.facts.map((fact) => ({
            ...fact,
            progress: facts[fact.id] || {
                level: KNOWLEDGE_LEVELS.NEW,
                successCount: 0,
                lastReviewed: null,
                nextReview: null,
            },
        }));
    }, [activeUnit, facts]);

    /**
     * Calcule les statistiques globales de progression
     * @returns {Object} Statistiques de progression
     */
    const getOverallProgress = useCallback(() => {
        const stats = getProgressStats();

        // Calcul du pourcentage de couverture de la progression
        let totalFactsInProgression = 0;
        let factsAdded = 0;

        if (currentLevel && PROGRESSIONS[currentLevel]) {
            PROGRESSIONS[currentLevel].periods.forEach((period) => {
                period.units.forEach((unit) => {
                    if (unit.facts) {
                        totalFactsInProgression += unit.facts.length;

                        unit.facts.forEach((fact) => {
                            if (facts[fact.id]) {
                                factsAdded++;
                            }
                        });
                    }
                });
            });
        }

        const progressionCoverage =
            totalFactsInProgression > 0
                ? Math.round((factsAdded / totalFactsInProgression) * 100)
                : 0;

        return {
            ...stats,
            progressionCoverage,
            currentLevel,
            activePeriodName: activePeriod?.name || null,
            activeUnitName: activeUnit?.name || null,
        };
    }, [currentLevel, facts, getProgressStats, activePeriod, activeUnit]);

    // ========== EFFETS POUR SAUVEGARDER LES DONNÉES ==========
    // Sauvegarder les profils quand ils changent
    useEffect(() => {
        if (appState.initialized) {
            saveProfiles();
        }
    }, [profiles, appState.initialized, saveProfiles]);

    // Sauvegarder l'ID de l'utilisateur actif quand il change
    useEffect(() => {
        if (appState.initialized) {
            saveActiveUser();
        }
    }, [user, appState.initialized, saveActiveUser]);

    // Initialiser les faits de l'unité active
    useEffect(() => {
        if (
            appState.initialized &&
            activeUnit &&
            activeUnit.facts &&
            activeUnit.facts.length > 0
        ) {
            // Vérifier que les faits ne sont pas déjà ajoutés
            const factsToAdd = activeUnit.facts.filter(
                (fact) => !facts[fact.id]
            );

            if (factsToAdd.length > 0) {
                console.log(
                    `Ajout de ${factsToAdd.length} nouveaux faits de l'unité ${activeUnit.name}`
                );
                addMultipleFacts(factsToAdd);
            }
        }
    }, [appState.initialized, activeUnit, facts, addMultipleFacts]);

    // ========== CONTEXTES ==========
    // Contexte d'authentification
    const authContextValue = {
        user,
        profiles,
        loading: authLoading,
        error: appState.error,
        switchProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        logout,
        loginAsGuest,
    };

    // Contexte de progression
    const progressContextValue = {
        currentLevel,
        activePeriod,
        activeUnit,
        changeLevel,
        changePeriod,
        changeUnit,
        getFactProgress,
        getFactsWithProgress,
        getOverallProgress,
        facts,
        factsToReview,
        addFact,
        addMultipleFacts,
        updateFactProgress,
        getFactsToReviewToday,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            <ProgressContext.Provider value={progressContextValue}>
                {children}
            </ProgressContext.Provider>
        </AuthContext.Provider>
    );
};

AppProviders.propTypes = {
    children: PropTypes.node.isRequired,
};
