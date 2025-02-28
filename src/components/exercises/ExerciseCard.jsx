/**
 * @file ExerciseCard.jsx
 * @description Carte d'exercice pour présenter un fait numérique à apprendre
 */

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { NumberInput } from "./NumberInput";
import { ResultFeedback } from "./ResultFeedback";
import { OPERATION_TYPES } from "../../data/progressions";

/**
 * Composant principal pour afficher et gérer un exercice de fait numérique
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.fact - L'objet du fait numérique à pratiquer
 * @param {Function} props.onResult - Fonction appelée quand l'élève répond (correct, temps)
 * @param {Function} props.onNext - Fonction appelée quand l'élève veut passer à l'exercice suivant
 * @param {boolean} [props.showTimer=true] - Afficher ou non le chronomètre
 * @returns {JSX.Element} Composant ExerciseCard
 */
export const ExerciseCard = ({ fact, onResult, onNext, showTimer = true }) => {
    const [answer, setAnswer] = useState("");
    const [isCorrect, setIsCorrect] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [responseTime, setResponseTime] = useState(null);
    const inputRef = useRef(null);

    // Réinitialiser l'état lors du changement de fait
    useEffect(() => {
        setAnswer("");
        setIsCorrect(null);
        setFeedback(null);
        setStartTime(Date.now());
        setResponseTime(null);

        // Focus sur l'input au chargement d'un nouveau fait
        if (inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 100);
        }
    }, [fact]);

    /**
     * Génère le symbole d'opération en fonction du type
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
     * Gère la soumission de la réponse
     * @param {Event} e - Événement de soumission
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!answer || isCorrect !== null) return;

        const userAnswer = parseInt(answer, 10);
        const correctAnswer = parseInt(fact.answer, 10);
        const correct = userAnswer === correctAnswer;
        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000; // en secondes

        setIsCorrect(correct);
        setResponseTime(timeTaken);

        if (correct) {
            setFeedback("Bravo ! C'est la bonne réponse !");
        } else {
            setFeedback(
                `Ce n'est pas correct. La bonne réponse est ${correctAnswer}.`
            );
        }

        // Appeler la fonction de callback avec le résultat
        onResult({
            factId: fact.id,
            isCorrect: correct,
            responseTime: timeTaken,
        });
    };

    /**
     * Passe à l'exercice suivant
     */
    const handleNext = () => {
        onNext();
    };

    return (
        <Card elevated className="max-w-md mx-auto">
            <div className="flex flex-col items-center p-4">
                {/* Carte de fait numérique */}
                <div className="text-3xl font-bold text-center mb-6 p-4 bg-blue-50 rounded-lg w-full">
                    {fact.type === OPERATION_TYPES.COMPLEMENTS ? (
                        <>
                            <span className="inline-block min-w-10">
                                {fact.operands[0]}
                            </span>
                            <span className="mx-2">{getOperationSymbol()}</span>
                            <span className="inline-block min-w-10 bg-gray-200 rounded-md p-1">
                                ?
                            </span>
                            <span className="mx-2">=</span>
                            <span className="inline-block min-w-10">10</span>
                        </>
                    ) : fact.type === OPERATION_TYPES.COMPARISON ? (
                        <>
                            <span className="inline-block min-w-10">
                                {fact.operands[0]}
                            </span>
                            <span className="mx-2">?</span>
                            <span className="inline-block min-w-10">
                                {fact.operands[1]}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="inline-block min-w-10">
                                {fact.operands[0]}
                            </span>
                            <span className="mx-2">{getOperationSymbol()}</span>
                            <span className="inline-block min-w-10">
                                {fact.operands[1]}
                            </span>
                            <span className="mx-2">=</span>
                            <span className="inline-block min-w-10 bg-gray-200 rounded-md p-1">
                                ?
                            </span>
                        </>
                    )}
                </div>

                {/* Formulaire de réponse */}
                {isCorrect === null ? (
                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="flex flex-col items-center">
                            <label htmlFor="answer" className="text-lg mb-2">
                                Quelle est la réponse ?
                            </label>
                            <NumberInput
                                id="answer"
                                value={answer}
                                onChange={(value) => setAnswer(value)}
                                max={100}
                                min={0}
                                ref={inputRef}
                                className="text-xl w-24 text-center"
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="mt-4"
                                disabled={!answer}
                            >
                                Vérifier
                            </Button>
                        </div>
                    </form>
                ) : (
                    <ResultFeedback
                        isCorrect={isCorrect}
                        message={feedback}
                        responseTime={responseTime}
                        showTimer={showTimer}
                        onNext={handleNext}
                    />
                )}
            </div>
        </Card>
    );
};

ExerciseCard.propTypes = {
    fact: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.oneOf(Object.values(OPERATION_TYPES)).isRequired,
        operands: PropTypes.arrayOf(PropTypes.number).isRequired,
        answer: PropTypes.number,
        question: PropTypes.string,
    }).isRequired,
    onResult: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    showTimer: PropTypes.bool,
};
