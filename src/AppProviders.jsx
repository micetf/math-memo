// src/AppProviders.jsx
import PropTypes from "prop-types";
import {
    StorageProvider,
    AuthProvider,
    ProgressProvider,
    UIProvider,
    ThemeProvider,
    ProviderComposer,
} from "./contexts";

/**
 * Composant qui fournit tous les contextes nécessaires à l'application
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur de contextes combinés
 */
export const AppProviders = ({ children }) => {
    // Ordre des providers : du plus externe au plus interne
    const providers = [
        <StorageProvider key="storage" />,
        <AuthProvider key="auth" />,
        <ProgressProvider key="progress" />,
        <ThemeProvider key="theme" />,
        <UIProvider key="ui" />,
    ];

    return (
        <ProviderComposer providers={providers}>{children}</ProviderComposer>
    );
};

AppProviders.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AppProviders;
