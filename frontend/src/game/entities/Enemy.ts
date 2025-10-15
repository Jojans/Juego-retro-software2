import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private health: number = 1;
  private maxHealth: number = 1;
  private speed: number = 100;
  private level: number = 1;
  private wave: number = 1;
  private movementPattern: string = 'straight';
  private shootInterval: number = 3000;
  private lastShot: number = 0;
  private isShootingEnabled: boolean = false;
  private movementTimer: number = 0;
  private direction: number = 1;
  private amplitude: number = 50;
  private frequency: number = 0.01;
  private startX: number = 0;
  private startY: number = 0;
  private points: number = 10;
  private isDead: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, level: number = 1, wave: number = 1) {
    super(scene, x, y, 'enemy_sheet');
    
    this.level = level;
    this.wave = wave;
    this.startX = x;
    this.startY = y;
    this.setupEnemy();
  }

  private setupEnemy(): void {
    // Add to scene
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    
    // Set display size for better visibility
    this.setDisplaySize(32, 32);
    
    // Set up physics
    this.setCollideWorldBounds(false);
    this.body!.setSize(40, 40); // Increased hitbox size for easier hitting
    
    // Set enemy stats - each enemy takes 5 hits to die
    this.maxHealth = 5; // Fixed at 5 hits
    this.health = this.maxHealth;
    
    // Progressive speed scaling by wave - much easier base, very gradual increase
    const baseSpeed = 20; // Much slower base speed for wave 1
    const waveSpeedBonus = (this.wave - 1) * 2; // +2 speed per wave (more gradual)
    const levelSpeedBonus = this.level * 1; // +1 speed per level (more gradual)
    this.speed = baseSpeed + waveSpeedBonus + levelSpeedBonus;
    
    this.points = 25; // Fixed 25 points per enemy
    
    console.log(`Enemy speed: ${this.speed} (wave ${this.wave}, level ${this.level})`);
    
    // Set up animations
    this.setupAnimations();
    
    // Enable shooting
    this.isShootingEnabled = true;
    
    // Start movement
    this.startMovement();
  }

  private setupAnimations(): void {
    // Check if the malo1 texture exists
    if (!this.scene.textures.exists('malo1')) {
      console.warn('Enemy textures not loaded yet, retrying...');
      this.scene.time.delayedCall(100, () => this.setupAnimations());
      return;
    }

    try {
      // Enemy idle animation - cycle through malo1 to malo8
      if (!this.scene.anims.exists('enemy-idle')) {
        this.scene.anims.create({
          key: 'enemy-idle',
          frames: [
            { key: 'malo1', frame: 0 },
            { key: 'malo2', frame: 0 },
            { key: 'malo3', frame: 0 },
            { key: 'malo4', frame: 0 },
            { key: 'malo5', frame: 0 },
            { key: 'malo6', frame: 0 },
            { key: 'malo7', frame: 0 },
            { key: 'malo8', frame: 0 }
          ],
          frameRate: 8,
          repeat: -1,
        });
      }

      // Enemy death animation - use malo_muerto
      if (!this.scene.anims.exists('enemy-death')) {
        this.scene.anims.create({
          key: 'enemy-death',
          frames: [{ key: 'malo_muerto', frame: 0 }],
          frameRate: 12,
          repeat: 0,
        });
      }

      // Play idle animation
      this.play('enemy-idle');
    } catch (error) {
      console.warn('Failed to create enemy animations:', error);
      this.setFrame(0);
    }
  }

  private startMovement(): void {
    // Set initial velocity based on movement pattern
    switch (this.movementPattern) {
      case 'straight':
        this.setVelocityY(this.speed);
        break;
      case 'zigzag':
        this.setVelocityY(this.speed * 0.7);
        this.setVelocityX(this.speed * 0.3 * this.direction);
        break;
      case 'spiral':
        this.setVelocityY(this.speed * 0.5);
        break;
      case 'dive':
        this.setVelocityY(this.speed * 1.2);
        break;
    }
  }

  update(): void {
    // Don't update if enemy is dead
    if (this.health <= 0) {
      return;
    }
    
    this.movementTimer += this.scene.game.loop.delta;
    
    // Check for lateral bounds and bounce
    this.checkLateralBounds();
    
    // Update movement based on pattern
    this.updateMovement();
    
    // Handle shooting
    this.handleShooting();
    
    // Check if out of bounds
    if (this.y > 650) {
      console.log('Enemy went out of bounds, destroying without points');
      // Destroy without giving points - only killed enemies give points
      this.destroy();
    }
  }

  private checkLateralBounds(): void {
    // Check left and right bounds and bounce
    const margin = 20; // Margin from screen edges
    const leftBound = margin;
    const rightBound = 800 - margin; // Assuming 800px width
    
    if (this.x <= leftBound) {
      this.x = leftBound;
      this.direction *= -1;
      // Ensure minimum velocity for bouncing
      const currentVelX = Math.abs(this.body!.velocity.x);
      const minVelX = this.speed * 0.2; // Minimum 20% of speed
      this.setVelocityX(Math.max(currentVelX, minVelX) * this.direction);
      console.log(`Enemy bounced off left wall at x=${this.x}, new direction=${this.direction}`);
    } else if (this.x >= rightBound) {
      this.x = rightBound;
      this.direction *= -1;
      // Ensure minimum velocity for bouncing
      const currentVelX = Math.abs(this.body!.velocity.x);
      const minVelX = this.speed * 0.2; // Minimum 20% of speed
      this.setVelocityX(Math.max(currentVelX, minVelX) * this.direction);
      console.log(`Enemy bounced off right wall at x=${this.x}, new direction=${this.direction}`);
    }
  }

  private updateMovement(): void {
    switch (this.movementPattern) {
      case 'zigzag':
        // Zigzag movement - let checkLateralBounds handle the bouncing
        this.setVelocityX(this.speed * 0.3 * this.direction);
        break;
        
      case 'spiral':
        // Spiral movement - ensure it respects bounds
        const spiralX = this.startX + Math.sin(this.movementTimer * this.frequency) * this.amplitude;
        const targetVelX = (spiralX - this.x) * 0.1;
        this.setVelocityX(targetVelX);
        break;
        
      case 'dive':
        // Dive down then level out
        if (this.y > 200) {
          this.setVelocityY(this.speed * 0.3);
          this.setVelocityX(this.speed * 0.2 * this.direction);
        }
        break;
        
      case 'straight':
        // Straight movement - no horizontal velocity, just vertical
        this.setVelocityX(0);
        break;
    }
  }

  private handleShooting(): void {
    if (!this.isShootingEnabled) return;
    
    // Only allow shooting when enemy is visible on screen (y > 0)
    if (this.y <= 0) return;
    
    const now = this.scene.time.now;
    if (now - this.lastShot > this.shootInterval) {
      this.shoot();
      this.lastShot = now;
    }
  }

  private shoot(): void {
    console.log('Enemy shooting at position:', this.x, this.y);
    
    // Create enemy bullet using original texture
    const bullet = this.scene.physics.add.image(this.x, this.y + 20, 'enemy-bullet');
    bullet.setDisplaySize(8, 16); // Original size
    bullet.setCollideWorldBounds(false);
    bullet.body!.onWorldBounds = true;
    bullet.body!.setSize(8, 16); // Original collision box
    bullet.setDepth(5); // Make sure it's visible above other objects
    
    // Enable physics body for collisions
    bullet.body!.immovable = false;
    bullet.body!.bounce.set(0, 0);
    
    console.log('Enemy bullet physics setup:');
    console.log('Bullet body size:', bullet.body!.width, bullet.body!.height);
    console.log('Bullet body position:', bullet.body!.x, bullet.body!.y);
    console.log('Bullet body immovable:', bullet.body!.immovable);
    
    // Add bullet to enemy bullets group FIRST
    const enemyManager = this.scene.data.get('enemyManager');
    if (enemyManager && enemyManager.enemyBullets) {
      enemyManager.enemyBullets.add(bullet);
      console.log('Bullet added to enemy bullets group');
    } else {
      console.warn('EnemyManager or enemyBullets group not found');
    }
    
    // Set velocity AFTER adding to group
    bullet.setVelocityY(200);
    
    console.log('Bullet created with velocity:', bullet.body!.velocity.y);
    console.log('Bullet position:', bullet.x, bullet.y);
    
    // Ensure bullet is active and visible
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // Audio disabled
  }

  public takeDamage(damage: number): void {
    // Don't take damage if already dead
    if (this.isDead) {
      console.log('Enemy is already dead, ignoring damage');
      return;
    }
    
    this.health -= damage;
    
    console.log(`Enemy hit! Health: ${this.health}/${this.maxHealth}`);
    
    // Flash effect with different colors based on health
    if (this.health > 3) {
      this.setTint(0xffff00); // Yellow for high health
    } else if (this.health > 1) {
      this.setTint(0xff8800); // Orange for medium health
    } else {
      this.setTint(0xff0000); // Red for low health
    }
    
    this.scene.time.delayedCall(150, () => {
      this.clearTint();
    });
    
    if (this.health <= 0) {
      this.die();
    }
  }

  private die(): void {
    console.log('Enemy dying, changing texture to malo_muerto');
    
    // Mark as dead to prevent further damage
    this.isDead = true;
    
    // Stop all movement
    this.setVelocity(0, 0);
    this.setCollideWorldBounds(false);
    
    // Change texture to dead version
    if (this.scene.textures.exists('malo_muerto')) {
      this.setTexture('malo_muerto');
      console.log('Enemy texture changed to malo_muerto');
    } else {
      console.warn('malo_muerto texture not found, using fallback');
      this.setTint(0x666666); // Gray tint as fallback
    }
    
    // Play death animation
    this.play('enemy-death');
    
    // Disable shooting
    this.isShootingEnabled = false;
    
    // Add a subtle shake effect to emphasize death
    this.scene.tweens.add({
      targets: this,
      angle: { from: 0, to: 10 },
      duration: 100,
      yoyo: true,
      repeat: 2,
      ease: 'Power2'
    });
    
    // Emit death event
    this.emit('enemy-died', this.points);
    
    // Destroy after animation
    if (this.scene && this.scene.time) {
      this.scene.time.delayedCall(1000, () => {
        this.destroy();
      });
    } else {
      // Fallback: destroy immediately if scene.time is not available
      this.destroy();
    }
  }

  public setMovementPattern(pattern: string): void {
    this.movementPattern = pattern;
    this.startMovement();
  }

  public setShootingEnabled(enabled: boolean): void {
    this.isShootingEnabled = enabled;
  }

  public setShootInterval(interval: number): void {
    this.shootInterval = interval;
  }

  public getHealth(): number {
    return this.health;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public getPoints(): number {
    return this.points;
  }

  public getLevel(): number {
    return this.level;
  }

  public isAlive(): boolean {
    return this.health > 0;
  }
}
