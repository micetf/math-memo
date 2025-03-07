/**
 * @file Progress.jsx
 * @description Page de suivi de progression de l'élève
 */

import { useContext, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { ProgressBar } from "../components/common/ProgressBar";
import { FactCard } from "../components/exercises/FactCard";
import {ProgressContext, AuthContext} from "../contexts";
import {
    DIFFICULTY_LEVELS,
    PROGRESSIONS,
    OPERATION_TYPES,
} from "../data/progressions";
import { KNOWLEDGE_LEVELS } from "../hooks/useSpacedRepetition";

/**
 * Page de suivi de progression
 * @returns {JSX.Element} Page Progress
 */
const Progress = () => {
    const { user } = useContext(AuthContext);
    const {
        currentLevel,
        activePeriod,
        activeUnit,
        changeLevel,
        changePeriod,
        changeUnit,
        getFactsWithProgress,
        getOverallProgress,
    } = useContext(ProgressContext);

    const [viewMode, setViewMode] = useState("summary"); // summary, details

    // Si l'utilisateur n'est pas connecté, afficher un message
    if (!user) {
        return (
            <Layout title="Progression">
                <div className="flex flex-col items-center justify-center h-64">
                    <p className="text-gray-600 mb-4">
                        Connecte-toi pour voir ta progression
                    </p>
                    <Button variant="primary" onClick={() => {}}>
                        Se connecter
                    </Button>
                </div>
            </Layout>
        );
    }

    // Récupérer les statistiques globales
    const stats = getOverallProgress();

    /**
     * Obtient le libellé du niveau de difficulté
     * @param {string} level - Niveau de difficulté
     * @returns {string} Libellé du niveau
     */
    const getLevelLabel = (level) => {
        switch (level) {
            case DIFFICULTY_LEVELS.CP:
                return "CP (6-7 ans)";
            case DIFFICULTY_LEVELS.CE1:
                return "CE1 (7-8 ans)";
            case DIFFICULTY_LEVELS.CE2:
                return "CE2 (8-9 ans)";
            default:
                return level;
        }
    };

    /**
     * Calcule le nombre de faits par type d'opération
     * @returns {Object} Nombre de faits par type
     */
    const getFactsByOperation = () => {
        const result = {};

        Object.values(OPERATION_TYPES).forEach((type) => {
            result[type] = 0;
        });

        Object.values(stats.facts || {}).forEach((fact) => {
            if (fact.type) {
                result[fact.type] = (result[fact.type] || 0) + 1;
            }
        });

        return result;
    };

    /**
     * Obtient le nombre de faits par niveau de maîtrise
     * @returns {Object} Nombre de faits par niveau
     */
    const getFactsByMasteryLevel = () => {
        return (
            stats.factsByLevel || {
                [KNOWLEDGE_LEVELS.NEW]: 0,
                [KNOWLEDGE_LEVELS.LEARNING]: 0,
                [KNOWLEDGE_LEVELS.REVIEWING]: 0,
                [KNOWLEDGE_LEVELS.MASTERED]: 0,
            }
        );
    };

    const factsWithProgress = getFactsWithProgress();
    const factsByOperation = getFactsByOperation();
    const factsByMastery = getFactsByMasteryLevel();

    return (
        <Layout title="Ma progression">
            <div className="max-w-4xl mx-auto">
                {/* Résumé global */}
                <Card elevated className="mb-6">
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">
                            Résumé de ma progression
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-600">
                                    Faits maîtrisés
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {factsByMastery[KNOWLEDGE_LEVELS.MASTERED]}{" "}
                                    / {stats.totalFacts}
                                </div>
                                <ProgressBar
                                    value={stats.masteredPercentage}
                                    variant="primary"
                                    className="mt-2"
                                />
                            </div>

                            <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-600">
                                    Niveau actuel
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                    {getLevelLabel(currentLevel)}
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    {activePeriod?.name}, {activeUnit?.name}
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-600">
                                    À réviser aujourd&lsquo;hui
                                </div>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {stats.factsToReview?.length || 0} faits
                                </div>
                                <button className="text-xs text-blue-600 mt-2">
                                    Commencer la révision →
                                </button>
                            </div>
                        </div>

                        {/* Sélecteurs de niveau, période et unité */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Niveau
                                </label>
                                <select
                                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={currentLevel}
                                    onChange={(e) =>
                                        changeLevel(e.target.value)
                                    }
                                >
                                    {Object.keys(PROGRESSIONS).map((level) => (
                                        <option key={level} value={level}>
                                            {getLevelLabel(level)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Période
                                </label>
                                <select
                                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={activePeriod?.id}
                                    onChange={(e) => {
                                        const period = PROGRESSIONS[
                                            currentLevel
                                        ].periods.find(
                                            (p) => p.id === e.target.value
                                        );
                                        if (period) changePeriod(period);
                                    }}
                                >
                                    {PROGRESSIONS[currentLevel].periods.map(
                                        (period) => (
                                            <option
                                                key={period.id}
                                                value={period.id}
                                            >
                                                {period.name}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unité
                                </label>
                                <select
                                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={activeUnit?.id}
                                    onChange={(e) => {
                                        const unit = activePeriod.units.find(
                                            (u) => u.id === e.target.value
                                        );
                                        if (unit) changeUnit(unit);
                                    }}
                                >
                                    {activePeriod?.units.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Sélection du mode d'affichage */}
                <div className="flex justify-center mb-6">
                    <div className="inline-flex rounded-md shadow-sm">
                        <button
                            type="button"
                            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                                viewMode === "summary"
                                    ? "bg-blue-500 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                            onClick={() => setViewMode("summary")}
                        >
                            Résumé
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                                viewMode === "details"
                                    ? "bg-blue-500 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                            onClick={() => setViewMode("details")}
                        >
                            Détails
                        </button>
                    </div>
                </div>

                {/* Contenu selon le mode d'affichage */}
                {viewMode === "summary" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Statistiques par type d'opération */}
                        <Card>
                            <h3 className="text-lg font-semibold mb-4">
                                Par type d&lsquo;opération
                            </h3>

                            <div className="space-y-4">
                                {Object.entries(factsByOperation)
                                    .filter(([, count]) => count > 0)
                                    .map(([type, count]) => (
                                        <div key={type}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium">
                                                    {type
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        type.slice(1)}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {count} faits
                                                </span>
                                            </div>
                                            <ProgressBar
                                                value={
                                                    (count / stats.totalFacts) *
                                                    100
                                                }
                                                variant={
                                                    type ===
                                                    OPERATION_TYPES.ADDITION
                                                        ? "primary"
                                                        : type ===
                                                          OPERATION_TYPES.SUBTRACTION
                                                        ? "info"
                                                        : type ===
                                                          OPERATION_TYPES.MULTIPLICATION
                                                        ? "success"
                                                        : type ===
                                                          OPERATION_TYPES.DIVISION
                                                        ? "warning"
                                                        : "primary"
                                                }
                                            />
                                        </div>
                                    ))}
                            </div>
                        </Card>

                        {/* Statistiques par niveau de maîtrise */}
                        <Card>
                            <h3 className="text-lg font-semibold mb-4">
                                Par niveau de maîtrise
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium">
                                            Nouveaux
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {
                                                factsByMastery[
                                                    KNOWLEDGE_LEVELS.NEW
                                                ]
                                            }{" "}
                                            faits
                                        </span>
                                    </div>
                                    <ProgressBar
                                        value={
                                            (factsByMastery[
                                                KNOWLEDGE_LEVELS.NEW
                                            ] /
                                                stats.totalFacts) *
                                            100
                                        }
                                        variant="info"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium">
                                            En apprentissage
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {
                                                factsByMastery[
                                                    KNOWLEDGE_LEVELS.LEARNING
                                                ]
                                            }{" "}
                                            faits
                                        </span>
                                    </div>
                                    <ProgressBar
                                        value={
                                            (factsByMastery[
                                                KNOWLEDGE_LEVELS.LEARNING
                                            ] /
                                                stats.totalFacts) *
                                            100
                                        }
                                        variant="warning"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium">
                                            En révision
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {
                                                factsByMastery[
                                                    KNOWLEDGE_LEVELS.REVIEWING
                                                ]
                                            }{" "}
                                            faits
                                        </span>
                                    </div>
                                    <ProgressBar
                                        value={
                                            (factsByMastery[
                                                KNOWLEDGE_LEVELS.REVIEWING
                                            ] /
                                                stats.totalFacts) *
                                            100
                                        }
                                        variant="primary"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium">
                                            Maîtrisés
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {
                                                factsByMastery[
                                                    KNOWLEDGE_LEVELS.MASTERED
                                                ]
                                            }{" "}
                                            faits
                                        </span>
                                    </div>
                                    <ProgressBar
                                        value={
                                            (factsByMastery[
                                                KNOWLEDGE_LEVELS.MASTERED
                                            ] /
                                                stats.totalFacts) *
                                            100
                                        }
                                        variant="success"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div>
                        <Card>
                            <h3 className="text-lg font-semibold mb-4">
                                {activeUnit?.name} ({factsWithProgress.length}{" "}
                                faits)
                            </h3>

                            <div className="space-y-2">
                                {factsWithProgress.map((fact) => (
                                    <FactCard
                                        key={fact.id}
                                        fact={fact}
                                        progress={fact.progress}
                                    />
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Progress;
