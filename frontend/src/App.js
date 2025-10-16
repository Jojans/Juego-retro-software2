import React, { useEffect, useState } from 'react';
import './App.css';

const App = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);

  // URL del backend desplegado en Render
  const API_URL = 'https://juego-retro-software2.onrender.com/api';

  // Función para cargar el leaderboard
  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setScores(data.scores || []);
      } else {
        console.error('Error cargando puntuaciones:', response.statusText);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    }
    setLoading(false);
  };

  // Cargar puntuaciones al montar el componente
  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Función para iniciar el juego
  const startGame = () => {
    const gameSection = document.getElementById('game');
    if (gameSection) {
      gameSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Aquí podrías inicializar Phaser.js si lo deseas
    console.log('Iniciando juego...');
  };
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
            onClick={startGame}
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
              {loading ? (
                <p>🔄 Cargando puntuaciones...</p>
              ) : scores.length > 0 ? (
                <div className="scores-grid">
                  {scores.slice(0, 10).map((score, index) => (
                    <div key={index} className={`score-item rank-${index + 1}`}>
                      <span className="rank">#{index + 1}</span>
                      <span className="player-name">{score.username || 'Anónimo'}</span>
                      <span className="score">{score.score || 0} pts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>📊 No hay puntuaciones aún. ¡Sé el primero en jugar!</p>
              )}
            </div>
            <button 
              className="play-button"
              onClick={() => loadLeaderboard()}
              style={{marginTop: '1rem'}}
            >
              🔄 Actualizar Puntuaciones
            </button>
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
