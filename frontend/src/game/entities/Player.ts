import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private shootTimer!: Phaser.Time.TimerEvent;
  private isShooting: boolean = false;
  private shootDelay: number = 500; // milliseconds - slower shooting
  private speed: number = 200;
  public lives: number = 3;
  private maxLives: number = 3;
  private powerUps: Map<string, any> = new Map();
  public invulnerable: boolean = false;
  private invulnerabilityDuration: number = 1000; // 1 second
  
  // Special power system
  private specialPowerActive: boolean = false;
  private specialPowerCooldown: number = 0;
  private specialPowerDuration: number = 0;
  private specialPowerKey!: Phaser.Input.Keyboard.Key;
  private specialPowerCooldownTime: number = 15000; // 15 seconds
  private specialPowerActiveTime: number = 5000; // 5 seconds

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Use bueno image as primary texture (medusa)
    super(scene, x, y, 'bueno');
    
    console.log('=== PLAYER CONSTRUCTOR ===');
    console.log('Medusa player constructor called with:', x, y);
    console.log('Bueno texture exists:', scene.textures.exists('bueno'));
    console.log('Scene time:', scene.time.now);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set display size for better visibility
    this.setDisplaySize(32, 32);
    
    this.setupPhysics();
    this.setupAnimations();
    
    console.log('Medusa player created at position:', this.x, this.y);
    console.log('=== END PLAYER CONSTRUCTOR ===');
  }

  private setupPhysics(): void {
    this.setCollideWorldBounds(false); // Disable automatic world bounds
    this.body!.setSize(40, 40); // Bigger hitbox for better collision detection
    this.body!.setOffset(-12, -4); // Offset hitbox to center it better
    
    // Enable physics body for collisions
    this.body!.immovable = true;
    this.body!.bounce.set(0, 0);
    
    console.log('Player physics setup:');
    console.log('Body size:', this.body!.width, this.body!.height);
    console.log('Body offset:', this.body!.offset.x, this.body!.offset.y);
    console.log('Body position:', this.body!.x, this.body!.y);
    console.log('Body immovable:', this.body!.immovable);
    console.log('Player display size:', this.displayWidth, this.displayHeight);
  }

  private setupAnimations(): void {
    // Check if the bueno texture exists
    if (!this.scene.textures.exists('bueno')) {
      console.warn('Bueno texture not loaded yet, retrying...');
      this.scene.time.delayedCall(100, () => this.setupAnimations());
      return;
    }

    try {
      // Create medusa animations - simple idle animation using bueno.png
      if (!this.scene.anims.exists('player-idle')) {
        // Medusa idle animation - just use the static image
        this.scene.anims.create({
          key: 'player-idle',
          frames: [{ key: 'bueno', frame: 0 }],
          frameRate: 1,
          repeat: -1,
        });

        // Medusa thrust animation - same as idle for now
        this.scene.anims.create({
          key: 'player-thrust',
          frames: [{ key: 'bueno', frame: 0 }],
          frameRate: 1,
          repeat: -1,
        });

        // Medusa death animation - use bueno_muerto.png
        this.scene.anims.create({
          key: 'player-death',
          frames: [{ key: 'bueno_muerto', frame: 0 }],
          frameRate: 12,
          repeat: 0,
        });

        console.log('Medusa animations created');
      }

      // Play idle animation
      this.play('player-idle');
    } catch (error) {
      console.warn('Failed to create medusa animations:', error);
      // Use static medusa image as fallback
      this.setFrame(0);
    }
  }

  public setupControls(): void {
    // Keyboard controls
    this.cursors = this.scene.input.keyboard!.createCursorKeys();
    this.wasd = this.scene.input.keyboard!.addKeys('W,S,A,D');
    this.spaceKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.specialPowerKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);

    // Gamepad support
    this.scene.input.gamepad?.on('down', this.onGamepadButtonDown, this);
  }

  private onGamepadButtonDown(pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button): void {
    if (button.index === 0) { // A button
      this.shoot();
    }
  }

  update(): void {
    // Don't update if player is dead
    if (!this.isAlive()) {
      console.log('Player update: Player is dead, skipping update. Lives:', this.lives);
      return;
    }

    // FORCE VISIBILITY - Always ensure player is visible and has correct properties
    this.setAlpha(1);
    this.setVisible(true);
    
    // Debug: Log position changes during damage
    if (this.invulnerable) {
      console.log(`Player update: Position during invulnerability: ${this.x}, ${this.y}`);
    }

    // Force correct texture and size if scene is available
    if (this.scene && this.scene.sys && this.scene.textures) {
      if (this.texture.key !== 'bueno') {
        console.log('Player update: Wrong texture, fixing. Current:', this.texture.key);
        this.setTexture('bueno');
        this.setDisplaySize(32, 32);
        console.log('Player update: Texture fixed to bueno.png');
      }
    } else {
      console.log('Player update: Scene not available, but forcing visibility');
    }

    // Check if scene reference is lost
    if (!this.scene) {
      console.log('Player update: Scene reference lost! Player will be invisible.');
      return;
    }

    // Always keep player visible
    this.setAlpha(1);
    this.setVisible(true);

    this.handleMovement();
    this.handleShooting();
    this.updatePowerUps();
    this.updateSpecialPower();
  }

  private handleMovement(): void {
    // Don't handle movement if player is dead
    if (!this.isAlive()) {
      return;
    }

    let velocityX = 0;
    let velocityY = 0;

    // Keyboard movement
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -this.speed;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = this.speed;
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -this.speed;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = this.speed;
    }

    // Check boundaries and adjust velocity if needed
    if (!this.scene || !this.scene.cameras || !this.scene.cameras.main) {
      return;
    }
    
    const { width, height } = this.scene.cameras.main;
    const halfWidth = 16; // Half of 32px sprite
    const halfHeight = 16;

    // Prevent moving outside bounds
    if (this.x <= halfWidth && velocityX < 0) {
      velocityX = 0;
    }
    if (this.x >= width - halfWidth && velocityX > 0) {
      velocityX = 0;
    }
    if (this.y <= halfHeight && velocityY < 0) {
      velocityY = 0;
    }
    if (this.y >= height - halfHeight && velocityY > 0) {
      velocityY = 0;
    }

    // Apply velocity
    this.setVelocity(velocityX, velocityY);

    // Debug logging for position changes
    if (velocityX !== 0 || velocityY !== 0) {
      console.log(`Player moving: vx=${velocityX}, vy=${velocityY}, pos=(${this.x}, ${this.y})`);
    }

    // Update animation based on movement
    if (velocityX !== 0 || velocityY !== 0) {
      this.play('player-thrust', true);
    } else {
      this.play('player-idle', true);
    }
  }

  private handleShooting(): void {
    // Don't handle shooting if player is dead
    if (!this.isAlive()) {
      return;
    }

    const isShootingPressed = this.cursors.space.isDown || this.spaceKey.isDown;
    
    if (isShootingPressed && !this.isShooting) {
      console.log('Player: Shooting button pressed, calling shoot()');
      this.shoot();
    }
  }

  private shoot(): void {
    if (this.isShooting) return;

    // Check if scene and scene.time are available
    if (!this.scene || !this.scene.time) {
      return;
    }

    this.isShooting = true;
    this.shootTimer = this.scene.time.delayedCall(this.shootDelay, () => {
      this.isShooting = false;
    });

    // Play shoot sound
    const soundManager = this.scene.data.get('soundManager');
    if (soundManager) {
      soundManager.playArcadeSound('shoot');
    }

    // Get player bullets group
    let playerBullets = this.scene.data.get('playerBullets');
    console.log('Player shoot: playerBullets group:', playerBullets);
    console.log('Player shoot: playerBullets type:', playerBullets?.constructor?.name);
    
    if (!playerBullets) {
      console.warn('PlayerBullets group not found, creating new physics group');
      playerBullets = this.scene.physics.add.group({
        defaultKey: 'player-bullet',
        maxSize: 50,
        runChildUpdate: true
      });
      this.scene.data.set('playerBullets', playerBullets);
    }
    
    try {
      // Use get() to get a bullet from the group
      const bullet = playerBullets.get();
      if (bullet) {
        // Configure the bullet from the group
        bullet.setPosition(this.x, this.y - 20);
        
        // Set bullet size and color based on special power status
        if (this.specialPowerActive) {
          bullet.setDisplaySize(12, 24); // Bigger bullets when special power is active
          bullet.body!.setSize(12, 24);
          bullet.setTint(0x00ff00); // Green tint for special power bullets
        } else {
          bullet.setDisplaySize(8, 16); // Normal size bullets
          bullet.body!.setSize(8, 16);
          bullet.clearTint(); // Normal color
        }
        
        bullet.setVelocityY(-400);
        bullet.setCollideWorldBounds(false);
        bullet.body!.onWorldBounds = true;
        bullet.setDepth(5);
        
        console.log('Bullet created from group successfully');
        console.log('Bullet position:', bullet.x, bullet.y);
        console.log('Bullet velocity:', bullet.body?.velocity.y);
        console.log('Bullet body enabled:', bullet.body?.enable);
        console.log('Bullet in group:', playerBullets.children.contains(bullet));
      } else {
        console.error('Failed to get bullet from group - group might be full');
      }
    } catch (error) {
      console.error('Error creating bullet from group:', error);
    }

    // Audio disabled

    // Create muzzle flash effect
    this.createMuzzleFlash();
  }

  private createMuzzleFlash(): void {
    const flash = this.scene.add.circle(this.x, this.y - 20, 8, 0xffff00, 0.8);
    flash.setDepth(10);
    
    this.scene.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 100,
      onComplete: () => {
        flash.destroy();
      },
    });
  }

  private updatePowerUps(): void {
    // Check if scene and scene.game are available
    if (!this.scene || !this.scene.game || !this.scene.game.loop) {
      return;
    }

    // Update active power-ups
    for (const [type, powerUp] of this.powerUps) {
      if (powerUp.duration > 0) {
        powerUp.duration -= this.scene.game.loop.delta;
        if (powerUp.duration <= 0) {
          this.removePowerUp(type);
        }
      }
    }
  }

  public takeDamage(damage: number = 1): void {
    // Check if player is invulnerable
    if (this.invulnerable) {
      console.log('Player is invulnerable, ignoring damage');
      return;
    }
    
    console.log(`Player taking damage: ${damage}, lives before: ${this.lives}`);
    console.log(`Player position before damage: ${this.x}, ${this.y}`);
    console.log(`Player scene available: ${!!this.scene}, scene.sys available: ${!!this.scene?.sys}`);
    
    this.lives -= damage;
    console.log(`Player lives after damage: ${this.lives}`);
    
    // FORCE VISIBILITY - Always ensure player stays visible
    this.setAlpha(1);
    this.setVisible(true);
    
    // Force correct texture and size if scene is available
    if (this.scene && this.scene.sys && this.scene.textures) {
      this.setTexture('bueno'); // Keep normal texture
      this.setDisplaySize(32, 32);
      console.log('Player texture set to bueno.png');
    } else {
      console.log('Player scene not available for texture change, but forcing visibility');
    }
    
    // Emit the hit event with the new lives count
    console.log('Emitting player-hit event with lives:', this.lives);
    this.emit('player-hit', this.lives);

    if (this.lives <= 0) {
      console.log('=== PLAYER LIVES <= 0, CALLING die() ===');
      console.log('Current lives:', this.lives);
      this.die();
    } else {
      console.log('Player still alive, starting invulnerability period');
      console.log('Current lives:', this.lives);
      
      // Start invulnerability period (no texture change)
      this.becomeInvulnerable();
    }
  }

  private showDamageAnimation(): void {
    console.log('Showing damage animation: bueno_muerto.png for 0.5 seconds');
    
    // Store current position to maintain it
    const currentX = this.x;
    const currentY = this.y;
    console.log('Storing player position for damage animation:', currentX, currentY);
    
    // Check if scene is available before changing texture
    if (!this.scene || !this.scene.sys) {
      console.log('Player scene not available for damage animation, skipping texture change');
      return;
    }
    
    // Change to damage texture immediately
    this.setTexture('bueno_muerto');
    this.setDisplaySize(32, 32);
    this.setAlpha(1);
    this.setVisible(true);
    
    // Restore to normal texture after 0.5 seconds using setTimeout for reliability
    setTimeout(() => {
      // Ensure player still exists and has scene reference
      if (this.scene && this.scene.sys && this.scene.textures) {
        this.setTexture('bueno');
        this.setDisplaySize(32, 32);
        this.setAlpha(1);
        this.setVisible(true);
        console.log('Damage animation complete, restored to bueno.png');
      } else {
        console.log('Player scene lost during damage animation, cannot restore texture');
      }
    }, 500);
  }

  private becomeInvulnerable(): void {
    console.log('Player becoming invulnerable for 1 second');
    this.invulnerable = true;
    
    // FORCE VISIBILITY - Always ensure player is visible during invulnerability
    this.setAlpha(1);
    this.setVisible(true);
    
    // Force correct texture and size if scene is available
    if (this.scene && this.scene.sys && this.scene.textures) {
      this.setTexture('bueno'); // Keep normal texture
      this.setDisplaySize(32, 32);
      console.log('Player texture set to bueno.png during invulnerability');
    } else {
      console.log('Player scene not available for texture change, but forcing visibility');
    }
    
    // Store scene reference to maintain it
    const sceneRef = this.scene;
    
    // Use setTimeout for reliability instead of tweens
    setTimeout(() => {
      this.invulnerable = false;
      
      // FORCE VISIBILITY - Always ensure player is visible after invulnerability
      this.setAlpha(1);
      this.setVisible(true);
      
      // Force correct texture and size if scene is available
      if (this.scene && this.scene.sys && this.scene.textures) {
        this.setTexture('bueno'); // Ensure normal texture
        this.setDisplaySize(32, 32);
        console.log('Player texture restored to bueno.png after invulnerability');
      } else {
        console.log('Player scene not available for texture restoration, but forcing visibility');
      }
      
      console.log('Player invulnerability ended');
    }, this.invulnerabilityDuration);
  }

  private die(): void {
    console.log('=== PLAYER DIE() CALLED ===');
    console.log('Player dying, changing texture to bueno_muerto');
    console.log('Player lives:', this.lives);
    console.log('Player isAlive:', this.isAlive ? this.isAlive() : 'isAlive method not available');
    
    // Mark player as dead immediately
    this.lives = 0;
    console.log('Set player lives to 0');
    
    // Check if player is corrupted before attempting to use Phaser methods
    if (!this.scene || !this.scene.sys) {
      console.log('Player is corrupted, cannot perform death animation');
      console.log('Emitting player-died and player-game-over events');
      this.emit('player-died');
      this.emit('player-game-over'); // Also emit game over for corrupted players
      return;
    }
    
    // Stop all movement first
    if (typeof this.setVelocity === 'function') {
      this.setVelocity(0, 0);
    } else {
      console.log('setVelocity method not available, player may be corrupted');
    }
    
    if (typeof this.setCollideWorldBounds === 'function') {
      this.setCollideWorldBounds(false);
    } else {
      console.log('setCollideWorldBounds method not available, player may be corrupted');
    }
    
    // Stop any current animation
    if (typeof this.stop === 'function') {
      this.stop();
    } else {
      console.log('stop method not available, player may be corrupted');
    }
    
    // Change texture to dead version
    console.log('Attempting to change texture to bueno_muerto...');
    if (this.scene && this.scene.textures && this.scene.textures.exists('bueno_muerto')) {
      console.log('bueno_muerto texture exists, attempting to set it');
      if (typeof this.setTexture === 'function') {
        this.setTexture('bueno_muerto');
        console.log('=== TEXTURE CHANGED TO bueno_muerto - EMITTING GAME OVER ===');
        
        // Verify player is dead after texture change
        console.log('Verifying player state after texture change:');
        console.log('Player lives:', this.lives);
        console.log('Player isAlive:', this.isAlive());
        
        // Emit game over event immediately when texture changes to bueno_muerto
        console.log('Emitting player-game-over event...');
        this.emit('player-game-over');
        console.log('player-game-over event emitted');
        
        // Also emit the regular player-died event as backup
        console.log('Also emitting player-died event as backup...');
        this.emit('player-died');
        console.log('player-died event emitted');
      } else {
        console.log('setTexture method not available, player may be corrupted');
      }
    } else {
      console.warn('bueno_muerto texture not found or scene not available, using fallback');
      if (typeof this.setTint === 'function') {
        this.setTint(0xff0000);
      }
      // Still emit game over event even if texture change failed
      console.log('=== FALLBACK: EMITTING GAME OVER ===');
      this.emit('player-game-over');
    }
    
    // Make sure it's visible and positioned correctly
    if (typeof this.setAlpha === 'function') {
      this.setAlpha(1);
    }
    if (typeof this.setFrame === 'function') {
      this.setFrame(0);
    }
    
    // Add a subtle shake effect to emphasize death
    if (this.scene && this.scene.tweens && typeof this.scene.tweens.add === 'function') {
      this.scene.tweens.add({
        targets: this,
        angle: { from: 0, to: 5 },
        duration: 100,
        yoyo: true,
        repeat: 3,
        ease: 'Power2'
      });
    }
    
    // Emit death event after a short delay to show the death animation
    if (this.scene && this.scene.time && typeof this.scene.time.delayedCall === 'function') {
      this.scene.time.delayedCall(1000, () => {
        console.log('Emitting player-died event');
        this.emit('player-died');
      });
    } else {
      console.log('Scene time not available, emitting death event immediately');
      this.emit('player-died');
    }
  }


  public addPowerUp(type: string, duration: number, data: any = {}): void {
    // Check if scene and scene.time are available
    if (!this.scene || !this.scene.time) {
      return;
    }

    this.powerUps.set(type, {
      duration,
      data,
      startTime: this.scene.time.now,
    });

    this.applyPowerUpEffect(type, data);
  }

  private applyPowerUpEffect(type: string, data: any): void {
    switch (type) {
      case 'rapid-fire':
        this.shootDelay = Math.max(50, this.shootDelay * 0.5);
        break;
      case 'multi-shot':
        // Implement multi-shot logic
        break;
      case 'shield':
        // Shield power-up - no invulnerability, just visual effect
        break;
      case 'health':
        this.lives = Math.min(this.maxLives, this.lives + 1);
        break;
    }
  }

  private removePowerUp(type: string): void {
    this.powerUps.delete(type);
    
    // Reset effects
    switch (type) {
      case 'rapid-fire':
        this.shootDelay = 200;
        break;
    }
  }

  public getLives(): number {
    return this.lives;
  }

  public getMaxLives(): number {
    return this.maxLives;
  }

  public isAlive(): boolean {
    const alive = this.lives > 0;
    console.log(`Player.isAlive() called: lives=${this.lives}, alive=${alive}`);
    return alive;
  }

  public getPowerUps(): Map<string, any> {
    return this.powerUps;
  }

  private updateSpecialPower(): void {
    // Update cooldown
    if (this.specialPowerCooldown > 0) {
      this.specialPowerCooldown -= 16; // Assuming 60 FPS
    }

    // Update active duration
    if (this.specialPowerActive && this.specialPowerDuration > 0) {
      this.specialPowerDuration -= 16;
      if (this.specialPowerDuration <= 0) {
        this.specialPowerActive = false;
        console.log('Special power deactivated');
      }
    }

    // Check for activation
    if (this.specialPowerKey.isDown && this.specialPowerCooldown <= 0 && !this.specialPowerActive) {
      this.activateSpecialPower();
    }
  }

  private activateSpecialPower(): void {
    this.specialPowerActive = true;
    this.specialPowerDuration = this.specialPowerActiveTime;
    this.specialPowerCooldown = this.specialPowerCooldownTime;
    
    console.log('Special power activated! Double damage for 5 seconds');
    
    // Visual effect - make player glow
    this.setTint(0x00ff00); // Green tint
    
    // Remove tint when power ends
    this.scene.time.delayedCall(this.specialPowerActiveTime, () => {
      this.clearTint();
    });
  }

  public isSpecialPowerActive(): boolean {
    return this.specialPowerActive;
  }

  public getSpecialPowerCooldown(): number {
    return this.specialPowerCooldown;
  }

  public tryActivateSpecialPower(): boolean {
    if (this.specialPowerCooldown <= 0 && !this.specialPowerActive) {
      this.activateSpecialPower();
      return true;
    }
    return false;
  }

  // Debug method to show hitbox (can be called from console for testing)
  public showHitbox(): void {
    if (this.scene) {
      const graphics = this.scene.add.graphics();
      graphics.lineStyle(2, 0xff0000);
      graphics.strokeRect(
        this.x + this.body!.offset.x,
        this.y + this.body!.offset.y,
        this.body!.width,
        this.body!.height
      );
      this.scene.time.delayedCall(2000, () => graphics.destroy());
    }
  }
}
