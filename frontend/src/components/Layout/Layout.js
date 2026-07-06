import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">⚽</span>
            <span className="logo-text">AFRIMERCATO</span>
          </Link>

          <nav className="nav">
            {user ? (
              <>
                <Link to="/recherche" className="nav-link">Recherche</Link>
                <Link to="/opportunites" className="nav-link">Opportunités</Link>
                <Link to="/messages" className="nav-link nav-icon">✉</Link>
                <div className="user-menu">
                  <span className="user-name">{user.nom}</span>
                  <div className="dropdown">
                    <Link to="/tableau-de-bord">Tableau de bord</Link>
                    <Link to="/profil/modifier">Modifier mon profil</Link>
                    <Link to="/parametres">Paramètres</Link>
                    <button onClick={handleLogout}>Déconnexion</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/connexion" className="btn btn-outline">Connexion</Link>
                <Link to="/inscription" className="btn btn-primary">S'inscrire</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 Afrimercato</p>
          <div className="footer-links">
            <Link to="/conditions">Conditions d'utilisation</Link>
            <Link to="/confidentialite">Politique de confidentialité</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;