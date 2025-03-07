// src/contexts/ProviderComposer.jsx
import PropTypes from "prop-types";
import { cloneElement } from "react";
/**
 * Composant utilitaire pour composer plusieurs providers ensemble
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.providers - Liste de providers à composer
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Providers imbriqués avec les enfants
 */
export const ProviderComposer = ({ providers, children }) => {
    return providers.reduceRight(
        (kids, provider) => cloneElement(provider, {}, kids),
        children
    );
};

ProviderComposer.propTypes = {
    providers: PropTypes.arrayOf(PropTypes.element).isRequired,
    children: PropTypes.node.isRequired,
};

export default ProviderComposer;
