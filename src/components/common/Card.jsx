/**
 * @file Card.jsx
 * @description Composant carte réutilisable pour encapsuler du contenu
 */

import PropTypes from "prop-types";

/**
 * Composant Card pour encapsuler et présenter du contenu
 * @param {Object} props - Propriétés du composant
 * @param {string} [props.title=''] - Titre de la carte
 * @param {boolean} [props.elevated=false] - Si la carte a une élévation (ombre)
 * @param {string} [props.className=''] - Classes CSS additionnelles
 * @param {React.ReactNode} props.children - Contenu de la carte
 * @returns {JSX.Element} Composant Card
 */
export const Card = ({
    title = "",
    elevated = false,
    className = "",
    children,
    ...rest
}) => {
    const baseClasses = "bg-white rounded-xl overflow-hidden";
    const elevationClass = elevated ? "shadow-md" : "border border-gray-200";
    const combinedClasses = `${baseClasses} ${elevationClass} ${className}`;

    return (
        <div className={combinedClasses} {...rest}>
            {title && (
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-semibold text-lg text-gray-700">
                        {title}
                    </h3>
                </div>
            )}
            <div className="p-4">{children}</div>
        </div>
    );
};

Card.propTypes = {
    title: PropTypes.string,
    elevated: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
};
