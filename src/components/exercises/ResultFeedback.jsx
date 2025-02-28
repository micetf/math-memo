/**
 * @file ResultFeedback.jsx
 * @description Composant pour afficher un retour après une réponse
 */

import PropTypes from "prop-types";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";

/**
 * Composant pour afficher le feedback après une réponse
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.isCorrect - Si la réponse était correcte
 * @param {string} [props.message=''] - Message de feedback
 * @param {number} [props.responseTime=null] - Temps de réponse en secondes
 * @param {boolean} [props.showTimer=true] - Afficher le temps de réponse
 * @param {Function} props.onNext - Fonction appelée pour passer à l'exercice suivant
 * @returns {JSX.Element} Composant ResultFeedback
 */
export const ResultFeedback = ({
    isCorrect,
    message = "",
    responseTime = null,
    showTimer = true,
    onNext,
}) => {
    return (
        <div className="flex flex-col items-center w-full">
            <div
                className={`flex items-center justify-center p-4 rounded-full w-16 h-16 mb-4 ${
                    isCorrect
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                }`}
            >
                <Icon
                    name={isCorrect ? "checkCircle" : "errorCircle"}
                    size="32"
                />
            </div>

            <p
                className={`text-xl font-semibold mb-2 ${
                    isCorrect ? "text-green-600" : "text-red-600"
                }`}
            >
                {isCorrect ? "Correct !" : "Incorrect"}
            </p>

            {message && (
                <p className="text-gray-700 text-center mb-3">{message}</p>
            )}

            {showTimer && responseTime !== null && (
                <p className="text-sm text-gray-500 mb-4">
                    Temps de réponse : {responseTime.toFixed(1)} secondes
                </p>
            )}

            <Button
                onClick={onNext}
                variant={isCorrect ? "success" : "primary"}
                size="lg"
                className="mt-2"
            >
                Continuer
            </Button>
        </div>
    );
};

ResultFeedback.propTypes = {
    isCorrect: PropTypes.bool.isRequired,
    message: PropTypes.string,
    responseTime: PropTypes.number,
    showTimer: PropTypes.bool,
    onNext: PropTypes.func.isRequired,
};
