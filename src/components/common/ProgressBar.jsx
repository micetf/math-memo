/**
 * @file ProgressBar.jsx
 * @description Barre de progression réutilisable avec différentes variantes
 */

import PropTypes from "prop-types";

/**
 * Composant de barre de progression
 * @param {Object} props - Propriétés du composant
 * @param {number} props.value - Valeur actuelle de la progression (0-100)
 * @param {number} [props.max=100] - Valeur maximale de la progression
 * @param {string} [props.variant='primary'] - Variante de couleur
 * @param {boolean} [props.showLabel=false] - Afficher le pourcentage
 * @param {string} [props.className=''] - Classes CSS additionnelles
 * @param {boolean} [props.animated=false] - Ajouter une animation à la barre
 * @returns {JSX.Element} Composant ProgressBar
 */
export const ProgressBar = ({
    value,
    max = 100,
    variant = "primary",
    showLabel = false,
    className = "",
    animated = false,
    ...rest
}) => {
    // S'assurer que la valeur est entre 0 et max
    const normalizedValue = Math.min(Math.max(0, value), max);

    // Calculer le pourcentage
    const percentage = Math.round((normalizedValue / max) * 100);

    // Classes pour le conteneur
    const containerClasses = `h-4 bg-gray-200 rounded-full overflow-hidden ${className}`;

    // Classes pour la barre selon la variante
    const variantClasses = {
        primary: "bg-blue-500",
        success: "bg-green-500",
        warning: "bg-yellow-400",
        danger: "bg-red-500",
        info: "bg-cyan-500",
    };

    // Classe d'animation
    const animationClass = animated
        ? "transition-all duration-500 ease-out"
        : "";

    // Classes pour la barre de progression
    const barClasses = `h-full ${variantClasses[variant]} ${animationClass}`;

    return (
        <div className="w-full">
            <div className={containerClasses} {...rest}>
                <div
                    className={barClasses}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={normalizedValue}
                    aria-valuemin="0"
                    aria-valuemax={max}
                />
            </div>
            {showLabel && (
                <div className="text-sm font-medium text-gray-600 mt-1 text-right">
                    {percentage}%
                </div>
            )}
        </div>
    );
};

ProgressBar.propTypes = {
    value: PropTypes.number.isRequired,
    max: PropTypes.number,
    variant: PropTypes.oneOf([
        "primary",
        "success",
        "warning",
        "danger",
        "info",
    ]),
    showLabel: PropTypes.bool,
    className: PropTypes.string,
    animated: PropTypes.bool,
};
