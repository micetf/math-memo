// src/contexts/auth/useAuth.js
import { useContext } from "react";
import AuthContext from "./AuthContext";

/**
 * Hook pour utiliser le contexte d'authentification
 * @returns {Object} Contexte d'authentification
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error(
            "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
        );
    }
    return context;
};
