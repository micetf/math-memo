/**
 * @file NotLoggedInState.jsx
 * @description Composant pour afficher un message quand l'utilisateur n'est pas connecté
 */

import PropTypes from "prop-types";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";

/**
 * Composant affichant un message quand l'utilisateur n'est pas connecté
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onGoHome - Fonction pour retourner à l'accueil
 * @returns {JSX.Element} Composant NotLoggedInState
 */
export const NotLoggedInState = ({ onGoHome }) => {
    return (
        <div className="max-w-md mx-auto">
            <Card elevated className="text-center p-6">
                <Icon
                    name="errorCircle"
                    size="32"
                    className="mx-auto text-yellow-500 mb-4"
                />
                <h2 className="text-xl font-bold mb-4">Connexion nécessaire</h2>
                <p className="mb-6">
                    Tu dois te connecter ou créer un compte pour accéder aux
                    exercices.
                </p>
                <Button variant="primary" onClick={onGoHome}>
                    Retour à l&lsquo;accueil
                </Button>
            </Card>
        </div>
    );
};

NotLoggedInState.propTypes = {
    onGoHome: PropTypes.func.isRequired,
};
