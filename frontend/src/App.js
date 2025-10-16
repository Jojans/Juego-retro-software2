import React from 'react';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <header className="header">
        <h1>🚀 Space Arcade Game</h1>
        <nav>
          <a href="#home">Inicio</a>
          <a href="#game">Jugar</a>
          <a href="#leaderboard">Puntuaciones</a>
          <a href="#about">Acerca de</a>
        </nav>
      </header>
      
      <main className="main-content">
        <section id="home" className="hero">
          <h2>¡Bienvenido a Space Arcade!</h2>
          <p>Un juego educativo desarrollado con React y Phaser.js</p>
          <button 
            className="play-button"
            onClick={() => {
              const gameSection = document.getElementById('game');
              if (gameSection) {
                gameSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            🎮 Jugar Ahora
          </button>
        </section>

        <section id="game" className="game-section">
          <h2>🎮 Juego</h2>
          <div id="game-container" className="game-container">
            <canvas id="game-canvas" width="800" height="600"></canvas>
          </div>
          <div className="game-controls">
            <h3>Controles:</h3>
            <ul>
              <li>← → Flechas direccionales para mover</li>
              <li>ESPACIO para disparar</li>
              <li>P o ESC para pausar</li>
            </ul>
          </div>
        </section>

        <section id="leaderboard" className="leaderboard-section">
          <h2>🏆 Puntuaciones</h2>
          <div className="leaderboard">
            <p>Las puntuaciones se guardan automáticamente en la base de datos.</p>
            <div id="scores-list">
              <p>Cargando puntuaciones...</p>
            </div>
          </div>
        </section>

        <section id="about" className="about-section">
          <h2>📚 Acerca de</h2>
          <div className="about-content">
            <h3>Space Arcade Game</h3>
            <p>Un juego educativo desarrollado con tecnologías web modernas:</p>
            <ul>
              <li>🎮 <strong>Frontend:</strong> React 18 + TypeScript + Phaser.js</li>
              <li>⚙️ <strong>Backend:</strong> Node.js + Express + TypeScript</li>
              <li>🗄️ <strong>Base de datos:</strong> PostgreSQL</li>
              <li>🐳 <strong>Despliegue:</strong> Docker + Render</li>
            </ul>
            <h3>Características Educativas:</h3>
            <ul>
              <li>✅ Código completamente documentado</li>
              <li>✅ Arquitectura full-stack moderna</li>
              <li>✅ APIs REST y WebSockets</li>
              <li>✅ Base de datos relacional</li>
              <li>✅ Despliegue en la nube</li>
            </ul>
            <p>
              <strong>GitHub:</strong> 
              <a href="https://github.com/Jojans/Juego-retro-software2" target="_blank" rel="noopener noreferrer">
                Ver código fuente
              </a>
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2024 Space Arcade Team - Proyecto Educativo</p>
      </footer>
    </div>
  );
};

export default App;
