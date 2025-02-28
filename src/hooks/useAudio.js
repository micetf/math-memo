/**
 * @file useAudio.js
 * @description Hook pour gérer les effets sonores dans l'application
 */

import { useState, useEffect } from "react";

/**
 * Hook personnalisé pour gérer les effets sonores
 * @param {string} src - Chemin du fichier audio
 * @param {Object} options - Options de configuration
 * @param {boolean} [options.autoload=true] - Charger automatiquement l'audio
 * @returns {Object} Objet avec méthodes play, pause et des états
 */
export const useAudio = (src, { autoload = true } = {}) => {
    const [audio, setAudio] = useState(null);
    const [loading, setLoading] = useState(autoload);
    const [playing, setPlaying] = useState(false);
    const [error, setError] = useState(null);

    // Charger l'audio au montage du composant
    useEffect(() => {
        if (!src) {
            setError(new Error("Source audio non spécifiée"));
            setLoading(false);
            return;
        }

        const audioElement = new Audio();

        const handleCanPlayThrough = () => {
            setLoading(false);
        };

        const handleError = (e) => {
            setError(
                e.error || new Error("Erreur lors du chargement de l'audio")
            );
            setLoading(false);
        };

        const handleEnded = () => {
            setPlaying(false);
        };

        // Ajouter les écouteurs d'événements
        audioElement.addEventListener("canplaythrough", handleCanPlayThrough);
        audioElement.addEventListener("error", handleError);
        audioElement.addEventListener("ended", handleEnded);

        // Définir la source et commencer le chargement
        audioElement.src = src;
        if (autoload) {
            audioElement.load();
        }

        setAudio(audioElement);

        // Nettoyer les écouteurs d'événements lors du démontage
        return () => {
            audioElement.removeEventListener(
                "canplaythrough",
                handleCanPlayThrough
            );
            audioElement.removeEventListener("error", handleError);
            audioElement.removeEventListener("ended", handleEnded);
            audioElement.pause();
        };
    }, [src, autoload]);

    /**
     * Joue l'audio
     * @param {number} [volume=1] - Volume (0-1)
     */
    const play = (volume = 1) => {
        if (!audio) return;

        try {
            audio.volume = Math.min(Math.max(0, volume), 1);

            // Réinitialiser si déjà joué
            if (audio.currentTime > 0) {
                audio.currentTime = 0;
            }

            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setPlaying(true);
                    })
                    .catch((err) => {
                        console.error("Erreur lors de la lecture audio:", err);
                        setPlaying(false);
                    });
            }
        } catch (err) {
            console.error("Erreur lors de la lecture audio:", err);
            setPlaying(false);
        }
    };

    /**
     * Met en pause l'audio
     */
    const pause = () => {
        if (!audio) return;

        try {
            audio.pause();
            setPlaying(false);
        } catch (err) {
            console.error("Erreur lors de la mise en pause:", err);
        }
    };

    /**
     * Charge l'audio manuellement
     */
    const load = () => {
        if (!audio) return;

        try {
            setLoading(true);
            audio.load();
        } catch (err) {
            console.error("Erreur lors du chargement:", err);
            setLoading(false);
            setError(err);
        }
    };

    return {
        audio,
        playing,
        loading,
        error,
        play,
        pause,
        load,
    };
};
