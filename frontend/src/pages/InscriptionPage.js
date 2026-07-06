import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './InscriptionPage.css';

const InscriptionPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [typeCompte, setTypeCompte] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
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
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeSelect = (type) => {
    setTypeCompte(type);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        type_compte: typeCompte,
        ...formData,
        date_naissance: formData.date_naissance || null,
        taille: formData.taille ? parseInt(formData.taille) : null,
      };

      await authService.inscription(data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const paysAfricains = [
    'Sénégal', 'Côte d\'Ivoire', 'Ghana', 'Nigeria', 'Cameroun', 'Mali', 'Burkina Faso',
    'Togo', 'Bénin', 'Guinée', 'Niger', 'RD Congo', 'Congo', 'Gabon', 'Maroc',
    'Algérie', 'Tunisie', 'Afrique du Sud', 'Kenya', 'Tanzanie', 'Ouganda', 'Zambie',
    'Angola', 'Mozambique', 'Madagascar', 'Maurice', 'Cap-Vert', 'Gambie', 'Liberia',
    'Sierra Leone', 'Guinée-Bissau', 'Mauritanie', 'Tchad', 'Soudan', 'Éthiopie',
    'Somalie', 'Rwanda', 'Burundi', 'Malawi', 'Zimbabwe', 'Botswana', 'Namibie',
    'Eswatini', 'Lesotho', 'Guinée équatoriale', 'Sao Tomé-et-Principe', 'Seychelles',
    'Comores', 'Djibouti', 'Érythrée', 'Soudan du Sud', 'Centrafrique',
  ];

  if (step === 3) {
    return (
      <div className="auth-container">
        <div className="auth-card success-card">
          <div className="success-icon">✅</div>
          <h2>Inscription réussie !</h2>
          <p>Un email de confirmation a été envoyé à <strong>{formData.email}</strong></p>
          <p>Vérifiez votre boîte de réception (et vos spams) pour activer votre compte.</p>
          <Link to="/connexion" className="btn btn-primary">Aller à la connexion</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="step-line"></div>
          <div className="step">3</div>
        </div>

        {step === 1 && (
          <div className="type-selection">
            <h2>Créer un compte</h2>
            <p>Choisissez votre type de profil</p>
            
            <div className="type-cards">
              <div className="type-card" onClick={() => handleTypeSelect('joueur')}>
                <span className="type-icon">⚽</span>
                <h3>Joueur</h3>
                <p>Je suis footballeur et je cherche des opportunités</p>
              </div>
              <div className="type-card" onClick={() => handleTypeSelect('club')}>
                <span className="type-icon">🏟️</span>
                <h3>Club</h3>
                <p>Je représente un club et je cherche des joueurs</p>
              </div>
              <div className="type-card disabled">
                <span className="type-icon">🎓</span>
                <h3>Académie</h3>
                <p>Bientôt disponible</p>
              </div>
              <div className="type-card disabled">
                <span className="type-icon">📋</span>
                <h3>Entraîneur</h3>
                <p>Bientôt disponible</p>
              </div>
              <div className="type-card disabled">
                <span className="type-icon">🤝</span>
                <h3>Agent</h3>
                <p>Bientôt disponible</p>
              </div>
              <div className="type-card disabled">
                <span className="type-icon">🔍</span>
                <h3>Recruteur</h3>
                <p>Bientôt disponible</p>
              </div>
            </div>

            <p className="auth-link">
              Déjà un compte ? <Link to="/connexion">Se connecter</Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <h2>Créer un compte {typeCompte === 'joueur' ? 'Joueur' : 'Club'}</h2>
            
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="nom">Nom {typeCompte === 'club' ? 'du club' : 'complet'} *</label>
              <input type="text" id="nom" name="nom" value={formData.nom} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mot_de_passe">Mot de passe *</label>
                <input type="password" id="mot_de_passe" name="mot_de_passe" value={formData.mot_de_passe} onChange={handleChange} required minLength={8} />
                <small>8 caractères minimum, 1 chiffre minimum</small>
              </div>
              <div className="form-group">
                <label htmlFor="confirmation">Confirmation *</label>
                <input type="password" id="confirmation" name="confirmation" value={formData.confirmation} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pays">Pays *</label>
              <select id="pays" name="pays" value={formData.pays} onChange={handleChange} required>
                <option value="">Sélectionner un pays</option>
                {paysAfricains.map((pays) => (
                  <option key={pays} value={pays}>{pays}</option>
                ))}
              </select>
            </div>

            {typeCompte === 'joueur' && (
              <>
                <div className="form-group">
                  <label htmlFor="date_naissance">Date de naissance *</label>
                  <input type="date" id="date_naissance" name="date_naissance" value={formData.date_naissance} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label htmlFor="poste_principal">Poste principal *</label>
                  <select id="poste_principal" name="poste_principal" value={formData.poste_principal} onChange={handleChange} required>
                    <option value="">Sélectionner un poste</option>
                    <option value="Gardien">Gardien</option>
                    <option value="Défenseur central">Défenseur central</option>
                    <option value="Latéral droit">Latéral droit</option>
                    <option value="Latéral gauche">Latéral gauche</option>
                    <option value="Milieu défensif">Milieu défensif</option>
                    <option value="Milieu central">Milieu central</option>
                    <option value="Milieu offensif">Milieu offensif</option>
                    <option value="Ailier droit">Ailier droit</option>
                    <option value="Ailier gauche">Ailier gauche</option>
                    <option value="Attaquant">Attaquant</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Pied fort</label>
                  <div className="radio-group">
                    <label><input type="radio" name="pied_fort" value="Droit" onChange={handleChange} /> Droit</label>
                    <label><input type="radio" name="pied_fort" value="Gauche" onChange={handleChange} /> Gauche</label>
                    <label><input type="radio" name="pied_fort" value="Les deux" onChange={handleChange} /> Les deux</label>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="taille">Taille (cm)</label>
                  <input type="number" id="taille" name="taille" value={formData.taille} onChange={handleChange} placeholder="Ex: 180" />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="telephone">Téléphone</label>
              <input type="tel" id="telephone" name="telephone" value={formData.telephone} onChange={handleChange} />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" required /> J'accepte les conditions d'utilisation *
              </label>
              <label>
                <input type="checkbox" required /> J'accepte la politique de confidentialité *
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>

            <button type="button" className="btn btn-secondary btn-full" onClick={() => setStep(1)}>
              ← Retour
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InscriptionPage;