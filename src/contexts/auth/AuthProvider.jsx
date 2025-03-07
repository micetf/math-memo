// src/contexts/auth/AuthProvider.jsx
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { AuthContext, useStorage } from "..";
import { DIFFICULTY_LEVELS } from "../../data/progressions";

// Clés de stockage
const STORAGE_KEYS = {
    PROFILES: "mathmemo-profiles",
    ACTIVE_USER: "mathmemo-active-user",
};

/**
 * Fournisseur de contexte pour gérer l'authentification des utilisateurs
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur AuthContext
 */
export const AuthProvider = ({ children }) => {
    // Accès au contexte de stockage
    const { isInitialized, loadData, saveData, removeData, profilesService } =
        useStorage();

    // États
    const [profiles, setProfiles] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialisation au chargement
    useEffect(() => {
        if (!isInitialized) return;

        const initializeAuth = async () => {
            try {
                setLoading(true);

                let storedProfiles = [];
                // Essayer d'abord d'utiliser profilesService (IndexedDB)
                if (profilesService) {
                    try {
                        storedProfiles = await profilesService.getAllProfiles();
                    } catch (err) {
                        console.warn(
                            "Impossible d'utiliser profilesService, fallback vers loadData:",
                            err
                        );
                        // Si ça échoue, utiliser loadData (qui gère IndexedDB ou localStorage selon le cas)
                        storedProfiles = await loadData(
                            STORAGE_KEYS.PROFILES,
                            []
                        );
                    }
                } else {
                    // Utiliser loadData directement
                    storedProfiles = await loadData(STORAGE_KEYS.PROFILES, []);
                }

                setProfiles(storedProfiles);

                // Charger l'utilisateur actif
                const activeUserId = await loadData(
                    STORAGE_KEYS.ACTIVE_USER,
                    null
                );
                if (activeUserId && storedProfiles.length > 0) {
                    const activeProfile = storedProfiles.find(
                        (p) => p.id === activeUserId
                    );
                    if (activeProfile) {
                        setUser(activeProfile);
                    }
                }

                setError(null);
            } catch (err) {
                console.error(
                    "Erreur lors de l'initialisation de l'authentification:",
                    err
                );
                setError("Erreur de chargement des profils: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [isInitialized, loadData, profilesService]);

    // Sauvegarde des profils quand ils changent
    useEffect(() => {
        if (!isInitialized || loading) return;

        const saveProfiles = async () => {
            try {
                // Essayer d'abord d'utiliser profilesService (IndexedDB)
                if (profilesService) {
                    try {
                        // Mise à jour individuelle de chaque profil
                        for (const profile of profiles) {
                            await profilesService.saveProfile(profile);
                        }
                    } catch (err) {
                        console.warn(
                            "Impossible d'utiliser profilesService, fallback vers saveData:",
                            err
                        );
                        // Fallback vers saveData
                        await saveData(STORAGE_KEYS.PROFILES, profiles);
                    }
                } else {
                    // Utiliser saveData directement
                    await saveData(STORAGE_KEYS.PROFILES, profiles);
                }
            } catch (error) {
                console.error(
                    "Erreur lors de la sauvegarde des profils:",
                    error
                );
                setError(
                    "Erreur lors de la sauvegarde des profils: " + error.message
                );
            }
        };

        saveProfiles();
    }, [isInitialized, loading, profiles, saveData, profilesService]);

    // Sauvegarde de l'ID utilisateur actif quand il change
    useEffect(() => {
        if (!isInitialized || loading) return;

        const saveActiveUser = async () => {
            try {
                if (user && user.id) {
                    await saveData(STORAGE_KEYS.ACTIVE_USER, user.id);
                } else if (!user) {
                    await removeData(STORAGE_KEYS.ACTIVE_USER);
                }
            } catch (error) {
                console.error(
                    "Erreur lors de la sauvegarde de l'utilisateur actif:",
                    error
                );
                setError(
                    "Erreur lors de la sauvegarde de l'utilisateur actif: " +
                        error.message
                );
            }
        };

        saveActiveUser();
    }, [isInitialized, loading, user, saveData, removeData]);

    /**
     * Sélectionne un profil existant
     * @param {string} profileId - ID du profil
     * @returns {Object|null} Le profil sélectionné ou null
     */
    const switchProfile = useCallback(
        (profileId) => {
            try {
                if (!profileId) {
                    console.error("ID de profil non fourni");
                    return null;
                }

                const profile = profiles.find((p) => p.id === profileId);
                if (profile) {
                    setUser(profile);
                    setError(null);
                    return profile;
                } else {
                    console.error(`Profil avec ID ${profileId} non trouvé`);
                    return null;
                }
            } catch (err) {
                console.error("Erreur lors du changement de profil:", err);
                setError("Erreur lors du changement de profil: " + err.message);
                return null;
            }
        },
        [profiles]
    );

    /**
     * Crée un nouveau profil et le définit comme utilisateur actif
     * @param {Object} userData - Données du profil
     * @returns {Object|null} Le nouveau profil ou null
     */
    const createProfile = useCallback((userData) => {
        try {
            if (!userData) {
                console.error("Données utilisateur non fournies");
                setError("Aucune donnée utilisateur fournie");
                return null;
            }

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
                updatedAt: new Date().toISOString(),
            };

            // Mettre à jour l'état des profils
            setProfiles((prevProfiles) => [
                ...(prevProfiles || []),
                newProfile,
            ]);

            // Définir comme utilisateur actif
            setUser(newProfile);
            setError(null);

            return newProfile;
        } catch (err) {
            console.error("Erreur lors de la création du profil:", err);
            setError("Erreur lors de la création du profil: " + err.message);
            return null;
        }
    }, []);

    /**
     * Met à jour le profil de l'utilisateur actif
     * @param {Object} updates - Mises à jour à appliquer
     * @returns {Object|null} Le profil mis à jour ou null
     */
    const updateProfile = useCallback(
        (updates) => {
            try {
                if (!user) {
                    console.error("Cannot update profile: No user logged in");
                    setError("Aucun utilisateur connecté");
                    return null;
                }

                if (!updates) {
                    console.error("No updates provided");
                    setError("Aucune mise à jour fournie");
                    return null;
                }

                const updatedUser = {
                    ...user,
                    ...updates,
                    updatedAt: new Date().toISOString(),
                };

                // Mettre à jour dans les profils
                setProfiles((prevProfiles) =>
                    prevProfiles.map((p) =>
                        p.id === user.id ? updatedUser : p
                    )
                );

                // Mettre à jour l'utilisateur actif
                setUser(updatedUser);
                setError(null);

                return updatedUser;
            } catch (err) {
                console.error("Erreur lors de la mise à jour du profil:", err);
                setError(
                    "Erreur lors de la mise à jour du profil: " + err.message
                );
                return null;
            }
        },
        [user]
    );

    /**
     * Supprime un profil
     * @param {string} profileId - ID du profil à supprimer
     * @returns {boolean} - Succès de l'opération
     */
    const deleteProfile = useCallback(
        (profileId) => {
            try {
                // Vérifier que ce n'est pas le profil actif
                if (user && user.id === profileId) {
                    setError(
                        "Impossible de supprimer le profil actif. Changez d'abord de profil."
                    );
                    return false;
                }

                // Supprimer le profil
                setProfiles((prevProfiles) =>
                    prevProfiles.filter((p) => p.id !== profileId)
                );

                // Supprimer également de IndexedDB si disponible
                if (profilesService) {
                    try {
                        profilesService.deleteProfile(profileId);
                    } catch (error) {
                        console.warn(
                            "Erreur lors de la suppression du profil dans IndexedDB:",
                            error
                        );
                        // Continuer quand même car la suppression d'état est déjà faite
                    }
                }

                setError(null);
                return true;
            } catch (err) {
                console.error("Erreur lors de la suppression du profil:", err);
                setError(
                    "Erreur lors de la suppression du profil: " + err.message
                );
                return false;
            }
        },
        [user, profilesService]
    );

    /**
     * Déconnecte l'utilisateur actif
     */
    const logout = useCallback(async () => {
        try {
            setUser(null);
            await removeData(STORAGE_KEYS.ACTIVE_USER);
            setError(null);
        } catch (err) {
            console.error("Erreur lors de la déconnexion:", err);
            setError("Erreur lors de la déconnexion: " + err.message);
        }
    }, [removeData]);

    /**
     * Connecte l'utilisateur en tant qu'invité
     * @param {string} level - Niveau de difficulté initial
     * @returns {Object|null} Profil invité ou null
     */
    const loginAsGuest = useCallback((level = DIFFICULTY_LEVELS.CP) => {
        try {
            const guestProfile = {
                id: `guest-${Date.now()}`,
                name: "Invité",
                isGuest: true,
                level: level,
                preferences: {
                    showTimer: true,
                    soundEffects: true,
                    darkMode: false,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            setUser(guestProfile);
            setError(null);
            return guestProfile;
        } catch (err) {
            console.error(
                "Erreur lors de la connexion en tant qu'invité:",
                err
            );
            setError(
                "Erreur lors de la connexion en tant qu'invité: " + err.message
            );
            return null;
        }
    }, []);

    // Valeur du contexte à exposer
    const contextValue = {
        user,
        profiles,
        loading,
        error,
        switchProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        logout,
        loginAsGuest,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthProvider;
