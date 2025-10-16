import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about">
      <h1>Acerca del Proyecto</h1>
      
      <div className="about-section">
        <h2>🎮 ¿Qué es Space Arcade Game?</h2>
        <p>
          Space Arcade Game es un juego educativo de naves espaciales desarrollado con tecnologías 
          web modernas. Combina la diversión de los juegos arcade clásicos con mecánicas modernas 
          y un diseño educativo para crear una experiencia de aprendizaje única.
        </p>
      </div>

      <div className="about-section">
        <h2>🎯 Características del Juego</h2>
        <ul>
          <li><strong>Sistema de Oleadas:</strong> Progresión de 3, 4, 5, 6, 7, 8... enemigos por oleada</li>
          <li><strong>Poder Especial:</strong> Doble daño por 5 segundos cada 15 segundos (tecla C)</li>
          <li><strong>Colisiones Realistas:</strong> Los enemigos rebotan entre sí en lugar de desaparecer</li>
          <li><strong>Hitbox Optimizada:</strong> Mejor detección de colisiones para el personaje</li>
          <li><strong>Balas Dinámicas:</strong> Tamaño y color cambian con el poder especial</li>
          <li><strong>Sistema de Puntuación:</strong> Puntos por enemigos y bonus por jefe</li>
          <li><strong>Leaderboard:</strong> Tabla de puntuaciones con validación de nombres únicos</li>
        </ul>
      </div>

      <div className="about-section">
        <h2>💻 Tecnologías Utilizadas</h2>
        <div className="tech-stack">
          <div className="tech-item">
            <h4>Frontend</h4>
            <ul>
              <li>React 18</li>
              <li>TypeScript</li>
              <li>Phaser.js 3.90</li>
              <li>CSS3</li>
              <li>HTML5 Canvas</li>
            </ul>
          </div>
          <div className="tech-item">
            <h4>Backend</h4>
            <ul>
              <li>Node.js</li>
              <li>Express.js</li>
              <li>TypeScript</li>
              <li>Socket.io</li>
              <li>PostgreSQL</li>
            </ul>
          </div>
          <div className="tech-item">
            <h4>DevOps</h4>
            <ul>
              <li>Docker</li>
              <li>Docker Compose</li>
              <li>Git</li>
              <li>GitHub Actions</li>
              <li>Netlify</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2>🎓 Propósito Educativo</h2>
        <p>
          Este proyecto fue desarrollado con fines educativos para demostrar:
        </p>
        <ul>
          <li>Desarrollo de juegos web con HTML5 Canvas y Phaser.js</li>
          <li>Arquitectura de aplicaciones React modernas</li>
          <li>Integración de frontend y backend con APIs REST</li>
          <li>Uso de bases de datos relacionales (PostgreSQL)</li>
          <li>Containerización con Docker</li>
          <li>Despliegue en la nube</li>
          <li>Buenas prácticas de desarrollo web</li>
        </ul>
      </div>

      <div className="about-section">
        <h2>🚀 Cómo Jugar</h2>
        <div className="game-instructions">
          <div className="instruction-item">
            <h4>🎮 Controles</h4>
            <ul>
              <li><strong>Movimiento:</strong> ← → Flechas direccionales o WASD</li>
              <li><strong>Disparo:</strong> Barra espaciadora</li>
              <li><strong>Poder especial:</strong> Tecla C (cooldown de 15 segundos)</li>
              <li><strong>Pausa:</strong> P o ESC</li>
            </ul>
          </div>
          <div className="instruction-item">
            <h4>🎯 Objetivo</h4>
            <ul>
              <li>Elimina todos los enemigos de cada oleada</li>
              <li>Supervive el mayor tiempo posible</li>
              <li>Consigue la máxima puntuación</li>
              <li>Derrota al jefe cada 5 oleadas</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2>📚 Recursos de Aprendizaje</h2>
        <p>
          Si quieres aprender más sobre las tecnologías utilizadas en este proyecto:
        </p>
        <ul>
          <li><a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React - Biblioteca de JavaScript para interfaces de usuario</a></li>
          <li><a href="https://phaser.io/" target="_blank" rel="noopener noreferrer">Phaser.js - Framework de juegos 2D</a></li>
          <li><a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js - Runtime de JavaScript</a></li>
          <li><a href="https://expressjs.com/" target="_blank" rel="noopener noreferrer">Express.js - Framework web para Node.js</a></li>
          <li><a href="https://www.postgresql.org/" target="_blank" rel="noopener noreferrer">PostgreSQL - Base de datos relacional</a></li>
          <li><a href="https://www.docker.com/" target="_blank" rel="noopener noreferrer">Docker - Containerización de aplicaciones</a></li>
        </ul>
      </div>

      <div className="about-section">
        <h2>🤝 Contribuciones</h2>
        <p>
          Este es un proyecto de código abierto. Las contribuciones son bienvenidas:
        </p>
        <ul>
          <li>Reportar bugs o problemas</li>
          <li>Sugerir nuevas características</li>
          <li>Mejorar la documentación</li>
          <li>Optimizar el rendimiento</li>
          <li>Agregar nuevas mecánicas de juego</li>
        </ul>
      </div>

      <div className="about-section">
        <h2>📄 Licencia</h2>
        <p>
          Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.
        </p>
      </div>
    </div>
  );
};

export default About;
