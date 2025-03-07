// src/contexts/storage/useStorage.js
import { useContext } from "react";
import StorageContext from "./StorageContext";

/**
 * Hook pour utiliser le contexte de stockage avec IndexedDB
 * @returns {Object} Contexte de stockage
 */
export const useStorage = () => {
    const context = useContext(StorageContext);
    if (!context) {
        throw new Error(
            "useStorage doit être utilisé à l'intérieur d'un StorageProvider"
        );
    }
    return context;
};
