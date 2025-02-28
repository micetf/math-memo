/**
 * @file FactCard.jsx
 * @description Carte pour afficher un fait numérique dans une liste
 */

import PropTypes from "prop-types";
import { Card } from "../common/Card";
import { ProgressBar } from "../common/ProgressBar";
import { OPERATION_TYPES } from "../../data/progressions";
import { KNOWLEDGE_LEVELS } from "../../hooks/useSpacedRepetition";

/**
 * Composant pour afficher un fait numérique dans une liste avec son état de maîtrise
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.fact - Données du fait numérique
 * @param {Object} props.progress - Progression de l'élève sur ce fait
 * @param {Function} [props.onClick=null] - Fonction appelée au clic sur la carte
 * @returns {JSX.Element} Composant FactCard
 */
export const FactCard = ({ fact, progress, onClick = null }) => {
    /**
     * Obtient le symbole de l'opération
     * @returns {string} Symbole de l'opération
     */
    const getOperationSymbol = () => {
        switch (fact.type) {
            case OPERATION_TYPES.ADDITION:
                return "+";
            case OPERATION_TYPES.SUBTRACTION:
                return "-";
            case OPERATION_TYPES.MULTIPLICATION:
                return "×";
            case OPERATION_TYPES.DIVISION:
                return "÷";
            case OPERATION_TYPES.COMPLEMENTS:
                return "+";
            case OPERATION_TYPES.DOUBLES:
                return "+";
            default:
                return "";
        }
    };

    /**
     * Formatage de la question selon le type d'opération
     * @returns {string} Question formatée
     */
    const getFormattedQuestion = () => {
        if (fact.question) {
            return fact.question;
        }

        switch (fact.type) {
            case OPERATION_TYPES.COMPLEMENTS:
                return `${fact.operands[0]} + ? = 10`;
            case OPERATION_TYPES.COMPARISON:
                return `${fact.operands[0]} ? ${fact.operands[1]}`;
            default:
                return `${fact.operands[0]} ${getOperationSymbol()} ${
                    fact.operands[1]
                } = ?`;
        }
    };

    /**
     * Obtient la couleur de progression selon le niveau de connaissance
     * @returns {string} Variante de couleur pour la barre de progression
     */
    const getProgressVariant = () => {
        if (!progress) return "primary";

        switch (progress.level) {
            case KNOWLEDGE_LEVELS.NEW:
                return "info";
            case KNOWLEDGE_LEVELS.LEARNING:
                return "warning";
            case KNOWLEDGE_LEVELS.REVIEWING:
                return "primary";
            case KNOWLEDGE_LEVELS.MASTERED:
                return "success";
            default:
                return "primary";
        }
    };

    /**
     * Calcule le pourcentage de maîtrise
     * @returns {number} Pourcentage (0-100)
     */
    const getMasteryPercentage = () => {
        if (!progress) return 0;

        const maxLevel = Object.keys(KNOWLEDGE_LEVELS).length - 1;
        return Math.round((progress.level / maxLevel) * 100);
    };

    /**
     * Obtient le libellé du niveau de connaissance
     * @returns {string} Libellé du niveau
     */
    const getLevelLabel = () => {
        if (!progress) return "Nouveau";

        switch (progress.level) {
            case KNOWLEDGE_LEVELS.NEW:
                return "Nouveau";
            case KNOWLEDGE_LEVELS.LEARNING:
                return "En apprentissage";
            case KNOWLEDGE_LEVELS.REVIEWING:
                return "En révision";
            case KNOWLEDGE_LEVELS.MASTERED:
                return "Maîtrisé";
            default:
                return "Inconnu";
        }
    };

    /**
     * Obtient la prochaine date de révision formatée
     * @returns {string} Date formatée
     */
    const getNextReviewDate = () => {
        if (!progress || !progress.nextReview) return "Non planifié";

        const nextReview = new Date(progress.nextReview);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (nextReview < today) {
            return "Aujourd'hui";
        } else if (nextReview < tomorrow) {
            return "Demain";
        } else {
            // Format: "JJ/MM/YYYY"
            return nextReview.toLocaleDateString("fr-FR");
        }
    };

    return (
        <Card
            elevated={false}
            className={`border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                progress && progress.level === KNOWLEDGE_LEVELS.MASTERED
                    ? "border-l-green-500"
                    : "border-l-blue-500"
            }`}
            onClick={onClick}
        >
            <div className="p-2">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">
                        {getFormattedQuestion()}
                    </h3>
                    <span className="text-gray-500 text-sm">
                        {getNextReviewDate()}
                    </span>
                </div>

                <div className="flex items-center mt-2">
                    <div className="w-full">
                        <ProgressBar
                            value={getMasteryPercentage()}
                            variant={getProgressVariant()}
                            animated={false}
                            className="h-2"
                        />
                    </div>
                    <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
                        {getLevelLabel()}
                    </span>
                </div>
            </div>
        </Card>
    );
};

FactCard.propTypes = {
    fact: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.oneOf(Object.values(OPERATION_TYPES)).isRequired,
        operands: PropTypes.arrayOf(PropTypes.number).isRequired,
        answer: PropTypes.number,
        question: PropTypes.string,
    }).isRequired,
    progress: PropTypes.shape({
        level: PropTypes.number,
        successCount: PropTypes.number,
        lastReviewed: PropTypes.string,
        nextReview: PropTypes.string,
    }),
    onClick: PropTypes.func,
};
