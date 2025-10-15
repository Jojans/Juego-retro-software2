import Phaser from 'phaser';

export class LoadingScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;
  private assetText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LoadingScene' });
  }

  preload(): void {
    // Create progress bar
    this.createProgressBar();

    // Load game assets
    this.loadAssets();
  }

  create(): void {
    // Start the game scene after loading
    this.scene.start('GameScene');
  }

  private createProgressBar(): void {
    const { width, height } = this.cameras.main;

    // Progress box
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222);
    this.progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

    // Progress bar
    this.progressBar = this.add.graphics();

    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.loadingText.setOrigin(0.5, 0.5);

    // Percent text
    this.percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.percentText.setOrigin(0.5, 0.5);

    // Asset text
    this.assetText = this.add.text(width / 2, height / 2 + 50, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.assetText.setOrigin(0.5, 0.5);

    // Update progress bar
    this.load.on('progress', (value: number) => {
      this.percentText.setText(Math.round(value * 100) + '%');
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00ff00);
      this.progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
    });

    // Update asset text
    this.load.on('fileprogress', (file: any) => {
      this.assetText.setText('Loading asset: ' + file.key);
    });

    // Complete loading
    this.load.on('complete', () => {
      this.assetText.setText('Loading complete!');
    });
  }

  private loadAssets(): void {
    // Load real game assets
    this.loadGameAssets();
    
    // Load audio (optional - will create silent placeholders if files don't exist)
    this.loadAudioAssets();
  }

  private loadGameAssets(): void {
    // Load background images
    this.load.image('space_bg', '/assets/images/fondovertical.png');
    this.load.image('boss_bg', '/assets/images/fondovertical_jefe.png');
    
    // Load player sprites
    this.load.image('bueno', '/assets/images/bueno.png'); // Medusa player
    this.load.image('bueno_muerto', '/assets/images/bueno_muerto.png'); // Medusa dead
    this.load.image('player', '/assets/images/bueno.png'); // Keep for compatibility
    this.load.image('player_dead', '/assets/images/bueno_muerto.png');
    this.load.image('player_all', '/assets/images/bueno_todos.png');
    
    // Load enemy sprites
    this.load.image('malo1', '/assets/images/malo1.png');
    this.load.image('malo2', '/assets/images/malo2.png');
    this.load.image('malo3', '/assets/images/malo3.png');
    this.load.image('malo4', '/assets/images/malo4.png');
    this.load.image('malo5', '/assets/images/malo5.png');
    this.load.image('malo6', '/assets/images/malo6.png');
    this.load.image('malo7', '/assets/images/malo7.png');
    this.load.image('malo8', '/assets/images/malo8.png');
    this.load.image('malo_muerto', '/assets/images/malo_muerto.png');
    this.load.image('enemy_all', '/assets/images/malo_todos.png');
    
    // Load boss sprites
    this.load.image('boss1', '/assets/images/jefe1.png');
    this.load.image('boss2', '/assets/images/jefe2.png');
    this.load.image('boss3', '/assets/images/jefe3.png');
    this.load.image('boss4', '/assets/images/jefe4.png');
    this.load.image('boss5', '/assets/images/jefe5.png');
    this.load.image('boss6', '/assets/images/jefe6.png');
    this.load.image('boss7', '/assets/images/jefe7.png');
    this.load.image('boss8', '/assets/images/jefe8.png');
    this.load.image('boss_dead', '/assets/images/jefe_muerto.png');
    this.load.image('boss_all', '/assets/images/jefe_todos.png');
    
    // Load bullet sprites
    this.load.image('player-bullet', '/assets/images/disparo_bueno.png');
    this.load.image('enemy-bullet', '/assets/images/disparo_malo.png');
    
    // Load powerup and other sprites
    this.load.image('powerup', '/assets/images/medalla.png');
    this.load.image('particle', '/assets/images/space.gif');
    
    // Create spritesheets from individual images
    this.createSpritesheets();
  }

  private createSpritesheets(): void {
    // Create player spritesheet (idle and thrust animations)
    this.load.spritesheet('player_sheet', '/assets/images/bueno_todos.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    // Also load single medusa image for fallback
    this.load.image('medusa', '/assets/images/bueno.png');

    // Create enemy spritesheet
    this.load.spritesheet('enemy_sheet', '/assets/images/malo_todos.png', {
      frameWidth: 32,
      frameHeight: 32
    });

    // Create boss spritesheet
    this.load.spritesheet('boss_sheet', '/assets/images/jefe_todos.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    // Create explosion spritesheet (using enemy death as explosion)
    this.load.spritesheet('explosion_sheet', '/assets/images/malo_muerto.png', {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  private loadAudioAssets(): void {
    // Skip audio loading for now to avoid 500 errors
    console.log('Skipping audio loading to avoid 500 errors');
  }

}
