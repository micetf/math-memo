/**
 * @file SessionProgress.jsx
 * @description Composant pour afficher la progression de la session d'exercices
 */

import PropTypes from "prop-types";
import { ProgressBar } from "../common/ProgressBar";

/**
 * Composant affichant la progression de la session d'exercices en cours
 * @param {Object} props - Propriétés du composant
 * @param {number} props.currentIndex - Index de l'exercice actuel
 * @param {number} props.totalCount - Nombre total d'exercices
 * @param {number} props.progress - Pourcentage de progression (0-100)
 * @returns {JSX.Element} Composant SessionProgress
 */
export const SessionProgress = ({ currentIndex, totalCount, progress }) => {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-600">
                    Exercice {currentIndex + 1} sur {totalCount}
                </div>
            </div>

            <ProgressBar
                value={progress}
                variant="primary"
                animated
                className="mb-6"
            />
        </div>
    );
};

SessionProgress.propTypes = {
    currentIndex: PropTypes.number.isRequired,
    totalCount: PropTypes.number.isRequired,
    progress: PropTypes.number.isRequired,
};
