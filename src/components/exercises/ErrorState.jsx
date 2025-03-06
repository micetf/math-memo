/**
 * @file ErrorState.jsx
 * @description Composant pour afficher un message d'erreur
 */

import PropTypes from "prop-types";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";

/**
 * Composant affichant un message d'erreur et une action
 * @param {Object} props - Propriétés du composant
 * @param {string} props.message - Message d'erreur à afficher
 * @param {string} props.title - Titre du message d'erreur
 * @param {Function} props.onAction - Fonction à exécuter au clic sur le bouton
 * @param {string} props.actionLabel - Libellé du bouton d'action
 * @returns {JSX.Element} Composant ErrorState
 */
export const ErrorState = ({
    message,
    title = "Erreur",
    onAction,
    actionLabel = "Retour à l'accueil",
}) => {
    return (
        <div className="max-w-md mx-auto">
            <Card elevated className="text-center p-6">
                <Icon
                    name="errorCircle"
                    size="32"
                    className="mx-auto text-red-500 mb-4"
                />
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <p className="mb-6">{message}</p>
                <Button variant="primary" onClick={onAction}>
                    {actionLabel}
                </Button>
            </Card>
        </div>
    );
};

ErrorState.propTypes = {
    message: PropTypes.string.isRequired,
    title: PropTypes.string,
    onAction: PropTypes.func.isRequired,
    actionLabel: PropTypes.string,
};
