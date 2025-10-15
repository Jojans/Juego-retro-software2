import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite;
  private gameOverText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private nameInput!: Phaser.GameObjects.Text;
  private nameInputBg!: Phaser.GameObjects.Rectangle;
  private saveButton!: Phaser.GameObjects.Text;
  private finalScore: number = 0;
  private finalLevel: number = 1;
  private finalWave: number = 1;
  private playerName: string = '';
  private isScoreSaved: boolean = false;
  private isInputActive: boolean = false;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number; level: number; wave: number }): void {
    console.log('GameOverScene: Received data:', data);
    
    // Get score from game registry if passed score is 0
    const registryScore = this.registry.get('score') || 0;
    this.finalScore = data.score && data.score > 0 ? data.score : registryScore;
    this.finalLevel = data.level || 1;
    this.finalWave = data.wave || 1;
    
    console.log('GameOverScene: Final score set to:', this.finalScore);
    console.log('GameOverScene: Registry score:', registryScore);
    console.log('GameOverScene: Passed score:', data.score);
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Background
    this.background = this.add.tileSprite(0, 0, width, height, 'space_bg');
    this.background.setOrigin(0, 0);
    this.background.setTint(0x333333);

    // Game Over Text
    this.gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.gameOverText.setOrigin(0.5, 0.5);

    // Score Text
    this.scoreText = this.add.text(width / 2, height / 2, `FINAL SCORE: ${this.finalScore.toLocaleString()}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.scoreText.setOrigin(0.5, 0.5);

    // Name Input Label
    const nameLabel = this.add.text(width / 2, height / 2 + 60, 'Enter your name (max 10 characters):', {
      fontSize: '18px',
      color: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    });
    nameLabel.setOrigin(0.5, 0.5);

    // Name Input Background
    this.nameInputBg = this.add.rectangle(width / 2, height / 2 + 90, 200, 30, 0x000033);
    this.nameInputBg.setStrokeStyle(2, 0x00ffff);

    // Name Input Text
    this.nameInput = this.add.text(width / 2, height / 2 + 90, 'Anonymous', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    });
    this.nameInput.setOrigin(0.5, 0.5);
    this.nameInput.setInteractive();
    this.nameInput.on('pointerdown', () => this.activateInput());

    // Save Score Button
    this.saveButton = this.add.text(width / 2, height / 2 + 130, 'SAVE SCORE', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      backgroundColor: '#0066cc',
      padding: { x: 15, y: 8 }
    });
    this.saveButton.setOrigin(0.5, 0.5);
    this.saveButton.setInteractive();
    this.saveButton.on('pointerdown', () => this.saveScore());
    this.saveButton.on('pointerover', () => this.saveButton.setTint(0x0099ff));
    this.saveButton.on('pointerout', () => this.saveButton.clearTint());


    // Menu Button removed as requested

    // Animate game over text
    this.tweens.add({
      targets: this.gameOverText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Animate score text
    this.tweens.add({
      targets: this.scoreText,
      alpha: 0.5,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // Add particle effect
    this.createParticleEffect();

    // Set up keyboard input
    this.setupKeyboardInput();

    // Play game over music
    const soundManager = this.data.get('soundManager');
    if (soundManager) {
      soundManager.playMusic('gameover_music');
    }
    if (this.sound.get('game_over')) {
      this.sound.play('game_over', { volume: 0.5 });
    }
  }

  private createParticleEffect(): void {
    const particles = this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: this.cameras.main.width },
      y: { min: 0, max: this.cameras.main.height },
      speed: { min: 50, max: 100 },
      scale: { start: 1, end: 0 },
      lifespan: 2000,
      quantity: 5,
      frequency: 100
    });
  }

  private setupKeyboardInput(): void {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (!this.isInputActive) return;

      if (event.key === 'Backspace') {
        this.playerName = this.playerName.slice(0, -1);
      } else if (event.key === 'Enter') {
        this.deactivateInput();
        return;
      } else if (event.key.length === 1 && this.playerName.length < 10) {
        this.playerName += event.key;
      }

      this.updateNameDisplay();
    });
  }

  private activateInput(): void {
    this.isInputActive = true;
    this.nameInputBg.setStrokeStyle(3, 0x00ff00);
    this.nameInput.setText('|');
  }

  private deactivateInput(): void {
    this.isInputActive = false;
    this.nameInputBg.setStrokeStyle(2, 0x00ffff);
    if (this.playerName === '') {
      this.playerName = 'Anonymous';
    }
    this.updateNameDisplay();
  }

  private updateNameDisplay(): void {
    if (this.isInputActive) {
      this.nameInput.setText(this.playerName + '|');
    } else {
      this.nameInput.setText(this.playerName);
    }
  }

  private saveScore(): void {
    if (this.isScoreSaved) {
      console.log('Score already saved');
      return;
    }

    // Validate and clean the name
    this.playerName = this.validateAndCleanName(this.playerName);
    
    if (this.playerName === '') {
      this.playerName = 'Anonymous';
    }

    console.log('Saving score:', { name: this.playerName, score: this.finalScore });

    // Save to leaderboard using localStorage
    try {
      const leaderboardKey = 'space_arcade_leaderboard';
      const existingData = localStorage.getItem(leaderboardKey);
      let leaderboard = existingData ? JSON.parse(existingData) : [];
      
      // Remove duplicates and keep only the best score for each username
      leaderboard = this.removeDuplicatesAndKeepBest(leaderboard);
      
      // Check if this username already exists
      const existingEntryIndex = leaderboard.findIndex((entry: any) => 
        entry.username.toLowerCase() === this.playerName.toLowerCase()
      );
      
      if (existingEntryIndex !== -1) {
        // Update existing entry if this score is better
        if (this.finalScore > leaderboard[existingEntryIndex].score) {
          leaderboard[existingEntryIndex] = {
            id: leaderboard[existingEntryIndex].id, // Keep original ID
            username: this.playerName,
            score: this.finalScore,
            level: this.finalLevel,
            wave: this.finalWave,
            createdAt: leaderboard[existingEntryIndex].createdAt, // Keep original date
            updatedAt: new Date().toISOString()
          };
          console.log('Updated existing entry with better score');
        } else {
          console.log('Score not better than existing entry, not saving');
          this.saveButton.setText('SCORE TOO LOW');
          this.saveButton.setStyle({ backgroundColor: '#aa6600' });
          return;
        }
      } else {
        // Add new entry
        const newEntry = {
          id: Date.now().toString(),
          username: this.playerName,
          score: this.finalScore,
          level: this.finalLevel,
          wave: this.finalWave,
          createdAt: new Date().toISOString()
        };
        leaderboard.push(newEntry);
      }
      
      // Sort by score and keep top 100
      leaderboard.sort((a: any, b: any) => b.score - a.score);
      leaderboard = leaderboard.slice(0, 100);
      
      localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
      
      // Update button to show success
      this.saveButton.setText('SCORE SAVED!');
      this.saveButton.setStyle({ backgroundColor: '#00aa00' });
      this.isScoreSaved = true;
      
      console.log('Score saved successfully to leaderboard');
    } catch (error) {
      console.error('Error saving score to leaderboard:', error);
      this.saveButton.setText('SAVE FAILED');
      this.saveButton.setStyle({ backgroundColor: '#aa0000' });
    }
  }

  private validateAndCleanName(name: string): string {
    // Remove special characters and symbols, keep only letters, numbers, and spaces
    let cleaned = name.replace(/[^a-zA-Z0-9\s]/g, '');
    
    // Remove extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Limit to 10 characters
    if (cleaned.length > 10) {
      cleaned = cleaned.substring(0, 10);
    }
    
    return cleaned;
  }

  private removeDuplicatesAndKeepBest(leaderboard: any[]): any[] {
    const nameMap = new Map();
    
    leaderboard.forEach(entry => {
      const key = entry.username.toLowerCase();
      if (!nameMap.has(key) || entry.score > nameMap.get(key).score) {
        nameMap.set(key, entry);
      }
    });
    
    return Array.from(nameMap.values());
  }

}
