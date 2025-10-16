import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private wave: number = 0;
  private restartButton?: Phaser.GameObjects.Text;
  private menuButton?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number; wave: number }) {
    this.score = data.score || 0;
    this.wave = data.wave || 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Fondo
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

    // Título Game Over
    this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff6b6b',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Puntuación final
    this.add.text(width / 2, height / 2 - 50, `Puntuación Final: ${this.score}`, {
      fontSize: '24px',
      color: '#00ff88',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Oleada alcanzada
    this.add.text(width / 2, height / 2 - 20, `Oleada Alcanzada: ${this.wave}`, {
      fontSize: '20px',
      color: '#4ecdc4',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    // Mensaje de motivación
    let message = '';
    if (this.score >= 1000) {
      message = '¡Excelente! Eres un verdadero piloto espacial!';
    } else if (this.score >= 500) {
      message = '¡Muy bien! Sigue practicando para mejorar!';
    } else if (this.score >= 100) {
      message = '¡Buen intento! La próxima vez será mejor!';
    } else {
      message = '¡No te rindas! La práctica hace al maestro!';
    }

    this.add.text(width / 2, height / 2 + 20, message, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      align: 'center'
    }).setOrigin(0.5);

    // Botón reiniciar
    this.restartButton = this.add.text(width / 2, height * 2 / 3, 'JUGAR DE NUEVO', {
      fontSize: '24px',
      color: '#00ff88',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      backgroundColor: 'rgba(0, 255, 136, 0.2)',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    // Botón menú
    this.menuButton = this.add.text(width / 2, height * 2 / 3 + 60, 'MENÚ PRINCIPAL', {
      fontSize: '20px',
      color: '#4ecdc4',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      backgroundColor: 'rgba(78, 205, 196, 0.2)',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    // Efectos de los botones
    this.restartButton.on('pointerover', () => {
      this.restartButton?.setScale(1.1);
      this.restartButton?.setTint(0x4ecdc4);
    });

    this.restartButton.on('pointerout', () => {
      this.restartButton?.setScale(1);
      this.restartButton?.clearTint();
    });

    this.restartButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    this.menuButton.on('pointerover', () => {
      this.menuButton?.setScale(1.1);
      this.menuButton?.setTint(0x00ff88);
    });

    this.menuButton.on('pointerout', () => {
      this.menuButton?.setScale(1);
      this.menuButton?.clearTint();
    });

    this.menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // Efecto de parpadeo en el título
    this.tweens.add({
      targets: this.add.text(width / 2, height / 3, 'GAME OVER', {
        fontSize: '48px',
        color: '#ff6b6b',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0.5),
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }
}
