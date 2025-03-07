// src/components/common/MigrationPrompt.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useStorage } from "../../contexts/storage/useStorage";
import { Card } from "./Card";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { ProgressBar } from "./ProgressBar";

/**
 * Composant qui gère la migration des données de localStorage vers IndexedDB
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onMigrationComplete - Fonction appelée lorsque la migration est terminée
 * @returns {JSX.Element|null} Composant de migration ou null si non nécessaire
 */
export const MigrationPrompt = ({ onMigrationComplete }) => {
    const {
        isInitialized,
        isIndexedDBSupported,
        migrateFromLocalStorage,
        migrationStatus,
    } = useStorage();
    const [isMigrationNeeded, setIsMigrationNeeded] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationResult, setMigrationResult] = useState(null);
    const [progress, setProgress] = useState(0);

    // Vérifier si la migration est nécessaire
    useEffect(() => {
        const checkMigrationNeed = async () => {
            if (!isInitialized) return;

            // Ne rien faire si la migration a déjà été effectuée
            if (migrationStatus && migrationStatus.success) {
                console.log("Migration déjà effectuée:", migrationStatus);
                if (onMigrationComplete) onMigrationComplete(true);
                return;
            }

            // Ne rien faire si IndexedDB n'est pas supporté
            if (!isIndexedDBSupported) {
                console.warn(
                    "IndexedDB n'est pas supporté, migration impossible"
                );
                if (onMigrationComplete) onMigrationComplete(false);
                return;
            }

            // Vérifier s'il y a des données dans localStorage à migrer
            const hasLocalStorageData = Object.keys(localStorage).some(
                (key) =>
                    key.startsWith("mathmemo-") || key.startsWith("spaced-rep-")
            );

            setIsMigrationNeeded(hasLocalStorageData);

            // Si aucune donnée à migrer, signaler que la migration est terminée
            if (!hasLocalStorageData) {
                if (onMigrationComplete) onMigrationComplete(true);
            }
        };

        checkMigrationNeed();
    }, [
        isInitialized,
        isIndexedDBSupported,
        migrationStatus,
        onMigrationComplete,
    ]);

    /**
     * Déclenche la migration des données
     */
    const handleMigration = async () => {
        setIsMigrating(true);
        setProgress(10); // Commencer avec 10% pour l'effet visuel

        try {
            // Simuler l'avancement de la migration (pour effet visuel uniquement)
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    const increment = Math.random() * 10;
                    const newProgress = prev + increment;
                    return newProgress < 90 ? newProgress : prev;
                });
            }, 300);

            // Lancer la migration
            const result = await migrateFromLocalStorage();

            clearInterval(progressInterval);
            setProgress(100);
            setMigrationResult(result);

            if (result.success) {
                // Attendre avant de cacher le composant
                setTimeout(() => {
                    if (onMigrationComplete) onMigrationComplete(true);
                }, 2000);
            }
        } catch (error) {
            console.error("Erreur lors de la migration:", error);
            setMigrationResult({
                success: false,
                error: error.message,
            });
        } finally {
            setIsMigrating(false);
        }
    };

    /**
     * Ignorer la migration
     */
    const handleSkip = () => {
        if (onMigrationComplete) onMigrationComplete(false);
    };

    // Ne rien afficher si la migration n'est pas nécessaire
    if (!isMigrationNeeded || !isIndexedDBSupported) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card elevated className="max-w-md w-full">
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2">
                        Amélioration du stockage
                    </h2>

                    {!migrationResult ? (
                        <>
                            <p className="mb-4">
                                MathMemo peut désormais stocker vos données plus
                                efficacement, ce qui permettra une meilleure
                                performance et plus de fiabilité. Souhaitez-vous
                                migrer vos données existantes vers le nouveau
                                système ?
                            </p>

                            {isMigrating && (
                                <div className="mb-4">
                                    <ProgressBar
                                        value={progress}
                                        variant="primary"
                                        animated={true}
                                        showLabel={true}
                                    />
                                    <p className="text-center text-sm text-gray-600 mt-2">
                                        Migration en cours, veuillez
                                        patienter...
                                    </p>
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <Button
                                    variant="primary"
                                    onClick={handleMigration}
                                    disabled={isMigrating}
                                    className="flex-1"
                                >
                                    {isMigrating
                                        ? "Migration..."
                                        : "Migrer mes données"}
                                </Button>

                                <Button
                                    variant="secondary"
                                    onClick={handleSkip}
                                    disabled={isMigrating}
                                    className="flex-1"
                                >
                                    Ignorer
                                </Button>
                            </div>
                        </>
                    ) : migrationResult.success ? (
                        <div className="text-center py-2">
                            <div className="flex items-center justify-center mb-3">
                                <Icon
                                    name="checkCircle"
                                    color="#10B981"
                                    size="36"
                                />
                            </div>
                            <p className="mb-3">
                                Migration terminée avec succès !
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                {migrationResult.migrated} éléments ont été
                                migrés.
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => onMigrationComplete(true)}
                                className="w-full"
                            >
                                Continuer
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center py-2">
                            <div className="flex items-center justify-center mb-3">
                                <Icon
                                    name="errorCircle"
                                    color="#EF4444"
                                    size="36"
                                />
                            </div>
                            <p className="font-medium mb-2">
                                Échec de la migration
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                {migrationResult.error ||
                                    "Une erreur est survenue lors de la migration des données."}
                                <br />
                                Vos données restent accessibles dans leur format
                                actuel.
                            </p>
                            <Button
                                variant="primary"
                                onClick={handleSkip}
                                className="w-full"
                            >
                                Continuer
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

MigrationPrompt.propTypes = {
    onMigrationComplete: PropTypes.func,
};

export default MigrationPrompt;
