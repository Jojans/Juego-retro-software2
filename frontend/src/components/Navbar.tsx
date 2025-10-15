import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-space-dark bg-opacity-90 backdrop-blur-sm border-b border-neon-cyan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
      <Link to="/" className="flex items-center space-x-4">
        <div className="text-2xl font-bold neon-text">
          🚀 SPACE ARCADE
        </div>
      </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/leaderboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/leaderboard') 
                  ? 'text-neon-cyan bg-neon-cyan bg-opacity-20' 
                  : 'text-gray-300 hover:text-neon-cyan'
              }`}
            >
              Leaderboard
            </Link>
            
            <Link
              to="/about"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/about') 
                  ? 'text-neon-cyan bg-neon-cyan bg-opacity-20' 
                  : 'text-gray-300 hover:text-neon-cyan'
              }`}
            >
              About Us
            </Link>
          </div>


          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-300 hover:text-neon-cyan">
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/leaderboard"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/leaderboard') 
                ? 'text-neon-cyan bg-neon-cyan bg-opacity-20' 
                : 'text-gray-300 hover:text-neon-cyan'
            }`}
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
