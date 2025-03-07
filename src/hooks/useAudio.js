// src/hooks/useAudio.js
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook personnalisé pour gérer les effets sonores
 * @param {string} src - Chemin du fichier audio
 * @param {Object} options - Options de configuration
 * @param {boolean} [options.autoload=true] - Charger automatiquement l'audio
 * @param {string} [options.preload='auto'] - Type de préchargement ('auto', 'metadata', 'none')
 * @returns {Object} Objet avec méthodes play, pause et des états
 */
export const useAudio = (src, { autoload = true, preload = "auto" } = {}) => {
    const [loading, setLoading] = useState(autoload);
    const [playing, setPlaying] = useState(false);
    const [error, setError] = useState(null);
    const [duration, setDuration] = useState(0);

    // Utiliser useRef pour l'élément audio afin d'éviter des rendus inutiles
    const audioRef = useRef(null);

    // Garder une trace des événements montés
    const mountedRef = useRef(false);

    // Initialisation de l'audio et gestion des événements
    useEffect(() => {
        // Si le composant est démonté entre-temps, ne rien faire
        mountedRef.current = true;

        if (!src) {
            setError(new Error("Source audio non spécifiée"));
            setLoading(false);
            return;
        }

        try {
            // Créer l'élément audio s'il n'existe pas déjà
            if (!audioRef.current) {
                audioRef.current = new Audio();
            }

            const audioElement = audioRef.current;

            // Configurer les options
            audioElement.preload = preload;

            // Gestionnaires d'événements
            const handleCanPlayThrough = () => {
                if (mountedRef.current) {
                    setLoading(false);
                    setDuration(audioElement.duration);
                }
            };

            const handleError = (e) => {
                if (mountedRef.current) {
                    console.error("Erreur audio:", e);
                    setError(
                        e.error ||
                            new Error("Erreur lors du chargement de l'audio")
                    );
                    setLoading(false);
                }
            };

            const handleEnded = () => {
                if (mountedRef.current) {
                    setPlaying(false);
                }
            };

            // Ajouter les écouteurs d'événements
            audioElement.addEventListener(
                "canplaythrough",
                handleCanPlayThrough
            );
            audioElement.addEventListener("error", handleError);
            audioElement.addEventListener("ended", handleEnded);

            // Définir la source et commencer le chargement
            if (audioElement.src !== src) {
                audioElement.src = src;
                if (autoload) {
                    setLoading(true);
                    audioElement.load();
                }
            }

            // Nettoyer les écouteurs d'événements lors du démontage
            return () => {
                mountedRef.current = false;
                audioElement.removeEventListener(
                    "canplaythrough",
                    handleCanPlayThrough
                );
                audioElement.removeEventListener("error", handleError);
                audioElement.removeEventListener("ended", handleEnded);
                audioElement.pause();
            };
        } catch (err) {
            console.error("Erreur lors de l'initialisation audio:", err);
            setError(err);
            setLoading(false);
        }
    }, [src, autoload, preload]);

    /**
     * Joue l'audio
     * @param {number} [volume=1] - Volume (0-1)
     * @param {number} [startTime=null] - Position de départ en secondes (optionnel)
     * @returns {Promise<void>} Promesse résolue lorsque l'audio commence à jouer
     */
    const play = useCallback(async (volume = 1, startTime = null) => {
        if (!audioRef.current)
            return Promise.reject(new Error("Audio non initialisé"));

        try {
            const audio = audioRef.current;
            audio.volume = Math.min(Math.max(0, volume), 1); // Limiter entre 0 et 1

            // Si startTime est spécifié, définir la position de départ
            if (startTime !== null && !isNaN(startTime)) {
                audio.currentTime = Math.max(
                    0,
                    Math.min(startTime, audio.duration || 0)
                );
            }

            // Réinitialiser si déjà joué jusqu'à la fin
            if (audio.ended) {
                audio.currentTime = 0;
            }

            // Utiliser une promesse pour gérer correctement la lecture
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                setPlaying(true);
                await playPromise;
                return;
            }

            setPlaying(true);
            return Promise.resolve();
        } catch (err) {
            console.error("Erreur lors de la lecture audio:", err);
            setPlaying(false);
            return Promise.reject(err);
        }
    }, []);

    /**
     * Met en pause l'audio
     * @returns {boolean} Succès de l'opération
     */
    const pause = useCallback(() => {
        if (!audioRef.current) return false;

        try {
            audioRef.current.pause();
            setPlaying(false);
            return true;
        } catch (err) {
            console.error("Erreur lors de la mise en pause:", err);
            return false;
        }
    }, []);

    /**
     * Arrête la lecture et remet le curseur au début
     * @returns {boolean} Succès de l'opération
     */
    const stop = useCallback(() => {
        if (!audioRef.current) return false;

        try {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setPlaying(false);
            return true;
        } catch (err) {
            console.error("Erreur lors de l'arrêt de l'audio:", err);
            return false;
        }
    }, []);

    /**
     * Change le volume de l'audio
     * @param {number} newVolume - Nouveau volume (0-1)
     * @returns {boolean} Succès de l'opération
     */
    const setVolume = useCallback((newVolume) => {
        if (!audioRef.current) return false;

        try {
            // Limiter le volume entre 0 et 1
            const safeVolume = Math.min(Math.max(0, newVolume), 1);
            audioRef.current.volume = safeVolume;
            return true;
        } catch (err) {
            console.error("Erreur lors du changement de volume:", err);
            return false;
        }
    }, []);

    /**
     * Force le rechargement de l'audio
     * @returns {boolean} Succès de l'opération
     */
    const reload = useCallback(() => {
        if (!audioRef.current) return false;

        try {
            setLoading(true);
            audioRef.current.load();
            return true;
        } catch (err) {
            console.error("Erreur lors du rechargement:", err);
            setLoading(false);
            setError(err);
            return false;
        }
    }, []);

    /**
     * Vérifie si l'audio est prêt à être joué
     * @returns {boolean} True si l'audio est prêt
     */
    const isReady = useCallback(() => {
        if (!audioRef.current) return false;
        return !loading && !error && audioRef.current.readyState >= 3;
    }, [loading, error]);

    // Exposer l'objet audio et les fonctions via l'API du hook
    return {
        audio: audioRef.current,
        playing,
        loading,
        error,
        duration,
        play,
        pause,
        stop,
        setVolume,
        reload,
        isReady,
    };
};
