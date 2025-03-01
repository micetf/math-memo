/**
 * @file ExerciseCard.jsx
 * @description Carte d'exercice améliorée avec consignes claires pour tous les types d'exercices
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
        if (!fact) return;

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
     * Obtient la consigne adaptée au type d'exercice
     * @returns {JSX.Element} Élément JSX avec la consigne
     */
    const getInstructionForExerciseType = () => {
        if (!fact) return null;

        switch (fact.type) {
            case OPERATION_TYPES.COMPARISON:
                return (
                    <div className="mb-3 text-center">
                        <p className="font-medium">
                            Compare les deux nombres :
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            Entre 1 pour &ldquo;plus petit que&ldquo; (&lt;),{" "}
                            <br />
                            2 pour &ldquo;égal à&ldquo; (=), <br />3 pour
                            &ldquo;plus grand que&ldquo; (&gt;)
                        </p>
                    </div>
                );
            case OPERATION_TYPES.ADDITION:
                return (
                    <p className="mb-3 font-medium">
                        Calcule l&lsquo;addition :
                    </p>
                );
            case OPERATION_TYPES.SUBTRACTION:
                return (
                    <p className="mb-3 font-medium">
                        Calcule la soustraction :
                    </p>
                );
            case OPERATION_TYPES.MULTIPLICATION:
                return (
                    <p className="mb-3 font-medium">
                        Calcule la multiplication :
                    </p>
                );
            case OPERATION_TYPES.DIVISION:
                return (
                    <p className="mb-3 font-medium">Calcule la division :</p>
                );
            case OPERATION_TYPES.COMPLEMENTS:
                return (
                    <p className="mb-3 font-medium">Trouve le complément :</p>
                );
            case OPERATION_TYPES.DOUBLES:
                return <p className="mb-3 font-medium">Calcule le double :</p>;
            default:
                return <p className="mb-3 font-medium">Calcule :</p>;
        }
    };

    /**
     * Génère le symbole d'opération en fonction du type
     * @returns {string} Symbole de l'opération
     */
    const getOperationSymbol = () => {
        if (!fact) return "";

        switch (fact.type) {
            case OPERATION_TYPES.ADDITION:
            case OPERATION_TYPES.DOUBLES:
                return "+";
            case OPERATION_TYPES.SUBTRACTION:
                return "-";
            case OPERATION_TYPES.MULTIPLICATION:
                return "×";
            case OPERATION_TYPES.DIVISION:
                return "÷";
            case OPERATION_TYPES.COMPLEMENTS:
                return "+";
            case OPERATION_TYPES.COMPARISON:
                return "?";
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

        if (!answer || isCorrect !== null || !fact) return;

        const userAnswer = parseInt(answer, 10);
        let correctAnswer;
        let correct = false;

        if (fact.type === OPERATION_TYPES.COMPARISON) {
            // Pour les exercices de comparaison
            // 1 = "plus petit que", 2 = "égal à", 3 = "plus grand que"
            const num1 = fact.operands[0];
            const num2 = fact.operands[1];

            if (num1 < num2 && userAnswer === 1) correct = true;
            else if (num1 === num2 && userAnswer === 2) correct = true;
            else if (num1 > num2 && userAnswer === 3) correct = true;

            // Déterminer la réponse correcte pour l'affichage
            if (num1 < num2) correctAnswer = 1;
            else if (num1 === num2) correctAnswer = 2;
            else correctAnswer = 3;
        } else {
            // Pour les autres types d'exercices (addition, soustraction, etc.)
            correctAnswer = parseInt(fact.answer, 10);
            correct = userAnswer === correctAnswer;
        }

        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000; // en secondes

        setIsCorrect(correct);
        setResponseTime(timeTaken);

        if (correct) {
            setFeedback("Bravo ! C'est la bonne réponse !");
        } else {
            let feedbackMessage = `Ce n'est pas correct. La bonne réponse est ${correctAnswer}`;

            // Ajout d'informations supplémentaires pour les exercices de comparaison
            if (fact.type === OPERATION_TYPES.COMPARISON) {
                const relationText =
                    correctAnswer === 1
                        ? "plus petit que"
                        : correctAnswer === 2
                        ? "égal à"
                        : "plus grand que";
                feedbackMessage += ` (${fact.operands[0]} est ${relationText} ${fact.operands[1]})`;
            }

            setFeedback(feedbackMessage);
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
        if (typeof onNext === "function") {
            onNext();
        }
    };

    // Si aucun fait n'est fourni, afficher un message d'erreur
    if (!fact) {
        return (
            <Card elevated>
                <div className="p-4 text-center">
                    <p className="text-red-500">
                        Erreur: Impossible de charger l&lsquo;exercice.
                    </p>
                    <Button onClick={onNext} variant="primary" className="mt-4">
                        Continuer
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card elevated className="max-w-md mx-auto">
            <div className="flex flex-col items-center p-4">
                {/* Consigne adaptée au type d'exercice */}
                {getInstructionForExerciseType()}

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
                            <span className="mx-2 bg-gray-200 rounded-md px-2">
                                ?
                            </span>
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
        id: PropTypes.string,
        type: PropTypes.string,
        operands: PropTypes.arrayOf(PropTypes.number),
        answer: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        question: PropTypes.string,
    }),
    onResult: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    showTimer: PropTypes.bool,
};
