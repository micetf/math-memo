// src/AppProviders.jsx
import PropTypes from "prop-types";
import {
    StorageProvider,
    AuthProvider,
    ProgressProvider,
    UIProvider,
    ThemeProvider,
} from "./contexts";

/**
 * Composant qui fournit tous les contextes nécessaires à l'application
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur de contextes combinés
 */
export const AppProviders = ({ children }) => {
    // Corrigé : Chaque provider doit explicitement recevoir ses enfants
    return (
        <StorageProvider>
            <AuthProvider>
                <ProgressProvider>
                    <ThemeProvider>
                        <UIProvider>{children}</UIProvider>
                    </ThemeProvider>
                </ProgressProvider>
            </AuthProvider>
        </StorageProvider>
    );
};

AppProviders.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AppProviders;
