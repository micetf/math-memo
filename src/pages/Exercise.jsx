/**
 * @file Exercise.jsx
 * @description Page principale d'exercices avec répétition espacée
 */

import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { ExerciseCard } from "../components/exercises/ExerciseCard";
import {AuthContext, ProgressContext} from "../contexts";
import { useExerciseSession } from "../hooks/useExerciseSession";
import { SessionSummary } from "../components/exercises/SessionSummary";
import { SessionProgress } from "../components/exercises/SessionProgress";
import { LoadingState } from "../components/exercises/LoadingState";
import { NotLoggedInState } from "../components/exercises/NotLoggedInState";
import { ErrorState } from "../components/exercises/ErrorState";

/**
 * Page d'exercices qui présente des faits numériques selon l'algorithme de répétition espacée
 * @returns {JSX.Element} Page Exercise
 */
const Exercise = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const {
        getFactsToReviewToday,
        updateFactProgress,
        currentLevel,
        addMultipleFacts,
    } = useContext(ProgressContext);

    // Utiliser notre hook personnalisé pour gérer la session
    const {
        isLoading,
        error,
        sessionComplete,
        currentFact,
        currentSession,
        currentFactIndex,
        progress,
        handleExerciseResult,
        goToNextExercise,
        getFormattedStats,
    } = useExerciseSession({
        user,
        getFactsToReviewToday,
        updateFactProgress,
        currentLevel,
        addMultipleFacts,
    });

    /**
     * Démarre une nouvelle session
     */
    const handleStartNewSession = () => {
        navigate(0); // Recharger la page pour une nouvelle session
    };

    /**
     * Retourne à la page d'accueil
     */
    const handleGoHome = () => {
        navigate("/");
    };

    /**
     * Gère le retour en arrière avec confirmation
     */
    const handleBackClick = () => {
        if (window.confirm("Es-tu sûr de vouloir quitter cette session ?")) {
            handleGoHome();
        }
    };

    // Afficher un écran de chargement pendant l'initialisation
    if (isLoading) {
        return (
            <Layout title="Exercices">
                <LoadingState />
            </Layout>
        );
    }

    // Si l'utilisateur n'est pas connecté, afficher un message
    if (!user) {
        return (
            <Layout title="Exercices">
                <NotLoggedInState onGoHome={handleGoHome} />
            </Layout>
        );
    }

    // Si une erreur s'est produite
    if (error) {
        return (
            <Layout title="Exercices">
                <ErrorState message={error} onAction={handleGoHome} />
            </Layout>
        );
    }

    // Afficher l'écran de fin de session
    if (sessionComplete) {
        const stats = getFormattedStats();

        return (
            <Layout
                title="Exercices terminés"
                showBackButton
                onBackClick={handleGoHome}
            >
                <div className="max-w-md mx-auto">
                    <SessionSummary
                        stats={stats}
                        hasCompletedSession={!!currentSession}
                        onStartNewSession={handleStartNewSession}
                        onGoHome={handleGoHome}
                    />
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Exercice" showBackButton onBackClick={handleBackClick}>
            <div className="max-w-md mx-auto mb-6">
                {currentSession && (
                    <SessionProgress
                        currentIndex={currentFactIndex}
                        totalCount={currentSession.length}
                        progress={progress}
                    />
                )}

                {currentFact ? (
                    <ExerciseCard
                        key={`exercise-${currentFactIndex}-${currentFact.id}`} // Clé dynamique pour forcer le remontage
                        fact={currentFact}
                        onResult={handleExerciseResult}
                        onNext={goToNextExercise}
                        showTimer={true}
                    />
                ) : (
                    <Card elevated className="text-center p-4">
                        <p className="text-gray-600">
                            Erreur lors du chargement de l&lsquo;exercice.
                        </p>
                        <Button
                            variant="primary"
                            onClick={handleGoHome}
                            className="mt-4"
                        >
                            Retour à l&lsquo;accueil
                        </Button>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default Exercise;
