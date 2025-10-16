import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          🚀 Space Arcade
        </Link>
        <nav className="nav">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Inicio
          </Link>
          <Link 
            to="/game" 
            className={location.pathname === '/game' ? 'active' : ''}
          >
            Jugar
          </Link>
          <Link 
            to="/leaderboard" 
            className={location.pathname === '/leaderboard' ? 'active' : ''}
          >
            Puntuaciones
          </Link>
          <Link 
            to="/about" 
            className={location.pathname === '/about' ? 'active' : ''}
          >
            Acerca de
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
