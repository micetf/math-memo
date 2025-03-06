/**
 * @file SessionSummary.jsx
 * @description Composant pour afficher le résumé des résultats de la session d'exercices
 */

import PropTypes from "prop-types";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";

/**
 * Composant affichant le résumé de la session d'exercices terminée
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.stats - Statistiques de la session
 * @param {boolean} props.hasCompletedSession - Si l'utilisateur a terminé une session
 * @param {Function} props.onStartNewSession - Fonction pour démarrer une nouvelle session
 * @param {Function} props.onGoHome - Fonction pour retourner à l'accueil
 * @returns {JSX.Element} Composant SessionSummary
 */
export const SessionSummary = ({
    stats,
    hasCompletedSession,
    onStartNewSession,
    onGoHome,
}) => {
    return (
        <Card elevated className="mb-6">
            <div className="text-center p-4">
                <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Icon name="checkCircle" size="32" color="#10B981" />
                </div>

                <h2 className="text-2xl font-bold mb-2">Félicitations !</h2>

                {hasCompletedSession ? (
                    <p className="text-gray-600 mb-4">
                        Tu as terminé ta session d&lsquo;exercices.
                    </p>
                ) : (
                    <p className="text-gray-600 mb-4">
                        Tu as déjà terminé tous tes exercices pour
                        aujourd&lsquo;hui.
                    </p>
                )}

                {hasCompletedSession && stats.total > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h3 className="font-semibold mb-2">
                            Résultats de ta session :
                        </h3>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-white p-2 rounded">
                                <div className="font-medium">Exercices</div>
                                <div className="text-2xl text-blue-600">
                                    {stats.total}
                                </div>
                            </div>

                            <div className="bg-white p-2 rounded">
                                <div className="font-medium">Réussite</div>
                                <div className="text-2xl text-green-600">
                                    {stats.successRate}%
                                </div>
                            </div>

                            <div className="bg-white p-2 rounded">
                                <div className="font-medium">
                                    Bonnes réponses
                                </div>
                                <div className="text-2xl text-green-600">
                                    {stats.correct}
                                </div>
                            </div>

                            <div className="bg-white p-2 rounded">
                                <div className="font-medium">Erreurs</div>
                                <div className="text-2xl text-red-500">
                                    {stats.incorrect}
                                </div>
                            </div>

                            <div className="bg-white p-2 rounded col-span-2">
                                <div className="font-medium">
                                    Temps moyen par exercice
                                </div>
                                <div className="text-xl">
                                    {stats.averageTime} secondes
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col space-y-3">
                    <Button variant="primary" onClick={onStartNewSession}>
                        Nouvelle session
                    </Button>

                    <Button variant="secondary" onClick={onGoHome}>
                        Retour à l&lsquo;accueil
                    </Button>
                </div>
            </div>
        </Card>
    );
};

SessionSummary.propTypes = {
    stats: PropTypes.shape({
        total: PropTypes.number,
        correct: PropTypes.number,
        incorrect: PropTypes.number,
        successRate: PropTypes.number,
        averageTime: PropTypes.string,
        totalTime: PropTypes.string,
    }).isRequired,
    hasCompletedSession: PropTypes.bool.isRequired,
    onStartNewSession: PropTypes.func.isRequired,
    onGoHome: PropTypes.func.isRequired,
};
