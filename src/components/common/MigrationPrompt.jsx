// src/components/common/MigrationPrompt.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useStorage } from "../../contexts/storage/useStorage";
import { Card } from "./Card";
import { Button } from "./Button";

/**
 * Composant qui gère la migration des données de localStorage vers IndexedDB
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onMigrationComplete - Fonction appelée lorsque la migration est terminée
 * @returns {JSX.Element|null} Composant de migration ou null si non nécessaire
 */
export const MigrationPrompt = ({ onMigrationComplete }) => {
    const { isInitialized, isIndexedDBSupported, migrateFromLocalStorage } =
        useStorage();
    const [isMigrationNeeded, setIsMigrationNeeded] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationSuccess, setMigrationSuccess] = useState(null);

    // Vérifier si la migration est nécessaire
    useEffect(() => {
        const checkMigrationNeed = async () => {
            if (!isInitialized || !isIndexedDBSupported) return;

            // Vérifier s'il y a des données dans localStorage à migrer
            const hasLocalStorageData = Object.keys(localStorage).some(
                (key) =>
                    key.startsWith("mathmemo-") || key.startsWith("spaced-rep-")
            );

            setIsMigrationNeeded(hasLocalStorageData);
        };

        checkMigrationNeed();
    }, [isInitialized, isIndexedDBSupported]);

    /**
     * Déclenche la migration des données
     */
    const handleMigration = async () => {
        setIsMigrating(true);
        try {
            const success = await migrateFromLocalStorage();
            setMigrationSuccess(success);

            if (success) {
                // Attendre avant de cacher le composant
                setTimeout(() => {
                    if (onMigrationComplete) onMigrationComplete(true);
                }, 2000);
            }
        } catch (error) {
            console.error("Erreur lors de la migration:", error);
            setMigrationSuccess(false);
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
                    <h2 className="text-lg font-semibold mb-2">
                        Amélioration du stockage
                    </h2>

                    {migrationSuccess === null ? (
                        <>
                            <p className="mb-4">
                                MathMemo peut désormais stocker vos données plus
                                efficacement. Souhaitez-vous migrer vos données
                                existantes vers le nouveau système ?
                            </p>

                            <div className="flex space-x-3">
                                <Button
                                    variant="primary"
                                    onClick={handleMigration}
                                    disabled={isMigrating}
                                    className="flex-1"
                                >
                                    {isMigrating
                                        ? "Migration en cours..."
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
                    ) : migrationSuccess ? (
                        <div className="text-center py-2">
                            <div className="text-green-500 text-xl mb-2">✓</div>
                            <p>Migration terminée avec succès !</p>
                        </div>
                    ) : (
                        <div className="text-center py-2">
                            <div className="text-red-500 text-xl mb-2">✗</div>
                            <p>
                                Échec de la migration. Vos données restent
                                accessibles dans l&lsquo;ancien format.
                            </p>
                            <Button
                                variant="primary"
                                onClick={handleSkip}
                                className="mt-3"
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
