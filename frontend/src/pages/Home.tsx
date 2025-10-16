import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <div className="hero">
        <h1>Space Arcade Game</h1>
        <p>
          Un juego educativo de naves espaciales desarrollado con React, Phaser.js y Node.js. 
          Combina acción clásica con mecánicas modernas para una experiencia de aprendizaje única.
        </p>
        <div className="cta-buttons">
          <Link to="/game" className="btn btn-primary">
            🎮 Jugar Ahora
          </Link>
          <Link to="/about" className="btn btn-secondary">
            📚 Aprender Más
          </Link>
        </div>
      </div>
      
      <div className="features">
        <div className="feature">
          <h3>🎯 Sistema de Oleadas</h3>
          <p>
            Progresión de oleadas: 3, 4, 5, 6, 7, 8... enemigos por oleada. 
            Cada oleada presenta nuevos desafíos y mecánicas.
          </p>
        </div>
        
        <div className="feature">
          <h3>⚡ Poder Especial</h3>
          <p>
            Sistema de poder especial: Doble daño por 5 segundos cada 15 segundos. 
            Usa la tecla C para activar tu poder especial.
          </p>
        </div>
        
        <div className="feature">
          <h3>🏆 Sistema de Puntuación</h3>
          <p>
            Puntos por enemigos derrotados, 100 puntos bonus por derrotar al jefe. 
            Leaderboard con validación de nombres únicos.
          </p>
        </div>
        
        <div className="feature">
          <h3>💻 Tecnologías Modernas</h3>
          <p>
            Desarrollado con React 18, TypeScript, Phaser.js 3.90, Node.js, 
            Express.js, PostgreSQL y Docker.
          </p>
        </div>
        
        <div className="feature">
          <h3>📱 Responsive Design</h3>
          <p>
            Diseño completamente responsive que se adapta a móviles, tablets y escritorio. 
            Optimizado para todos los dispositivos.
          </p>
        </div>
        
        <div className="feature">
          <h3>🎓 Fines Educativos</h3>
          <p>
            Código abierto y documentado para fines educativos. 
            Perfecto para aprender desarrollo web y programación de juegos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
