/**
 * @file AuthContext.jsx
 * @description Contexte pour gérer l'authentification des utilisateurs
 */

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useLocalStorage } from "../hooks/useLocalStorage";
import AuthContext from "./AuthContext";

/**
 * Fournisseur de contexte pour gérer l'authentification
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur AuthContext
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useLocalStorage("mathmemo-user", null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Vérifier si l'utilisateur est déjà connecté
        // Pour cette PWA simple, nous utilisons le localStorage
        setLoading(false);
    }, []);

    /**
     * Connecte un utilisateur
     * @param {Object} userData - Données de l'utilisateur
     */
    const login = (userData) => {
        try {
            // Dans une version réelle, ce serait une requête API
            // Pour l'exemple, nous créons simplement un utilisateur local
            const newUser = {
                id: userData.id || `user-${Date.now()}`,
                name: userData.name || "Élève",
                avatar: userData.avatar || null,
                level: userData.level || "cp",
                createdAt: new Date().toISOString(),
            };

            setUser(newUser);
            setError(null);
            return newUser;
        } catch (err) {
            setError(`Impossible de se connecter : ${err}`);
            return null;
        }
    };

    /**
     * Connecte un utilisateur en tant qu'invité
     */
    const loginAsGuest = () => {
        const guestUser = {
            id: `guest-${Date.now()}`,
            name: "Invité",
            level: "cp",
            isGuest: true,
            createdAt: new Date().toISOString(),
        };

        setUser(guestUser);
        return guestUser;
    };

    /**
     * Déconnecte l'utilisateur actuel
     */
    const logout = () => {
        setUser(null);
    };

    /**
     * Met à jour le profil de l'utilisateur
     * @param {Object} updates - Mises à jour à appliquer
     */
    const updateProfile = (updates) => {
        if (!user) return null;

        const updatedUser = {
            ...user,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        setUser(updatedUser);
        return updatedUser;
    };

    // Valeur du contexte à exposer
    const contextValue = {
        user,
        loading,
        error,
        login,
        loginAsGuest,
        logout,
        updateProfile,
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
