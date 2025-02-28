/**
 * @file Footer.jsx
 * @description Pied de page de l'application
 */

/**
 * Composant de pied de page
 * @returns {JSX.Element} Composant Footer
 */
export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-100 py-4 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-600">
                        © {currentYear} MathMemo - Application
                        d&lsquo;apprentissage des faits numériques
                    </p>
                    <div className="mt-2 md:mt-0">
                        <a
                            href="#aide"
                            className="text-sm text-blue-600 hover:text-blue-800 mr-4"
                        >
                            Aide
                        </a>
                        <a
                            href="#contact"
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
