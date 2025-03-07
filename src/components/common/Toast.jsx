// src/components/common/Toast.jsx
import { createPortal } from "react-dom";
import { useUI } from "../../contexts";

/**
 * Composant Toast pour afficher des notifications temporaires
 * @returns {JSX.Element|null} Composant Toast ou null si aucun toast à afficher
 */
export const Toast = () => {
    const { toast, closeToast } = useUI();

    if (!toast) return null;

    const colorClasses = {
        success: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
        warning: "bg-yellow-500 text-gray-900",
        info: "bg-blue-500 text-white",
    };

    const toastClasses = `fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-md w-full p-4 rounded-lg shadow-lg z-50 transition-opacity duration-300 ${
        colorClasses[toast.type] || colorClasses.info
    }`;

    // Utiliser createPortal pour monter le toast directement dans le body
    return createPortal(
        <div className={toastClasses}>
            <div className="flex justify-between items-center">
                <p>{toast.message}</p>
                <button
                    onClick={closeToast}
                    className="ml-4 text-sm p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                    aria-label="Fermer"
                >
                    ×
                </button>
            </div>
        </div>,
        document.body
    );
};
