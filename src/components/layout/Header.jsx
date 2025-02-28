/**
 * @file Header.jsx
 * @description En-tête de l'application avec navigation
 */

import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Icon } from "../common/Icon";

/**
 * Composant d'en-tête avec navigation responsive
 * @param {Object} props - Propriétés du composant
 * @param {string} [props.title='MathMemo'] - Titre de l'application
 * @param {boolean} [props.showBackButton=false] - Afficher un bouton retour
 * @param {Function} [props.onBackClick=()=>{}] - Fonction au clic sur le bouton retour
 * @param {React.ReactNode} [props.rightComponent=null] - Composant à afficher à droite
 * @returns {JSX.Element} Composant Header
 */
export const Header = ({
    title = "MathMemo",
    showBackButton = false,
    onBackClick = () => {},
    rightComponent = null,
}) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <header className="bg-blue-500 text-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Partie gauche: bouton retour ou logo */}
                    <div className="flex items-center">
                        {showBackButton ? (
                            <button
                                onClick={onBackClick}
                                className="p-2 rounded-full hover:bg-blue-600 transition-colors"
                                aria-label="Retour"
                            >
                                <Icon name="arrowLeft" color="white" />
                            </button>
                        ) : (
                            <Link to="/" className="flex items-center">
                                <span className="ml-2 text-xl font-bold">
                                    {title}
                                </span>
                            </Link>
                        )}
                    </div>

                    {/* Partie droite: composant personnalisé ou menu */}
                    <div className="flex items-center">
                        {rightComponent}

                        {/* Bouton de menu sur mobile */}
                        <button
                            className="p-2 rounded-full hover:bg-blue-600 transition-colors md:hidden"
                            onClick={toggleMenu}
                            aria-expanded={menuOpen}
                            aria-label="Menu principal"
                        >
                            <Icon
                                name={menuOpen ? "close" : "menu"}
                                color="white"
                            />
                        </button>

                        {/* Menu de navigation pour écrans plus grands */}
                        <nav className="hidden md:block">
                            <ul className="flex space-x-4">
                                <li>
                                    <Link
                                        to="/"
                                        className="px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Accueil
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/exercise"
                                        className="px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Exercices
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/progress"
                                        className="px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Progrès
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/settings"
                                        className="px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Paramètres
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                {/* Menu mobile */}
                {menuOpen && (
                    <div className="md:hidden py-2 pb-4">
                        <nav>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        to="/"
                                        className="block px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Accueil
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/exercise"
                                        className="block px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Exercices
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/progress"
                                        className="block px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Progrès
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/settings"
                                        className="block px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Paramètres
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

Header.propTypes = {
    title: PropTypes.string,
    showBackButton: PropTypes.bool,
    onBackClick: PropTypes.func,
    rightComponent: PropTypes.node,
};
