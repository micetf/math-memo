/**
 * @file Icon.jsx
 * @description Composant d'icône réutilisable utilisant des icônes SVG simples
 */

import PropTypes from "prop-types";

/**
 * Collection d'icônes SVG simples
 * @constant {Object}
 */
const ICONS = {
    // Navigation et actions
    home: "M12 5.69l5 4.5V18h-2v-6H9v6H7V10.19l5-4.5zM12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z",
    menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
    close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z",

    // Feedback
    checkCircle:
        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    errorCircle:
        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",

    // Math operations
    plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    minus: "M19 13H5v-2h14v2z",
    multiply:
        "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z",
    divide: "M5 11h14v2H5v-2zm7-9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",

    // Flèches
    arrowRight: "M10 17l5-5-5-5v10z",
    arrowLeft: "M14 7l-5 5 5 5V7z",
    arrowUp: "M7 14l5-5 5 5H7z",
    arrowDown: "M7 10l5 5 5-5H7z",

    // Autres
    star: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z",
    settings:
        "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
};

/**
 * Composant d'icône utilisant des icônes SVG
 * @param {Object} props - Propriétés du composant
 * @param {string} props.name - Nom de l'icône à utiliser
 * @param {string} [props.size='24'] - Taille de l'icône (en pixels)
 * @param {string} [props.color='currentColor'] - Couleur de l'icône
 * @param {string} [props.className=''] - Classes CSS additionnelles
 * @returns {JSX.Element} Composant Icon
 */
export const Icon = ({
    name,
    size = "24",
    color = "currentColor",
    className = "",
    ...rest
}) => {
    // Vérifier si l'icône existe
    if (!ICONS[name]) {
        console.warn(`Icône "${name}" non trouvée`);
        return null;
    }

    const svgClasses = `inline-block ${className}`;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            className={svgClasses}
            {...rest}
        >
            <path d={ICONS[name]} />
        </svg>
    );
};

Icon.propTypes = {
    name: PropTypes.oneOf(Object.keys(ICONS)).isRequired,
    size: PropTypes.string,
    color: PropTypes.string,
    className: PropTypes.string,
};
