/**
 * @file AuthProvider.jsx
 * @description Contexte pour gérer l'authentification des utilisateurs - version corrigée
 */

import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import AuthContext from "./AuthContext";

/**
 * Fournisseur de contexte pour gérer l'authentification
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur AuthContext
 */
export const AuthProvider = ({ children }) => {
    // État pour l'utilisateur actif
    const [user, setUser] = useState(null);

    // État pour tous les profils existants
    const [profiles, setProfiles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Utiliser une ref pour éviter les rendus multiples
    const initializedRef = useRef(false);

    // Initialisation des profils au démarrage
    useEffect(() => {
        // Éviter les initialisations multiples
        if (initializedRef.current) return;

        const initializeAuth = () => {
            try {
                setLoading(true);

                // Charger tous les profils
                const storedProfiles =
                    localStorage.getItem("mathmemo-profiles");
                const parsedProfiles = storedProfiles
                    ? JSON.parse(storedProfiles)
                    : [];
                setProfiles(parsedProfiles);

                // Charger l'utilisateur actif
                const activeUserId = localStorage.getItem(
                    "mathmemo-active-user"
                );
                if (activeUserId && parsedProfiles.length > 0) {
                    const activeProfile = parsedProfiles.find(
                        (p) => p.id === activeUserId
                    );
                    if (activeProfile) {
                        setUser(activeProfile);
                    }
                }

                setError(null);
                initializedRef.current = true;
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
    }, []);

    // Utiliser une ref pour éviter les mises à jour infinies
    const profilesRef = useRef(profiles);

    // Sauvegarder les profils quand ils changent
    useEffect(() => {
        // Ne mettre à jour que si les profils ont changé
        if (JSON.stringify(profilesRef.current) !== JSON.stringify(profiles)) {
            try {
                localStorage.setItem(
                    "mathmemo-profiles",
                    JSON.stringify(profiles || [])
                );
                profilesRef.current = profiles;
            } catch (err) {
                console.error("Erreur de sauvegarde des profils:", err);
            }
        }
    }, [profiles]);

    // Utiliser une ref pour éviter les mises à jour infinies
    const userIdRef = useRef(user?.id);

    // Sauvegarder l'ID de l'utilisateur actif quand il change
    useEffect(() => {
        // Ne mettre à jour que si l'ID utilisateur a changé
        if (userIdRef.current !== user?.id) {
            try {
                if (user && user.id) {
                    localStorage.setItem("mathmemo-active-user", user.id);
                } else if (!user) {
                    localStorage.removeItem("mathmemo-active-user");
                }
                userIdRef.current = user?.id;
            } catch (err) {
                console.error(
                    "Erreur de sauvegarde de l'ID utilisateur actif:",
                    err
                );
            }
        }
    }, [user]);

    /**
     * Connecte l'utilisateur avec un profil existant
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
                level: userData.level || "cp",
                preferences: userData.preferences || {
                    showTimer: true,
                    soundEffects: true,
                    darkMode: false,
                },
                createdAt: new Date().toISOString(),
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
        [user]
    );

    /**
     * Déconnecte l'utilisateur actif
     */
    const logout = useCallback(() => {
        try {
            setUser(null);
            localStorage.removeItem("mathmemo-active-user");
            setError(null);
        } catch (err) {
            console.error("Erreur lors de la déconnexion:", err);
            setError("Erreur lors de la déconnexion: " + err.message);
        }
    }, []);

    /**
     * Connecte l'utilisateur en tant qu'invité
     */
    const loginAsGuest = useCallback(() => {
        try {
            const guestProfile = {
                id: `guest-${Date.now()}`,
                name: "Invité",
                isGuest: true,
                level: "cp",
                preferences: {
                    showTimer: true,
                    soundEffects: true,
                    darkMode: false,
                },
                createdAt: new Date().toISOString(),
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
