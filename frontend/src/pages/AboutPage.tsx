import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-space-gradient py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-retro text-neon-cyan mb-4 animate-glow">
              
            </h1>
          </div>

          {/* Institution Info */}
          <div className="bg-space-dark bg-opacity-50 rounded-lg p-8 backdrop-blur-sm mb-8">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex-shrink-0">
                <img 
                  src="/assets/images/UIS.jpg" 
                  alt="UIS Logo" 
                  className="h-32 w-auto rounded-lg shadow-2xl border-4 border-neon-cyan"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-retro text-neon-cyan mb-4">
                  Universidad Industrial de Santander
                </h2>
                <p className="text-lg text-gray-300 mb-4">
                  Facultad de Ingenierías Fisicomecánicas
                </p>
                <p className="text-lg text-gray-300 mb-4">
                  Escuela de Ingeniería de Sistemas e Informática
                </p>
                <p className="text-base text-neon-yellow">
                  Bucaramanga, Santander - Colombia
                </p>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-space-dark bg-opacity-50 rounded-lg p-8 backdrop-blur-sm mb-8">
            <h2 className="text-3xl font-retro text-neon-cyan mb-6 text-center">
              🎮 SPACE ARCADE PROJECT
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-arcade text-neon-yellow mb-4">
                  Project Description
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Space Arcade is an innovative web-based space shooter game developed as part of 
                  the Software Engineering course at UIS. The game features advanced gameplay mechanics, 
                  progressive difficulty scaling, boss battles, and a persistent leaderboard system.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-arcade text-neon-yellow mb-4">
                  Technologies Used
                </h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• React + TypeScript</li>
                  <li>• Phaser.js Game Engine</li>
                  <li>• Tailwind CSS</li>
                  <li>• Local Storage API</li>
                  <li>• HTML5 Canvas</li>
                  <li>• Web Audio API</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-space-dark bg-opacity-50 rounded-lg p-8 backdrop-blur-sm mb-8">
            <h2 className="text-3xl font-retro text-neon-cyan mb-8 text-center">
              👥 DEVELOPMENT TEAM
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Team Member 1 */}
              <div className="bg-space-purple bg-opacity-30 rounded-lg p-6 border border-neon-cyan">
                <div className="text-center">
                  <div className="w-16 h-16 bg-neon-cyan rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-space-blue">SG</span>
                  </div>
                  <h3 className="text-xl font-arcade text-neon-cyan mb-2">
                    Sebastian Galvis
                  </h3>
                  <p className="text-neon-yellow mb-2">Casos de Prueba</p>
                  <p className="text-sm text-gray-300">
                    Testing & Quality Assurance
                  </p>
                </div>
              </div>

              {/* Team Member 2 */}
              <div className="bg-space-purple bg-opacity-30 rounded-lg p-6 border border-neon-cyan">
                <div className="text-center">
                  <div className="w-16 h-16 bg-neon-cyan rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-space-blue">DG</span>
                  </div>
                  <h3 className="text-xl font-arcade text-neon-cyan mb-2">
                    Diego Guerrero
                  </h3>
                  <p className="text-neon-yellow mb-2">UI/UX Designer</p>
                  <p className="text-sm text-gray-300">
                    User Interface & Experience
                  </p>
                </div>
              </div>

              {/* Team Member 3 */}
              <div className="bg-space-purple bg-opacity-30 rounded-lg p-6 border border-neon-cyan">
                <div className="text-center">
                  <div className="w-16 h-16 bg-neon-cyan rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-space-blue">JH</span>
                  </div>
                  <h3 className="text-xl font-arcade text-neon-cyan mb-2">
                    Jhonatan Hernandez
                  </h3>
                  <p className="text-neon-yellow mb-2">Backend Developer</p>
                  <p className="text-sm text-gray-300">
                    Data Management & Services
                  </p>
                </div>
              </div>

              {/* Team Member 4 */}
              <div className="bg-space-purple bg-opacity-30 rounded-lg p-6 border border-neon-cyan">
                <div className="text-center">
                  <div className="w-16 h-16 bg-neon-cyan rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-space-blue">OS</span>
                  </div>
                  <h3 className="text-xl font-arcade text-neon-cyan mb-2">
                    Oscar Silva
                  </h3>
                  <p className="text-neon-yellow mb-2">Game Designer</p>
                  <p className="text-sm text-gray-300">
                    Game Mechanics & Balance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-neon-cyan font-arcade">
              © 2025 Universidad Industrial de Santander - Ingeniería de Sistemas
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Developed with ❤️ by the UIS Software Engineering Team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
