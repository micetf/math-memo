// src/hooks/useAppSettings.js
import { useCallback, useMemo } from "react";
import { useAuth, useUI } from "../contexts";

/**
 * Hook personnalisé pour gérer les paramètres globaux de l'application
 * Combine la gestion des préférences utilisateur et des paramètres UI
 * @returns {Object} Méthodes et états pour gérer les paramètres
 */
export const useAppSettings = () => {
    const { user, updateProfile } = useAuth();
    const {
        darkMode,
        soundEffects,
        showTimer,
        toggleDarkMode,
        toggleSoundEffects,
        toggleShowTimer,
        getUIPreferences,
    } = useUI();

    /**
     * Met à jour les préférences de l'utilisateur et de l'UI en même temps
     * @param {Object} preferences - Préférences à mettre à jour
     * @returns {boolean} Succès de l'opération
     */
    const updateUserPreferences = useCallback(
        (preferences) => {
            try {
                // Mettre à jour l'UI
                if (preferences.darkMode !== undefined) {
                    toggleDarkMode(preferences.darkMode);
                }
                if (preferences.soundEffects !== undefined) {
                    toggleSoundEffects(preferences.soundEffects);
                }
                if (preferences.showTimer !== undefined) {
                    toggleShowTimer(preferences.showTimer);
                }

                // Si un utilisateur est connecté, mettre à jour son profil
                if (user && !user.isGuest) {
                    updateProfile({
                        preferences: {
                            ...user.preferences,
                            ...preferences,
                        },
                    });
                }

                return true;
            } catch (err) {
                console.error(
                    "Erreur lors de la mise à jour des préférences:",
                    err
                );
                return false;
            }
        },
        [
            user,
            updateProfile,
            toggleDarkMode,
            toggleSoundEffects,
            toggleShowTimer,
        ]
    );

    /**
     * Obtient les préférences actuelles
     * @returns {Object} Préférences combinées
     */
    const getAllPreferences = useCallback(() => {
        return {
            darkMode,
            soundEffects,
            showTimer,
            ...getUIPreferences(),
            ...(user?.preferences || {}),
        };
    }, [darkMode, soundEffects, showTimer, getUIPreferences, user]);

    /**
     * État mémorisé des préférences actuelles
     * Évite de recalculer cet objet à chaque rendu
     */
    const currentPreferences = useMemo(
        () => ({
            darkMode,
            soundEffects,
            showTimer,
        }),
        [darkMode, soundEffects, showTimer]
    );

    /**
     * Détecte si les préférences UI sont synchronisées avec le profil utilisateur
     * Utile pour afficher des avertissements ou des suggestions de synchronisation
     */
    const preferencesInSync = useMemo(() => {
        if (!user || user.isGuest) return true;

        const userPrefs = user.preferences || {};
        return (
            userPrefs.darkMode === darkMode &&
            userPrefs.soundEffects === soundEffects &&
            userPrefs.showTimer === showTimer
        );
    }, [user, darkMode, soundEffects, showTimer]);

    return {
        // États mémorisés
        ...currentPreferences,
        preferencesInSync,

        // Fonctions
        updateUserPreferences,
        getAllPreferences,
    };
};

export default useAppSettings;
