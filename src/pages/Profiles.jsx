/**
 * @file Profiles.jsx
 * @description Page de gestion des profils utilisateurs
 */

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Icon } from "../components/common/Icon";
import AuthContext from "../contexts/AuthContext";
import { DIFFICULTY_LEVELS } from "../data/progressions";

/**
 * Page de gestion des profils utilisateurs
 * @returns {JSX.Element} Page Profiles
 */
const Profiles = () => {
    const navigate = useNavigate();
    const {
        user,
        profiles,
        switchProfile,
        createProfile,
        deleteProfile,
        error,
    } = useContext(AuthContext);

    // État local pour le formulaire de création de profil
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newProfileName, setNewProfileName] = useState("");
    const [newProfileLevel, setNewProfileLevel] = useState(
        DIFFICULTY_LEVELS.CP
    );

    // Message d'information ou d'erreur
    const [message, setMessage] = useState("");

    /**
     * Gère la sélection d'un profil
     * @param {string} profileId - ID du profil à sélectionner
     */
    const handleSelectProfile = (profileId) => {
        if (switchProfile(profileId)) {
            setMessage("Profil sélectionné avec succès");

            // Rediriger vers la page d'accueil après un court délai
            setTimeout(() => {
                navigate("/");
            }, 1000);
        } else {
            setMessage("Erreur lors de la sélection du profil");
        }
    };

    /**
     * Gère la création d'un nouveau profil
     * @param {Event} e - Événement du formulaire
     */
    const handleCreateProfile = (e) => {
        e.preventDefault();

        if (!newProfileName.trim()) {
            setMessage("Le nom du profil est requis");
            return;
        }

        const newProfile = createProfile({
            name: newProfileName.trim(),
            level: newProfileLevel,
        });

        if (newProfile) {
            setMessage("Profil créé avec succès");
            setNewProfileName("");
            setShowCreateForm(false);

            // Rediriger vers la page d'accueil après un court délai
            setTimeout(() => {
                navigate("/");
            }, 1000);
        } else {
            setMessage("Erreur lors de la création du profil");
        }
    };

    /**
     * Gère la suppression d'un profil
     * @param {string} profileId - ID du profil à supprimer
     * @param {Event} e - Événement du bouton
     */
    const handleDeleteProfile = (profileId, e) => {
        e.stopPropagation(); // Empêcher la sélection du profil

        if (
            window.confirm(
                "Es-tu sûr de vouloir supprimer ce profil ? Cette action est irréversible."
            )
        ) {
            if (deleteProfile(profileId)) {
                setMessage("Profil supprimé avec succès");
            } else {
                setMessage("Erreur lors de la suppression du profil");
            }
        }
    };

    return (
        <Layout
            title="Profils"
            showBackButton
            onBackClick={() => navigate("/")}
        >
            <div className="max-w-md mx-auto">
                {/* Message d'information ou d'erreur */}
                {(message || error) && (
                    <div
                        className={`mb-4 p-3 rounded-lg ${
                            error
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                        }`}
                    >
                        {message || error}
                    </div>
                )}

                <Card elevated className="mb-6">
                    <div className="p-4">
                        <h2 className="text-xl font-semibold mb-4">
                            Mes profils
                        </h2>

                        {/* Liste des profils */}
                        {profiles.length > 0 ? (
                            <div className="space-y-3 mb-4">
                                {profiles.map((profile) => (
                                    <div
                                        key={profile.id}
                                        onClick={() =>
                                            handleSelectProfile(profile.id)
                                        }
                                        className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                                            user && user.id === profile.id
                                                ? "bg-blue-100 border-2 border-blue-500"
                                                : "bg-gray-50 hover:bg-gray-100"
                                        }`}
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {profile.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Niveau:{" "}
                                                {profile.level.toUpperCase()}
                                                {profile.createdAt &&
                                                    ` • Créé le ${new Date(
                                                        profile.createdAt
                                                    ).toLocaleDateString()}`}
                                            </div>
                                        </div>

                                        {user && user.id !== profile.id && (
                                            <button
                                                onClick={(e) =>
                                                    handleDeleteProfile(
                                                        profile.id,
                                                        e
                                                    )
                                                }
                                                className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
                                                aria-label="Supprimer le profil"
                                            >
                                                <Icon name="close" size="20" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic mb-4">
                                Aucun profil trouvé. Crée ton premier profil !
                            </p>
                        )}

                        {/* Bouton pour créer un nouveau profil */}
                        {!showCreateForm ? (
                            <Button
                                variant="primary"
                                onClick={() => setShowCreateForm(true)}
                                fullWidth
                            >
                                Créer un nouveau profil
                            </Button>
                        ) : (
                            <form
                                onSubmit={handleCreateProfile}
                                className="mt-4"
                            >
                                <h3 className="font-medium mb-2">
                                    Nouveau profil
                                </h3>

                                <div className="mb-3">
                                    <label
                                        htmlFor="profileName"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        id="profileName"
                                        value={newProfileName}
                                        onChange={(e) =>
                                            setNewProfileName(e.target.value)
                                        }
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Entre ton nom"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="profileLevel"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Niveau
                                    </label>
                                    <select
                                        id="profileLevel"
                                        value={newProfileLevel}
                                        onChange={(e) =>
                                            setNewProfileLevel(e.target.value)
                                        }
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value={DIFFICULTY_LEVELS.CP}>
                                            CP (6-7 ans)
                                        </option>
                                        <option value={DIFFICULTY_LEVELS.CE1}>
                                            CE1 (7-8 ans)
                                        </option>
                                        <option value={DIFFICULTY_LEVELS.CE2}>
                                            CE2 (8-9 ans)
                                        </option>
                                    </select>
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowCreateForm(false)}
                                        className="flex-1"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="flex-1"
                                    >
                                        Créer
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default Profiles;
