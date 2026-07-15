import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

// --- Données statiques (sorties du composant pour ne pas être recréées à chaque rendu) ---

const PAYS_AFRICAINS = [
  'Sénégal', "Côte d'Ivoire", 'Ghana', 'Nigeria', 'Cameroun', 'Mali', 'Burkina Faso',
  'Togo', 'Bénin', 'Guinée', 'Niger', 'RD Congo', 'Congo', 'Gabon', 'Maroc',
  'Algérie', 'Tunisie', 'Afrique du Sud', 'Kenya', 'Tanzanie', 'Ouganda', 'Zambie',
  'Angola', 'Mozambique', 'Madagascar', 'Maurice', 'Cap-Vert', 'Gambie', 'Liberia',
  'Sierra Leone', 'Guinée-Bissau', 'Mauritanie', 'Tchad', 'Soudan', 'Éthiopie',
  'Somalie', 'Rwanda', 'Burundi', 'Malawi', 'Zimbabwe', 'Botswana', 'Namibie',
  'Eswatini', 'Lesotho', 'Guinée équatoriale', 'Sao Tomé-et-Principe', 'Seychelles',
  'Comores', 'Djibouti', 'Érythrée', 'Soudan du Sud', 'Centrafrique',
];

const POSTES = [
  'Gardien', 'Défenseur central', 'Latéral droit', 'Latéral gauche', 'Milieu défensif',
  'Milieu central', 'Milieu offensif', 'Ailier droit', 'Ailier gauche', 'Attaquant',
];

const INITIAL_FORM = {
  nom: '',
  email: '',
  mot_de_passe: '',
  confirmation: '',
  pays: '',
  region: '',
  telephone: '',
  date_naissance: '',
  poste_principal: '',
  pied_fort: '',
  taille: '',
};

// Calcule l'âge à partir d'une date de naissance (YYYY-MM-DD)
const calculerAge = (dateNaissance) => {
  const naissance = new Date(dateNaissance);
  if (Number.isNaN(naissance.getTime())) return null;
  const aujourdHui = new Date();
  let age = aujourdHui.getFullYear() - naissance.getFullYear();
  const moisDiff = aujourdHui.getMonth() - naissance.getMonth();
  if (moisDiff < 0 || (moisDiff === 0 && aujourdHui.getDate() < naissance.getDate())) {
    age -= 1;
  }
  return age;
};

const inputClasses =
  'w-full rounded-lg border-2 border-gray-200 px-3.5 py-3 text-base text-gray-900 outline-none transition-colors focus:border-blue-600 disabled:bg-gray-50 disabled:text-gray-400';

const labelClasses = 'mb-1.5 block text-sm font-semibold text-gray-800';

const InscriptionPage = () => {
  const [step, setStep] = useState(1);
  const [typeCompte, setTypeCompte] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type) => {
    setTypeCompte(type);
    setStep(2);
    setError('');
  };

  const handleBack = () => {
    setStep(1);
    setTypeCompte('');
    setError('');
  };

  const validateForm = () => {
    if (!form.nom.trim() || !form.email.trim() || !form.mot_de_passe || !form.pays) {
      setError('Veuillez remplir tous les champs obligatoires (*)');
      return false;
    }

    if (form.mot_de_passe !== form.confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    if (form.mot_de_passe.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    if (!/\d/.test(form.mot_de_passe)) {
      setError('Le mot de passe doit contenir au moins un chiffre');
      return false;
    }

    if (typeCompte === 'joueur') {
      if (!form.date_naissance) {
        setError('La date de naissance est obligatoire pour les joueurs');
        return false;
      }

      const age = calculerAge(form.date_naissance);
      if (age === null || age < 13) {
        setError('Vous devez avoir au moins 13 ans pour vous inscrire');
        return false;
      }

      if (!form.poste_principal) {
        setError('Le poste principal est obligatoire pour les joueurs');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = {
        type_compte: typeCompte,
        nom: form.nom.trim(),
        email: form.email.trim(),
        mot_de_passe: form.mot_de_passe,
        pays: form.pays,
        region: form.region || undefined,
        telephone: form.telephone || undefined,
      };

      if (typeCompte === 'joueur') {
        data.date_naissance = form.date_naissance;
        data.poste_principal = form.poste_principal;
        data.pied_fort = form.pied_fort || undefined;
        data.taille = form.taille ? parseInt(form.taille, 10) : undefined;
      }

      await authService.inscription(data);
      setSuccess(true);
      setStep(3);
    } catch (err) {
      console.error('Erreur inscription:', err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de l'inscription. Veuillez réessayer.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- Étape 3 : succès ---
  if (step === 3 && success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-5">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="mb-5 text-6xl">✅</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Inscription réussie !</h2>
          <p className="mb-2 text-gray-600">
            Un email de confirmation a été envoyé à <strong>{form.email}</strong>
          </p>
          <p className="mb-8 text-gray-600">
            Vérifiez votre boîte de réception (et vos spams) pour activer votre compte.
          </p>
          <Link
            to="/connexion"
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-5 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 shadow-lg">
        {/* Indicateur d'étapes */}
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className={`h-3 w-3 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <span className={`h-0.5 w-10 transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <span className={`h-3 w-3 rounded-full transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <span className={`h-0.5 w-10 transition-colors ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <span className={`h-3 w-3 rounded-full transition-colors ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        </div>

        {/* Étape 1 : choix du type de compte */}
        {step === 1 && (
          <div>
            <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">Créer un compte</h2>
            <p className="mb-7 text-center text-gray-600">Choisissez votre type de profil</p>

            <button
              type="button"
              onClick={() => handleTypeSelect('joueur')}
              className="mb-3 w-full rounded-xl border-2 border-gray-200 bg-white p-5 text-center transition-all hover:-translate-y-0.5 hover:border-blue-600 hover:shadow-md"
            >
              <div className="mb-2 text-4xl">⚽</div>
              <h3 className="m-0 mb-1 text-lg font-semibold text-gray-900">Joueur</h3>
              <p className="m-0 text-gray-600">Je suis footballeur et je cherche des opportunités</p>
            </button>

            <button
              type="button"
              onClick={() => handleTypeSelect('club')}
              className="mb-3 w-full rounded-xl border-2 border-gray-200 bg-white p-5 text-center transition-all hover:-translate-y-0.5 hover:border-blue-600 hover:shadow-md"
            >
              <div className="mb-2 text-4xl">🏟️</div>
              <h3 className="m-0 mb-1 text-lg font-semibold text-gray-900">Club</h3>
              <p className="m-0 text-gray-600">Je représente un club et je cherche des joueurs</p>
            </button>

            <p className="mt-4 text-center text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/connexion" className="font-semibold text-blue-600 hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        )}

        {/* Étape 2 : formulaire */}
        {step === 2 && (
          <form onSubmit={handleSubmit} noValidate>
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
              {typeCompte === 'joueur' ? '⚽ Inscription Joueur' : '🏟️ Inscription Club'}
            </h2>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Nom */}
            <div className="mb-5">
              <label htmlFor="nom" className={labelClasses}>
                {typeCompte === 'club' ? 'Nom du club' : 'Nom complet'} <span className="text-red-500">*</span>
              </label>
              <input
                id="nom"
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder={typeCompte === 'club' ? 'Ex: Club Olympique de Dakar' : 'Ex: Moussa Konaté'}
                required
                disabled={loading}
                className={inputClasses}
              />
            </div>

            {/* Email */}
            <div className="mb-5">
              <label htmlFor="email" className={labelClasses}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ex: moussa@email.com"
                required
                disabled={loading}
                className={inputClasses}
              />
            </div>

            {/* Mot de passe et confirmation */}
            <div className="mb-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="mb-4">
                <label htmlFor="mot_de_passe" className={labelClasses}>
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="mot_de_passe"
                    type={showPassword ? 'text' : 'password'}
                    name="mot_de_passe"
                    value={form.mot_de_passe}
                    onChange={handleChange}
                    placeholder="Minimum 8 caractères"
                    required
                    minLength={8}
                    disabled={loading}
                    className={`${inputClasses} pr-16`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    {showPassword ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">8 caractères minimum, 1 chiffre obligatoire</p>
              </div>
              <div className="mb-4">
                <label htmlFor="confirmation" className={labelClasses}>
                  Confirmation <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmation"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmation"
                  value={form.confirmation}
                  onChange={handleChange}
                  placeholder="Répétez le mot de passe"
                  required
                  disabled={loading}
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Pays */}
            <div className="mb-5">
              <label htmlFor="pays" className={labelClasses}>
                Pays <span className="text-red-500">*</span>
              </label>
              <select
                id="pays"
                name="pays"
                value={form.pays}
                onChange={handleChange}
                required
                disabled={loading}
                className={`${inputClasses} bg-white`}
              >
                <option value="">Sélectionner un pays</option>
                {PAYS_AFRICAINS.map((pays) => (
                  <option key={pays} value={pays}>
                    {pays}
                  </option>
                ))}
              </select>
            </div>

            {/* Région (optionnel) */}
            <div className="mb-5">
              <label htmlFor="region" className={labelClasses}>
                Région / Ville
              </label>
              <input
                id="region"
                type="text"
                name="region"
                value={form.region}
                onChange={handleChange}
                placeholder="Ex: Dakar, Abidjan..."
                disabled={loading}
                className={inputClasses}
              />
            </div>

            {/* Téléphone (optionnel) */}
            <div className="mb-5">
              <label htmlFor="telephone" className={labelClasses}>
                Téléphone
              </label>
              <input
                id="telephone"
                type="tel"
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                placeholder="Ex: +221 77 123 45 67"
                disabled={loading}
                className={inputClasses}
              />
            </div>

            {/* Champs spécifiques au joueur */}
            {typeCompte === 'joueur' && (
              <>
                <div className="mb-5">
                  <label htmlFor="date_naissance" className={labelClasses}>
                    Date de naissance <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="date_naissance"
                    type="date"
                    name="date_naissance"
                    value={form.date_naissance}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={inputClasses}
                  />
                  <p className="mt-1 text-xs text-gray-500">Vous devez avoir au moins 13 ans</p>
                </div>

                <div className="mb-5">
                  <label htmlFor="poste_principal" className={labelClasses}>
                    Poste principal <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="poste_principal"
                    name="poste_principal"
                    value={form.poste_principal}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={`${inputClasses} bg-white`}
                  >
                    <option value="">Sélectionner un poste</option>
                    {POSTES.map((poste) => (
                      <option key={poste} value={poste}>
                        {poste}
                      </option>
                    ))}
                  </select>
                </div>

                <fieldset className="mb-5">
                  <legend className={labelClasses}>Pied fort</legend>
                  <div className="flex gap-5">
                    {['Droit', 'Gauche', 'Les deux'].map((option) => (
                      <label key={option} className="flex cursor-pointer items-center gap-1.5 font-normal text-gray-800">
                        <input
                          type="radio"
                          name="pied_fort"
                          value={option}
                          checked={form.pied_fort === option}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="mb-5">
                  <label htmlFor="taille" className={labelClasses}>
                    Taille (cm)
                  </label>
                  <input
                    id="taille"
                    type="number"
                    name="taille"
                    value={form.taille}
                    onChange={handleChange}
                    placeholder="Ex: 180"
                    min="100"
                    max="250"
                    disabled={loading}
                    className={inputClasses}
                  />
                </div>
              </>
            )}

            {/* Boutons */}
            <button
              type="submit"
              disabled={loading}
              className="mb-2.5 w-full rounded-lg bg-blue-600 py-3.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {loading ? 'Inscription en cours...' : "S'inscrire"}
            </button>
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="w-full rounded-lg bg-gray-200 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Retour
            </button>

            <p className="mt-4 text-center text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/connexion" className="font-semibold text-blue-600 hover:underline">
                Se connecter
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default InscriptionPage;