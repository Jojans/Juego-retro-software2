import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EnemyManager } from '../managers/EnemyManager';
import { PowerUpManager } from '../managers/PowerUpManager';
import { ParticleManager } from '../managers/ParticleManager';
import { SoundManager } from '../managers/SoundManager';
import { HUD } from '../ui/HUD';
import { GameEvents } from '../events/GameEvents';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemyManager!: EnemyManager;
  private powerUpManager!: PowerUpManager;
  private particleManager!: ParticleManager;
  private soundManager!: SoundManager;
  private hud!: HUD;
  private gameEvents!: GameEvents;
  
  // Pause state
  private isPaused: boolean = false;

  // Game state
  private score: number = 0;
  private level: number = 1;
  private lives: number = 3;
  private wave: number = 1;
  private enemiesKilled: number = 0;
  private gameStartTime: number = 0;
  private isGameOver: boolean = false;
  private isVictory: boolean = false;

  // Background
  private background!: Phaser.GameObjects.TileSprite;
  private stars!: Phaser.GameObjects.Group;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.gameStartTime = Date.now();
    console.log('GameScene create() called');
    
    // Wait for textures to load before proceeding
    this.waitForTextures();
  }

  private waitForTextures(): void {
    // Check if all required textures are loaded
    const requiredTextures = ['bueno', 'bueno_muerto', 'space_bg', 'malo1', 'malo_muerto'];
    const missingTextures = requiredTextures.filter(texture => !this.textures.exists(texture));
    
    if (missingTextures.length > 0) {
      console.log('Waiting for textures to load... Missing:', missingTextures);
      // Add timeout to prevent infinite waiting
      if (this.time.now > 5000) { // 5 second timeout
        console.warn('Texture loading timeout, proceeding anyway. Still missing:', missingTextures);
        this.initializeGame();
        return;
      }
      this.time.delayedCall(100, () => this.waitForTextures());
      return;
    }
    
    console.log('All textures loaded, proceeding with game setup');
    this.initializeGame();
  }

  private initializeGame(): void {
    this.setupBackground();
    this.setupStars();
    this.setupManagers();
    this.setupPlayerBullets();
    this.setupPlayer();
    this.setupHUD();
    this.setupEvents();
    this.setupControls();
    
    // Start game music
    this.soundManager.playMusic('game_music');
    
    this.startWave();
    
    // Handle window resize
    this.scale.on('resize', this.handleResize, this);
  }

  private handleResize(gameSize: any): void {
    const { width, height } = gameSize;
    
    // Update background size
    if (this.background) {
      this.background.setSize(width, height);
      this.background.setTileScale(width / 800, height / 600);
    }
    
    // Update stars - check if stars group exists and has children
    if (this.stars && this.stars.getChildren && !this.isGameOver) {
      try {
        this.stars.getChildren().forEach((star: any) => {
          if (star && star.x > width || star.y > height) {
            star.setPosition(
              Phaser.Math.Between(0, width),
              Phaser.Math.Between(0, height)
            );
          }
        });
      } catch (error) {
        console.warn('Error updating stars:', error);
      }
    }
    
    // Player position is handled by the player itself
  }

  private setupBackground(): void {
    console.log('GameScene: Setting up background');
    
    // Get camera dimensions
    const { width, height } = this.cameras.main;
    console.log('GameScene: Camera dimensions:', width, height);
    
    // Check if texture exists
    if (!this.textures.exists('space_bg')) {
      console.error('GameScene: space_bg texture not found!');
      return;
    }
    
    // Create scrolling background
    this.background = this.add.tileSprite(0, 0, width, height, 'space_bg');
    this.background.setOrigin(0, 0);
    this.background.setScrollFactor(0);
    
    // Make background tile to fill the screen
    this.background.setTileScale(width / 800, height / 600);
    
    console.log('GameScene: Background created successfully');
  }

  private changeBackgroundToBoss(): void {
    if (this.background) {
      this.background.setTexture('boss_bg');
      console.log('Background changed to boss background');
    }
  }

  private changeBackgroundToNormal(): void {
    if (this.background) {
      this.background.setTexture('space_bg');
      console.log('Background changed to normal background');
    }
  }

  private setupStars(): void {
    this.stars = this.add.group();
    
    // Get camera dimensions
    const { width, height } = this.cameras.main;
    
    // Create animated stars
    for (let i = 0; i < 100; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        0.8
      );
      star.setScrollFactor(0);
      this.stars.add(star);
    }

    // Animate stars
    this.tweens.add({
      targets: this.stars.getChildren(),
      alpha: { from: 0.3, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private setupManagers(): void {
    console.log('GameScene: Setting up managers');
    
    this.enemyManager = new EnemyManager(this);
    this.powerUpManager = new PowerUpManager(this);
    this.particleManager = new ParticleManager(this);
    this.soundManager = new SoundManager(this);
    this.gameEvents = new GameEvents(this);
    
    console.log('GameScene: Managers created successfully');
    
    // Store managers in scene data for other entities to access
    this.data.set('enemyManager', this.enemyManager);
    this.data.set('soundManager', this.soundManager);
    
    // Store background change methods for EnemyManager to use
    this.data.set('changeBackgroundToBoss', this.changeBackgroundToBoss.bind(this));
    this.data.set('changeBackgroundToNormal', this.changeBackgroundToNormal.bind(this));
  }

  private setupPlayerBullets(): void {
    // Create player bullets group with physics configuration
    const playerBullets = this.physics.add.group({
      defaultKey: 'player-bullet',
      maxSize: 50,
      runChildUpdate: true
    });
    this.data.set('playerBullets', playerBullets);
    console.log('Player bullets group created:', playerBullets);
    console.log('Player bullets group type:', playerBullets.constructor.name);
    console.log('Player bullets group has add method:', typeof playerBullets.add);
    console.log('Player bullets group runChildUpdate:', playerBullets.runChildUpdate);
  }

  private setupCollisions(): void {
    const playerBullets = this.data.get('playerBullets');
    const enemies = this.enemyManager.getEnemies();
    
    console.log('Setting up collisions:');
    console.log('Player bullets group:', playerBullets);
    console.log('Enemies group:', enemies);
    console.log('Player bullets group type:', playerBullets?.constructor?.name);
    console.log('Enemies group type:', enemies?.constructor?.name);
    
    if (playerBullets && enemies) {
      // Setup collisions between player bullets and enemies
      this.physics.add.overlap(
        playerBullets,
        enemies,
        this.onPlayerBulletHitEnemy,
        undefined,
        this
      );
      
      // Setup collisions between enemies (for bouncing)
      this.physics.add.collider(
        enemies,
        enemies,
        this.onEnemyCollision,
        undefined,
        this
      );
      
      console.log('✅ Player bullets vs enemies collision set up successfully');
      console.log('✅ Enemy vs enemy collision set up successfully');
    } else {
      console.error('❌ Failed to set up collisions - missing groups');
    }
    
    // Note: Enemy bullets vs player collision will be set up after player is created
  }

  private onPlayerBulletHitEnemy(bullet: any, enemy: any): void {
    console.log('🎯 Player bullet hit enemy!', enemy);
    console.log('Bullet position:', bullet.x, bullet.y);
    console.log('Enemy position:', enemy.x, enemy.y);
    console.log('Enemy health before damage:', enemy.health);
    
    // Destroy the bullet first
    bullet.destroy();
    
    // Then damage the enemy
    if (enemy && typeof enemy.takeDamage === 'function') {
      // Check if special power is active for double damage
      const damage = this.player && this.player.isSpecialPowerActive() ? 2 : 1;
      enemy.takeDamage(damage);
      console.log(`Enemy damaged with ${damage} damage, new health:`, enemy.health);
    } else {
      console.warn('Enemy does not have takeDamage method or is invalid');
    }
  }

  private onEnemyCollision(enemy1: any, enemy2: any): void {
    console.log('🔄 Enemy collision detected!', enemy1, enemy2);
    
    // Make enemies bounce off each other
    if (enemy1 && enemy2 && enemy1.body && enemy2.body) {
      // Calculate bounce direction
      const dx = enemy2.x - enemy1.x;
      const dy = enemy2.y - enemy1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        // Normalize direction
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Calculate relative velocity
        const vx1 = enemy1.body.velocity.x;
        const vy1 = enemy1.body.velocity.y;
        const vx2 = enemy2.body.velocity.x;
        const vy2 = enemy2.body.velocity.y;
        
        // Calculate relative velocity in collision normal direction
        const relativeVelocity = (vx2 - vx1) * nx + (vy2 - vy1) * ny;
        
        // Don't resolve if velocities are separating
        if (relativeVelocity > 0) return;
        
        // Calculate impulse scalar
        const impulse = 2 * relativeVelocity / 2; // 2 because both objects have mass
        
        // Apply impulse
        const impulseX = impulse * nx;
        const impulseY = impulse * ny;
        
        // Apply bounce to both enemies
        enemy1.body.velocity.x += impulseX;
        enemy1.body.velocity.y += impulseY;
        enemy2.body.velocity.x -= impulseX;
        enemy2.body.velocity.y -= impulseY;
        
        console.log(`Enemies bounced: enemy1 vel(${enemy1.body.velocity.x.toFixed(1)}, ${enemy1.body.velocity.y.toFixed(1)}), enemy2 vel(${enemy2.body.velocity.x.toFixed(1)}, ${enemy2.body.velocity.y.toFixed(1)})`);
      }
    }
  }

  private onEnemyBulletHitPlayer(bullet: any, player: any): void {
    console.log('🚨🚨🚨 ENEMY BULLET HIT PLAYER 🚨🚨🚨');
    console.log('=== ENEMY BULLET HIT PLAYER ===');
    console.log('Enemy bullet hit player, causing damage');
    console.log('Bullet:', bullet);
    console.log('Bullet active:', bullet.active);
    console.log('Bullet visible:', bullet.visible);
    console.log('Bullet position:', bullet.x, bullet.y);
    
    // Check if player is invulnerable
    if (this.player && this.player.invulnerable) {
      console.log('Player is invulnerable, ignoring damage');
      return;
    }
    
    // Destroy the bullet FIRST
    console.log('Destroying bullet...');
    bullet.destroy();
    console.log('Bullet destroyed, active:', bullet.active);
    console.log('Bullet visible after destroy:', bullet.visible);
    
    // Cause damage to player using stored reference
    console.log('Attempting to cause damage to player...');
    if (this.player && typeof this.player.takeDamage === 'function') {
      console.log('Calling takeDamage on stored player reference');
      this.player.takeDamage(1);
      console.log('takeDamage called successfully');
    } else {
      console.error('Stored player reference not available or takeDamage method missing');
      console.error('Player reference:', this.player);
      console.error('Player has takeDamage:', typeof this.player?.takeDamage);
    }
    
    console.log('=== END ENEMY BULLET HIT PLAYER ===');
  }

  private updateCollisions(): void {
    // Update collisions now that player is created
    if (!this.player) {
      console.log('Player not available for collision setup');
      return;
    }
    
    console.log('Setting up enemy bullets vs player collision...');
    console.log('Player:', this.player);
    console.log('Player body:', this.player.body);
    console.log('Player body size:', this.player.body?.width, this.player.body?.height);
    
    // Check if player has physics body
    if (!this.player.body) {
      console.error('Player does not have physics body!');
      return;
    }
    
    // Get enemy bullets group safely
    const enemyBulletsGroup = this.enemyManager.getEnemyBullets();
    console.log('Enemy bullets group:', enemyBulletsGroup);
    
    // Check if enemy bullets group exists and has getChildren method
    if (!enemyBulletsGroup || typeof enemyBulletsGroup.getChildren !== 'function') {
      console.log('Enemy bullets group not available or invalid, skipping collision setup');
      return;
    }
    
    try {
      console.log('Enemy bullets count:', enemyBulletsGroup.getChildren().length);
      
      // Check if enemy bullets group has bullets
      if (enemyBulletsGroup.getChildren().length === 0) {
        console.log('No enemy bullets yet, collision will be set up when bullets are created');
      }
      
      const overlap = this.physics.add.overlap(
        enemyBulletsGroup,
        this.player,
        this.onEnemyBulletHitPlayer,
        undefined,
        this
      );
      console.log('Enemy bullets vs player collision set up');
      console.log('Overlap object:', overlap);
      console.log('Overlap active:', overlap?.active);
    } catch (error) {
      console.error('Error setting up collisions:', error);
      console.log('Skipping collision setup due to error');
    }
  }

  private debugCollisionSystem(): void {
    console.log('=== COLLISION SYSTEM DEBUG ===');
    console.log('Player exists:', !!this.player);
    console.log('Player body exists:', !!this.player?.body);
    console.log('Player position:', this.player?.x, this.player?.y);
    console.log('Player body position:', this.player?.body?.x, this.player?.body?.y);
    console.log('Player body size:', this.player?.body?.width, this.player?.body?.height);
    console.log('Player body immovable:', this.player?.body?.immovable);
    
    // Get enemy bullets group safely
    const enemyBulletsGroup = this.enemyManager.getEnemyBullets();
    if (enemyBulletsGroup && typeof enemyBulletsGroup.getChildren === 'function') {
      try {
        console.log('Enemy bullets count:', enemyBulletsGroup.getChildren().length);
        
        // Check if bullets are close to player
        const bullets = enemyBulletsGroup.getChildren();
        bullets.forEach((bullet: any, index: number) => {
          const distance = Phaser.Math.Distance.Between(this.player!.x, this.player!.y, bullet.x, bullet.y);
          console.log(`Bullet ${index}: distance to player: ${distance.toFixed(2)}`);
          if (distance < 50) {
            console.log(`Bullet ${index} is close to player! Should collide!`);
          }
        });
        
        console.log('Enemy bullets positions:', bullets.map((bullet: any) => ({ 
          x: bullet.x, 
          y: bullet.y, 
          bodyX: bullet.body?.x, 
          bodyY: bullet.body?.y,
          bodyWidth: bullet.body?.width,
          bodyHeight: bullet.body?.height
        })));
      } catch (error) {
        console.warn('Error in debugCollisionSystem accessing enemy bullets:', error);
      }
    } else {
      console.log('Enemy bullets group not available for debugging');
    }
    console.log('=== END COLLISION DEBUG ===');
  }

  private recreatePlayer(): void {
    console.log('Recreating player due to corruption...');
    
    // Store current player state if possible
    const currentLives = this.player?.lives || 3;
    const currentX = this.player?.x || 400;
    const currentY = this.player?.y || 550;
    
    console.log('Stored lives before recreation:', currentLives);
    console.log('Stored position before recreation:', currentX, currentY);
    
    // Don't recreate if player is dead (lives <= 0)
    if (currentLives <= 0) {
      console.log('Player is dead, not recreating');
      return;
    }
    
    // Don't recreate if player is invulnerable (taking damage)
    if (this.player?.invulnerable) {
      console.log('Player is invulnerable (taking damage), not recreating');
      return;
    }
    
    // Destroy corrupted player
    if (this.player) {
      this.player.destroy();
    }
    
    // Create new player at stored position instead of default
    const { width, height } = this.cameras.main;
    console.log('Creating player at stored position:', currentX, currentY);
    
    this.player = new Player(this, currentX, currentY);
    this.player.setupControls();
    this.player.lives = currentLives;
    
    // Store player reference in scene data for other systems
    this.data.set('player', this.player);
    
    // Setup player collisions after player is created
    this.enemyManager.setupPlayerCollisions();
    
    // Update collisions in the next frame to ensure everything is initialized
    this.time.delayedCall(100, () => {
      this.updateCollisions();
    });
    
    console.log('Player recreated with lives:', this.player.lives);
    console.log('Player position restored to:', this.player.x, this.player.y);
    
    // Update HUD
    if (this.hud) {
      this.hud.updateLives(this.player.lives);
    }
  }

  private setupPlayer(): void {
    // Get camera dimensions and position player at bottom center
    const { width, height } = this.cameras.main;
    console.log('Creating player at:', width / 2, height - 50);
    
    this.player = new Player(this, width / 2, height - 50);
    this.player.setupControls();
    
    // Store player reference in scene data for other systems
    this.data.set('player', this.player);
    
    // Setup player collisions after player is created
    this.enemyManager.setupPlayerCollisions();
    
    // Setup collisions between player bullets and enemies
    this.setupCollisions();
    
    // Update collisions in the next frame to ensure everything is initialized
    this.time.delayedCall(100, () => {
      this.updateCollisions();
    });
    
    console.log('Player created successfully:', this.player);
  }

  private setupHUD(): void {
    this.hud = new HUD(this, 0, 0);
    this.hud.updateScore(this.score);
    this.hud.updateLives(this.lives);
    this.hud.updateLevel(this.level);
    this.hud.updateWave(this.wave);
  }

  private setupEvents(): void {
    // Player events
    console.log('Setting up player event listeners...');
    this.player.on('player-hit', this.onPlayerHit, this);
    this.player.on('player-died', this.onPlayerDied, this);
    this.player.on('player-game-over', this.onPlayerGameOver, this);
    console.log('Player event listeners set up, including player-game-over');

    // Enemy events
    this.enemyManager.on('enemy-killed', this.onEnemyKilled, this);
    this.enemyManager.on('enemy-reached-bottom', this.onEnemyReachedBottom, this);
    this.enemyManager.on('wave-complete', this.onWaveComplete, this);
    this.enemyManager.on('boss-defeated', this.onBossDefeated, this);

    // Power-up events
    this.powerUpManager.on('powerup-collected', this.onPowerUpCollected, this);

    // Game events
    this.gameEvents.on('game-over', this.onGameOver, this);
    this.gameEvents.on('victory', this.onVictory, this);
    
    // Special power event
    this.events.on('special-power-activate', this.onSpecialPowerActivate, this);
  }

  private setupControls(): void {
    // Keyboard controls
    this.input.keyboard?.on('keydown-ESC', this.pauseGame, this);
    this.input.keyboard?.on('keydown-P', this.togglePause, this);
    
    // Disable mouse clicks to prevent errors
    this.input.mouse?.disableContextMenu();
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      console.log('Mouse click disabled during game');
      // Prevent default behavior
      return false;
    });
  }

  private startWave(): void {
    console.log(`GameScene: Starting wave ${this.wave}, level ${this.level}`);
    this.enemyManager.startWave(this.wave, this.level);
    this.hud.showWaveStart(this.wave);
    console.log(`GameScene: Wave started, enemyManager waveActive: ${this.enemyManager.isWaveActive()}`);
  }

  private onPlayerHit(lives: number): void {
    console.log(`=== GAMESCENE: onPlayerHit() CALLED ===`);
    console.log(`GameScene: Player hit, lives remaining: ${lives}`);
    console.log(`Current isGameOver state: ${this.isGameOver}`);
    
    this.lives = lives; // Use the lives count from the player
    this.hud.updateLives(this.lives);
    this.particleManager.createExplosion(this.player.x, this.player.y);
    // Audio disabled

    // Emit event to GameEngine
    this.game.events.emit('player-hit', lives);

    if (this.lives <= 0) {
      console.log('=== LIVES <= 0, CALLING onPlayerDied() ===');
      this.onPlayerDied();
    } else {
      console.log('Player still alive, continuing game');
    }
  }

  private onPlayerDied(): void {
    console.log('=== GAMESCENE: onPlayerDied() CALLED ===');
    console.log('GameScene: Player died, restarting scene');
    console.log('Current isGameOver state:', this.isGameOver);
    console.log('Current lives:', this.lives);
    
    this.isGameOver = true;
    console.log('Set isGameOver to true');
    
    // Stop all game systems
    if (this.enemyManager) {
      console.log('Pausing enemy manager');
      this.enemyManager.pause();
    }
    if (this.powerUpManager) {
      console.log('Pausing power up manager');
      this.powerUpManager.pause();
    }
    if (this.particleManager) {
      console.log('Pausing particle manager');
      this.particleManager.pause();
    }
    
    // Emit game over event to GameEngine
    console.log('Emitting game-over event to GameEngine');
    this.game.events.emit('game-over');
    
    // Emit game over event to React UI
    console.log('Emitting game-over event to React UI');
    this.gameEvents.emit('game-over');
    console.log('=== GAME OVER EVENTS EMITTED FROM onPlayerDied ===');
  }

  private onPlayerGameOver(): void {
    console.log('=== GAMESCENE: onPlayerGameOver() CALLED ===');
    console.log('GameScene: Player texture changed to bueno_muerto - GAME OVER');
    console.log('Current isGameOver state:', this.isGameOver);
    console.log('Current lives:', this.lives);
    
    this.isGameOver = true;
    console.log('Set isGameOver to true');
    
    // Stop all game systems immediately
    if (this.enemyManager) {
      console.log('Pausing enemy manager');
      this.enemyManager.pause();
    }
    if (this.powerUpManager) {
      console.log('Pausing power up manager');
      this.powerUpManager.pause();
    }
    if (this.particleManager) {
      console.log('Pausing particle manager');
      this.particleManager.pause();
    }
    
    // Emit game over event to GameEngine
    console.log('Emitting game-over event to GameEngine');
    this.game.events.emit('game-over');
    
    // Emit game over event to React UI
    console.log('Emitting game-over event to React UI');
    this.gameEvents.emit('game-over');
    console.log('=== GAME OVER EVENTS EMITTED ===');
  }

  private onEnemyKilled(enemy: any, points: number): void {
    this.score += points;
    this.enemiesKilled++;
    this.hud.updateScore(this.score);
    this.particleManager.createExplosion(enemy.x, enemy.y);
    
    // Play explosion sound
    this.soundManager.playArcadeSound('explosion');

    // Emit events to GameEngine and React
    this.game.events.emit('enemy-killed', points);
    this.game.events.emit('scoreUpdate', { score: this.score, points: points });
  }

  private onEnemyReachedBottom(): void {
    console.log('Enemy reached bottom, causing damage to player');
    console.log('Player exists:', !!this.player);
    console.log('Player has takeDamage:', typeof this.player?.takeDamage);
    console.log('Player scene:', this.player?.scene);
    console.log('Player lives before:', this.player?.lives);
    
    // Use the same damage system as bullets
    if (this.player && typeof this.player.takeDamage === 'function') {
      console.log('Calling takeDamage for enemy reaching bottom');
      this.player.takeDamage(1);
      console.log('Player lives after:', this.player?.lives);
      
      // Ensure HUD is updated immediately
      this.lives = this.player.lives;
      this.hud.updateLives(this.lives);
      console.log('HUD updated with lives:', this.lives);
      
      // Emit event to GameEngine and React
      this.game.events.emit('player-hit', this.lives);
      this.game.events.emit('livesUpdate', { lives: this.lives });
      console.log('Events emitted for enemy reaching bottom');
    } else {
      console.error('Player not available for damage from enemy reaching bottom');
    }
  }

  private onWaveComplete(): void {
    this.wave++;
    this.level++;
    this.hud.updateWave(this.wave);
    this.hud.updateLevel(this.level);
    this.hud.showWaveComplete();
    
    // Emit events to React
    this.game.events.emit('waveUpdate', this.wave);
    this.game.events.emit('levelUpdate', this.level);
    
    // Brief pause before next wave
    this.time.delayedCall(2000, () => {
      this.startWave();
    });
  }

  private onBossDefeated(bonusPoints: number = 100): void {
    console.log('Boss defeated! Adding bonus points:', bonusPoints);
    
    // Add bonus points for defeating the boss
    this.score += bonusPoints;
    this.hud.updateScore(this.score);
    
    // Don't force end the wave - let the normal wave completion logic handle it
    // The boss death event will trigger the normal enemy killed logic
    // which should complete the wave naturally
  }

  private onPowerUpCollected(powerUp: any): void {
    const type = powerUp.getData('type');
    const value = powerUp.getData('value');
    this.powerUpManager.applyPowerUp(type, value, this.player);
    // Audio disabled
  }

  private onSpecialPowerActivate(): void {
    if (this.player) {
      const activated = this.player.tryActivateSpecialPower();
      if (activated) {
        console.log('Special power activated via button click');
      } else {
        console.log('Special power not available (on cooldown or already active)');
      }
    }
  }

  private onGameOver(): void {
    console.log('GameScene: onGameOver called, current score:', this.score);
    
    // Play game over sound
    this.soundManager.playArcadeSound('gameover');
    
    this.scene.pause();
    this.scene.start('GameOverScene', {
      score: this.score,
      level: this.level,
      enemiesKilled: this.enemiesKilled,
      timePlayed: Date.now() - this.gameStartTime,
      wave: this.wave, // Pass current wave
    });
  }

  private onVictory(): void {
    // Play victory sound
    this.soundManager.playArcadeSound('victory');
    
    this.scene.pause();
    this.scene.start('VictoryScene', {
      score: this.score,
      level: this.level,
      enemiesKilled: this.enemiesKilled,
      timePlayed: Date.now() - this.gameStartTime,
    });
  }

  private pauseGame(): void {
    console.log('Pause key pressed, current state:', this.isPaused);
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      console.log('Game paused');
      this.hud.showPauseMessage();
      // Pause all managers
      this.enemyManager.pause();
      this.powerUpManager.pause();
      this.particleManager.pause();
    } else {
      console.log('Game resumed');
      this.hud.hidePauseMessage();
      // Resume all managers
      this.enemyManager.resume();
      this.powerUpManager.resume();
      this.particleManager.resume();
    }
  }

  private togglePause(): void {
    this.pauseGame();
  }

  update(): void {
    // Check if time system is available
    if (!this.time) {
      console.warn('GameScene.update: Time system not available yet');
      return;
    }

    // Always log that update is being called
    if (Math.floor(this.time.now / 1000) !== Math.floor((this.time.now - 16) / 1000)) {
      console.log(`GameScene update called at ${this.time.now}, paused: ${this.isPaused}, gameOver: ${this.isGameOver}, victory: ${this.isVictory}`);
    }
    
    // Stop all updates if game is over or paused
    if (this.isPaused || this.isGameOver || this.isVictory) {
      console.log('GameScene: Stopping updates due to game state');
      return;
    }
    
    // Additional check: if player is dead, trigger game over immediately
    if (this.player && this.player.isAlive && !this.player.isAlive()) {
      console.log('=== GAMESCENE: Player detected as dead in update, triggering game over ===');
      this.onPlayerDied();
      return;
    }

    // Check if game is fully initialized before updating
    if (!this.enemyManager || !this.powerUpManager || !this.particleManager) {
      console.log('Game not fully initialized yet, skipping update');
      return;
    }

    // Debug player state
    console.log('GameScene update: Player state check');
    console.log('Player exists:', !!this.player);
    console.log('Player scene:', this.player?.scene);
    console.log('Player visible:', this.player?.visible);
    console.log('Player has isAlive:', typeof this.player?.isAlive === 'function');

    // FORCE PLAYER VISIBILITY - Always ensure player is visible
    if (this.player) {
      // Force visibility regardless of state
      this.player.setAlpha(1);
      this.player.setVisible(true);
      
      // Always try to update player, even if corrupted
      if (typeof this.player.update === 'function') {
        this.player.update();
      }
      
      // Only recreate if player is completely broken and not invulnerable
      if ((typeof this.player.isAlive !== 'function' || !this.player.scene) && !this.player.invulnerable) {
        console.log('Player is corrupted and not invulnerable, attempting to recreate...');
        console.log('Player type:', typeof this.player);
        console.log('Player constructor:', this.player?.constructor?.name);
        console.log('Player scene:', this.player?.scene);
        console.log('Player visible:', this.player?.visible);
        console.log('Player alpha:', this.player?.alpha);
        console.log('Player has update method:', typeof this.player?.update === 'function');
        console.log('Player has isAlive method:', typeof this.player?.isAlive === 'function');
        console.log('Player invulnerable:', this.player?.invulnerable);
        this.recreatePlayer();
      } else if (this.player.invulnerable) {
        console.log('Player is invulnerable (taking damage), skipping recreation and forcing visibility');
      }
    } else {
      console.log('Player reference is null, attempting to recreate player...');
      this.recreatePlayer();
    }

    // Update managers
    this.enemyManager.update();
    this.powerUpManager.update();
    this.particleManager.update();
    
    // Update player bullets
    this.updatePlayerBullets();
    
    // Update HUD with special power status
    if (this.player && this.hud) {
      this.hud.updateSpecialPower(
        this.player.isSpecialPowerActive(),
        this.player.getSpecialPowerCooldown()
      );
    }
    
    // Debug collision system periodically
    if (Math.floor(this.time.now / 5000) !== Math.floor((this.time.now - 16) / 5000)) {
      this.debugCollisionSystem();
    }
    
    // Debug collision system more frequently when bullets are present
    const enemyBulletsGroup = this.enemyManager.getEnemyBullets();
    if (enemyBulletsGroup && typeof enemyBulletsGroup.getChildren === 'function') {
      try {
        const bullets = enemyBulletsGroup.getChildren();
        if (bullets && bullets.length > 0) {
          if (Math.floor(this.time.now / 1000) !== Math.floor((this.time.now - 16) / 1000)) {
            this.debugCollisionSystem();
          }
        }
      } catch (error) {
        console.warn('Error accessing enemy bullets:', error);
      }
    }

    // Background scroll disabled to prevent color distortion
    // if (this.background) {
    //   this.background.tilePositionY -= 1;
    // }
  }

  private updatePlayerBullets(): void {
    const playerBullets = this.data.get('playerBullets');
    if (playerBullets && playerBullets.children) {
      const bullets = playerBullets.children.entries;
      if (bullets.length > 0) {
        // Only log every 60 frames to avoid spam
        if (this.time.now % 1000 < 16) {
          console.log(`Updating ${bullets.length} player bullets`);
        }
        bullets.forEach((bullet: any, index: number) => {
          if (bullet && bullet.body) {
            // Only log first bullet position occasionally
            if (index === 0 && this.time.now % 1000 < 16) {
              console.log(`Bullet ${index}: pos(${bullet.x.toFixed(1)}, ${bullet.y.toFixed(1)}), vel(${bullet.body.velocity.y.toFixed(1)})`);
            }
            
            // Remove bullets that go off screen
            if (bullet.y < -50) {
              console.log(`Bullet ${index} destroyed (off screen)`);
              bullet.destroy();
            }
          }
        });
      }
    }
  }

  public getScore(): number {
    return this.score;
  }

  public getLevel(): number {
    return this.level;
  }

  public getLives(): number {
    return this.lives;
  }

  public getWave(): number {
    return this.wave;
  }

  public getEnemiesKilled(): number {
    return this.enemiesKilled;
  }

  public getTimePlayed(): number {
    return Date.now() - this.gameStartTime;
  }
}
