import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Bandeau principal */}
      <section className="hero">
        <div className="hero-content">
          <h1>Le talent n'a pas de frontières, il a une plateforme</h1>
          <p>Afrimercato connecte les talents africains avec les clubs, académies et recruteurs du monde entier</p>
          {!user && (
            <Link to="/inscription" className="btn btn-primary btn-large">
              Créer mon compte gratuitement
            </Link>
          )}
        </div>
      </section>

      {/* Derniers joueurs */}
      <section className="section">
        <h2>Derniers joueurs inscrits</h2>
        <div className="cards-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card player-card">
              <div className="card-avatar">{/* Avatar placeholder */}</div>
              <h3>Joueur {i}</h3>
              <p>Attaquant • 🇸🇳 Sénégal</p>
            </div>
          ))}
        </div>
        <Link to="/recherche" className="btn btn-link">Voir tous les joueurs →</Link>
      </section>

      {/* Clubs récents */}
      <section className="section bg-light">
        <h2>Clubs et académies récemment inscrits</h2>
        <div className="cards-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card club-card">
              <div className="card-logo">{/* Logo placeholder */}</div>
              <h3>Club {i}</h3>
              <p>🇸🇳 Sénégal</p>
            </div>
          ))}
        </div>
        <Link to="/recherche" className="btn btn-link">Voir tous les clubs →</Link>
      </section>

      {/* Barre de recherche rapide */}
      <section className="section search-section">
        <h2>Trouvez votre prochain talent ou opportunité</h2>
        <div className="search-bar">
          <input type="text" placeholder="Rechercher un joueur, un club, une académie..." />
          <button className="btn btn-primary">Rechercher</button>
        </div>
        <Link to="/recherche" className="btn btn-link">Recherche avancée</Link>
      </section>

      {/* Témoignages */}
      <section className="section">
        <h2>Témoignages</h2>
        <div className="testimonials">
          <div className="testimonial">
            <p>"Grâce à Afrimercato, j'ai été repéré par un club en Tanzanie"</p>
            <strong>— Moussa K., Attaquant</strong>
          </div>
          <div className="testimonial">
            <p>"Mon académie a trouvé trois talents en une semaine"</p>
            <strong>— Coach Diallo, Dakar</strong>
          </div>
        </div>
      </section>

      {/* Actualités */}
      <section className="section bg-light">
        <h2>Actualités</h2>
        <div className="news-grid">
          <div className="news-item">
            <h4>Lancement de la plateforme</h4>
            <p>Afrimercato ouvre ses portes aux talents africains...</p>
            <span>02/07/2026</span>
          </div>
          <div className="news-item">
            <h4>Partenariat avec des académies</h4>
            <p>De nouvelles académies rejoignent la plateforme...</p>
            <span>28/06/2026</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;