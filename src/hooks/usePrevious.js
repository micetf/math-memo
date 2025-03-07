// src/hooks/usePrevious.js
import { useRef, useEffect } from "react";

/**
 * Hook pour stocker la valeur précédente d'un état
 * @param {*} value - Valeur à suivre
 * @returns {*} Valeur précédente
 */
export const usePrevious = (value) => {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
};
