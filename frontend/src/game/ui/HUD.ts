import Phaser from 'phaser';

export class HUD extends Phaser.GameObjects.Container {
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private powerUpIcons: Phaser.GameObjects.Image[] = [];
  private score: number = 0;
  private level: number = 1;
  private lives: number = 3;
  private specialPowerText!: Phaser.GameObjects.Text;
  private specialPowerButton!: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.scene.add.existing(this);
    this.createHUD();
  }

  private createHUD(): void {
    const { width, height } = this.scene.cameras.main;

    // Score text
    this.scoreText = this.scene.add.text(20, 20, 'SCORE: 0', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.add(this.scoreText);

    // Wave text
    this.levelText = this.scene.add.text(width - 120, 20, 'WAVE: 1', {
      fontSize: '18px',
      color: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.add(this.levelText);

    // Lives text
    this.livesText = this.scene.add.text(width - 120, 50, 'LIVES: 3', {
      fontSize: '18px',
      color: '#00ff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.add(this.livesText);

    // Special power button (bottom right corner)
    this.specialPowerButton = this.scene.add.rectangle(width - 100, height - 50, 80, 30, 0x333333);
    this.specialPowerButton.setStrokeStyle(2, 0x00ff00);
    this.specialPowerButton.setInteractive();
    this.specialPowerButton.on('pointerdown', () => {
      // Emit event to activate special power
      this.scene.events.emit('special-power-activate');
      console.log('Special power button clicked');
    });
    this.add(this.specialPowerButton);

    // Special power text
    this.specialPowerText = this.scene.add.text(width - 100, height - 50, 'POWER\nREADY', {
      fontSize: '12px',
      color: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    });
    this.specialPowerText.setOrigin(0.5, 0.5);
    this.add(this.specialPowerText);
  }

  public updateScore(score: number): void {
    this.score = score;
    this.scoreText.setText(`SCORE: ${this.score.toLocaleString()}`);
  }


  public updateLevel(level: number): void {
    this.level = level;
    this.levelText.setText(`WAVE: ${this.level}`);
  }

  public updateLives(lives: number): void {
    console.log(`HUD: Updating lives from ${this.lives} to ${lives}`);
    this.lives = lives;
    this.livesText.setText(`LIVES: ${this.lives}`);
    console.log(`HUD: Lives text updated to: LIVES: ${this.lives}`);
  }


  public addPowerUpIcon(powerUpType: string): void {
    const icon = this.scene.add.image(20 + (this.powerUpIcons.length * 30), 80, 'powerup');
    icon.setScale(0.5);
    icon.setTint(this.getPowerUpColor(powerUpType));
    this.add(icon);
    this.powerUpIcons.push(icon);
  }

  public removePowerUpIcon(powerUpType: string): void {
    const index = this.powerUpIcons.findIndex(icon => icon.getData('type') === powerUpType);
    if (index !== -1) {
      this.powerUpIcons[index].destroy();
      this.powerUpIcons.splice(index, 1);
      
      // Reposition remaining icons
      this.powerUpIcons.forEach((icon, i) => {
        icon.setX(20 + (i * 30));
      });
    }
  }

  private getPowerUpColor(powerUpType: string): number {
    const colors: { [key: string]: number } = {
      'health': 0x00ff00,
      'speed': 0x00ffff,
      'damage': 0xff0000,
      'multiShot': 0xffff00,
      'shield': 0x8000ff
    };
    return colors[powerUpType] || 0xffffff;
  }

  public showMessage(message: string, duration: number = 2000): void {
    console.log(`HUD: Showing message "${message}" for ${duration}ms`);
    
    const messageText = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      message,
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    messageText.setOrigin(0.5, 0.5);
    messageText.setDepth(1000);

    // Simple fade out without animation
    this.scene.time.delayedCall(duration, () => {
      console.log(`HUD: Message "${message}" destroyed after ${duration}ms`);
      messageText.destroy();
    });
  }

  public showPauseMessage(): void {
    this.showMessage('GAME PAUSED\nPress ESC or P to resume', 0); // 0 means it won't auto-destroy
  }

  public hidePauseMessage(): void {
    // Find and destroy pause message
    const pauseTexts = this.scene.children.list.filter(child => 
      child instanceof Phaser.GameObjects.Text && 
      child.text.includes('GAME PAUSED')
    );
    pauseTexts.forEach(text => text.destroy());
  }

  public showCombo(combo: number, x: number, y: number): void {
    const comboText = this.scene.add.text(x, y, `${combo}x COMBO!`, {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    });
    comboText.setOrigin(0.5, 0.5);
    comboText.setDepth(1000);

    // Animate combo
    this.scene.tweens.add({
      targets: comboText,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        comboText.destroy();
      }
    });
  }

  public updateWave(wave: number): void {
    // Wave display logic can be added here
  }

  public showWaveStart(wave: number): void {
    console.log(`Wave ${wave} starting message shown`);
    
    // Create a simple text without complex animations
    const messageText = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      `WAVE ${wave} STARTING!`,
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    messageText.setOrigin(0.5, 0.5);
    messageText.setDepth(1000);

    // Destroy after 1 second
    this.scene.time.delayedCall(1000, () => {
      console.log(`Wave ${wave} starting message destroyed`);
      messageText.destroy();
    });
  }

  public showWaveComplete(): void {
    this.showMessage('WAVE COMPLETE!', 2000);
  }

  public update(): void {
    // Update any animated elements
  }

  public updateSpecialPower(isActive: boolean, cooldown: number): void {
    if (isActive) {
      this.specialPowerText.setText('POWER\nACTIVE');
      this.specialPowerText.setColor('#ffff00');
      this.specialPowerButton.setStrokeStyle(2, 0xffff00);
    } else if (cooldown > 0) {
      const seconds = Math.ceil(cooldown / 1000);
      this.specialPowerText.setText(`POWER\n${seconds}s`);
      this.specialPowerText.setColor('#ff0000');
      this.specialPowerButton.setStrokeStyle(2, 0xff0000);
    } else {
      this.specialPowerText.setText('POWER\nREADY');
      this.specialPowerText.setColor('#00ff00');
      this.specialPowerButton.setStrokeStyle(2, 0x00ff00);
    }
  }

  public destroy(): void {
    this.powerUpIcons.forEach(icon => icon.destroy());
    this.powerUpIcons = [];
    super.destroy();
  }
}
