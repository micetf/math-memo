/**
 * @file LoadingState.jsx
 * @description Composant pour afficher l'état de chargement des exercices
 */

/**
 * Composant affichant un indicateur de chargement
 * @returns {JSX.Element} Composant LoadingState
 */
export const LoadingState = () => {
    return (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Chargement des exercices...</p>
            </div>
        </div>
    );
};
