import Phaser from 'phaser';

export class VictoryScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite;
  private victoryText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private finalScore: number = 0;
  private level: number = 1;

  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data: { score: number; level: number }): void {
    this.finalScore = data.score || 0;
    this.level = data.level || 1;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Background
    this.background = this.add.tileSprite(0, 0, width, height, 'space_bg');
    this.background.setOrigin(0, 0);
    this.background.setTint(0x00ff00);

    // Victory Text
    this.victoryText = this.add.text(width / 2, height / 4, 'VICTORY!', {
      fontSize: '64px',
      color: '#00ff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.victoryText.setOrigin(0.5, 0.5);

    // Level Text
    this.levelText = this.add.text(width / 2, height / 3, `LEVEL ${this.level} COMPLETED!`, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.levelText.setOrigin(0.5, 0.5);

    // Score Text
    this.scoreText = this.add.text(width / 2, height / 2, `SCORE: ${this.finalScore.toLocaleString()}`, {
      fontSize: '28px',
      color: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.scoreText.setOrigin(0.5, 0.5);



    // Animate victory text
    this.tweens.add({
      targets: this.victoryText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Animate level text
    this.tweens.add({
      targets: this.levelText,
      alpha: 0.7,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // Add confetti effect
    this.createConfettiEffect();

    // Play victory sound
    // Play victory sound (if available)
    if (this.sound.get('victory')) {
      this.sound.play('victory', { volume: 0.5 });
    }
  }

  private createConfettiEffect(): void {
    const confetti = this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: this.cameras.main.width },
      y: -50,
      speedY: { min: 100, max: 300 },
      speedX: { min: -100, max: 100 },
      scale: { start: 0.5, end: 0 },
      lifespan: 3000,
      quantity: 10,
      frequency: 50,
      tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]
    });
  }


}
