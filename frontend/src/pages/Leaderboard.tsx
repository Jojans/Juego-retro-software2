import React, { useState, useEffect } from 'react';
import './Leaderboard.css';

interface Score {
  id: number;
  playerName: string;
  score: number;
  wave: number;
  date: string;
}

const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos (en producción vendría del backend)
    const mockScores: Score[] = [
      { id: 1, playerName: 'Piloto Espacial', score: 2500, wave: 8, date: '2024-01-15' },
      { id: 2, playerName: 'Comandante', score: 2200, wave: 7, date: '2024-01-14' },
      { id: 3, playerName: 'Navegante', score: 1800, wave: 6, date: '2024-01-13' },
      { id: 4, playerName: 'Explorador', score: 1500, wave: 5, date: '2024-01-12' },
      { id: 5, playerName: 'Aventurero', score: 1200, wave: 4, date: '2024-01-11' },
      { id: 6, playerName: 'Guerrero', score: 900, wave: 3, date: '2024-01-10' },
      { id: 7, playerName: 'Defensor', score: 600, wave: 2, date: '2024-01-09' },
      { id: 8, playerName: 'Novato', score: 300, wave: 1, date: '2024-01-08' }
    ];

    setTimeout(() => {
      setScores(mockScores);
      setLoading(false);
    }, 1000);
  }, []);

  const getRankClass = (index: number) => {
    if (index === 0) return 'rank-1';
    if (index === 1) return 'rank-2';
    if (index === 2) return 'rank-3';
    return '';
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  if (loading) {
    return (
      <div className="leaderboard">
        <h1>Puntuaciones</h1>
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando puntuaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h1>🏆 Tabla de Puntuaciones</h1>
      
      <div className="leaderboard-info">
        <p>
          Compite con otros jugadores y demuestra tus habilidades como piloto espacial. 
          ¡Intenta alcanzar la cima de la tabla!
        </p>
      </div>

      <div className="scores-list">
        {scores.length === 0 ? (
          <div className="no-scores">
            <p>No hay puntuaciones registradas aún.</p>
            <p>¡Sé el primero en jugar y establecer un récord!</p>
          </div>
        ) : (
          scores.map((score, index) => (
            <div key={score.id} className={`score-item ${getRankClass(index)}`}>
              <div className="rank">
                {getRankIcon(index)}
              </div>
              <div className="player-info">
                <div className="player-name">{score.playerName}</div>
                <div className="player-details">
                  Oleada {score.wave} • {new Date(score.date).toLocaleDateString()}
                </div>
              </div>
              <div className="score">
                {score.score.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="leaderboard-footer">
        <p>
          💡 <strong>Consejo:</strong> Usa el poder especial (tecla C) para duplicar tu puntuación 
          y alcanzar oleadas más altas.
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
