/**
 * @file pwaService.js
 * @description Service pour gérer les fonctionnalités de PWA
 */

/**
 * Vérifie si l'application est installée (mode standalone)
 * @returns {boolean} True si l'application est installée
 */
export const isAppInstalled = () => {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone || // Pour iOS
        document.referrer.includes("android-app://")
    );
};

/**
 * Enregistre le service worker pour permettre l'installation et le fonctionnement hors ligne
 * @returns {Promise<ServiceWorkerRegistration|null>} Promesse de l'enregistrement du service worker
 */
export const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.register(
                "/service-worker.js"
            );
            console.log(
                "Service Worker enregistré avec succès:",
                registration.scope
            );
            return registration;
        } catch (error) {
            console.error(
                "Erreur lors de l'enregistrement du Service Worker:",
                error
            );
            return null;
        }
    }
    return null;
};

/**
 * Met à jour les données du cache du service worker
 * @returns {Promise<boolean>} Promesse indiquant si la mise à jour a réussi
 */
export const updateCache = async () => {
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.update();
            return true;
        } catch (error) {
            console.error("Erreur lors de la mise à jour du cache:", error);
            return false;
        }
    }
    return false;
};

/**
 * Déclenche l'invite d'installation de l'application
 * @param {Object} deferredPrompt - Événement beforeinstallprompt stocké
 * @returns {Promise<boolean>} Promesse indiquant si l'installation a été acceptée
 */
export const promptInstall = async (deferredPrompt) => {
    if (!deferredPrompt) {
        console.log("Aucun événement d'installation disponible");
        return false;
    }

    try {
        // Afficher l'invite d'installation
        deferredPrompt.prompt();

        // Attendre que l'utilisateur réponde à l'invite
        const choiceResult = await deferredPrompt.userChoice;

        return choiceResult.outcome === "accepted";
    } catch (error) {
        console.error("Erreur lors de l'installation:", error);
        return false;
    }
};
