import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import InscriptionPage from './pages/InscriptionPage';
import ConnexionPage from './pages/ConnexionPage';
import ConfirmationEmailPage from './pages/ConfirmationEmailPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/inscription" element={<InscriptionPage />} />
            <Route path="/connexion" element={<ConnexionPage />} />
            <Route path="/confirmation-email" element={<ConfirmationEmailPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;