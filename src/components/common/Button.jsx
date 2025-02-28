/**
 * @file Button.jsx
 * @description Composant bouton réutilisable avec plusieurs variantes
 */

import PropTypes from "prop-types";

/**
 * Composant de bouton personnalisé avec différentes variantes
 * @param {Object} props - Propriétés du composant
 * @param {string} [props.variant='primary'] - Variante du bouton (primary, secondary, success, danger)
 * @param {string} [props.size='md'] - Taille du bouton (sm, md, lg)
 * @param {boolean} [props.fullWidth=false] - Si le bouton doit prendre toute la largeur disponible
 * @param {string} [props.className=''] - Classes CSS additionnelles
 * @param {boolean} [props.disabled=false] - Si le bouton est désactivé
 * @param {Function} [props.onClick=()=>{}] - Fonction à exécuter au clic
 * @param {React.ReactNode} props.children - Contenu du bouton
 * @returns {JSX.Element} Composant Button
 */
export const Button = ({
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
    disabled = false,
    onClick = () => {},
    children,
    ...rest
}) => {
    // Base classes pour tous les boutons
    const baseClasses =
        "font-medium rounded-lg focus:outline-none focus:ring-2 transition-colors";

    // Classes par variante
    const variantClasses = {
        primary:
            "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white focus:ring-blue-300",
        secondary:
            "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 focus:ring-gray-300",
        success:
            "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white focus:ring-green-300",
        danger: "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white focus:ring-red-300",
        warning:
            "bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 focus:ring-yellow-300",
    };

    // Classes par taille
    const sizeClasses = {
        sm: "text-sm py-1.5 px-3",
        md: "text-base py-2 px-4",
        lg: "text-lg py-3 px-6",
    };

    // Classes pour largeur
    const widthClass = fullWidth ? "w-full" : "";

    // Classes pour l'état désactivé
    const disabledClasses = disabled
        ? "opacity-50 cursor-not-allowed"
        : "cursor-pointer";

    // Combinaison de toutes les classes
    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClasses} ${className}`;

    return (
        <button
            className={buttonClasses}
            disabled={disabled}
            onClick={onClick}
            {...rest}
        >
            {children}
        </button>
    );
};

Button.propTypes = {
    variant: PropTypes.oneOf([
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
    ]),
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    fullWidth: PropTypes.bool,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    children: PropTypes.node.isRequired,
};
