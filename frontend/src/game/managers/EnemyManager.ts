import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';

export class EnemyManager extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private player: any = null;
  private currentWave: number = 1;
  private currentLevel: number = 1;
  private enemiesPerWave: number = 5;
  private enemiesSpawned: number = 0;
  private enemiesKilled: number = 0;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private waveTimer!: Phaser.Time.TimerEvent;
  private enemySpawnTimers: Phaser.Time.TimerEvent[] = [];
  private waveActive: boolean = false;
  private bossSpawned: boolean = false;
  private isPaused: boolean = false;
  private maxEnemiesOnScreen: number = 6; // Increased to accommodate progressive enemy count // Maximum enemies on screen at once

  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
    this.setupGroups();
  }

  private setupGroups(): void {
    this.enemies = this.scene.physics.add.group({
      defaultKey: 'malo1', // Use malo1 as default, animation will handle the cycling
      maxSize: 50,
    });

    this.enemyBullets = this.scene.physics.add.group({
      defaultKey: 'enemy-bullet',
      maxSize: 100,
    });

    // Collision detection for enemy bullets vs player bullets
    this.scene.physics.add.overlap(
      this.enemies,
      this.scene.data.get('playerBullets'),
      this.handleBulletHit,
      undefined,
      this
    );

    // Collision detection between enemies to make them bounce
    this.scene.physics.add.overlap(
      this.enemies,
      this.enemies,
      this.handleEnemyCollision,
      undefined,
      this
    );
  }

  public setupPlayerCollisions(): void {
    // Setup collision between enemy bullets and player
    const player = this.scene.data.get('player');
    console.log('Setting up player collisions, player:', player);
    console.log('Player type:', typeof player);
    console.log('Player has takeDamage:', player && typeof player.takeDamage === 'function');
    
    if (player && typeof player.takeDamage === 'function') {
      // Store player reference for later use
      this.player = player;
      
      // Collision setup moved to GameScene to avoid conflicts
      console.log('Player collisions will be set up by GameScene');
    } else {
      console.warn('Player not found or takeDamage method missing when setting up collisions');
    }
  }

  public startWave(wave: number, level: number): void {
    this.currentWave = wave;
    this.currentLevel = level;
    
    // Clear any existing timers first to prevent duplicate spawning
    this.clearEnemySpawnTimers();
    this.spawnTimer?.destroy();
    this.waveTimer?.destroy();
    
    // Check if this is a boss wave (every 7 waves)
    const isBossWave = wave % 7 === 0;
    
    if (isBossWave) {
      console.log(`Starting BOSS WAVE ${wave} - Boss only!`);
      this.enemiesPerWave = 1; // Only the boss
      this.bossSpawned = false;
      this.enemiesSpawned = 0;
      this.enemiesKilled = 0;
      this.waveActive = true;
      
      // Change background to boss background
      if (this.scene.data.get('changeBackgroundToBoss')) {
        this.scene.data.get('changeBackgroundToBoss')();
      }
      
      // Spawn boss immediately
      this.scene.time.delayedCall(2000, () => {
        console.log('Spawning boss after 2 seconds');
        this.spawnBoss();
      });
      
      // Set longer timeout for boss wave
      this.waveTimer = this.scene.time.delayedCall(60000, () => {
        this.endWave();
      });
    } else {
      // Regular wave
      // Progressive difficulty scaling - Wave 1: 3 enemies, Wave 2: 4 enemies, etc.
      // Skip boss waves in the count
      if (wave % 7 === 0) {
        // This is a boss wave, should not reach here
        this.enemiesPerWave = 0;
      } else {
        // Calculate enemies based on wave number, skipping boss waves
        // Slower progression: +1 enemy every 2 waves instead of every wave
        const bossWavesPassed = Math.floor((wave - 1) / 7);
        const wavesInCurrentCycle = wave - (bossWavesPassed * 7);
        this.enemiesPerWave = 3 + Math.floor((wavesInCurrentCycle - 1) / 2);
      }
      
      this.enemiesSpawned = 0;
      this.enemiesKilled = 0;
      this.waveActive = true;
      this.bossSpawned = false;

      console.log(`Starting wave ${wave}, level ${level}, enemies: ${this.enemiesPerWave}`);
      console.log(`Difficulty scaling: Wave ${wave} will have ${this.enemiesPerWave} enemies`);

      // Start spawning enemies immediately
      this.scene.time.delayedCall(1000, () => {
        console.log('Starting enemy spawn after 1 second');
        this.startEnemySpawning();
      });
      
      // Set wave timeout (increased to 60 seconds to allow more time for completion)
      this.waveTimer = this.scene.time.delayedCall(60000, () => {
        console.log(`=== WAVE ${this.currentWave} TIMEOUT REACHED ===`);
        console.log(`enemiesSpawned: ${this.enemiesSpawned}`);
        console.log(`enemiesKilled: ${this.enemiesKilled}`);
        console.log(`enemiesPerWave: ${this.enemiesPerWave}`);
        console.log(`waveActive: ${this.waveActive}`);
        console.log(`Forcing wave end due to timeout`);
        this.endWave();
      });
    }
  }

  private startEnemySpawning(): void {
    console.log(`=== STARTING ENEMY SPAWNING ===`);
    console.log(`enemiesPerWave: ${this.enemiesPerWave}`);
    console.log(`currentWave: ${this.currentWave}`);
    console.log(`waveActive: ${this.waveActive}`);
    
    // Clear any existing enemy spawn timers first
    this.clearEnemySpawnTimers();
    
    // Set enemy count per wave: 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, etc.
    // Simple progression: wave 1 = 3 enemies, wave 2 = 4 enemies, etc.
    this.enemiesPerWave = 2 + this.currentWave;
    
    console.log(`Wave ${this.currentWave}: ${this.enemiesPerWave} enemies`);
    
    // Calculate spawn delay
    const baseDelay = 1500; // Faster base spawn for wave 1
    const waveReduction = (this.currentWave - 1) * 100; // Gradual reduction
    const spawnDelay = Math.max(800, baseDelay - waveReduction);
    
    console.log(`Spawn delay: ${spawnDelay}ms for wave ${this.currentWave}`);
    console.log(`Will spawn ${this.enemiesPerWave} enemies`);
    
    // Start with initial spawn of up to maxEnemiesOnScreen
    this.spawnInitialEnemies();
    
    // Set up continuous spawning timer - much faster for all waves
    const spawnCheckDelay = this.enemiesPerWave > 3 ? 500 : 800; // 0.5s for 4+ enemies, 0.8s for 3 enemies
    this.spawnTimer = this.scene.time.addEvent({
      delay: spawnCheckDelay,
      callback: this.checkAndSpawnEnemies,
      callbackScope: this,
      loop: true
    });
  }

  private spawnInitialEnemies(): void {
    const enemiesToSpawn = Math.min(this.maxEnemiesOnScreen, this.enemiesPerWave);
    console.log(`Spawning initial ${enemiesToSpawn} enemies`);
    
    // Spawn enemies with a small delay between each for waves with more enemies
    const spawnDelay = this.enemiesPerWave > 3 ? 100 : 0; // 100ms delay for 4+ enemies (reduced from 200ms)
    
    for (let i = 0; i < enemiesToSpawn; i++) {
      if (this.waveActive && this.enemiesSpawned < this.enemiesPerWave) {
        if (spawnDelay > 0 && i > 0) {
          this.scene.time.delayedCall(i * spawnDelay, () => {
            if (this.waveActive && this.enemiesSpawned < this.enemiesPerWave) {
              this.spawnEnemy();
              this.enemiesSpawned++;
            }
          });
        } else {
          this.spawnEnemy();
          this.enemiesSpawned++;
        }
      }
    }
  }

  private checkAndSpawnEnemies(): void {
    if (!this.waveActive) return;
    
    const currentEnemiesOnScreen = this.enemies.children.size;
    
    console.log(`Checking spawn: currentOnScreen=${currentEnemiesOnScreen}, spawned=${this.enemiesSpawned}/${this.enemiesPerWave}, maxOnScreen=${this.maxEnemiesOnScreen}`);
    
    // If we haven't spawned all enemies for this wave and we have room on screen
    if (this.enemiesSpawned < this.enemiesPerWave && currentEnemiesOnScreen < this.maxEnemiesOnScreen) {
      console.log(`Spawning enemy ${this.enemiesSpawned + 1} of ${this.enemiesPerWave}`);
      this.spawnEnemy();
      this.enemiesSpawned++;
    }
  }

  private spawnEnemies(): void {
    console.log(`=== SPAWN ENEMIES DEBUG ===`);
    console.log(`enemiesSpawned: ${this.enemiesSpawned}`);
    console.log(`enemiesPerWave: ${this.enemiesPerWave}`);
    console.log(`waveActive: ${this.waveActive}`);
    console.log(`currentWave: ${this.currentWave}`);
    console.log(`enemiesKilled: ${this.enemiesKilled}`);
    
    if (this.enemiesSpawned >= this.enemiesPerWave) {
      console.log(`All enemies spawned: ${this.enemiesSpawned}/${this.enemiesPerWave}`);
      return;
    }
    
    if (!this.waveActive) {
      console.log(`Wave not active, stopping spawn`);
      return;
    }

    // Spawn regular enemy
    console.log(`Spawning enemy ${this.enemiesSpawned + 1} of ${this.enemiesPerWave}`);
    this.spawnEnemy();
    this.enemiesSpawned++;
    console.log(`After spawn: enemiesSpawned=${this.enemiesSpawned}`);

    // Schedule next spawn - gradual increase in difficulty
    const baseDelay = 1500; // Faster base spawn for wave 1
    const waveReduction = (this.currentWave - 1) * 100; // Gradual reduction
    const spawnDelay = Math.max(800, baseDelay - waveReduction);
    console.log(`Next spawn in ${spawnDelay}ms (wave ${this.currentWave} reduction: ${waveReduction}ms)`);
    this.spawnTimer = this.scene.time.delayedCall(spawnDelay, () => {
      this.spawnEnemies();
    });
  }

  private spawnEnemy(): void {
    // Get camera dimensions
    const { width, height } = this.scene.cameras.main;
    const x = Phaser.Math.Between(50, width - 50);
    const y = -50;
    
    console.log(`Spawning enemy at: ${x}, ${y}`);
    
    const enemy = new Enemy(this.scene, x, y, this.currentLevel, this.currentWave);
    this.enemies.add(enemy);

    // Set up enemy behavior
    this.setupEnemyBehavior(enemy);
  }

  private setupEnemyBehavior(enemy: Enemy): void {
    // Movement pattern
    const movementPattern = this.getMovementPattern();
    enemy.setMovementPattern(movementPattern);

    // Shooting behavior - gradual increase in difficulty
    enemy.setShootingEnabled(true);
    const baseShootInterval = 4000; // Slower base shooting for wave 1
    const waveReduction = (this.currentWave - 1) * 300; // Gradual reduction
    const minInterval = 1200; // Higher minimum interval
    const shootInterval = Math.max(minInterval, baseShootInterval - waveReduction);
    enemy.setShootInterval(shootInterval);
    
    console.log(`Enemy shoot interval: ${shootInterval}ms (wave ${this.currentWave})`);

    // Death event
    enemy.on('enemy-died', (points: number) => {
      this.onEnemyKilled(enemy, points);
    });
  }

  private getMovementPattern(): string {
    const patterns = ['straight', 'zigzag', 'spiral', 'dive'];
    return Phaser.Utils.Array.GetRandom(patterns);
  }

  private onEnemyKilled(enemy: Enemy, points: number): void {
    this.enemiesKilled++;
    console.log(`=== ENEMY KILLED DEBUG ===`);
    console.log(`enemiesKilled: ${this.enemiesKilled}`);
    console.log(`enemiesPerWave: ${this.enemiesPerWave}`);
    console.log(`enemiesSpawned: ${this.enemiesSpawned}`);
    console.log(`waveActive: ${this.waveActive}`);
    console.log(`currentWave: ${this.currentWave}`);
    console.log(`isBossWave: ${this.currentWave % 7 === 0}`);
    console.log(`enemy type: ${enemy.constructor.name}`);
    
    this.emit('enemy-killed', enemy, points);

    // Special logic for boss waves
    if (this.currentWave % 7 === 0) {
      // Boss wave: only complete when boss is dead AND no enemies remain
      const remainingEnemies = this.enemies.children.size;
      console.log(`Boss wave: remainingEnemies=${remainingEnemies}, bossSpawned=${this.bossSpawned}`);
      
      if (this.bossSpawned && remainingEnemies === 0 && this.waveActive) {
        console.log(`Boss wave ${this.currentWave} completed! Boss and all minions defeated.`);
        this.endWave();
      } else {
        console.log(`Boss wave not complete yet: remainingEnemies=${remainingEnemies}, bossSpawned=${this.bossSpawned}, waveActive=${this.waveActive}`);
      }
    } else {
      // Regular wave logic
      if (this.enemiesKilled >= this.enemiesPerWave && this.enemiesSpawned >= this.enemiesPerWave && this.waveActive) {
        console.log(`Wave ${this.currentWave} completed! All enemies spawned and killed. Ending wave...`);
        this.endWave();
      } else if (this.enemiesKilled >= this.enemiesPerWave && this.enemiesSpawned < this.enemiesPerWave) {
        console.log(`All enemies killed but not all spawned yet. Waiting for remaining enemies to spawn...`);
      } else if (this.enemiesKilled >= this.enemiesPerWave && this.waveActive) {
        // Fallback: if we've killed enough enemies but wave is still active, force completion
        console.log(`⚠️ FALLBACK: Wave ${this.currentWave} should be complete but isn't. Forcing completion...`);
        console.log(`Status: enemiesKilled=${this.enemiesKilled}, enemiesPerWave=${this.enemiesPerWave}, enemiesSpawned=${this.enemiesSpawned}`);
        this.endWave();
      }
      
      // Additional check: if no enemies remain and we've spawned all expected enemies, complete the wave
      const remainingEnemies = this.enemies.children.size;
      if (remainingEnemies === 0 && this.enemiesSpawned >= this.enemiesPerWave && this.waveActive) {
        console.log(`⚠️ NO ENEMIES REMAINING: Wave ${this.currentWave} should be complete. Forcing completion...`);
        console.log(`Status: remainingEnemies=${remainingEnemies}, enemiesSpawned=${this.enemiesSpawned}, enemiesPerWave=${this.enemiesPerWave}`);
        this.endWave();
      }
    }
  }

  public endWave(): void {
    console.log(`=== ENDING WAVE ${this.currentWave} ===`);
    console.log(`enemiesSpawned: ${this.enemiesSpawned}`);
    console.log(`enemiesKilled: ${this.enemiesKilled}`);
    console.log(`enemiesPerWave: ${this.enemiesPerWave}`);
    console.log(`enemiesRemaining: ${this.enemies.children.size}`);
    
    this.waveActive = false;
    this.spawnTimer?.destroy();
    this.waveTimer?.destroy();
    
    // Clear all enemy spawn timers to prevent duplicate spawning
    this.clearEnemySpawnTimers();

    // Only clear enemies if wave was completed by killing all enemies
    // If it's a timeout, let enemies continue to exist until killed
    if (this.enemiesKilled >= this.enemiesPerWave) {
      console.log(`Wave completed by killing all enemies, clearing remaining enemies`);
      
      // Destroy any remaining enemies (including dead boss)
      this.enemies.children.each((enemy: any) => {
        if (enemy && enemy.destroy) {
          enemy.destroy();
        }
        return true;
      });
      this.enemies.clear(true, true);
    } else {
      console.log(`Wave ended by timeout, keeping enemies alive`);
    }

    // Check if it's time for boss (every 7 waves)
    if (this.currentWave % 7 === 0 && !this.bossSpawned) {
      this.spawnBoss();
    } else {
      // Restore normal background if this was a boss wave
      if (this.currentWave % 7 === 0) {
        if (this.scene.data.get('changeBackgroundToNormal')) {
          this.scene.data.get('changeBackgroundToNormal')();
        }
      }
      this.emit('wave-complete');
    }
  }

  private clearEnemySpawnTimers(): void {
    console.log(`Clearing ${this.enemySpawnTimers.length} enemy spawn timers`);
    this.enemySpawnTimers.forEach(timer => {
      if (timer) {
        timer.destroy();
      }
    });
    this.enemySpawnTimers = [];
  }

  private spawnBoss(): void {
    this.bossSpawned = true;
    this.enemiesSpawned = 1; // Mark boss as spawned
    
    // Get camera dimensions
    const { width, height } = this.scene.cameras.main;
    
    // Create boss with wave-specific properties
    const boss = new Boss(this.scene, width / 2, 100, this.currentWave);
    this.enemies.add(boss);

    console.log(`Boss spawned for wave ${this.currentWave}`);

    boss.on('boss-defeated', () => {
      console.log(`Boss defeated in wave ${this.currentWave}`);
      this.emit('boss-defeated');
    });
    
    // Boss no longer spawns minions - boss fights only
  }


  private handleBulletHit = (bullet: any, enemy: any): void => {
    // Remove bullet
    bullet.destroy();
    
    // Damage enemy
    enemy.takeDamage(1);
    
    // Check if enemy is dead and award points
    if (enemy.health <= 0) {
      const points = enemy.getPoints ? enemy.getPoints() : 25; // Default 25 for regular enemies
      console.log(`Enemy killed, awarding ${points} points`);
      
      // Emit score update event
      this.scene.events.emit('enemy-killed', points);
      this.scene.events.emit('scoreUpdate', { score: this.scene.registry.get('score') + points, points: points });
      
      // Update score in registry
      const currentScore = this.scene.registry.get('score') || 0;
      this.scene.registry.set('score', currentScore + points);
    }
  }

  private handlePlayerHit = (bullet: any, player: any): void => {
    console.log('handlePlayerHit called with bullet:', bullet);
    console.log('handlePlayerHit called with player:', player);
    console.log('Player type:', typeof player);
    console.log('Player constructor:', player?.constructor?.name);
    console.log('Player has takeDamage:', typeof player?.takeDamage);
    console.log('Stored player reference:', this.player);
    
    // Remove bullet
    bullet.destroy();
    
    // Use stored player reference if available, otherwise use the passed player
    const targetPlayer = this.player || player;
    
    // Check if player is alive before dealing damage
    if (targetPlayer && typeof targetPlayer.takeDamage === 'function' && targetPlayer.isAlive && targetPlayer.isAlive()) {
      console.log('Player is alive, calling takeDamage');
      targetPlayer.takeDamage(1);
    } else if (targetPlayer && targetPlayer.isAlive && !targetPlayer.isAlive()) {
      console.log('Player is dead, ignoring damage');
    } else {
      console.error('Player object does not have takeDamage method or isAlive method:', targetPlayer);
    }
  }

  private handleEnemyCollision = (enemy1: any, enemy2: any): void => {
    // Let Phaser's default collision behavior handle bouncing
    // This method is intentionally empty to prevent any custom logic
    // that might cause enemies to disappear
    console.log('Enemy collision detected - using default bounce behavior');
  }

  public update(): void {
    // Don't update if paused
    if (this.isPaused) return;

    // Update all enemies - check if entries exists
    if (this.enemies && this.enemies.children && this.enemies.children.entries) {
      this.enemies.children.entries.forEach((enemy: any) => {
        if (enemy && enemy.update) {
          enemy.update();
        }
      });
    }

    // Update enemy bullets - check if entries exists
    if (this.enemyBullets && this.enemyBullets.children && this.enemyBullets.children.entries) {
      this.enemyBullets.children.entries.forEach((bullet: any) => {
        if (bullet && bullet.y > 650) {
          bullet.destroy();
        }
      });
    }

    // Check if any enemy reached the bottom - check if entries exists
    if (this.enemies && this.enemies.children && this.enemies.children.entries) {
      this.enemies.children.entries.forEach((enemy: any) => {
        if (enemy && enemy.y > 600) {
          console.log('Enemy reached bottom, destroying without points');
          this.emit('enemy-reached-bottom');
          // Destroy without giving points - only killed enemies give points
          enemy.destroy();
        }
      });
    }
    
    // Periodic check for wave completion (every 30 frames to avoid performance issues)
    if (this.scene.game.loop.frame % 30 === 0 && this.waveActive) {
      this.checkWaveCompletion();
    }
  }
  
  private checkWaveCompletion(): void {
    // Check if enemies group is still valid
    if (!this.enemies || !this.enemies.children) {
      console.warn('Enemies group is invalid, skipping wave completion check');
      return;
    }
    
    const remainingEnemies = this.enemies.children.size;
    console.log(`Periodic check: remainingEnemies=${remainingEnemies}, enemiesSpawned=${this.enemiesSpawned}, enemiesPerWave=${this.enemiesPerWave}, enemiesKilled=${this.enemiesKilled}`);
    
    // Special check for boss waves
    if (this.currentWave % 7 === 0) {
      if (this.bossSpawned && remainingEnemies === 0 && this.waveActive) {
        console.log(`⚠️ PERIODIC CHECK: Boss wave ${this.currentWave} should be complete. Forcing completion...`);
        this.endWave();
      }
    } else {
      // Regular wave check
      if (remainingEnemies === 0 && this.enemiesSpawned >= this.enemiesPerWave && this.waveActive) {
        console.log(`⚠️ PERIODIC CHECK: Wave ${this.currentWave} should be complete. Forcing completion...`);
        this.endWave();
      }
    }
  }

  public getEnemyCount(): number {
    return this.enemies.children.size;
  }

  public getDifficultyInfo(): { wave: number, enemiesPerWave: number, spawnDelay: number, shootInterval: number } {
    const baseDelay = 3000;
    const waveReduction = (this.currentWave - 1) * 200;
    const spawnDelay = Math.max(1000, baseDelay - waveReduction);
    
    const baseShootInterval = 4000;
    const waveReductionShoot = (this.currentWave - 1) * 300;
    const minInterval = 1200;
    const shootInterval = Math.max(minInterval, baseShootInterval - waveReductionShoot);
    
    return {
      wave: this.currentWave,
      enemiesPerWave: this.enemiesPerWave,
      spawnDelay: spawnDelay,
      shootInterval: shootInterval
    };
  }

  public getWave(): number {
    return this.currentWave;
  }

  public getLevel(): number {
    return this.currentLevel;
  }

  public isWaveActive(): boolean {
    return this.waveActive;
  }

  public getWaveStatus(): any {
    return {
      currentWave: this.currentWave,
      enemiesPerWave: this.enemiesPerWave,
      enemiesSpawned: this.enemiesSpawned,
      enemiesKilled: this.enemiesKilled,
      waveActive: this.waveActive,
      enemiesRemaining: this.enemies.children.size
    };
  }

  public forceWaveComplete(): void {
    console.log(`=== FORCING WAVE ${this.currentWave} COMPLETION ===`);
    console.log(`Status before force:`, this.getWaveStatus());
    this.endWave();
  }

  public pause(): void {
    this.isPaused = true;
    this.scene.physics.pause();
    if (this.spawnTimer) {
      this.spawnTimer.paused = true;
    }
    if (this.waveTimer) {
      this.waveTimer.paused = true;
    }
  }

  public resume(): void {
    this.isPaused = false;
    this.scene.physics.resume();
    if (this.spawnTimer) {
      this.spawnTimer.paused = false;
    }
    if (this.waveTimer) {
      this.waveTimer.paused = false;
    }
  }

  public getEnemies(): Phaser.Physics.Arcade.Group {
    return this.enemies;
  }

  public getEnemyBullets(): Phaser.Physics.Arcade.Group | null {
    // Check if enemyBullets is still valid
    if (!this.enemyBullets || !this.enemyBullets.scene || !this.enemyBullets.scene.physics) {
      console.warn('EnemyBullets group is invalid, returning null');
      return null;
    }
    return this.enemyBullets;
  }

  public destroy(): void {
    this.enemies.clear(true, true);
    this.enemyBullets.clear(true, true);
    this.spawnTimer?.destroy();
    this.waveTimer?.destroy();
  }
}
