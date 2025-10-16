import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  private startButton?: Phaser.GameObjects.Text;
  private title?: Phaser.GameObjects.Text;
  private instructions?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Fondo
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

    // Título
    this.title = this.add.text(width / 2, height / 3, 'SPACE ARCADE', {
      fontSize: '48px',
      color: '#00ff88',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Instrucciones
    this.instructions = this.add.text(width / 2, height / 2, 
      'Usa las flechas para moverte\nESPACIO para disparar\nC para poder especial\nP para pausar', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      align: 'center'
    }).setOrigin(0.5);

    // Botón de inicio
    this.startButton = this.add.text(width / 2, height * 2 / 3, 'INICIAR JUEGO', {
      fontSize: '24px',
      color: '#00ff88',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      backgroundColor: 'rgba(0, 255, 136, 0.2)',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    // Efectos del botón
    this.startButton.on('pointerover', () => {
      this.startButton?.setScale(1.1);
      this.startButton?.setTint(0x4ecdc4);
    });

    this.startButton.on('pointerout', () => {
      this.startButton?.setScale(1);
      this.startButton?.clearTint();
    });

    this.startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Efecto de parpadeo en el título
    this.tweens.add({
      targets: this.title,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Efecto de parpadeo en el botón
    this.tweens.add({
      targets: this.startButton,
      alpha: 0.7,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });
  }
}
