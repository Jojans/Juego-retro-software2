/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-blue': '#0a0e27',
        'neon-cyan': '#00ffff',
        'neon-pink': '#ff00ff',
        'neon-green': '#00ff00',
        'neon-yellow': '#ffff00',
        'space-purple': '#1a0b2e',
        'space-dark': '#16213e',
      },
      fontFamily: {
        'arcade': ['Orbitron', 'monospace'],
        'retro': ['Press Start 2P', 'monospace'],
      },
      animation: {
        'pulse-neon': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff' },
          '100%': { boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(135deg, #0a0e27 0%, #1a0b2e 50%, #16213e 100%)',
        'neon-gradient': 'linear-gradient(45deg, #00ffff, #ff00ff, #00ff00)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
