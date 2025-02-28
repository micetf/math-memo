/**
 * @file Layout.jsx
 * @description Composant de mise en page principal qui structure l'application
 */

import PropTypes from "prop-types";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * Composant de mise en page principal qui encapsule les pages
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Contenu de la page
 * @param {string} [props.title='MathMemo'] - Titre de la page (affiché dans l'en-tête)
 * @param {boolean} [props.showBackButton=false] - Afficher un bouton retour
 * @param {Function} [props.onBackClick=()=>{}] - Fonction au clic sur le bouton retour
 * @param {React.ReactNode} [props.headerRight=null] - Composant à afficher à droite dans l'en-tête
 * @param {boolean} [props.hideFooter=false] - Masquer le pied de page
 * @returns {JSX.Element} Composant Layout
 */
export const Layout = ({
    children,
    title = "MathMemo",
    showBackButton = false,
    onBackClick = () => {},
    headerRight = null,
    hideFooter = false,
}) => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header
                title={title}
                showBackButton={showBackButton}
                onBackClick={onBackClick}
                rightComponent={headerRight}
            />

            <main className="flex-grow container mx-auto px-4 py-6">
                {children}
            </main>

            {!hideFooter && <Footer />}
        </div>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
    showBackButton: PropTypes.bool,
    onBackClick: PropTypes.func,
    headerRight: PropTypes.node,
    hideFooter: PropTypes.bool,
};
