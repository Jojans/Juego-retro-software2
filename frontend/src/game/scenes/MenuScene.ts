import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite;
  private title!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Background
    this.background = this.add.tileSprite(0, 0, width, height, 'space_bg');
    this.background.setOrigin(0, 0);

    // Title
    this.title = this.add.text(width / 2, height / 4, 'SPACE ARCADE', {
      fontSize: '48px',
      color: '#00ffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.title.setOrigin(0.5, 0.5);

    // Add glow effect
    this.title.setShadow(0, 0, '#00ffff', 2, true, true);





    // Instructions
    this.add.text(width / 2, height - 120, 'Use ARROW KEYS or WASD to move\nSPACE to shoot\nC for SPECIAL POWER (15s cooldown)\nP to pause', {
      fontSize: '16px',
      color: '#cccccc',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5, 0.5);

    // Special power description
    this.add.text(width / 2, height - 50, 'SPECIAL POWER: Double damage for 5 seconds', {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'Arial',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5, 0.5);

    // Animate title
    this.tweens.add({
      targets: this.title,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });

    // Animate background
    this.tweens.add({
      targets: this.background,
      tilePositionX: this.background.tilePositionX + 1,
      duration: 100,
      repeat: -1
    });
    
    // Play menu music
    const soundManager = this.data.get('soundManager');
    if (soundManager) {
      soundManager.playMusic('menu_music');
    }
  }




}
