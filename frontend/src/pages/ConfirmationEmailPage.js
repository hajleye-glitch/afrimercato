import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './InscriptionPage.css';

const ConfirmationEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      confirmerEmail(token);
    } else {
      setStatus('error');
      setMessage('Lien invalide. Aucun token trouvé.');
    }
  }, [searchParams]);

  const confirmerEmail = async (token) => {
    try {
      await authService.confirmerEmail(token);
      setStatus('success');
      setMessage('Votre email a été confirmé avec succès ! Vous pouvez maintenant vous connecter.');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Erreur lors de la confirmation');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card success-card">
        {status === 'loading' && (
          <>
            <div className="success-icon">⏳</div>
            <h2>Vérification en cours...</h2>
            <p>Nous vérifions votre email, veuillez patienter.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="success-icon">✅</div>
            <h2>Email confirmé !</h2>
            <p>{message}</p>
            <Link to="/connexion" className="btn btn-primary">Se connecter</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="success-icon">❌</div>
            <h2>Erreur</h2>
            <p>{message}</p>
            <Link to="/connexion" className="btn btn-primary">Retour à la connexion</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmationEmailPage;